@echo off
REM Diet Game Gamification Backend Startup Script for Windows
REM Sprint 7-8: Core Backend Development

echo 🚀 Starting Diet Game Gamification Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Copying from env.example...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration before running again.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Set environment
if "%NODE_ENV%"=="" set NODE_ENV=development

echo 🌍 Environment: %NODE_ENV%
echo 🔧 Starting server...

REM Start the server
if "%NODE_ENV%"=="production" (
    echo 🏭 Starting in production mode...
    npm start
) else (
    echo 🛠️  Starting in development mode...
    npm run dev
)

pause
