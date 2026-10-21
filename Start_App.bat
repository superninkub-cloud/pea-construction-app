@echo off
title PEA Construction App Server
echo ===================================================
echo Starting PEA Construction App Local Server (Host)
echo ===================================================
echo.
echo Please DO NOT close this black window while using the app.
echo You can minimize it.
echo.

:: Change to the project directory
cd /d "%~dp0"

:: Open the browser to localhost
start http://localhost:3000

:: Run the development server (This will keep the window open)
npm run dev
