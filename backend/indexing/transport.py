"""Direct HTTP I/O with a monotonic budget on every socket operation.

Use httpcore's public network-backend interface so header parsing and body
streaming share the deadline. No background request threads survive a timeout.
"""
import json
import os
import socket
import ssl
import time

import httpcore

from .errors import IndexingError


def budget(deadline, timeout=None):
    left = deadline - time.monotonic()
    if left <= 0: raise IndexingError('deadline', 'Service request deadline exceeded')
    return min(left, timeout) if timeout is not None else left


class DeadlineStream(httpcore.NetworkStream):
    def __init__(self, inner, deadline):
        self.inner = inner
        self.deadline = deadline

    def read(self, max_bytes, timeout=None):
        return self.inner.read(max_bytes, budget(self.deadline, timeout))

    def write(self, buffer, timeout=None):
        sock = self.inner.get_extra_info('socket')
        view = memoryview(buffer)
        try:
            while view:
                sock.settimeout(budget(self.deadline, timeout))
                count = sock.send(view)
                if not count: raise httpcore.WriteError('Service connection closed')
                view = view[count:]
        except socket.timeout as error: raise httpcore.WriteTimeout('Service write timed out') from error
        except OSError as error: raise httpcore.WriteError('Service write failed') from error

    def start_tls(self, ssl_context, server_hostname=None, timeout=None):
        return DeadlineStream(self.inner.start_tls(ssl_context, server_hostname, budget(self.deadline, timeout)), self.deadline)

    def get_extra_info(self, info):
        return self.inner.get_extra_info(info)

    def close(self):
        self.inner.close()


class DeadlineBackend(httpcore.SyncBackend):
    def __init__(self, deadline):
        self.deadline = deadline

    def connect_tcp(self, host, port, timeout=None, local_address=None, socket_options=None):
        stream = super().connect_tcp(host, port, budget(self.deadline, timeout), local_address, socket_options)
        try:
            budget(self.deadline)
            return DeadlineStream(stream, self.deadline)
        except Exception:
            stream.close()
            raise


class HTTPFailure(Exception):
    def __init__(self, status_code):
        self.status_code = status_code
        super().__init__('Service HTTP request failed')


def request_json(method, url, data, headers, settings, deadline, max_bytes):
    context = ssl.create_default_context(cafile=os.environ.get('REQUESTS_CA_BUNDLE') or None)
    timeout = {'connect': settings.connect_timeout, 'read': settings.request_timeout,
               'write': settings.request_timeout, 'pool': settings.connect_timeout}
    encoded = json.dumps(data, allow_nan=False).encode('utf-8') if data is not None else None
    headers = {**headers, 'Content-Type': 'application/json'}
    # Explicit service endpoints are direct; ambient proxy variables cannot route
    # private source documents or credentials through an unrelated HTTP proxy.
    with httpcore.ConnectionPool(ssl_context=context, network_backend=DeadlineBackend(deadline), retries=0) as pool:
        with pool.stream(method, url, headers=headers, content=encoded, extensions={'timeout': timeout}) as response:
            if not 200 <= response.status < 300: raise HTTPFailure(response.status)
            raw = bytearray()
            for part in response.iter_stream():
                budget(deadline)
                raw.extend(part)
                if len(raw) > max_bytes: raise IndexingError('response_limit', 'Service response exceeds the size limit')
            budget(deadline)
            try: return json.loads(raw) if raw else None
            except ValueError as error: raise IndexingError('service_protocol', 'Malformed service response') from error
