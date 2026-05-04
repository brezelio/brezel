@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

where bun >nul 2>nul
if errorlevel 1 (
  >&2 echo bun is required for bin\brezel.bat but was not found in PATH.
  exit /b 1
)

bun run "%SCRIPT_DIR%brezel.ts" %*
exit /b %ERRORLEVEL%
