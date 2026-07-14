import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# ── Ollama Config ───────────────────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"   # ollama pull nomic-embed-text

AVAILABLE_MODELS = [
    "llama3.2",
]

# ── RAG Settings ────────────────────────────────────────────────────────────────
DEFAULT_CHUNK_SIZE    = 800
DEFAULT_CHUNK_OVERLAP = 150
TOP_K                 = 6
CHROMA_DIR            = "chroma_db"

