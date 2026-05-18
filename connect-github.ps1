# GitHub 로그인 후 이 스크립트를 실행하세요.
# 사용법: PowerShell에서 .\connect-github.ps1

$ErrorActionPreference = "Stop"
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"

if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI(gh)가 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub 로그인이 필요합니다. 브라우저가 열리면 안내에 따라 로그인하세요." -ForegroundColor Yellow
    & $gh auth login --web --git-protocol https
}

$repoName = "cursor-gongbu"
Write-Host "GitHub 저장소 '$repoName' 생성 및 push 중..." -ForegroundColor Cyan
& $gh repo create $repoName --private --source=. --remote=origin --push

Write-Host "완료! 저장소 주소:" -ForegroundColor Green
& $gh repo view --web
