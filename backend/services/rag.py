"""Read only published knowledge; import never creates a database."""
from functools import lru_cache
from indexing.service import IndexingService
from indexing.settings import Settings


@lru_cache(maxsize=1)
def _service(settings):
    return IndexingService(settings)


def retrieve(query: str, user_id: str, top_k: int = 6) -> list:
    return _service(Settings.from_env()).read('tansam', query, user_id, top_k)


def format_rag_context(chunks: list) -> str:
    return '\n\n'.join(f"[{i}] (from: {chunk['source']})\n{chunk['text']}"
                       for i, chunk in enumerate(chunks, 1))
