@echo off
title IICE Conference Translator Server
color 0b
echo ========================================================
echo   IICE Conference Translator - Local Web Server
echo ========================================================
echo.
echo Server running at http://localhost:8080 ...
echo Chrome will open automatically.
echo (Do not close this window while using the translator)
echo.

start chrome "http://localhost:8080/index.html"

python -m http.server 8080
if %ERRORLEVEL% NEQ 0 (
  npx -y serve -p 8080 .
)
pause
