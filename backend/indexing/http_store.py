"""Bounded transport for the pinned Chroma v2 HTTP protocol.

The 1.5.9 SDK sets timeout=None, including during client construction.
Keep this adapter small and exercise it against the matching real server.
"""
import time
from contextvars import ContextVar
from urllib.parse import quote

from .embedding import retry
from .errors import IndexingError
from .transport import request_json


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
            headers = {'Authorization': 'Bearer ' + self.settings.chroma_token} if self.settings.chroma_token else {}
            return request_json(method, self.base + path, data, headers, self.settings, deadline, 64 * 1024 * 1024)
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
