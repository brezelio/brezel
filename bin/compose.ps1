[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$localOverride = Join-Path $projectDir '.brezel-state\compose.links.yaml'
$runtimeOverride = Join-Path $projectDir '.brezel-state\compose.runtime.yaml'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error 'docker is required for bin\compose.ps1 but was not found in PATH.'
    exit 1
}

$base = [System.IO.Path]::GetFileName($projectDir).ToLowerInvariant() -replace '[^a-z0-9]+','-'
$base = $base.Trim('-')
if ([string]::IsNullOrWhiteSpace($base)) {
    $base = 'project'
}
$bytes = [System.Text.Encoding]::UTF8.GetBytes($projectDir)
$hash = [System.Security.Cryptography.SHA1]::Create().ComputeHash($bytes)
$suffix = ([System.BitConverter]::ToString($hash)).Replace('-','').Substring(0,8).ToLowerInvariant()
$projectName = "brezel-$base-$suffix"

$composeArgs = @(
    'compose'
    '--project-name', $projectName
    '--project-directory', $projectDir
    '-f', (Join-Path $projectDir 'docker-compose.yaml')
)

if (Test-Path $localOverride) {
    $composeArgs += @('-f', $localOverride)
}

if (Test-Path $runtimeOverride) {
    $composeArgs += @('-f', $runtimeOverride)
}

& docker @composeArgs @Args
exit $LASTEXITCODE
