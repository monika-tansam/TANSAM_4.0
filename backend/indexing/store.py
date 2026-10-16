"""Explicit Chroma adapter; no implicit collections or embedding downloads."""
import chromadb
from contextlib import contextmanager
from chromadb.config import Settings as ChromaSettings

from .embedding import retry
from .errors import IndexingError
from .http_store import HTTPChromaClient


class VectorStore:
    def __init__(self, settings):
        self.settings = settings
        options = ChromaSettings(anonymized_telemetry=False)
        if settings.chroma_mode == 'embedded':
            self.client = chromadb.PersistentClient(path=str(settings.data_root / 'vectors'), settings=options)
        else:
            self.client = HTTPChromaClient(settings)
        # The pinned chromadb/chroma:1.5.9 Rust image reports 1.0.0 here;
        # this is its protocol version, not the Python package version.
        expected = chromadb.__version__ if settings.chroma_mode == 'embedded' else '1.0.0'
        if self.client.get_version() != expected:
            raise IndexingError('chroma_version', 'Unsupported Chroma server protocol version')

    def create(self, name):
        self.client.create_collection(name, embedding_function=None, metadata={'hnsw:space': 'cosine'})

    @contextmanager
    def bounded(self, deadline):
        token = self.client.deadline.set(deadline) if isinstance(self.client, HTTPChromaClient) else None
        try: yield
        finally:
            if token is not None: self.client.deadline.reset(token)

    def _collection(self, name):
        try: return self.client.get_collection(name, embedding_function=None)
        except Exception as error: raise IndexingError('vector_unavailable', 'Published vector collection is unavailable') from error

    def count(self, name):
        return self._collection(name).count()

    def write(self, name, rows, deadline=None):
        collection = self._collection(name)
        bound = min(self.settings.batch_size, self.client.get_max_batch_size())
        for offset in range(0, len(rows), bound):
            batch = rows[offset:offset + bound]
            retry(lambda: collection.upsert(ids=[row['id'] for row in batch], documents=[row['text'] for row in batch],
                                           metadatas=[row['metadata'] for row in batch], embeddings=[row['vector'] for row in batch]), self.settings, deadline)

    def read(self, name, offset=0, limit=100):
        data = self._collection(name).get(offset=offset, limit=limit, include=['documents', 'metadatas', 'embeddings'])
        return [{'id': identifier, 'text': text, 'metadata': meta, 'vector': vector.tolist() if hasattr(vector, 'tolist') else vector}
                for identifier, text, meta, vector in zip(data['ids'], data['documents'], data['metadatas'], data['embeddings'])]

    def query(self, name, vector, owner, top_k):
        data = self._collection(name).query(query_embeddings=[vector], n_results=min(top_k, self.count(name)),
                                            where={'user_id': owner}, include=['documents', 'metadatas', 'distances'])
        return [{'text': text, 'source': meta['source'], 'score': 1 - distance}
                for text, meta, distance in zip(data['documents'][0], data['metadatas'][0], data['distances'][0])]
