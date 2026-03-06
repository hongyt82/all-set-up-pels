# 서버 한눈에 보기

이 문서는 **sync-server**의 구조와 설정을 직관적으로 파악하기 위한 요약입니다.

---

## 1. 이 서버가 하는 일

- **WebSocket Room 중계**: 클라이언트(Android/React)가 `roomId`(예: `DOC{doc_id}`)별로 묶여, 같은 Room 안에서만 메시지를 주고받습니다.
- **지원 메시지**: `newClient`, `chat`, `broadcast`(movePage, setForm 등), `clientList` 등.
- **배포**: 개발 시에는 Node만 실행, 프로덕션에서는 Nginx/Tomcat 뒤에 두고 Reverse Proxy로 사용할 수 있습니다.

---

## 2. 포트 한눈에

| 환경       | WebSocket (WS) | Health Check (HTTP) |
|------------|----------------|----------------------|
| **개발**   | **8600**       | **8601**             |
| **프로덕션** | **8700**       | **8701**             |

- **WebSocket**: 클라이언트가 접속하는 포트. `.env.dev` / `.env.production`의 `INTERNAL_PORT`(또는 `PORT`)로 결정됩니다.
- **Health Check**: WS 포트 **+ 1**에서 별도 HTTP 서버가 `/health`를 제공합니다.  
  → Nginx 등에서 Health를 프록시할 때 **반드시 8701(프로덕션)로 연결**해야 합니다. (8700이 아님)

---

## 3. 환경 설정 파일 (.env)

| 파일명              | 언제 사용되는가        | 용도                 |
|---------------------|------------------------|----------------------|
| **`.env`**          | 공통 기본값            | 환경별 파일에 없는 키만 보충 |
| **`.env.dev`**       | `npm run dev` / NODE_ENV=development | 개발용 포트·로그 등  |
| **`.env.production`** | `npm start` / `npm run prod` / NODE_ENV=production | 프로덕션용 포트·WAS 등 |

- **로드 순서**: NODE_ENV에 따라 **환경별 파일**(.env.dev 또는 .env.production)을 먼저 로드한 뒤, **.env**를 `override: false`로 추가 로드합니다.  
  → 같은 키는 환경별 파일 값이 우선합니다.
- **주의**: 프로덕션 파일 이름은 **`.env.production`** 입니다. `.env.prod`는 사용하지 않습니다.

---

## 4. 빌드 및 실행 방법

### 4.1 프로덕션 배포(권장): 번들 + 난독화

배포 시 **소스 번들(esbuild) + 난독화(javascript-obfuscator)** 가 적용된 단일 파일 `dist/index.js`로 실행합니다.

```bash
cd server
npm install
npm run build    # dist/index.js 생성 (필수)
npm start        # dist/index.js 실행 (NODE_ENV=production, .env.production 로드)
```

- **실행 위치**: 반드시 **server 디렉터리**에서 실행. `.env` / `.env.production`은 **server 루트**에서 로드됩니다.
- **PM2**: `ecosystem.config.js`는 `./dist/index.js`를 실행합니다. `npm run build` 후 `pm2 start ecosystem.config.js` 사용.

### 4.2 개발: 소스 직접 실행

```bash
npm run dev      # src/index.js 직접 실행, --watch
npm run start:src # 소스만 프로덕션 모드로 실행 (빌드 없이, 디버깅용)
```

| 명령어 | 실행 파일 | NODE_ENV | 사용하는 .env | 용도 |
|--------|------------|----------|----------------|------|
| `npm run build` | — | — | — | **번들+난독화** → dist/index.js 생성 |
| `npm start` | dist/index.js | production | .env.production → .env | **프로덕션 배포용** |
| `npm run prod` | dist/index.js | production | .env.production → .env | 프로덕션 실행 |
| `npm run dev` | src/index.js | development | .env.dev → .env | 개발 (watch) |
| `npm run start:src` | src/index.js | production | .env.production → .env | 소스 직접 실행 (디버깅 등) |

---

## 5. 디렉터리 구조

```
server/
├── build/
│   └── build.cjs   # 빌드 스크립트 (esbuild 번들 + javascript-obfuscator)
├── config/
│   ├── env.js      # dotenv 로드 (NODE_ENV에 따라 .env 파일 선택)
│   └── config.js   # process.env 기반 config 객체
├── src/            # 원본 소스 (개발 시 사용)
│   ├── index.js
│   ├── handlers.js
│   ├── rooms.js
│   ├── roomState.js
│   └── logger.js
├── dist/           # 빌드 산출물 (npm run build 후 생성, .gitignore)
│   └── index.js    # 번들+난독화된 단일 진입점 (배포 시 실행)
├── docs/
├── .env
├── .env.dev
├── .env.production
├── ecosystem.config.js  # PM2: script = ./dist/index.js
└── package.json
```

- **설정 흐름**: 실행 파일(dist 또는 src) → config 로드 → dotenv로 .env 로드 → `process.env` 기반 config 생성.

---

## 6. 설정 우선순위

1. **실행 시 환경 변수** (예: `PORT=9000 npm start`) — 최우선  
2. **환경별 .env** (.env.dev 또는 .env.production)  
3. **.env** (공통)  
4. **코드 기본값** (예: PORT 없으면 8300)

---

## 7. 문서 인덱스

| 문서 | 내용 |
|------|------|
| [README.md](README.md) | 기능, 설치, 스크립트, 프로젝트 구조, WAS 요약 |
| [OVERVIEW.md](OVERVIEW.md) | 이 문서 — 구조·포트·env·실행 한눈에 |
| [SCRIPTS.md](SCRIPTS.md) | **package.json scripts** — build/start/dev/PM2/lint/format 사용법 |
| [LOCAL_SETUP.md](local_setup/LOCAL_SETUP.md) | **로컬 실행** — IntelliJ 기준 필요 사항·실행·확인 |
| [BUILD.md](build/BUILD.md) | **빌드** — 번들+난독화 절차, reservedStrings 안내 |
| [OBFUSCATION_BUNDLE_NOTES.md](build/OBFUSCATION_BUNDLE_NOTES.md) | **소스 수정 시** — 난독화/번들 유의사항 (reservedStrings, env, 경로, 의존성) |
| [DEBUG_ARTIFACTS_AND_RESERVED_RULE.md](build/DEBUG_ARTIFACTS_AND_RESERVED_RULE.md) | **디버그 아티팩트** + reservedStrings 누락 방지 룰 |
| [DEPLOY_ESSENTIALS.md](deploy/DEPLOY_ESSENTIALS.md) | **배포 필수 항목** — 가져가야 할 파일만 정리 |
| [DEPLOY_CHECKLIST.md](deploy/DEPLOY_CHECKLIST.md) | **배포 할 일만** — Nginx(Linux) / Windows 바로 진행용 체크리스트 |
| [ARCHITECTURE.md](structure/ARCHITECTURE.md) | 아키텍처, 실행 흐름, 메시지 프로토콜 |
| [DEPLOYMENT.md](deploy/DEPLOYMENT.md) | 배포 절차 (Linux/Windows, PM2, 확인) |
| [WAS_DEPLOYMENT.md](deploy/WAS_DEPLOYMENT.md) | Nginx/Tomcat Reverse Proxy 상세 |
| [ENV_WAS_SETTINGS.md](deploy/ENV_WAS_SETTINGS.md) | WAS_TYPE, REVERSE_PROXY, INTERNAL_PORT 등 5개 설정 적용 방식 상세 |
| [LOGGING.md](logs/LOGGING.md) | 로그 포맷, LOG_LEVEL, LOG_PAYLOAD 등 |
| [OPERATION_LOGS.md](OPERATION_LOGS.md) | **배포 후 로그 확인** — Nginx(Linux) / Windows 비교, 어디를 어떻게 볼지 |
| [CLIENT_JSON_SPEC.md](payload_json_rules/CLIENT_JSON_SPEC.md) | **클라이언트(Android/React) → 서버 JSON 규격** 및 유의사항 |

---

## 8. 프로덕션 배포 시 체크 포인트

- **빌드**: 배포 전 `npm run build` 실행 → `dist/index.js` 생성. 이 파일이 없으면 `npm start` / PM2 실패.
- **실행 위치**: `npm start` 또는 PM2 실행 시 **작업 디렉터리는 server 루트**. `.env` / `.env.production`은 server 루트에서 로드됨.
- **.env.production**: `INTERNAL_PORT=8700`, `WAS_TYPE=nginx`(또는 tomcat), `REVERSE_PROXY=true` 등 반영.
- **Nginx**: `/ws` → `127.0.0.1:8700`, **`/health` → `127.0.0.1:8701`** 로 프록시 (Health는 8701).
- **Health 확인**: `curl http://127.0.0.1:8701/health` 또는 `curl https://your-domain.com/health`
