EXE BUILD PATCH

1. Replace these three files in the project's exe-build-patch folder:
   - build_exe.bat
   - create_article.spec
   - requirements-exe.txt

2. Double-click build_exe.bat.

3. The executable is generated here:
   dist\article_creator.exe

4. Copy article_creator.exe to the project root.

5. Put input.txt in the project root and run article_creator.exe from there.

Notes:
- Python 3.11 or later is required to build the EXE.
- During the build, an internet connection is required to install PyInstaller.
- The generated EXE itself does not require Python.
- This patch intentionally uses only ASCII in BAT commands and file names.
