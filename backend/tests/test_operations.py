from pathlib import Path
import hashlib
import json
import sys
import tempfile
import unittest
from dataclasses import replace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from indexing.service import IndexingService
from helpers import EmbeddingServer, isolated_root, manifest


class OperationsTests(unittest.TestCase):
    def operations(self,service):
        try:
            from indexing.operations import Operations
        except ImportError: self.fail('Explicit migration and backup operations are not implemented')
        return Operations(service)

    def test_backup_restores_verified_publication_to_another_root(self):
        with isolated_root() as root, EmbeddingServer() as server:
            settings=replace(Settings(root/'original'),ollama_url=server.url,min_free_bytes=0)
            original=IndexingService(settings)
            first=original.build(manifest(root))
            original.publish('tansam',first['revision'],0,'one','owner','initial')
            backup=root/'backup'
            self.operations(original).backup(backup)
            restored=IndexingService(replace(settings,data_root=root/'restored'))
            with self.assertRaises(ValueError): self.operations(restored).restore(backup,offline=False)
            result=self.operations(restored).restore(backup,offline=True)
            self.assertEqual(result['restored_revisions'],1)
            self.assertEqual(restored.status('tansam')['active'],original.status('tansam')['active'])
            self.assertIn('info@tansam.in',restored.read('tansam','email?','TANSAM_SYSTEM_USER')[0]['text'])
            with self.assertRaises(ValueError): self.operations(restored).restore(backup,offline=True)
            # A damaged archive cannot change a clean target catalog.
            archived=next((backup/'sources').iterdir()); archived.write_bytes(b'damaged')
            clean=IndexingService(replace(settings,data_root=root/'clean'))
            with self.assertRaises(ValueError): self.operations(clean).restore(backup,offline=True)
            self.assertIsNone(clean.catalog.active('tansam')['revision'])

    def test_legacy_copy_preserves_vectors_and_labels_unknown_history(self):
        import chromadb
        with isolated_root() as root, EmbeddingServer() as server:
            path=manifest(root)
            source_hash=hashlib.sha256((root/'source.txt').read_bytes()).hexdigest()
            legacy=root/'legacy'
            client=chromadb.PersistentClient(path=str(legacy))
            collection=client.create_collection('documents',embedding_function=None,metadata={'hnsw:space':'cosine'})
            collection.add(ids=['legacy-one'],documents=['Official email info@tansam.in'],
                           metadatas=[{'source':'source.txt','user_id':'TANSAM_SYSTEM_USER'}],embeddings=[[2.,0.,0.,0.]])
            # The migration caller must stop all legacy writers before this flag.
            from chromadb.api.shared_system_client import SharedSystemClient
            for key,system in list(SharedSystemClient._identifier_to_system.items()):
                if str(system.settings.persist_directory)==str(legacy):
                    system.stop(); del SharedSystemClient._identifier_to_system[key]
            before=hashlib.sha256((legacy/'chroma.sqlite3').read_bytes()).hexdigest()
            settings=replace(Settings(root/'new'),ollama_url=server.url,min_free_bytes=0)
            service=IndexingService(settings); ops=self.operations(service)
            inventory=ops.inventory_legacy(legacy)
            self.assertEqual(inventory['collections'][0]['name'],'documents')
            with self.assertRaises(ValueError): ops.migrate_legacy(legacy,path,[],quiesced=False)
            checks=[{'question':'email?','contains':'info@tansam.in'}]
            copied=ops.migrate_legacy(legacy,path,checks,quiesced=True)
            revision=service.catalog.revision(copied['revision'])
            self.assertEqual(revision['profile']['historical_digest'],'unknown')
            self.assertEqual(revision['profile']['document_prefix'],'')
            self.assertEqual(revision['profile']['api'],'/api/embeddings')
            self.assertEqual(service.store.read(revision['collection'])[0]['vector'],[2.,0.,0.,0.])
            self.assertEqual(revision['sources'][0]['sha256'],source_hash)
            self.assertEqual(hashlib.sha256((legacy/'chroma.sqlite3').read_bytes()).hexdigest(),before)
            self.assertIsNone(service.catalog.active('tansam')['revision'])
            service.publish('tansam',revision['id'],0,'legacy','owner','baseline')
            self.assertTrue(service.verify(revision['id'])['verified'])


if __name__=='__main__': unittest.main()
