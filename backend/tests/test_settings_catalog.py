"""Behavioral contracts for indexing configuration and publication."""
import importlib
import os
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class SettingsTests(unittest.TestCase):
    def test_valid_production_endpoints_and_invalid_bounds(self):
        from indexing.settings import Settings
        env = {'TANSY_ENV':'production','TANSY_DATA_ROOT':str(Path(tempfile.gettempdir()).resolve()),
               'TANSY_CHROMA_MODE':'http','TANSY_CHROMA_URL':'http://chroma:8000',
               'TANSY_OLLAMA_URL':'http://ollama:11434'}
        settings = Settings.from_env(env)
        self.assertEqual(settings.chroma_mode, 'http')
        self.assertEqual(settings.chroma_url, 'http://chroma:8000')
        for key, value in [('TANSY_CHUNK_SIZE','0'), ('TANSY_CHUNK_OVERLAP','1000'), ('TANSY_BATCH_SIZE','-1')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                Settings.from_env({**env, key:value})

    def test_production_requires_absolute_storage_and_explicit_servers(self):
        from indexing.settings import Settings
        for env in [
            {'TANSY_ENV': 'production'},
            {'TANSY_ENV': 'production', 'TANSY_DATA_ROOT': 'relative'},
            {'TANSY_ENV': 'production', 'TANSY_DATA_ROOT': str(Path(tempfile.gettempdir()).resolve()), 'TANSY_CHROMA_MODE': 'embedded'},
        ]:
            with self.subTest(env=env):
                with self.assertRaises(ValueError):
                    Settings.from_env(env)

    def test_data_root_is_independent_of_working_directory(self):
        try:
            Settings = importlib.import_module('indexing.settings').Settings
        except ImportError:
            self.fail('The indexing Settings interface is not implemented')
        first = Settings.from_env({})
        previous = Path.cwd()
        with tempfile.TemporaryDirectory() as directory:
            try:
                os.chdir(directory)
                second = Settings.from_env({})
            finally:
                os.chdir(previous)
        self.assertEqual(first.data_root, second.data_root)
        self.assertTrue(first.data_root.is_absolute())
        self.assertEqual(first.data_root.parent, Path(__file__).resolve().parents[1])


class CatalogTests(unittest.TestCase):
    def test_activation_is_atomic_idempotent_and_generation_checked(self):
        try:
            from indexing.catalog import Catalog
        except ImportError:
            self.fail('Durable publication catalog is not implemented')
        from indexing.settings import Settings
        with tempfile.TemporaryDirectory() as directory:
            catalog = Catalog(Settings(Path(directory)))
            for revision in ['one','two']:
                catalog.save_revision({'id':revision,'kb':'tansam','state':'ready','collection':revision})
            self.assertEqual(catalog.active('tansam'), {'revision':None,'generation':0})
            first = catalog.activate('tansam','one',0,'op-one','owner','initial','publish')
            self.assertEqual(catalog.activate('tansam','one',0,'op-one','owner','initial','publish'), first)
            with self.assertRaises(ValueError):
                catalog.activate('tansam','two',0,'op-two','owner','stale','publish')
            with self.assertRaises(ValueError):
                catalog.activate('tansam','two',1,'op-one','owner','reuse','publish')
            self.assertEqual(Catalog(Settings(Path(directory))).active('tansam'), {'revision':'one','generation':1})
            catalog.activate('tansam','two',1,'op-two','owner','replacement','publish')
            catalog.activate('tansam','one',2,'op-back','owner','restore','rollback')
            self.assertEqual(catalog.active('tansam'), {'revision':'one','generation':3})

    def test_unverified_or_other_owner_revision_cannot_be_published(self):
        try:
            from indexing.catalog import Catalog
        except ImportError:
            self.fail('Durable publication catalog is not implemented')
        from indexing.settings import Settings
        with tempfile.TemporaryDirectory() as directory:
            catalog = Catalog(Settings(Path(directory)))
            catalog.save_revision({'id':'draft','kb':'tansam','state':'staging'})
            catalog.save_revision({'id':'foreign','kb':'other','state':'ready'})
            for revision in ['draft','foreign','missing']:
                with self.subTest(revision=revision), self.assertRaises(ValueError):
                    catalog.activate('tansam',revision,0,revision,'owner','test','publish')
            self.assertEqual(catalog.active('tansam')['generation'], 0)


if __name__ == '__main__':
    unittest.main()
