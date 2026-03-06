# PDF Formatter - 프로젝트 구성 가이드

> React + Vite + TypeScript 기반 PDF 서식화 에디터의 개발 스펙 및 설정 가이드

**문서 버전:** 2.1.0  
**최종 업데이트:** 2025-02-20

---

## 목차

1. [기술 스택](#기술-스택)
2. [의존성 버전 정책 (package.json)](#의존성-버전-정책-packagejson)
3. [보안: minimatch overrides](#보안-minimatch-overrides)
4. [요구사항](#요구사항)
5. [프로젝트 초기화](#프로젝트-초기화)
6. [의존성 설치](#의존성-설치)
7. [설정 파일](#설정-파일)
8. [폴더 구조](#폴더-구조)
9. [환경 변수](#환경-변수)
10. [빌드 및 배포](#빌드-및-배포)
11. [개발 환경 구성](#개발-환경-구성)
12. [체크리스트](#체크리스트)
13. [문제 해결](#문제-해결)

---

## 기술 스택

### 핵심 기술 (현재 package.json 기준)

| 카테고리        | 기술           | 버전     | 용도                 |
| --------------- | -------------- | -------- | -------------------- |
| **프레임워크**  | React          | 18.3.1   | UI 라이브러리        |
| **언어**        | TypeScript     | 5.9.3    | 타입 안전성          |
| **빌드 도구**   | Vite           | 6.4.1    | 개발 서버 & 빌드     |
| **라우팅**      | React Router   | 6.30.3   | 클라이언트 라우팅    |
| **상태 관리**   | Zustand        | 5.0.11   | 전역 상태 관리       |
| **스타일링**    | Tailwind CSS   | 4.2.0    | 유틸리티 CSS         |
| **아이콘**      | Lucide React   | 0.487.0  | SVG 아이콘           |
| **PDF**         | pdf-lib        | 1.17.1   | PDF 생성/편집        |
| **폼**          | React Hook Form| 7.55.0   | 폼 상태/검증         |

### 기타 주요 라이브러리

- Radix UI (다이얼로그, 드롭다운, 토스트 등), date-fns, recharts, sonner, vaul, clsx, tailwind-merge, idb-keyval, axios 등  
- 개발: ESLint 8.57.1, typescript-eslint 8.56.0, @vitejs/plugin-react 4.7.0, PostCSS, Autoprefixer

---

## 의존성 버전 정책 (package.json)

이 프로젝트는 **재현 가능한 빌드**를 위해 아래 정책을 사용합니다.

### 1. 버전 고정 (Exact Versions)

- **dependencies**와 **devDependencies** 모두 **정확한 버전만** 기입합니다.
- `^`(caret), `~`(tilde) 등 범위 지정을 사용하지 않습니다.

**예시 (권장):**

```json
"dependencies": {
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "vite": "6.4.1"
}
```

**비권장:**

```json
"react": "^18.3.1",
"vite": "~6.4.0"
```

### 2. package-lock.json

- **package-lock.json**은 저장소에 커밋합니다.
- `npm install` 시 동일한 의존성 트리가 유지되도록 합니다.

### 3. overrides (간접 의존성 제어)

- transitive dependency의 버전을 프로젝트 전체에서 통일할 때 **overrides**를 사용합니다.
- 현재는 보안 취약점 해결을 위해 **minimatch**만 overrides로 지정합니다. (아래 [보안: minimatch overrides](#보안-minimatch-overrides) 참고)

### 4. 버전 업데이트 시

- 새 버전으로 올릴 때는 `package.json`에서 해당 패키지 버전을 수정한 뒤 `npm install` 실행.
- lock 파일 변경분을 함께 커밋합니다.

---

## 보안: minimatch overrides

### 개요

npm audit에서 보고되던 **minimatch** 관련 High 심각도 취약점(ReDoS, GHSA-3ppc-4f35-3m26)을 **package.json overrides**로 해결했습니다.

### package.json 설정

**위치:** `package.json` 최상위 (`devDependencies`와 동일 레벨)

```json
"overrides": {
  "minimatch": ">=10.2.1"
}
```

- 프로젝트 전체(직접·간접 의존성)에서 사용되는 **minimatch**를 **10.2.1 이상**으로 통일합니다.
- ESLint, typescript-eslint, glob, @babel/cli 등 devDependencies를 통해 끌어오던 구버전 minimatch가 치환됩니다.

### 적용 후 검증

- `npm install` 후 **package-lock.json** 갱신됨.
- `npm audit` → **0 vulnerabilities** 확인.

### 참고

- **minimatch 10.x**는 major 변경이므로, 문제 시 `npm run lint`, `npm run build`로 동작을 확인하는 것을 권장합니다.
- 상세 내역은 루트의 **MINIMATCH-OVERRIDES-FIX.md**를 참고하세요.

---

## 요구사항

- **Node.js 20 이상** (Tailwind v4 / @tailwindcss/oxide 요구사항). Node 18에서는 dev 서버 기동 시 "Cannot find native binding" 등 오류가 발생할 수 있습니다.
- **npm 9 이상** (`engines` 필드에 명시)

---

## 프로젝트 초기화

### 1. Vite 프로젝트 생성

```bash
npm create vite@latest pdf-formatter -- --template react-ts
cd pdf-formatter
```

### 2. Git 초기화 (선택)

```bash
git init
# .gitignore에 node_modules, dist, .env.local 등 추가
```

---

## 의존성 설치

### package.json 구조 요약

- **버전:** 2.1.0
- **type:** `"module"`
- **scripts:** `dev`, `build`, `lint`, `type-check`, `preview`, `lint:fix`, `prettier:check` 등
- **dependencies:** React 18.3.1, Radix UI, pdf-lib, recharts, date-fns 등 (모두 정확 버전)
- **devDependencies:** Vite 6.4.1, TypeScript 5.9.3, ESLint 8.57.1, Tailwind 4.2.0 등 (모두 정확 버전)
- **overrides:** `minimatch": ">=10.2.1"`
- **engines:** `node": ">=20.0.0"`, `npm": ">=9.0.0"`

### 설치 명령

```bash
# 저장소 클론 후
cd front-end-pers
npm install
```

- `package-lock.json`이 있으므로 위 한 번으로 동일한 의존성 트리가 설치됩니다.

---

## 설정 파일

### vite.config

- Vite + @vitejs/plugin-react, Tailwind(@tailwindcss/vite) 사용.
- `resolve.alias`로 `@/` 등 경로 별칭 설정 가능.

### TypeScript

- `tsconfig.json`: ESNext, strict, path mapping 등.
- `tsconfig.node.json`: Vite 설정용.

### ESLint / Prettier

- ESLint: typescript-eslint, react, react-hooks 등.
- Prettier: `prettier:check`, `prettier:write` 스크립트 제공.

### 기타

- **index.html** 루트, **main.tsx** 진입점, **Tailwind**는 `globals.css` 등에서 로드.

---

## 폴더 구조

```
front-end-pers/
├── public/           # 정적 파일
├── src/              # 소스 (컴포넌트, 페이지, 스토어 등)
├── scripts/          # postinstall, version-manager 등
├── docs/              # 문서 (PROJECT_SETUP.md 등)
├── package.json
├── package-lock.json  # 커밋 유지
├── vite.config.ts
├── tsconfig.json
└── ...
```

- 실제 컴포넌트/페이지 구조는 프로젝트 내 `src/` 및 기타 가이드 문서를 참고하세요.

---

## 환경 변수

- Vite 기준이므로 클라이언트 노출 변수는 `VITE_` 접두사 사용.
- 예: `VITE_APP_ENV`, `VITE_API_BASE_URL` 등.
- `.env.local`, `.env.production` 등으로 환경별 설정. (`.env.local`은 커밋 제외)

---

## 빌드 및 배포

### 개발

```bash
npm run dev          # 개발 서버
npm run local        # 0.0.0.0:4006 등 로컬 노출
```

### 빌드 / 검증

```bash
npm run type-check   # 타입 체크
npm run build        # tsc && vite build
npm run build:prod   # production 모드 빌드
npm run preview      # 빌드 결과 미리보기 (포트 5050)
```

### 린트 / 포맷

```bash
npm run lint
npm run lint:fix
npm run prettier:check
npm run prettier:write
```

---

## 개발 환경 구성

### VS Code

- 확장: ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript 등.
- `editor.formatOnSave`, `editor.codeActionsOnSave`에서 ESLint/Prettier 연동 권장.

### 디버깅

- Chrome 등으로 `npm run dev` 실행 후 `http://localhost:5173`(또는 설정한 포트) 연결해 디버깅.

---

## 체크리스트

### 환경

- [ ] Node.js 20+ 설치
- [ ] npm 9+ 사용

### 의존성

- [ ] `npm install` 성공
- [ ] `npm audit` 결과 0 vulnerabilities (minimatch overrides 적용 확인)

### 동작 확인

- [ ] `npm run dev` 정상 기동
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] `npm run build` 성공

### 버전 정책

- [ ] dependencies / devDependencies 모두 정확 버전(no ^/~)
- [ ] package-lock.json 커밋됨
- [ ] overrides에 minimatch >= 10.2.1 포함

---

## 문제 해결

### npm install 실패

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Tailwind / Vite 관련 오류

- Node 20+ 인지 확인.
- `vite.config`에 `@tailwindcss/vite` 플러그인 및 `globals.css` import 확인.

### 타입/린트 오류

- `npm run type-check`, `npm run lint`로 재현.
- VS Code: TypeScript/ESLint 서버 재시작 후 다시 확인.

### 보안 경고(minimatch)

- `package.json`에 `overrides`가 있는지 확인.
- `npm install` 후 `npm audit`으로 0 vulnerabilities 확인.

---

## 참고 문서

- [MINIMATCH-OVERRIDES-FIX.md](../MINIMATCH-OVERRIDES-FIX.md) — minimatch 보안 수정 상세
- [TAILWIND_OXIDE_NODE_VERSION.md](TAILWIND_OXIDE_NODE_VERSION.md) — Tailwind v4 / Node 버전 (해당 파일이 있는 경우)

---

**문서 버전:** 2.1.0  
**마지막 검토:** 2026-02-23
