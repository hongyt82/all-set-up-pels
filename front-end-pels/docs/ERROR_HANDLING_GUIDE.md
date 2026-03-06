# 🚨 에러 핸들링 시스템 가이드

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [구성 요소](#구성-요소)
3. [사용 방법](#사용-방법)
4. [에러 타입](#에러-타입)
5. [실전 예제](#실전-예제)

---

## 시스템 개요

PDF Formatter 애플리케이션의 통합 에러 핸들링 시스템입니다.

### ✨ 주요 기능

- **통일된 에러 UI**: 모든 에러를 일관된 다이얼로그로 표시
- **자동 에러 감지**: 400대/500대 HTTP 에러, React 런타임 에러 자동 캐치
- **404 페이지**: 존재하지 않는 라우트 자동 처리
- **전역 상태 관리**: Zustand 기반 에러 상태 관리
- **개발자 친화적**: 에러 로깅 및 디버깅 정보 제공

---

## 구성 요소

### 📁 파일 구조

```
├── components/common/
│   ├── ErrorDialog.tsx        # 통합 에러 다이얼로그
│   └── ErrorBoundary.tsx      # React Error Boundary
├── stores/
│   └── errorStore.ts          # 에러 상태 관리 (Zustand)
├── hooks/
│   └── useErrorHandler.ts     # 에러 핸들링 훅
├── pages/
│   └── NotFoundPage.tsx       # 404 페이지
├── constants/
│   └── dialogMessages.ts      # 에러 메시지 상수
└── App.tsx                    # ErrorBoundary 적용
```

---

## 사용 방법

### 1️⃣ API 요청 에러 핸들링

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleFetchError, handleError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');

      // HTTP 에러 체크
      if (!response.ok) {
        await handleFetchError(response);
        return;
      }

      const data = await response.json();
      // 데이터 처리...
    } catch (error) {
      // 네트워크 에러 등 처리
      handleError(error);
    }
  };

  return <button onClick={fetchData}>데이터 불러오기</button>;
}
```

### 2️⃣ 비동기 함수 자동 에러 처리

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { wrapAsync } = useErrorHandler();

  const fetchData = wrapAsync(async () => {
    const response = await fetch('/api/data');
    return response.json();
  }, '데이터를 불러오는 중 오류가 발생했습니다.');

  return <button onClick={fetchData}>데이터 불러오기</button>;
}
```

### 3️⃣ 수동으로 에러 표시

```typescript
import { useErrorStore } from '../stores/errorStore';

function MyComponent() {
  const { showError } = useErrorStore();

  const handleAction = () => {
    // 비즈니스 로직 검증
    if (someCondition) {
      showError(
        'client-error',
        '잘못된 입력입니다.',
        '상세 정보: 필수 필드가 누락되었습니다.'
      );
      return;
    }
  };

  return <button onClick={handleAction}>작업 실행</button>;
}
```

### 4️⃣ 상태 코드 기반 에러 처리

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleStatusError } = useErrorHandler();

  const checkPermission = () => {
    const hasPermission = false; // 권한 체크 로직

    if (!hasPermission) {
      handleStatusError(
        403,
        '접근 권한이 없습니다.',
        '관리자에게 문의하세요.'
      );
    }
  };

  return <button onClick={checkPermission}>권한 확인</button>;
}
```

---

## 에러 타입

### 📌 ErrorType 분류

| 타입            | 코드    | 설명                         | 아이콘           |
| --------------- | ------- | ---------------------------- | ---------------- |
| `not-found`     | 404     | 페이지/리소스를 찾을 수 없음 | 📄 FileQuestion  |
| `client-error`  | 400-499 | 클라이언트 요청 오류         | ❌ XCircle       |
| `server-error`  | 500-599 | 서버 내부 오류               | 🔥 ServerCrash   |
| `network-error` | -       | 네트워크 연결 오류           | 📡 Wifi          |
| `runtime-error` | -       | React 런타임 오류            | ⚠️ AlertTriangle |
| `general-error` | -       | 일반 오류                    | ⚠️ AlertTriangle |

### 🎨 에러 다이얼로그 동작

#### **404 에러**

- 확인 버튼 클릭 → **홈 페이지로 이동**

#### **런타임 에러**

- 확인 버튼 클릭 → **페이지 새로고침**

#### **기타 에러**

- 확인 버튼 클릭 → **다이얼로그 닫기**

---

## 실전 예제

### 예제 1: PDF 업로드 에러 처리

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function PDFUploader() {
  const { handleError, handleStatusError } = useErrorHandler();

  const uploadPDF = async (file: File) => {
    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      handleStatusError(
        413,
        '파일 크기가 너무 큽니다.',
        '최대 10MB까지 업로드 가능합니다.'
      );
      return;
    }

    // PDF 파일 타입 검증
    if (file.type !== 'application/pdf') {
      handleStatusError(
        415,
        '지원하지 않는 파일 형식입니다.',
        'PDF 파일만 업로드 가능합니다.'
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const result = await response.json();
      console.log('업로드 성공:', result);
    } catch (error) {
      handleError(error, 'PDF 파일을 업로드하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <input
      type="file"
      accept=".pdf"
      onChange={(e) => e.target.files?.[0] && uploadPDF(e.target.files[0])}
    />
  );
}
```

### 예제 2: 데이터 페칭 에러 처리

```typescript
import { useEffect, useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';

function DataViewer() {
  const [data, setData] = useState(null);
  const { handleFetchError, handleError } = useErrorHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');

        // HTTP 에러 체크
        if (!response.ok) {
          await handleFetchError(response);
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        handleError(error, '데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchData();
  }, [handleFetchError, handleError]);

  return <div>{data ? JSON.stringify(data) : '로딩 중...'}</div>;
}
```

### 예제 3: 폼 제출 에러 처리

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useErrorStore } from '../stores/errorStore';

function FormComponent() {
  const { wrapAsync } = useErrorHandler();
  const { showError } = useErrorStore();

  const handleSubmit = wrapAsync(async (formData: FormData) => {
    // 유효성 검증
    const name = formData.get('name');
    if (!name) {
      showError(
        'client-error',
        '이름을 입력해 주세요.',
        '필수 입력 항목입니다.'
      );
      return;
    }

    // API 요청
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('제출 실패');
    }

    alert('제출 완료!');
  }, '폼 제출 중 오류가 발생했습니다.');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      <input name="name" placeholder="이름" />
      <button type="submit">제출</button>
    </form>
  );
}
```

---

## 🔧 커스터마이징

### 에러 메시지 수정

`/constants/dialogMessages.ts`에서 에러 메시지를 수정할 수 있습니다.

```typescript
ERROR: {
  CLIENT_ERROR: {
    title: '요청 처리 실패',
    description: '잘못된 요청입니다.\n다시 시도해 주세요.',
    confirmText: '확인',
  },
}
```

### 에러 로깅 추가

`/components/common/ErrorBoundary.tsx`의 `logErrorToService` 메서드에서 에러 로깅 서비스 연동:

```typescript
logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
  // Sentry, LogRocket 등의 서비스로 전송
  // Sentry.captureException(error);
  console.group('🚨 Error Boundary Log');
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.groupEnd();
}
```

---

## ✅ 테스트 시나리오

### 시나리오 1: 404 에러

1. 존재하지 않는 URL 접근: `/invalid-route`
2. 404 페이지 표시
3. 에러 다이얼로그 자동 표시
4. "홈으로" 버튼 클릭 → 홈 페이지 이동

### 시나리오 2: 네트워크 에러

1. 네트워크 연결 차단 상태에서 API 요청
2. 네트워크 에러 다이얼로그 표시
3. "확인" 버튼 클릭 → 다이얼로그 닫기

### 시나리오 3: 런타임 에러

1. 의도적으로 에러 발생시키는 컴포넌트 렌더링
2. ErrorBoundary가 에러 캐치
3. 런타임 에러 다이얼로그 표시
4. "새로고침" 버튼 클릭 → 페이지 리로드

---

## 📌 주의사항

1. **ErrorBoundary는 이벤트 핸들러 내부 에러를 캐치하지 않습니다.**
   - 이벤트 핸들러 내부에서는 `try-catch` 사용 필요

2. **비동기 작업은 wrapAsync 사용 권장**
   - 자동으로 에러 처리 적용

3. **에러 스토어는 싱글톤**
   - 여러 컴포넌트에서 동시에 사용 가능

4. **404 에러는 자동으로 홈으로 리다이렉트**
   - 다른 동작이 필요하면 NotFoundPage 수정

---

## 🎯 베스트 프랙티스

### ✅ Good

```typescript
// wrapAsync 사용으로 간결한 코드
const fetchData = wrapAsync(async () => {
  const res = await fetch('/api/data');
  return res.json();
});
```

### ❌ Bad

```typescript
// 불필요한 중복 에러 처리
const fetchData = async () => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) {
      // 수동 에러 처리...
    }
    return res.json();
  } catch (error) {
    // 수동 에러 처리...
  }
};
```

---

**작성일:** 2025-10-01  
**버전:** 1.0.0
