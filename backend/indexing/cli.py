"""Private operator interface; commands never publish implicitly."""
import argparse
import json
import logging

from .errors import IndexingError
from .service import IndexingService
from .settings import Settings


class Parser(argparse.ArgumentParser):
    def error(self, message):
        raise IndexingError('arguments', message)


def main(argv=None):
    parser = Parser(description='Build and publish approved TANSY knowledge versions')
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('validate', 'build'):
        command = commands.add_parser(name)
        command.add_argument('--manifest', required=True)
    status = commands.add_parser('status')
    status.add_argument('--kb', default='tansam')
    status.add_argument('--job-id')
    verify = commands.add_parser('verify')
    verify.add_argument('--revision', required=True)
    recover = commands.add_parser('recover')
    recover.add_argument('--kb', default='tansam')
    inventory = commands.add_parser('inventory-legacy')
    inventory.add_argument('--legacy-dir', required=True)
    migrate = commands.add_parser('migrate-legacy')
    migrate.add_argument('--legacy-dir', required=True)
    migrate.add_argument('--manifest', required=True)
    migrate.add_argument('--checks', required=True, help='JSON file with question/contains checks')
    migrate.add_argument('--quiesced', action='store_true')
    backup = commands.add_parser('backup')
    backup.add_argument('--destination', required=True)
    restore = commands.add_parser('restore')
    restore.add_argument('--backup', required=True)
    restore.add_argument('--offline', action='store_true')
    for name in ('publish', 'rollback'):
        command = commands.add_parser(name)
        command.add_argument('--kb', default='tansam')
        command.add_argument('--revision', required=True)
        command.add_argument('--expected-generation', type=int, required=True)
        command.add_argument('--operation-id', required=True)
        command.add_argument('--actor', required=True)
        command.add_argument('--reason', required=True)
    try:
        args = parser.parse_args(argv)
        try: settings = Settings.from_env()
        except ValueError as error: raise IndexingError('configuration', 'Invalid indexing configuration') from error
        service = IndexingService(settings)
        logging.basicConfig(level=logging.INFO, format='%(message)s')
        if args.command in ('validate', 'build'):
            result = getattr(service, args.command)(args.manifest)
        elif args.command == 'status':
            result = service.catalog.job(args.job_id) if args.job_id else service.status(args.kb)
        elif args.command == 'verify': result = service.verify(args.revision)
        elif args.command == 'recover': result = service.recover(args.kb)
        elif args.command in ('inventory-legacy', 'migrate-legacy', 'backup', 'restore'):
            from .operations import Operations
            from pathlib import Path
            operations = Operations(service)
            if args.command == 'inventory-legacy': result = operations.inventory_legacy(args.legacy_dir)
            elif args.command == 'migrate-legacy':
                try:
                    with Path(args.checks).open('rb') as source: raw = source.read(1024 * 1024 + 1)
                    if len(raw) > 1024 * 1024: raise ValueError('size')
                    checks = json.loads(raw)
                except (OSError, ValueError) as error: raise IndexingError('legacy_checks', 'Invalid compatibility checks file') from error
                result = operations.migrate_legacy(args.legacy_dir, args.manifest, checks, args.quiesced)
            elif args.command == 'backup': result = operations.backup(args.destination)
            else: result = operations.restore(args.backup, args.offline)
        else:
            result = getattr(service, args.command)(args.kb, args.revision, args.expected_generation, args.operation_id, args.actor, args.reason)
        print(json.dumps(result, ensure_ascii=True, allow_nan=False))
        return 0
    except IndexingError as error:
        print(json.dumps(error.as_dict(), ensure_ascii=True))
        return 3 if error.code in ('busy', 'stale_generation', 'operation_conflict') else 2
    except Exception:
        print(json.dumps({'error': 'unavailable', 'message': 'Indexing operation failed; inspect operator diagnostics'}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
