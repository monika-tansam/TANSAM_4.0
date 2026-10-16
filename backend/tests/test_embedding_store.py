from pathlib import Path
import sys
import tempfile
import unittest
from dataclasses import replace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from helpers import EmbeddingServer, isolated_root


class EmbeddingTests(unittest.TestCase):
    def client(self,settings):
        try:
            from indexing.embedding import OllamaEmbeddings
        except ImportError: self.fail('Validated Ollama embedding client is not implemented')
        return OllamaEmbeddings(settings)

    def test_batches_prefixes_and_disabled_truncation(self):
        with tempfile.TemporaryDirectory() as directory,EmbeddingServer() as server:
            client=self.client(replace(Settings(Path(directory)),ollama_url=server.url,batch_size=2))
            profile=client.profile()
            self.assertEqual(profile['dimension'],4)
            self.assertEqual(len(client.embed(['one','two','three'],profile)),3)
            self.assertEqual([len(request['input']) for request in server.inputs],[2,1])
            self.assertTrue(all(not request['truncate'] for request in server.inputs))
            self.assertEqual(server.inputs[0]['input'],['search_document: one','search_document: two'])
            client.embed(['question'],profile,query=True)
            self.assertEqual(server.inputs[-1]['input'],['search_query: question'])

    def test_transient_retry_permanent_failure_bad_vectors_and_drift(self):
        with tempfile.TemporaryDirectory() as directory,EmbeddingServer() as server:
            client=self.client(replace(Settings(Path(directory)),ollama_url=server.url))
            profile=client.profile(); server.failure='transient'
            self.assertEqual(len(client.embed(['one'],profile)),1)
            self.assertEqual(len(server.inputs),2)
            for failure in ['permanent','malformed','missing','wrong_model']:
                server.failure=failure; before=len(server.inputs)
                with self.subTest(failure=failure),self.assertRaises(ValueError): client.embed(['one'],profile)
                self.assertEqual(len(server.inputs)-before,1)
            server.failure=None; server.digest='b'*64
            with self.assertRaises(ValueError): client.embed(['one'],profile)

    def test_query_uses_published_profile_instead_of_new_global_model(self):
        with tempfile.TemporaryDirectory() as directory,EmbeddingServer() as server:
            settings=replace(Settings(Path(directory)),ollama_url=server.url)
            profile=self.client(settings).profile()
            reader=self.client(replace(settings,model='different:latest'))
            self.assertEqual(len(reader.embed(['question'],profile,query=True)),1)

    def test_legacy_query_uses_original_api_and_preserves_normalization(self):
        with tempfile.TemporaryDirectory() as directory,EmbeddingServer() as server:
            client=self.client(replace(Settings(Path(directory)),ollama_url=server.url))
            profile={**client.profile(),'api':'/api/embeddings','document_prefix':'','query_prefix':'','normalization':'legacy-unmodified','historical_digest':'unknown'}
            client.embed(['legacy question'],profile,query=True)
            self.assertEqual(server.inputs[-1].get('prompt'),'legacy question')


class StoreTests(unittest.TestCase):
    def test_write_honors_remaining_build_deadline(self):
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        from threading import Thread
        import json,time
        from indexing.store import VectorStore
        class Delayed(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def send(self,value):
                try:
                    self.send_response(200); self.end_headers(); self.wfile.write(json.dumps(value).encode())
                except OSError: pass
            def do_GET(self):
                self.send('1.0.0' if self.path.endswith('/version') else {'max_batch_size':16} if self.path.endswith('/pre-flight-checks') else {'id':'fake-id'})
            def do_POST(self):
                time.sleep(3); self.send({})
        server=ThreadingHTTPServer(('127.0.0.1',0),Delayed)
        thread=Thread(target=server.serve_forever,daemon=True); thread.start()
        try:
            with tempfile.TemporaryDirectory() as directory:
                settings=replace(Settings(Path(directory)),chroma_mode='http',chroma_url='http://127.0.0.1:'+str(server.server_port),request_timeout=10,attempts=1)
                store=VectorStore(settings); started=time.monotonic()
                with self.assertRaises(ValueError):
                    store.write('test',[{'id':'one','text':'test','metadata':{'source':'test'},'vector':[1.,0.,0.,0.]}],deadline=started+1)
                self.assertLess(time.monotonic()-started,2.)
        finally: server.shutdown(); server.server_close(); thread.join()

    @unittest.skipUnless(__import__('os').environ.get('TANSY_TEST_CHROMA_URL'), 'Isolated Chroma URL not configured')
    def test_real_pinned_http_server_round_trip(self):
        import os,uuid
        from indexing.store import VectorStore
        with tempfile.TemporaryDirectory() as directory:
            store=VectorStore(replace(Settings(Path(directory)),chroma_mode='http',chroma_url=os.environ['TANSY_TEST_CHROMA_URL']))
            name='integration-'+uuid.uuid4().hex
            store.create(name)
            rows=[{'id':'one','text':'Approved email','metadata':{'source':'profile','user_id':'owner'},'vector':[1.,0.,0.,0.]}]
            store.write(name,rows); store.write(name,rows)
            self.assertEqual(store.count(name),1)
            self.assertEqual(store.read(name)[0]['text'],rows[0]['text'])
            self.assertEqual(store.query(name,rows[0]['vector'],'owner',1)[0]['text'],rows[0]['text'])

    def test_http_constructor_has_a_bounded_failure_deadline(self):
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        from threading import Thread
        import time
        from indexing.store import VectorStore
        class Delayed(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def do_GET(self):
                time.sleep(3)
                try:
                    self.send_response(200); self.end_headers(); self.wfile.write(b'{}')
                except OSError: pass
        server=ThreadingHTTPServer(('127.0.0.1',0),Delayed)
        thread=Thread(target=server.serve_forever,daemon=True); thread.start()
        try:
            with tempfile.TemporaryDirectory() as directory:
                settings=replace(Settings(Path(directory)),chroma_mode='http',chroma_url='http://127.0.0.1:'+str(server.server_port),request_timeout=1,connect_timeout=1,attempts=1)
                started=time.monotonic()
                with self.assertRaises(ValueError): VectorStore(settings)
                self.assertLess(time.monotonic()-started,2.0,'Server initialization waited beyond the configured request bound')
        finally: server.shutdown(); server.server_close(); thread.join()
    def test_retry_after_ack_loss_does_not_duplicate_real_records(self):
        try:
            from indexing.store import VectorStore
        except ImportError: self.fail('Explicit immutable vector-store adapter is not implemented')
        with isolated_root() as directory:
            store=VectorStore(Settings(Path(directory)))
            store.create('tansam-test-snapshot')
            rows=[{'id':'one','text':'Approved email info@tansam.in','metadata':{'source':'profile'},'vector':[1.0,0.0,0.0,0.0]}]
            store.write('tansam-test-snapshot',rows)
            store.write('tansam-test-snapshot',rows)
            self.assertEqual(len(store.read('tansam-test-snapshot')),1)
            self.assertEqual(store.read('tansam-test-snapshot')[0]['text'],rows[0]['text'])
            with self.assertRaises(ValueError): store.read('missing-collection')


if __name__=='__main__': unittest.main()
