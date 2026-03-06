# PDF Formatter - 오프라인 배포 가이드

> 외부 네트워크 통신 없이 폐쇄망/에어갭 환경에서 완전한 오프라인 배포를 위한 가이드

**버전:** 1.2.2  
**최종 업데이트:** 2025-10-01  
**대상 환경:** 폐쇄망, 에어갭(Air-gapped), 내부망 전용 시스템

---

## 📋 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [온라인 환경 준비 단계](#온라인-환경-준비-단계)
4. [의존성 완전 번들링](#의존성-완전-번들링)
5. [정적 자원 내재화](#정적-자원-내재화)
6. [오프라인 패키지 생성](#오프라인-패키지-생성)
7. [오프라인 환경 설치](#오프라인-환경-설치)
8. [빌드 및 배포](#빌드-및-배포)
9. [검증 및 테스트](#검증-및-테스트)
10. [트러블슈팅](#트러블슈팅)

---

## 개요

### 배포 시나리오

```
[온라인 환경]                    [물리적 이동]                [오프라인 환경]
    │                                │                            │
    ├─ 의존성 다운로드               │                            ├─ 압축 해제
    ├─ node_modules 완전 설치        │                            ├─ 오프라인 설치
    ├─ 정적 자원 포함                ├──> USB/DVD/내부망 ──>      ├─ 빌드 실행
    ├─ 빌드 도구 포함                │                            ├─ 웹 서버 배포
    └─ 패키징 (tar.gz/zip)          │                            └─ 서비스 시작
```

### 핵심 요구사항

- ✅ **외부 네트워크 통신 완전 차단**
- ✅ **모든 의존성 로컬 포함**
- ✅ **CDN 리소스 제로 의존**
- ✅ **오프라인 빌드 가능**
- ✅ **정적 자원 완전 내재화**
- ✅ **자체 완결형 패키지**

### 지원 환경

| 환경                   | 지원      |
| ---------------------- | --------- |
| Linux (Ubuntu 20.04+)  | ✅ 권장   |
| Linux (RHEL/CentOS 8+) | ✅ 지원   |
| Windows Server 2019+   | ✅ 지원   |
| macOS 11+              | ✅ 개발용 |

---

## 사전 준비

### 필요 소프트웨어 (온라인 환경)

```bash
# 버전 확인
node --version    # v20.11.0 이상
npm --version     # v10.2.0 이상
git --version     # v2.34.0 이상
tar --version     # GNU tar 권장
```

### 필요 소프트웨어 (오프라인 환경)

**오프라인 환경에도 동일한 버전의 Node.js가 필요합니다.**

**방법 1: Node.js 바이너리 포함 (권장)**

```bash
# 온라인 환경에서 Node.js 바이너리 다운로드
wget https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz

# 오프라인 환경으로 복사
```

**방법 2: 오프라인 설치용 rpm/deb 패키지**

```bash
# Ubuntu/Debian
wget https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.11.0-1nodesource1_amd64.deb

# RHEL/CentOS
wget https://rpm.nodesource.com/pub_20.x/nodistro/repo/x86_64/nodejs-20.11.0-1nodesource.x86_64.rpm
```

---

## 온라인 환경 준비 단계

### 1단계: 프로젝트 클론/생성

```bash
# 프로젝트 디렉토리 생성
mkdir pdf-formatter-offline
cd pdf-formatter-offline

# 또는 기존 프로젝트 클론
git clone <repository-url> pdf-formatter-offline
cd pdf-formatter-offline
```

### 2단계: package.json 준비

**완전한 package.json** (`/package.json`):

```json
{
  "name": "pdf-formatter-offline",
  "version": "1.2.2",
  "type": "module",
  "private": true,
  "description": "PDF 서식화 작성 에디터 - 오프라인 배포용",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "package:offline": "node scripts/package-offline.js"
  },
  "dependencies": {
    "react": "19.1.1",
    "react-dom": "19.1.1",
    "react-router-dom": "7.1.3",
    "zustand": "5.0.2",
    "idb-keyval": "6.2.1",
    "react-draggable": "4.4.6",
    "lucide-react": "0.468.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.6.0",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "recharts": "2.15.0",
    "sonner": "1.7.3",
    "vaul": "1.1.3",
    "class-variance-authority": "0.7.1",
    "date-fns": "4.1.0",
    "react-day-picker": "9.4.4",
    "react-resizable-panels": "2.1.8",
    "input-otp": "1.4.1",
    "embla-carousel-react": "8.5.2"
  },
  "devDependencies": {
    "@types/react": "19.0.6",
    "@types/react-dom": "19.0.2",
    "@vitejs/plugin-react": "4.3.4",
    "typescript": "5.6.2",
    "vite": "6.0.11",
    "@tailwindcss/vite": "4.0.0",
    "tailwindcss": "4.0.0",
    "autoprefixer": "10.4.20"
  },
  "engines": {
    "node": ">=20.11.0",
    "npm": ">=10.2.0"
  }
}
```

### 3단계: .npmrc 설정 (오프라인 준비)

**`.npmrc` 파일 생성:**

```ini
# 오프라인 설치 준비
package-lock=true
save-exact=true
prefer-offline=false
audit=false
fund=false

# 캐시 설정
cache=./.npm-cache
```

---

## 의존성 완전 번들링

### 방법 1: npm pack을 이용한 번들링 (권장)

```bash
# 1. 클린 설치
rm -rf node_modules package-lock.json
npm install

# 2. package-lock.json 생성 확인
ls -la package-lock.json

# 3. 모든 의존성 다운로드 및 캐시
npm cache clean --force
npm install --prefer-offline=false

# 4. 의존성 tarball 생성
mkdir -p offline-packages
npm pack --pack-destination=./offline-packages

# 5. 모든 의존성을 tarball로 추출
node scripts/extract-dependencies.js
```

**`scripts/extract-dependencies.js` 생성:**

```javascript
/**
 * 모든 의존성을 tarball로 추출하는 스크립트
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf-8'));

const outputDir = './offline-packages';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log('📦 의존성 tarball 생성 시작...');

// package-lock.json에서 모든 패키지 추출
const packages = Object.entries(packageLock.packages || {})
  .filter(([key]) => key.startsWith('node_modules/'))
  .map(([key, value]) => ({
    name: key.replace('node_modules/', ''),
    version: value.version,
  }));

let successCount = 0;
let failCount = 0;

packages.forEach(({ name, version }, index) => {
  try {
    console.log(`[${index + 1}/${packages.length}] ${name}@${version}`);
    execSync(`npm pack ${name}@${version} --pack-destination=${outputDir}`, {
      stdio: 'pipe',
    });
    successCount++;
  } catch (error) {
    console.error(`❌ 실패: ${name}@${version}`);
    failCount++;
  }
});

console.log(`\n✅ 완료: 성공 ${successCount}, 실패 ${failCount}`);
console.log(`📁 위치: ${outputDir}/`);
```

### 방법 2: npm-offline-cache (대안)

```bash
# 1. npm-offline-cache 설치
npm install -g npm-offline-cache

# 2. 오프라인 캐시 생성
npm-offline-cache --package package.json --output offline-cache.tar.gz

# 3. 생성된 파일 확인
ls -lh offline-cache.tar.gz
```

### 방법 3: node_modules 전체 포함 (가장 단순)

```bash
# 1. 완전한 설치
rm -rf node_modules
npm install --production=false

# 2. node_modules 크기 확인
du -sh node_modules

# 3. 압축 (권장: tar.gz)
tar -czf node_modules.tar.gz node_modules/

# 4. 압축률 확인
ls -lh node_modules.tar.gz
```

**예상 크기:**

- node_modules (압축 전): ~500-800 MB
- node_modules.tar.gz (압축 후): ~150-250 MB

---

## 정적 자원 내재화

### 1. 폰트 로컬 포함

**온라인 환경에서 폰트 다운로드:**

```bash
# public/fonts 디렉토리 생성
mkdir -p public/fonts

# 예: Google Fonts에서 Noto Sans KR 다운로드
wget -P public/fonts/ https://fonts.gstatic.com/s/notosanskr/v36/Pby7FmXiEBPT4ITbgNA5CgmOelzI7g.woff2

# 또는 @fontsource 패키지 사용
npm install @fontsource/noto-sans-kr

# package.json에 추가
{
  "dependencies": {
    "@fontsource/noto-sans-kr": "^5.0.0"
  }
}
```

**`styles/fonts.css` 생성:**

```css
/**
 * 오프라인 폰트 정의
 * 외부 CDN 없이 로컬 폰트만 사용
 */

/* 방법 1: public/fonts에서 로드 */
@font-face {
  font-family: 'Noto Sans KR';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src:
    url('/fonts/NotoSansKR-Regular.woff2') format('woff2'),
    url('/fonts/NotoSansKR-Regular.woff') format('woff');
}

@font-face {
  font-family: 'Noto Sans KR';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src:
    url('/fonts/NotoSansKR-Medium.woff2') format('woff2'),
    url('/fonts/NotoSansKR-Medium.woff') format('woff');
}

/* 방법 2: @fontsource 패키지 사용 */
/* main.tsx에서 import '@fontsource/noto-sans-kr'; */

/* 시스템 폰트 폴백 */
body {
  font-family:
    'Noto Sans KR',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    sans-serif;
}
```

**`main.tsx`에서 폰트 import:**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 오프라인 폰트
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';

// 스타일
import './styles/fonts.css';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 2. 이미지 로컬 포함

```bash
# public/images 디렉토리 생성
mkdir -p public/images

# 로고, 아이콘 등 복사
cp ~/Downloads/logo.png public/images/
cp ~/Downloads/favicon.ico public/
```

**이미지 사용:**

```typescript
// ✅ 로컬 이미지 사용
import logo from '/images/logo.png';

export function Header() {
  return (
    <img src={logo} alt="PDF Formatter" />
  );
}

// ❌ 외부 URL 사용 금지
<img src="https://example.com/logo.png" />  // 오프라인에서 작동 안 함!
```

### 3. 아이콘 완전 로컬화

**Lucide React는 이미 로컬 패키지로 포함되어 있으므로 OK:**

```typescript
// ✅ 로컬 패키지 (node_modules에서 로드)
import { Menu, Ban, Circle } from 'lucide-react';

// ❌ CDN 사용 금지
<link href="https://unpkg.com/lucide@latest" />  // No!
```

### 4. CSS 외부 의존성 제거

**`index.html` 검증:**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="PDF 서식화 작성 에디터" />
    <title>PDF Formatter</title>

    <!-- ❌ 외부 CDN 링크 금지 -->
    <!-- <link href="https://fonts.googleapis.com/css2?family=..." /> -->
    <!-- <link href="https://cdn.jsdelivr.net/npm/..." /> -->

    <!-- ✅ 모든 CSS는 번들링됨 (Vite가 자동 처리) -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

---

## 오프라인 패키지 생성

### 전체 패키징 스크립트

**`scripts/package-offline.js` 생성:**

```javascript
/**
 * 오프라인 배포용 패키지 생성 스크립트
 *
 * 생성물:
 * - pdf-formatter-offline-v{version}.tar.gz
 *
 * 포함 내용:
 * - 전체 소스 코드
 * - node_modules (완전 설치됨)
 * - 빌드 결과물 (dist/)
 * - 설치 스크립트
 * - README
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const version = packageJson.version;
const packageName = `pdf-formatter-offline-v${version}`;
const outputDir = './dist-offline';

console.log('📦 오프라인 패키지 생성 시작...');
console.log(`   버전: ${version}`);

// 1. 출력 디렉토리 생성
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// 2. 클린 빌드
console.log('\n🏗️  프로덕션 빌드 실행...');
execSync('npm run build', { stdio: 'inherit' });

// 3. node_modules 설치 확인
console.log('\n📚 의존성 설치 확인...');
if (!existsSync('node_modules')) {
  console.log('   node_modules 설치 중...');
  execSync('npm install', { stdio: 'inherit' });
}

// 4. 패키징할 파일 목록 생성
const filesToInclude = [
  // 소스 코드
  'components/',
  'pages/',
  'stores/',
  'hooks/',
  'lib/',
  'utils/',
  'types/',
  'constants/',
  'styles/',
  'docs/',
  'public/',

  // 설정 파일
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',

  // 진입점
  'App.tsx',
  'main.tsx',
  'index.html',

  // 의존성 (핵심!)
  'node_modules/',

  // 빌드 결과물
  'dist/',

  // 문서
  'README.md',
  'Attributions.md',

  // 오프라인 설치 스크립트
  'offline-install.sh',
  'offline-install.bat',
];

// 5. 오프라인 설치 스크립트 생성
console.log('\n📝 설치 스크립트 생성...');

// Linux/Mac 스크립트
writeFileSync(
  'offline-install.sh',
  `#!/bin/bash
# PDF Formatter - 오프라인 설치 스크립트 (Linux/Mac)
# 버전: ${version}

set -e

echo "=================================================="
echo "  PDF Formatter v${version} - 오프라인 설치"
echo "=================================================="
echo ""

# Node.js 버전 확인
echo "🔍 Node.js 버전 확인..."
node --version || { echo "❌ Node.js가 설치되지 않았습니다."; exit 1; }

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 이상이 필요합니다. (현재: v$NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js 버전 확인 완료"
echo ""

# 의존성 이미 포함되어 있음
echo "📦 의존성 확인..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules가 이미 포함되어 있습니다."
else
  echo "❌ node_modules가 없습니다. 온라인 환경에서 다시 패키징하세요."
  exit 1
fi
echo ""

# 빌드 결과물 확인
echo "🏗️  빌드 결과물 확인..."
if [ -d "dist" ]; then
  echo "✅ 빌드 결과물이 이미 포함되어 있습니다."
else
  echo "⚠️  빌드 결과물이 없습니다. 로컬 빌드를 실행합니다..."
  npm run build
fi
echo ""

echo "=================================================="
echo "  ✅ 설치 완료!"
echo "=================================================="
echo ""
echo "다음 명령어로 서비스를 시작하세요:"
echo ""
echo "  개발 서버:  npm run dev"
echo "  미리보기:   npm run preview (dist/ 필요)"
echo ""
echo "웹 서버 배포는 dist/ 디렉토리를 사용하세요."
echo ""
`
);

// Windows 스크립트
writeFileSync(
  'offline-install.bat',
  `@echo off
REM PDF Formatter - 오프라인 설치 스크립트 (Windows)
REM 버전: ${version}

echo ==================================================
echo   PDF Formatter v${version} - 오프라인 설치
echo ==================================================
echo.

REM Node.js 버전 확인
echo 🔍 Node.js 버전 확인...
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js가 설치되지 않았습니다.
  exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 20 (
  echo ❌ Node.js 20 이상이 필요합니다.
  exit /b 1
)

echo ✅ Node.js 버전 확인 완료
echo.

REM 의존성 확인
echo 📦 의존성 확인...
if exist "node_modules" (
  echo ✅ node_modules가 이미 포함되어 있습니다.
) else (
  echo ❌ node_modules가 없습니다. 온라인 환경에서 다시 패키징하세요.
  exit /b 1
)
echo.

REM 빌드 결과물 확인
echo 🏗️ 빌드 결과물 확인...
if exist "dist" (
  echo ✅ 빌드 결과물이 이미 포함되어 있습니다.
) else (
  echo ⚠️ 빌드 결과물이 없습니다. 로컬 빌드를 실행합니다...
  call npm run build
)
echo.

echo ==================================================
echo   ✅ 설치 완료!
echo ==================================================
echo.
echo 다음 명령어로 서비스를 시작하세요:
echo.
echo   개발 서버:  npm run dev
echo   미리보기:   npm run preview (dist/ 필요)
echo.
echo 웹 서버 배포는 dist\\ 디렉토리를 사용하세요.
echo.
pause
`
);

// 실행 권한 부여 (Linux/Mac)
try {
  execSync('chmod +x offline-install.sh');
} catch (e) {
  // Windows 환경에서는 무시
}

// 6. tar.gz 생성
console.log('\n📦 압축 파일 생성...');
const tarballName = `${packageName}.tar.gz`;
const tarCommand = `tar -czf ${join(outputDir, tarballName)} ${filesToInclude.join(' ')}`;

try {
  execSync(tarCommand, { stdio: 'inherit' });
  console.log(`✅ 생성 완료: ${join(outputDir, tarballName)}`);
} catch (error) {
  console.error('❌ 압축 실패:', error.message);
  process.exit(1);
}

// 7. 체크섬 생성 (무결성 검증용)
console.log('\n🔐 체크섬 생성...');
const checksumCommand = `sha256sum ${join(outputDir, tarballName)} > ${join(outputDir, `${tarballName}.sha256`)}`;
try {
  execSync(checksumCommand);
  console.log('✅ 체크섬 생성 완료');
} catch (error) {
  console.log('⚠️  체크섬 생성 실패 (선택사항)');
}

// 8. 크기 확인
const stats = execSync(`du -sh ${join(outputDir, tarballName)}`).toString();
console.log(`\n📊 패키지 크기: ${stats.trim()}`);

// 9. 완료 메시지
console.log('\n================================================');
console.log('  ✅ 오프라인 패키지 생성 완료!');
console.log('================================================');
console.log(`\n📁 위치: ${join(outputDir, tarballName)}`);
console.log(`🔐 체크섬: ${join(outputDir, `${tarballName}.sha256`)}`);
console.log('\n다음 단계:');
console.log('1. USB/DVD/내부망으로 패키지 전송');
console.log('2. 오프라인 환경에서 압축 해제');
console.log('3. offline-install.sh (또는 .bat) 실행');
console.log('4. npm run preview 또는 웹 서버 배포\n');
```

**실행:**

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/package-offline.js

# 오프라인 패키지 생성
npm run package:offline
```

**생성 결과:**

```
dist-offline/
├── pdf-formatter-offline-v1.2.2.tar.gz       (200-400 MB)
└── pdf-formatter-offline-v1.2.2.tar.gz.sha256
```

---

## 오프라인 환경 설치

### 1단계: 패키지 전송

**방법 A: USB 드라이브**

```bash
# USB 마운트 확인
df -h | grep /media

# 복사
cp dist-offline/pdf-formatter-offline-v1.2.2.tar.gz /media/usb/
cp dist-offline/pdf-formatter-offline-v1.2.2.tar.gz.sha256 /media/usb/
```

**방법 B: DVD**

```bash
# ISO 생성
mkisofs -o pdf-formatter-offline.iso -V "PDF_FORMATTER" dist-offline/

# DVD 굽기
cdrecord -v dev=/dev/sr0 pdf-formatter-offline.iso
```

**방법 C: 내부망 파일 서버**

```bash
# SCP (SSH 필요)
scp dist-offline/pdf-formatter-offline-v1.2.2.tar.gz user@internal-server:/shared/

# 또는 SMB/NFS 마운트 후 복사
```

### 2단계: 무결성 검증 (권장)

```bash
# 오프라인 환경에서
cd /path/to/package

# 체크섬 확인
sha256sum -c pdf-formatter-offline-v1.2.2.tar.gz.sha256

# 출력: pdf-formatter-offline-v1.2.2.tar.gz: OK
```

### 3단계: 압축 해제

```bash
# 압축 해제
tar -xzf pdf-formatter-offline-v1.2.2.tar.gz

# 디렉토리 이동
cd pdf-formatter-offline-v1.2.2

# 구조 확인
ls -la
```

### 4단계: 설치 스크립트 실행

**Linux/Mac:**

```bash
chmod +x offline-install.sh
./offline-install.sh
```

**Windows:**

```cmd
offline-install.bat
```

**수동 설치 (스크립트 실패 시):**

```bash
# Node.js 버전 확인
node --version

# node_modules 확인
ls -la node_modules

# 빌드 (필요시)
npm run build
```

---

## 빌드 및 배포

### 개발 서버 실행 (테스트용)

```bash
# 개발 서버 (HMR 포함)
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

### 프로덕션 빌드 (이미 포함됨)

```bash
# 빌드 (이미 dist/에 포함되어 있음)
npm run build

# dist/ 확인
ls -la dist/
```

**dist/ 구조:**

```
dist/
├── index.html
├── assets/
│   ├── index-{hash}.js        (메인 번들)
│   ├── index-{hash}.css       (스타일 번들)
│   ├── react-vendor-{hash}.js (React 청크)
│   ├── ui-vendor-{hash}.js    (UI 청크)
│   └── ...
├── fonts/                      (폰트)
├── images/                     (이미지)
└── favicon.ico
```

### 웹 서버 배포

#### 방법 1: Nginx (권장)

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 모든 요청을 index.html로 (SPA 라우팅)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 자원 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**배포:**

```bash
# dist/ 디렉토리를 Nginx 루트로 복사
sudo cp -r dist/* /usr/share/nginx/html/

# Nginx 재시작
sudo systemctl restart nginx

# 확인
curl http://localhost
```

#### 방법 2: Apache

**`.htaccess`:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 캐싱
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>
```

**배포:**

```bash
# dist/ 디렉토리를 Apache 루트로 복사
sudo cp -r dist/* /var/www/html/

# Apache 재시작
sudo systemctl restart apache2
```

#### 방법 3: 간단한 HTTP 서버 (테스트용)

```bash
# Node.js 내장 서버
cd dist
npx serve -s . -l 3000

# Python 간이 서버
cd dist
python3 -m http.server 8080

# 브라우저에서 확인
# http://localhost:3000 (또는 8080)
```

---

## 검증 및 테스트

### 오프라인 체크리스트

**네트워크 완전 차단 테스트:**

```bash
# 1. 네트워크 인터페이스 다운 (테스트용)
sudo ifconfig eth0 down
sudo ifconfig wlan0 down

# 2. 애플리케이션 시작
npm run dev  # 또는 npm run preview

# 3. 브라우저에서 확인
# - 모든 페이지 로드 확인
# - 이미지 로드 확인
# - 폰트 렌더링 확인
# - 아이콘 표시 확인
# - 에디터 기능 테스트

# 4. 브라우저 개발자 도구 확인
# - Network 탭에서 외부 요청 없는지 확인
# - Console 탭에서 에러 없는지 확인

# 5. 네트워크 복구
sudo ifconfig eth0 up
```

### 자동 검증 스크립트

**`scripts/verify-offline.sh`:**

```bash
#!/bin/bash
# 오프라인 배포 검증 스크립트

echo "🔍 오프라인 배포 검증 시작..."
echo ""

# 1. 외부 URL 검색
echo "1️⃣  외부 URL 검색..."
EXTERNAL_URLS=$(grep -r "https://" --include="*.html" --include="*.tsx" --include="*.ts" --include="*.css" dist/ || true)

if [ -n "$EXTERNAL_URLS" ]; then
  echo "❌ 외부 URL이 발견되었습니다:"
  echo "$EXTERNAL_URLS"
  exit 1
else
  echo "✅ 외부 URL 없음"
fi
echo ""

# 2. CDN 링크 검색
echo "2️⃣  CDN 링크 검색..."
CDN_LINKS=$(grep -r "cdn\." --include="*.html" --include="*.tsx" --include="*.ts" dist/ || true)

if [ -n "$CDN_LINKS" ]; then
  echo "❌ CDN 링크가 발견되었습니다:"
  echo "$CDN_LINKS"
  exit 1
else
  echo "✅ CDN 링크 없음"
fi
echo ""

# 3. 필수 파일 존재 확인
echo "3️⃣  필수 파일 확인..."
REQUIRED_FILES=(
  "dist/index.html"
  "dist/assets/index-*.js"
  "dist/assets/index-*.css"
)

for file_pattern in "${REQUIRED_FILES[@]}"; do
  if ! ls $file_pattern 1> /dev/null 2>&1; then
    echo "❌ 필수 파일 없음: $file_pattern"
    exit 1
  fi
done
echo "✅ 필수 파일 모두 존재"
echo ""

# 4. node_modules 크기 확인
echo "4️⃣  의존성 크기 확인..."
if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
  echo "✅ node_modules: $NODE_MODULES_SIZE"
else
  echo "❌ node_modules가 없습니다"
  exit 1
fi
echo ""

# 5. 빌드 결과물 크기 확인
echo "5️⃣  빌드 결과물 크기 확인..."
if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist | cut -f1)
  echo "✅ dist: $DIST_SIZE"
else
  echo "❌ dist가 없습니다"
  exit 1
fi
echo ""

echo "================================================"
echo "  ✅ 모든 검증 통과!"
echo "================================================"
echo ""
echo "오프라인 배포 준비가 완료되었습니다."
echo ""
```

**실행:**

```bash
chmod +x scripts/verify-offline.sh
./scripts/verify-offline.sh
```

---

## 트러블슈팅

### 문제 1: Node.js 버전 불일치

**증상:**

```
Error: The engine "node" is incompatible with this module.
```

**해결:**

```bash
# Node.js 버전 확인
node --version

# 20.11.0 이상 필요
# Node.js 바이너리를 함께 배포하거나
# 오프라인 환경에 미리 설치
```

### 문제 2: node_modules 손상

**증상:**

```
Error: Cannot find module 'react'
```

**해결:**

```bash
# node_modules 재압축 (온라인 환경)
rm -rf node_modules
npm install
tar -czf node_modules.tar.gz node_modules/

# 오프라인 환경에서 압축 해제
tar -xzf node_modules.tar.gz
```

### 문제 3: 빌드 실패

**증상:**

```
Error: Cannot read file tsconfig.json
```

**해결:**

```bash
# 모든 설정 파일 포함 확인
ls -la tsconfig.json vite.config.ts

# 누락된 파일이 있다면 온라인 환경에서 재패키징
```

### 문제 4: 폰트 로드 실패

**증상:**

- 폰트가 시스템 기본 폰트로 표시됨
- 브라우저 개발자 도구에 404 에러

**해결:**

```bash
# 1. 폰트 파일 확인
ls -la public/fonts/

# 2. 빌드 후 dist/fonts/ 확인
ls -la dist/fonts/

# 3. fonts.css 경로 확인
cat styles/fonts.css
```

### 문제 5: 이미지 로드 실패

**증상:**

- 이미지가 표시되지 않음
- 브라우저 개발자 도구에 404 에러

**해결:**

```bash
# 1. 이미지 파일 확인
ls -la public/images/

# 2. 빌드 후 dist/images/ 확인
ls -la dist/images/

# 3. import 경로 확인
# ✅ import logo from '/images/logo.png';
# ❌ import logo from 'https://example.com/logo.png';
```

### 문제 6: 라우팅 404 에러

**증상:**

- / 는 작동하지만 /e-link/editor는 404

**해결:**

**Nginx:**

```nginx
location / {
    try_files $uri $uri/ /index.html;  # 필수!
}
```

**Apache:**

```apache
RewriteRule . /index.html [L]  # 필수!
```

### 문제 7: 압축 파일 손상

**증상:**

```
tar: Unexpected EOF in archive
```

**해결:**

```bash
# 체크섬 확인
sha256sum -c pdf-formatter-offline-v1.2.2.tar.gz.sha256

# 재다운로드 또는 재패키징
```

### 문제 8: 권한 문제 (Linux)

**증상:**

```
Permission denied
```

**해결:**

```bash
# 실행 권한 부여
chmod +x offline-install.sh

# 소유권 확인
ls -la

# 필요시 소유권 변경
sudo chown -R $USER:$USER .
```

---

## 보안 고려사항

### 1. HTTPS 설정 (권장)

**자체 서명 인증서 생성:**

```bash
# OpenSSL로 인증서 생성
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pdf-formatter.key \
  -out /etc/ssl/certs/pdf-formatter.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=MyOrg/CN=pdf-formatter.local"
```

**Nginx HTTPS 설정:**

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/ssl/certs/pdf-formatter.crt;
    ssl_certificate_key /etc/ssl/private/pdf-formatter.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP -> HTTPS 리다이렉트
server {
    listen 80;
    server_name localhost;
    return 301 https://$host$request_uri;
}
```

### 2. 파일 권한 설정

```bash
# 읽기 전용으로 설정
chmod -R 755 dist/
chmod 644 dist/index.html
chmod 644 dist/assets/*

# 웹 서버 사용자만 접근
chown -R www-data:www-data dist/
```

### 3. 보안 헤더 (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 체크리스트

### 온라인 환경 (패키징)

- [ ] Node.js 20+ 설치
- [ ] 프로젝트 클론/생성
- [ ] package.json 준비
- [ ] npm install 실행
- [ ] 폰트 로컬 다운로드
- [ ] 이미지 로컬 포함
- [ ] 외부 URL 모두 제거
- [ ] npm run build 실행
- [ ] node_modules 포함
- [ ] 오프라인 패키지 생성
- [ ] 체크섬 생성
- [ ] 검증 스크립트 실행

### 오프라인 환경 (설치)

- [ ] Node.js 20+ 설치 (또는 바이너리 포함)
- [ ] 패키지 전송 (USB/DVD/내부망)
- [ ] 체크섬 검증
- [ ] 압축 해제
- [ ] offline-install.sh 실행
- [ ] node_modules 확인
- [ ] dist/ 확인
- [ ] 웹 서버 설정
- [ ] 방화벽 설정 (필요시)
- [ ] 브라우저 테스트
- [ ] 네트워크 차단 테스트
- [ ] 전체 기능 검증

---

## 참고 자료

### 관련 문서

- [PROJECT_SETUP.md](PROJECT_SETUP.md) - 일반 프로젝트 구성
- [CODE_STRUCTURE.md](CODE_STRUCTURE.md) - 코드 구조
- [DEPENDENCIES.md](DEPENDENCIES.md) - 의존성 목록

### 외부 리소스 (온라인 환경에서만 접근)

- [Vite Build 최적화](https://vite.dev/guide/build.html)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [npm-pack 문서](https://docs.npmjs.com/cli/v10/commands/npm-pack)

---

**오프라인 배포 완료!**

이 가이드를 따라 외부 네트워크 없이 완전한 자체 완결형 애플리케이션을 배포하세요.

**문서 버전:** 1.2.2  
**마지막 검증:** 2025-10-01
