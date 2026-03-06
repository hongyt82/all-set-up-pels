# 배포 환경별 로그 확인 방법

배포 후 **운영 중 실제 로그를 확인**할 때, **Nginx(Linux)** 와 **Windows** 환경에서 **어디를 어떻게 보면 되는지** 직관적으로 비교한 문서입니다.

---

## 한눈에 비교

| 확인 목적 | Linux + Nginx | Windows (Apache + PM2) |
|-----------|----------------|--------------------------|
| **Node 앱 로그** (연결/메시지/에러) | PM2 로그 또는 `logs/` 파일 | PM2 로그 또는 `logs\` 파일 |
| **실시간 앱 로그** | `pm2 logs sync-room-relay-server` | `pm2 logs sync-room-relay-server` |
| **앱 로그 파일 위치** | `server/logs/pm2-out.log`, `pm2-error.log` | `server\logs\pm2-out.log`, `pm2-error.log` |
| **앞단(WAS) 접속 로그** | Nginx access/error 로그 | Apache access/error 로그 |
| **앞단(WAS) 로그 위치** | `/var/log/nginx/` 등 (설치에 따름) | Apache 설치 경로 `logs\` (설치에 따름) |

---

# 1. Linux + Nginx 일 때

## 1.1 로그가 나오는 곳

| 구분 | 설명 | 위치(기본 예시) |
|------|------|------------------|
| **Node 앱** | WebSocket 연결·메시지·Room·에러 등 (구조화 JSON) | PM2가 쌓는 파일: **`server/logs/pm2-out.log`**, **`server/logs/pm2-error.log`** |
| **Nginx** | 클라이언트 요청(접속)·프록시·Nginx 자체 에러 | **`/var/log/nginx/access.log`**, **`/var/log/nginx/error.log`** (설정에서 바꿀 수 있음) |

- Node 로그는 **이 프로젝트**의 `ecosystem.config.js`에 따라 `server` 디렉터리 기준 **`./logs/`** 에 저장됩니다.
- Nginx 경로는 배포 시 사용한 `nginx.conf`의 `access_log` / `error_log` 지시어를 확인하세요.

## 1.2 확인 방법 (복사해서 사용)

**Node 앱 로그 (실시간)**

```bash
cd /path/to/sync-server-mono/server
pm2 logs sync-room-relay-server
```

**Node 앱 로그 (파일로 보기)**

```bash
cd /path/to/sync-server-mono/server

# 표준 출력(일반 로그) 실시간
tail -f logs/pm2-out.log

# 에러만 실시간
tail -f logs/pm2-error.log

# 최근 100줄만
tail -n 100 logs/pm2-out.log
tail -n 100 logs/pm2-error.log
```

**Nginx 로그 (실시간)**

```bash
# 접속 로그 (요청 URL, IP, 상태코드 등)
sudo tail -f /var/log/nginx/access.log

# Nginx 에러 로그 (프록시/SSL 등 에러)
sudo tail -f /var/log/nginx/error.log
```

**Nginx가 systemd로 동작할 때**

```bash
sudo journalctl -u nginx -f
```

## 1.3 어떤 문제일 때 어디를 볼지 (Linux)

| 상황 | 우선 확인 |
|------|------------|
| 연결이 안 됨 / 끊김 | Node: `pm2 logs` 또는 `logs/pm2-error.log` → Nginx: `error.log` |
| 특정 요청만 실패 | Nginx: `access.log` (URL, 상태코드) → Node: `pm2-out.log` (event, roomId, clientId) |
| 메시지 릴레이 이상 | Node: `pm2-out.log` (event: `room.broadcast`, `ws.message.relayed` 등) |
| 메모리/재시작 | `pm2 monit`, `pm2 status` + `logs/pm2-error.log` |

---

# 2. Windows (Apache + PM2) 일 때

## 2.1 로그가 나오는 곳

| 구분 | 설명 | 위치(기본 예시) |
|------|------|------------------|
| **Node 앱** | WebSocket 연결·메시지·Room·에러 등 (구조화 JSON) | PM2가 쌓는 파일: **`server\logs\pm2-out.log`**, **`server\logs\pm2-error.log`** |
| **Apache** | 클라이언트 요청(접속)·프록시·Apache 자체 에러 | Apache 설치 경로의 **`logs\access.log`**, **`logs\error.log`** (설치/버전에 따라 다름) |

- Node 로그는 **이 프로젝트**의 `ecosystem.config.js`에 따라 `server` 디렉터리 기준 **`.\logs\`** 에 저장됩니다.
- Apache 로그 경로는 `httpd.conf` 또는 VirtualHost 설정의 `CustomLog`, `ErrorLog`를 확인하세요.

## 2.2 확인 방법 (복사해서 사용)

**Node 앱 로그 (실시간)**

```cmd
cd C:\path\to\sync-server-mono\server
pm2 logs sync-room-relay-server
```

**Node 앱 로그 (파일로 보기)**

```cmd
cd C:\path\to\sync-server-mono\server

REM 표준 출력(일반 로그) 실시간 — PowerShell
Get-Content logs\pm2-out.log -Wait -Tail 50

REM 에러만 최근 50줄 — PowerShell
Get-Content logs\pm2-error.log -Tail 50

REM CMD에서 최근 20줄만 보기
powershell -Command "Get-Content logs\pm2-out.log -Tail 20"
```

**PowerShell에서 실시간 + 최근 N줄**

```powershell
cd C:\path\to\sync-server-mono\server
Get-Content logs\pm2-out.log -Wait -Tail 100
```

**Apache 로그 (경로는 설치 위치에 맞게 변경)**

```cmd
REM 예: C:\Apache24\logs
tail -f C:\Apache24\logs\access.log
tail -f C:\Apache24\logs\error.log
```

Windows에 `tail`이 없으면:

```powershell
Get-Content C:\Apache24\logs\access.log -Wait -Tail 50
```

## 2.3 어떤 문제일 때 어디를 볼지 (Windows)

| 상황 | 우선 확인 |
|------|------------|
| 연결이 안 됨 / 끊김 | Node: `pm2 logs` 또는 `logs\pm2-error.log` → Apache: `error.log` |
| 특정 요청만 실패 | Apache: `access.log` → Node: `pm2-out.log` |
| 메시지 릴레이 이상 | Node: `pm2-out.log` (event: `room.broadcast`, `ws.message.relayed` 등) |
| 메모리/재시작 | `pm2 monit`, `pm2 status` + `logs\pm2-error.log` |

---

# 3. Node 앱 로그 포맷 (공통)

Node 쪽 로그는 **JSON 한 줄** 구조화 로그입니다. (LOG_LEVEL, LOG_PAYLOAD 등은 `.env.production` 참고)

| 필드 | 설명 |
|------|------|
| `ts` | ISO 타임스탬프 |
| `level` | `debug` \| `info` \| `warn` \| `error` |
| `event` | 이벤트 이름 (예: `ws.connection`, `room.join`, `room.broadcast`, `ws.error`) |
| 기타 | `clientId`, `roomId`, `type` 등 이벤트별 필드 |

**에러만 골라보기 (Linux)**

```bash
grep '"level":"error"' logs/pm2-out.log
# 또는
grep '"level":"error"' logs/pm2-error.log
```

**에러만 골라보기 (Windows PowerShell)**

```powershell
Select-String -Path "logs\pm2-out.log" -Pattern '"level":"error"'
```

---

# 4. 요약: “지금 당장 로그 보려면”

| 환경 | 앱 로그 실시간 | 앱 로그 파일 | 앞단(WAS) 로그 |
|------|----------------|--------------|----------------|
| **Linux + Nginx** | `pm2 logs sync-room-relay-server` | `server/logs/pm2-out.log`, `pm2-error.log` | `sudo tail -f /var/log/nginx/access.log` / `error.log` |
| **Windows** | `pm2 logs sync-room-relay-server` | `server\logs\pm2-out.log`, `pm2-error.log` | Apache `logs\access.log`, `error.log` (설치 경로 확인) |

- **앱 동작(연결/메시지/에러)** → 항상 **PM2 로그** 또는 **`logs/`(또는 `logs\`) 아래 파일**을 보면 됩니다.
- **외부에서 누가 어떤 URL로 접속했는지** → **Nginx** 또는 **Apache** access/error 로그를 보면 됩니다.

---

## 관련 문서

- [LOGGING.md](LOGGING.md) — 로그 포맷, LOG_LEVEL, LOG_PAYLOAD
- [LOG_FORMAT.md](LOG_FORMAT.md) — 이벤트별 로그 필드
- [DEPLOY_CHECKLIST.md](../deploy/DEPLOY_CHECKLIST.md) — 배포 시 할 일
- [OVERVIEW.md](../OVERVIEW.md) — 포트·env·구조
