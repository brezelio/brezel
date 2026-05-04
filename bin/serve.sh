#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd -- "$script_dir/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  printf 'docker is required for bin/serve.sh but was not found in PATH.\n' >&2
  exit 1
fi

if ! command -v zellij >/dev/null 2>&1; then
  printf 'zellij is required for bin/serve.sh but was not found in PATH.\n' >&2
  exit 1
fi

compose=(docker compose --project-directory "$project_dir" -f "$project_dir/docker-compose.yaml")
started=0

cleanup() {
  if [ "$started" -eq 1 ]; then
    "${compose[@]}" down --remove-orphans
  fi
}

trap cleanup EXIT HUP INT TERM

printf 'Cleaning up any existing Brezel Docker stack\n'
"${compose[@]}" down --remove-orphans >/dev/null 2>&1 || true

printf 'Starting brezel using Docker Compose and Zellij\n'
"${compose[@]}" up -d --remove-orphans
started=1

zellij --layout "$project_dir/bin/assets/zellij/layout.kdl"
