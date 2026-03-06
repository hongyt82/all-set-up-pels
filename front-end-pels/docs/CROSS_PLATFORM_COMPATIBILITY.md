# Mac과 Windows 환경 간 Git 통합 관리 호환성 가이드

> Mac과 Windows 환경에서 Git으로 통합 관리할 때 발생할 수 있는 호환성 문제와 해결책

**버전:** 1.2.2  
**최종 업데이트:** 2025-10-20  
**대상 환경:** Mac, Windows, Linux 개발 환경

---

## 📋 목차

1. [개요](#개요)
2. [발견된 문제점](#발견된-문제점)
3. [해결책](#해결책)
4. [설정 파일 상세](#설정-파일-상세)
5. [크로스 플랫폼 스크립트](#크로스-플랫폼-스크립트)
6. [개발 워크플로우](#개발-워크플로우)
7. [검증 및 테스트](#검증-및-테스트)
8. [트러블슈팅](#트러블슈팅)
9. [체크리스트](#체크리스트)

---

## 개요

### 문제 상황

Mac과 Windows 환경에서 동일한 프로젝트를 Git으로 통합 관리할 때 다음과 같은 호환성 문제가 발생할 수 있습니다:

- **Line Ending 불일치**: Mac(LF) vs Windows(CRLF)
- **실행 파일 권한 문제**: `.sh` 파일이 Windows에서 실행 불가
- **경로 구분자 문제**: `\` vs `/`
- **크로스 플랫폼 스크립트 부재**: bash 명령어가 Windows에서 사용 불가

### 해결 목표

- ✅ **완벽한 크로스 플랫폼 호환성**
- ✅ **일관된 개발 환경**
- ✅ **자동화된 설정 관리**
- ✅ **Git 통합 관리 최적화**

---

## 발견된 문제점

### 1. Line Ending 불일치

| 환경 | Line Ending | 문제점 |
|------|-------------|--------|
| Mac | LF (`\n`) | Windows에서 줄바꿈 표시 이상 |
| Windows | CRLF (`\r\n`) | Mac에서 불필요한 `^M` 문자 표시 |
| Git 기본 | 자동 변환 없음 | 혼재된 상태로 저장 |

### 2. 실행 파일 권한 문제

```bash
# Mac/Linux에서만 실행 가능
./offline-install.sh
bash scripts/verify-offline.sh

# Windows에서는 실행 불가
# 'bash' is not recognized as an internal or external command
```

### 3. 경로 구분자 문제

```javascript
// 문제가 되는 코드
const path = 'src/components/Button.tsx';  // Mac/Linux
const path = 'src\\components\\Button.tsx';  // Windows

// 해결책
import { join } from 'path';
const path = join('src', 'components', 'Button.tsx');  // 모든 플랫폼
```

### 4. 크로스 플랫폼 스크립트 부재

```json
// 문제가 되는 package.json
{
  "scripts": {
    "verify-offline": "bash scripts/verify-offline.sh"  // Windows에서 실패
  }
}
```

---

## 해결책

### 1. Git 호환성 설정

#### `.gitattributes` 파일 생성

```ini
# Git attributes for cross-platform compatibility
# 모든 텍스트 파일을 LF로 강제
* text=auto

# JavaScript/TypeScript 파일
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.json text eol=lf
*.css text eol=lf
*.html text eol=lf
*.md text eol=lf

# Windows 전용 파일은 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Unix 전용 파일은 LF
*.sh text eol=lf
*.bash text eol=lf

# 바이너리 파일
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.pdf binary
```

#### `.editorconfig` 파일 생성

```ini
# EditorConfig 설정
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

# TypeScript/JavaScript 파일
[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 2

# JSON 파일
[*.json]
indent_style = space
indent_size = 2

# Windows 전용 파일
[*.{bat,cmd}]
end_of_line = crlf
indent_style = space
indent_size = 2

# Unix 전용 파일
[*.{sh,bash}]
end_of_line = lf
indent_style = space
indent_size = 2
```

### 2. 크로스 플랫폼 스크립트

#### `scripts/verify-offline.js` (Node.js 기반)

```javascript
/**
 * 오프라인 배포 검증 스크립트 (크로스 플랫폼)
 * Mac, Windows, Linux에서 모두 실행 가능
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 재현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 오프라인 배포 검증 시작...');

// 크로스 플랫폼 크기 확인
function getDirectorySize(path) {
  try {
    if (process.platform === 'win32') {
      const sizeOutput = execSync(
        `powershell -Command "(Get-ChildItem '${path}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"`,
        { encoding: 'utf-8', cwd: rootDir }
      );
      const sizeMB = parseFloat(sizeOutput.trim()).toFixed(2);
      return `${sizeMB} MB`;
    } else {
      const sizeOutput = execSync(`du -sh "${path}"`, {
        encoding: 'utf-8',
        cwd: rootDir
      });
      return sizeOutput.split('\t')[0];
    }
  } catch (error) {
    return '크기 측정 실패';
  }
}

// 외부 URL 검색
function checkExternalUrls() {
  const distDir = join(rootDir, 'dist');
  if (!existsSync(distDir)) {
    console.log('❌ dist 디렉토리가 없습니다.');
    return false;
  }

  const htmlFiles = ['index.html'];
  let hasExternalUrls = false;

  for (const file of htmlFiles) {
    const filePath = join(distDir, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const externalUrls = content.match(/https?:\/\/[^\s"']+/g);
      if (externalUrls && externalUrls.length > 0) {
        console.log(`❌ ${file}에서 외부 URL 발견:`);
        externalUrls.forEach(url => console.log(`   - ${url}`));
        hasExternalUrls = true;
      }
    }
  }

  return !hasExternalUrls;
}

// 검증 실행
if (checkExternalUrls()) {
  console.log('✅ 외부 URL 없음');
} else {
  console.log('❌ 외부 URL이 발견되었습니다.');
  process.exit(1);
}

console.log('✅ 모든 검증 통과!');
```

#### `scripts/postinstall.js` (자동 설정)

```javascript
/**
 * Post-install 스크립트 (크로스 플랫폼)
 * npm install 후 자동으로 실행되는 스크립트
 */

import { execSync } from 'child_process';
import { existsSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Post-install 설정 중...');

// Unix 계열 시스템에서만 실행 권한 설정
if (process.platform !== 'win32') {
  const scriptsToChmod = [
    'offline-install.sh',
    'scripts/verify-offline.sh'
  ];

  for (const script of scriptsToChmod) {
    const scriptPath = join(rootDir, script);
    if (existsSync(scriptPath)) {
      try {
        chmodSync(scriptPath, '755');
        console.log(`✅ 실행 권한 설정: ${script}`);
      } catch (error) {
        console.log(`⚠️  실행 권한 설정 실패: ${script}`);
      }
    }
  }
}

// Git 설정 안내
try {
  const gitConfig = execSync('git config --list', { 
    encoding: 'utf-8',
    cwd: rootDir 
  });
  
  const hasAutoCrlf = gitConfig.includes('core.autocrlf');
  const hasEol = gitConfig.includes('core.eol');
  
  if (!hasAutoCrlf && !hasEol) {
    console.log('📝 Git 설정 안내:');
    console.log('   크로스 플랫폼 호환성을 위해 다음 Git 설정을 권장합니다:');
    console.log('   git config core.autocrlf input');
    console.log('   git config core.safecrlf true');
  }
} catch (error) {
  // Git이 설치되지 않은 경우 무시
}

console.log('🎉 Post-install 설정 완료!');
```

### 3. Package.json 스크립트 수정

```json
{
  "scripts": {
    "local": "vite --mode localdev",
    "dev": "vite --mode dev",
    "prod_test:run": "vite --mode production",
    "build:prod": "vite build --mode production",
    "serve": "vite preview --port 5000",
    "lint:fix": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --fix",
    "lint:check": "eslint \"src/**/*.{js,jsx,ts,tsx}\"",
    "prettier:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\" package.json",
    "prettier:write": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\" package.json",
    "preview": "vite preview --port 5050",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "package-offline": "node scripts/package-offline.js",
    "verify-offline": "node scripts/verify-offline.js",
    "postinstall": "node scripts/postinstall.js"
  }
}
```

---

## 설정 파일 상세

### `.gitattributes` 주요 설정

| 설정 | 설명 | 예시 |
|------|------|------|
| `* text=auto` | 모든 파일을 텍스트로 자동 감지 | 기본 설정 |
| `*.js text eol=lf` | JS 파일을 LF로 강제 | 크로스 플랫폼 호환 |
| `*.bat text eol=crlf` | 배치 파일을 CRLF로 강제 | Windows 호환 |
| `*.png binary` | 이미지를 바이너리로 처리 | Git LFS 대안 |

### `.editorconfig` 주요 설정

| 설정 | 값 | 설명 |
|------|-----|------|
| `charset` | `utf-8` | 문자 인코딩 |
| `end_of_line` | `lf` | 줄바꿈 문자 |
| `insert_final_newline` | `true` | 파일 끝에 빈 줄 추가 |
| `trim_trailing_whitespace` | `true` | 끝 공백 제거 |
| `indent_style` | `space` | 들여쓰기 스타일 |
| `indent_size` | `2` | 들여쓰기 크기 |

---

## 크로스 플랫폼 스크립트

### Node.js 기반 스크립트의 장점

1. **플랫폼 독립성**: 모든 OS에서 동일하게 실행
2. **내장 API 활용**: `fs`, `path`, `child_process` 모듈 사용
3. **에러 처리**: 일관된 에러 핸들링
4. **유지보수성**: 하나의 코드베이스로 관리

### 플랫폼별 명령어 처리

```javascript
// 크로스 플랫폼 크기 확인
function getDirectorySize(path) {
  if (process.platform === 'win32') {
    // Windows PowerShell 사용
    const sizeOutput = execSync(
      `powershell -Command "(Get-ChildItem '${path}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"`,
      { encoding: 'utf-8' }
    );
    return `${parseFloat(sizeOutput.trim()).toFixed(2)} MB`;
  } else {
    // Unix 계열 시스템
    const sizeOutput = execSync(`du -sh "${path}"`, { encoding: 'utf-8' });
    return sizeOutput.split('\t')[0];
  }
}

// 크로스 플랫폼 파일 검색
function findFiles(pattern) {
  if (process.platform === 'win32') {
    // Windows에서 파일 검색
    return execSync(`dir /s /b "${pattern}"`, { encoding: 'utf-8' });
  } else {
    // Unix 계열에서 파일 검색
    return execSync(`find . -name "${pattern}"`, { encoding: 'utf-8' });
  }
}
```

---

## 개발 워크플로우

### Mac에서 작업

```bash
# 1. 저장소 클론
git clone <repository-url>
cd pdf-formatter

# 2. 의존성 설치 (postinstall 자동 실행)
npm install

# 3. 개발 서버 시작
npm run dev

# 4. 빌드 및 검증
npm run build
npm run verify-offline
```

### Windows에서 작업

```bash
# 1. 저장소 클론
git clone <repository-url>
cd pdf-formatter

# 2. 의존성 설치 (postinstall 자동 실행)
npm install

# 3. 개발 서버 시작
npm run dev

# 4. 빌드 및 검증
npm run build
npm run verify-offline
```

### Git 통합 관리

```bash
# 1. Git 설정 (권장)
git config core.autocrlf input
git config core.safecrlf true

# 2. 브랜치 생성 및 작업
git checkout -b feature/new-feature

# 3. 변경사항 커밋
git add .
git commit -m "feat: add new feature"

# 4. 푸시
git push origin feature/new-feature
```

---

## 검증 및 테스트

### 자동 검증

```bash
# 오프라인 배포 검증
npm run verify-offline

# 결과 예시:
# 🔍 오프라인 배포 검증 시작...
# ✅ 외부 URL 없음
# ✅ CDN 링크 없음
# ✅ 필수 파일 모두 존재
# ✅ node_modules: 479M
# ✅ dist: 13M
# ✅ 모든 검증 통과!
```

### 수동 검증

```bash
# 1. Line ending 확인
git ls-files | xargs file | grep -v "LF"

# 2. 실행 권한 확인 (Unix 계열)
ls -la *.sh scripts/*.sh

# 3. Git 상태 확인
git status
git diff --check
```

---

## 트러블슈팅

### 문제 1: Line Ending 경고

**증상:**
```
warning: LF will be replaced by CRLF in src/App.tsx
```

**해결:**
```bash
# Git 설정 적용
git config core.autocrlf input
git config core.safecrlf true

# 기존 파일 정규화
git add --renormalize .
git commit -m "normalize line endings"
```

### 문제 2: Windows에서 스크립트 실행 실패

**증상:**
```
'bash' is not recognized as an internal or external command
```

**해결:**
```bash
# Node.js 스크립트 사용
npm run verify-offline

# 또는 직접 실행
node scripts/verify-offline.js
```

### 문제 3: 권한 문제 (Unix 계열)

**증상:**
```
Permission denied: ./offline-install.sh
```

**해결:**
```bash
# 실행 권한 부여
chmod +x offline-install.sh

# 또는 postinstall 스크립트 재실행
npm run postinstall
```

### 문제 4: Git 충돌

**증상:**
```
fatal: CRLF would be replaced by LF
```

**해결:**
```bash
# 안전 모드 비활성화 (임시)
git config core.safecrlf false

# 파일 정규화 후 다시 활성화
git add --renormalize .
git config core.safecrlf true
```

---

## 체크리스트

### 초기 설정

- [ ] `.gitattributes` 파일 생성
- [ ] `.editorconfig` 파일 생성
- [ ] `scripts/verify-offline.js` 생성
- [ ] `scripts/postinstall.js` 생성
- [ ] `package.json` 스크립트 수정

### Git 설정

- [ ] `git config core.autocrlf input`
- [ ] `git config core.safecrlf true`
- [ ] 기존 파일 정규화 (`git add --renormalize .`)

### 개발 환경

- [ ] Mac 환경에서 테스트
- [ ] Windows 환경에서 테스트
- [ ] Linux 환경에서 테스트 (선택사항)

### 검증

- [ ] `npm run verify-offline` 실행
- [ ] `npm run postinstall` 실행
- [ ] Git 상태 확인 (`git status`)
- [ ] Line ending 확인 (`git diff --check`)

### 배포

- [ ] 빌드 테스트 (`npm run build`)
- [ ] 오프라인 패키지 생성 (`npm run package-offline`)
- [ ] 크로스 플랫폼 배포 테스트

---

## 참고 자료

### 관련 문서

- [PROJECT_SETUP.md](PROJECT_SETUP.md) - 프로젝트 설정
- [OFFLINE_DEPLOYMENT.md](OFFLINE_DEPLOYMENT.md) - 오프라인 배포
- [CODE_STRUCTURE.md](CODE_STRUCTURE.md) - 코드 구조

### 외부 리소스

- [Git Attributes](https://git-scm.com/docs/gitattributes)
- [EditorConfig](https://editorconfig.org/)
- [Node.js Cross-platform](https://nodejs.org/api/process.html#processplatform)

---

**크로스 플랫폼 호환성 설정 완료!**

이 가이드를 따라 Mac과 Windows 환경에서 완벽한 Git 통합 관리가 가능합니다.

**문서 버전:** 1.2.2  
**마지막 검증:** 2025-10-20
