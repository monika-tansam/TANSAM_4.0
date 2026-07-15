import os
from flask import Flask, request, Response
import config

# Import modular blueprints
from routes.chat import chat_bp
from services.cognitive import get_installed_models

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

@app.route("/", defaults={"path": ""}, methods=["OPTIONS"])
@app.route("/<path:path>", methods=["OPTIONS"])
def preflight_handler(path):
    response = Flask.make_response(app, "")
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

# Register routing blueprints
app.register_blueprint(chat_bp)

# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("[START] Flask Chatbot starting...")
    print(f"[OLLAMA] URL: {config.OLLAMA_URL}  |  embed: {config.EMBED_MODEL}")
    models = get_installed_models()
    if models:
        print(f"[SUCCESS] Available models: {', '.join(models)}")
    else:
        print("[WARNING] No models found. Pull models with: ollama pull llama3.2")
    print(f"\n[INFO] To add more models, edit AVAILABLE_MODELS in config.py, then: ollama pull <model>")
    app.run(debug=True, host="0.0.0.0", port=5001, threaded=True)