"""Opt-in acceptance probe for a locally activated chatbot, never run by discovery.

Uses the real HTTP/SSE endpoint and records answers for human review. Pattern
checks are regression signals, not a guarantee of semantic correctness.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.parse import urlsplit

import requests

BACKEND = Path(__file__).resolve().parents[1]
CASES = [
    ('official-email', 'What is the official TANSAM email address?', [r'info@tansam\.in']),
    ('hr-email', 'Which email address can I use to contact TANSAM HR?', [r'hr@tansam\.org']),
    ('office-hours', 'What are TANSAM office opening hours?', [r'9(?::00)?\s*am', r'6(?::00)?\s*pm']),
    ('consultation', 'Does 24-hour consultation mean the TANSAM office is open all night?', [r'24', r'9(?::00)?\s*am', r'6(?::00)?\s*pm']),
    ('address', 'What is the complete TANSAM office address?', [r'anna university', r'kotturpuram', r'600025']),
    ('phones', 'List all three telephone numbers in the TANSAM documentation.', [r'98840\s*35145', r'96000\s*91359', r'2254\s*0000']),
    ('labs', 'How many innovation labs does TANSAM have, and which center uses Siemens Teamcenter?', [r'\b(?:9|nine)\b', r'(?:plm|product lifecycle)', r'teamcenter']),
    ('internship', 'Does the TANSAM internship include hands-on AI or machine learning work?', [r'(?:hands.on|practical)', r'(?:\bai\b|artificial intelligence|machine learning)']),
    ('inauguration', 'Who inaugurated TANSAM, on what date, and at which location?', [r'stalin', r'former', r'8\s+november\s+2022|november\s+8,?\s+2022', r'tidel\s+park']),
    ('relocation', 'In which year did TANSAM relocate to Anna University, and where is its office now?', [r'2026', r'anna university']),
    ('unknown-fee', 'What is the exact current TANSAM internship fee in rupees?', [r'(?:couldn.t find|not (?:specified|provided|mentioned|available|found)|don.t have|no (?:details|information))']),
    ('unknown-ceo', 'Who is the current CEO of TANSAM? Give the full name.', [r'(?:couldn.t find|not (?:specified|provided|mentioned|available|found)|don.t have|no (?:details|information))']),
]


def ask(base, question):
    started = time.monotonic()
    result = {'question': question, 'answer': '', 'sources': [], 'stream_errors': [], 'done': False}
    try:
        with requests.post(base + '/api/public/chat', json={'message': question, 'history': [], 'model': 'llama3.2'},
                           stream=True, timeout=(5, 180)) as response:
            result['http_status'] = response.status_code
            if response.status_code != 200:
                result['response'] = response.json()
                return result
            for line in response.iter_lines(chunk_size=1, decode_unicode=True):
                if time.monotonic() - started > 180: raise TimeoutError('Chat exceeded the local acceptance-test budget')
                if not line.startswith('data: '): continue
                data = json.loads(line[6:])
                if 'sources' in data: result['sources'] = data['sources']
                if data.get('token'): result['answer'] += data['token']
                if data.get('error'): result['stream_errors'].append(data['error'])
                if data.get('done'): result['done'] = True
    except Exception as error:
        result['transport_error'] = type(error).__name__
    finally:
        result['elapsed_seconds'] = round(time.monotonic() - started, 3)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:5001')
    parser.add_argument('--output', required=True)
    parser.add_argument('--ids', nargs='*')
    args = parser.parse_args()
    if urlsplit(args.url).hostname not in ('127.0.0.1', 'localhost', '::1'):
        parser.error('This activation probe only targets a loopback endpoint')
    approved = json.loads((BACKEND / 'knowledge_manifest.json').read_text(encoding='utf-8'))['sources'][0]['sha256']
    actual = hashlib.sha256((BACKEND / 'tansam_knowledge.txt').read_bytes()).hexdigest()
    if actual != approved: parser.error('Knowledge bytes no longer match the approved manifest')
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'base_url': args.url,
              'approved_source_sha256': actual, 'cases': []}
    for identifier, question, patterns in CASES:
        if args.ids and identifier not in args.ids: continue
        result = {'id': identifier, **ask(args.url.rstrip('/'), question)}
        answer = result['answer'].replace('**', '').replace('*', '').lower()
        result['missing_patterns'] = [pattern for pattern in patterns if not re.search(pattern, answer)]
        result['passed'] = (result.get('http_status') == 200 and result['done'] and bool(result['sources'])
                            and not result['stream_errors'] and not result.get('transport_error') and not result['missing_patterns']
                            and 'info@tansam.tn.gov.in' not in answer)
        if identifier == 'unknown-fee' and re.search(r'(?:₹|rs\.?|inr)\s*\d', answer): result['passed'] = False
        report['cases'].append(result)
        print(json.dumps(result, ensure_ascii=True), flush=True)
        output = Path(args.output); output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    return 0 if report['cases'] and all(case['passed'] for case in report['cases']) else 1


if __name__ == '__main__':
    raise SystemExit(main())
