[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

& (Join-Path $PSScriptRoot 'bin\brezel.ps1') @Args
exit $LASTEXITCODE
