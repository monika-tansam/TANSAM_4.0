from pathlib import Path
import sys
import unittest
from dataclasses import replace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from helpers import EmbeddingServer, isolated_root, manifest
import json


class ServiceTests(unittest.TestCase):
    def test_committed_publication_retry_uses_audit_even_when_model_is_down(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            staged=service.build(manifest(root))
            result=service.publish('tansam',staged['revision'],0,'one','owner','first')
            server.digest='b'*64
            self.assertEqual(service.publish('tansam',staged['revision'],0,'one','owner','first'),result)

    def test_corrupted_cache_cannot_poison_a_new_revision(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            first=service.build(manifest(root,'CONTACT\nEmail: approved@tansam.in'))
            service.publish('tansam',first['revision'],0,'one','owner','first')
            with service.catalog.connection() as con:
                con.execute("UPDATE cache SET payload='[0.0,1.0,0.0,0.0]'")
            second=service.build(manifest(root,'CONTACT\nEmail: approved@tansam.in\n\nHOURS\n9 AM to 6 PM'))
            revision=service.catalog.revision(second['revision'])
            for row in service.store.read(revision['collection']):
                self.assertEqual(row['vector'],[1.0,0.0,0.0,0.0])

    def test_unchanged_build_reuses_ready_revision_and_published_cache(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            path=manifest(root)
            first=service.build(path); calls=len(server.inputs)
            second=service.build(path)
            self.assertEqual(second['revision'],first['revision'])
            self.assertEqual(second['state'],'unchanged')
            self.assertEqual(len(server.inputs),calls)
            service.publish('tansam',first['revision'],0,'one','owner','first')
            self.assertEqual(service.build(path)['revision'],first['revision'])

    def test_stale_publication_idempotence_and_rollback(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            first=service.build(manifest(root,'CONTACT\nFirst email'))
            stale=service.build(manifest(root,'CONTACT\nStale email'))
            initial=service.publish('tansam',first['revision'],0,'one','owner','first')
            self.assertEqual(service.publish('tansam',first['revision'],0,'one','owner','first'),initial)
            with self.assertRaises(ValueError): service.publish('tansam',stale['revision'],0,'stale','owner','old')
            second=service.build(manifest(root,'CONTACT\nSecond email'))
            service.publish('tansam',second['revision'],1,'two','owner','second')
            self.assertTrue(callable(getattr(service,'rollback',None)), 'Rollback operation is not implemented')
            service.rollback('tansam',first['revision'],2,'back','owner','restore')
            self.assertIn('First email',service.read('tansam','email?','TANSAM_SYSTEM_USER')[0]['text'])
            self.assertTrue(service.verify(second['revision'])['verified'])

    def test_writer_conflicts_and_abandoned_job_recovery(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            service.catalog.save_job({'id':'abandoned','kb':'tansam','state':'running','phase':'embed'})
            self.assertTrue(callable(getattr(service,'recover',None)), 'Recovery operation is not implemented')
            with service.writer('tansam'):
                with self.assertRaises(ValueError): service.recover('tansam')
            self.assertEqual(service.recover('tansam')['interrupted'],['abandoned'])
            self.assertEqual(service.catalog.job('abandoned')['state'],'interrupted')

    def test_source_retirement_must_be_explicit_and_owner_cannot_change(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            first=service.build(manifest(root)); service.publish('tansam',first['revision'],0,'one','owner','first')
            path=manifest(root,source_id='replacement')
            with self.assertRaises(ValueError): service.build(path)
            value=json.loads(path.read_text()); value['retirements']=[{'source_id':'profile','reason':'superseded'}]; path.write_text(json.dumps(value))
            self.assertEqual(service.build(path)['state'],'ready')
            value['owner']='another'; path.write_text(json.dumps(value))
            with self.assertRaises(ValueError): service.build(path)

    def test_readback_tampering_blocks_publication(self):
        with isolated_root() as root, EmbeddingServer() as server:
            service=self.service(replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0))
            staged=service.build(manifest(root))
            revision=service.catalog.revision(staged['revision'])
            row=service.store.read(revision['collection'])[0]
            service.store.write(revision['collection'],[{**row,'text':'tampered'}])
            with self.assertRaises(ValueError): service.publish('tansam',staged['revision'],0,'one','owner','publish')
            self.assertIsNone(service.status('tansam')['active']['revision'])

    def service(self,settings):
        try:
            from indexing.service import IndexingService
        except ImportError: self.fail('Versioned indexing service is not implemented')
        return IndexingService(settings)

    def test_staging_is_invisible_and_failed_update_preserves_published_answers(self):
        with isolated_root() as root, EmbeddingServer() as server:
            settings=replace(Settings(root/'data'),ollama_url=server.url,min_free_bytes=0)
            service=self.service(settings)
            path=manifest(root,'CONTACT\nEmail: approved@tansam.in')
            first=service.build(path)
            self.assertEqual(first['state'],'ready')
            with self.assertRaises(ValueError): service.read('tansam','Email?','TANSAM_SYSTEM_USER')
            service.publish('tansam',first['revision'],0,'initial','owner','initial publication')
            self.assertIn('approved@tansam.in',service.read('tansam','Email?','TANSAM_SYSTEM_USER')[0]['text'])
            path=manifest(root,'CONTACT\nEmail: replacement@tansam.in')
            server.failure='permanent'
            with self.assertRaises(ValueError): service.build(path)
            server.failure=None
            restarted=self.service(settings)
            self.assertEqual(restarted.status('tansam')['active']['revision'],first['revision'])
            self.assertIn('approved@tansam.in',restarted.read('tansam','Email?','TANSAM_SYSTEM_USER')[0]['text'])


if __name__=='__main__': unittest.main()
