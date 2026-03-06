# 서버 아키텍처 및 실행 흐름

이 문서는 **sync-server**(Node.js WebSocket 서버)의 구조, 실행 흐름, 메시지 프로토콜, 환경 설정을 **현재 프로젝트 기준**으로 정리합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [전체 아키텍처](#2-전체-아키텍처)
3. [실행 흐름](#3-실행-흐름)
4. [WebSocket 메시지 프로토콜](#4-websocket-메시지-프로토콜)
5. [환경 설정 및 배포](#5-환경-설정-및-배포)
6. [서버 개발 워크플로우](#6-서버-개발-워크플로우)
7. [주요 파일 구조](#7-주요-파일-구조)
8. [데이터 흐름 예시](#8-데이터-흐름-예시)
9. [참고 문서](#9-참고-문서)
10. [문제 해결](#10-문제-해결)

---

## 1. 프로젝트 개요

**sync-server**는 Room 단위로 WebSocket 메시지를 중계하는 Node.js 서버입니다.

### 핵심 기능

- **Room 단위 중계**: `roomId`(예: `DOC{doc_id}`) 기준으로 클라이언트를 묶고, 같은 Room 내에서만 메시지 릴레이
- **지원 메시지**: `newClient`, `chat`, `broadcast` / `broadcastAll`, `request` / `response`, `clientList`
- **특정 클라이언트 전송**: 메시지에 `targetClientId`를 넣으면 해당 1명에게만 전송
- **Room 상태 동기화**: `broadcast`의 `movePage`·`setForm`을 저장해 신규 입장자에게 `roomState`로 전달
- **동일 기기 중복 제어**: `newClient`의 `clientKey`로 같은 Room 내 중복 연결 거부(4000)

### 기술 스택

- Node.js 18+, ES Module
- WebSocket: `ws`
- 설정: `dotenv` + `config/env.js`, `config/config.js`

---

## 2. 전체 아키텍처

### 시스템 구성도

```
┌─────────────────┐         ┌─────────────────┐
│  클라이언트 A   │         │  클라이언트 B   │
│  (Android/Web 등)│         │  (Android/Web 등)│
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  WebSocket (ws:// / wss://)
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼───────────┐
         │   WebSocket Server     │
         │   (Node.js)            │
         │   - Room 관리          │
         │   - 메시지 중계        │
         │   - roomState 동기화   │
         └───────────────────────┘
                     │
         ┌───────────▼───────────┐
         │   WAS (선택)           │
         │   Nginx / Apache 등   │
         │   Reverse Proxy       │
         └───────────────────────┘
```

### 통신 흐름

1. **연결**: 클라이언트가 WebSocket으로 서버 접속 → 서버가 `clientId` 부여
2. **Room 입장**: `newClient` 메시지로 `roomId` 지정 → 서버가 Room 등록, 신규 입장자에게 `roomState` 전송, Room 내 다른 클라이언트에게 `newClient` 브로드캐스트
3. **메시지 중계**: `chat`·`broadcast` 등 → `targetClientId` 있으면 1명에게만, 없으면 Room 전체 브로드캐스트(발신자 제외)
4. **퇴장**: 연결 종료 시 서버가 Room 내 나머지에게 `clientLeft` 브로드캐스트 후 Room에서 제거

---

## 3. 실행 흐름

### 3.1 서버 시작

```
1. 서버 시작 (npm run dev 또는 npm start)
   ↓
2. config/config.js 로드
   - config.js가 맨 처음 import './env.js' 실행
   - env.js: NODE_ENV에 따라 .env.production / .env.dev / .env 중 하나 로드 후, .env를 override:false로 추가 로드
   - config.js: process.env를 읽어 config 객체 생성 (port, host, logging, was, healthCheck, websocket 등)
   ↓
3. WebSocketServer 생성 (src/index.js)
   - 포트: config.port (개발 8600, 프로덕션 8700)
   - 호스트: config.host (HOST 또는 IP, 기본 0.0.0.0)
   ↓
4. Health Check용 HTTP 서버 (healthCheck.enabled일 때만)
   - 포트: config.port + 1 (개발 8601, 프로덕션 8701)
   - 경로: config.healthCheck.path (기본 /health)
   ↓
5. WebSocket 리스닝 시작
```

**요약**: WebSocket 포트와 Health 포트는 **+1** 관계. Nginx 등에서 `/health`는 **8701**(프로덕션)로 프록시해야 함.

**코드 위치**: `src/index.js`, `config/env.js`, `config/config.js`

### 3.2 클라이언트 연결

```
1. 클라이언트가 WebSocket 연결
   ws://host:port (또는 wss:// when behind WAS)
   ↓
2. 서버: connection 이벤트
   - ws.clientId 생성, ws.roomId = null, ws.userInfo = null
   ↓
3. 클라이언트: newClient 전송
   { type: "newClient", roomId: "DOC123", user?: {...}, clientKey?: "..." }
   ↓
4. 서버: handleNewClient()
   - clientKey 중복 시 4000으로 거부
   - joinRoom(roomId, ws), 신규 입장자에게 roomState 전송
   - Room 내 다른 클라이언트에게 newClient(clientId 포함) 브로드캐스트
   ↓
5. Room 등록 완료, 메시지 송수신 가능
```

**코드 위치**: `src/index.js`, `src/handlers.js`

### 3.3 메시지 처리

```
1. 클라이언트가 JSON 메시지 전송
   ↓
2. 서버: message 이벤트 → JSON 파싱
   - newClient이면 attachUserInfo(ws, data)
   - handleMessage(data, ws, ws.roomId)
   ↓
3. handleMessage: data.type으로 분기
   - newClient → handleNewClient
   - chat / broadcast / broadcastAll / request / response → relayToRoom
   - clientList → sendClientList (요청자에게만 응답)
   - 기타 → relayToRoom (default)
   ↓
4. relayToRoom
   - data.targetClientId 있음 → sendToClient(해당 1명)
   - 없음 → broadcastToRoom(roomId, data, ws), broadcast의 movePage/setForm이면 updateRoomState
   ↓
5. 수신 측 클라이언트가 메시지 수신
```

**코드 위치**: `src/handlers.js`, `src/rooms.js`, `src/roomState.js`

### 3.4 연결 종료

```
1. 클라이언트 연결 종료 (close / error 등)
   ↓
2. 서버: onClose(ws)
   - Room 내 나머지에게 clientLeft 브로드캐스트
   - leaveRoom(roomId, ws)
   - Room 비면 clearRoomState(roomId)
```

**코드 위치**: `src/handlers.js` (onClose)

---

## 4. WebSocket 메시지 프로토콜

### 클라이언트 → 서버 (타입별)

| type | 설명 | 비고 |
|------|------|------|
| `newClient` | Room 입장/이동 | 필수 `roomId`, 선택 `user`, `clientKey` (중복 시 4000 거부) |
| `chat` | 채팅 | relayToRoom (targetClientId 선택) |
| `broadcast` | 이벤트 브로드캐스트 | movePage/setForm 시 Room 상태 저장, targetClientId 선택 |
| `broadcastAll` | 전체 브로드캐스트 | relayToRoom |
| `request` | 요청 | relayToRoom |
| `response` | 응답 | relayToRoom |
| `clientList` | 참가자 목록 요청 | 요청한 클라이언트에게만 clientList 응답 |
| 그 외 | 알 수 없는 타입 | relayToRoom으로 그대로 릴레이 |

### 서버 → 클라이언트 (자동 전송)

| type | 시점 | 수신자 |
|------|------|--------|
| `roomState` | newClient 처리 직후 | 신규 입장자 1명 (lastPage, formValues 등) |
| `clientLeft` | 연결 종료 시 | 해당 Room 내 나머지 |
| `newClient` (브로드캐스트) | newClient 처리 시 | Room 내 다른 클라이언트 (clientId 포함) |
| `clientList` | clientList 요청에 대한 응답 | 요청한 클라이언트 1명 |

### 메시지 형식

- **JSON 문자열**로 전송.
- `broadcast` 예: `value.event`(movePage, setForm 등), `value.page`, `value.formId` 등 사용.
- 특정 1명에게만 보내려면 **targetClientId**에 해당 `clientId` 지정.

### Room ID

- 형식: `DOC{doc_id}` 등 (클라이언트 협약).
- 같은 `roomId`만 메시지 공유.

---

## 5. 환경 설정 및 배포

### 환경 파일

| 파일 | 사용 시점 |
|------|-----------|
| `.env` | 공통 기본값 (환경별에 없는 키 보충) |
| `.env.dev` | NODE_ENV=development, npm run dev |
| `.env.production` | NODE_ENV=production, npm start / npm run prod |

### 주요 설정 항목

- **기본**: `IP`, `PORT`, `NODE_ENV`, `INTERNAL_PORT`(실제 리스닝 포트)
- **WAS**: `WAS_TYPE`, `REVERSE_PROXY`, `EXTERNAL_PORT`, `PROXY_PATH`
- **로깅**: `LOG_LEVEL`, `LOG_PAYLOAD`, `LOG_MAX_LEN`
- **WebSocket**: `WS_MAX_CONNECTIONS_PER_IP`, `WS_PING_INTERVAL`, `WS_MAX_MESSAGE_SIZE`
- **Health**: `HEALTH_CHECK_ENABLED`, `HEALTH_CHECK_PATH`

자세한 적용 방식: [ENV_WAS_SETTINGS.md](../deploy/ENV_WAS_SETTINGS.md)

### 설정 우선순위

1. 환경 변수 (실행 시)
2. 환경별 .env (.env.dev / .env.production)
3. .env
4. 코드 기본값

### 배포 구조

- **개발**: 클라이언트 → Node 직접 (예: 8600)
- **프로덕션(Nginx)**: 클라이언트 → Nginx(443) → Node WS(8700), Health(8701). `/health`는 8701로 프록시.

---

## 6. 서버 개발 워크플로우

### 설치 및 실행

```bash
cd server
npm install
npm run dev
```

- `npm run dev`: NODE_ENV=development, .env.dev 사용, --watch
- `npm run prod` / `npm start`: NODE_ENV=production, .env.production 사용

### 자주 쓰는 명령

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
pm2 start ecosystem.config.js   # 프로덕션 PM2
```

---

## 7. 주요 파일 구조

```
server/
├── config/
│   ├── env.js         # dotenv 로드 (NODE_ENV별 .env 선택)
│   └── config.js      # process.env 기반 config 객체
├── src/
│   ├── index.js       # WebSocket 서버 + Health HTTP 서버 진입점
│   ├── handlers.js    # 메시지 타입별 처리, relayToRoom, sendClientList, onClose
│   ├── rooms.js       # joinRoom, leaveRoom, broadcastToRoom, sendToClient
│   ├── roomState.js   # updateRoomState, getRoomState (movePage/setForm)
│   └── logger.js      # 구조화 로깅 (LOG_LEVEL 등)
├── docs/              # 서버 문서
├── .env, .env.dev, .env.production
├── ecosystem.config.js
├── nginx.conf.example
└── package.json
```

---

## 8. 데이터 흐름 예시

### 시나리오: broadcast(movePage) 동기화

```
1. 클라이언트 A가 페이지 2로 이동
   → { type: "broadcast", value: { event: "movePage", page: 2 } } 전송
   ↓
2. 서버: handleMessage → handleBroadcast → relayToRoom
   - targetClientId 없음 → broadcastToRoom("DOC123", data, ws)
   - value.event === "movePage" → updateRoomState(roomId, data)
   ↓
3. Room 내 B, C에게 동일 메시지 전송
   ↓
4. 나중에 D가 newClient로 입장
   → 서버가 getRoomState("DOC123")로 lastPage 등 조회
   → D에게만 { type: "roomState", roomId, lastPage: 2, formValues } 전송
   ↓
5. D는 입장 시점 기준 현재 페이지·폼 값을 한 번에 반영
```

---

## 9. 참고 문서

| 문서 | 내용 |
|------|------|
| [README.md](../README.md) | 서버 기능, 설치, 스크립트 |
| [OVERVIEW.md](../OVERVIEW.md) | 포트·env·구조 한눈에 |
| [DEPLOY_CHECKLIST.md](../deploy/DEPLOY_CHECKLIST.md) | Nginx(Linux) / Windows 배포 체크리스트 |
| [ENV_WAS_SETTINGS.md](../deploy/ENV_WAS_SETTINGS.md) | WAS_TYPE, INTERNAL_PORT 등 적용 상세 |
| [WAS_DEPLOYMENT.md](../deploy/WAS_DEPLOYMENT.md) | Nginx/Apache 배포 |
| [LOGGING.md](../logs/LOGGING.md) | 로깅 설정 |
| [메시지_유형별_처리_및_특정클라이언트_전송.md](../message_type/메시지_유형별_처리_및_특정클라이언트_전송.md) | 메시지 타입·targetClientId·roomState |

---

## 10. 문제 해결

### 연결 실패

- 서버 실행 여부: `pm2 status` 또는 프로세스 확인
- 포트: 개발 8600, 프로덕션 8700 (및 Health 8601/8701)
- 방화벽·WAS 프록시 설정 확인

### 메시지 동기화 안 됨

- `roomId` 일치 여부
- WebSocket 연결 상태
- 서버 로그: `LOG_LEVEL=debug`, `pm2 logs sync-server`

### WAS 배포 문제

- Nginx: `nginx.conf.example` 참고, `/health`는 8701로 프록시
- `INTERNAL_PORT`와 실제 Node 포트 일치
- SSL 경로·도메인 설정 확인
