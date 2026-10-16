"""Explicit offline migration and portable, verified catalog backups."""
from dataclasses import replace
from contextlib import closing, contextmanager
import json
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
import uuid

from .catalog import Catalog, canonical, now
from .documents import atomic_write, digest, load_manifest, prepare_sources
from .embedding import validate_vectors
from .errors import IndexingError
from .service import IndexingService


@contextmanager
def readonly(path):
    with closing(sqlite3.connect(Path(path).resolve().as_uri() + '?mode=ro', uri=True)) as connection:
        yield connection


class Operations:
    def __init__(self, service):
        self.service = service
        self.settings = service.settings

    def inventory_legacy(self, directory):
        path = Path(directory).resolve() / 'chroma.sqlite3'
        try:
            with readonly(path) as con:
                collections = [{'id': row[0], 'name': row[1]} for row in con.execute('SELECT id,name FROM collections')]
            return {'path': str(path.parent), 'collections': collections, 'historical_model_digest': 'unknown', 'modified': False}
        except sqlite3.Error as error: raise IndexingError('legacy_inventory', 'Cannot inspect the legacy catalog read-only') from error

    def migrate_legacy(self, directory, manifest_path, checks, quiesced=False):
        if not quiesced: raise IndexingError('legacy_offline', 'Stop all legacy writers and explicitly confirm quiescence')
        if not isinstance(checks, list) or not checks or len(checks) > 100 or any(not isinstance(check, dict) or not isinstance(check.get('question'), str) or not check['question'].strip() or not isinstance(check.get('contains'), str) or not check['contains'].strip() for check in checks):
            raise IndexingError('legacy_checks', 'Approved query/excerpt compatibility checks are required')
        manifest = load_manifest(manifest_path, self.settings)
        kb = manifest['kb']
        source_root = Path(directory).resolve()
        if source_root == self.settings.data_root.resolve() or source_root in self.settings.data_root.resolve().parents:
            raise IndexingError('legacy_path', 'Legacy and new storage must be separate')
        with self.service.writer(kb):
            if self.service.catalog.list('revisions', kb) or self.service.catalog.active(kb)['revision']:
                raise IndexingError('legacy_target', 'Legacy migration requires an empty knowledge-base catalog')
            inventory = self.inventory_legacy(source_root)
            if [item['name'] for item in inventory['collections']] != ['documents']:
                raise IndexingError('legacy_scope', 'Review unexpected legacy collections before migration')
            sources = prepare_sources(manifest, self.settings)
            by_name = {source['name']: source for source in sources}
            if len(by_name) != len(sources): raise IndexingError('legacy_scope', 'Legacy source names must be unique')
            with tempfile.TemporaryDirectory(dir=self.settings.data_root) as temporary:
                clone = Path(temporary) / 'legacy'; clone.mkdir()
                # SQLite backup is consistent; HNSW files require the explicit offline prerequisite.
                with readonly(source_root / 'chroma.sqlite3') as source, closing(sqlite3.connect(clone / 'chroma.sqlite3')) as target:
                    source.backup(target)
                for child in source_root.iterdir():
                    if child.is_dir() and len(child.name) == 36:
                        try: uuid.UUID(child.name)
                        except ValueError: continue
                        if child.is_symlink(): raise IndexingError('legacy_path', 'Legacy index symlinks are unsupported')
                        shutil.copytree(child, clone / child.name)
                exported = Path(temporary) / 'records.jsonl'
                try:
                    result = subprocess.run([sys.executable, str(Path(__file__).with_name('legacy_worker.py')), str(clone), str(exported), str(self.settings.max_chunks)],
                                            capture_output=True, timeout=self.settings.build_timeout)
                except subprocess.TimeoutExpired as error: raise IndexingError('legacy_timeout', 'Legacy export exceeded its deadline') from error
                if result.returncode or not exported.is_file(): raise IndexingError('legacy_export', 'Legacy copy could not be exported')
                rows = [json.loads(line) for line in exported.read_text(encoding='utf-8').splitlines()]
            profile = {**self.service.embedder.profile(), 'historical_digest': 'unknown', 'document_prefix': '', 'query_prefix': '',
                       'normalization': 'legacy-unmodified', 'api': '/api/embeddings'}
            processing = {'parser': 'legacy-unchanged', 'chunker': 'legacy-unchanged'}
            rid = uuid.uuid4().hex
            revision = {'id': rid, 'kb': kb, 'owner': manifest['owner'], 'state': 'staging', 'collection': 'tansy-' + digest(kb)[:12] + '-' + rid[:24],
                        'base_generation': 0, 'profile': profile, 'processing': processing, 'created_at': now(),
                        'sources': [{key: source[key] for key in ('source_id', 'name', 'format', 'sha256', 'approved_by', 'approved_at', 'text_sha256')} for source in sources], 'records': []}
            represented = set()
            for row in rows:
                meta = row.get('metadata') or {}
                source = by_name.get(meta.get('source'))
                if not source or meta.get('user_id') != manifest['owner'] or not isinstance(row.get('text'), str) or not row['text'].strip():
                    raise IndexingError('legacy_scope', 'Legacy source/owner records require explicit review')
                represented.add(source['source_id'])
                validate_vectors([row['vector']], 1, profile['dimension'])
                row['cache_key'] = digest(['legacy', rid, row['id']])
                revision['records'].append({key: row[key] for key in ('id', 'text', 'metadata', 'cache_key')})
                self.service.catalog.cache(row['cache_key'], row['vector'])
            if represented != {source['source_id'] for source in sources}:
                raise IndexingError('legacy_scope', 'Legacy index does not represent the full approved source set')
            self.service.catalog.save_revision(revision)
            self.service.store.create(revision['collection'])
            deadline = time.monotonic() + self.settings.build_timeout
            self.service.store.write(revision['collection'], rows, deadline)
            self.service.verify(rid, deadline, allow_staging=True)
            for check in checks:
                vector = self.service.embedder.embed([check['question']], profile, query=True, deadline=deadline)[0]
                hits = self.service.store.query(revision['collection'], vector, manifest['owner'], 6)
                if not any(check['contains'].casefold() in hit['text'].casefold() for hit in hits):
                    raise IndexingError('legacy_compatibility', 'Legacy query compatibility check failed')
            revision.update(state='ready', verified_at=now(), compatibility_checks=checks)
            self.service.catalog.save_revision(revision)
            return {'revision': rid, 'state': 'ready', 'chunk_count': len(rows), 'historical_digest': 'unknown', 'published': False}

    def backup(self, destination):
        destination = Path(destination).resolve()
        root = self.settings.data_root.resolve()
        if destination == root or root in destination.parents or destination.exists():
            raise IndexingError('backup_path', 'Backup destination must be new and outside the data root')
        with self.service.writer('maintenance'):
            destination.mkdir(parents=True)
            with self.service.catalog.connection() as source, closing(sqlite3.connect(destination / 'catalog.sqlite3')) as target:
                source.backup(target)
            for name in ('sources', 'reports'):
                if (root / name).exists(): shutil.copytree(root / name, destination / name)
            files = {str(path.relative_to(destination).as_posix()): digest(path.read_bytes()) for path in destination.rglob('*') if path.is_file()}
            atomic_write(destination / 'backup.json', canonical({'schema_version': 1, 'created_at': now(), 'files': files}).encode())
            return {'backup': str(destination), 'file_count': len(files)}

    def restore(self, backup, offline=False):
        if not offline: raise IndexingError('restore_offline', 'Stop API and workers before explicitly restoring offline')
        backup = Path(backup).resolve()
        root = self.settings.data_root.resolve()
        with self.service.writer('maintenance'):
            if self.service.catalog.list('revisions') or self.service.catalog.list('jobs'):
                raise IndexingError('restore_target', 'Restore requires a fresh catalog')
            try:
                inventory = json.loads((backup / 'backup.json').read_text(encoding='utf-8'))
                files = inventory['files']
                if inventory['schema_version'] != 1 or not isinstance(files, dict) or 'catalog.sqlite3' not in files: raise ValueError('schema')
                for name, expected in files.items():
                    path = backup / name
                    if path.is_symlink() or backup not in path.resolve().parents or digest(path.read_bytes()) != expected:
                        raise ValueError('integrity')
                    if name != 'catalog.sqlite3' and (len(Path(name).parts) != 2 or Path(name).parts[0] not in ('sources', 'reports')): raise ValueError('path')
            except (OSError, ValueError, TypeError, KeyError) as error:
                raise IndexingError('backup_integrity', 'Backup inventory, paths, or checksums are invalid') from error
            # Verify using a disposable catalog; install its active pointer last.
            with tempfile.TemporaryDirectory(dir=root) as temporary:
                stage = Path(temporary)
                shutil.copyfile(backup / 'catalog.sqlite3', stage / 'catalog.sqlite3')
                staged = IndexingService(replace(self.settings, data_root=stage), embedder=self.service.embedder, store=self.service.store)
                revisions = staged.catalog.list('revisions')
                for revision in revisions:
                    if revision['state'] != 'ready': continue
                    rows = []
                    for row in revision['records']:
                        vector = staged.catalog.cached(row['cache_key'])
                        validate_vectors([vector], 1, revision['profile']['dimension'])
                        rows.append({**row, 'vector': vector})
                    try: self.service.store._collection(revision['collection'])
                    except IndexingError: self.service.store.create(revision['collection'])
                    else:
                        # Existing collections are never overwritten during restore.
                        staged.verify(revision['id'])
                        continue
                    self.service.store.write(revision['collection'], rows)
                    staged.verify(revision['id'])
                with staged.catalog.connection() as con:
                    if con.execute('PRAGMA integrity_check').fetchone()[0] != 'ok': raise IndexingError('backup_integrity', 'Catalog integrity failed')
                    active = con.execute('SELECT revision FROM active').fetchall()
                    for (rid,) in active: staged.verify(rid)
                for name in files:
                    if name != 'catalog.sqlite3': atomic_write(root / name, (backup / name).read_bytes())
                # Fresh catalog connections are short lived; checkpoint before atomic replacement.
                with self.service.catalog.connection() as con: con.execute('PRAGMA wal_checkpoint(TRUNCATE)')
                with staged.catalog.connection() as con: con.execute('PRAGMA wal_checkpoint(TRUNCATE)')
                atomic_write(root / 'catalog.sqlite3', (stage / 'catalog.sqlite3').read_bytes())
            return {'restored_revisions': sum(rev['state'] == 'ready' for rev in revisions), 'active_count': len(active)}
