## Server message logging guide

클라이언트 ↔ 서버(WebSocket) 간 **어떤 메시지가 오고가는지**를 상황별로 추적하기 위한 로그 가이드입니다.

> **서버 구조·env 파일**: [OVERVIEW.md](../OVERVIEW.md) 참고.

### 목표

- **연결/해제**, **room 입장(newClient)**, **메시지 수신**, **room 브로드캐스트**, **에러(파싱 실패 등)** 를 로그로 확인
- 운영 환경에서 과도한 로그/개인정보 노출을 방지하기 위해 **레벨/페이로드 출력 여부를 환경변수로 제어**

---

## 1) 로그 형식

- 기본적으로 **JSON 한 줄(Structured log)** 로 출력합니다.
- 각 로그 라인에는 최소한 아래 필드가 포함됩니다.
  - `ts`: ISO timestamp
  - `level`: `debug|info|warn|error`
  - `event`: 이벤트 이름(예: `ws.connection`, `ws.message.received`)
  - 기타 메타데이터(예: roomId, client 정보 등)

---

## 2) 환경변수(ENV) 설정

`server/.env*` 파일에 아래 옵션을 추가해서 제어합니다.

### 필수/권장 옵션

- **`LOG_LEVEL`**: `debug | info | warn | error`
  - 기본값: `info`
  - 운영 권장: `info` 또는 `warn`
- **`LOG_PAYLOAD`**: `true | false`
  - 기본값: `false`
  - `true`인 경우 메시지 본문(payload)을 로그에 포함합니다.
  - 운영 환경에서는 개인정보/대용량 로그 이슈가 있으니 **기본 false 권장**
- **`LOG_MAX_LEN`**: 숫자
  - 기본값: `2000`
  - payload를 찍을 때 최대 길이 제한(초과는 잘림)

### 환경별 설정

각 환경 파일(`.env`, `.env.dev`, `.env.production`)에 이미 로그 설정이 포함되어 있습니다.

#### `.env` (기본 설정)

```env
# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=info          # 기본값: 일반 정보 로그
LOG_PAYLOAD=false       # 기본값: 페이로드 제외 (보안/성능)
LOG_MAX_LEN=2000        # 기본값: 페이로드 최대 길이
```

**특징**: 안전한 기본값 제공. 다른 환경 파일에서 오버라이드 가능.

#### `.env.dev` (개발 환경)

```env
# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=debug         # 개발: 모든 로그 출력
LOG_PAYLOAD=true        # 개발: 메시지 본문 포함 (디버깅 편의)
LOG_MAX_LEN=5000        # 개발: 더 긴 페이로드도 확인 가능
```

**특징**: 
- `debug` 레벨로 모든 로그 출력
- `LOG_PAYLOAD=true`로 메시지 본문까지 확인 가능
- 디버깅에 최적화된 설정

#### `.env.production` (프로덕션 환경)

```env
# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=info          # 운영: 일반 정보만 출력
LOG_PAYLOAD=false       # 운영: 페이로드 제외 (보안/성능)
LOG_MAX_LEN=2000        # 운영: 페이로드 최대 길이 제한
```

**특징**:
- `info` 레벨로 필요한 정보만 출력 (성능 고려)
- `LOG_PAYLOAD=false`로 민감 정보 노출 방지
- 보안 및 성능 최적화된 설정

### 설정 우선순위

1. 환경 변수 직접 지정 (최우선)
2. 환경별 `.env` 파일 (`.env.dev` 또는 `.env.production`)
3. 기본 `.env` 파일
4. 코드 내 기본값 (`LOG_LEVEL=info`, `LOG_PAYLOAD=false`, `LOG_MAX_LEN=2000`)

---

## 3) 적용된 코드 위치

### 로거 구현

- `server/src/logger.js`
  - 레벨 필터링 + 구조화 로그 출력
  - `logger.maybePayload(payload)`로 payload 포함 여부/길이 제한 적용

### 설정 반영

- `server/config/config.js`
  - `config.logging` 섹션 추가:
    - `level`, `payload`, `maxLen`

---

## 4) 어떤 “상황별 로그”를 찍게 되나 (의도)

아래 이벤트들을 찍는 것을 목표로 합니다. (각 파일에 로그 추가 시 이 표를 기준으로 event명을 통일하는 것을 권장)

### 연결 수명주기

- **`ws.connection`**: 새로운 클라이언트 연결 수립
- **`ws.close`**: 연결 종료(정상/비정상)
- **`ws.error`**: 소켓 레벨 에러

### room/사용자 정보

- **`room.join`**: `newClient`로 roomId가 설정되어 room에 합류
- **`room.leave`**: 연결 종료 시 room에서 제거
- **`room.clientList.request`** / **`room.clientList.response`**: clientList 요청/응답(필요 시)

### 메시지 흐름

- **`ws.message.received`**: 메시지 수신(타입/roomId/크기 등 메타)
- **`ws.message.invalid_json`**: JSON 파싱 실패
- **`ws.message.relay`**: room으로 릴레이(브로드캐스트) 수행
- **`room.broadcast`**: 실제 브로드캐스트 시도/성공(수신자 수 등)

> 참고: payload 로깅은 `LOG_PAYLOAD=true`일 때만 포함하도록 하는 것이 운영에 안전합니다.

---

## 5) 운영(배포) 관점 권장값

### 프로덕션 환경

- **Nginx/Tomcat reverse proxy 뒤 운영**
  - `LOG_LEVEL=info` (`.env.production`에 이미 설정됨)
  - `LOG_PAYLOAD=false` (`.env.production`에 이미 설정됨)
  - 필요 시 특정 이슈 재현 동안만 `LOG_LEVEL=debug`로 올리고, 해결 후 원복

### 개발 환경

- **로컬 개발/디버깅**
  - `LOG_LEVEL=debug` (`.env.dev`에 이미 설정됨)
  - `LOG_PAYLOAD=true` (`.env.dev`에 이미 설정됨)
  - 메시지 흐름을 상세히 추적 가능

### 설정 변경 방법

환경별 설정을 변경하려면 해당 `.env` 파일을 직접 수정하거나, 환경 변수로 오버라이드:

```bash
# 환경 변수로 일시적으로 변경
LOG_LEVEL=debug npm run dev

# 프로덕션에서 디버깅 시
LOG_LEVEL=debug LOG_PAYLOAD=true npm run prod
```

---

## 6) 다음 작업(서버 로그 확장 시)

현재는 로거(`src/logger.js`)와 설정(`config/config.js`)이 추가/확장되었습니다.

클라이언트↔서버 메시지의 “상황별 추적”을 완성하려면, 아래 파일에 이벤트 로그를 추가하면 됩니다.

- `server/src/index.js`: connection/close/error, raw message 수신(파싱 성공/실패) 로그
- `server/src/handlers.js`: type별 처리(newClient/relay/clientList) 로그
- `server/src/rooms.js`: join/leave/broadcast 대상 수/성공 여부 로그

원하시면 위 3개 파일에 실제 로그 라인을 더 촘촘하게 추가해서
“클라이언트에서 어떤 type의 메시지를 보냈고, 서버가 어떤 room으로 몇 명에게 전달했는지”까지
한 번에 추적 가능하도록 완성해드릴 수 있습니다.

