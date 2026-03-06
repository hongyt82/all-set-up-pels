# Sync Room Relay Server

Node 기반 WebSocket Room 중계 서버입니다. **DOTabLayoutContainerFragment** 및 (향후) **PDFViewer** 클라이언트와 동기화 메시지를 주고받기 위한 중계용이며, Room 단위 WebSocket 메시지 프로토콜을 사용합니다.

> **처음 받은 경우**: 설치·최초 할 일·유의사항은 **[GETTING_STARTED.md](GETTING_STARTED.md)** 를 먼저 참고하세요.  
> **한눈에 보기**: 구조·포트·환경 파일·실행 방법은 **[OVERVIEW.md](OVERVIEW.md)** 에 정리되어 있습니다.

---

## 기능

- **Room 단위 중계**: `roomId`(예: `DOC{doc_id}`) 기준으로 클라이언트를 묶고, 같은 Room 내에서만 메시지 중계
- **지원 메시지 타입**
  - `newClient`: 입장 시 roomId·user 정보 전송, Room 등록
  - `chat`: 채팅 메시지 Room 내 브로드캐스트
  - `broadcast` / `broadcastAll`: 이벤트(movePage, setForm 등) Room 내 브로드캐스트
  - `request` / `response`: 데이터 동기화 요청·응답 중계
  - `clientList`: 해당 Room 참가자 목록 응답

---

## 요구 사항

- Node 18+
- Prettier, ESLint 적용 (유지보수용)

---

## 설치 및 실행

```bash
cd server
npm install
npm run build   # dist/index.js 생성 (배포 시 필수)
npm start       # dist/index.js 실행
```

개발 시 파일 변경 자동 재실행:

```bash
npm run dev
```

---

## 환경 설정 (dotenv)

서버는 **dotenv**로 환경별 설정 파일을 로드합니다. **파일 이름은 반드시 아래와 같아야 합니다.**

| 파일 | 사용 시점 |
|------|------------|
| `.env` | 공통 기본값 (환경별 파일에 없는 키 보충) |
| `.env.dev` | 개발 환경 (`npm run dev`, NODE_ENV=development) |
| `.env.production` | 프로덕션 환경 (`npm start`, `npm run prod`) |

- 프로덕션용 파일명은 **`.env.production`** 입니다. `.env.prod`는 사용하지 않습니다.
- 로드 순서와 포트 등은 [OVERVIEW.md](OVERVIEW.md) 참고.

### 주요 설정 항목 예시

```env
# 기본 서버
IP=0.0.0.0
PORT=8300
NODE_ENV=development

# WAS 배포 (선택)
WAS_TYPE=none
REVERSE_PROXY=false
INTERNAL_PORT=8300
EXTERNAL_PORT=8300
PROXY_PATH=/ws

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

# WebSocket
WS_MAX_CONNECTIONS_PER_IP=0
WS_PING_INTERVAL=30000
WS_MAX_MESSAGE_SIZE=1048576

# 로깅
LOG_LEVEL=info
LOG_PAYLOAD=false
LOG_MAX_LEN=2000
```

전체 항목은 각 `.env` 파일 내 주석을 참조하세요.

---

## 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run build` | **번들+난독화** → dist/index.js 생성 (배포 전 필수) |
| `npm start` | 프로덕션 실행 (dist/index.js, .env.production) |
| `npm run start:src` | 소스 직접 프로덕션 실행 (빌드 없이, 디버깅용) |
| `npm run dev` | 개발 모드 (src, .env.dev, --watch) |
| `npm run dev:watch` | 개발 모드 (.env.dev, --watch) |
| `npm run prod` | 프로덕션 실행 (dist/index.js) |
| `npm run lint` | ESLint 실행 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 포맷 적용 |
| `npm run format:check` | Prettier 검사만 |
| `npm run pm2:start` | PM2로 서버 시작 (dist/index.js 실행) |

---

## 프로젝트 구조

```
server/
├── build/
│   └── build.cjs    # 빌드 스크립트 (esbuild + 난독화)
├── config/
│   ├── env.js       # dotenv 로드 (NODE_ENV별 .env 선택)
│   └── config.js    # process.env 기반 설정 객체
├── src/             # 원본 소스 (개발 시 사용)
│   ├── index.js
│   ├── handlers.js
│   ├── rooms.js
│   ├── roomState.js
│   └── logger.js
├── dist/            # 빌드 산출물 (npm run build 후 생성)
│   └── index.js     # 번들+난독화된 단일 파일 (배포 시 실행)
├── docs/
├── .env
├── .env.dev
├── .env.production
├── ecosystem.config.js  # PM2: script = ./dist/index.js
└── package.json
```

---

## WAS 배포 요약

- Nginx 또는 Tomcat을 Reverse Proxy로 사용할 수 있습니다.
- **.env.production** 에서 `WAS_TYPE=nginx`, `REVERSE_PROXY=true`, `INTERNAL_PORT=8700` 등 설정.
- **Health Check** 는 WebSocket 포트가 8700일 때 **8701**에서 동작합니다. Nginx에서 `/health`는 **8701**로 프록시해야 합니다.
- 상세: [WAS_DEPLOYMENT.md](deploy/WAS_DEPLOYMENT.md), [DEPLOYMENT.md](deploy/DEPLOYMENT.md)

---

## 클라이언트 연동

- 앱의 `wsUrl`을 이 서버 주소로 설정 (예: 에뮬레이터 `10.0.2.2:8600`, 실제 기기에서는 PC IP:8600).
- Room ID는 **DOPdfInfo** 기준 (예: `roomId = "DOC${pdfInfo.doc_id}"`).
- WAS 배포 시: `wss://your-domain.com/ws` 형식으로 연결

---

## 문서 목록

| 문서 | 내용 |
|------|------|
| [GETTING_STARTED.md](GETTING_STARTED.md) | **처음 받은 사람용** — 설치, 최초 할 일, 유의사항 |
| [README.md](README.md) | 기능, 설치, 스크립트, 프로젝트 구조, WAS 요약 |
| [OVERVIEW.md](OVERVIEW.md) | 구조·포트·env·실행 한눈에 |
| [LOCAL_SETUP.md](local_setup/LOCAL_SETUP.md) | **로컬 실행** — IntelliJ 기준 필요 사항·실행·확인 |
| [DEPLOY_CHECKLIST.md](deploy/DEPLOY_CHECKLIST.md) | **배포 할 일만** — Nginx(Linux) / Windows 바로 진행용 체크리스트 |
| [PM2_GUIDE.md](PM2_GUIDE.md) | **PM2 전략·사용법** — Docker 없이 PM2만 배포할 때 가이드 |
| [ARCHITECTURE.md](structure/ARCHITECTURE.md) | 아키텍처, 실행 흐름, 메시지 프로토콜 |
| [DEPLOYMENT.md](deploy/DEPLOYMENT.md) | 배포 절차 (Linux/Windows, PM2, 확인) |
| [WAS_DEPLOYMENT.md](deploy/WAS_DEPLOYMENT.md) | Nginx/Tomcat Reverse Proxy 상세 |
| [ENV_WAS_SETTINGS.md](deploy/ENV_WAS_SETTINGS.md) | WAS_TYPE, REVERSE_PROXY, INTERNAL_PORT 등 5개 설정 적용 방식 상세 |
| [LOGGING.md](logs/LOGGING.md) | 로그 포맷, LOG_LEVEL, LOG_PAYLOAD 등 |
| [OPERATION_LOGS.md](logs/OPERATION_LOGS.md) | **배포 후 로그 확인** — Nginx(Linux) / Windows 비교, 어디를 어떻게 볼지 |
| [CLIENT_JSON_SPEC.md](payload_json_rules/CLIENT_JSON_SPEC.md) | **클라이언트(Android/React) → 서버 JSON 규격** 및 유의사항 |
