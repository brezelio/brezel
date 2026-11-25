#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


def parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(',') if item.strip()]


def load_json(value: str | None, file_path: str | None, default: Any = None) -> Any:
    if value and file_path:
        raise SystemExit('Use either inline JSON or a JSON file, not both.')
    if file_path:
        return json.loads(Path(file_path).read_text(encoding='utf-8'))
    if value:
        return json.loads(value)
    return default


def parse_path(path: str) -> list[str | int]:
    return [int(part) if part.isdigit() else part for part in path.split('.') if part]


def get_path(value: Any, path: str) -> Any:
    current = value
    for part in parse_path(path):
        if isinstance(part, int):
            if not isinstance(current, list):
                raise KeyError(path)
            current = current[part]
        else:
            if not isinstance(current, dict):
                raise KeyError(path)
            current = current[part]
    return current


def truncate(value: Any, limit: int | None) -> Any:
    if limit is None:
        return value
    if isinstance(value, str):
        if len(value) <= limit:
            return value
        return value[:limit] + f' ... [truncated {len(value) - limit} chars]'
    if isinstance(value, list):
        return [truncate(item, limit) for item in value]
    if isinstance(value, dict):
        return {key: truncate(item, limit) for key, item in value.items()}
    return value


class BrezelClient:
    def __init__(self, base_url: str, tenant: str, api_key: str):
        self.root = f"{base_url.rstrip('/')}/{tenant.strip('/')}"
        self.api_key = api_key

    def request(self, method: str, path: str, payload: Any = None) -> Any:
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'brezel-call/1.0',
            'X-API-Key': self.api_key,
        }
        body = None
        if payload is not None:
            headers['Content-Type'] = 'application/json'
            body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        request = urllib.request.Request(
            f'{self.root}{path}',
            headers=headers,
            data=body,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                raw = response.read()
                if not raw:
                    return None
                content_type = response.headers.get('Content-Type', '')
                if 'json' in content_type:
                    return json.loads(raw.decode('utf-8'))
                try:
                    return json.loads(raw.decode('utf-8'))
                except (UnicodeDecodeError, json.JSONDecodeError):
                    return {'content_type': content_type, 'bytes': len(raw)}
        except urllib.error.HTTPError as error:
            body_text = error.read().decode('utf-8', errors='replace')
            raise SystemExit(f'HTTP {error.code} {error.reason}: {body_text}') from error

    def upload(self, file_path: str, parent_id: int, module: str) -> Any:
        module_path = urllib.parse.quote(module, safe='')
        module_info = self.request('GET', f'/modules/{module_path}')
        parent = self.request('GET', f'/modules/{module_path}/resources/{parent_id}')
        if not isinstance(parent, dict) or parent.get('id') != parent_id:
            raise SystemExit(f'Parent {parent_id} was not resolved in files module {module}.')
        if parent.get('directory') not in (True, 1, '1', 'true'):
            raise SystemExit(f'Parent {parent_id} is not a directory.')
        module_id = module_info.get('id') if isinstance(module_info, dict) else None
        if module_id is not None and parent.get('module_id') != module_id:
            raise SystemExit(f'Parent {parent_id} does not belong to files module {module}.')
        command = [
            'curl', '--fail-with-body', '--silent', '--show-error',
            '-H', f'X-API-Key: {self.api_key}',
            '-H', 'Accept: application/json',
            '-F', f'module={module}',
            '-F', f'parent_id={parent_id}',
            '-F', f'file=@{file_path}',
            f'{self.root}/files',
        ]
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        return json.loads(result.stdout)


def resource_path(module: str, resource_id: int | None = None) -> str:
    path = f'/modules/{urllib.parse.quote(module, safe="")}/resources'
    if resource_id is not None:
        path += f'/{resource_id}'
    return path


def query_path(path: str, params: dict[str, Any]) -> str:
    encoded = {}
    for key, value in params.items():
        if value is None or value == []:
            continue
        encoded[key] = json.dumps(value, ensure_ascii=False) if isinstance(value, (list, dict)) else value
    return path + ('?' + urllib.parse.urlencode(encoded) if encoded else '')


def mutation_preview(method: str, path: str, payload: Any = None) -> None:
    print(json.dumps({
        'dry_run': True,
        'method': method,
        'path': path,
        'headers': {'X-API-Key': '<redacted>'},
        'payload': payload,
    }, ensure_ascii=False, indent=2))


def add_output_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--save', help='Save raw response JSON to this file.')
    parser.add_argument('--path', help='Print only this dot path from the response.')
    parser.add_argument('--max-string', type=int, help='Truncate long strings in displayed output.')


def add_payload_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--data', help='Inline JSON payload.')
    parser.add_argument('--data-file', help='JSON payload file.')
    parser.add_argument('--execute', action='store_true', help='Execute instead of printing a dry run.')
    add_output_arguments(parser)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Safe Brezel REST and webhook client.')
    parser.add_argument('--base-url', default=os.getenv('BREZEL_BASE_URL'))
    parser.add_argument('--tenant', default=os.getenv('BREZEL_TENANT') or os.getenv('BREZEL_CLIENT_IDENTIFIER'))
    parser.add_argument('--api-key', default=os.getenv('BREZEL_API_KEY'))
    subparsers = parser.add_subparsers(dest='command', required=True)

    modules = subparsers.add_parser('modules', help='List modules.')
    add_output_arguments(modules)

    list_parser = subparsers.add_parser('list', help='List module resources.')
    list_parser.add_argument('module')
    list_parser.add_argument('--page', type=int, default=1)
    list_parser.add_argument('--results', type=int, default=20)
    list_parser.add_argument('--columns')
    list_parser.add_argument('--with', dest='with_relations')
    list_parser.add_argument('--filters', help='Inline DNF filter JSON.')
    list_parser.add_argument('--filters-json', help='File containing DNF filter JSON.')
    list_parser.add_argument('--pre-filters', help='Inline DNF pre-filter JSON.')
    list_parser.add_argument('--pre-filters-json', help='File containing DNF pre-filter JSON.')
    list_parser.add_argument('--sort-field')
    list_parser.add_argument('--sort-order')
    add_output_arguments(list_parser)

    get_parser = subparsers.add_parser('get', help='Get one resource.')
    get_parser.add_argument('module')
    get_parser.add_argument('resource_id', type=int)
    add_output_arguments(get_parser)

    create = subparsers.add_parser('create', help='Create one resource.')
    create.add_argument('module')
    add_payload_arguments(create)

    update = subparsers.add_parser('update', help='Partially update top-level fields.')
    update.add_argument('module')
    update.add_argument('resource_id', type=int)
    add_payload_arguments(update)

    delete = subparsers.add_parser('delete', help='Delete one resource.')
    delete.add_argument('module')
    delete.add_argument('resource_id', type=int)
    delete.add_argument('--execute', action='store_true')
    delete.add_argument('--yes', action='store_true', help='Confirm destructive deletion.')
    add_output_arguments(delete)

    webhook = subparsers.add_parser('webhook', help='Invoke a protected workflow webhook.')
    webhook.add_argument('event')
    webhook.add_argument('--module')
    webhook.add_argument('--resource-id', type=int)
    webhook.add_argument('--public', action='store_true')
    add_payload_arguments(webhook)

    upload = subparsers.add_parser('upload', help='Upload into a verified parent directory.')
    upload.add_argument('file')
    upload.add_argument('--parent-id', type=int, required=True)
    upload.add_argument('--module', default='files')
    upload.add_argument('--execute', action='store_true')
    add_output_arguments(upload)

    return parser


def execute_command(args: argparse.Namespace, client: BrezelClient) -> Any:
    if args.command == 'modules':
        return client.request('GET', '/modules')

    if args.command == 'list':
        params = {
            'page': args.page,
            'results': args.results,
            'columns': parse_csv(args.columns),
            'with': parse_csv(args.with_relations),
            'filters': load_json(args.filters, args.filters_json),
            'pre_filters': load_json(args.pre_filters, args.pre_filters_json),
            'sortField': args.sort_field,
            'sortOrder': args.sort_order,
        }
        return client.request('GET', query_path(resource_path(args.module), params))

    if args.command == 'get':
        return client.request('GET', resource_path(args.module, args.resource_id))

    if args.command in {'create', 'update'}:
        payload = load_json(args.data, args.data_file)
        if payload is None:
            raise SystemExit('A JSON payload is required.')
        method = 'POST' if args.command == 'create' else 'PUT'
        path = resource_path(args.module, getattr(args, 'resource_id', None))
        if not args.execute:
            mutation_preview(method, path, payload)
            return None
        return client.request(method, path, payload)

    if args.command == 'delete':
        path = resource_path(args.module, args.resource_id)
        if not args.execute:
            mutation_preview('DELETE', path)
            return None
        if not args.yes:
            raise SystemExit('Deletion requires --yes in addition to --execute.')
        return client.request('DELETE', path)

    if args.command == 'webhook':
        if args.resource_id is not None and not args.module:
            raise SystemExit('--resource-id requires --module.')
        prefix = '/public/webhook' if args.public else '/webhook'
        path = f'{prefix}/{urllib.parse.quote(args.event, safe="")}'
        if args.module:
            path += f'/{urllib.parse.quote(args.module, safe="")}'
        if args.resource_id is not None:
            path += f'/{args.resource_id}'
        payload = load_json(args.data, args.data_file, {})
        if not args.execute:
            mutation_preview('POST', path, payload)
            return None
        return client.request('POST', path, payload)

    if args.command == 'upload':
        if not Path(args.file).is_file():
            raise SystemExit(f'File not found: {args.file}')
        if not args.execute:
            mutation_preview('POST', '/files', {
                'file': str(Path(args.file).resolve()),
                'module': args.module,
                'parent_id': args.parent_id,
            })
            return None
        return client.upload(args.file, args.parent_id, args.module)

    raise SystemExit(f'Unknown command: {args.command}')


def main() -> int:
    args = build_parser().parse_args()
    if not args.base_url:
        raise SystemExit('Set --base-url or BREZEL_BASE_URL.')
    if not args.tenant:
        raise SystemExit('Set --tenant or BREZEL_TENANT.')
    if not args.api_key:
        raise SystemExit('Set --api-key or BREZEL_API_KEY.')

    response = execute_command(args, BrezelClient(args.base_url, args.tenant, args.api_key))
    if response is None:
        return 0
    if args.save:
        Path(args.save).write_text(json.dumps(response, ensure_ascii=False, indent=2), encoding='utf-8')
    displayed = get_path(response, args.path) if args.path else response
    print(json.dumps(truncate(displayed, args.max_string), ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
