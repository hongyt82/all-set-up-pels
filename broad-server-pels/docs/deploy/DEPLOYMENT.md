# 서버 배포 프로세스 가이드

이 문서는 Node.js WebSocket 서버의 전체 배포 프로세스를 설명합니다.

> **한눈에 보기**: 포트·env 파일·구조는 [OVERVIEW.md](../OVERVIEW.md) 참고.

---

## 목차

1. [배포 개요](#배포-개요)
2. [배포 아키텍처](#배포-아키텍처)
3. [배포 전 준비](#배포-전-준비)
4. [배포 프로세스](#배포-프로세스)
5. [배포 후 확인](#배포-후-확인)
6. [모니터링 및 로그](#모니터링-및-로그)
7. [문제 해결](#문제-해결)

---

## 배포 개요

### 지원 배포 환경

- **Linux + Nginx**: 권장 (프로덕션)
- **Windows + Apache HTTP Server/IIS**: Windows 환경
- **Windows + Tomcat + PM2**: Windows 환경 (PM2 프로세스 관리)
- **직접 실행**: 개발/테스트용

### 배포 방식

- **WAS를 통한 Reverse Proxy 방식** (권장)
- **직접 실행 방식** (개발/테스트용)

---

## 배포 아키텍처

### 일반적인 배포 구조

```
[클라이언트]
    ↓ (wss://domain.com:443/ws)
[WAS (Nginx/Apache/IIS) - Reverse Proxy]
    ↓ (ws://127.0.0.1:8700)
[Node.js WebSocket Server]
    ↓ (PM2로 프로세스 관리)
[운영체제]
```

### 포트 구성

- **외부 포트**: 443 (HTTPS/WSS) - WAS가 외부에 노출
- **내부 포트**: 8700 (WS) - Node.js WebSocket 서버 리스닝
- **Health Check 포트**: **8701** (HTTP) - Health Check는 **별도 HTTP 서버**가 `config.port + 1`에서 동작

> **중요**: Nginx 등에서 `/health`를 프록시할 때는 **8700이 아니라 8701**로 연결해야 합니다. `proxy_pass http://websocket_backend/health`처럼 8700 업스트림을 쓰면 Health 응답을 받을 수 없습니다. [OVERVIEW.md](../OVERVIEW.md) 참고.

---

## 배포 전 준비

### 1. 환경 변수 설정

`.env.production` 파일 설정:

```env
# 기본 서버 설정
IP=127.0.0.1
PORT=8700
NODE_ENV=production

# WAS 배포 설정
WAS_TYPE=nginx                    # nginx, tomcat, apache, iis, none
REVERSE_PROXY=true
INTERNAL_PORT=8700                # Node.js 내부 포트
EXTERNAL_PORT=443                  # WAS 외부 포트
PROXY_PATH=/ws                     # 프록시 경로

# SSL/TLS 설정
SSL_ENABLED=false                  # WAS에서 SSL 처리 (권장)

# Health Check 설정
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

# WebSocket 설정
WS_MAX_CONNECTIONS_PER_IP=100
WS_PING_INTERVAL=30000
WS_MAX_MESSAGE_SIZE=1048576        # 1MB

# 로깅 설정
LOG_LEVEL=info
LOG_PAYLOAD=false
LOG_MAX_LEN=2000
```

### 2. 의존성 설치 및 빌드

배포 시 **번들+난독화**된 `dist/index.js`로 실행합니다. 배포 전 반드시 빌드를 실행하세요.

```bash
cd server
npm install
npm run build   # dist/index.js 생성 (필수)
```

- **실행 위치**: `npm start` 또는 PM2 실행 시 **작업 디렉터리는 server 루트**로 유지. `.env` / `.env.production`은 server 루트에서 로드됩니다.
- **소스만 실행** (디버깅 등): `npm run start:src` — 빌드 없이 `src/index.js` 직접 실행.

### 3. PM2 설치 (Windows/프로세스 관리 필요 시)

```bash
npm install -g pm2
```

---

## 배포 프로세스

### Linux + Nginx 배포

자세한 내용은 [WAS_DEPLOYMENT.md](WAS_DEPLOYMENT.md) 참조

#### 1. Nginx 설정

```nginx
# WebSocket: 8700
upstream websocket_backend {
    server 127.0.0.1:8700;
    keepalive 32;
}

# Health Check: 8701 (별도 포트)
upstream health_backend {
    server 127.0.0.1:8701;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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
    }
}
```

#### 2. 서버 실행

```bash
# 직접 실행
npm start

# 또는 PM2 사용
pm2 start ecosystem.config.js
```

### Windows + Tomcat + PM2 배포

자세한 내용은 [WINDOWS_DEPLOYMENT.md](../points/WINDOWS_DEPLOYMENT.md) 참조

#### 1. Apache HTTP Server 설정

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so

<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile "C:/path/to/cert.pem"
    SSLCertificateKeyFile "C:/path/to/key.pem"
    
    ProxyPass /ws ws://127.0.0.1:8700/ws
    ProxyPassReverse /ws ws://127.0.0.1:8700/ws
    
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/ws(.*)$ ws://127.0.0.1:8700/ws$1 [P,L]
</VirtualHost>
```

#### 2. PM2로 서버 실행

```bash
# PM2 시작
npm run pm2:start

# 또는 직접
pm2 start ecosystem.config.js
```

---

## 배포 후 확인

### 1. Health Check 확인

```bash
# 직접 접근
curl http://127.0.0.1:8701/health

# WAS를 통한 접근
curl https://your-domain.com/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T19:00:00.000Z",
  "server": {
    "connections": 42,
    "rooms": 15
  }
}
```

### 2. WebSocket 연결 테스트

```bash
# wscat 사용
wscat -c wss://your-domain.com/ws
```

### 3. 프로세스 상태 확인 (PM2 사용 시)

```bash
pm2 status
pm2 logs sync-server
pm2 monit
```

---

## 모니터링 및 로그

### 로그 확인

#### 직접 실행 시

```bash
# 서버 실행 시 콘솔 출력
npm start
```

#### PM2 사용 시

```bash
# 실시간 로그
pm2 logs sync-server

# 로그 파일 위치
# - logs/pm2-out.log (표준 출력)
# - logs/pm2-error.log (에러 출력)
```

### 모니터링

#### PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 상태 확인
pm2 status

# 메모리/CPU 사용량 확인
pm2 list
```

#### Health Check 모니터링

정기적으로 Health Check 엔드포인트를 호출하여 서버 상태 확인:

```bash
# 스크립트 예시 (Linux)
while true; do
  curl -s http://127.0.0.1:8701/health | jq .
  sleep 30
done
```

---

## 문제 해결

### WebSocket 연결 실패

**증상**: WebSocket 연결이 실패하거나 즉시 끊김

**해결 방법**:
1. WAS 타임아웃 설정 확인
2. 업그레이드 헤더 확인 (`Upgrade: websocket`, `Connection: upgrade`)
3. 버퍼링 비활성화 확인

### 포트 충돌

**증상**: 포트가 이미 사용 중

**해결 방법**:

```bash
# Linux
sudo lsof -i :8700
sudo netstat -tulpn | grep 8700

# Windows
netstat -ano | findstr :8700
```

### 프로세스가 종료됨

**증상**: 서버가 예기치 않게 종료

**해결 방법**:
1. PM2 로그 확인: `pm2 logs sync-server`
2. 에러 로그 확인: `logs/pm2-error.log`
3. 메모리 사용량 확인: `pm2 monit`
4. 자동 재시작 설정 확인: `ecosystem.config.js`의 `autorestart: true`

### Windows 방화벽 문제

**증상**: 외부에서 연결 불가

**해결 방법**:

```bash
# Windows 방화벽 규칙 추가
netsh advfirewall firewall add rule name="Node.js WebSocket Server" dir=in action=allow protocol=TCP localport=8700
netsh advfirewall firewall add rule name="Node.js Health Check" dir=in action=allow protocol=TCP localport=8701
```

---

## 배포 체크리스트

### 배포 전 확인사항

- [ ] `.env.production` 파일에서 WAS 설정 확인
- [ ] `INTERNAL_PORT`가 실제 Node.js 포트와 일치하는지 확인
- [ ] `PROXY_PATH`가 WAS 설정과 일치하는지 확인
- [ ] SSL 인증서 경로 확인 (WAS에서 SSL 처리 시)
- [ ] 방화벽 규칙 확인 (내부 포트는 외부 접근 차단)
- [ ] Node.js 버전 확인 (`node >= 18`)
- [ ] PM2 설치 확인 (PM2 사용 시)
- [ ] `ecosystem.config.js` 파일 확인 (PM2 사용 시)

### 배포 후 확인사항

- [ ] Health check 엔드포인트 동작 확인 (`/health`)
- [ ] WebSocket 연결 테스트
- [ ] 로그 확인 (에러 없음)
- [ ] 성능 모니터링 (연결 수, 응답 시간)
- [ ] Ping/Pong 동작 확인
- [ ] PM2 프로세스 상태 확인 (PM2 사용 시)
- [ ] 자동 재시작 동작 확인 (PM2 사용 시)

---

## 참고 문서

- [WAS 배포 가이드](WAS_DEPLOYMENT.md) - Nginx/Tomcat 배포 상세
- [Windows 배포 가이드](../points/WINDOWS_DEPLOYMENT.md) - Windows + Tomcat + PM2 배포
- [서버 README](../README.md) - 서버 전체 가이드
- [안정성 체크](../points/STABILITY_CHECK.md) - 서버 안정성 검증

---

**마지막 업데이트**: 2026-02-06
