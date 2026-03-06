# 배포 방식 분석 보고서

## 📋 개요

이 문서는 PDF Formatter 프로젝트의 현재 배포 방식과 레거시 환경에서의 iframe 기반 배포 시나리오를 분석한 결과입니다.

**분석 일시**: 2025-10-14  
**프로젝트 버전**: 2.0.0 부터 시작 (v2 버전이라는 부분 명시)  
**분석 대상**: Vite 빌드 시스템 및 배포 프로세스

## 🎯 분석 목표

- 현재 개발 환경과 프로덕션 환경의 차이점 파악
- 레거시 환경에서의 iframe 기반 배포 방식 이해
- WAS 서버와 React 앱의 통합 방안 검토
- 배포 시 포함되는 파일과 제외되는 파일 구분

## 🔍 현재 배포 방식 분석

### 1. 개발 환경 vs 프로덕션 환경

#### **개발 환경 (Development)**
```bash
npm run dev  # Vite 개발 서버 실행
```

**특징:**
- **Vite 개발 서버**: `http://localhost:4001`에서 실행
- **HMR (Hot Module Replacement)**: 실시간 코드 변경 반영
- **프록시 설정**: API 요청을 다른 서버로 전달
- **소스맵**: 디버깅을 위한 소스맵 생성
- **개발 전용**: 프로덕션 배포 시 **사용되지 않음**

**현재 실행 중인 서버:**
```
VITE v6.3.6   dev   ready in 178 ms
➜  Local:   http://localhost:4001/
➜  Network: http://192.168.0.124:4001/
```

#### **프로덕션 환경 (Production)**
```bash
npm run build:prod  # 정적 파일 생성
```

**특징:**
- **정적 파일 생성**: `dist/` 폴더에 HTML, CSS, JS 파일 생성
- **Vite 서버 없음**: 빌드된 파일만 생성
- **최적화**: 코드 압축, 트리 셰이킹, 청크 분할
- **배포용**: WAS 서버에 배포되는 파일들

### 2. 빌드 결과물 분석

#### **빌드 시 생성되는 파일들**
```
dist/
├── index.html                    # 메인 HTML 파일
├── assets/
│   ├── index-xxx.js             # JavaScript 번들
│   ├── index-xxx.css            # CSS 번들
│   └── 기타 정적 리소스들
└── 기타 정적 파일들
```

#### **빌드 시 제외되는 파일들**
- ❌ **Vite 개발 서버**: 포함되지 않음
- ❌ **개발용 프록시 설정**: 포함되지 않음
- ❌ **소스맵**: 프로덕션에서는 제외
- ❌ **HMR 코드**: 포함되지 않음
- ❌ **개발용 설정**: 포함되지 않음

### 3. 레거시 환경 배포 시나리오

#### **예상되는 배포 구조**
```
WAS 서버 (물리 컴퓨터, 할당받은 IP)
├── JSP 페이지들 (루트 경로)
│   ├── main.jsp
│   ├── login.jsp
│   └── 기타 JSP 파일들
├── React 앱 (정적 파일, 별도 경로)
│   ├── /react-app/index.html
│   ├── /react-app/assets/
│   └── 기타 정적 파일들
├── API 서버 (같은 IP, 다른 포트/경로)
└── WAS 설정 파일들
```

#### **JSP에서 React 앱 로드 방식**
```jsp
<!-- JSP 페이지에서 iframe으로 React 앱 로드 -->
<iframe 
    src="/react-app/index.html" 
    width="100%" 
    height="600px"
    frameborder="0">
</iframe>
```

### 4. 포트 및 IP 할당 분석

#### **현재 개발 환경**
- **Vite 서버**: `localhost:4001`
- **API 프록시**: 다른 서버로 전달 (개발 시에만)
- **네트워크 접근**: `http://192.168.0.124:4001/`

#### **프로덕션 환경 (예상)**
- **WAS 서버**: 할당받은 IP의 특정 포트 (예: 8080)
- **React 앱**: 같은 IP의 다른 경로 (`/react-app/`)
- **JSP 페이지**: 같은 IP의 루트 경로 (`/`)
- **API 서버**: 같은 IP의 다른 포트/경로

### 5. Vite 설정 분석

#### **현재 vite.config.ts 설정**
```typescript
// 개발 서버 설정 (프로덕션에서는 사용되지 않음)
server: {
  host: bindHost,
  port: port || 5173,
  strictPort: true,
  proxy: devProxy,  // 개발 시에만 사용
}

// 빌드 설정 (프로덕션에서 사용)
build: {
  target: ['edge79', 'chrome79', 'firefox72', 'safari13'],
  sourcemap: mode === 'development',
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        pdf: ['pdf-lib', 'pdfjs-dist'],
        moment: ['moment']
      }
    }
  }
}
```

#### **프로덕션 빌드 시 동작**
- `server` 설정은 **사용되지 않음**
- `proxy` 설정도 **사용되지 않음**
- 오직 `dist/` 폴더의 **정적 파일만 생성**
- **청크 분할**: 라이브러리별로 분리하여 캐싱 최적화

## 📊 배포 프로세스 분석

### 1. 현재 예상되는 배포 프로세스

#### **Step 1: 빌드**
```bash
npm run build:prod
```
- Vite가 소스 코드를 정적 파일로 변환
- `dist/` 폴더에 배포용 파일 생성
- 코드 압축 및 최적화

#### **Step 2: 파일 배포**
```bash
# dist/ 폴더의 파일들을 WAS 서버에 복사
cp -r dist/* /path/to/was/server/react-app/
```

#### **Step 3: WAS 서버 설정**
```xml
<!-- WAS 서버 설정 (예: web.xml) -->
<servlet-mapping>
    <servlet-name>default</servlet-name>
    <url-pattern>/react-app/*</url-pattern>
</servlet-mapping>
```

#### **Step 4: JSP 연동**
```jsp
<!-- JSP 페이지에서 React 앱 로드 -->
<iframe src="/react-app/index.html" width="100%" height="600px"></iframe>
```

### 2. 배포 후 동작 방식

#### **사용자 접근 흐름**
1. **사용자**: WAS 서버의 JSP 페이지 접근
2. **JSP 페이지**: iframe으로 React 앱 로드
3. **React 앱**: 정적 파일로 서빙됨
4. **API 호출**: 같은 IP의 다른 경로로 요청

#### **리소스 로딩**
```
사용자 브라우저
├── JSP 페이지 (WAS 서버)
├── React 앱 (정적 파일)
│   ├── index.html
│   ├── assets/index-xxx.js
│   └── assets/index-xxx.css
└── API 호출 (WAS 서버의 다른 경로)
```

## 🔧 기술적 고려사항

### 1. CORS 문제 해결

#### **개발 환경**
- Vite 프록시를 통해 CORS 문제 해결
- API 요청을 다른 서버로 전달

#### **프로덕션 환경**
- 같은 도메인에서 서빙되므로 CORS 문제 없음
- 상대 경로로 API 호출 가능

### 2. 라우팅 처리

#### **React Router 설정**
```typescript
// 현재 설정
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/e-link-v2/editor" element={<EditorPage />} />
    <Route path="/e-link-v2/viewer" element={<ViewerPage />} />
  </Routes>
</BrowserRouter>
```

#### **WAS 서버 설정 필요**
- SPA 라우팅을 위한 fallback 설정
- 모든 React 라우트를 `index.html`로 리다이렉트

### 3. 정적 파일 캐싱

#### **현재 설정**
```typescript
manualChunks: {
  vendor: ['react', 'react-dom'],        // 라이브러리 분리
  router: ['react-router-dom'],          // 라우터 분리
  ui: ['@radix-ui/react-dialog'],        // UI 컴포넌트 분리
  pdf: ['pdf-lib', 'pdfjs-dist'],        // PDF 라이브러리 분리
  moment: ['moment']                     // 날짜 라이브러리 분리
}
```

#### **캐싱 전략**
- **라이브러리**: 변경 빈도가 낮으므로 장기 캐싱
- **애플리케이션 코드**: 변경 빈도가 높으므로 단기 캐싱
- **정적 리소스**: 적절한 캐시 헤더 설정 필요

## 🎯 결론 및 권장사항

### **✅ 주요 결론**

1. **Vite 서버는 배포에 포함되지 않음**: 개발 시에만 사용
2. **정적 파일만 배포됨**: `dist/` 폴더의 파일들만 WAS 서버에 배포
3. **iframe 기반 통합**: JSP 페이지에서 React 앱을 iframe으로 로드
4. **같은 IP 사용**: WAS 서버와 React 앱이 같은 IP의 다른 경로에서 실행

### **🔧 권장사항**

#### **1. WAS 서버 설정**
- React 앱을 위한 정적 파일 서빙 경로 설정
- SPA 라우팅을 위한 fallback 설정
- 적절한 캐시 헤더 설정

#### **2. API 통합**
- 같은 도메인에서 API 서빙
- CORS 설정 불필요 (같은 도메인)
- 상대 경로로 API 호출

#### **3. 배포 자동화**
- 빌드 → 배포 → WAS 서버 재시작 자동화
- 버전 관리 시스템과 연동
- 롤백 메커니즘 구축

#### **4. 모니터링**
- React 앱 로딩 상태 모니터링
- API 호출 성공률 모니터링
- 사용자 경험 지표 추적

### **📋 체크리스트**

#### **배포 전 확인사항**
- [ ] `npm run build:prod` 성공 확인
- [ ] `dist/` 폴더에 모든 파일 생성 확인
- [ ] WAS 서버 정적 파일 서빙 경로 설정
- [ ] JSP 페이지 iframe 설정 확인
- [ ] API 엔드포인트 경로 확인

#### **배포 후 확인사항**
- [ ] JSP 페이지에서 React 앱 로딩 확인
- [ ] React 앱 내부 라우팅 동작 확인
- [ ] API 호출 정상 동작 확인
- [ ] 정적 파일 캐싱 동작 확인
- [ ] 버전 정보 표시 확인

이 분석을 통해 현재 설정이 레거시 환경의 iframe 기반 배포에 적합함을 확인할 수 있습니다.
