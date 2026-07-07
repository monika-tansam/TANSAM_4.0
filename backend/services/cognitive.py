import json
import requests
import time
import config

# ── Ollama Helper Methods ─────────────────────────────────────────────────────────

_installed_models_cache = None
_installed_models_cache_time = 0

def get_installed_models() -> list:
    """
    Returns the list of locally pulled Ollama models.
    Filters out embedding models like nomic-embed-text.
    Caches the results for 30 seconds to prevent slow page reloads.
    """
    global _installed_models_cache, _installed_models_cache_time
    now = time.time()
    if _installed_models_cache is not None and (now - _installed_models_cache_time) < 30:
        return _installed_models_cache

    try:
        r = requests.get(f"{config.OLLAMA_URL}/api/tags", timeout=2)
        if r.status_code != 200:
            return config.AVAILABLE_MODELS
        
        installed = set()
        for m in r.json().get("models", []):
            name = m["name"]
            if name == config.EMBED_MODEL or "embed" in name.lower() or name.startswith("nomic"):
                continue
            installed.add(name)

        ordered = [m for m in config.AVAILABLE_MODELS if m in installed]
        extras = [m for m in installed if m not in config.AVAILABLE_MODELS]
        _installed_models_cache = ordered + sorted(extras)
        _installed_models_cache_time = now
        return _installed_models_cache
    except Exception:
        # Fallback to cache if available, otherwise return default config models
        if _installed_models_cache is not None:
            return _installed_models_cache
        return config.AVAILABLE_MODELS


def get_fast_background_model() -> str:
    """Selects a lightweight, high-speed model for background tasks."""
    try:
        installed = get_installed_models()
        # Prefer llama3.2 (very fast 3B), then phi3, mistral, gemma2, etc.
        preferred_fast = ["llama3.2", "phi3", "mistral", "gemma2"]
        for model in preferred_fast:
            for inst in installed:
                if model in inst.lower():
                    return inst
        for inst in installed:
            if "deepseek" not in inst.lower() and "think" not in inst.lower():
                return inst
        return installed[0] if installed else config.AVAILABLE_MODELS[0]
    except Exception:
        return config.AVAILABLE_MODELS[0]


def ollama_chat_stream(messages: list, model: str):
    """Initiates a streaming chat interface with Ollama."""
    r = requests.post(
        f"{config.OLLAMA_URL}/api/chat",
        json={
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "num_predict": 150
            }
        },
        stream=True,
        timeout=120,
    )
    r.raise_for_status()
    return r


def ollama_complete(prompt: str, model: str) -> str:
    """Non-streaming complete pass."""
    r = requests.post(
        f"{config.OLLAMA_URL}/api/chat",
        json={"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False},
        timeout=120,
    )
    r.raise_for_status()
    return r.json()["message"]["content"].strip()
