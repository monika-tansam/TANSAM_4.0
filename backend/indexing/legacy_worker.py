"""Read a disposable quiesced copy in a process that releases native handles."""
import json
from pathlib import Path
import sys
import chromadb
from chromadb.config import Settings


def main():
    client = chromadb.PersistentClient(path=sys.argv[1], settings=Settings(anonymized_telemetry=False))
    collection = client.get_collection('documents', embedding_function=None)
    count = collection.count()
    if not 1 <= count <= int(sys.argv[3]): raise ValueError('Legacy record limit')
    with Path(sys.argv[2]).open('w', encoding='utf-8') as output:
        for offset in range(0, count, 100):
            data = collection.get(offset=offset, limit=100, include=['documents', 'metadatas', 'embeddings'])
            for identifier, text, metadata, vector in zip(data['ids'], data['documents'], data['metadatas'], data['embeddings']):
                output.write(json.dumps({'id': identifier, 'text': text, 'metadata': metadata, 'vector': vector.tolist()}, allow_nan=False) + '\n')


if __name__ == '__main__':
    main()
