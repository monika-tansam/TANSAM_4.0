"""Bounded transport for the pinned Chroma v2 HTTP protocol.

The 1.5.9 SDK sets timeout=None, including during client construction.
Keep this adapter small and exercise it against the matching real server.
"""
import json
import time
from contextvars import ContextVar
from urllib.parse import quote

import requests

from .embedding import remaining, retry
from .errors import IndexingError


class HTTPChromaClient:
    def __init__(self, settings):
        self.settings = settings
        self.base = settings.chroma_url.rstrip('/') + '/api/v2'
        self.collections = '/tenants/default_tenant/databases/default_database/collections'
        self.deadline = ContextVar('chroma_deadline', default=None)

    def call(self, method, path, data=None, deadline=None, retryable=True):
        bounds = [time.monotonic() + self.settings.request_timeout, deadline, self.deadline.get()]
        deadline = min(value for value in bounds if value is not None)
        def perform():
            left = remaining(deadline)
            headers = {'Authorization': 'Bearer ' + self.settings.chroma_token} if self.settings.chroma_token else {}
            # A separate session per call avoids sharing mutable pools across Flask threads.
            with requests.Session() as session, session.request(method, self.base + path, json=data, headers=headers,
                    timeout=(min(self.settings.connect_timeout, left), min(self.settings.request_timeout, left)),
                    allow_redirects=False, stream=True) as response:
                if not 200 <= response.status_code < 300:
                    response.raise_for_status()
                    raise IndexingError('vector_protocol', 'Unexpected vector service redirect')
                raw = bytearray()
                for part in response.iter_content(65536):
                    remaining(deadline)
                    raw.extend(part)
                    if len(raw) > 64 * 1024 * 1024:
                        raise IndexingError('vector_protocol', 'Vector response exceeds the size limit')
                try: return json.loads(raw) if raw else None
                except ValueError as error: raise IndexingError('vector_protocol', 'Malformed vector service response') from error
        try: return retry(perform, self.settings, deadline) if retryable else perform()
        except IndexingError: raise
        except Exception as error: raise IndexingError('vector_unavailable', 'Vector service request failed') from error

    def get_version(self):
        return self.call('GET', '/version')

    def get_max_batch_size(self):
        result = self.call('GET', '/pre-flight-checks')['max_batch_size']
        if isinstance(result, bool) or not isinstance(result, int) or result <= 0:
            raise IndexingError('vector_protocol', 'Invalid vector batch limit')
        return result

    def create_collection(self, name, embedding_function=None, metadata=None):
        # Creation is intentionally never retried: an ambiguous acknowledgement
        # leaves an abandoned staging collection, rather than adopting an existing one.
        self.call('POST', self.collections, {'name': name, 'metadata': metadata, 'get_or_create': False}, retryable=False)

    def get_collection(self, name, embedding_function=None):
        result = self.call('GET', self.collections + '/' + quote(name, safe=''))
        return HTTPCollection(self, result['id'])


class HTTPCollection:
    def __init__(self, client, identifier):
        self.client = client
        self.path = client.collections + '/' + quote(identifier, safe='')

    def upsert(self, **data):
        return self.client.call('POST', self.path + '/upsert', data)

    def count(self):
        return self.client.call('GET', self.path + '/count')

    def get(self, **data):
        return self.client.call('POST', self.path + '/get', data)

    def query(self, **data):
        return self.client.call('POST', self.path + '/query', data)
