#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path
from typing import Any


def parse_path(path: str) -> list[Any]:
    parts = []
    for chunk in path.split('.'):
        chunk = chunk.strip()
        if not chunk:
            continue
        if chunk.isdigit():
            parts.append(int(chunk))
        else:
            parts.append(chunk)
    return parts


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


def truncate_strings(value: Any, max_len: int | None) -> Any:
    if max_len is None:
        return value
    if isinstance(value, str):
        if len(value) <= max_len:
            return value
        return value[:max_len] + f' … [truncated {len(value) - max_len} chars]'
    if isinstance(value, list):
        return [truncate_strings(item, max_len) for item in value]
    if isinstance(value, dict):
        return {key: truncate_strings(item, max_len) for key, item in value.items()}
    return value


def load_input(path: str | None) -> Any:
    if path:
        return json.loads(Path(path).read_text(encoding='utf-8'))
    if sys.stdin.isatty():
        raise SystemExit('No JSON received through stdin or --load.')
    return json.load(sys.stdin)


def unwrap_data(value: Any) -> Any:
    if not isinstance(value, dict):
        return value

    for key in ('data', 'resource'):
        if key in value and isinstance(value[key], (list, dict)):
            return value[key]

    pagination_keys = {
        'current_page', 'first_page_url', 'last_page', 'last_page_url',
        'next_page_url', 'prev_page_url', 'per_page', 'total', 'from', 'to', 'path'
    }
    if 'data' in value and pagination_keys.intersection(value.keys()):
        return value['data']

    return value


def type_name(value: Any) -> str:
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'bool'
    if isinstance(value, int):
        return 'int'
    if isinstance(value, float):
        return 'float'
    if isinstance(value, str):
        return 'str'
    if isinstance(value, list):
        return 'list'
    if isinstance(value, dict):
        return 'dict'
    return type(value).__name__


def describe(value: Any, depth: int, max_items: int = 5) -> Any:
    if depth <= 0:
        if isinstance(value, list):
            return f'list[{len(value)}]'
        if isinstance(value, dict):
            return f'dict[{len(value)} keys]'
        return type_name(value)

    if isinstance(value, dict):
        result = {}
        for key in list(value.keys())[:max_items]:
            result[key] = describe(value[key], depth - 1, max_items)
        if len(value) > max_items:
            result['...'] = f'+{len(value) - max_items} more keys'
        return result

    if isinstance(value, list):
        preview = [describe(item, depth - 1, max_items) for item in value[:max_items]]
        if len(value) > max_items:
            preview.append(f'... +{len(value) - max_items} more items')
        return preview

    return value


def pick_fields(items: list[Any], fields: list[str]) -> list[Any]:
    out = []
    for item in items:
        if isinstance(item, dict):
            out.append({field: item.get(field) for field in fields})
        else:
            out.append(item)
    return out


def pick_paths(value: Any, paths: list[str]) -> Any:
    if isinstance(value, list):
        return [pick_paths(item, paths) for item in value]

    result = {}
    for path in paths:
        try:
            result[path] = get_path(value, path)
        except (KeyError, IndexError, TypeError):
            result[path] = None
    return result


def find_items(items: list[Any], field: str, expected: str) -> list[Any]:
    matches = []
    for item in items:
        if isinstance(item, dict) and str(item.get(field)) == expected:
            matches.append(item)
    return matches


def main() -> None:
    parser = argparse.ArgumentParser(description='Compact inspection for verbose JSON API responses.')
    parser.add_argument('--load', help='Load JSON from a file instead of stdin.')
    parser.add_argument('--save', help='Also save the original JSON.')
    parser.add_argument('--keys', action='store_true', help='Show top-level keys or keys of the first list item.')
    parser.add_argument('--depth', type=int, help='Show a structure preview to this depth.')
    parser.add_argument('--pick', help='Select comma-separated fields, for example id,name,status.')
    parser.add_argument('--pick-paths', help='Select comma-separated dot paths, for example id,slots.0.sections.0.attributes.texts.')
    parser.add_argument('--path', help='Extract one dot path, for example resource.slots.0.sections.')
    parser.add_argument('--find', help='Simple field comparison, for example id=42.')
    parser.add_argument('--item', type=int, help='Output one item index from a list.')
    parser.add_argument('--limit', type=int, default=20, help='Maximum displayed list items (default: 20).')
    parser.add_argument('--max-string', type=int, help='Truncate strings to this maximum length.')
    args = parser.parse_args()

    raw = load_input(args.load)

    if args.save:
        Path(args.save).write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding='utf-8')

    data = unwrap_data(raw)

    if args.path:
        data = get_path(raw, args.path)

    if args.keys:
        if isinstance(data, dict):
            print(json.dumps(sorted(data.keys()), ensure_ascii=False, indent=2))
            return
        if isinstance(data, list):
            if not data:
                print('[]')
                return
            first = data[0]
            if isinstance(first, dict):
                print(json.dumps(sorted(first.keys()), ensure_ascii=False, indent=2))
                return
            print(json.dumps({'itemType': type_name(first)}, ensure_ascii=False, indent=2))
            return

    if args.item is not None:
        if not isinstance(data, list):
            raise SystemExit('--item works only with lists.')
        print(json.dumps(data[args.item], ensure_ascii=False, indent=2))
        return

    if args.find:
        if not isinstance(data, list):
            raise SystemExit('--find works only with lists.')
        if '=' not in args.find:
            raise SystemExit('--find expects field=value.')
        field, expected = args.find.split('=', 1)
        data = find_items(data, field, expected)

    if args.pick:
        fields = [field.strip() for field in args.pick.split(',') if field.strip()]
        if isinstance(data, list):
            data = pick_fields(data[: args.limit], fields)
        elif isinstance(data, dict):
            data = {field: data.get(field) for field in fields}

    if args.pick_paths:
        paths = [path.strip() for path in args.pick_paths.split(',') if path.strip()]
        if isinstance(data, list):
            data = pick_paths(data[: args.limit], paths)
        else:
            data = pick_paths(data, paths)

    if args.depth is not None:
        print(json.dumps(truncate_strings(describe(data, args.depth), args.max_string), ensure_ascii=False, indent=2))
        return

    if isinstance(data, list):
        print(json.dumps(truncate_strings(data[: args.limit], args.max_string), ensure_ascii=False, indent=2))
        return

    print(json.dumps(truncate_strings(data, args.max_string), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
