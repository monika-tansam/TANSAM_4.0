"""Single-VPS indexing operations. Builds never mutate published collections."""
from contextlib import contextmanager
import importlib.metadata
import json
import logging
import math
from pathlib import Path
import shutil
import time
import uuid

from filelock import FileLock, Timeout

from .catalog import Catalog, canonical, now
from .documents import atomic_write, chunks_for_sources, digest, identifier, load_manifest, prepare_sources
from .embedding import OllamaEmbeddings, remaining, validate_vectors
from .errors import IndexingError
from .store import VectorStore

LOG = logging.getLogger('tansy.indexing')


class IndexingService:
    def __init__(self, settings, embedder=None, store=None):
        self.settings = settings
        self.catalog = Catalog(settings)
        self.embedder = embedder or OllamaEmbeddings(settings)
        self._store = store

    @property
    def store(self):
        if self._store is None:
            try: self._store = VectorStore(self.settings)
            except IndexingError: raise
            except Exception as error: raise IndexingError('vector_unavailable', 'Vector service is unavailable') from error
        return self._store

    @contextmanager
    def writer(self, kb):
        identifier(kb)
        directory = self.settings.data_root / 'locks'
        directory.mkdir(parents=True, exist_ok=True)
        # One root-wide writer also coordinates cross-KB backup and restore.
        lock = FileLock(directory / 'writer.lock')
        try: lock.acquire(timeout=0)
        except Timeout as error: raise IndexingError('busy', 'Another indexing operation holds the writer lock') from error
        try: yield
        finally: lock.release()

    def _progress(self, job, phase, **values):
        job.update(phase=phase, updated_at=now(), **values)
        self.catalog.save_job(job)
        LOG.info(canonical({key: job[key] for key in ('id', 'kb', 'state', 'phase', 'updated_at', 'chunk_count', 'cache_hits') if key in job}))

    def validate(self, manifest_path):
        manifest = load_manifest(manifest_path, self.settings)
        sources = prepare_sources(manifest, self.settings)
        chunks = chunks_for_sources(sources, self.settings)
        return {'kb': manifest['kb'], 'source_count': len(sources), 'chunk_count': len(chunks), 'sources': [source['source_id'] for source in sources]}

    def build(self, manifest_path):
        manifest = load_manifest(manifest_path, self.settings)
        kb = manifest['kb']
        deadline = time.monotonic() + self.settings.build_timeout
        with self.writer(kb):
            base = self.catalog.active(kb)
            rid = uuid.uuid4().hex
            job = {'id': uuid.uuid4().hex, 'kb': kb, 'state': 'running', 'revision': rid,
                   'base_generation': base['generation'], 'started_at': now(), 'chunk_count': 0, 'cache_hits': 0}
            self._progress(job, 'validate')
            try:
                if shutil.disk_usage(self.settings.data_root).free < self.settings.min_free_bytes + self.settings.max_build_bytes:
                    raise IndexingError('storage_capacity', 'Insufficient free space for a safe build')
                if base['revision']:
                    previous = self.catalog.revision(base['revision'])
                    old = {source['source_id'] for source in previous['sources']}
                    current = {source['source_id'] for source in manifest['sources']}
                    retired = {entry['source_id'] for entry in manifest['retirements']}
                    if previous['owner'] != manifest['owner'] or old - current != retired:
                        raise IndexingError('source_set', 'Owner changes or omitted sources require an explicit reviewed retirement')
                elif manifest['retirements']:
                    raise IndexingError('source_set', 'Cannot retire sources without a published baseline')
                sources = prepare_sources(manifest, self.settings)
                remaining(deadline)
                profile = self.embedder.profile(deadline)
                processing = {'parser': 'source-v1', 'pdf': importlib.metadata.version('pypdf'), 'chunker': 'sections-v1',
                              'chunk_size': self.settings.chunk_size, 'overlap': self.settings.chunk_overlap}
                summaries = [{key: source[key] for key in ('source_id', 'name', 'format', 'sha256', 'approved_by', 'approved_at', 'text_sha256')} for source in sources]
                fingerprint = digest({'kb': kb, 'owner': manifest['owner'], 'sources': sorted(summaries, key=lambda value: value['source_id']), 'profile': profile, 'processing': processing})
                for prior in self.catalog.list('revisions', kb):
                    if prior.get('fingerprint') == fingerprint and prior['state'] == 'ready' and (prior['id'] == base['revision'] or prior['base_generation'] == base['generation']):
                        try: self.verify(prior['id'], deadline)
                        except IndexingError as error:
                            if error.code in ('embedding_vector', 'verification'): continue
                            raise
                        self._progress(job, 'complete', state='unchanged', revision=prior['id'], source_count=len(sources), chunk_count=len(prior['records']))
                        return job
                chunks = chunks_for_sources(sources, self.settings)
                if shutil.disk_usage(self.settings.data_root).free < self.settings.min_free_bytes + len(chunks) * profile['dimension'] * 32:
                    raise IndexingError('storage_capacity', 'Insufficient free space for staging vectors and cache')
                revision = {'id': rid, 'kb': kb, 'owner': manifest['owner'], 'state': 'staging', 'collection': 'tansy-' + digest(kb)[:12] + '-' + rid[:24],
                            'base_generation': base['generation'], 'fingerprint': fingerprint, 'profile': profile, 'processing': processing,
                            'sources': summaries, 'retirements': manifest['retirements'], 'records': [], 'created_at': now()}
                self.catalog.save_revision(revision)
                self.store.create(revision['collection'], deadline)
                for offset in range(0, len(chunks), self.settings.batch_size):
                    remaining(deadline)
                    batch = chunks[offset:offset + self.settings.batch_size]
                    keys = [digest({'profile': profile, 'processing': processing, 'input': chunk['text']}) for chunk in batch]
                    cached = []
                    for key in keys:
                        try:
                            value = self.catalog.cached(key)
                            cached.append(validate_vectors([value], 1, profile['dimension'])[0] if value is not None else None)
                        except (ValueError, TypeError): cached.append(None)
                    missing = [i for i, vector in enumerate(cached) if vector is None]
                    vectors = self.embedder.embed([batch[i]['text'] for i in missing], profile, deadline=deadline) if missing else []
                    for i, vector in zip(missing, vectors):
                        cached[i] = vector
                        self.catalog.cache(keys[i], vector)
                    job['cache_hits'] += len(batch) - len(missing)
                    rows = []
                    for chunk, vector, key in zip(batch, cached, keys):
                        metadata = {field: value for field, value in chunk.items() if field != 'text'}
                        metadata.update(user_id=manifest['owner'], profile=digest(profile), processing=digest(processing))
                        record = {'id': digest([chunk['source_id'], chunk['source_sha256'], chunk['ordinal'], profile, processing]),
                                  'text': chunk['text'], 'metadata': metadata, 'cache_key': key}
                        revision['records'].append(record)
                        rows.append({**record, 'vector': vector})
                    self.store.write(revision['collection'], rows, deadline)
                    self._progress(job, 'index', chunk_count=len(revision['records']))
                self.catalog.save_revision(revision)
                self.verify(rid, deadline, allow_staging=True)
                report = {'revision': rid, 'source_count': len(sources), 'chunk_count': len(chunks), 'profile': profile,
                          'verified_at': now(), 'versions': {name: importlib.metadata.version(name) for name in ('chromadb', 'pypdf', 'requests')}}
                atomic_write(self.settings.data_root / 'reports' / (rid + '.json'), canonical(report).encode())
                revision['state'] = 'ready'
                revision['verified_at'] = report['verified_at']
                self.catalog.save_revision(revision)
                self._progress(job, 'complete', state='ready', source_count=len(sources), chunk_count=len(chunks))
                return job
            except Exception as error:
                code = error.code if isinstance(error, IndexingError) else 'build_failed'
                try: self._progress(job, 'failed', state='failed', error=code)
                except Exception: LOG.error(canonical({'id': job['id'], 'error': 'catalog_write_failed'}))
                if isinstance(error, IndexingError):
                    error.job_id = job['id']
                    raise
                raise IndexingError(code, 'Build failed; published knowledge was preserved', job['id']) from error

    def verify(self, revision_id, deadline=None, allow_staging=False):
        deadline = deadline or time.monotonic() + self.settings.build_timeout
        with self.store.bounded(deadline):
            return self._verify(revision_id, deadline, allow_staging)

    def _verify(self, revision_id, deadline, allow_staging):
        revision = self.catalog.revision(revision_id)
        if revision['state'] != 'ready' and not (allow_staging and revision['state'] == 'staging'):
            raise IndexingError('not_ready', 'Revision is not verified')
        self.embedder.check(revision['profile'], deadline)
        records = {row['id']: row for row in revision['records']}
        if not records or len(records) != len(revision['records']) or self.store.count(revision['collection']) != len(records):
            raise IndexingError('verification', 'Staged vector record count does not match the manifest')
        seen = set()
        for offset in range(0, len(records), 100):
            remaining(deadline)
            for row in self.store.read(revision['collection'], offset, 100):
                expected = records.get(row['id'])
                if expected is None or row['id'] in seen or row['text'] != expected['text'] or row['metadata'] != expected['metadata']:
                    raise IndexingError('verification', 'Stored document or provenance does not match the revision')
                validate_vectors([row['vector']], 1, revision['profile']['dimension'])
                vector = self.catalog.cached(expected['cache_key'])
                validate_vectors([vector], 1, revision['profile']['dimension'])
                if any(not math.isclose(left, right, rel_tol=1e-5, abs_tol=1e-7) for left, right in zip(row['vector'], vector)):
                    raise IndexingError('verification', 'Stored vector differs from its verified embedding')
                seen.add(row['id'])
        if seen != set(records): raise IndexingError('verification', 'Stored record IDs do not match the revision')
        return {'revision': revision_id, 'verified': True, 'chunk_count': len(records)}

    def publish(self, kb, revision_id, expected_generation, operation_id, actor, reason):
        with self.writer(kb):
            recorded = self.catalog.recorded_activation(kb, revision_id, expected_generation, operation_id, actor, reason, 'publish')
            if recorded is not None: return recorded
            revision = self.catalog.revision(revision_id)
            if revision.get('base_generation') != expected_generation:
                raise IndexingError('stale_generation', 'Revision was built against another generation')
            self.verify(revision_id, time.monotonic() + self.settings.request_timeout)
            return self.catalog.activate(kb, revision_id, expected_generation, operation_id, actor, reason, 'publish')

    def rollback(self, kb, revision_id, expected_generation, operation_id, actor, reason):
        with self.writer(kb):
            recorded = self.catalog.recorded_activation(kb, revision_id, expected_generation, operation_id, actor, reason, 'rollback')
            if recorded is not None: return recorded
            if not self.catalog.was_published(kb, revision_id):
                raise IndexingError('rollback_target', 'Rollback requires a previously published revision')
            self.verify(revision_id, time.monotonic() + self.settings.request_timeout)
            return self.catalog.activate(kb, revision_id, expected_generation, operation_id, actor, reason, 'rollback')

    def recover(self, kb):
        with self.writer(kb):
            interrupted = []
            for job in self.catalog.list('jobs', kb):
                if job['state'] == 'running':
                    self._progress(job, 'interrupted', state='interrupted', error='process_interrupted')
                    interrupted.append(job['id'])
            return {'kb': kb, 'interrupted': interrupted}

    def status(self, kb):
        identifier(kb)
        active = self.catalog.active(kb)
        revision = self.catalog.revision(active['revision']) if active['revision'] else None
        if revision:
            revision['chunk_count'] = len(revision['records'])
            del revision['records']
        return {'kb': kb, 'active': active, 'revision': revision,
                'jobs': self.catalog.list('jobs', kb)}

    def read(self, kb, question, owner, top_k=6):
        active = self.catalog.active(identifier(kb))
        if not active['revision']: raise IndexingError('knowledge_unavailable', 'No verified knowledge has been published')
        revision = self.catalog.revision(active['revision'])
        if revision['state'] != 'ready' or revision['owner'] != owner:
            raise IndexingError('knowledge_unavailable', 'Published knowledge is unavailable for this owner')
        deadline = time.monotonic() + self.settings.request_timeout
        vector = self.embedder.embed([question], revision['profile'], query=True, deadline=deadline)[0]
        try:
            with self.store.bounded(deadline):
                if self.store.count(revision['collection']) != len(revision['records']):
                    raise IndexingError('knowledge_unavailable', 'Published index integrity check failed')
                return self.store.query(revision['collection'], vector, owner, top_k)
        except IndexingError: raise
        except Exception as error: raise IndexingError('knowledge_unavailable', 'Published vector service is unavailable') from error
