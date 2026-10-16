"""Approved byte snapshots and deterministic, provenance-preserving chunks."""
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from .catalog import canonical
from .errors import IndexingError


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else canonical(value).encode('utf-8')).hexdigest()


def atomic_write(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix='.write-')
    try:
        with os.fdopen(descriptor, 'wb') as output:
            output.write(content)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
        if os.name != 'nt':
            directory = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
            try: os.fsync(directory)
            finally: os.close(directory)
    finally:
        if os.path.exists(temporary): os.unlink(temporary)


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,63}', value):
        raise IndexingError('manifest', 'Invalid knowledge/source identifier')
    return value


def load_manifest(path, settings):
    path = Path(path).resolve()
    try:
        with path.open('rb') as source: raw = source.read(1024 * 1024 + 1)
        if len(raw) > 1024 * 1024: raise ValueError('large')
        value = json.loads(raw)
        if not isinstance(value, dict) or value.get('schema_version') != 1: raise ValueError('schema')
        identifier(value.get('kb'))
        if not isinstance(value.get('owner'), str) or not value['owner'].strip() or len(value['owner']) > 128: raise ValueError('owner')
        sources = value['sources']
        if not isinstance(sources, list) or not 1 <= len(sources) <= settings.max_sources: raise ValueError('sources')
        seen = set()
        for source in sources:
            sid = identifier(source.get('source_id'))
            if sid in seen: raise ValueError('duplicate')
            seen.add(sid)
            if source.get('format') not in ('txt', 'md', 'pdf'): raise ValueError('format')
            if not re.fullmatch('[0-9a-f]{64}', source.get('sha256', '')): raise ValueError('hash')
            if not isinstance(source.get('approved_by'), str) or not source['approved_by'].strip(): raise ValueError('approval')
            stamp = datetime.fromisoformat(source['approved_at'])
            if stamp.tzinfo is None: raise ValueError('timezone')
            if not isinstance(source.get('path'), str) or not source['path']: raise ValueError('path')
            if not isinstance(source.get('name'), str) or not source['name'].strip(): raise ValueError('name')
        retirements = value.setdefault('retirements', [])
        if not isinstance(retirements, list): raise ValueError('retirements')
        retired = set()
        for entry in retirements:
            sid = identifier(entry.get('source_id'))
            if sid in seen or sid in retired or not isinstance(entry.get('reason'), str) or not entry['reason'].strip(): raise ValueError('retirement')
            retired.add(sid)
        value['_base'] = str(path.parent)
        return value
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        raise IndexingError('manifest', 'Invalid manifest, approval, or unsupported source format') from error


def prepare_sources(manifest, settings):
    prepared, total = [], 0
    for item in manifest['sources']:
        path = Path(manifest['_base']) / item['path']
        try:
            if not path.is_file(): raise OSError('not a regular file')
            with path.open('rb') as source: raw = source.read(settings.max_source_bytes + 1)
        except OSError as error:
            raise IndexingError('source_unreadable', 'An approved source cannot be read') from error
        total += len(raw)
        if len(raw) > settings.max_source_bytes or total > settings.max_build_bytes:
            raise IndexingError('source_limit', 'Source bytes exceed the configured limit')
        if digest(raw) != item['sha256']:
            raise IndexingError('approval_hash', 'Source bytes do not match the approved revision')
        archive = settings.data_root / 'sources' / (item['sha256'] + '.' + item['format'])
        atomic_write(archive, raw)
        if item['format'] == 'pdf':
            with tempfile.TemporaryDirectory(dir=settings.data_root) as temporary:
                output = Path(temporary) / 'extracted.json'
                try:
                    result = subprocess.run([sys.executable, str(Path(__file__).with_name('pdf_worker.py')), str(archive), str(output), str(settings.max_pdf_pages), str(settings.max_characters)],
                                            capture_output=True, timeout=settings.extraction_timeout, check=False)
                except subprocess.TimeoutExpired as error:
                    raise IndexingError('extraction_timeout', 'Document extraction exceeded its deadline') from error
                if result.returncode or not output.is_file():
                    raise IndexingError('pdf_extraction', 'PDF is unreadable, encrypted, scanned, or exceeds extraction limits')
                pages = json.loads(output.read_text(encoding='utf-8'))
        else:
            try: pages = [raw.decode('utf-8-sig').replace('\r\n', '\n').replace('\r', '\n')]
            except UnicodeDecodeError as error: raise IndexingError('encoding', 'Text sources must use valid UTF-8') from error
        text = '\n'.join(pages)
        if not text.strip(): raise IndexingError('empty_source', 'Source contains no usable text; scanned PDFs require OCR')
        if len(text) > settings.max_characters: raise IndexingError('text_limit', 'Extracted text exceeds the configured limit')
        prepared.append({**item, 'archive': str(archive), 'text': text, 'pages': pages, 'text_sha256': digest(text.encode('utf-8'))})
    return prepared


def chunks_for_sources(sources, settings):
    chunks = []
    for source in sources:
        ordinal = 0
        for page, text in enumerate(source['pages'], 1):
            section, lines, sections = '', [], []
            for line in text.splitlines():
                heading = re.match(r'^#{1,6}\s+(.+)', line)
                is_upper = line.strip().isupper() and len(line.strip()) < 160 and not line.lstrip().startswith(('-', '*'))
                if heading or is_upper:
                    if lines or section: sections.append((section, '\n'.join(lines).strip()))
                    section, lines = (heading.group(1).strip() if heading else line.strip()), []
                else: lines.append(line)
            if lines or section: sections.append((section, '\n'.join(lines).strip()))
            for section, body in sections:
                if not body and not section: continue
                # Headings are retained even for heading-only sections.
                body = body or section
                start = 0
                while start < len(body):
                    end = min(start + settings.chunk_size, len(body))
                    if end < len(body):
                        boundary = body.rfind('\n', start + settings.chunk_size // 2, end)
                        if boundary > start + settings.chunk_overlap: end = boundary + 1
                    text_chunk = ((section + '\n') if section else '') + body[start:end]
                    chunks.append({'source_id': source['source_id'], 'source': source['name'], 'source_sha256': source['sha256'],
                                   'approved_by': source['approved_by'], 'approved_at': source['approved_at'],
                                   'section': section, 'page': page, 'ordinal': ordinal, 'start': start, 'end': end, 'text': text_chunk})
                    if len(chunks) > settings.max_chunks: raise IndexingError('chunk_limit', 'Build exceeds the chunk limit')
                    ordinal += 1
                    if end == len(body): break
                    start = end - settings.chunk_overlap
    if not chunks: raise IndexingError('empty_index', 'No usable chunks were generated')
    return chunks
