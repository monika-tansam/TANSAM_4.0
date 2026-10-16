"""Durable single-VPS catalog. Published versions change in one transaction."""
from contextlib import contextmanager
from datetime import datetime, timezone
import json
import sqlite3

from .errors import IndexingError


def now():
    return datetime.now(timezone.utc).isoformat()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


class Catalog:
    def __init__(self, settings):
        settings.data_root.mkdir(parents=True, exist_ok=True)
        self.path = settings.data_root / 'catalog.sqlite3'
        with self.connection() as con:
            version = con.execute('PRAGMA user_version').fetchone()[0]
            if version not in (0, 1):
                raise IndexingError('schema_version', 'Unsupported catalog schema')
            con.executescript('''
                CREATE TABLE IF NOT EXISTS revisions(id TEXT PRIMARY KEY,kb TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,kb TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS active(kb TEXT PRIMARY KEY,revision TEXT NOT NULL REFERENCES revisions(id),generation INTEGER NOT NULL);
                CREATE TABLE IF NOT EXISTS events(operation_id TEXT PRIMARY KEY,request TEXT NOT NULL,result TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS cache(key TEXT PRIMARY KEY,payload TEXT NOT NULL);
                PRAGMA user_version=1;
            ''')

    @contextmanager
    def connection(self):
        con = sqlite3.connect(self.path, timeout=5)
        try:
            con.execute('PRAGMA journal_mode=WAL')
            con.execute('PRAGMA synchronous=FULL')
            con.execute('PRAGMA foreign_keys=ON')
            with con:
                yield con
        finally:
            con.close()

    def _save(self, table, value):
        with self.connection() as con:
            con.execute(f'INSERT INTO {table}(id,kb,state,payload) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload',
                        (value['id'], value['kb'], value['state'], canonical(value)))

    def save_revision(self, value):
        self._save('revisions', value)

    def save_job(self, value):
        self._save('jobs', value)

    def _get(self, table, identifier):
        with self.connection() as con:
            row = con.execute(f'SELECT payload FROM {table} WHERE id=?', (identifier,)).fetchone()
        if not row:
            raise IndexingError('not_found', 'Record not found')
        return json.loads(row[0])

    def revision(self, identifier):
        return self._get('revisions', identifier)

    def job(self, identifier):
        return self._get('jobs', identifier)

    def list(self, table, kb=None):
        if table not in ('revisions', 'jobs'):
            raise ValueError('Unknown catalog table')
        with self.connection() as con:
            rows = con.execute(f'SELECT payload FROM {table}' + (' WHERE kb=?' if kb else ''), (kb,) if kb else ()).fetchall()
        return [json.loads(row[0]) for row in rows]

    def active(self, kb):
        with self.connection() as con:
            row = con.execute('SELECT revision,generation FROM active WHERE kb=?', (kb,)).fetchone()
        return {'revision': row[0], 'generation': row[1]} if row else {'revision': None, 'generation': 0}

    def activate(self, kb, revision, expected_generation, operation_id, actor, reason, action):
        request = canonical([kb, revision, expected_generation, operation_id, actor, reason, action])
        with self.connection() as con:
            con.execute('BEGIN IMMEDIATE')
            old = con.execute('SELECT request,result FROM events WHERE operation_id=?', (operation_id,)).fetchone()
            if old:
                if old[0] != request:
                    raise IndexingError('operation_conflict', 'Operation ID already used with different arguments')
                return json.loads(old[1])
            target = con.execute('SELECT kb,state FROM revisions WHERE id=?', (revision,)).fetchone()
            if not target or target != (kb, 'ready'):
                raise IndexingError('not_ready', 'Revision is not verified for this knowledge base')
            current = con.execute('SELECT generation FROM active WHERE kb=?', (kb,)).fetchone()
            if (current[0] if current else 0) != expected_generation:
                raise IndexingError('stale_generation', 'Active generation changed; review the current source set')
            result = {'kb': kb, 'revision': revision, 'generation': expected_generation + 1, 'operation_id': operation_id, 'action': action}
            con.execute('INSERT INTO active VALUES(?,?,?) ON CONFLICT(kb) DO UPDATE SET revision=excluded.revision,generation=excluded.generation', (kb, revision, result['generation']))
            con.execute('INSERT INTO events VALUES(?,?,?)', (operation_id, request, canonical(result)))
        return result

    def cached(self, key):
        with self.connection() as con:
            row = con.execute('SELECT payload FROM cache WHERE key=?', (key,)).fetchone()
        return json.loads(row[0]) if row else None

    def cache(self, key, vector):
        with self.connection() as con:
            con.execute('INSERT OR REPLACE INTO cache VALUES(?,?)', (key, canonical(vector)))
