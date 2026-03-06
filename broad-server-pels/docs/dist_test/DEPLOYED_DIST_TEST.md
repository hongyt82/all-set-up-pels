# 배포 후 생성된 dist 테스트 시나리오

**실제 배포 환경**에 올라간 `dist/index.js`와 `.env.production` 기준으로, 서비스가 정상 동작하는지 검증하는 절차를 정리한 문서입니다.

---

## 1. 목적 및 전제

### 목적

- 배포된 서버에서 **dist 기반** Node 프로세스가 기동·유지되는지 확인
- **WAS(Nginx 등)를 통한** Health·WebSocket 접근이 정상인지 확인
- 클라이언트(안드로이드 등)가 **프로덕션 URL**로 접속해 동기화가 되는지 확인

### 전제

| 항목 | 내용 |
|------|------|
| 배포 구조 | 서버에 `dist/index.js` + `.env.production` 배치 완료 |
| 프로세스 | PM2 또는 직접 실행으로 `node dist/index.js` 동작 중 |
| WAS | Nginx(또는 Apache 등)가 Reverse Proxy로 443 → 127.0.0.1:8700(WS), 127.0.0.1:8701(health) 연결 |
| 서버 설정 | `.env.production` 에서 `IP=127.0.0.1`, `PORT=8700` (WAS가 같은 머신이므로 localhost 바인딩) |

---

## 2. 배포 환경에서의 구조

```
[클라이언트]
    ↓ wss://도메인/ws, https://도메인/health
[WAS (Nginx 등) - 443]
    ↓ proxy_pass
[Node (dist/index.js)]
    - ws://127.0.0.1:8700  (WebSocket)
    - http://127.0.0.1:8701/health (Health)
```

- **외부**: 클라이언트는 **도메인 + 443** 으로만 접속 (예: `wss://your-domain.com/ws`, `https://your-domain.com/health`)
- **내부**: Node는 **127.0.0.1:8700 / 127.0.0.1:8701** 에만 리스닝 (WAS가 같은 서버이므로)

---

## 3. 테스트 순서

### 3.1 서버 내부: 프로세스 확인

배포된 서버에 SSH 등으로 접속한 뒤, **server 루트**에서 확인.

#### PM2 사용 시

```bash
cd /path/to/sync-server-mono/server   # 실제 배포 경로
pm2 status
pm2 logs sync-server --lines 50
```

- **기대**: `sync-server` 가 `online`, 로그에 `WebSocket server listening on ws://127.0.0.1:8700`, `Health Check server listening on http://127.0.0.1:8701/health` 출력

#### 직접 실행 시

- 해당 터미널/백그라운드 프로세스에서 동일한 리스닝 로그가 나오는지 확인

---

### 3.2 서버 내부: 로컬 Health 확인

Node가 **8701**에서 응답하는지 먼저 확인 (WAS 경유 없이).

```bash
curl -s http://127.0.0.1:8701/health
```

- **기대**: `{"status":"ok", "timestamp": "...", "server": {...}, "memory": {...}}`
- 실패 시: dist 기동 실패·포트 충돌·env 미로드 등 점검 ([LOCAL_TEST_DIST.md](LOCAL_TEST_DIST.md) 참고)

---

### 3.3 WAS 경유: Health 확인

외부에서 사용하는 것과 동일한 경로로 Health 접근.

```bash
# HTTPS 도메인 사용 시 (실제 도메인으로 변경)
curl -s https://your-domain.com/health
```

- **기대**: 동일한 JSON (status ok)
- **실패 시**: Nginx의 `location /health` 가 **8701** upstream으로 연결되는지 확인 (8700이 아님). [DEPLOY_CHECKLIST.md](../deploy/DEPLOY_CHECKLIST.md) 참고

---

### 3.4 WAS 경유: WebSocket 연결 확인

실제 클라이언트가 쓰는 주소로 WebSocket이 열리는지 확인.

- **프로덕션 WebSocket URL**: `wss://<도메인>/ws` (또는 Nginx에서 설정한 경로)
- 예: `wss://your-domain.com/ws`

도구 예:

- 브라우저 콘솔 또는 WebSocket 클라이언트로 `wss://your-domain.com/ws` 연결 시도
- 안드로이드 앱에서 **프로덕션 URL** (`wss://도메인/ws`) 로 설정 후 동기화(연결·room 입장) 동작 확인

---

## 4. 클라이언트(안드로이드) 프로덕션 설정

배포 서버로 접속할 때는 **로컬 IP가 아닌 도메인 + WAS 경로**를 사용합니다.

| 구분 | 로컬 테스트 (같은 LAN) | 배포 환경 (실제 서비스) |
|------|-------------------------|--------------------------|
| **WebSocket** | `ws://192.168.0.xxx:8700` | `wss://your-domain.com/ws` |
| **Health** | `http://192.168.0.xxx:8701/health` | `https://your-domain.com/health` |

- **프로토콜**: 배포 시에는 HTTPS이므로 WebSocket은 **wss://** 사용
- **포트**: 443 (URL에 생략 가능)
- **경로**: Nginx 등에서 설정한 `/ws`, `/health` 유지

안드로이드 앱에서 환경별로 URL만 바꾸거나, 빌드 플레이버/설정으로 프로덕션 시 `wss://도메인/ws` 를 쓰도록 구성하면 됩니다.

---

## 5. 배포 후 테스트 체크리스트

| 단계 | 확인 항목 |
|------|-----------|
| 1 | 서버에 `dist/index.js`, `.env.production` 존재 |
| 2 | PM2 또는 프로세스로 `dist/index.js` 실행 중, 로그에 8700/8701 리스닝 출력 |
| 3 | `curl http://127.0.0.1:8701/health` → `status":"ok"` |
| 4 | `curl https://도메인/health` → 동일 JSON (WAS·SSL 정상) |
| 5 | 클라이언트가 `wss://도메인/ws` 로 연결 가능, 동기화(입장·메시지) 정상 |

---

## 6. 자주 발생하는 문제

### 6.1 Health는 127.0.0.1:8701에서 되는데 /health (외부)는 502/504

- **원인**: Nginx에서 `/health` 를 **8700** upstream으로 연결한 경우 (Health 서버는 **8701**)
- **조치**: `location /health` 의 `proxy_pass` 를 **8701** 전용 upstream으로 변경 (예: `http://health_backend/health`, `upstream health_backend { server 127.0.0.1:8701; }`)

### 6.2 WebSocket 연결 거부 / 타임아웃

- Nginx `location /ws` 의 `proxy_pass` 가 **127.0.0.1:8700** 인지 확인
- `proxy_http_version 1.1`, `Upgrade`, `Connection "upgrade"` 설정 여부 확인
- 방화벽에서 서버 443 인바운드 허용 여부 확인

### 6.3 PM2가 계속 재시작 (restart loop)

- `pm2 logs` 로 에러 메시지 확인
- `dist/index.js` 실행 시 에러(예: Dynamic require, env 경로)가 나는지, server 루트에서 직접 `NODE_ENV=production node dist/index.js` 로 실행해 재현
- [BUILD.md](../build/BUILD.md), [LOCAL_TEST_DIST.md](LOCAL_TEST_DIST.md) 참고해 빌드·env 재확인

### 6.4 배포 서버에서 dist 없음 / 오래된 버전

- 배포 파이프라인에서 `npm run build` 후 **dist/** 를 서버에 복사하는지 확인
- 서버에서 `dist/index.js` 수정 시각·버전이 최신 빌드와 일치하는지 확인

---

## 7. 참고 문서

- [LOCAL_TEST_DIST.md](LOCAL_TEST_DIST.md) — 로컬에서 dist 테스트 시나리오
- [DEPLOYMENT.md](../deploy/DEPLOYMENT.md) — 배포 프로세스
- [DEPLOY_CHECKLIST.md](../deploy/DEPLOY_CHECKLIST.md) — Nginx·env 등 배포 체크리스트
- [BUILD.md](../build/BUILD.md) — 빌드 및 스모크 테스트
