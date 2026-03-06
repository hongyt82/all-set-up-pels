 

````
env 파일 실행순서는 하기와 같다. 

.env
.env.local
.env.dev
.env.production 

env 파일내부에 변수 사용용도 

VITE_PORT
1. 특정 포트만 사용가능하도록 지정하여 해당 포트만 사용하도록 명시 
2. 해당 포트를 사용하도록 지정하는 옵션은 vite.config.ts 파일안에 
   strictPort: true 옵션이며 이미 이전에 동작중인 포트에 영향이 없게끔 이후에도 혼선이
   올수 있기 때문에 설정함.

VITE_OUT_MAIN_URL / VITE_REDIRECT_URL 이 유용한 경우
실제로 더 필요하다면 용더에 맞게 추가 선언하여 사용할수 있음
참고 : 소스내에서 참조하여 사용하여 요청시 (웹 실배포 도메인 URL 과는 무결한 사항 / 하기 내용 참조) 

1. API/백엔드 베이스 URL
2. 절대 URL 생성(공유 링크, canonical, OG, 이메일 링크)
3. 외부 리다이렉트 대상
4. OAuth 콜백/리다이렉트 URI 구성
5. 분석/로그 전송 시 출처 표기

---------------------------------

실제 서비스에서 부여받은 도메인으로 접속되게 하려면 빌드 산출물(dist)을 정상 도메인에 “배포”해야 함.
// 예시 Nginx 

       server {
         listen 80;
         server_name www.test.com;
         return 301 https://$host$request_uri;
       }
       server {
         listen 443 ssl http2;
         server_name www.test.com;

         # SSL 인증서 설정
         ssl_certificate     /etc/letsencrypt/live/www.test.com/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/www.test.com/privkey.pem;

         root /var/www/pdf-app/dist;   # vite build 산출물 경로
         index index.html;

         location / {
           try_files $uri $uri/ /index.html; # SPA 라우팅
         }

         # 캐싱(선택)
         location ~* \\.(js|css|svg|png|jpg|woff2?)$ {
           add_header Cache-Control "public, max-age=31536000, immutable";
         }
       }
       // API가 다른 도메인/포트면 CORS 허용 또는 Nginx 리버스 프록시로 /api 프록시 (백엔드 연동시)
       location /api/ {
         proxy_pass http://127.0.0.1:3400/api/;
       }
       
````