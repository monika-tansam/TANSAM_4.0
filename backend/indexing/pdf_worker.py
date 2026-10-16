"""Isolated PDF extraction process. Resource caps are also required on the worker."""
import json
from pathlib import Path
import sys
from pypdf import PdfReader


def main():
    source, output, page_limit, text_limit = sys.argv[1:]
    reader = PdfReader(source)
    if reader.is_encrypted or len(reader.pages) > int(page_limit): return 2
    pages, total = [], 0
    for page in reader.pages:
        text = page.extract_text() or ''
        total += len(text)
        if total > int(text_limit): return 2
        pages.append(text.replace('\r\n', '\n').replace('\r', '\n'))
    if not any(text.strip() for text in pages): return 2
    Path(output).write_text(json.dumps(pages), encoding='utf-8')
    return 0


if __name__ == '__main__':
    try: sys.exit(main())
    except Exception: sys.exit(2)
