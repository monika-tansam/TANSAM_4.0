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


class StoreTests(unittest.TestCase):
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
