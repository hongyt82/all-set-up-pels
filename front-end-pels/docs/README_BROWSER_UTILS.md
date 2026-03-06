# 브라우저 정보 유틸리티 사용 가이드

## 개요

`browserUtils.ts`는 현재 실행 중인 브라우저의 상세 정보를 수집하고 관리하는 유틸리티입니다. 브라우저 종류, 버전, 기능 지원 여부, 시스템 정보 등을 포괄적으로 제공합니다.

## 주요 특징

- ✅ **포괄적 브라우저 감지**: Chrome, Firefox, Safari, Edge, IE 등
- ✅ **운영체제 감지**: Windows, macOS, Linux, iOS, Android
- ✅ **디바이스 타입 감지**: Desktop, Mobile, Tablet
- ✅ **기능 지원 감지**: 20가지 웹 기능 지원 여부 확인
- ✅ **호환성 점수**: 브라우저 호환성 점수 자동 계산
- ✅ **실시간 업데이트**: 화면 크기, 온라인 상태 등 변경 감지
- ✅ **UI 컴포넌트**: React 컴포넌트로 브라우저 정보 표시

## 설치 및 Import

```typescript
// 개별 함수 import
import { getBrowserInfo, formatBrowserInfo, calculateCompatibilityScore } from '../utils/browserUtils';

// 또는 통합 import
import { getBrowserInfo, formatBrowserInfo, calculateCompatibilityScore } from '../utils';
```

## 사용 방법

### 1. 기본 브라우저 정보 가져오기

```typescript
import { getBrowserInfo } from '../utils/browserUtils';

const browserInfo = getBrowserInfo();
console.log(browserInfo.name);        // "Chrome"
console.log(browserInfo.version);     // "119.0"
console.log(browserInfo.engine);      // "Blink"
console.log(browserInfo.os);          // "Windows"
console.log(browserInfo.deviceType);  // "desktop"
```

### 2. 브라우저 정보 포맷팅

```typescript
import { formatBrowserInfo } from '../utils/browserUtils';

const browserInfo = getBrowserInfo();

console.log(formatBrowserInfo(browserInfo, 'minimal'));  // "Chrome 119.0"
console.log(formatBrowserInfo(browserInfo, 'short'));    // "Chrome 119.0 on Windows 10"
console.log(formatBrowserInfo(browserInfo, 'detailed')); // "Chrome 119.0 (Blink) on Windows 10 - 1920x1080"
```

### 3. 호환성 점수 계산

```typescript
import { calculateCompatibilityScore } from '../utils/browserUtils';

const browserInfo = getBrowserInfo();
const score = calculateCompatibilityScore(browserInfo);
console.log(`호환성 점수: ${score}%`); // "호환성 점수: 95%"
```

### 4. 브라우저 정보 로깅

```typescript
import { logBrowserInfo } from '../utils/browserUtils';

// 콘솔에 브라우저 정보 출력
logBrowserInfo();
// 출력:
// 🌐 Browser Information:
//    Browser: Chrome 119.0
//    Engine: Blink
//    OS: Windows 10
//    Device: desktop
//    Screen: 1920x1080
//    Viewport: 1920x937
//    Language: ko-KR
//    Timezone: Asia/Seoul
//    Online: Yes
//    Compatibility Score: 95%
```

### 5. 실시간 업데이트 감지

```typescript
import { watchBrowserChanges } from '../utils/browserUtils';

const unwatch = watchBrowserChanges((browserInfo) => {
  console.log('브라우저 정보가 변경되었습니다:', browserInfo);
  // 화면 크기 변경, 온라인 상태 변경 등 감지
});

// 감지 중지
unwatch();
```

### 6. 브라우저 정보 비교

```typescript
import { compareBrowserInfo } from '../utils/browserUtils';

const info1 = getBrowserInfo();
const info2 = getBrowserInfo(); // 다른 시점의 정보

const comparison = compareBrowserInfo(info1, info2);
console.log(comparison.sameBrowser);      // true
console.log(comparison.sameScreenResolution); // false (화면 크기 변경됨)
```

## React 컴포넌트 사용법

### 1. 기본 브라우저 표시

```typescript
import { BrowserDisplay } from '../components/common/BrowserDisplay';

// 간단한 브라우저 표시
<BrowserDisplay />

// 배지 스타일로 표시
<BrowserDisplay showBadge={true} />

// 상세 정보 표시
<BrowserDisplay format="detailed" />
```

### 2. 클릭 가능한 브라우저 표시

```typescript
import { BrowserDisplay, BrowserModal } from '../components/common/BrowserDisplay';
import { useState } from 'react';

const App = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <BrowserDisplay 
        clickable={true}
        onClick={() => setShowModal(true)}
        showBadge={true}
      />
      
      <BrowserModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
```

### 3. 실시간 업데이트 브라우저 표시

```typescript
import { BrowserDisplay } from '../components/common/BrowserDisplay';

<BrowserDisplay 
  liveUpdate={true}
  format="detailed"
  showBadge={true}
/>
```

### 4. 푸터용 간단한 브라우저 표시

```typescript
import { SimpleBrowserDisplay } from '../components/common/BrowserDisplay';

<footer>
  <SimpleBrowserDisplay className="text-gray-400" />
</footer>
```

## 실제 사용 사례

### 1. 앱 헤더에 브라우저 정보 표시

```typescript
import { BrowserDisplay } from '../components/common/BrowserDisplay';

const AppHeader = () => {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>PDF Formatter</h1>
      <BrowserDisplay showBadge={true} format="short" />
    </header>
  );
};
```

### 2. 호환성 체크

```typescript
import { getBrowserInfo, calculateCompatibilityScore } from '../utils/browserUtils';

const CompatibilityCheck = () => {
  const browserInfo = getBrowserInfo();
  const score = calculateCompatibilityScore(browserInfo);
  
  if (score < 60) {
    return (
      <div className="bg-red-100 p-4 rounded">
        <p>브라우저 호환성이 낮습니다. 최신 브라우저를 사용해주세요.</p>
      </div>
    );
  }
  
  return null;
};
```

### 3. 기능별 지원 여부 체크

```typescript
import { getBrowserInfo } from '../utils/browserUtils';

const FeatureCheck = () => {
  const browserInfo = getBrowserInfo();
  
  return (
    <div>
      {!browserInfo.webglSupported && (
        <p>WebGL이 지원되지 않습니다. 3D 기능을 사용할 수 없습니다.</p>
      )}
      {!browserInfo.serviceWorkerSupported && (
        <p>Service Worker가 지원되지 않습니다. 오프라인 기능을 사용할 수 없습니다.</p>
      )}
    </div>
  );
};
```

### 4. 디바이스별 UI 조정

```typescript
import { getBrowserInfo } from '../utils/browserUtils';

const ResponsiveComponent = () => {
  const browserInfo = getBrowserInfo();
  
  if (browserInfo.deviceType === 'mobile') {
    return <MobileLayout />;
  } else if (browserInfo.deviceType === 'tablet') {
    return <TabletLayout />;
  } else {
    return <DesktopLayout />;
  }
};
```

### 5. 브라우저별 최적화

```typescript
import { getBrowserInfo } from '../utils/browserUtils';

const OptimizedComponent = () => {
  const browserInfo = getBrowserInfo();
  
  // Chrome 최적화
  if (browserInfo.name === 'Chrome') {
    return <ChromeOptimizedComponent />;
  }
  
  // Firefox 최적화
  if (browserInfo.name === 'Firefox') {
    return <FirefoxOptimizedComponent />;
  }
  
  // 기본 컴포넌트
  return <DefaultComponent />;
};
```

## 수집되는 정보 목록

### **기본 정보**
- 브라우저 이름 및 버전
- 브라우저 엔진
- 운영체제 및 버전
- 디바이스 타입 (Desktop/Mobile/Tablet)

### **화면 정보**
- 화면 해상도
- 뷰포트 크기
- 색상 깊이
- 픽셀 비율

### **시스템 정보**
- 언어 설정
- 시간대
- CPU 코어 수
- 메모리 정보 (가능한 경우)
- 온라인 상태

### **기능 지원 여부**
- LocalStorage/SessionStorage
- Web Worker/Service Worker
- WebGL/WebRTC/WebSocket
- IndexedDB/Canvas/SVG
- CSS Grid/Flexbox/Variables
- ES6/Promise/Async-Await
- WebAssembly/Modules

## 타입 정의

```typescript
interface BrowserInfo {
  name: string;                    // 브라우저 이름
  version: string;                 // 브라우저 버전
  engine: string;                  // 브라우저 엔진
  os: string;                      // 운영체제
  osVersion: string;               // 운영체제 버전
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;        // 화면 해상도
  viewportSize: string;            // 뷰포트 크기
  colorDepth: number;              // 색상 깊이
  pixelRatio: number;              // 픽셀 비율
  language: string;                // 언어 설정
  timezone: string;                // 시간대
  // ... 기타 20가지 기능 지원 여부
}
```

## 성능 고려사항

### **1. 메모이제이션**
```typescript
import { useMemo } from 'react';
import { getBrowserInfo } from '../utils/browserUtils';

const MyComponent = () => {
  const browserInfo = useMemo(() => getBrowserInfo(), []);
  // 브라우저 정보는 변경되지 않으므로 메모이제이션 가능
};
```

### **2. 실시간 업데이트 최적화**
```typescript
// 필요한 경우에만 실시간 업데이트 활성화
<BrowserDisplay liveUpdate={isDevelopment} />
```

### **3. 필터링**
```typescript
import { filterBrowserInfo } from '../utils/browserUtils';

// 기능 정보 제외하고 기본 정보만
const basicInfo = filterBrowserInfo(getBrowserInfo(), false);
```

## 주의사항

1. **개인정보 보호**: 민감한 정보는 수집하지 않음
2. **성능**: 브라우저 정보 수집은 가벼운 작업
3. **호환성**: 모든 모던 브라우저에서 작동
4. **실시간 업데이트**: 필요한 경우에만 사용

이 유틸리티를 사용하면 브라우저 환경에 맞는 최적화된 사용자 경험을 제공할 수 있습니다.
