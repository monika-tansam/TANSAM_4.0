import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
import config
from services.cognitive import get_installed_models, ollama_chat_stream
from services.rag import retrieve, format_rag_context

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/api/models")
def list_models():
    return jsonify({"models": get_installed_models()})

@chat_bp.route("/api/public/chat", methods=["POST"])
def public_chat():
    data = request.json or {}
    user_msg = data.get("message", "").strip()
    history = data.get("history", [])
    model = data.get("model", config.AVAILABLE_MODELS[0])

    if not user_msg:
        return jsonify({"error": "Empty message"}), 400

    system_user_id = "TANSAM_SYSTEM_USER"

    rag_chunks = retrieve(user_msg, system_user_id)

    TANSAM_SYSTEM_PROMPT = """You are the virtual assistant for TANSAM (Tamil Nadu Smart and Advanced Manufacturing Center), a Center of Excellence powered by Siemens.
Your task is to answer user queries accurately based ONLY on the provided "RELEVANT DOCUMENT EXCERPTS" about the company, its labs, events, and programs.

=== DIRECTIVES ===
- Ground your answers strictly on the provided context.
- If the details are not found in the context, clearly say: "I couldn't find information about that in the TANSAM documentation. However, based on general knowledge..." and then answer.
- Your response MUST be extremely concise, straight to the point, and strictly under 500 characters in length. Avoid filler, lengthy introductions, or conversational boilerplate.
- You MUST identify the most important keywords and key concepts in your responses and format them in bold using markdown double asterisks (e.g., **keyword**).
- Organize lists using brief markdown bullet points. Keep any lists or items short and compact.
- Maintain a warm, encouraging, and collaborative tone.
"""

    rag_context = format_rag_context(rag_chunks) if rag_chunks else "No relevant TANSAM documentation found."
    system_content = f"{TANSAM_SYSTEM_PROMPT}\n\n=== RELEVANT DOCUMENT EXCERPTS ===\n{rag_context}"

    messages = [{"role": "system", "content": system_content}]

    recent_history = history[-6:] if history else []
    for msg in recent_history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": user_msg})

    def generate():
        sources = list({c["source"] for c in rag_chunks})
        yield f"data: {json.dumps({'sources': sources, 'done': False})}\n\n"

        full_response = ""
        try:
            resp = ollama_chat_stream(messages, model)
            for line in resp.iter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                token = chunk.get("message", {}).get("content", "")
                done  = chunk.get("done", False)
                if token:
                    full_response += token
                    yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
                if done:
                    yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"
                    return
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")

