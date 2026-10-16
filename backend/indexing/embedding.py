"""Bounded embedding requests with an explicit, checked model profile."""
import math
import random
import time
import requests
import httpx

from .errors import IndexingError


def remaining(deadline):
    value = deadline - time.monotonic() if deadline is not None else float('inf')
    if value <= 0: raise IndexingError('deadline', 'Indexing deadline exceeded')
    return value


def transient(error):
    response = getattr(error, 'response', None)
    status = getattr(response, 'status_code', getattr(error, 'status_code', None))
    return isinstance(error, (requests.ConnectionError, requests.Timeout, httpx.TransportError, ConnectionError, TimeoutError)) or status in (429, 500, 502, 503, 504)


def retry(operation, settings, deadline=None):
    for attempt in range(settings.attempts):
        remaining(deadline)
        try: return operation()
        except Exception as error:
            if not transient(error) or attempt + 1 == settings.attempts: raise
            pause = min(0.2 * 2**attempt + random.uniform(0, 0.1), remaining(deadline))
            time.sleep(pause)


def validate_vectors(vectors, count, dimension):
    if not isinstance(vectors, list) or len(vectors) != count:
        raise IndexingError('embedding_shape', 'Embedding response count is invalid')
    for vector in vectors:
        if not isinstance(vector, list) or len(vector) != dimension or any(isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value) for value in vector):
            raise IndexingError('embedding_vector', 'Embedding vector is invalid')
        norm = math.hypot(*vector)
        if not math.isfinite(norm) or norm == 0: raise IndexingError('embedding_vector', 'Embedding vector has invalid norm')
    return vectors


class OllamaEmbeddings:
    def __init__(self, settings):
        self.settings = settings
        self.session = requests.Session()
        if settings.ollama_token:
            self.session.headers['Authorization'] = 'Bearer ' + settings.ollama_token

    def _request(self, method, path, data=None, deadline=None):
        def perform():
            left = remaining(deadline)
            with self.session.request(method, self.settings.ollama_url + path, json=data,
                                      timeout=(min(self.settings.connect_timeout, left), min(self.settings.request_timeout, left)),
                                      allow_redirects=False, stream=True) as response:
                if not 200 <= response.status_code < 300:
                    response.raise_for_status()
                    raise IndexingError('embedding_protocol', 'Unexpected embedding service redirect')
                raw = bytearray()
                for part in response.iter_content(65536):
                    remaining(deadline)
                    raw.extend(part)
                    if len(raw) > 16 * 1024 * 1024: raise IndexingError('embedding_protocol', 'Embedding response exceeds size limit')
                import json
                try: return json.loads(raw)
                except (ValueError, TypeError) as error: raise IndexingError('embedding_protocol', 'Malformed embedding response') from error
        try: return retry(perform, self.settings, deadline)
        except IndexingError: raise
        except Exception as error: raise IndexingError('embedding_unavailable', 'Embedding service request failed') from error

    def _identity(self, deadline=None, model_name=None):
        data = self._request('GET', '/api/tags', deadline=deadline)
        try:
            target = model_name or self.settings.model
            name = target if ':' in target else target + ':latest'
            model = next(item for item in data['models'] if item.get('name') == name)
            model_digest = model['digest']
            if not isinstance(model_digest, str) or len(model_digest) < 32: raise ValueError('digest')
            return name, model_digest
        except (KeyError, TypeError, ValueError, StopIteration) as error:
            raise IndexingError('model_identity', 'Configured embedding model identity is unavailable') from error

    def profile(self, deadline=None):
        name, model_digest = self._identity(deadline)
        data = self._request('POST', '/api/show', {'model': name}, deadline)
        try:
            dimensions = [value for key, value in data['model_info'].items() if key.endswith('.embedding_length')]
            dimension = dimensions[0]
            if isinstance(dimension, bool) or not isinstance(dimension, int) or not 1 <= dimension <= 16384: raise ValueError('dimension')
        except (KeyError, TypeError, ValueError, IndexError) as error:
            raise IndexingError('model_profile', 'Embedding model dimension is unavailable') from error
        return {'model': name, 'digest': model_digest, 'dimension': dimension, 'document_prefix': self.settings.document_prefix,
                'query_prefix': self.settings.query_prefix, 'normalization': 'l2', 'distance': 'cosine', 'api': '/api/embed'}

    def check(self, profile, deadline=None):
        name, model_digest = self._identity(deadline, profile['model'])
        if name != profile['model'] or model_digest != profile['digest']:
            raise IndexingError('model_drift', 'Embedding model changed; an explicit profile rebuild is required')

    def embed(self, texts, profile, query=False, deadline=None):
        vectors = []
        for offset in range(0, len(texts), self.settings.batch_size):
            self.check(profile, deadline)
            batch = texts[offset:offset + self.settings.batch_size]
            prefix = profile['query_prefix' if query else 'document_prefix']
            result = self._request('POST', '/api/embed', {'model': profile['model'], 'input': [prefix + text for text in batch], 'truncate': False}, deadline)
            if not isinstance(result, dict) or result.get('model') != profile['model']:
                raise IndexingError('model_response', 'Embedding response model does not match the requested profile')
            values = validate_vectors(result.get('embeddings') if isinstance(result, dict) else None, len(batch), profile['dimension'])
            vectors.extend([[value / math.hypot(*vector) for value in vector] for vector in values])
        return vectors
