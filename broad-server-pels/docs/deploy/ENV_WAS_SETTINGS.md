# WAS 배포 관련 환경 변수 상세 설명

`.env` 파일의 **WAS Deployment Configuration** 섹션에 있는 5개 설정이 코드에서 어떻게 적용되는지 정리한 문서입니다.

> **관련 문서**: [OVERVIEW.md](../OVERVIEW.md), [WAS_DEPLOYMENT.md](WAS_DEPLOYMENT.md)

---

## 1. 요약 표

| 환경 변수 | config 항목 | 기본값 | 실제 동작에 영향 | 비고 |
|-----------|-------------|--------|------------------|------|
| `WAS_TYPE` | `config.was.type` | `none` | 간접 (reverseProxy 판단) | 로그·문서용 + reverseProxy 보조 |
| `REVERSE_PROXY` | `config.was.reverseProxy` | `false` | 로그 출력 여부 | 콘솔 메시지만 |
| `INTERNAL_PORT` | `config.port`, `config.was.internalPort` | 8300* | **직접** (리스닝 포트) | WebSocket·Health 포트 결정 |
| `EXTERNAL_PORT` | `config.was.externalPort` | internalPort와 동일 | 없음 (정보용) | 로그·운영자 참고용 |
| `PROXY_PATH` | `config.was.proxyPath` | `/ws` | 없음 (정보용) | Nginx/Tomcat 경로와 맞춰야 함 |

\* `INTERNAL_PORT`가 없으면 `PORT` 사용, 둘 다 없으면 `8300`

---

## 2. 설정별 상세 동작

### 2.1. WAS_TYPE

- **.env 예시**: `WAS_TYPE=none` / `nginx` / `tomcat`
- **의미**: 앞단에 어떤 WAS를 두는지(또는 없음)를 나타내는 **문자열**입니다. 애플리케이션의 라우팅/프록시 동작을 직접 바꾸지는 않습니다.

**config에서의 처리** (`config/config.js`):

```javascript
const wasType = (process.env.WAS_TYPE || 'none').toLowerCase();
```

- 빈 값·미설정 → `'none'`
- 대소문자 구분 없음 (항상 소문자로 저장)

**Reverse Proxy 여부와의 관계**:

```javascript
const isReverseProxy = process.env.REVERSE_PROXY === 'true' || wasType !== 'none';
```

- `WAS_TYPE=nginx` 또는 `tomcat`이면 **REVERSE_PROXY 값과 관계없이** `config.was.reverseProxy`가 `true`가 됩니다.
- `WAS_TYPE=none`이면 `REVERSE_PROXY`가 `'true'`일 때만 `reverseProxy`가 `true`입니다.

**코드에서의 사용**:

- `config.was.type`: 서버 기동 시 콘솔 로그에만 출력  
  예: `WAS Type: nginx, Reverse Proxy: true`
- 실제 리스닝 포트·경로·SSL 등은 **WAS_TYPE에 따라 자동으로 바뀌지 않습니다**.  
  포트·경로는 `INTERNAL_PORT`, `PROXY_PATH` 등으로 설정하고, Nginx/Tomcat 설정 파일에서 같은 값을 사용해야 합니다.

**정리**:

- **역할**: “앞단에 Nginx/Tomcat이 있다”는 것을 표시하고, `reverseProxy` 플래그를 보조하며, 로그/문서용으로 사용됩니다.
- **주의**: `WAS_TYPE=nginx`만 바꾸고 Nginx를 실제로 설정하지 않으면, 클라이언트는 여전히 Node만 있는 주소로 접속해야 합니다.

---

### 2.2. REVERSE_PROXY

- **.env 예시**: `REVERSE_PROXY=false` / `true`
- **의미**: “WAS를 통한 Reverse Proxy 모드로 운영 중이다”라고 표시하는 **불리언** 플래그입니다.

**config에서의 처리**:

```javascript
const isReverseProxy = process.env.REVERSE_PROXY === 'true' || wasType !== 'none';
```

- `'true'`(문자열)일 때만 true. `true`, `1`, `yes` 등은 **false**로 처리됩니다.
- `WAS_TYPE`이 `none`이 아니면 위 식에서 이미 true가 되므로, 이 경우 `REVERSE_PROXY`는 덮어쓰기용으로만 의미가 있습니다.

**코드에서의 사용** (`src/index.js`):

- `config.was.reverseProxy`가 **true일 때만** 아래 로그가 출력됩니다.
  - `Internal Port: ..., External Port: ...`
  - `Proxy Path: ...`
- **애플리케이션의 리스닝 포트·경로·프록시 동작은 이 값으로 바뀌지 않습니다.**  
  실제 바인딩은 `config.port`(← INTERNAL_PORT/PORT)만 사용합니다.

**정리**:

- **역할**: “지금 Reverse Proxy 뒤에서 돌고 있다”는 것을 로그로 알리기 위한 설정입니다.
- **주의**: Nginx/Tomcat을 실제로 설치·설정해야 프록시가 동작합니다. 이 값은 표시용입니다.

---

### 2.3. INTERNAL_PORT

- **.env 예시**: `INTERNAL_PORT=8500` (또는 개발 8600, 프로덕션 8700)
- **의미**: **Node.js가 실제로 리스닝하는 포트**입니다. 이 포트가 곧 WebSocket 서버 포트입니다.

**config에서의 처리**:

```javascript
const internalPort = Number(process.env.INTERNAL_PORT) || Number(process.env.PORT) || 8300;
```

- `INTERNAL_PORT`가 있으면 그 값을, 없으면 `PORT`를, 둘 다 없거나 숫자가 아니면 **8300**을 사용합니다.
- `config.port`와 `config.was.internalPort` 모두 이 값입니다.

**코드에서의 사용**:

1. **WebSocket 서버**  
   `WebSocketServer({ port: config.port, host: config.host })`  
   → **INTERNAL_PORT(또는 PORT)에서 리스닝**합니다.
2. **Health Check HTTP 서버**  
   `httpServer.listen(config.port + 1, ...)`  
   → **INTERNAL_PORT + 1**에서 `/health`를 제공합니다. (예: 8700 → 8701)

**정리**:

- **역할**: 서버가 **실제로 바인딩하는 포트**를 결정하는 **유일한** 설정입니다.
- **WAS 사용 시**: Nginx/Tomcat이 이 포트(및 port+1)로 프록시하도록 설정해야 합니다.  
  예: WebSocket → `127.0.0.1:8700`, Health → `127.0.0.1:8701`.

---

### 2.4. EXTERNAL_PORT

- **.env 예시**: `EXTERNAL_PORT=8500` (직접 실행 시) / `443` (WAS가 HTTPS로 노출할 때)
- **의미**: “WAS가 **외부에 노출하는 포트**”를 적어 두는 **정보용** 값입니다.

**config에서의 처리**:

```javascript
const externalPort = Number(process.env.EXTERNAL_PORT) || internalPort;
```

- 미설정이거나 숫자가 아니면 `internalPort`와 동일한 값이 됩니다.
- `config.was.externalPort`에만 저장됩니다.

**코드에서의 사용**:

- `config.was.reverseProxy`가 true일 때만  
  `Internal Port: ..., External Port: ...` 형태로 **콘솔 로그에 출력**됩니다.
- **리스닝·라우팅·프록시 동작에는 전혀 관여하지 않습니다.**  
  실제 외부 포트는 Nginx/Tomcat 설정에서 관리합니다.

**정리**:

- **역할**: “우리 서비스는 외부에 443으로 열려 있다” 같은 **운영/문서용 표시**입니다.
- **주의**: Nginx에서 listen 443을 바꾼다고 해서 Node가 바뀌는 것이 아니므로, .env의 EXTERNAL_PORT는 Nginx 설정과 **일치시키는 것이 좋다**는 수준의 가이드용입니다.

---

### 2.5. PROXY_PATH

- **.env 예시**: `PROXY_PATH=/ws` (또는 `/websocket`, `/api/ws` 등)
- **의미**: “WAS(Nginx/Tomcat)가 Node로 **어떤 URL 경로**로 프록시할지”를 적어 두는 **정보용** 값입니다.

**config에서의 처리**:

```javascript
proxyPath: process.env.PROXY_PATH || '/ws',
```

- 미설정이면 `/ws`입니다.
- `config.was.proxyPath`에만 저장됩니다.

**코드에서의 사용**:

- Node.js 쪽에서는 **경로 기반 라우팅을 하지 않습니다.**  
  WebSocket 서버는 “해당 포트로 오는 모든 연결”을 받습니다.
- `config.was.reverseProxy`가 true일 때만  
  `Proxy Path: /ws` 형태로 **콘솔 로그에 출력**됩니다.
- **실제 프록시 경로는 Nginx/Tomcat의 `location /ws` 등에서 결정**됩니다.  
  따라서 Nginx의 `location`과 이 값을 **같게 맞춰 두는 것**이 중요합니다.

**정리**:

- **역할**: “우리 WAS는 `/ws`로 Node에 넘긴다”는 것을 문서/로그로 남기는 설정입니다.
- **주의**: `.env`에서 `PROXY_PATH=/api/ws`로 바꿨다면, Nginx에서도 `location /api/ws { ... }`로 맞춰야 클라이언트가 `wss://도메인/api/ws`로 접속할 수 있습니다.

---

## 3. 조합별 시나리오

### 3.1. 개발/직접 실행 (WAS 없음)

```env
WAS_TYPE=none
REVERSE_PROXY=false
INTERNAL_PORT=8600
EXTERNAL_PORT=8600
PROXY_PATH=/ws
```

- **동작**: Node가 **8600**에서 WebSocket, **8601**에서 Health 리스닝.
- **접속**: `ws://호스트:8600` (PROXY_PATH는 직접 접속 시 의미 없음).
- **로그**: `Reverse Proxy: false` → Internal/External/Proxy Path 로그는 출력되지 않음.

### 3.2. 프로덕션 (Nginx Reverse Proxy)

```env
WAS_TYPE=nginx
REVERSE_PROXY=true
INTERNAL_PORT=8700
EXTERNAL_PORT=443
PROXY_PATH=/ws
```

- **동작**: Node는 **8700**(WS), **8701**(Health)에서만 리스닝. Nginx가 443에서 받아 8700/8701로 넘김.
- **접속**: 클라이언트는 `wss://도메인/ws`로 접속. Nginx의 `location /ws`가 8700으로, `location /health`가 8701로 프록시해야 함.
- **로그**: `WAS Type: nginx, Reverse Proxy: true`, `Internal Port: 8700, External Port: 443`, `Proxy Path: /ws` 출력.

### 3.3. WAS_TYPE만 nginx로 두고 REVERSE_PROXY=false

```env
WAS_TYPE=nginx
REVERSE_PROXY=false
INTERNAL_PORT=8700
```

- **config**: `wasType !== 'none'`이므로 `config.was.reverseProxy`는 **true**가 됩니다.
- **동작**: 리스닝 포트는 8700/8701로 동일. 로그상으로만 “Reverse Proxy 사용 중”으로 나옵니다.
- **의미**: “실제로는 Nginx 뒤에 있다”는 것을 표시하려면 WAS_TYPE만 맞춰도 되고, REVERSE_PROXY는 명시적으로 true로 두어도 됩니다.

---

## 4. config → 코드 매핑 요약

| .env 변수 | config 필드 | 사용처 (src/index.js) |
|-----------|-------------|------------------------|
| WAS_TYPE | config.was.type | 기동 시 로그 1줄 |
| REVERSE_PROXY (+ WAS_TYPE) | config.was.reverseProxy | 위 로그 + Internal/External/ProxyPath 로그 출력 여부 |
| INTERNAL_PORT (또는 PORT) | config.port, config.was.internalPort | **WebSocket listen(port)**, **Health listen(port+1)** |
| EXTERNAL_PORT | config.was.externalPort | reverseProxy일 때 로그 1줄 |
| PROXY_PATH | config.was.proxyPath | reverseProxy일 때 로그 1줄 |

**실제 “동작”에 영향을 주는 것은 INTERNAL_PORT(또는 PORT) 하나뿐**이며, 나머지는 로그·문서·Nginx와의 일치 유지용입니다.

---

## 5. 관련 문서

- [OVERVIEW.md](../OVERVIEW.md) — 포트·env 파일·구조 한눈에
- [WAS_DEPLOYMENT.md](WAS_DEPLOYMENT.md) — Nginx/Tomcat 설정 절차
- [DEPLOYMENT.md](DEPLOYMENT.md) — 배포 전후 점검
