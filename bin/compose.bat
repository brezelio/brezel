@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

where docker >nul 2>nul
if errorlevel 1 (
  >&2 echo docker is required for bin\compose.bat but was not found in PATH.
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "$path = '%PROJECT_DIR%'; $base = Split-Path -Path $path -Leaf; $base = $base.ToLowerInvariant() -replace '[^a-z0-9]+','-'; $base = $base.Trim('-'); if ([string]::IsNullOrWhiteSpace($base)) { $base = 'project' }; $bytes = [System.Text.Encoding]::UTF8.GetBytes($path); $hash = [System.Security.Cryptography.SHA1]::Create().ComputeHash($bytes); $suffix = ([System.BitConverter]::ToString($hash)).Replace('-','').Substring(0,8).ToLowerInvariant(); "$base-$suffix""') do set "PROJECT_SUFFIX=%%I"
set "PROJECT_NAME=brezel-%PROJECT_SUFFIX%"

docker compose --project-name "%PROJECT_NAME%" --project-directory "%PROJECT_DIR%" -f "%PROJECT_DIR%\docker-compose.yaml" %*
exit /b %ERRORLEVEL%
