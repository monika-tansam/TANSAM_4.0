import os
import sys
from app import app
from services.rag import ingest_document, delete_document

def main():
    print("[START] Starting TANSAM Knowledge Base Ingestion...")
    filepath = "tansam_knowledge.txt"
    filename = "tansam_knowledge.txt"
    user_id = "TANSAM_SYSTEM_USER"

    # Make path absolute relative to this script directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    abs_filepath = os.path.join(current_dir, filepath)

    if not os.path.exists(abs_filepath):
        print(f"[ERROR] file not found: {abs_filepath}")
        sys.exit(1)

    with app.app_context():
        try:
            print("[CLEANUP] Cleaning up old TANSAM database entries...")
            delete_document(filename, user_id)
            
            print("[INGEST] Ingesting document chunks...")
            chunks_count = ingest_document(abs_filepath, filename, user_id)
            print(f"[SUCCESS] Ingested {chunks_count} chunks under user_id '{user_id}'.")
        except Exception as e:
            print(f"[ERROR] Ingestion failed with error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
