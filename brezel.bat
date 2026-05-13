@echo off
setlocal

call "%~dp0bin\brezel.bat" %*
exit /b %ERRORLEVEL%
