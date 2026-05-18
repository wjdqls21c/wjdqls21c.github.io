@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   GitHub 연결 (커서 공부용 폴더)
echo ========================================
echo.

set GH="%ProgramFiles%\GitHub CLI\gh.exe"

if not exist %GH% (
    echo GitHub CLI가 없습니다. Cursor 터미널에서 에이전트에게 다시 설치 요청하세요.
    pause
    exit /b 1
)

echo [1/2] GitHub 로그인 확인...
%GH% auth status
if errorlevel 1 (
    echo.
    echo 브라우저가 열리면 GitHub 로그인 후, 터미널 질문에는 보통 Enter만 누르면 됩니다.
    echo.
    %GH% auth login --web --git-protocol https
)

echo.
echo [2/2] GitHub에 저장소 만들고 파일 올리는 중...
%GH% repo create cursor-gongbu --private --source=. --remote=origin --push

echo.
echo ========================================
echo   끝! github.com 에서 cursor-gongbu 확인
echo ========================================
pause
