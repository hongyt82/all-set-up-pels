@echo off
REM PDF Formatter - 오프라인 설치 스크립트 (Windows)
REM 버전: 1.2.1
REM 생성일: 2025-10-15

echo ╔════════════════════════════════════════════════════════╗
echo ║   PDF Formatter v1.2.1 - 오프라인 설치            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Node.js 버전 확인
echo 🔍 Node.js 버전 확인...
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js가 설치되지 않았습니다.
  echo    Node.js 20 이상이 필요합니다.
  echo    설치: https://nodejs.org/
  exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 20 (
  echo ❌ Node.js 20 이상이 필요합니다.
  exit /b 1
)

node --version
echo ✅ Node.js 버전 확인 완료
echo.

REM 의존성 확인
echo 📦 의존성 확인...
if exist "node_modules" (
  echo ✅ node_modules가 이미 포함되어 있습니다.
) else (
  echo ❌ node_modules가 없습니다.
  echo    온라인 환경에서 다시 패키징하세요.
  exit /b 1
)
echo.

REM 빌드 결과물 확인
echo 🏗️ 빌드 결과물 확인...
if exist "dist" (
  echo ✅ 빌드 결과물이 이미 포함되어 있습니다.
) else (
  echo ⚠️ 빌드 결과물이 없습니다.
  echo    로컬 빌드를 실행합니다...
  
  call npm run build
  if errorlevel 1 (
    echo ❌ 빌드 실패
    exit /b 1
  )
  echo ✅ 빌드 완료
)
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║   ✅ 설치 완료!                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 다음 명령어로 서비스를 시작하세요:
echo.
echo   📋 개발 서버 실행:
echo      npm run dev
echo.
echo   📋 프로덕션 미리보기:
echo      npm run preview
echo.
echo   📋 웹 서버 배포:
echo      dist\ 디렉토리를 Nginx/Apache 루트로 복사
echo.
echo 자세한 내용은 docs\OFFLINE_DEPLOYMENT.md를 참고하세요.
echo.
pause
