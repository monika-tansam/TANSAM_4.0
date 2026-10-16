"""Compatibility entrypoint for the safe indexing CLI; no Flask import."""
from indexing.cli import main

if __name__ == '__main__':
    raise SystemExit(main())
