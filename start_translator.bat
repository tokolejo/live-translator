@echo off
title IICE Conference Translator Server
color 0b
cd /d "%~dp0"

echo ========================================================
echo   IICE 2026 Conference Translator - Local Server
echo ========================================================
echo.
echo Starting local server on http://localhost:8080 ...
echo (Do not close this window while presenting)
echo.

:: Launch Chrome after a brief delay so the server binds port 8080 first
start "" cmd /c "timeout /t 2 /nobreak >nul && (start chrome "http://localhost:8080/index.html" 2>nul || start "" "http://localhost:8080/index.html")"

:: Check if Python is installed; otherwise use Windows built-in PowerShell server (zero dependencies)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Engine] Python HTTP Server
    python -m http.server 8080
) else (
    echo [Engine] Built-in Windows PowerShell HTTP Server
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
)

pause
