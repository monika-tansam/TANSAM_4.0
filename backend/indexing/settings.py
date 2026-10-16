"""Explicit, working-directory-independent indexing configuration."""
from dataclasses import dataclass, field, fields
from pathlib import Path
import os
from urllib.parse import urlsplit

BACKEND = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    data_root: Path
    environment: str = 'development'
    chroma_mode: str = 'embedded'
    chroma_url: str = 'http://127.0.0.1:8000'
    ollama_url: str = 'http://127.0.0.1:11434'
    model: str = 'nomic-embed-text:latest'
    document_prefix: str = 'search_document: '
    query_prefix: str = 'search_query: '
    chunk_size: int = 1000
    chunk_overlap: int = 150
    batch_size: int = 16
    attempts: int = 3
    connect_timeout: int = 5
    request_timeout: int = 60
    extraction_timeout: int = 60
    build_timeout: int = 1800
    max_sources: int = 100
    max_source_bytes: int = 10 * 1024 * 1024
    max_build_bytes: int = 100 * 1024 * 1024
    max_pdf_pages: int = 200
    max_characters: int = 1_000_000
    max_chunks: int = 20_000
    min_free_bytes: int = 256 * 1024 * 1024
    ollama_token: str = field(default='', repr=False)
    chroma_token: str = field(default='', repr=False)

    def __post_init__(self):
        root = Path(self.data_root)
        if self.environment not in ('development', 'test', 'production'):
            raise ValueError('Invalid TANSY_ENV')
        if self.chroma_mode not in ('embedded', 'http'):
            raise ValueError('Invalid Chroma mode')
        if self.environment == 'production' and (not root.is_absolute() or self.chroma_mode != 'http'):
            raise ValueError('Production requires absolute storage and server-backed Chroma')
        object.__setattr__(self, 'data_root', (root if root.is_absolute() else BACKEND / root).resolve())
        for name in ('chroma_url', 'ollama_url'):
            value = getattr(self, name)
            parsed = urlsplit(value)
            if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
                raise ValueError('Invalid service endpoint')
            parsed.port  # Validate port syntax without logging the endpoint.
            object.__setattr__(self, name, value.rstrip('/'))
        for item in fields(self):
            value = getattr(self, item.name)
            if item.type is int and (isinstance(value, bool) or not isinstance(value, int) or value < (0 if item.name in ('chunk_overlap', 'min_free_bytes') else 1)):
                raise ValueError('Invalid numeric setting: ' + item.name)
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError('Overlap must be smaller than chunk size')
        if not self.model.strip():
            raise ValueError('Embedding model is required')

    @classmethod
    def from_env(cls, env=None):
        env = os.environ if env is None else env
        if env.get('TANSY_ENV') == 'production' and not all(env.get(key) for key in ('TANSY_DATA_ROOT', 'TANSY_CHROMA_URL', 'TANSY_OLLAMA_URL')):
            raise ValueError('Production storage and service endpoints must be explicit')
        values = {'data_root': Path(env.get('TANSY_DATA_ROOT', str(BACKEND / 'index_data')))}
        for item in fields(cls):
            key = 'TANSY_' + ('ENV' if item.name == 'environment' else item.name.upper())
            if item.name != 'data_root' and key in env:
                values[item.name] = int(env[key]) if item.type is int else env[key]
        return cls(**values)
