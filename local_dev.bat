@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

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
