import os
from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

# ── Ollama Config ───────────────────────────────────────────────────────────────
OLLAMA_URL = os.getenv('TANSY_CHAT_OLLAMA_URL', os.getenv('TANSY_OLLAMA_URL', 'http://localhost:11434'))
EMBED_MODEL = "nomic-embed-text"   # ollama pull nomic-embed-text

AVAILABLE_MODELS = [
    "llama3.2",
]

# ── RAG Settings ────────────────────────────────────────────────────────────────
DEFAULT_CHUNK_SIZE    = 800
DEFAULT_CHUNK_OVERLAP = 150
TOP_K                 = 6
CHROMA_DIR            = os.path.join(BACKEND_DIR, 'chroma_db')  # Legacy migration source only.

