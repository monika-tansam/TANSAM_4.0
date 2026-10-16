"""Opt-in integration; every collection belongs to a disposable test server."""
from dataclasses import replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
from threading import Thread
import time
import unittest
import uuid
import requests

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from indexing.service import IndexingService
from indexing.store import VectorStore
from helpers import EmbeddingServer, manifest

URL=os.environ.get('TANSY_TEST_CHROMA_URL')
BACKEND=Path(__file__).resolve().parents[1]


@unittest.skipUnless(URL,'Isolated Chroma URL not configured')
class HTTPIntegrationTests(unittest.TestCase):
    def test_upsert_acknowledgement_loss_retries_without_duplicate_records(self):
        dropped=[]
        class Proxy(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def forward(self):
                data=self.rfile.read(int(self.headers.get('Content-Length',0)))
                response=requests.request(self.command,URL+self.path,data=data or None,headers={'Content-Type':'application/json'},timeout=10)
                if self.path.endswith('/upsert') and not dropped:
                    dropped.append(True)
                    self.connection.shutdown(socket.SHUT_RDWR); self.connection.close()
                    return
                self.send_response(response.status_code); self.send_header('Content-Length',str(len(response.content))); self.end_headers(); self.wfile.write(response.content)
            do_GET=forward
            do_POST=forward
        proxy=ThreadingHTTPServer(('127.0.0.1',0),Proxy)
        thread=Thread(target=proxy.serve_forever,daemon=True); thread.start()
        try:
            with tempfile.TemporaryDirectory() as directory:
                store=VectorStore(replace(Settings(Path(directory)),chroma_mode='http',chroma_url='http://127.0.0.1:'+str(proxy.server_port)))
                name='ack-loss-'+uuid.uuid4().hex; store.create(name)
                row={'id':'one','text':'Approved document','metadata':{'source':'approved'},'vector':[1.,0.,0.,0.]}
                store.write(name,[row])
                self.assertEqual(dropped,[True]); self.assertEqual(store.count(name),1)
                self.assertEqual(store.read(name)[0]['text'],row['text'])
        finally: proxy.shutdown(); proxy.server_close(); thread.join()

    def test_killed_build_recovery_and_hot_publication_rollback(self):
        with tempfile.TemporaryDirectory() as directory, EmbeddingServer() as server:
            root=Path(directory)
            settings=replace(Settings(root/'data'),chroma_mode='http',chroma_url=URL,ollama_url=server.url,min_free_bytes=0)
            service=IndexingService(settings)
            path=manifest(root,'CONTACT\nApproved first email')
            first=service.build(path); service.publish('tansam',first['revision'],0,'first','owner','initial')
            path=manifest(root,'CONTACT\nApproved second email'); server.failure='block'
            env={**os.environ,'TANSY_ENV':'test','TANSY_DATA_ROOT':str(settings.data_root),'TANSY_CHROMA_MODE':'http',
                 'TANSY_CHROMA_URL':URL,'TANSY_OLLAMA_URL':server.url,'TANSY_MIN_FREE_BYTES':'0'}
            process=subprocess.Popen([sys.executable,str(BACKEND/'ingest_tansam.py'),'build','--manifest',str(path)],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            try:
                self.assertTrue(server.entered.wait(20),'Worker did not reach external embedding request')
                process.kill(); process.communicate(timeout=10)
            finally:
                if process.poll() is None: process.kill(); process.communicate(timeout=10)
                server.failure=None; server.release.set()
            recovered=IndexingService(settings)
            self.assertEqual(len(recovered.recover('tansam')['interrupted']),1)
            self.assertIn('first email',service.read('tansam','email?','TANSAM_SYSTEM_USER')[0]['text'])
            second=recovered.build(path); recovered.publish('tansam',second['revision'],1,'second','owner','update')
            # The original reader instance must observe the catalog switch without restart.
            self.assertIn('second email',service.read('tansam','email?','TANSAM_SYSTEM_USER')[0]['text'])
            recovered.rollback('tansam',first['revision'],2,'back','owner','restore')
            self.assertIn('first email',service.read('tansam','email?','TANSAM_SYSTEM_USER')[0]['text'])

    @unittest.skipUnless(os.environ.get('TANSY_TEST_OLLAMA_URL'),'Live Ollama URL not configured')
    def test_live_ollama_build_publication_query_and_restore(self):
        from indexing.operations import Operations
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            settings=replace(Settings(root/'data'),chroma_mode='http',chroma_url=URL,ollama_url=os.environ['TANSY_TEST_OLLAMA_URL'],min_free_bytes=0)
            service=IndexingService(settings)
            job=service.build(BACKEND/'knowledge_manifest.json')
            service.publish('tansam',job['revision'],0,'live-initial','test-operator','approved source smoke check')
            hits=service.read('tansam','What are the official email addresses and office hours?','TANSAM_SYSTEM_USER')
            self.assertTrue(any('hr@tansam.org' in hit['text'] and 'info@tansam.in' in hit['text'] for hit in hits))
            Operations(service).backup(root/'backup')
            target=IndexingService(replace(settings,data_root=root/'restored'))
            Operations(target).restore(root/'backup',offline=True)
            self.assertTrue(target.verify(job['revision'])['verified'])


if __name__=='__main__': unittest.main()
