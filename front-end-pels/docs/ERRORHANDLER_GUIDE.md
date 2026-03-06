추가된 콘솔 로그 기능:
```
현재의 ErrorHandler 기능은 전역 에러를 감지하며 
App.tsx 에서 ErrorBoundary , errorHandler.ts 현재의 부분과 연관이 있다.

```
1. HomePage.tsx - 테스트 함수별 로그:
```
   🔴 [테스트] HTTP 에러 테스트 시작/완료
   🔴 [테스트] 네트워크 에러 테스트 시작/완료
   🔴 [테스트] API 에러 테스트 시작/완료
   🔴 [테스트] 타임아웃 에러 테스트 시작/완료
   🔴 [테스트] Fetch 에러 테스트 시작/완료
   🔴 [테스트] Promise Rejection 테스트 시작/완료
```   
2. errorHandler.ts - 실제 에러 감지 로그:
```
   🚨 [GlobalErrorHandler] Window Error 감지 - JavaScript 런타임 에러
   🚨 [GlobalErrorHandler] Unhandled Promise Rejection 감지 - Promise 에러
   🌐 [GlobalErrorHandler] Fetch 요청 시작/성공/에러 - Fetch API 모니터링
   🌐 [GlobalErrorHandler] XHR 요청 시작/에러/타임아웃 - XMLHttpRequest 모니터링
   🔴 [GlobalErrorHandler] 수동 에러 발생 - 테스트용 에러 발생
   🧪 테스트 방법:
   개발자 도구 콘솔 열기 (F12)
   빨간색 테스트 박스의 각 버튼 클릭
   콘솔에서 다음과 같은 로그 확인:
   테스트 시작/완료 메시지
   실제 에러 감지 메시지
   ErrorDialog 표시 확인
   이제 각 버튼을 클릭할 때마다 콘솔에서 정상 동작을 확인할 수 있습니다!
   Run install and dev server to capture current error
   Resolve package.json dependency conflicts (duplicates, versions)
```
실제 서비스에서의 에러 처리 흐름:

```
1. App.tsx - 최상위 에러 처리 구조

2. ErrorBoundary.tsx - React 컴포넌트 에러 감지
역할: React 컴포넌트 렌더링 중 발생하는 에러만 감지
감지 범위:
컴포넌트 렌더링 에러
생명주기 메서드 에러
자식 컴포넌트 에러
동작: 에러 발생 시 useErrorStore에 runtime-error 전달

3. errorHandler.ts - 전역 에러 감지
역할: JavaScript 런타임, 네트워크, HTTP 에러 등 모든 에러 감지
감지 범위:
window.onerror - JavaScript 런타임 에러
unhandledrejection - Promise rejection 에러
fetch API 에러 (HTTP 4xx, 5xx)
XMLHttpRequest 에러 (네트워크, 타임아웃)
동작: 각 에러 타입별로 useErrorStore에 적절한 에러 타입 전달

4. ErrorDialog.tsx - 통합 에러 표시
역할: useErrorStore의 상태를 구독하여 에러 다이얼로그 표시
표시 내용: 에러 타입별로 다른 메시지, 아이콘, 액션 버튼

📊 에러 처리 분담:
에러 소스	감지 담당	에러 타입	다이얼로그 표시
React 컴포넌트 에러	ErrorBoundary.tsx	runtime-error	✅
JavaScript 런타임 에러	errorHandler.ts	runtime-error	✅
HTTP 에러 (4xx, 5xx)	errorHandler.ts	http-error	✅
네트워크 에러	errorHandler.ts	network-error	✅
Promise rejection	errorHandler.ts	runtime-error	✅
타임아웃 에러	errorHandler.ts	timeout-error	✅

🎯 핵심 포인트:
이중 보안: ErrorBoundary와 errorHandler가 서로 다른 에러를 감지
통합 표시: 모든 에러가 ErrorDialog 하나로 통합 표시
실시간 감지: 사용자가 경험하는 모든 에러를 실시간으로 감지하고 처리
사용자 친화적: 기술적 에러를 사용자가 이해하기 쉬운 메시지로 변환
따라서 실제 서비스에서는 사용자가 경험할 수 있는 모든 종류의 에러가 자동으로 감지되어 적절한 다이얼로그로 표시됩니다!

```