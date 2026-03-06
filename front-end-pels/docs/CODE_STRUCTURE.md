# 📁 코드 구조 및 아키텍처 가이드

> **PDF Formatter 프로젝트의 전체 코드 구조와 아키텍처를 설명합니다.**

---

## 📂 디렉토리 구조

```
/
├── 📁 components/          # React 컴포넌트
│   ├── 📁 common/         # 공통 컴포넌트
│   ├── 📁 editor/         # 에디터 전용 컴포넌트
│   ├── 📁 viewer/         # 뷰어 전용 컴포넌트
│   ├── 📁 layout/         # 레이아웃 컴포넌트
│   └── 📁 ui/             # ShadCN UI 컴포넌트
│
├── 📁 pages/              # 페이지 컴포넌트
│   ├── HomePage.tsx       # 홈 페이지
│   ├── EditorPage.tsx     # 에디터 페이지
│   ├── ViewerPage.tsx     # 뷰어 페이지
│   └── NotFoundPage.tsx   # 404 페이지
│
├── 📁 stores/             # Zustand 상태 관리
│   ├── editorStore.ts     # 에디터 전역 상태
│   └── errorStore.ts      # 에러 전역 상태
│
├── 📁 hooks/              # 커스텀 React Hooks
│   ├── useBoundaryConstraint.ts  # 경계 제한 훅
│   └── useErrorHandler.ts        # 에러 핸들링 훅
│
├── 📁 lib/                # 핵심 라이브러리
│   ├── boundaryUtils.ts   # 경계 제한 유틸리티
│   └── storage.ts         # 스토리지 유틸리티
│
├── 📁 utils/              # 헬퍼 유틸리티
│   ├── helpers.ts         # 공통 헬퍼 함수
│   ├── logger.ts          # 로깅 시스템
│   └── index.ts           # 통합 내보내기
│
├── 📁 types/              # TypeScript 타입 정의
│   └── index.ts           # 전체 타입 통합
│
├── 📁 constants/          # 상수 정의
│   ├── config.ts          # 설정 상수
│   ├── dialogMessages.ts  # 다이얼로그 메시지
│   └── mainmenu.ts        # 메인 메뉴 설정
│
├── 📁 styles/             # 스타일 파일
│   ├── globals.css        # 전역 스타일 (Tailwind v4)
│   ├── editor.css         # 에디터 스타일
│   └── viewer.css         # 뷰어 스타일
│
├── 📁 docs/               # 문서
│   ├── CODE_STRUCTURE.md  # 코드 구조 (현재 파일)
│   ├── BOUNDARY_CONSTRAINT_GUIDE.md  # 경계 제한 가이드
│   ├── ERROR_HANDLING_GUIDE.md       # 에러 핸들링 가이드
│   ├── STATE_PERSIST_GUIDE.md        # 상태 영속화 가이드
│   └── DEPENDENCIES.md    # 의존성 관리
│
└── 📁 guidelines/         # 개발 가이드라인
    └── Guidelines.md      # 개발 가이드라인

```

---

## 🏗️ 아키텍처 개요

### 레이어 구조

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Pages, Components)                    │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Hooks, Stores)                        │
├─────────────────────────────────────────┤
│         Utility Layer                   │
│  (Lib, Utils, Helpers)                  │
├─────────────────────────────────────────┤
│         Data Layer                      │
│  (Types, Constants, Config)             │
└─────────────────────────────────────────┘
```

---

## 📦 주요 모듈 설명

### 1. **Components (컴포넌트)**

#### 📁 components/common/

**공통으로 사용되는 컴포넌트**

- `ConfirmDialog.tsx` - 확인 다이얼로그
- `InfoDialog.tsx` - 정보 다이얼로그
- `ErrorDialog.tsx` - 에러 다이얼로그
- `ErrorBoundary.tsx` - React 에러 경계

#### 📁 components/editor/

**에디터 페이지 전용 컴포넌트**

- `EditorHeader.tsx` - 에디터 헤더
- `EditorFooter.tsx` - 에디터 푸터
- `ToolPalette.tsx` - 도구 팔레트 (사이드바)
- `PDFWorkspace.tsx` - PDF 작업 공간
- `DraggableComponent.tsx` - 드래그 가능한 컴포넌트 래퍼
- `BoundaryIndicator.tsx` - 경계 인디케이터

#### 📁 components/editor/tools/

**각 도구별 컴포넌트**

- `BanTools.tsx` - 금지 표시 도구
- `CircleTools.tsx` - 원형 도구
- `TextTools.tsx` - 텍스트 도구
- `SignatureTools.tsx` - 서명 도구
- `CheckboxTools.tsx` - 체크박스 도구
- `CalendarTools.tsx` - 달력 도구
- `ToolsManager.tsx` - 도구 통합 관리

---

### 2. **Stores (상태 관리)**

**Zustand + IndexedDB Persist 방식**

#### `editorStore.ts`

```typescript
// 에디터 전역 상태
-selectedCategory - // 선택된 카테고리
  selectedTool - // 선택된 도구
  isOverlayVisible - // 오버레이 표시 여부
  currentPage - // 현재 페이지
  totalPages - // 전체 페이지 수
  pages - // 페이지별 컴포넌트 데이터
  isPersistEnabled; // 상태 저장 활성화
```

#### `errorStore.ts`

```typescript
// 에러 전역 상태
-currentError - // 현재 에러
  errorHistory - // 에러 히스토리
  showError() - // 에러 표시
  clearError(); // 에러 제거
```

---

### 3. **Hooks (커스텀 훅)**

#### `useBoundaryConstraint.ts`

**경계 제한 로직 훅**

```typescript
interface Options {
  enableSnap: boolean;         // 스냅 활성화
  snapGridSize: number;        // 그리드 크기
  enableLogging: boolean;      // 로깅 활성화
  minWidth: number;            // 최소 너비
  minHeight: number;           // 최소 높이
}

// 반환값
{
  position: ComponentPosition;
  boundaryState: BoundaryState;
  handleDragStart: (x, y) => void;
  handleDrag: (x, y) => void;
  handleDragEnd: () => void;
  handleResize: (width, height) => void;
}
```

#### `useErrorHandler.ts`

**에러 핸들링 훅**

```typescript
// 사용법
const { handleError, clearError } = useErrorHandler();

try {
  // 작업
} catch (error) {
  handleError(error, 'contextInfo');
}
```

---

### 4. **Lib (핵심 라이브러리)**

#### `boundaryUtils.ts`

**경계 제한 유틸리티**

```typescript
// 주요 함수
-constrainToBoundary() - // 경계 내로 제한
  isNearBoundary() - // 경계 근처 체크
  isOutOfBounds() - // 경계 벗어남 체크
  adjustDragDelta() - // 드래그 델타 조정
  snapToGrid(); // 그리드 스냅
```

#### `storage.ts`

**스토리지 유틸리티**

```typescript
// IndexedDB 헬퍼
-saveToIndexedDB() - loadFromIndexedDB() - clearIndexedDB();
```

---

### 5. **Utils (헬퍼 유틸리티)**

#### `helpers.ts`

**공통 헬퍼 함수**

```typescript
// ID 생성
-generateId(prefix) -
  generateUUID() -
  // 숫자 관련
  clamp(value, min, max) -
  snapToGrid(value, gridSize) -
  nearlyEqual(a, b) -
  // 좌표 관련
  distance(p1, p2) -
  isPointInRect(point, rect) -
  isRectOverlap(rect1, rect2) -
  getRectCenter(rect) -
  isInPDFBounds(position) -
  // 문자열 관련
  toKebabCase(str) -
  toCamelCase(str) -
  toPascalCase(str) -
  truncate(str, maxLength) -
  // 날짜/시간
  formatDate(isoString) -
  formatTime(isoString) -
  formatDateTime(isoString) -
  getRelativeTime(isoString) -
  // 배열 관련
  uniqueArray(arr) -
  chunkArray(arr, size) -
  shuffleArray(arr) -
  // 객체 관련
  deepClone(obj) -
  shallowEqual(obj1, obj2) -
  removeNullish(obj) -
  // 파일 관련
  formatFileSize(bytes) -
  downloadJSON(data, filename) -
  // 디바운스/쓰로틀
  debounce(func, wait) -
  throttle(func, limit) -
  // 클래스명
  cn(...classes) -
  mergeTailwindClasses(...classes);
```

#### `logger.ts`

**통합 로깅 시스템**

```typescript
// Logger 인스턴스 생성
const logger = createLogger('MyComponent');

// 로그 레벨
logger.debug('디버그 메시지', data);
logger.info('정보 메시지', data);
logger.warn('경고 메시지', data);
logger.error('에러 메시지', data);
logger.success('성공 메시지', data);

// 그룹 로그
logger.group('그룹 시작');
logger.info('그룹 내 로그');
logger.groupEnd();

// 시간 측정
logger.time('작업');
// ... 작업 수행
logger.timeEnd('작업');

// 빠른 로그
quickLog.mount('ComponentName', props);
quickLog.dragStart(id, position);
quickLog.errorOccurred(error, 'context');
```

---

### 6. **Types (타입 정의)**

#### `types/index.ts`

**전체 타입 통합**

```typescript
// 도구 타입
- ToolCategory
- BanTool, CircleTool, TextTool, etc.

// 위치/크기
- Position, Size, ComponentPosition

// 경계
- BoundaryConfig
- BoundaryConstraintResult
- BoundaryState

// 컴포넌트
- BaseComponent
- BanElement, CircleElement, etc.
- ComponentElement (유니온)

// 페이지
- PageData
- PagesMap

// 에디터 상태
- EditorState

// 에러
- ErrorType, ErrorInfo, ErrorState

// 다이얼로그
- ConfirmDialogConfig
- InfoDialogConfig
```

---

### 7. **Constants (상수)**

#### `config.ts`

**설정 상수**

```typescript
// PDF 설정
PDF_CONFIG = {
  WIDTH: 520,
  HEIGHT: 736,
  A4_WIDTH: 595,
  A4_HEIGHT: 842,
  MAX_PAGES: 999,
  DEFAULT_TOTAL_PAGES: 37,
}

// 레이아웃
LAYOUT_CONFIG = {
  HEADER_HEIGHT: 60,
  FOOTER_HEIGHT: 60,
  SIDEBAR_WIDTH: 200,
}

// 경계 제한
BOUNDARY_CONFIG = {
  PROXIMITY_THRESHOLD: 10,
  SNAP_GRID_SIZE: 5,
  MIN_WIDTH: 30,
  MIN_HEIGHT: 30,
  DEFAULT_X: 20,
  DEFAULT_Y: 40,
}

// 컴포넌트 기본값
COMPONENT_DEFAULTS = {
  BAN: { ... },
  CIRCLE: { ... },
  TEXT: { ... },
  // ...
}

// 색상
COLORS = {
  PRIMARY: '#030213',
  BOUNDARY_WARNING: '#ef4444',
  // ...
}

// 스토리지
STORAGE_KEYS = {
  EDITOR_STATE: 'pdf-editor-state',
  // ...
}

// 에러 메시지
ERROR_MESSAGES = {
  NETWORK: '네트워크 연결을 확인해주세요.',
  // ...
}

// 버전
APP_VERSION = '1.2.1'
```

---

## 🔄 데이터 플로우

### 1. 컴포넌트 생성 플로우

```
사용자가 도구 선택
    ↓
EditorHeader → setSelectedCategory/Tool (editorStore)
    ↓
PDFWorkspace useEffect 감지
    ↓
해당 도구별 Manager에서 컴포넌트 생성
    ↓
DraggableComponent로 래핑
    ↓
화면에 렌더링 (x:20, y:40)
```

### 2. 드래그 플로우

```
마우스 다운 → handleDragStart
    ↓
마우스 이동 → handleDrag
    ↓
useBoundaryConstraint에서 경계 체크
    ↓
constrainToBoundary로 위치 제한
    ↓
boundaryState 업데이트
    ↓
BoundaryIndicator 표시
    ↓
마우스 업 → handleDragEnd
    ↓
editorStore에 위치 저장
```

### 3. 에러 핸들링 플로우

```
에러 발생
    ↓
useErrorHandler.handleError()
    ↓
errorStore.showError()
    ↓
ErrorDialog 표시
    ↓
사용자 확인
    ↓
errorStore.clearError()
```

---

## 📋 코딩 컨벤션

### 파일명

- 컴포넌트: `PascalCase.tsx`
- 훅: `useCamelCase.ts`
- 유틸: `camelCase.ts`
- 타입: `index.ts` (모듈별)
- 상수: `UPPER_SNAKE_CASE` (변수)

### 변수명

- 컴포넌트: `PascalCase`
- 함수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 타입/인터페이스: `PascalCase`
- private 변수: `_camelCase` (선택)

### 주석

```typescript
/**
 * 함수/컴포넌트 설명
 * @param name - 파라미터 설명
 * @returns 반환값 설명
 */
export function myFunction(name: string): string {
  // 인라인 주석
  return name;
}
```

### Import 순서

```typescript
// 1. React 관련
import React, { useState } from 'react';

// 2. 외부 라이브러리
import { create } from 'zustand';

// 3. 내부 컴포넌트
import { Button } from './components/ui/button';

// 4. 내부 훅
import { useBoundaryConstraint } from './hooks/useBoundaryConstraint';

// 5. 타입
import type { ComponentPosition } from './types';

// 6. 상수
import { PDF_CONFIG } from './constants/config';

// 7. 스타일
import './styles/editor.css';
```

---

## 🧪 테스트 전략

### 단위 테스트 대상

- 유틸리티 함수 (`utils/helpers.ts`)
- 경계 제한 로직 (`lib/boundaryUtils.ts`)
- 스토어 액션 (`stores/*`)

### 통합 테스트 대상

- 드래그 앤 드롭 시나리오
- 경계 제한 시나리오
- 에러 핸들링 시나리오

### E2E 테스트 대상

- 도구 선택 → 컴포넌트 생성 → 드래그 → 저장 플로우
- 에러 발생 → 다이얼로그 표시 → 복구 플로우

---

## 🔧 유지보수 가이드

### 새로운 도구 추가하기

1. **타입 정의** (`types/index.ts`)

```typescript
export type NewTool = 'new-tool-1' | 'new-tool-2';
export interface NewElement extends BaseComponent {
  type: 'new-tool-1' | 'new-tool-2';
  // 추가 속성
}
```

2. **도구 매니저 생성** (`components/editor/tools/NewTools.tsx`)

```typescript
export class NewToolsManager {
  static createNewTool1(x, y) { ... }
  static renderNewElement(element) { ... }
}
```

3. **PDFWorkspace에 통합** (`components/editor/PDFWorkspace.tsx`)

```typescript
case 'new-category':
  switch (selectedTool) {
    case 'new-tool-1':
      newComponent = NewToolsManager.createNewTool1(x, y);
      break;
  }
```

4. **상수 추가** (`constants/config.ts`)

```typescript
COMPONENT_DEFAULTS.NEW_TOOL = {
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 50,
};
```

### 새로운 페이지 추가하기

1. 페이지 컴포넌트 생성 (`pages/NewPage.tsx`)
2. 라우트 추가 (`App.tsx`)
3. 메뉴 항목 추가 (`constants/mainmenu.ts`)

### 새로운 다이얼로그 추가하기

1. 다이얼로그 컴포넌트 생성 (`components/common/NewDialog.tsx`)
2. 필요시 스토어에 상태 추가
3. 메시지 상수 추가 (`constants/dialogMessages.ts`)

---

## 📊 성능 최적화 팁

### React 최적화

- `React.memo()` 사용 (불필요한 리렌더링 방지)
- `useCallback()` / `useMemo()` 사용
- 큰 리스트는 가상화 (react-window)

### 상태 관리 최적화

- Zustand selector 사용 (필요한 상태만 구독)
- 상태 분할 (editorStore, errorStore 분리)

### 번들 최적화

- 코드 스플리팅 (React.lazy)
- Tree shaking (import { specific } from 'lib')
- 이미지 최적화

---

## 🐛 디버깅 가이드

### 로그 활성화

```typescript
import { setLogLevel, LogLevel } from './utils/logger';

// 개발 환경에서 모든 로그 표시
setLogLevel(LogLevel.DEBUG);
```

### 경계 제한 디버그

```typescript
// boundaryUtils.ts에서 로깅 활성화
BOUNDARY_CONFIG.ENABLE_LOGGING = true;
```

### 상태 디버그

```typescript
// Zustand DevTools
import { devtools } from 'zustand/middleware';

// 스토어에 추가
devtools(stateCreator, { name: 'EditorStore' });
```

---

**마지막 업데이트:** 2025-10-01  
**버전:** 1.2.1
