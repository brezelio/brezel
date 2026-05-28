$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Error 'bun is required for bin\brezel.ps1 but was not found in PATH.'
    exit 1
}

& bun run (Join-Path $scriptDir 'brezel.ts') @args
exit $LASTEXITCODE
