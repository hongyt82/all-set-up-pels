# Nginx SPA 라우팅 404 에러 해결

## 📋 문제 상황 1

**증상**:
- `/e-link-v2/editor` 또는 `/e-link-v2/viewer` 경로에서 새로고침 시 404 Not Found 에러 발생
- URL로 직접 접근해도 404 Not Found 에러 발생
- 로컬 개발 환경에서는 문제 없음

**원인**:
- React Router는 클라이언트 사이드 라우팅을 사용
- `/e-link-v2/editor` 같은 경로는 실제 서버에 존재하지 않는 가상 경로
- 브라우저에서 직접 접근하거나 새로고침하면 서버에 실제 파일을 요청
- 서버에 해당 파일이 없어서 404 에러 발생

#### 수정된 설정

```nginx
# ============================================
# /e-link-v2/ 경로 처리 (SPA 라우팅 지원)
# ============================================
location /e-link-v2/ {
    alias /var/www/pdf-dev-storage/dist/;
    # 파일이 존재하면 서빙, 없으면 index.html로 리다이렉트
    try_files $uri $uri/ @e-link-v2-fallback;
    index index.html;
}

# /e-link-v2/ 경로의 fallback 처리
# 정적 파일이 아닌 경우 index.html로 리다이렉트
location @e-link-v2-fallback {
    rewrite ^/e-link-v2/(.*)$ /e-link-v2/index.html last;
}
```

## ✅ 해결 방법

### Nginx 설정 수정

`/e-link-v2/` 경로의 모든 요청을 `index.html`로 리다이렉트하도록 설정합니다.

---

## 📋 문제 상황 2

**에러 메시지**:
```
Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream"
Failed to fetch dynamically imported module: http://dev-pdf.daonhns.com:30080/assets/pdf.worker-n-vTvQZi.mjs
```

**문제 원인**:
- 애플리케이션이 `/e-link-v2/editor` 경로에서 실행됨
- 정적 파일(`/assets/pdf.worker-n-vTvQZi.mjs`)이 상대 경로로 로드됨
- 실제 요청 경로: `/e-link-v2/assets/pdf.worker-n-vTvQZi.mjs` (404 에러)
- 또는 MIME 타입이 `application/octet-stream`으로 잘못 설정됨

Nginx는 location 블록을 다음 순서로 매칭합니다:

1. **정적 파일 경로** (`^/(assets|fonts|pdfjs|icons)/`) - 최우선
2. **.mjs 파일** (`\.mjs$`)
3. **/e-link-v2/ 경로** (`/e-link-v2/`)
4. **일반 정적 파일** (`\.(js|css|...)`)
5. **루트 경로** (`/`)

### Linux/Unix 경로

```nginx
server {
    listen 30080;
    server_name dev-pdf.daonhns.com;
    
    root /var/www/pdf-dev-storage/dist;
    index index.html;
    
    # .mjs 파일 MIME 타입 설정
    # .mjs 파일 MIME 타입 설정
    # 정적 파일 (assets, fonts, pdfjs 등)은 루트에서 서빙
    location ~* ^/(assets|fonts|pdfjs|icons)/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # .mjs 파일에 대한 추가 MIME 타입 설정
        location ~* \.mjs$ {
            default_type application/javascript;
            add_header Content-Type "application/javascript; charset=utf-8" always;
        }
    }
    
    # 정적 파일 경로 처리
    location ~* ^/(assets|fonts|pdfjs|icons)/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # /e-link-v2/ 경로 처리 (SPA 라우팅)
    location /e-link-v2/ {
        alias /var/www/pdf-dev-storage/dist/;
        try_files $uri $uri/ @e-link-v2-fallback;
        index index.html;
    }
    
    # /e-link-v2/ 경로의 fallback 처리
    location @e-link-v2-fallback {
        rewrite ^/e-link-v2/(.*)$ /e-link-v2/index.html last;
    }
    
    # 루트 경로 처리
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Windows 경로

```nginx
server {
    listen 30080;
    server_name dev-pdf.daonhns.com;
    
    root D:/pdfs/dist;
    index index.html;
    
    # .mjs 파일 MIME 타입 설정
    # 정적 파일 (assets, fonts, pdfjs 등)은 루트에서 서빙
    location ~* ^/(assets|fonts|pdfjs|icons)/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # .mjs 파일에 대한 추가 MIME 타입 설정
        location ~* \.mjs$ {
            default_type application/javascript;
            add_header Content-Type "application/javascript; charset=utf-8" always;
        }
    }
    
    
    # /e-link-v2/ 경로 처리 (SPA 라우팅)
    location /e-link-v2/ {
        alias D:/pdfs/dist/;
        try_files $uri $uri/ @e-link-v2-fallback;
        index index.html;
    }
    
    # /e-link-v2/ 경로의 fallback 처리
    location @e-link-v2-fallback {
        rewrite ^/e-link-v2/(.*)$ /e-link-v2/index.html last;
    }
    
    # 루트 경로 처리
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📋 문제 상황 3

ViewerPage Default 값 Setting 설정 

```
const [fileUrl, setFileUrl] = useState<string | null>(null);
```