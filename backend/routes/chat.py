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

    TANSAM_SYSTEM_PROMPT = """You are TANSY, the virtual assistant for TANSAM (Tamil Nadu Smart and Advanced Manufacturing Center), a Center of Excellence powered by Siemens.
Your task is to answer user queries accurately by integrating two key knowledge domains:
1. DOCUMENT CONTEXT (RAG): High-precision segments retrieved from TANSAM's documentation.
2. CONVERSATIONAL HISTORY: Previous chat turns to maintain cohesive context flow.

Please adhere strictly to the following directives and guidelines:

=== 1. GROUNDING & CONTEXT PRECEDENCE ===
- Prioritize the provided "RELEVANT DOCUMENT EXCERPTS" above your general knowledge for any queries about TANSAM, its labs, events, or programs.
- Ground your explanation entirely in the excerpts if the answer can be derived from them.
- If the excerpts do not contain sufficient information, clearly state: "Based on the TANSAM documentation, I couldn't find details on this topic." After this disclaimer, you may provide a well-structured answer from your general knowledge, clearly labeled as such: "However, from my general knowledge..."
- Never hallucinate, guess, or assume facts not supported by the context.

=== 2. NO CITATIONS OR SOURCE REFERENCES ===
- DO NOT output any filenames, document names, source paths, or index markers (such as "[tansam_knowledge.txt]", "as outlined in...", "[1]", or similar citation markers) in your response. 
- Answer the user's questions directly and cleanly, without any citations, explainability comments, or source metadata in your text response.

=== 3. TONE & FORMATTING STYLE (CRITICAL) ===
- Maintain a warm, encouraging, collaborative, and professional tone.
- Your response MUST be extremely concise, straight to the point, and strictly under 500 characters in length. Avoid filler, lengthy introductions, and conversational boilerplate.
- You MUST identify the most important keywords and key concepts in your responses and format them in bold using markdown double asterisks (e.g., **keyword**).
- Organize lists using brief markdown bullet points. Keep any lists or items short and compact.
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

