## RouteGuard 사용 가이드

본 문서는 전역 경로 인터셉터 컴포넌트인 `RouteGuard`와 타입 `RouteGuardConfig`를 이용해 라우팅 제어 로직을 한곳에서 관리하는 방법을 설명합니다.

### 핵심 개념
- `RouteGuard`: 경로가 변경될 때마다 전·후 훅을 실행하고, 경로별 가드(접근 권한/리다이렉트/거부 처리)를 수행합니다.
- `RouteGuardConfig`: 가드 동작을 정의하는 설정 객체입니다.
- `ROUTE_GUARDS_ENABLED`: 모든 가드 로직을 전역 on/off 하는 단일 플래그입니다.
- `ROUTES`: 경로 상수. 경로 추가/변경은 여기서만 관리합니다.

### 파일 구조와 위치
- 경로 상수: `src/constants/routes.ts`
- 페이지 타이틀 관리: `src/constants/pageTitles.ts`
- 가드 설정: `src/constants/routeGuardConfig.ts`
- 가드 컴포넌트: `src/components/common/RouteGuard.tsx`
- 적용 지점: `src/App.tsx`

### 동작 원리
1. 사용자가 경로 이동 시도 → `RouteGuard`가 `useLocation()`으로 변경 감지
2. `onBeforeRouteChange(from, to)` 실행 (false 반환 시 이동 취소 및 원위치)
3. `guards[to]?.canAccess(from, to)` 실행 (false면 거부 처리 및 `redirectTo`로 이동/또는 복귀)
4. 정상 통과 시 `onAfterRouteChange(from, to)` 실행

### 빠른 시작 (적용 방법)
1) `App.tsx`에 컴포넌트 추가
```tsx
// App.tsx
<Router>
  <DynamicTitle />
  <RouteGuard config={customRouteGuardConfig} />
  <Routes>{/* ... */}</Routes>
</Router>
```

2) 경로 상수 정의/추가
```ts
// src/constants/routes.ts
export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  EDITOR: '/e-link/editor',
  VIEWER: '/e-link/viewer',
} as const;
```

3) 가드 설정 작성/확장
```ts
// src/constants/routeGuardConfig.ts
import type { RouteGuardConfig } from '../components/common/RouteGuard';
import { ROUTES } from './routes';

export const ROUTE_GUARDS_ENABLED = true; // 전역 on/off

export const customRouteGuardConfig: RouteGuardConfig = {
  debug: import.meta.env.DEV,
  onBeforeRouteChange: async (from, to) => {
    // 예: 편집기에서 나갈 때 저장 확인
    if (from === ROUTES.EDITOR && to !== ROUTES.EDITOR) {
      const hasUnsaved = localStorage.getItem('editor-unsaved-changes') === 'true';
      if (hasUnsaved && !confirm('저장되지 않은 변경사항이 있습니다. 이동할까요?')) return false;
    }
    return true;
  },
  onAfterRouteChange: async (from, to) => {
    // 예: 간단한 방문 로깅/초기화
    console.log('[RouteGuard] moved', { from, to });
  },
  guards: {
    [ROUTES.EDITOR]: {
      canAccess: async () => {
        if (!ROUTE_GUARDS_ENABLED) return true;
        const token = localStorage.getItem('auth-token');
        const role = localStorage.getItem('user-role');
        return !!token && (role === 'admin' || role === 'editor');
      },
      redirectTo: ROUTES.HOME,
      onAccessDenied: () => {
        if (!ROUTE_GUARDS_ENABLED) return;
        alert('편집기 접근 권한이 없습니다.');
      },
    },
    [ROUTES.VIEWER]: {
      canAccess: async () => {
        if (!ROUTE_GUARDS_ENABLED) return true;
        return !!localStorage.getItem('auth-token');
      },
      redirectTo: ROUTES.HOME,
      onAccessDenied: () => {
        if (!ROUTE_GUARDS_ENABLED) return;
        alert('뷰어 접근 권한이 없습니다.');
      },
    },
  },
};
```

### RouteGuardConfig 속성 설명
- `debug?: boolean`:
  - true면 경로 변경 로그를 출력합니다.
- `onBeforeRouteChange?(from, to): boolean | Promise<boolean>`:
  - 경로 변경 직전 호출. `false` 반환 시 이동 취소됩니다.
- `onAfterRouteChange?(from, to): void | Promise<void>`:
  - 경로 변경 직후 호출. 초기화/로깅 등에 사용합니다.
- `guards?: Record<string, { canAccess?, redirectTo?, onAccessDenied? }>`
  - `canAccess?(from, to)`: 접근 허용 여부. false면 거부 처리
  - `redirectTo?: string`: 거부 시 이동할 경로
  - `onAccessDenied?(from, to)`: 거부 시 추가 처리

### 전역 on/off: ROUTE_GUARDS_ENABLED
```ts
export const ROUTE_GUARDS_ENABLED = true; // false면 모든 canAccess/거부 로직 우회
```
- 비활성화하면 `canAccess`는 항상 통과, `onAccessDenied`는 실행되지 않습니다.
- 테스트/데모/오프라인 환경에서 빠르게 우회할 수 있습니다.

### 경로 추가 시 체크리스트
1. `src/constants/routes.ts`에 상수 추가
2. 필요하다면 `src/constants/pageTitles.ts`의 `getPageTitle`에 타이틀 매핑 추가
3. 접근 제어가 필요하면 `src/constants/routeGuardConfig.ts`의 `guards`에 항목 추가
4. 화면 라우팅이 필요하면 `src/App.tsx`의 `<Routes>`에 경로 추가

### 레시피 모음
- 저장되지 않은 변경사항 방지: `onBeforeRouteChange`에서 confirm 처리
- 로그인 필요 페이지: `guards[ROUTE].canAccess`에서 토큰 체크, `redirectTo` 지정
- 역할 기반 권한: `canAccess`에서 역할(Role) 확인
- 페이지 진입 초기화: `onAfterRouteChange`에서 페이지별 초기화 실행
- 페이지 뷰 트래킹: `onAfterRouteChange`에서 서버/Analytics 호출

### 트러블슈팅
- 타입 오류(`RouteGuardConfig not exported`): `RouteGuard.tsx`에서 `export interface RouteGuardConfig` 확인
- `gtag` 타입 오류: `(window as any).gtag?.('config', ...)`처럼 글로벌 접근으로 처리
- 가드가 실행되지 않음: `App.tsx`의 `<RouteGuard config={...} />`가 `<Routes>`와 같은 `Router` 범위 내에 있는지 확인

### 참고
- `ErrorBoundary`와 유사하게 앱 루트에 배치하여 전역적으로 관리합니다.
- 설정과 경로는 모두 `constants` 폴더에서 중앙 관리합니다.


