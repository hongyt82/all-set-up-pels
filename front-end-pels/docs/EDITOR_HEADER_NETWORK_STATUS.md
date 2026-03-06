## EditorHeader 네트워크 연결 상태 표시 기능

이 문서는 `src/components/editor/EditorHeader.tsx`에 구현된 네트워크 연결 상태 인디케이터의 동작 원리, 의존성, UI 동작, 배치 위치, 테스트 방법을 정리합니다.

### 개요
- **목적**: 사용자의 네트워크 연결 상태를 실시간으로 보여주고, 끊김 상태를 강하게 강조하여 작업 중 위험을 빠르게 인지시키기 위함입니다.
- **배치 위치**: `/* 상태 저장 토글 버튼 */`의 좌측에 표시됩니다.

### 주요 의존성
- `useNetworkMonitoring()` (from `src/utils/networkUtils.ts`): 브라우저 온라인 상태 및 품질 정보를 제공하는 커스텀 훅.
- `checkNetworkConnection()` (from `src/utils/networkUtils.ts`): 실제 통신 가능 여부를 비동기적으로 점검하는 핑 기반 함수.
- `IS_DEV` (from `src/constants/config.ts`): 개발 모드 분기 처리에 사용.
- UI: `Button` (from `src/components/ui/button.tsx`), 아이콘 `Wifi`, `WifiOff` (from `lucide-react`).
- 스타일: Tailwind CSS utility 클래스.

### 동작 로직
1. `useNetworkMonitoring()`로 `isOnline`, `quality`를 구독합니다.
2. `checkNetworkConnection()`을 통해 실제 네트워크 연결(ping) 가능 여부를 주기적으로 확인합니다.
   - 최초 마운트 시 1회 실행
   - 이후 30초 간격으로 재확인 (`setInterval`)
3. 다음의 파생 상태를 사용해 UI를 결정합니다.
   - `isNetworkAvailable = isOnline && isNetworkConnected`
   - 연결 체크 중인 경우 로딩 스피너 UI 표시

### 핵심 상태 및 변수
```ts
const { isOnline, quality } = useNetworkMonitoring();
const [isNetworkConnected, setIsNetworkConnected] = useState(true);
const [isCheckingConnection, setIsCheckingConnection] = useState(false);

useEffect(() => {
  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const connected = await checkNetworkConnection();
      setIsNetworkConnected(connected);
    } catch {
      setIsNetworkConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  checkConnection();
  const interval = setInterval(checkConnection, 30000);
  return () => clearInterval(interval);
}, []);

const isNetworkAvailable = isOnline && isNetworkConnected;
const networkStatusColor = isNetworkAvailable ? 'text-green-400' : 'text-red-400';
const networkStatusBg = isNetworkAvailable
  ? 'bg-green-500/20 hover:bg-green-500/30'
  : 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/50';
const NetworkStatusIcon = isNetworkAvailable ? Wifi : WifiOff;
```

### UI 표시 규칙
- **연결됨**: 녹색 톤(`text-green-400`, `bg-green-500/20`), `Wifi` 아이콘 노출
- **끊김/불안정**: 붉은색 톤(`text-red-400`, `bg-red-500/20`), 테두리 강조, `WifiOff` 아이콘, `animate-pulse`로 시각적 경고 강화
- **체크 중**: 아이콘 대신 원형 로딩 스피너 렌더링
- 툴팁(`title`)에 현재 상태 텍스트 표시(연결 품질 포함)

### JSX 예시 (요약)
```tsx
<Button
  variant="ghost"
  size="sm"
  className={`${networkStatusColor} transition-all duration-300 p-2 ${networkStatusBg} ${!isNetworkAvailable ? 'animate-pulse' : ''}`}
  title={
    isCheckingConnection
      ? '네트워크 연결 확인 중...'
      : isNetworkAvailable
        ? `네트워크 연결됨 (${quality})`
        : '네트워크 연결 끊김'
  }
  disabled={isCheckingConnection}
>
  {isCheckingConnection ? (
    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  ) : (
    <NetworkStatusIcon className="h-4 w-4" />
  )}
</Button>
```

### 개발 모드 전용 요소와의 관계
- 본 인디케이터 자체는 항상 노출됩니다.
- 다만 `EditorHeader`의 우측에 있는 개발 전용 버튼(개발용 드롭다운, 페이지 모드 토글)은 `IS_DEV`일 때만 렌더링됩니다.

### 에러 처리
- `checkNetworkConnection()` 호출 실패 시 연결 끊김으로 간주하고 UI를 붉은색으로 전환합니다.
- 예외는 컴포넌트 내부에서 처리하여 앱 전반에 영향을 주지 않습니다.

### 접근성(Accessibility)
- `title` 속성으로 상태를 텍스트로 표기하여 보조 기술이 인식할 수 있도록 합니다.
- 시각적 강조는 색상과 애니메이션을 병행하여 색각 이상 사용자의 인지 가능성을 높입니다.

### 성능 고려사항
- 연결 체크 주기는 기본 30초이며, 필요에 따라 환경 변수로 조정할 수 있습니다.
- `useNetworkMonitoring()` 훅은 브라우저 네이티브 이벤트(`online/offline`) 기반으로 경량 동작합니다.

### 테스트 시나리오
1. 온라인 → 오프라인 전환: 아이콘이 `WifiOff`, 붉은색 배경, `animate-pulse`로 바뀌는지 확인
2. 오프라인 상태에서 30초 주기 확인: 상태가 유지/갱신되는지 확인
3. 다시 온라인 전환: 녹색 상태와 `Wifi` 아이콘으로 복귀하는지 확인
4. 체크 중 상태: 버튼이 비활성화되고 스피너가 보이는지 확인

### 트러블슈팅
- 상태가 갱신되지 않으면 `networkUtils.ts`의 `checkNetworkConnection` 엔드포인트 접근 가능 여부를 확인하세요.
- CORS 차단 또는 서버 핑 엔드포인트 다운 시 끊김으로 표시됩니다(의도된 보수적 판단).
- 개발 모드에서 콘솔 경고/로그를 통해 상세 원인을 확인할 수 있습니다.

### 관련 파일
- `src/components/editor/EditorHeader.tsx`
- `src/utils/networkUtils.ts`
- `src/constants/config.ts`
- `src/components/ui/button.tsx`


