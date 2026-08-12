@echo off
setlocal EnableExtensions

rem Move to the project root directory.
cd /d "%~dp0.."

set "PYTHON_CMD="
where py >nul 2>nul
if not errorlevel 1 set "PYTHON_CMD=py -3"

if not defined PYTHON_CMD (
  where python >nul 2>nul
  if not errorlevel 1 set "PYTHON_CMD=python"
)

if not defined PYTHON_CMD (
  echo [ERROR] Python was not found.
  echo Install Python 3.11 or later and enable Add Python to PATH.
  pause
  exit /b 1
)

echo [1/4] Python found.
%PYTHON_CMD% --version
if errorlevel 1 goto :error

echo [2/4] Creating virtual environment...
if not exist ".venv-exe\Scripts\python.exe" (
  %PYTHON_CMD% -m venv ".venv-exe"
  if errorlevel 1 goto :error
)

set "VENV_PYTHON=%CD%\.venv-exe\Scripts\python.exe"

echo [3/4] Installing PyInstaller...
"%VENV_PYTHON%" -m pip install --upgrade pip
if errorlevel 1 goto :error
"%VENV_PYTHON%" -m pip install -r "exe-build-patch\requirements-exe.txt"
if errorlevel 1 goto :error

echo [4/4] Building executable...
"%VENV_PYTHON%" -m PyInstaller --noconfirm --clean "exe-build-patch\create_article.spec"
if errorlevel 1 goto :error

echo.
echo [SUCCESS] dist\article_creator.exe was created.
echo Copy article_creator.exe to the project root before running it.
pause
exit /b 0

:error
echo.
echo [ERROR] EXE build failed.
echo Review the messages above.
pause
exit /b 1
