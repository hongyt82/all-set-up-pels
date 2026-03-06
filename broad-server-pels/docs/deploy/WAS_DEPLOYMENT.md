# WAS 배포 가이드

이 문서는 Node.js WebSocket 서버를 WAS(Web Application Server) 환경에 배포하는 방법을 설명합니다.

> **한눈에 보기**: 포트(8700/8701)·env 파일·구조는 [OVERVIEW.md](../OVERVIEW.md) 참고.

## 목차

1. [개요](#개요)
2. [환경 변수 설정](#환경-변수-설정)
3. [Nginx 배포](#nginx-배포)
4. [Tomcat 배포](#tomcat-배포)
5. [SSL/TLS 설정](#ssltls-설정)
6. [Health Check](#health-check)
7. [문제 해결](#문제-해결)

---

## 개요

### 지원 WAS 타입

- **Nginx**: Reverse proxy로 사용 (권장)
- **Tomcat**: Apache HTTP Server와 함께 사용 권장
- **None**: 직접 실행 (개발/테스트용)

### 아키텍처

```
[클라이언트] 
    ↓ (ws://domain.com:443/ws)
[WAS (Nginx/Tomcat)]
    ↓ (ws://127.0.0.1:8700)
[Node.js WebSocket Server]
```

### 주요 개념

- **내부 포트 (INTERNAL_PORT)**: Node.js WebSocket이 리스닝하는 포트 (예: 8700)
- **Health Check 포트**: WebSocket 포트 **+ 1** (예: 8701). `/health`는 이 포트로 프록시해야 함.
- **외부 포트 (EXTERNAL_PORT)**: WAS가 외부에 노출하는 포트 (예: 443)
- **프록시 경로 (PROXY_PATH)**: WAS에서 Node.js로 프록시할 경로 (예: `/ws`)

---

## 환경 변수 설정

### 기본 설정 파일

환경별 `.env` 파일에서 WAS 배포 관련 변수를 설정합니다:

- `.env`: 기본 설정
- `.env.dev`: 개발 환경
- `.env.production`: 프로덕션 환경

### 주요 환경 변수

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `WAS_TYPE` | WAS 타입 (`nginx`, `tomcat`, `none`) | `none` | `nginx` |
| `REVERSE_PROXY` | Reverse Proxy 사용 여부 | `false` | `true` |
| `INTERNAL_PORT` | Node.js 내부 포트 | `8300` | `8700` |
| `EXTERNAL_PORT` | WAS 외부 포트 (정보용) | 내부 포트와 동일 | `443` |
| `PROXY_PATH` | 프록시 경로 | `/ws` | `/ws` |
| `SSL_ENABLED` | SSL/TLS 사용 여부 | `false` | `false` (WAS에서 처리 권장) |
| `HEALTH_CHECK_ENABLED` | Health check 활성화 | `true` | `true` |
| `HEALTH_CHECK_PATH` | Health check 경로 | `/health` | `/health` |
| `WS_MAX_CONNECTIONS_PER_IP` | IP당 최대 연결 수 (0=무제한) | `0` | `100` |
| `WS_PING_INTERVAL` | Ping 간격 (밀리초) | `30000` | `30000` |

### 프로덕션 설정 예시 (`.env.production`)

```env
# WAS 배포 설정
WAS_TYPE=nginx
REVERSE_PROXY=true
INTERNAL_PORT=8700
EXTERNAL_PORT=443
PROXY_PATH=/ws

# SSL은 WAS에서 처리
SSL_ENABLED=false

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

# WebSocket 설정
WS_MAX_CONNECTIONS_PER_IP=100
WS_PING_INTERVAL=30000
```

---

## Nginx 배포

### 1. 환경 변수 설정

`.env.production` 파일에서 다음을 설정:

```env
WAS_TYPE=nginx
REVERSE_PROXY=true
INTERNAL_PORT=8700
EXTERNAL_PORT=443
PROXY_PATH=/ws
```

### 2. Nginx 설정 파일 작성

`nginx.conf.example` 파일을 참고하여 Nginx 설정 파일에 다음을 추가:

```nginx
# WebSocket: 8700
upstream websocket_backend {
    server 127.0.0.1:8700;  # INTERNAL_PORT와 동일
    keepalive 32;
}

# Health Check: 8701 (별도 HTTP 서버)
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

### 3. Nginx 설정 적용

```bash
# 설정 파일 검증
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
# 또는
sudo service nginx restart
```

### 4. Node.js 서버 실행

```bash
cd server
npm run prod
```

### 5. 연결 테스트

```bash
# Health check
curl https://your-domain.com/health

# WebSocket 연결 테스트 (wscat 사용)
wscat -c wss://your-domain.com/ws
```

---

## Tomcat 배포

### 주의사항

Tomcat은 주로 Java 애플리케이션용 WAS이므로, Node.js WebSocket 서버의 경우:

1. **권장**: Nginx나 Apache HTTP Server를 앞단에 두고 사용
2. **대안**: Apache HTTP Server의 `mod_proxy`와 `mod_proxy_wstunnel` 사용

### Apache HTTP Server 설정

`tomcat-server.xml.example` 파일을 참고하여 Apache HTTP Server 설정:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so

<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    # WebSocket 프록시
    ProxyPass /ws ws://127.0.0.1:8700/ws
    ProxyPassReverse /ws ws://127.0.0.1:8700/ws
    
    # WebSocket 업그레이드 헤더
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/ws(.*)$ ws://127.0.0.1:8700/ws$1 [P,L]
</VirtualHost>
```

### 환경 변수 설정

`.env.production`에서:

```env
WAS_TYPE=tomcat
REVERSE_PROXY=true
INTERNAL_PORT=8700
EXTERNAL_PORT=443
PROXY_PATH=/ws
```

---

## SSL/TLS 설정

### 권장 방법: WAS에서 SSL 처리

**권장**: SSL/TLS는 WAS(Nginx/Apache)에서 처리하고, Node.js는 내부 포트로 통신:

```env
SSL_ENABLED=false  # WAS에서 SSL 처리
```

### Node.js에서 직접 SSL 처리 (비권장)

필요한 경우에만 사용:

```env
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

그리고 `src/index.js`에서 HTTPS 서버로 변경 필요 (현재 구현에는 없음).

---

## Health Check

### 설정

```env
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
```

### 사용 방법

Health check 엔드포인트를 통해 서버 상태 확인:

```bash
# 직접 접근
curl http://127.0.0.1:8700/health

# WAS를 통한 접근
curl https://your-domain.com/health
```

### 모니터링 도구 연동

- **Prometheus**: `/health` 엔드포인트를 스크래핑
- **Kubernetes**: Liveness/Readiness probe로 사용
- **로드밸런서**: Health check로 사용

---

## 문제 해결

### WebSocket 연결 실패

**증상**: WebSocket 연결이 실패하거나 즉시 끊김

**해결 방법**:

1. **Nginx 타임아웃 확인**:
   ```nginx
   proxy_read_timeout 86400;
   proxy_send_timeout 86400;
   ```

2. **업그레이드 헤더 확인**:
   ```nginx
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```

3. **버퍼링 비활성화**:
   ```nginx
   proxy_buffering off;
   ```

### 포트 충돌

**증상**: 포트가 이미 사용 중

**해결 방법**:

```bash
# 포트 사용 확인
sudo lsof -i :8700
# 또는
sudo netstat -tulpn | grep 8700

# 프로세스 종료 후 재시작
```

### SSL 인증서 오류

**증상**: SSL 연결 실패

**해결 방법**:

1. 인증서 경로 확인
2. 인증서 권한 확인 (`chmod 600`)
3. 인증서 유효기간 확인

### 로그 확인

```bash
# Node.js 로그
npm run prod

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 시스템 로그
sudo journalctl -u nginx -f
```

---

## 배포 체크리스트

### 배포 전 확인사항

- [ ] `.env.production` 파일에서 WAS 설정 확인
- [ ] `INTERNAL_PORT`가 실제 Node.js 포트와 일치하는지 확인
- [ ] `PROXY_PATH`가 WAS 설정과 일치하는지 확인
- [ ] SSL 인증서 경로 확인 (WAS에서 SSL 처리 시)
- [ ] 방화벽 규칙 확인 (내부 포트는 외부 접근 차단)

### 배포 후 확인사항

- [ ] Health check 엔드포인트 동작 확인
- [ ] WebSocket 연결 테스트
- [ ] 로그 확인 (에러 없음)
- [ ] 성능 모니터링 (연결 수, 응답 시간)

---

## 참고 자료

- [Nginx WebSocket 프록시 공식 문서](https://nginx.org/en/docs/http/websocket.html)
- [Apache mod_proxy_wstunnel 문서](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html)
- [WebSocket 프로토콜 RFC 6455](https://tools.ietf.org/html/rfc6455)

---

## 문의 및 지원

문제가 발생하거나 추가 설정이 필요한 경우, 프로젝트 이슈 트래커를 통해 문의해주세요.
