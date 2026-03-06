# 네트워크 상태 모니터링 가이드

## 📋 개요

이 문서는 `react-use` 라이브러리를 활용한 실시간 네트워크 연결 상태 모니터링 시스템에 대한 가이드입니다. 폐쇄적인 환경에서 보안 프로그램에 의한 주기적인 연결 끊김을 감지하고, 데이터 전송 전 네트워크 상태를 검증하여 오류 전송을 방지하는 것이 주요 목적입니다.

**문서 생성일**: 2025-10-22  
**프로젝트 버전**: 2.0.0  
**관련 파일**: 
- `src/utils/networkUtils.ts`
- `src/pages/NetworkTestPage.tsx`
- `src/components/common/NetworkStatus.tsx`

## 🎯 주요 기능

### 1. 실시간 네트워크 상태 모니터링
- 온라인/오프라인 상태 실시간 감지
- 네트워크 품질 등급 평가 (우수/양호/보통/불량/오프라인)
- 연결 타입, 속도, 지연시간 등 상세 정보 수집

### 2. 데이터 전송 전 검증
- 네트워크 연결 상태 확인
- 네트워크 품질 테스트
- 전송 가능 여부 및 권장사항 제공

### 3. 네트워크 상태 변경 감지
- 연결 상태 변경 이벤트 추적
- 상태 변경 히스토리 관리
- 실시간 알림 및 로깅

### 4. UI 컴포넌트 제공
- 다양한 형식의 네트워크 상태 표시
- 실시간 상태 업데이트
- 툴팁 및 상세 정보 제공

## 📚 핵심 함수 가이드

### 🔍 네트워크 상태 모니터링

#### `useNetworkMonitoring()`
**용도**: React 훅을 사용한 실시간 네트워크 상태 모니터링  
**사용 예시**:
```typescript
import { useNetworkMonitoring } from '../utils/networkUtils';

const MyComponent = () => {
  const { isOnline, networkState, quality } = useNetworkMonitoring();
  
  return (
    <div>
      <p>온라인 상태: {isOnline ? '온라인' : '오프라인'}</p>
      <p>품질 등급: {quality}</p>
      <p>다운로드 속도: {networkState.downlink}Mbps</p>
    </div>
  );
};
```

#### `createNetworkWatcher(callback: NetworkChangeCallback)`
**용도**: 네트워크 상태 변경 감지 및 콜백 실행  
**사용 예시**:
```typescript
import { createNetworkWatcher } from '../utils/networkUtils';

useEffect(() => {
  const cleanup = createNetworkWatcher((event) => {
    console.log('네트워크 상태 변경:', event);
    // 상태 변경 시 처리 로직
  });

  return cleanup; // 컴포넌트 언마운트 시 정리
}, []);
```

### 🔗 네트워크 연결 테스트

#### `checkNetworkConnection(): Promise<boolean>`
**용도**: 네트워크 연결 상태 확인  
**사용 예시**:
```typescript
import { checkNetworkConnection } from '../utils/networkUtils';

const testConnection = async () => {
  const isConnected = await checkNetworkConnection();
  if (isConnected) {
    console.log('네트워크 연결 정상');
  } else {
    console.log('네트워크 연결 실패');
  }
};
```

#### `testNetworkQuality(): Promise<NetworkQualityResult>`
**용도**: 네트워크 품질 테스트 (지연시간, 다운로드 속도 측정)  
**사용 예시**:
```typescript
import { testNetworkQuality } from '../utils/networkUtils';

const testQuality = async () => {
  const result = await testNetworkQuality();
  console.log('지연시간:', result.latency, 'ms');
  console.log('다운로드 속도:', result.downloadSpeed, 'Mbps');
  console.log('테스트 성공:', result.success);
};
```

### ✅ 데이터 전송 검증

#### `validateNetworkBeforeSend(): Promise<ValidationResult>`
**용도**: 데이터 전송 전 네트워크 상태 검증  
**사용 예시**:
```typescript
import { validateNetworkBeforeSend } from '../utils/networkUtils';

const sendData = async (data: any) => {
  // 전송 전 검증
  const validation = await validateNetworkBeforeSend();
  
  if (!validation.canSend) {
    alert(`전송 불가: ${validation.reason}`);
    console.log('권장사항:', validation.recommendation);
    return;
  }
  
  // 안전한 전송
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    console.log('전송 성공');
  } catch (error) {
    console.error('전송 실패:', error);
  }
};
```

### 🎨 UI 컴포넌트 사용

#### `NetworkStatus` 컴포넌트
**용도**: 네트워크 상태를 UI로 표시  
**사용 예시**:
```typescript
import NetworkStatus from '../components/common/NetworkStatus';

// 최소 형식
<NetworkStatus format="minimal" showBadge={true} />

// 컴팩트 형식
<NetworkStatus format="compact" showTooltip={true} />

// 상세 형식
<NetworkStatus format="detailed" clickable={true} onClick={handleClick} />
```

#### `NetworkIndicator` 컴포넌트
**용도**: 간단한 네트워크 상태 인디케이터  
**사용 예시**:
```typescript
import { NetworkIndicator } from '../components/common/NetworkStatus';

// 작은 점 표시
<NetworkIndicator size="sm" />

// 라벨과 함께
<NetworkIndicator size="md" showLabel={true} />
```

#### `NetworkBadge` 컴포넌트
**용도**: 네트워크 상태 배지  
**사용 예시**:
```typescript
import { NetworkBadge } from '../components/common/NetworkStatus';

<NetworkBadge variant="outline" />
```

## 🎯 실제 사용 시나리오

### 1. 폼 데이터 전송 전 검증
```typescript
const handleSubmit = async (formData: FormData) => {
  // 네트워크 상태 검증
  const validation = await validateNetworkBeforeSend();
  
  if (!validation.canSend) {
    setError(`전송 불가: ${validation.reason}`);
    setRecommendation(validation.recommendation);
    return;
  }
  
  // 안전한 전송
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      setSuccess('데이터 전송 성공');
    } else {
      throw new Error('서버 오류');
    }
  } catch (error) {
    setError('전송 실패: ' + error.message);
  }
};
```

### 2. 실시간 네트워크 상태 표시
```typescript
const NetworkStatusBar = () => {
  const { isOnline, quality } = useNetworkMonitoring();
  
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100">
      <NetworkIndicator size="sm" showLabel={true} />
      <span className="text-sm">
        {isOnline ? '온라인' : '오프라인'} - 품질: {quality}
      </span>
    </div>
  );
};
```

### 3. 네트워크 상태 변경 알림
```typescript
const NetworkAlert = () => {
  const [alerts, setAlerts] = useState<NetworkChangeEvent[]>([]);
  
  useEffect(() => {
    const cleanup = createNetworkWatcher((event) => {
      setAlerts(prev => [event, ...prev.slice(0, 4)]); // 최대 5개
      
      // 중요한 상태 변경 시 알림
      if (event.type === 'offline') {
        toast.error('네트워크 연결이 끊어졌습니다');
      } else if (event.type === 'online') {
        toast.success('네트워크 연결이 복구되었습니다');
      }
    });
    
    return cleanup;
  }, []);
  
  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div key={index} className="p-2 border rounded">
          <strong>{alert.type}</strong> - {alert.timestamp.toLocaleString()}
        </div>
      ))}
    </div>
  );
};
```

## ⚙️ 설정 및 커스터마이징

### 네트워크 품질 기준 조정
```typescript
// networkUtils.ts에서 품질 기준 수정 가능
export const getNetworkQuality = (state: NetworkState): NetworkQuality => {
  if (!state.isOnline || !state.isConnected) {
    return 'offline';
  }

  const { downlink, rtt, effectiveType } = state;

  // 커스텀 기준 설정
  if (rtt > 500) return 'poor';      // 기본값: 200ms
  if (rtt > 200) return 'fair';       // 기본값: 100ms
  if (downlink < 2) return 'poor';    // 기본값: 1Mbps
  if (downlink < 8) return 'fair';    // 기본값: 5Mbps
  if (downlink < 15) return 'good';   // 기본값: 10Mbps

  return 'excellent';
};
```

### 전송 검증 기준 조정
```typescript
// validateNetworkBeforeSend 함수에서 기준 수정
export const validateNetworkBeforeSend = async (): Promise<ValidationResult> => {
  // 커스텀 검증 로직
  const qualityTest = await testNetworkQuality();
  
  // 더 엄격한 기준 적용
  if (qualityTest.latency > 300) {  // 기본값: 1000ms
    return {
      canSend: false,
      reason: `지연시간이 너무 큽니다 (${qualityTest.latency}ms)`,
      quality: 'poor',
      recommendation: '더 안정적인 네트워크에서 시도해주세요'
    };
  }
  
  // ... 나머지 검증 로직
};
```

## 🔧 테스트 페이지 사용법

### NetworkTestPage 접근
1. 개발 모드에서 HomePage의 "Network Test Page" 버튼 클릭
2. `/network-test` 경로로 직접 접근

### 주요 테스트 기능
1. **연결 테스트**: 기본적인 네트워크 연결 상태 확인
2. **품질 테스트**: 지연시간, 다운로드 속도 측정
3. **전송 검증**: 데이터 전송 전 네트워크 상태 검증
4. **모니터링**: 실시간 네트워크 상태 변경 감지
5. **데이터 전송 시뮬레이션**: 실제 데이터 전송 테스트

### 테스트 결과 해석
- **연결 테스트**: ✅ 성공 / ❌ 실패
- **품질 테스트**: 지연시간(ms), 다운로드 속도(Mbps)
- **전송 검증**: 전송 가능 여부, 사유, 권장사항
- **모니터링**: 상태 변경 이벤트 히스토리

## ⚠️ 주의사항 및 제한사항

### 1. 브라우저 호환성
- **Connection API**: Chrome, Edge, Opera에서만 지원
- **Network Information API**: 실험적 기능으로 일부 브라우저에서 제한적 지원
- **Fallback**: 지원하지 않는 브라우저에서는 기본적인 온라인/오프라인 상태만 감지

### 2. 보안 제약사항
- **HTTPS 필수**: 일부 네트워크 API는 HTTPS 환경에서만 작동
- **CORS 제한**: 외부 도메인 테스트 시 CORS 정책 확인 필요
- **프라이버시**: 네트워크 정보 수집 시 사용자 프라이버시 고려

### 3. 성능 고려사항
- **주기적 테스트**: 너무 빈번한 품질 테스트는 성능에 영향
- **메모리 사용**: 상태 변경 히스토리 관리 시 메모리 사용량 주의
- **배터리 소모**: 모바일 환경에서 지속적인 모니터링 시 배터리 소모

### 4. 폐쇄 환경 특수사항
- **프록시 환경**: 기업 내부 프록시 환경에서의 네트워크 감지 제한
- **방화벽**: 보안 프로그램에 의한 연결 차단 감지 어려움
- **내부 네트워크**: 외부 인터넷 연결과 내부 네트워크 상태 차이

## 🔗 관련 파일

### 구현 파일
- **`src/utils/networkUtils.ts`**: 핵심 네트워크 모니터링 로직
- **`src/pages/NetworkTestPage.tsx`**: 테스트 및 시연 페이지
- **`src/components/common/NetworkStatus.tsx`**: UI 컴포넌트

### 설정 파일
- **`src/constants/routes.ts`**: 라우팅 설정
- **`src/constants/pageTitles.ts`**: 페이지 제목 설정
- **`src/utils/index.ts`**: 유틸리티 함수 내보내기

### 의존성
- **`react-use`**: 네트워크 상태 감지 훅 제공
- **`@types/react-use`**: TypeScript 타입 정의

## 📝 업데이트 이력

- **2025-10-22**: 초기 문서 생성
- **버전 2.0.0**: 네트워크 상태 모니터링 시스템 구축

---

이 가이드를 통해 폐쇄적인 환경에서의 네트워크 상태 모니터링과 데이터 전송 안정성을 확보할 수 있습니다. 보안 프로그램에 의한 주기적인 연결 끊김을 감지하고, 데이터 전송 전 적절한 검증을 통해 오류 전송을 방지할 수 있습니다.
