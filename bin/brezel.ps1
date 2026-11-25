$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Error 'bun is required for bin\brezel.ps1 but was not found in PATH.'
    exit 1
}

# Bun would load .env into process.env, and those startup values would override .env edits made during the run in Docker Compose.
& bun --no-env-file run (Join-Path $scriptDir 'brezel.ts') @args
exit $LASTEXITCODE
