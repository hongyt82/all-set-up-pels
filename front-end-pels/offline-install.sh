#!/bin/bash
# PDF Formatter - 오프라인 설치 스크립트 (Linux/Mac)
# 버전: 1.2.1
# 생성일: 2025-10-15

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   PDF Formatter v1.2.1 - 오프라인 설치            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Node.js 버전 확인
echo "🔍 Node.js 버전 확인..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "   Node.js 20 이상이 필요합니다."
    echo "   설치: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "   현재 버전: v$(node --version | cut -d'v' -f2)"

if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 이상이 필요합니다. (현재: v$NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js 버전 확인 완료"
echo ""

# 의존성 확인
echo "📦 의존성 확인..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules가 이미 포함되어 있습니다."
  
  # 크기 확인
  SIZE=$(du -sh node_modules | cut -f1)
  echo "   크기: $SIZE"
else
  echo "❌ node_modules가 없습니다."
  echo "   온라인 환경에서 다시 패키징하세요."
  exit 1
fi
echo ""

# 빌드 결과물 확인
echo "🏗️  빌드 결과물 확인..."
if [ -d "dist" ]; then
  echo "✅ 빌드 결과물이 이미 포함되어 있습니다."
  
  # 크기 확인
  SIZE=$(du -sh dist | cut -f1)
  echo "   크기: $SIZE"
else
  echo "⚠️  빌드 결과물이 없습니다."
  echo "   로컬 빌드를 실행합니다..."
  
  if npm run build; then
    echo "✅ 빌드 완료"
  else
    echo "❌ 빌드 실패"
    exit 1
  fi
fi
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ 설치 완료!                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "다음 명령어로 서비스를 시작하세요:"
echo ""
echo "  📋 개발 서버 실행:"
echo "     npm run dev"
echo ""
echo "  📋 프로덕션 미리보기:"
echo "     npm run preview"
echo ""
echo "  📋 웹 서버 배포:"
echo "     dist/ 디렉토리를 Nginx/Apache 루트로 복사"
echo ""
echo "자세한 내용은 docs/OFFLINE_DEPLOYMENT.md를 참고하세요."
echo ""
