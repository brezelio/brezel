@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

docker compose --project-directory "%PROJECT_DIR%" -f "%PROJECT_DIR%\docker-compose.yaml" exec app php %*
exit /b %ERRORLEVEL%
