from dataclasses import replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import ssl
import subprocess
import sys
import tempfile
from threading import Thread
import time
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from indexing.service import IndexingService
from indexing.store import VectorStore
from indexing.embedding import OllamaEmbeddings
from indexing.http_store import HTTPChromaClient
from indexing.errors import IndexingError
from indexing.operations import Operations
from helpers import EmbeddingServer, isolated_root, manifest


class ReviewRegressions(unittest.TestCase):
    def test_trickled_and_stalled_headers_and_bodies_obey_deadline(self):
        class Slow(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def do_GET(self):
                try:
                    if self.path.endswith('headers'):
                        raw=b'HTTP/1.0 200 OK\r\nContent-Length: 2\r\n\r\n{}'
                    else:
                        self.send_response(200); self.send_header('Content-Length','20'); self.end_headers()
                        raw=b' '*18+b'{}'
                    if 'stall' in self.path: time.sleep(.8)
                    for byte in raw:
                        self.wfile.write(bytes([byte])); self.wfile.flush(); time.sleep(.05)
                except (OSError,ssl.SSLError): pass
        for encrypted in (False,True):
            server=ThreadingHTTPServer(('127.0.0.1',0),Slow)
            certs=Path(__file__).parent/'certs'
            if encrypted:
                context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                context.load_cert_chain(certs/'localhost.crt',certs/'localhost.key')
                server.socket=context.wrap_socket(server.socket,server_side=True)
            thread=Thread(target=server.serve_forever,daemon=True); thread.start()
            try:
                with tempfile.TemporaryDirectory() as directory:
                    url=('https' if encrypted else 'http')+'://127.0.0.1:'+str(server.server_port)
                    settings=replace(Settings(Path(directory)),chroma_url=url,ollama_url=url,attempts=3,request_timeout=1)
                    # Requests uses this variable; the corrected transport uses the same trusted CA.
                    with patch.dict('os.environ',{'REQUESTS_CA_BUNDLE':str(certs/'localhost.crt')}):
                        for path in ('/headers','/body','/stall-headers','/stall-body'):
                            for client in (HTTPChromaClient(settings),OllamaEmbeddings(settings)):
                                call=client.call if isinstance(client,HTTPChromaClient) else client._request
                                started=time.monotonic()
                                with self.subTest(tls=encrypted,path=path,client=type(client).__name__),self.assertRaises(ValueError):
                                    call('GET',path,deadline=started+.25)
                                self.assertLess(time.monotonic()-started,.65,'Request escaped its absolute deadline')
            finally: server.shutdown(); server.server_close(); thread.join()

    def test_retirement_manifest_replays_after_publish_update_and_rollback(self):
        with isolated_root() as root,EmbeddingServer() as server:
            service=IndexingService(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            first=service.build(manifest(root)); service.publish('tansam',first['revision'],0,'one','owner','first')
            path=manifest(root,'CONTACT\nReplacement',source_id='replacement')
            value=json.loads(path.read_text()); value['retirements']=[{'source_id':'profile','reason':'approved replacement'}]; path.write_text(json.dumps(value))
            second=service.build(path); service.publish('tansam',second['revision'],1,'two','owner','replace')
            self.assertEqual(service.build(path)['state'],'unchanged')
            path=manifest(root,'CONTACT\nReplacement updated',source_id='replacement')
            value['sources']=json.loads(path.read_text())['sources']; path.write_text(json.dumps(value))
            third=service.build(path); self.assertEqual(third['state'],'ready')
            service.rollback('tansam',first['revision'],2,'back','owner','rollback')
            self.assertEqual(service.build(path)['state'],'ready')
            value['retirements'].append({'source_id':'unknown','reason':'not previously present'}); path.write_text(json.dumps(value))
            with self.assertRaises(ValueError): service.build(path)

    def test_partial_restore_retry_uses_fresh_unpublished_collections(self):
        with isolated_root() as root,EmbeddingServer() as server:
            settings=replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0,batch_size=1,chunk_size=100,chunk_overlap=10)
            original=IndexingService(settings)
            job=original.build(manifest(root,'CONTACT\n'+('Approved details. '*30)))
            original.publish('tansam',job['revision'],0,'one','owner','first')
            Operations(original).backup(root/'backup')
            target=IndexingService(replace(settings,data_root=root/'target'))
            store=target.store
            write=store.write
            def partial(name,rows,deadline=None):
                write(name,rows[:1],deadline)
                raise IndexingError('vector_unavailable','Simulated outage after persisted first row')
            with patch.object(store,'write',side_effect=partial),self.assertRaises(ValueError):
                Operations(target).restore(root/'backup',offline=True)
            self.assertIsNone(target.catalog.active('tansam')['revision'])
            self.assertEqual(Operations(target).restore(root/'backup',offline=True)['restored_revisions'],1)
            self.assertTrue(target.verify(job['revision'])['verified'])
            self.assertNotEqual(target.catalog.revision(job['revision'])['collection'],original.catalog.revision(job['revision'])['collection'])

    def test_pdf_preparation_consumes_one_shared_build_budget(self):
        from indexing.documents import digest
        with isolated_root() as root:
            path=manifest(root)
            value=json.loads(path.read_text()); template=value['sources'][0]; value['sources']=[]
            for number in range(3):
                source=root/(str(number)+'.pdf'); source.write_bytes(b'%PDF-'+bytes([number]))
                value['sources'].append({**template,'source_id':'pdf'+str(number),'name':source.name,'path':source.name,'format':'pdf','sha256':digest(source.read_bytes())})
            path.write_text(json.dumps(value))
            settings=replace(Settings(root/'data'),build_timeout=1,min_free_bytes=0)
            budgets=[]
            def extractor(args,**kwargs):
                budget=kwargs['timeout']; budgets.append(budget)
                time.sleep(min(.6,budget))
                if budget<.6: raise subprocess.TimeoutExpired(args,budget)
                Path(args[3]).write_text(json.dumps(['Approved PDF text']))
                return subprocess.CompletedProcess(args,0)
            started=time.monotonic()
            with patch('indexing.documents.subprocess.run',side_effect=extractor),self.assertRaises(ValueError):
                IndexingService(settings).build(path)
            self.assertLess(time.monotonic()-started,1.3)
            self.assertLessEqual(len(budgets),2)
            self.assertLess(budgets[-1],.6)


if __name__=='__main__': unittest.main()
