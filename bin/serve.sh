#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v zellij >/dev/null 2>&1; then
  printf 'zellij is required for bin/serve.sh but was not found in PATH.\n' >&2
  exit 1
fi

compose=("$script_dir/compose")
started=0

ports=(2040 2041 2042 2043)

show_port_conflict() {
  local port="$1"

  printf 'Port %s is already in use.\n' "$port" >&2

  if command -v docker >/dev/null 2>&1; then
    docker ps --filter "publish=$port" --format 'Docker: {{.Names}} ({{.Image}}) -> {{.Ports}}' >&2 || true
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltnp "sport = :$port" >&2 || true
  fi

  printf 'Stop the process using that port, or stop the other Brezel stack first.\n' >&2
}

port_is_busy() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    [ -n "$(ss -H -ltn "sport = :$port")" ]
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return
  fi

  return 1
}

cleanup() {
  if [ "$started" -eq 1 ]; then
    "${compose[@]}" down --remove-orphans
  fi
}

trap cleanup EXIT HUP INT TERM

printf 'Cleaning up any existing Docker stack for this project\n'
"${compose[@]}" down --remove-orphans >/dev/null 2>&1 || true

for port in "${ports[@]}"; do
  if port_is_busy "$port"; then
    show_port_conflict "$port"
    exit 1
  fi
done

printf 'Starting brezel using Docker Compose and Zellij\n'
"${compose[@]}" up -d --remove-orphans
started=1

zellij --layout "$script_dir/assets/zellij/layout.kdl"
