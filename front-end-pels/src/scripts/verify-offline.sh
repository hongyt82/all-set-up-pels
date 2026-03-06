#!/bin/bash
# PDF Formatter - 오프라인 배포 검증 스크립트
# 외부 URL, CDN 링크 등을 검사하여 완전한 오프라인 배포를 보장합니다.
#
# 사용법:
#   chmod +x scripts/verify-offline.sh
#   ./scripts/verify-offline.sh

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   PDF Formatter - 오프라인 배포 검증                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

FAILED=0
WARNINGS=0

# 1. 외부 URL 검색 (https:// 프로토콜)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  외부 URL 검색 (https://)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 검색할 파일 확장자
FILE_PATTERNS=(
  "*.html"
  "*.tsx"
  "*.ts"
  "*.jsx"
  "*.js"
  "*.css"
)

EXTERNAL_URLS=$(find . -type f \
  \( -name "*.html" -o -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" -o -name "*.css" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/dist-offline/*" \
  ! -path "*/.git/*" \
  -exec grep -l "https://" {} \; 2>/dev/null || true)

if [ -n "$EXTERNAL_URLS" ]; then
  echo "⚠️  외부 URL이 포함된 파일 발견:"
  echo "$EXTERNAL_URLS" | while read -r file; do
    echo "   📄 $file"
    # 각 파일에서 https:// URL 찾기
    grep -n "https://" "$file" | head -3 | while read -r line; do
      echo "      $line"
    done
  done
  echo ""
  echo "⚠️  경고: 외부 URL이 발견되었습니다."
  echo "   오프라인 환경에서 이 URL들은 접근할 수 없습니다."
  echo "   docs/OFFLINE_DEPLOYMENT.md를 참고하여 로컬 리소스로 변경하세요."
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ 외부 URL 없음"
fi
echo ""

# 2. CDN 링크 검색
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CDN 링크 검색"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CDN_PATTERNS=(
  "cdn\."
  "unpkg\.com"
  "jsdelivr\.net"
  "cdnjs\.cloudflare\.com"
  "fonts\.googleapis\.com"
  "fonts\.gstatic\.com"
)

CDN_FOUND=0
for pattern in "${CDN_PATTERNS[@]}"; do
  CDN_LINKS=$(find . -type f \
    \( -name "*.html" -o -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" -o -name "*.css" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/dist-offline/*" \
    ! -path "*/.git/*" \
    -exec grep -l "$pattern" {} \; 2>/dev/null || true)
  
  if [ -n "$CDN_LINKS" ]; then
    if [ $CDN_FOUND -eq 0 ]; then
      echo "❌ CDN 링크가 발견되었습니다:"
      CDN_FOUND=1
    fi
    echo ""
    echo "   패턴: $pattern"
    echo "$CDN_LINKS" | while read -r file; do
      echo "   📄 $file"
      grep -n "$pattern" "$file" | head -2 | while read -r line; do
        echo "      $line"
      done
    done
  fi
done

if [ $CDN_FOUND -eq 1 ]; then
  echo ""
  echo "❌ 오류: CDN 링크는 오프라인 환경에서 작동하지 않습니다."
  echo "   모든 리소스를 로컬에 포함해야 합니다."
  FAILED=$((FAILED + 1))
else
  echo "✅ CDN 링크 없음"
fi
echo ""

# 3. 필수 파일 존재 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  필수 파일 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_FILES=(
  "package.json"
  "package-lock.json"
  "vite.config.ts"
  "tsconfig.json"
  "index.html"
  "main.tsx"
  "App.tsx"
  "README.md"
  "docs/OFFLINE_DEPLOYMENT.md"
  "offline-install.sh"
  "offline-install.bat"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    if [ $MISSING_FILES -eq 0 ]; then
      echo "❌ 누락된 필수 파일:"
      MISSING_FILES=1
    fi
    echo "   ❌ $file"
    FAILED=$((FAILED + 1))
  fi
done

if [ $MISSING_FILES -eq 0 ]; then
  echo "✅ 모든 필수 파일 존재"
fi
echo ""

# 4. node_modules 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  의존성 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")
  echo "✅ node_modules 존재 (크기: $NODE_MODULES_SIZE)"
  
  # 핵심 패키지 확인
  CORE_PACKAGES=(
    "node_modules/react"
    "node_modules/react-dom"
    "node_modules/react-router-dom"
    "node_modules/zustand"
    "node_modules/lucide-react"
  )
  
  MISSING_PACKAGES=0
  for package in "${CORE_PACKAGES[@]}"; do
    if [ ! -d "$package" ]; then
      if [ $MISSING_PACKAGES -eq 0 ]; then
        echo "⚠️  누락된 핵심 패키지:"
        MISSING_PACKAGES=1
      fi
      echo "   ⚠️  $package"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
  
  if [ $MISSING_PACKAGES -eq 0 ]; then
    echo "✅ 핵심 패키지 모두 설치됨"
  fi
else
  echo "❌ node_modules가 없습니다"
  echo "   오프라인 패키지에는 node_modules가 필수입니다."
  echo "   온라인 환경에서 'npm install' 실행 후 다시 패키징하세요."
  FAILED=$((FAILED + 1))
fi
echo ""

# 5. 빌드 결과물 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  빌드 결과물 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
  echo "✅ dist 디렉토리 존재 (크기: $DIST_SIZE)"
  
  # 핵심 파일 확인
  if [ ! -f "dist/index.html" ]; then
    echo "⚠️  dist/index.html이 없습니다"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # assets 디렉토리 확인
  if [ ! -d "dist/assets" ]; then
    echo "⚠️  dist/assets 디렉토리가 없습니다"
    WARNINGS=$((WARNINGS + 1))
  else
    # JS/CSS 파일 확인
    JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    echo "   📦 JavaScript 파일: $JS_COUNT 개"
    echo "   🎨 CSS 파일: $CSS_COUNT 개"
    
    if [ "$JS_COUNT" -eq 0 ]; then
      echo "⚠️  JavaScript 파일이 없습니다"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
else
  echo "⚠️  dist 디렉토리가 없습니다"
  echo "   오프라인 환경에서는 'npm run build'로 빌드해야 합니다."
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. 정적 자원 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  정적 자원 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# public 디렉토리 확인
if [ -d "public" ]; then
  PUBLIC_SIZE=$(du -sh public 2>/dev/null | cut -f1 || echo "unknown")
  echo "✅ public 디렉토리 존재 (크기: $PUBLIC_SIZE)"
  
  # 폰트 확인
  if [ -d "public/fonts" ]; then
    FONT_COUNT=$(find public/fonts -type f | wc -l)
    echo "   🔤 폰트 파일: $FONT_COUNT 개"
  fi
  
  # 이미지 확인
  if [ -d "public/images" ]; then
    IMAGE_COUNT=$(find public/images -type f | wc -l)
    echo "   🖼️  이미지 파일: $IMAGE_COUNT 개"
  fi
else
  echo "⚠️  public 디렉토리가 없습니다"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 7. 설치 스크립트 실행 권한 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  설치 스크립트 권한 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "offline-install.sh" ]; then
  if [ -x "offline-install.sh" ]; then
    echo "✅ offline-install.sh 실행 권한 있음"
  else
    echo "⚠️  offline-install.sh 실행 권한 없음"
    echo "   'chmod +x offline-install.sh' 실행 필요"
    WARNINGS=$((WARNINGS + 1))
  fi
fi
echo ""

# 최종 결과
echo "╔════════════════════════════════════════════════════════╗"
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "║   ✅ 모든 검증 통과!                                  ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "🎉 오프라인 배포 준비가 완료되었습니다."
  echo ""
  echo "다음 단계:"
  echo "  1. npm run package:offline (오프라인 패키지 생성)"
  echo "  2. USB/DVD/내부망으로 전송"
  echo "  3. 오프라인 환경에서 설치"
  echo ""
  exit 0
elif [ $FAILED -gt 0 ]; then
  echo "║   ❌ 검증 실패!                                       ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "❌ 오류: $FAILED 개"
  echo "⚠️  경고: $WARNINGS 개"
  echo ""
  echo "위의 오류를 수정한 후 다시 시도하세요."
  echo "자세한 내용: docs/OFFLINE_DEPLOYMENT.md"
  echo ""
  exit 1
else
  echo "║   ⚠️  경고 있음 (배포 가능)                           ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "⚠️  경고: $WARNINGS 개"
  echo ""
  echo "경고 사항을 확인하세요. 배포는 가능하지만 일부 기능이 제한될 수 있습니다."
  echo ""
  exit 0
fi
