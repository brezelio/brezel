@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

where docker >nul 2>nul
if errorlevel 1 (
  >&2 echo docker is required for bin\brezel.bat but was not found in PATH.
  exit /b 1
)

docker compose --project-directory "%PROJECT_DIR%" -f "%PROJECT_DIR%\docker-compose.yaml" exec app php %*
exit /b %ERRORLEVEL%
