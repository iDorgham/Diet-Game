@echo off
echo Installing Redis for Diet Game Backend...
echo.

REM Check if Chocolatey is installed
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Chocolatey not found. Installing Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo Failed to install Chocolatey. Please install manually.
        pause
        exit /b 1
    )
)

echo Installing Redis...
choco install redis-64 -y
if %errorlevel% neq 0 (
    echo Failed to install Redis. Please install manually.
    pause
    exit /b 1
)

echo.
echo Redis installed successfully!
echo.
echo To start Redis server, run:
echo   redis-server
echo.
echo To test Redis connection, run:
echo   redis-cli ping
echo.
echo Your .env file has been configured with:
echo   REDIS_URL=redis://localhost:6379
echo.
echo You can now start your backend with:
echo   npm run dev
echo.
pause
