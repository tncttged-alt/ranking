@echo off
REM Build standalone EXE for make_article.py using pyinstaller
if not exist venv (py -3 -m venv venv && venv\Scripts\pip.exe install --upgrade pip)
call venv\Scripts\activate
python -m pip install pyinstaller
pyinstaller --onefile --distpath dist --workpath build --specpath build make_article.py
echo Build finished. See dist\make_article.exe
pause
