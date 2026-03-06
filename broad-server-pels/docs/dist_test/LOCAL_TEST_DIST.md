# 로컬에서 Production 빌드(dist) 테스트 시나리오

배포 전에 **production 빌드로 생성된 `dist/index.js`** 를 로컬 환경에서 실행해 동작을 검증하는 전 과정을 정리한 문서입니다.

---

## 1. 목적 및 전제

### 목적

- **배포 직전** 빌드 산출물(dist)이 의도대로 동작하는지 로컬에서 확인
- 같은 PC에서의 health 확인, **안드로이드 등 다른 기기**에서의 WebSocket 접속 테스트

### 전제

| 항목 | 내용 |
|------|------|
| 작업 디렉터리 | `server/` 루트 (모든 명령은 여기서 실행) |
| 환경 파일 | `server/.env.production` 존재 (또는 테스트용 .env) |
| Node | 18 이상 |
| 포트 | WebSocket **8700**, Health **8701** (PORT+1) |

---

## 2. 시나리오 A: 같은 PC에서만 테스트

**브라우저·curl 등 같은 머신에서만** health/WS를 확인할 때.

### 2.1 빌드

```bash
cd server
npm run build
```

- 산출물: `dist/index.js` (단일 ESM, 난독화 적용)

### 2.2 환경 설정

`.env.production` 에서 **IP=127.0.0.1** 유지 (기본값).

- WebSocket: `ws://127.0.0.1:8700`
- Health: `http://127.0.0.1:8701/health`

### 2.3 서버 기동

```bash
NODE_ENV=production node dist/index.js
```

또는:

```bash
npm start
```

정상 기동 시 로그 예:

```
[sync-server] WebSocket server listening on ws://127.0.0.1:8700
[sync-server] Environment: production (using .env.production)
[sync-server] Health Check server listening on http://127.0.0.1:8701/health
```

### 2.4 Health 확인

다른 터미널에서:

```bash
curl -s http://127.0.0.1:8701/health
```

- 기대: `{"status":"ok", "timestamp": "...", "server": {...}, "memory": {...}}`

### 2.5 스모크 테스트 (한 번에)

```bash
cd server
npm run build
NODE_ENV=production node dist/index.js &
sleep 3
curl -s http://127.0.0.1:8701/health
# 정상이면 kill %1 로 프로세스 종료
```

---

## 3. 시나리오 B: 안드로이드 등 다른 기기에서 접속 테스트

**같은 Wi‑Fi의 안드로이드 단말**에서 WebSocket으로 접속해 보는 경우.

### 3.1 서버가 외부 접속을 받도록 설정

- **현재**: `.env.production` 의 `IP=127.0.0.1` → **같은 PC에서만** 접속 가능
- **변경**: `IP=0.0.0.0` → PC의 **모든 네트워크 인터페이스**에서 접속 허용 (같은 LAN의 단말 접속 가능)

`.env.production` 수정:

```env
# 로컬·단말 테스트 시에만 0.0.0.0 사용 (배포 시 Nginx 뒤면 127.0.0.1 유지)
IP=0.0.0.0
PORT=8700
# ... 나머지 동일
```

### 3.2 서버 재기동

```bash
NODE_ENV=production node dist/index.js
```

로그에 다음처럼 나오면 정상:

```
[sync-server] WebSocket server listening on ws://0.0.0.0:8700
[sync-server] Health Check server listening on http://0.0.0.0:8701/health
```

### 3.3 서버 PC의 IP 확인

- **Windows**: `ipconfig` → IPv4 주소 (예: 192.168.0.124)
- **macOS/Linux**: `ifconfig` 또는 `ip addr` → 동일 LAN 대역 (예: 192.168.0.124)

### 3.4 안드로이드 클라이언트 접속 주소

| 용도 | 주소 |
|------|------|
| **WebSocket (동기화)** | `ws://<서버_PC_IP>:8700` (예: `ws://192.168.0.124:8700`) |
| **Health (필요 시)** | `http://<서버_PC_IP>:8701/health` |

안드로이드 앱에서 WebSocket URL을 위와 같이 설정 (포트는 **8700**).

- 예: `DOWebSocketConnection` 등에서 `wsUrl = "ws://192.168.0.124:8700"` 형태로 지정
- **서버 PC IP**만 실제 환경에 맞게 변경

### 3.5 네트워크·방화벽 확인

- 서버 PC와 안드로이드는 **같은 Wi‑Fi(같은 LAN)** 에 있어야 함
- PC 방화벽에서 **8700**(WebSocket), **8701**(Health) 포트 인바운드 허용 여부 확인 (로컬 테스트 시 대부분 허용해 두면 됨)

---

## 4. 로컬 테스트 체크리스트

| 단계 | 확인 항목 |
|------|-----------|
| 1 | `npm run build` 성공, `dist/index.js` 생성 |
| 2 | `server/` 루트에서 `NODE_ENV=production node dist/index.js` 실행 |
| 3 | 콘솔에 WebSocket 8700, Health 8701 리스닝 로그 출력 |
| 4 | `curl http://127.0.0.1:8701/health` → `status":"ok"` 응답 |
| 5 | (다른 기기 테스트 시) `.env.production` 에 `IP=0.0.0.0` 설정 후 재기동 |
| 6 | (안드로이드) 앱 WebSocket URL = `ws://<서버_PC_IP>:8700`, 동일 Wi‑Fi |

---

## 5. 자주 발생하는 문제

### 5.1 안드로이드에서 "onOpen" 없이 연결 실패

- **원인**: 서버가 `127.0.0.1` 에만 리스닝해 외부 기기에서 접속 불가
- **조치**: `.env.production` 에서 `IP=0.0.0.0` 으로 변경 후 서버 재시작

### 5.2 Health는 되는데 WebSocket만 안 됨

- 포트 확인: WebSocket **8700**, Health **8701** (서로 다름)
- 방화벽에서 8700 허용 여부 확인

### 5.3 "Dynamic require of ... is not supported"

- **원인**: 빌드 시 Node 내장 모듈 external·createRequire 주입이 빠진 이전 빌드
- **조치**: 최신 `build/build.cjs` 기준으로 `npm run build` 다시 수행 ([BUILD.md](../build/BUILD.md) 참고)

### 5.4 .env가 로드되지 않음

- 반드시 **server 루트**에서 `node dist/index.js` 실행 (현재 디렉터리가 server가 아니면 .env 경로가 틀어짐)

---

## 6. 참고 문서

- [BUILD.md](../build/BUILD.md) — 빌드 방법 및 스모크 테스트
- [DEPLOYMENT.md](../deploy/DEPLOYMENT.md) — 배포 절차
- [DEPLOYED_DIST_TEST.md](DEPLOYED_DIST_TEST.md) — 배포 후 dist 테스트 시나리오
