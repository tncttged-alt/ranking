@echo off
setlocal
cd /d "%~dp0.."

echo [1/4] Pythonを確認しています...
where py >nul 2>nul
if errorlevel 1 (
  echo Pythonが見つかりません。Python 3.11以降をインストールしてください。
  pause
  exit /b 1
)

echo [2/4] 仮想環境を作成しています...
if not exist ".venv-exe" py -3 -m venv .venv-exe
call .venv-exe\Scripts\activate.bat

echo [3/4] PyInstallerを準備しています...
python -m pip install --upgrade pip
python -m pip install -r exe-build-patch\requirements-exe.txt

echo [4/4] EXEを作成しています...
pyinstaller --noconfirm --clean exe-build-patch\create_article.spec

if errorlevel 1 (
  echo EXE化に失敗しました。
  pause
  exit /b 1
)

echo.
echo 完了: dist\記事自動作成ツール.exe
pause
