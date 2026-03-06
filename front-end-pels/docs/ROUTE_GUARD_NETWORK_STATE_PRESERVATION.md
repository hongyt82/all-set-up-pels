## RouteGuard 기반 네트워크 상태 인식 상태 보존 기능

이 문서는 `src/components/common/RouteGuard.tsx`에 구현된 "네트워크 상태 기반 상태 보존" 기능을 설명합니다. 편집기/뷰어 사용 중 네트워크가 끊기거나 불안정할 때 현재 편집 상태를 안전하게 보존하고, 다시 돌아왔을 때 자동으로 복원합니다.

### 목적
- 네트워크 불안정/끊김 상황에서도 작업 손실을 방지
- 사용자 경험을 해치지 않도록 자동 저장/복원을 투명하게 처리

### 적용 대상 경로
- `ROUTES.EDITOR`
- `ROUTES.VIEWER`

### 핵심 의존성
- `checkNetworkConnection()` — 실제 통신 가능 여부를 비동기 확인 (`src/utils/networkUtils.ts`)
- `navigator.onLine` — 브라우저 온라인 여부
- `useEditorStore` — 현재 편집 상태 접근/설정 (`src/stores/editorStore.ts`)
- `IS_DEV` — 개발 모드에서 상세 로그 출력 (`src/constants/config.ts`)

### 저장 포맷 및 키
- 저장소: `localStorage`
- 키:
  - `pdf-editor-draft-state` — 직렬화된 상태(JSON)
  - `pdf-editor-draft-timestamp` — ISO 문자열 타임스탬프
- 만료 정책: 24시간 경과 시 자동 폐기

### 동작 개요
1. 경로 변경 전(onBeforeRouteChange)
   - `navigator.onLine`과 `checkNetworkConnection()` 결과를 결합하여 네트워크 가용성 판단
   - 편집기/뷰어에서 벗어나거나 동일 영역 간 전환 시, 네트워크가 끊김/불안정이면 `useEditorStore.getState()`를 스냅샷하여 `localStorage`에 저장
   - 네트워크가 안정적이면 기존 임시 상태를 정리
2. 경로 변경 후(onAfterRouteChange)
   - 편집기/뷰어로 진입 시 임시 상태가 존재하고 유효하면 `useEditorStore.setState()`로 복원
   - 만료(24시간 초과)된 임시 상태는 자동 삭제

### 핵심 코드 요약
```ts
// 상수
const DRAFT_STORAGE_KEY = 'pdf-editor-draft-state';
const DRAFT_TIMESTAMP_KEY = 'pdf-editor-draft-timestamp';
const DRAFT_EXPIRY_HOURS = 24;

// 저장
const saveDraftState = (state: any) => {
  const draftData = { state, timestamp: new Date().toISOString(), version: '1.0.0' };
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  localStorage.setItem(DRAFT_TIMESTAMP_KEY, draftData.timestamp);
};

// 복원
const loadDraftState = () => {
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
  const ts = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
  if (!raw || !ts) return null;
  const expiry = new Date(new Date(ts).getTime() + DRAFT_EXPIRY_HOURS * 3600_000);
  if (new Date() > expiry) { clearDraftState(); return null; }
  return JSON.parse(raw).state;
};

// 삭제
const clearDraftState = () => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
};

// 네트워크 인식 가드 설정 (발췌)
export const networkAwareRouteGuardConfig = {
  onBeforeRouteChange: async (from, to) => {
    const isOnline = navigator.onLine;
    let isConnected = false;
    if (isOnline) {
      try { isConnected = await checkNetworkConnection(); } catch { isConnected = false; }
    }
    const leavingEditorArea = (from === ROUTES.EDITOR || from === ROUTES.VIEWER);
    if (leavingEditorArea && (!isOnline || !isConnected)) {
      const draft = useEditorStore.getState();
      if (draft && Object.keys(draft).length) saveDraftState(draft);
    } else if (isOnline && isConnected) {
      clearDraftState();
    }
    return true;
  },
  onAfterRouteChange: async (_from, to) => {
    if (to === ROUTES.EDITOR || to === ROUTES.VIEWER) {
      const draft = loadDraftState();
      if (draft) useEditorStore.setState(draft);
    }
  },
};
```

### 앱 통합
- `src/App.tsx`
  - `import { RouteGuard, networkAwareRouteGuardConfig } from './components/common/RouteGuard'`
  - `<RouteGuard config={networkAwareRouteGuardConfig} />`

### 테스트 시나리오
1. 편집기에서 작업 후 네트워크를 끊고 다른 페이지로 이동 → 임시 상태 저장 확인
2. 다시 편집기로 복귀 → 임시 상태 자동 복원 확인
3. 네트워크 정상 상태에서 이동 → 임시 상태가 자동 정리되는지 확인
4. 24시간 경과한 임시 상태 → 복원되지 않고 자동 삭제되는지 확인

### 트러블슈팅
- 임시 상태가 저장되지 않으면: `useEditorStore.getState()`가 비어 있지 않은지, 에러 콘솔을 확인
- 복원이 되지 않으면: 저장 키(`pdf-editor-draft-*`) 존재 여부 및 만료 시간 확인
- 서버 핑 실패 시: `checkNetworkConnection()` 대상 엔드포인트 접근성/CORS 확인

### 보안/성능 유의
- 민감 정보는 스토어에 보관하지 않도록 설계하세요. `localStorage`는 평문 저장입니다.
- 상태가 큰 경우 IndexedDB로 전환을 고려하세요.

### 관련 파일
- `src/components/common/RouteGuard.tsx`
- `src/App.tsx`
- `src/utils/networkUtils.ts`
- `src/stores/editorStore.ts`
- `src/constants/routes.ts`, `src/constants/config.ts`


