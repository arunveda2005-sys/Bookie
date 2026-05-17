@echo off
echo ========================================
echo Video Bookmarking System
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.
echo IMPORTANT: Keep this window open!
echo.

start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python main.py"
timeout /t 5 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers are starting in new windows!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Wait 10 seconds, then open:
echo http://localhost:5173
echo.
pause
