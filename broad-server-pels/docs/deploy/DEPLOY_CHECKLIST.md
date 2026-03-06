# 배포 체크리스트 — Nginx(Linux) / Windows

**이 프로젝트(sync-server)** 기준으로, 배포 시 **바로 따라 할 수 있는** 할 일만 정리한 문서입니다.

- **Linux**: Nginx를 앞단에 두고 Node.js(PM2 또는 직접) 실행
- **Windows**: Apache HTTP Server를 앞단에 두고 Node.js(PM2) 실행

> **배포 시 꼭 가져가야 할 파일만 보려면** → [DEPLOY_ESSENTIALS.md](DEPLOY_ESSENTIALS.md)

---

## 전제 (이 프로젝트 기준)

| 항목 | 값 |
|------|-----|
| Node WebSocket 포트 | **8700** |
| Health Check 포트 | **8701** (8700+1) |
| 프록시 경로 | **/ws**, **/health** |
| 설정 파일 | `server/.env.production` |
| 앱 진입점 | `server/dist/index.js` (빌드 후). 소스 직접 실행 시 `src/index.js` |

---

# 1. Linux + Nginx 배포

## 1.1 서버(Node) 준비

```bash
# 1) 프로젝트 디렉터리로 이동 (실제 경로로 변경)
cd /path/to/sync-server-mono/server

# 2) 의존성 설치
npm install

# 3) 빌드 (번들+난독화 → dist/index.js, 배포 필수)
npm run build

# 4) 로그 디렉터리 (PM2 사용 시)
mkdir -p logs
```

## 1.2 .env.production 확인/수정

파일: `server/.env.production`

```env
IP=127.0.0.1
PORT=8700
NODE_ENV=production

WAS_TYPE=nginx
REVERSE_PROXY=true
INTERNAL_PORT=8700
EXTERNAL_PORT=443
PROXY_PATH=/ws

SSL_ENABLED=false
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

WS_MAX_CONNECTIONS_PER_IP=100
WS_PING_INTERVAL=30000
WS_MAX_MESSAGE_SIZE=1048576

LOG_LEVEL=info
LOG_PAYLOAD=false
LOG_MAX_LEN=2000
```

- `INTERNAL_PORT=8700` 유지 (Nginx가 이 포트로 연결).
- 도메인·SSL 경로는 본인 환경에 맞게 다른 문서에서 설정.

## 1.3 Nginx 설정

- **WebSocket** → `127.0.0.1:8700`
- **Health** → `127.0.0.1:8701` (반드시 8701, 8700 아님)

Nginx 설정 파일(예: `/etc/nginx/sites-available/websocket` 또는 `conf.d` 하위)에 아래 블록 추가 후, `your-domain.com`, `ssl_certificate` 경로만 실제 값으로 바꿉니다.

```nginx
# WebSocket
upstream websocket_backend {
    server 127.0.0.1:8700;
    keepalive 32;
}

# Health (별도 포트)
upstream health_backend {
    server 127.0.0.1:8701;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;   # 실제 도메인으로 변경

    ssl_certificate     /path/to/cert.pem;   # 실제 경로로 변경
    ssl_certificate_key /path/to/key.pem;    # 실제 경로로 변경

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60;
        proxy_buffering off;
    }

    location /health {
        proxy_pass http://health_backend/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 5;
        proxy_read_timeout 5;
        proxy_send_timeout 5;
    }
}
```

- 설정 테스트 후 재시작:
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```

## 1.4 Node 서버 실행 (Linux)

**방법 A — PM2 (권장)**

```bash
cd /path/to/sync-server-mono/server
pm2 start ecosystem.config.js
pm2 save
# 부팅 시 자동 시작 원하면: pm2 startup
```

**방법 B — 직접 실행**

```bash
cd /path/to/sync-server-mono/server
npm run build   # 최초 1회 또는 소스 변경 후
NODE_ENV=production node dist/index.js
# 또는 npm start / npm run prod
```

## 1.5 Linux 배포 체크리스트

- [ ] `server` 디렉터리에서 `npm install` 및 `npm run build` 완료
- [ ] `server/.env.production` 에 `INTERNAL_PORT=8700`, `WAS_TYPE=nginx`, `REVERSE_PROXY=true` 반영
- [ ] Nginx에 **websocket_backend 8700**, **health_backend 8701** 업스트림 추가
- [ ] Nginx `location /ws` → `websocket_backend`, `location /health` → `health_backend`
- [ ] `server_name`, `ssl_certificate` 경로 실제 값으로 변경
- [ ] `sudo nginx -t` 후 Nginx 재시작/리로드
- [ ] PM2 또는 직접 실행으로 Node 기동
- [ ] `curl -s http://127.0.0.1:8701/health` 로 Health 확인
- [ ] `curl -s https://your-domain.com/health` 로 Nginx 경유 Health 확인

---

# 2. Windows 배포 (Apache 앞단 + PM2)

Windows에서는 **Apache HTTP Server**를 앞단에 두고, Node는 **PM2**로 실행합니다. (Tomcat/Windows 환경에서 Apache를 리버스 프록시로 쓰는 구성)

## 2.1 서버(Node) 준비

```cmd
REM 1) 프로젝트 디렉터리로 이동 (실제 경로로 변경)
cd C:\path\to\sync-server-mono\server

REM 2) 의존성 설치
npm install

REM 3) 빌드 (번들+난독화 → dist/index.js)
npm run build

REM 4) 로그 디렉터리
mkdir logs
```

## 2.2 .env.production 확인/수정

파일: `server\.env.production`

- Linux와 동일한 항목 사용. Windows 경로만 필요 시 수정:
  - `SSL_CERT_PATH=C:/path/to/cert.pem`
  - `SSL_KEY_PATH=C:/path/to/key.pem`
- `INTERNAL_PORT=8700`, `WAS_TYPE=tomcat` 또는 `nginx`(표시용), `REVERSE_PROXY=true` 유지.

## 2.3 Apache HTTP Server 설정

- **WebSocket** → `127.0.0.1:8700`
- **Health** → `127.0.0.1:8701`

필요 모듈: `mod_proxy`, `mod_proxy_http`, `mod_proxy_wstunnel`, `mod_rewrite`

VirtualHost 예시 (HTTPS 443, 실제 도메인·인증서 경로만 변경):

```apache
<VirtualHost *:443>
    ServerName your-domain.com

    SSLEngine on
    SSLCertificateFile      "C:/path/to/cert.pem"
    SSLCertificateKeyFile   "C:/path/to/key.pem"

    ProxyPass /ws ws://127.0.0.1:8700/ws
    ProxyPassReverse /ws ws://127.0.0.1:8700/ws

    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/ws(.*)$ ws://127.0.0.1:8700/ws$1 [P,L]

    ProxyPass /health http://127.0.0.1:8701/health
    ProxyPassReverse /health http://127.0.0.1:8701/health
</VirtualHost>
```

Apache 재시작:

```cmd
net stop Apache2.4
net start Apache2.4
```
(서비스 이름은 설치 버전에 따라 다를 수 있음)

## 2.4 PM2로 Node 실행 (Windows)

```cmd
cd C:\path\to\sync-server-mono\server
pm2 start ecosystem.config.js
pm2 save
```

## 2.5 방화벽 규칙 (Windows)

관리자 권한 CMD/PowerShell:

```cmd
netsh advfirewall firewall add rule name="Node.js WebSocket Server" dir=in action=allow protocol=TCP localport=8700
netsh advfirewall firewall add rule name="Node.js Health Check" dir=in action=allow protocol=TCP localport=8701
```

## 2.6 Windows 배포 체크리스트

- [ ] `server`에서 `npm install` 완료
- [ ] `server\.env.production` 에 `INTERNAL_PORT=8700`, `REVERSE_PROXY=true` 반영
- [ ] Apache에 `/ws` → 8700, **`/health` → 8701** 프록시 설정
- [ ] Apache 모듈 로드 후 VirtualHost 적용, Apache 재시작
- [ ] `pm2 start ecosystem.config.js` 로 Node 기동
- [ ] 방화벽에서 8700, 8701 허용
- [ ] `curl http://127.0.0.1:8701/health` 로 Health 확인
- [ ] `curl https://your-domain.com/health` 로 Apache 경유 Health 확인

---

# 3. 배포 후 확인 (공통)

| 확인 항목 | 명령/방법 |
|-----------|-----------|
| Node만 Health 확인 | `curl -s http://127.0.0.1:8701/health` |
| WAS 경유 Health 확인 | `curl -s https://your-domain.com/health` |
| WebSocket 연결 | 클라이언트에서 `wss://your-domain.com/ws` 접속 테스트 |
| PM2 상태 (PM2 사용 시) | `pm2 status` |
| PM2 로그 | `pm2 logs sync-server` |

---

# 4. 참고 문서

- [OVERVIEW.md](../OVERVIEW.md) — 포트·env·구조 요약
- [ENV_WAS_SETTINGS.md](ENV_WAS_SETTINGS.md) — WAS_TYPE, INTERNAL_PORT 등 적용 방식
- [WAS_DEPLOYMENT.md](WAS_DEPLOYMENT.md) — Nginx/Apache 상세
- [WINDOWS_DEPLOYMENT.md](../points/WINDOWS_DEPLOYMENT.md) — Windows 상세 절차
