"""Owned fixtures for behavioral tests; no access to the live knowledge store."""
from pathlib import Path
import hashlib
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from contextlib import contextmanager
import tempfile


@contextmanager
def isolated_root():
    """Release Chroma's process-cached native handles before Windows cleanup."""
    with tempfile.TemporaryDirectory() as directory:
        try: yield Path(directory)
        finally:
            from chromadb.api.shared_system_client import SharedSystemClient
            for key,system in list(SharedSystemClient._identifier_to_system.items()):
                if str(system.settings.persist_directory).startswith(directory):
                    system.stop()
                    del SharedSystemClient._identifier_to_system[key]


class EmbeddingServer:
    """Protocol fixture for the external inference dependency, not the index."""
    def __enter__(self):
        self.digest='a'*64
        self.inputs=[]
        self.failure=None
        fixture=self
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def send(self,value,status=200):
                raw=json.dumps(value).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
            def do_GET(self):
                self.send({'models':[{'name':'nomic-embed-text:latest','digest':fixture.digest}]})
            def do_POST(self):
                value=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                if self.path=='/api/show': return self.send({'model_info':{'nomic-bert.embedding_length':4}})
                fixture.inputs.append(value)
                failure=fixture.failure
                if self.path=='/api/embeddings':
                    return self.send({'embedding':[1.,0.,0.,0.]})
                if failure=='transient':
                    fixture.failure=None
                    return self.send({'error':'temporarily unavailable'},503)
                if failure=='permanent': return self.send({'error':'invalid'},400)
                if failure=='malformed': return self.send({'embeddings':[[float('nan')]*4 for _ in value['input']]})
                if failure=='missing': return self.send({'embeddings':[]})
                if failure=='wrong_model': return self.send({'model':'other:latest','embeddings':[[1.0,0.0,0.0,0.0] for _ in value['input']]})
                self.send({'model':value['model'],'embeddings':[[1.0,0.0,0.0,0.0] for _ in value['input']]})
        self.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        self.thread=Thread(target=self.server.serve_forever,daemon=True); self.thread.start()
        self.url='http://127.0.0.1:'+str(self.server.server_port)
        return self
    def __exit__(self,*args):
        self.server.shutdown(); self.server.server_close(); self.thread.join()


def manifest(root, text='CONTACT INFORMATION\nOfficial email: info@tansam.in', source_id='profile'):
    root = Path(root)
    source = root / 'source.txt'
    source.write_text(text, encoding='utf-8')
    value = {'schema_version':1, 'kb':'tansam', 'owner':'TANSAM_SYSTEM_USER', 'sources':[
        {'source_id':source_id, 'path':'source.txt', 'format':'txt', 'name':'source.txt',
         'sha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'approved_by':'owner',
         'approved_at':'2026-10-16T09:00:00+05:30'}], 'retirements':[]}
    path = root / 'manifest.json'
    path.write_text(json.dumps(value), encoding='utf-8')
    return path
