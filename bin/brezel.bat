@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
call "%SCRIPT_DIR%compose.bat" exec app php %*
exit /b %ERRORLEVEL%
