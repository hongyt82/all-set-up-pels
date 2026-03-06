# 🚀 프로젝트 시작 가이드

PDF Formatter 프로젝트를 처음 받은 후 구동하기 위한 완전한 가이드입니다.

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [프로젝트 클론](#프로젝트-클론)
3. [의존성 설치](#의존성-설치)
4. [개발 서버 실행](#개발-서버-실행)
5. [프로덕션 빌드](#프로덕션-빌드)
6. [오프라인 배포](#오프라인-배포)
7. [문제 해결](#문제-해결)
8. [추가 설정](#추가-설정)

---

## 🖥️ 시스템 요구사항

### 필수 요구사항
- **Node.js**: 18.0.0 이상 (LTS 버전 권장)
- **npm**: 8.0.0 이상 (Node.js와 함께 설치됨)
- **Git**: 최신 버전
- **운영체제**: Windows, macOS, Linux

### 권장 사양
- **메모리**: 8GB 이상
- **디스크 공간**: 2GB 이상 여유 공간
- **브라우저**: Chrome, Firefox, Safari, Edge (최신 버전)

### Node.js 설치 확인
```bash
# Node.js 버전 확인
node --version
# v18.0.0 이상이어야 함

# npm 버전 확인
npm --version
# v8.0.0 이상이어야 함
```

---

## 📥 프로젝트 클론

### 1. 저장소 클론
```bash
# HTTPS로 클론
git clone https://github.com/your-username/pdf-form-argu.git

# 또는 SSH로 클론 (SSH 키 설정된 경우)
git clone git@github.com:your-username/pdf-form-argu.git
```

### 2. 프로젝트 디렉토리로 이동
```bash
cd pdf-form-argu
```

### 3. 프로젝트 구조 확인
```bash
# 프로젝트 구조 확인
ls -la

# 주요 디렉토리 구조
tree -L 2 -I 'node_modules|dist'
```

**예상 출력:**
```
pdf-form-argu/
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── utils/
│   └── ...
├── public/
├── docs/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 📦 의존성 설치

### 1. 패키지 설치
```bash
# 모든 의존성 설치 (권장)
npm install

# 또는 yarn 사용 (yarn이 설치된 경우)
yarn install

# 또는 pnpm 사용 (pnpm이 설치된 경우)
pnpm install
```

### 2. 설치 확인
```bash
# 설치된 패키지 확인
npm list --depth=0

# 의존성 트리 확인
npm list
```

### 3. 설치 완료 확인
```bash
# package.json의 scripts 확인
npm run

# 예상 출력:
# Lifecycle scripts included in pdf-formatter:
#   dev
#     vite --mode development
#   build
#     tsc && vite build
#   serve
#     vite preview
#   lint
#     eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
#   prettier
#     prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
```

---

## 🚀 개발 서버 실행

### 1. 개발 서버 시작
```bash
# 개발 서버 실행
npm run dev

# 또는
npm start
```

### 2. 서버 실행 확인
```bash
# 예상 출력:
#   VITE v6.3.6  ready in 287 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

### 3. 브라우저에서 확인
- **로컬 접속**: http://localhost:5173/
- **네트워크 접속**: http://[your-ip]:5173/

### 4. 개발 서버 기능
- **HMR (Hot Module Replacement)**: 코드 변경 시 자동 새로고침
- **TypeScript 컴파일**: 실시간 타입 체크
- **ESLint 통합**: 코드 품질 검사
- **Prettier 통합**: 코드 포맷팅

---

## 🏗️ 프로덕션 빌드

### 1. 빌드 실행
```bash
# 프로덕션 빌드
npm run build

# 예상 출력:
# ✓ 1718 modules transformed.
# ✓ built in 1.57s
# dist/index.html                   0.44 kB │ gzip:   0.30 kB
# dist/assets/index-BHpUIU4M.css  220.60 kB │ gzip:  37.20 kB
# dist/assets/index-BkXsM2sa.js   378.58 kB │ gzip: 117.59 kB
```

### 2. 빌드 결과 확인
```bash
# 빌드된 파일 확인
ls -la dist/

# 빌드된 파일 크기 확인
du -sh dist/*
```

### 3. 빌드 서버 실행
```bash
# 빌드된 파일 미리보기
npm run serve

# 예상 출력:
#   ➜  Local:   http://localhost:4173/
#   ➜  Network: use --host to expose
```

---

## 📦 오프라인 배포

### 1. 오프라인 패키지 생성
```bash
# 오프라인 배포 패키지 생성
npm run package-offline

# 예상 출력:
# ✅ 오프라인 패키지 생성 완료
# 📦 패키지 위치: dist-offline/
# 📁 파일: pdf-formatter-offline-v1.2.1.tar.gz
# 🔐 체크섬: pdf-formatter-offline-v1.2.1.tar.gz.sha256
```

### 2. 오프라인 패키지 확인
```bash
# 오프라인 패키지 내용 확인
ls -la dist-offline/

# 체크섬 확인
cat dist-offline/pdf-formatter-offline-v1.2.1.tar.gz.sha256
```

### 3. 오프라인 배포
```bash
# 오프라인 환경에서 압축 해제
tar -xzf pdf-formatter-offline-v1.2.1.tar.gz

# 웹 서버로 서빙
cd pdf-formatter-offline-v1.2.1/
python -m http.server 8000
# 또는
npx serve .
```

---

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1. Node.js 버전 문제
```bash
# 문제: Node.js 버전이 낮은 경우
# 해결: Node.js 업그레이드
nvm install 18
nvm use 18

# 또는 직접 설치
# https://nodejs.org/ 에서 LTS 버전 다운로드
```

#### 2. 포트 충돌 문제
```bash
# 문제: 포트 5173이 이미 사용 중
# 해결: 다른 포트 사용
npm run dev -- --port 3000

# 또는 환경변수로 설정
PORT=3000 npm run dev
```

#### 3. 의존성 설치 실패
```bash
# 문제: npm install 실패
# 해결: 캐시 정리 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. TypeScript 컴파일 오류
```bash
# 문제: TypeScript 컴파일 오류
# 해결: 타입 체크만 실행
npx tsc --noEmit

# 또는 특정 파일만 체크
npx tsc --noEmit src/components/EditorPage.tsx
```

#### 5. ESLint 오류
```bash
# 문제: ESLint 오류
# 해결: 자동 수정
npm run lint -- --fix

# 또는 특정 파일만 수정
npx eslint src/components/EditorPage.tsx --fix
```

#### 6. 빌드 실패
```bash
# 문제: 빌드 실패
# 해결: 단계별 확인
# 1. TypeScript 컴파일 확인
npx tsc --noEmit

# 2. ESLint 확인
npm run lint

# 3. 빌드 재시도
npm run build
```

### 로그 확인
```bash
# 개발 서버 로그 확인
npm run dev 2>&1 | tee dev.log

# 빌드 로그 확인
npm run build 2>&1 | tee build.log
```

---

## ⚙️ 추가 설정

### 1. 개발 환경 설정

#### VS Code 설정 (권장)
```bash
# VS Code 확장 프로그램 설치
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
```

#### 환경변수 설정
```bash
# .env.local 파일 생성
echo "VITE_APP_VERSION=1.2.1" > .env.local
echo "VITE_APP_NAME=PDF Formatter" >> .env.local
```

### 2. Git 설정

#### Git Hooks 설정
```bash
# Husky 설치 (이미 설정되어 있음)
npm run prepare

# 커밋 전 자동 실행되는 명령어들
# - ESLint 체크
# - Prettier 포맷팅
# - TypeScript 컴파일 체크
```

#### 브랜치 전략
```bash
# 개발 브랜치 생성
git checkout -b feature/new-feature

# 커밋 전 체크
git add .
npm run lint
npm run prettier
git commit -m "feat: 새로운 기능 추가"
```

### 3. 성능 최적화

#### 번들 분석
```bash
# 번들 크기 분석
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

#### 메모리 사용량 모니터링
```bash
# Node.js 메모리 사용량 확인
node --max-old-space-size=4096 node_modules/.bin/vite
```

---

## 📚 추가 리소스

### 관련 문서
- [프로젝트 설정 가이드](./PROJECT_SETUP.md)
- [코드 구조 가이드](./CODE_STRUCTURE.md)
- [오프라인 배포 가이드](./OFFLINE_DEPLOYMENT.md)
- [에러 처리 가이드](./ERROR_HANDLING_GUIDE.md)

### 유용한 명령어
```bash
# 프로젝트 상태 확인
npm run

# 의존성 업데이트 확인
npm outdated

# 보안 취약점 확인
npm audit

# 패키지 정보 확인
npm info react

# 글로벌 패키지 확인
npm list -g --depth=0
```

### 지원 및 문의
- **이슈 리포트**: GitHub Issues
- **문서 개선**: Pull Request
- **기능 요청**: GitHub Discussions

---

## ✅ 체크리스트

프로젝트 시작 전 확인사항:

- [ ] Node.js 18.0.0 이상 설치됨
- [ ] npm 8.0.0 이상 설치됨
- [ ] Git 설치됨
- [ ] 프로젝트 클론 완료
- [ ] `npm install` 실행 완료
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저에서 http://localhost:5173 접속 가능
- [ ] `npm run build` 실행 성공
- [ ] `npm run serve` 실행 성공
- [ ] 오프라인 패키지 생성 성공

---

**🎉 축하합니다! PDF Formatter 프로젝트가 성공적으로 구동되었습니다.**

이제 개발을 시작할 수 있습니다. 추가 질문이나 문제가 있으면 관련 문서를 참조하거나 이슈를 등록해주세요.
