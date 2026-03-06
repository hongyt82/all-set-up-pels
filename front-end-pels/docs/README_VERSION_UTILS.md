# 버전 관리 유틸리티 사용 가이드

## 개요

`versionUtils.ts`는 폐쇄적 환경에서 수동 배포 시 앱 버전을 관리하는 유틸리티입니다. package.json의 version을 기반으로 버전 정보를 자동으로 추출하고 관리합니다.

## 주요 특징

- ✅ **package.json 기반**: package.json의 version 필드를 자동으로 읽어옴
- ✅ **빌드 시점 주입**: Vite를 통해 빌드 시점에 버전 정보 주입
- ✅ **Git 정보 포함**: Git 커밋 해시 자동 추출 (선택적)
- ✅ **환경별 구분**: development, production, localdev 환경 구분
- ✅ **버전 비교**: 버전 간 비교 및 범위 체크 기능
- ✅ **UI 컴포넌트**: React 컴포넌트로 버전 정보 표시

## 설치 및 설정

### 1. package.json 버전 관리

```json
{
  "name": "pdf-formatter",
  "version": "1.2.1",
  "private": true
}
```

### 2. Vite 설정 (이미 완료됨)

`vite.config.ts`에서 빌드 시점에 버전 정보를 주입합니다:

```typescript
define: {
  __APP_VERSION__: JSON.stringify(appVersion),
  __BUILD_TIME__: JSON.stringify(buildTime),
  __GIT_COMMIT__: JSON.stringify(gitCommit || ''),
}
```

## 사용 방법

### 1. 기본 사용법

```typescript
import { getAppVersion } from '../utils/versionUtils';

const versionInfo = getAppVersion();
console.log(versionInfo.full);        // "1.2.1"
console.log(versionInfo.major);       // 1
console.log(versionInfo.minor);       // 2
console.log(versionInfo.patch);       // 1
console.log(versionInfo.environment); // "production"
```

### 2. 버전 정보 포맷팅

```typescript
import { formatVersion } from '../utils/versionUtils';

const versionInfo = getAppVersion();

console.log(formatVersion(versionInfo, 'short'));    // "1.2.1"
console.log(formatVersion(versionInfo, 'full'));     // "1.2.1 (production)"
console.log(formatVersion(versionInfo, 'detailed')); // "1.2.1 - 2024-10-21 18:30 (production)"
```

### 3. 버전 비교

```typescript
import { compareVersions, isVersionGreater, isVersionInRange } from '../utils/versionUtils';

// 버전 비교
console.log(compareVersions('1.2.1', '1.2.0')); // 1 (첫 번째가 더 큼)
console.log(compareVersions('1.2.1', '1.2.1')); // 0 (같음)
console.log(compareVersions('1.2.1', '1.3.0')); // -1 (첫 번째가 더 작음)

// 버전 크기 비교
console.log(isVersionGreater('1.2.1', '1.2.0')); // true
console.log(isVersionGreater('1.2.1', '1.3.0')); // false

// 버전 범위 체크
console.log(isVersionInRange('1.2.1', '1.0.0', '2.0.0')); // true
```

### 4. 버전 배지 색상

```typescript
import { getVersionBadgeColor } from '../utils/versionUtils';

const versionInfo = getAppVersion();
const badgeColor = getVersionBadgeColor(versionInfo);

// CSS 클래스명 반환
console.log(badgeColor); // "bg-green-100 text-green-800 border-green-200"
```

### 5. 개발용 로깅

```typescript
import { logVersionInfo } from '../utils/versionUtils';

// 콘솔에 버전 정보 출력
logVersionInfo();
// 출력:
// 🚀 App Version Info:
//    Version: 1.2.1
//    Type: stable
//    Environment: production
//    Build Time: 2024-10-21T09:30:00.000Z
//    Deploy Date: 2024-10-21 18:30
//    Git Commit: abc123def456
```

## React 컴포넌트 사용법

### 1. 기본 버전 표시

```typescript
import { VersionDisplay } from '../components/common/VersionDisplay';

// 간단한 버전 표시
<VersionDisplay />

// 배지 스타일로 표시
<VersionDisplay showBadge={true} />

// 상세 정보 표시
<VersionDisplay format="detailed" />
```

### 2. 클릭 가능한 버전 표시

```typescript
import { VersionDisplay, VersionModal } from '../components/common/VersionDisplay';
import { useState } from 'react';

const App = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <VersionDisplay 
        clickable={true}
        onClick={() => setShowModal(true)}
        showBadge={true}
      />
      
      <VersionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
```

### 3. 푸터용 간단한 버전 표시

```typescript
import { SimpleVersionDisplay } from '../components/common/VersionDisplay';

<footer>
  <SimpleVersionDisplay className="text-gray-400" />
</footer>
```

## 실제 사용 사례

### 1. 앱 헤더에 버전 표시

```typescript
import { VersionDisplay } from '../components/common/VersionDisplay';

const AppHeader = () => {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>PDF Formatter</h1>
      <VersionDisplay showBadge={true} format="short" />
    </header>
  );
};
```

### 2. 설정 페이지에 버전 정보

```typescript
import { getAppVersion, formatVersion } from '../utils/versionUtils';

const SettingsPage = () => {
  const versionInfo = getAppVersion();

  return (
    <div className="space-y-4">
      <h2>앱 정보</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>버전:</div>
        <div>{versionInfo.full}</div>
        <div>배포일:</div>
        <div>{versionInfo.deployDate}</div>
        <div>환경:</div>
        <div className="capitalize">{versionInfo.environment}</div>
      </div>
    </div>
  );
};
```

### 3. 버전 업데이트 체크

```typescript
import { checkForUpdates } from '../utils/versionUtils';

const checkVersion = (currentVersion: string, latestVersion: string) => {
  const updateInfo = checkForUpdates(currentVersion, latestVersion);
  
  if (updateInfo.hasUpdate) {
    if (updateInfo.isMajorUpdate) {
      console.log('주요 업데이트가 있습니다!');
    } else if (updateInfo.isMinorUpdate) {
      console.log('마이너 업데이트가 있습니다.');
    } else {
      console.log('패치 업데이트가 있습니다.');
    }
  }
};
```

### 4. 조건부 기능 활성화

```typescript
import { isVersionGreater } from '../utils/versionUtils';

const MyComponent = () => {
  const versionInfo = getAppVersion();
  const hasNewFeature = isVersionGreater(versionInfo.full, '1.2.0');

  return (
    <div>
      {hasNewFeature && (
        <div>새로운 기능이 활성화되었습니다!</div>
      )}
    </div>
  );
};
```

## 수동 배포 시 버전 관리 워크플로우

### 1. 버전 업데이트

```bash
# package.json의 version을 수동으로 업데이트
# 예: 1.2.1 → 1.2.2

# 빌드 실행
npm run build:prod

# 빌드 시 자동으로 새로운 버전 정보가 주입됨
```

### 2. 버전 확인

```typescript
// 앱 실행 시 버전 정보 확인
import { logVersionInfo } from '../utils/versionUtils';

// 개발 환경에서만 실행
if (import.meta.env.DEV) {
  logVersionInfo();
}
```

### 3. 배포 후 확인

```typescript
// 배포된 앱에서 버전 정보 확인
import { getAppVersion } from '../utils/versionUtils';

const versionInfo = getAppVersion();
console.log('Deployed version:', versionInfo.full);
console.log('Build time:', versionInfo.buildTime);
```

## 타입 정의

```typescript
interface AppVersionInfo {
  major: number;           // 메이저 버전 (1)
  minor: number;           // 마이너 버전 (2)
  patch: number;           // 패치 버전 (1)
  full: string;            // 전체 버전 문자열 (1.2.1)
  buildTime: string;       // 빌드 시간
  gitCommit?: string;      // Git 커밋 해시 (선택적)
  environment: 'development' | 'production' | 'localdev';
  deployDate: string;      // 배포 날짜
  versionType: 'stable' | 'beta' | 'alpha' | 'dev';
}
```

## 주의사항

1. **package.json 수정**: 버전 업데이트 시 package.json의 version 필드를 반드시 수정해야 합니다.
2. **빌드 필요**: 버전 변경 후 반드시 빌드를 다시 실행해야 합니다.
3. **Git 정보**: Git 커밋 정보는 선택적이며, Git이 없는 환경에서는 표시되지 않습니다.
4. **환경 구분**: development, production, localdev 환경에 따라 다른 정보가 표시됩니다.

이 유틸리티를 사용하면 폐쇄적 환경에서도 체계적으로 앱 버전을 관리할 수 있습니다.
