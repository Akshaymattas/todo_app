@echo off
rem Starts the API and the React dev server in their own windows, then opens the app.
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%PATH%"

if not exist backend\node_modules (cd backend && call npm install && cd ..)
if not exist frontend\node_modules (cd frontend && call npm install && cd ..)

start "Todo API (port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"
start "Todo UI (port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul
start "" http://localhost:5173
