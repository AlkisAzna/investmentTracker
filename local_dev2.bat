@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Check for Python installation
echo ---------------------------------
echo Checking Python Version
echo ---------------------------------
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python is not installed. Attempting to install Python...
    powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.0/python-3.10.0-amd64.exe' -OutFile '%TEMP%\python-installer.exe'"
    start /wait %TEMP%\python-installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del %TEMP%\python-installer.exe
)


echo ---------------------------------
echo Checking NVM
echo ---------------------------------
REM Check for Node.js installation via NVM
nvm list >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo NVM (Node Version Manager) is not installed. Attempting to install NVM...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/coreybutler/nvm-windows/releases/download/1.1.9/nvm-setup.zip' -OutFile '%TEMP%\nvm-setup.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\nvm-setup.zip' -DestinationPath '%TEMP%\nvm-setup'"
    start /wait %TEMP%\nvm-setup\nvm-setup.exe
    del %TEMP%\nvm-setup.zip
    del /Q %TEMP%\nvm-setup
)

echo ---------------------------------
echo Checking Node.JS version
echo ---------------------------------
REM Ensure that Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Installing the latest version using NVM...
    nvm install latest
    nvm use latest
)

REM Check if the virtual environment already exists
echo ---------------------------------
echo Creating Virtual Environment
echo ---------------------------------
IF NOT EXIST "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
) ELSE (
    echo Virtual environment already exists.
)

REM Activate the virtual environment
call venv\Scripts\activate

REM Install dependencies from requirements.txt
echo ---------------------------------
echo Installing Python dependencies...
echo ---------------------------------
pip install -r requirements.txt

REM Make migrations, migrate, and start the Django server
echo ---------------------------------
echo Preparing Django database...
echo ---------------------------------
python manage.py makemigrations
python manage.py migrate
echo ---------------------------------
echo Django Server Started
echo ---------------------------------
start "Django Server" cmd /c python manage.py runserver

REM Navigate to the frontend app directory
cd Frontend\my-trading-app

REM Install npm dependencies and start the Node.js application
echo Installing npm packages...
echo ---------------------------
call npm install > npm_install.log 2>&1
if %ERRORLEVEL% neq 0 (
    echo ---------------------------
    echo ERROR: npm install failed. Check npm_install.log for details.
    echo ---------------------------
    exit /b %ERRORLEVEL%
)

echo Starting Frontend Servers..
echo ---------------------------
start "Frontend App" cmd /c npm start

echo Both servers are up and running! Access Frontend at http://localhost:3000

REM Keep the batch script window open until closed manually
pause
ENDLOCAL
