# PDF Formatter Application

React 19.1.1 기반의 고정 레이아웃 PDF 뷰어 및 에디터 애플리케이션입니다.

## 🚀 주요 기능

### 📄 PDF Editor
- **고정 레이아웃**: 헤더(60px), 메인, 푸터(60px) 완전 고정 구조
- **A4 비율 유지**: PDF 페이지 520x736px 고정 크기
- **도구 팔레트**: 좌측 200px 고정 폭 사이드바
- **6가지 카테고리**: 금지, 텍스트박스, 체크박스, 캘린더, 서명, 원형
- **오버레이 시스템**: 카테고리 선택 시 자동 활성화
- **페이지 네비게이션**: 푸터에서 페이지 이동 및 관리

### 💾 상태 관리
- **Zustand + IndexedDB**: 완전한 상태 저장/복원 시스템
- **자동 저장**: 작업 내용 실시간 저장
- **토글 기능**: 상태 저장 ON/OFF 전환

### 📡 네트워크 상태 표시 및 보존
- **네트워크 상태 인디케이터**: `EditorHeader`에 연결/끊김 시각화(`Wifi`/`WifiOff`, 붉은색 강조, 로딩 스피너)
- **연결 품질 표시**: `useNetworkMonitoring()`의 품질 정보 툴팁 제공
- **네트워크 혼합 판단**: `navigator.onLine` + `checkNetworkConnection()` 결합으로 신뢰도 향상
- **상태 보존**: 네트워크 불안정 시 라우트 전환 전에 임시 상태 자동 저장, 편집기로 복귀 시 자동 복원
- **개발 모드 전용 버튼 분기**: 개발용 드롭다운/페이지 모드 버튼은 `IS_DEV`에서만 노출

### 🚨 에러 핸들링
- **통합 에러 다이얼로그**: 일관된 UI로 모든 에러 표시
- **자동 감지**: 400대/500대 HTTP 에러, React 런타임 에러
- **404 페이지**: 존재하지 않는 라우트 자동 처리
- **전역 상태 관리**: Zustand 기반 에러 상태 관리

### 📐 경계 제한
- **드래그 앤 드롭 방식**: 도구 선택 시 좌측 상단에 컴포넌트 자동 생성
- **강제 경계 제한**: 컴포넌트가 절대로 PDF 페이지 영역(520x736px)을 벗어날 수 없음
- **실시간 경고**: 경계 근처에서 빨간색 경고선 + 메시지 표시
- **이중 안전장치**: 드래그 중 다중 경계 체크로 완벽한 제한
- **그리드 스냅**: 5px 단위 정렬 지원

## 📁 프로젝트 구조

```
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── public/
│   ├── assets/icons/app-icon.svg
│   ├── fonts/
│   └── pdfjs/cmaps/                # PDF.js CMap (오프라인 포함)
├── dist/                           # 빌드 출력물
├── scripts/
│   ├── package-offline.js          # 오프라인 패키징
│   ├── postinstall.js              # 설치 후 작업
│   └── verify-offline.js           # 오프라인 검증
├── docs/
│   ├── PROJECT_SETUP.md
│   ├── OFFLINE_DEPLOYMENT.md
│   ├── CODE_STRUCTURE.md
│   ├── BOUNDARY_CONSTRAINT_GUIDE.md
│   ├── ERROR_HANDLING_GUIDE.md
│   ├── STATE_PERSIST_GUIDE.md
│   ├── EDITOR_HEADER_NETWORK_STATUS.md         # EditorHeader 네트워크 인디케이터
│   ├── ROUTE_GUARD_NETWORK_STATE_PRESERVATION.md # RouteGuard 상태 보존
│   └── PUBLIC_ASSETS_CLOSED_ENVIRONMENT.md     # public/ 자원 폐쇄망 동작
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── polyfills.ts
│   ├── constants/
│   │   ├── config.ts               # IS_DEV 등 앱 설정 상수
│   │   ├── routes.ts               # 경로 상수 (/e-link-v2/*)
│   │   ├── dialogMessages.ts
│   │   ├── mainmenu.ts
│   │   └── pageTitles.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── RouteGuard.tsx      # 네트워크 인식 상태 보존 가드
│   │   │   ├── NetworkStatus.tsx   # 네트워크 상태 공용 컴포넌트
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorDialog.tsx
│   │   │   └── InfoDialog.tsx
│   │   ├── editor/
│   │   │   ├── EditorHeader.tsx    # 네트워크 인디케이터 포함
│   │   │   ├── PDFWorkspace.tsx
│   │   │   ├── ToolPalette.tsx
│   │   │   ├── EditorFooter.tsx
│   │   │   └── tools/              # 7개 도구 컴포넌트
│   │   ├── viewer/
│   │   │   ├── ViewerHeader.tsx
│   │   │   └── ViewerFooter.tsx
│   │   └── ui/                     # shadcn/ui 래퍼 컴포넌트
│   ├── hooks/
│   │   └── useBoundaryConstraint.ts
│   ├── lib/
│   │   ├── http.ts                 # axios 인스턴스/인터셉터
│   │   ├── requestBuilder.ts
│   │   ├── fileService.ts
│   │   └── repository/
│   │       ├── BaseRepository.ts
│   │       └── UsersRepository.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── EditorPage.tsx
│   │   ├── ViewerPage.tsx
│   │   ├── ApiTestPage.tsx         # IS_DEV 전용
│   │   ├── ApiDataTestPage.tsx     # IS_DEV 전용
│   │   ├── NetworkTestPage.tsx     # IS_DEV 전용
│   │   ├── LodashTestPage.tsx      # IS_DEV 전용
│   │   └── NotFoundPage.tsx
│   ├── stores/
│   │   ├── editorStore.ts
│   │   └── errorStore.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── editor.css
│   │   └── viewer.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── networkUtils.ts         # useNetworkMonitoring, ping 체크
│   │   ├── errorHandler.ts
│   │   ├── helpers.ts
│   │   └── logger.ts
│   └── components/layout/BaseLayout.tsx
└── README.md
```

## 🎯 라우팅

### 항상 활성
| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 홈 페이지 |
| `/e-link-v2/editor` | EditorPage | PDF 에디터 |
| `/e-link-v2/viewer` | ViewerPage | PDF 뷰어 |
| `*` (기타) | NotFoundPage | 404 페이지 |

### IS_DEV에서만 활성
| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/home` | HomePage | 홈 페이지(별칭, 개발 전용) |
| `/api-test` | ApiTestPage | API 테스트 페이지 |
| `/lodash-test` | LodashTestPage | Lodash 유틸 테스트 |
| `/moment-test` | MomentTestPage | 날짜/시간 유틸 테스트 |
| `/api-data-test` | ApiDataTestPage | API 데이터 UI 테스트 |
| `/network-test` | NetworkTestPage | 네트워크 테스트 도구 |

## 🛠️ 기술 스택

- **앱 프레임워크**: React 18.x + TypeScript
- **번들러/개발서버**: Vite 6, @vitejs/plugin-react, @tailwindcss/vite
- **스타일링**: Tailwind CSS v4, tailwind-merge, clsx, class-variance-authority (CVA)
- **UI 컴포넌트**: shadcn/ui 기반, Radix UI(@radix-ui/*)
- **아이콘**: lucide-react
- **라우팅**: react-router-dom 6
- **상태 관리**: zustand 5, idb-keyval(로컬 저장소 헬퍼)
- **폼**: react-hook-form
- **알림/토스트**: sonner
- **차트**: recharts
- **캐러셀**: embla-carousel-react
- **PDF**: pdfjs-dist(뷰잉), pdf-lib(생성/조작), @pdf-lib/fontkit(폰트)
- **HTTP 클라이언트**: axios
- **유틸**: lodash, date-fns, moment, motion(애니메이션)
- **레이아웃/패널**: react-resizable-panels, react-rnd, vaul(drawer)
- **명령 팔레트/커맨드**: cmdk
- **기타**: prismjs(코드 하이라이트)

개발 도구
- 번들/개발: Vite 6, @vitejs/plugin-react, @tailwindcss/vite
- 타입/빌드: TypeScript 5, ts-node, core-js
- 스타일 파이프라인: postcss, autoprefixer
- 린트/포맷: ESLint, Prettier
    - eslint-plugin-react, eslint-plugin-react-hooks, @typescript-eslint/*, eslint-plugin-import, eslint-plugin-prettier, eslint-config-prettier
- 스크립트: `npm run dev`, `build`, `preview`, `lint:check`, `lint:fix`, `prettier:check`, `prettier:write`, `type-check`
- 버전/배포 유틸: `scripts/package-offline.js`, `scripts/verify-offline.js`, `postinstall.js`
- 기타: http-server, sharp, image-size

## 📖 사용 가이드

### 에러 핸들링 시스템 사용법

#### 1. API 요청 에러 처리

```typescript
import { useErrorHandler } from './hooks/useErrorHandler';

function MyComponent() {
  const { handleFetchError } = useErrorHandler();

  const fetchData = async () => {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      await handleFetchError(response);
      return;
    }

    const data = await response.json();
    // 데이터 처리...
  };
}
```

#### 2. 비동기 함수 자동 에러 처리

```typescript
import { useErrorHandler } from './hooks/useErrorHandler';

function MyComponent() {
  const { wrapAsync } = useErrorHandler();

  const fetchData = wrapAsync(async () => {
    const response = await fetch('/api/data');
    return response.json();
  }, '데이터를 불러오는 중 오류가 발생했습니다.');
}
```

#### 3. 수동 에러 표시

```typescript
import { useErrorStore } from './stores/errorStore';

function MyComponent() {
  const { showError } = useErrorStore();

  const handleAction = () => {
    if (someCondition) {
      showError(
        'client-error',
        '잘못된 입력입니다.',
        '상세 정보...'
      );
    }
  };
}
```

### 에러 타입

| 타입 | 설명 | 동작 |
|------|------|------|
| `not-found` | 404 에러 | 홈으로 이동 |
| `client-error` | 400대 에러 | 다이얼로그 닫기 |
| `server-error` | 500대 에러 | 다이얼로그 닫기 |
| `network-error` | 네트워크 에러 | 다이얼로그 닫기 |
| `runtime-error` | 런타임 에러 | 페이지 새로고침 |
| `general-error` | 일반 에러 | 다이얼로그 닫기 |

## 📚 상세 문서

### 🚀 시작하기
- [🛠️ 프로젝트 구성 가이드](/docs/PROJECT_SETUP.md) ⭐ **필독**
    - 프로젝트 초기화 완전 가이드
    - 의존성 설치 (package.json 전체)
    - 설정 파일 (vite.config.ts, tsconfig.json)
    - 폴더 구조 생성 스크립트
    - 환경 변수 설정
    - 빌드 & 배포 가이드
    - 체크리스트 (30개+)

- [🔒 오프라인 배포 가이드](/docs/OFFLINE_DEPLOYMENT.md) 🏢 **폐쇄망 필수**
    - 외부 네트워크 없는 완전 오프라인 배포
    - 의존성 완전 번들링 (node_modules)
    - 정적 자원 완전 내재화 (폰트, 이미지)
    - 에어갭 환경 패키징 방법
    - USB/DVD 전송 및 설치
    - 오프라인 검증 스크립트
    - 보안 설정 (HTTPS, 권한)

### 📖 아키텍처 & 구조
- [📁 코드 구조 및 아키텍처 가이드](/docs/CODE_STRUCTURE.md)
    - 전체 디렉토리 구조 설명
    - 아키텍처 레이어 구조
    - 데이터 플로우
    - 코딩 컨벤션
    - 유지보수 가이드

### 🔧 기능별 가이드
- [📐 경계 제한 시스템](/docs/BOUNDARY_CONSTRAINT_GUIDE.md)
- [⚠️ 에러 핸들링 시스템](/docs/ERROR_HANDLING_GUIDE.md)
- [💾 상태 저장 시스템](/docs/STATE_PERSIST_GUIDE.md)
- [📦 의존성 관리](/docs/DEPENDENCIES.md)
- [📡 EditorHeader 네트워크 상태 표시](/docs/EDITOR_HEADER_NETWORK_STATUS.md)
- [🔄 RouteGuard 네트워크 인식 상태 보존](/docs/ROUTE_GUARD_NETWORK_STATE_PRESERVATION.md)
- [🏢 public/ 경로 폐쇄망 동작 분석](/docs/PUBLIC_ASSETS_CLOSED_ENVIRONMENT.md)

## 🎨 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│  [☰] [🚫] [T] [☑] [📅] [✍] [⭕]  주기-3592  [💾] [</>] [37P] [👁]  │  ← 헤더 (60px)
├─────────────────────────────────────────────────────────────┤
│ ┌──────┬──────────────────────────────────────────────┐     │
│ │      │                                              │     │
│ │ Tool │          PDF Page (520x736px)               │     │
│ │Palette│              A4 비율 유지                    │     │     │
│ │200px │                                              │     │
│ │      │                                              │     │
│ └──────┴──────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│             [◀] 1 / 37 [▶]  [페이지 입력]                    │  ← 푸터 (60px)
└─────────────────────────────────────────────────────────────┘
```

## 🔧 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 📋 사용 가능한 스크립트 명령어

#### 개발 및 빌드
```bash
npm run dev          # 개발 서버 실행 (Vite dev mode)
npm run local        # 로컬 개발 서버 실행 (localdev mode)
npm run prod_test:run # 프로덕션 테스트 실행
npm run build         # TypeScript 컴파일 + Vite 빌드
npm run build:prod    # 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기 (포트 5050)
npm run serve         # 빌드 결과 서빙 (포트 5000)
```

#### 코드 품질 관리
```bash
npm run lint          # ESLint 검사
npm run lint:check    # ESLint 검사 (수정 없이)
npm run lint:fix      # ESLint 자동 수정
npm run prettier:check # Prettier 포맷 검사
npm run prettier:write # Prettier 포맷 적용
npm run type-check    # TypeScript 타입 검사
```

#### 버전 관리
```bash
npm run version:status # 현재 버전 상태 확인
npm run version:patch  # 패치 버전 업데이트 (1.0.0 → 1.0.1)
npm run version:minor  # 마이너 버전 업데이트 (1.0.0 → 1.1.0)
npm run version:major  # 메이저 버전 업데이트 (1.0.0 → 2.0.0)
npm run version:set    # 특정 버전으로 설정
npm run version:build  # 버전 정보로 빌드
```

#### 오프라인 배포
```bash
npm run package-offline # 오프라인 패키지 생성
npm run verify-offline  # 오프라인 패키지 검증
npm run postinstall     # 설치 후 스크립트 실행
```

#### 개발 서버 포트 충돌 시(Port 4001 is already in use)
```bash
# macOS
lsof -nP -iTCP:4001 -sTCP:LISTEN
kill -9 <PID>

# 또는 간단히
pkill -f "vite.*4001"

# 포트 변경 실행 (예: 4100)
VITE_PORT=4100 npm run dev
```

## 🧪 테스트 시나리오

### 에러 핸들링 테스트

1. **404 에러**
    - 브라우저에서 `/invalid-route` 접근
    - 404 페이지 표시 확인
    - 에러 다이얼로그 "홈으로" 버튼 클릭

2. **상태 저장/복원**
    - `/e-link/editor`로 이동
    - 카테고리 "금지" 선택
    - 페이지 5로 이동
    - F5 새로고침 → 상태 유지 확인

3. **오버레이 시스템**
    - 카테고리 선택 시 오버레이 자동 활성화
    - 눈 아이콘(👁) 클릭으로 토글

## 📝 변경 이력

### v2.0.0 (2025-10-22) - 네트워크 인식/보존 & 라우트 가드 고도화
#### 🎯 신규/변경 사항
- 📡 `EditorHeader` 네트워크 상태 인디케이터 추가(연결/끊김, 스피너, 강조)
- 🔄 `RouteGuard` 네트워크 인식 상태 보존: 끊김 시 임시 저장, 복귀 시 자동 복원
- 🧭 `IS_DEV` 분기 라우트 정리: 개발 전용 페이지들 개발 모드에서만 노출
- 🧩 문서 추가: `EDITOR_HEADER_NETWORK_STATUS.md`, `ROUTE_GUARD_NETWORK_STATE_PRESERVATION.md`
- 🏢 public/ 자원 폐쇄망 동작 분석 문서 추가

#### 🛠️ 내부 개선
- config 상수/라우트 상수 최신화 (`/e-link-v2/*`)
- README 라우트/문서/버전 정보 현행화

---

### v1.2.2 (2025-10-01) - 페이지별 초기화 기능 추가
#### 🎯 기능 개선
- ✨ 전체 페이지 초기화 기능 추가 (기존 기능 유지)
- ✨ 현재 페이지만 초기화 기능 추가 (새로운 기능)
- 🔄 햄버거 메뉴에 2개 초기화 옵션 제공
- 📝 메뉴 라벨 명확화: "PDF 전체 페이지 서식화 작성 초기화"

### v1.2.1 (2025-10-01) - 드래그 앤 드롭 + 코드 구조 정리
#### 🎯 기능 개선
- ✨ 드래그 앤 드롭 방식으로 컴포넌트 생성 변경
- 🔒 이중 안전장치로 경계 제한 강화 (절대 벗어날 수 없음)
- ⚠️ 실시간 경고 시스템 (경계 근처 빨간 경고선 + 메시지)
- 🚨 경계 벗어남 감지 시 상단 경고 배너 표시
- 🎯 도구 선택 시 좌측 상단(20, 40)에 자동 생성
- 🔄 PDFWorkspace 컴포넌트 전면 개편

#### 🏗️ 아키텍처 개선
- 📁 `/types/index.ts` 추가 - 전체 타입 정의 통합 (40개+ 타입)
- 📁 `/constants/config.ts` 추가 - 모든 설정 상수 중앙화
- 📁 `/utils/helpers.ts` 추가 - 공통 헬퍼 함수 40개+
- 📁 `/utils/logger.ts` 추가 - 통합 로깅 시스템
- 📁 `/docs/CODE_STRUCTURE.md` 추가 - 코드 구조 가이드
- 📁 `/guidelines/Guidelines.md` 전면 개편 - 개발 가이드라인 상세화

#### 📦 코드 품질 향상
- ✅ TypeScript 타입 안전성 강화
- ✅ 코딩 컨벤션 통일
- ✅ JSDoc 주석 추가
- ✅ Import 순서 정리
- ✅ 유지보수성 대폭 향상

### v1.2.0 (2025-10-01) - 경계 제한 시스템 추가
- ✨ 경계 제한 유틸리티 (`boundaryUtils.ts`) 추가
- ✨ `useBoundaryConstraint` 커스텀 훅 추가
- ✨ `BoundaryIndicator` 컴포넌트 추가 (시각적 피드백)
- ✨ `DraggableComponent` 래퍼 컴포넌트 추가
- 🔄 `editorStore`에 위치/크기 업데이트 액션 추가
- 📐 PDF 페이지 경계(520x736px) 자동 제한 구현
- 📖 경계 제한 가이드 문서 작성

### v1.1.0 (2025-10-01) - 에러 핸들링 시스템 추가
- ✨ ErrorDialog 컴포넌트 추가
- ✨ ErrorBoundary 컴포넌트 추가
- ✨ errorStore (Zustand) 추가
- ✨ useErrorHandler 훅 추가
- ✨ NotFoundPage (404) 추가
- 📖 에러 핸들링 가이드 문서 작성

### v1.0.0 (2025-09-30) - 초기 버전
- 🎉 PDF Editor 기본 기능 구현
- 💾 Zustand + IndexedDB 상태 저장 시스템
- 🎨 고정 레이아웃 및 도구 팔레트
- 📄 상태 저장 가이드 문서 작성

## 🤝 기여 가이드

1. 새로운 에러 타입 추가 시 `errorStore.ts`의 `ErrorType` 수정
2. 에러 메시지 추가 시 `dialogMessages.ts` 수정
3. 공통 컴포넌트는 `components/common/` 디렉토리에 배치
4. 문서 업데이트는 `docs/` 디렉토리에 마크다운으로 작성

## 📄 라이선스

이 프로젝트는 내부 사용 목적으로 제작되었습니다.

---

**마지막 업데이트:** 2025-10-01  
**버전:** 2.0.0  
**배포 환경:** 온라인 / **오프라인(폐쇄망)** ✅
