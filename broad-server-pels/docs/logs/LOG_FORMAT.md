# 서버 로그 형식 및 데이터 가이드

이 문서는 WebSocket 서버에서 출력되는 모든 로그의 형식과 포함되는 데이터를 설명합니다.

---

## 목차

1. [로그 형식 개요](#로그-형식-개요)
2. [로그 레벨](#로그-레벨)
3. [이벤트별 로그 상세](#이벤트별-로그-상세)
4. [로그 예시](#로그-예시)
5. [로그 필터링 및 검색](#로그-필터링-및-검색)

---

## 로그 형식 개요

### 기본 구조

모든 로그는 **JSON 한 줄 형식**으로 출력됩니다:

```json
{
  "ts": "2026-02-06T16:30:00.123Z",
  "level": "info",
  "event": "ws.connection",
  "clientId": "client_1_1704547800123",
  "clientIp": "127.0.0.1",
  "clientPort": "54321",
  ...
}
```

### 공통 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `ts` | string | ISO 8601 타임스탬프 | `"2026-02-06T16:30:00.123Z"` |
| `level` | string | 로그 레벨 | `"debug"`, `"info"`, `"warn"`, `"error"` |
| `event` | string | 이벤트 이름 | `"ws.connection"`, `"room.join"` |
| `clientId` | string | 클라이언트 고유 ID | `"client_1_1704547800123"` |
| `roomId` | string | Room ID (해당 시) | `"DOC123"` |

---

## 로그 레벨

### 레벨별 설명

| 레벨 | 설명 | 출력 조건 |
|------|------|----------|
| `debug` | 상세 디버깅 정보 | `LOG_LEVEL=debug` |
| `info` | 일반 정보 (기본) | `LOG_LEVEL=info` 이상 |
| `warn` | 경고 (비정상 상황) | `LOG_LEVEL=warn` 이상 |
| `error` | 에러 | `LOG_LEVEL=error` 이상 |

### 레벨별 출력 이벤트

- **debug**: 메시지 수신, 처리 시작, 상세 메타데이터
- **info**: 연결, Room 입장/퇴장, 브로드캐스트, 클라이언트 목록
- **warn**: 파싱 실패, Room 없음, 전송 실패
- **error**: WebSocket 에러, 예외 발생

---

## 이벤트별 로그 상세

### 1. WebSocket 연결 관련 (`index.js`)

#### `ws.connection` (info)

새 클라이언트 연결 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:00.123Z",
  "level": "info",
  "event": "ws.connection",
  "clientId": "client_1_1704547800123",
  "clientIp": "127.0.0.1",
  "clientPort": "54321",
  "url": "/",
  "headers": {
    "user-agent": "Mozilla/5.0 ..."
  }
}
```

**필드 설명**:
- `clientId`: 서버가 생성한 고유 클라이언트 ID
- `clientIp`: 클라이언트 IP 주소
- `clientPort`: 클라이언트 포트 번호
- `url`: 연결 URL
- `headers.user-agent`: User-Agent 헤더

---

#### `ws.message.received` (debug)

메시지 수신 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:01.456Z",
  "level": "debug",
  "event": "ws.message.received",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "type": "broadcast",
  "size": 156,
  "payload": "{\"type\":\"broadcast\",\"roomId\":\"DOC123\",\"data\":{...}}"
}
```

**필드 설명**:
- `type`: 메시지 타입 (`newClient`, `broadcast`, `chat` 등)
- `size`: 메시지 크기 (바이트)
- `payload`: 메시지 본문 (`LOG_PAYLOAD=true`일 때만 포함)

---

#### `ws.message.invalid_json` (warn)

JSON 파싱 실패 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.789Z",
  "level": "warn",
  "event": "ws.message.invalid_json",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "size": 50,
  "error": "Unexpected token ...",
  "payload": "invalid json string..."
}
```

**필드 설명**:
- `error`: 파싱 에러 메시지
- `payload`: 원본 메시지 (`LOG_PAYLOAD=true`일 때만)

---

#### `ws.close` (info)

클라이언트 연결 종료 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.000Z",
  "level": "info",
  "event": "ws.close",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "code": 1000,
  "reason": "normal",
  "userInfo": {
    "id": "user1",
    "name": "User 1"
  }
}
```

**필드 설명**:
- `code`: WebSocket 종료 코드 (1000 = 정상 종료)
- `reason`: 종료 이유
- `userInfo`: 사용자 정보 (있는 경우)

---

#### `ws.error` (error)

WebSocket 에러 발생 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:05.000Z",
  "level": "error",
  "event": "ws.error",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "error": "Connection closed unexpectedly",
  "stack": "Error: Connection closed unexpectedly\n    at ..."
}
```

**필드 설명**:
- `error`: 에러 메시지
- `stack`: 스택 트레이스

---

### 2. 메시지 처리 관련 (`handlers.js`)

#### `ws.message.handle` (debug)

메시지 처리 시작 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:01.500Z",
  "level": "debug",
  "event": "ws.message.handle",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "type": "broadcast"
}
```

---

#### `ws.message.no_type` (debug)

타입이 없는 메시지 수신 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:01.600Z",
  "level": "debug",
  "event": "ws.message.no_type",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "payload": "{\"data\":{...}}"
}
```

---

#### `ws.message.unknown_type` (debug)

알 수 없는 타입의 메시지 수신 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:01.700Z",
  "level": "debug",
  "event": "ws.message.unknown_type",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "type": "customType",
  "payload": "{\"type\":\"customType\",...}"
}
```

---

#### `room.join` (info)

클라이언트가 Room에 입장할 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.000Z",
  "level": "info",
  "event": "room.join",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "oldRoomId": null,
  "userInfo": {
    "id": "user1",
    "name": "User 1"
  }
}
```

**필드 설명**:
- `oldRoomId`: 이전 Room ID (Room 이동 시)
- `userInfo`: 사용자 정보 (`newClient` 메시지에서)

---

#### `room.join.missing_roomId` (warn)

`newClient` 메시지에 `roomId`가 없을 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.100Z",
  "level": "warn",
  "event": "room.join.missing_roomId",
  "clientId": "client_1_1704547800123",
  "payload": "{\"type\":\"newClient\",\"user\":{...}}"
}
```

---

#### `room.move` (info)

클라이언트가 Room을 이동할 때 출력됩니다. (개선 사항 적용)

```json
{
  "ts": "2026-02-06T16:30:02.150Z",
  "level": "info",
  "event": "room.move",
  "clientId": "client_1_1704547800123",
  "fromRoomId": "DOC123",
  "toRoomId": "DOC456"
}
```

**필드 설명**:
- `fromRoomId`: 이전 Room ID
- `toRoomId`: 새 Room ID

**참고**: 이 이벤트는 `oldRoomId`와 `newRoomId`가 다를 때만 출력됩니다.

---

#### `ws.message.relay` (debug)

메시지 릴레이 시작 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.200Z",
  "level": "debug",
  "event": "ws.message.relay",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "type": "broadcast",
  "payload": "{\"type\":\"broadcast\",...}"
}
```

---

#### `ws.message.relay.no_roomId` (warn)

Room ID가 없어 릴레이할 수 없을 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.300Z",
  "level": "warn",
  "event": "ws.message.relay.no_roomId",
  "clientId": "client_1_1704547800123",
  "type": "broadcast",
  "payload": "{\"type\":\"broadcast\",...}"
}
```

---

#### `room.clientList.response` (info)

클라이언트 목록 응답 전송 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:03.000Z",
  "level": "info",
  "event": "room.clientList.response",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "totalClients": 3,
  "activeClients": 2,
  "userCount": 2
}
```

**필드 설명**:
- `totalClients`: Room 내 전체 클라이언트 수
- `activeClients`: 연결 상태가 OPEN인 클라이언트 수
- `userCount`: 사용자 정보가 있는 클라이언트 수

---

#### `room.clientList.send_failed` (warn)

클라이언트 목록 전송 실패 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:03.100Z",
  "level": "warn",
  "event": "room.clientList.send_failed",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "readyState": 3
}
```

**필드 설명**:
- `readyState`: WebSocket 상태 (1=OPEN, 3=CLOSED)

---

#### `ws.userInfo.attached` (debug)

사용자 정보가 WebSocket에 저장될 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.050Z",
  "level": "debug",
  "event": "ws.userInfo.attached",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "userInfo": {
    "id": "user1",
    "name": "User 1"
  }
}
```

---

#### `room.leave` (info)

클라이언트가 Room에서 퇴장할 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.000Z",
  "level": "info",
  "event": "room.leave",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "userInfo": {
    "id": "user1",
    "name": "User 1"
  }
}
```

---

#### `room.leave.no_roomId` (debug)

Room ID가 없어 퇴장 처리할 수 없을 때 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.100Z",
  "level": "debug",
  "event": "room.leave.no_roomId",
  "clientId": "client_1_1704547800123",
  "userInfo": null
}
```

---

### 3. Room 관리 관련 (`rooms.js`)

#### `room.join.completed` (info)

Room 입장 완료 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.010Z",
  "level": "info",
  "event": "room.join.completed",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "isNewRoom": false,
  "roomSizeBefore": 2,
  "roomSizeAfter": 3,
  "totalRooms": 5
}
```

**필드 설명**:
- `isNewRoom`: 신규 Room 생성 여부
- `roomSizeBefore`: 입장 전 Room 크기
- `roomSizeAfter`: 입장 후 Room 크기
- `totalRooms`: 전체 Room 수

---

#### `room.join.invalid_roomId` (warn)

잘못된 roomId로 입장 시도 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:02.020Z",
  "level": "warn",
  "event": "room.join.invalid_roomId",
  "clientId": "client_1_1704547800123"
}
```

---

#### `room.leave.completed` (info)

Room 퇴장 완료 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.010Z",
  "level": "info",
  "event": "room.leave.completed",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC123",
  "roomSizeBefore": 3,
  "roomSizeAfter": 2,
  "roomDeleted": false,
  "totalRooms": 5
}
```

**필드 설명**:
- `roomSizeBefore`: 퇴장 전 Room 크기
- `roomSizeAfter`: 퇴장 후 Room 크기
- `roomDeleted`: Room이 삭제되었는지 여부 (마지막 클라이언트 퇴장 시)
- `totalRooms`: 전체 Room 수

---

#### `room.leave.invalid_roomId` (warn)

잘못된 roomId로 퇴장 시도 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.020Z",
  "level": "warn",
  "event": "room.leave.invalid_roomId",
  "clientId": "client_1_1704547800123"
}
```

---

#### `room.leave.room_not_found` (warn)

존재하지 않는 Room에서 퇴장 시도 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:10.030Z",
  "level": "warn",
  "event": "room.leave.room_not_found",
  "clientId": "client_1_1704547800123",
  "roomId": "DOC999"
}
```

---

#### `room.broadcast` (info)

메시지 브로드캐스트 완료 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:03.000Z",
  "level": "info",
  "event": "room.broadcast",
  "roomId": "DOC123",
  "excludeClientId": "client_1_1704547800123",
  "totalClients": 3,
  "sentCount": 2,
  "skippedCount": 1,
  "skippedReasons": {
    "excluded": 1,
    "notOpen": 0,
    "error": 0
  },
  "payloadSize": 156,
  "payload": "{\"type\":\"broadcast\",...}"
}
```

**필드 설명**:
- `excludeClientId`: 제외된 클라이언트 ID (송신자)
- `totalClients`: Room 내 전체 클라이언트 수
- `sentCount`: 성공적으로 전송된 클라이언트 수
- `skippedCount`: 건너뛴 클라이언트 수
- `skippedReasons`: 건너뛴 이유별 통계
  - `excluded`: 송신자 제외
  - `notOpen`: 연결이 열려있지 않음
  - `error`: 전송 에러 발생
- `payloadSize`: 페이로드 크기 (바이트)
- `payload`: 페이로드 내용 (`LOG_PAYLOAD=true`일 때만)

---

#### `room.broadcast.no_room` (debug)

존재하지 않는 Room으로 브로드캐스트 시도 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:03.100Z",
  "level": "debug",
  "event": "room.broadcast.no_room",
  "roomId": "DOC999",
  "excludeClientId": "client_1_1704547800123"
}
```

---

#### `room.broadcast.send_error` (warn)

브로드캐스트 중 개별 클라이언트 전송 실패 시 출력됩니다.

```json
{
  "ts": "2026-02-06T16:30:03.200Z",
  "level": "warn",
  "event": "room.broadcast.send_error",
  "roomId": "DOC123",
  "clientId": "client_2_1704547800456",
  "error": "WebSocket is not open"
}
```

---

#### `room.broadcast.cleaned` (info)

브로드캐스트 중 연결이 끊긴 클라이언트를 정리했을 때 출력됩니다. (개선 사항 적용)

```json
{
  "ts": "2026-02-06T16:30:03.300Z",
  "level": "info",
  "event": "room.broadcast.cleaned",
  "roomId": "DOC123",
  "cleanedCount": 2
}
```

**필드 설명**:
- `cleanedCount`: 제거된 클라이언트 수

**참고**: `readyState !== 1`이거나 전송 에러가 발생한 클라이언트가 자동으로 제거됩니다.

---

#### `room.deleted.empty` (info)

Room이 비어있어 삭제되었을 때 출력됩니다. (개선 사항 적용)

```json
{
  "ts": "2026-02-06T16:30:03.400Z",
  "level": "info",
  "event": "room.deleted.empty",
  "roomId": "DOC123"
}
```

**참고**: 마지막 클라이언트가 제거되어 Room이 비어있을 때 자동으로 삭제됩니다.

---

## 로그 예시

### 전체 흐름 예시

클라이언트가 연결되어 Room에 입장하고 메시지를 주고받는 전체 흐름:

```json
{"ts":"2026-02-06T16:30:00.123Z","level":"info","event":"ws.connection","clientId":"client_1_1704547800123","clientIp":"127.0.0.1","clientPort":"54321","url":"/","headers":{"user-agent":"Mozilla/5.0 ..."}}
{"ts":"2026-02-06T16:30:01.000Z","level":"debug","event":"ws.message.received","clientId":"client_1_1704547800123","roomId":null,"type":"newClient","size":120,"payload":"{\"type\":\"newClient\",\"roomId\":\"DOC123\",\"user\":{\"id\":\"user1\",\"name\":\"User 1\"}}"}
{"ts":"2026-02-06T16:30:01.010Z","level":"debug","event":"ws.userInfo.attached","clientId":"client_1_1704547800123","roomId":null,"userInfo":{"id":"user1","name":"User 1"}}
{"ts":"2026-02-06T16:30:01.020Z","level":"debug","event":"ws.message.handle","clientId":"client_1_1704547800123","roomId":null,"type":"newClient"}
{"ts":"2026-02-06T16:30:01.030Z","level":"info","event":"room.join","clientId":"client_1_1704547800123","roomId":"DOC123","oldRoomId":null,"userInfo":{"id":"user1","name":"User 1"}}
{"ts":"2026-02-06T16:30:01.040Z","level":"info","event":"room.join.completed","clientId":"client_1_1704547800123","roomId":"DOC123","isNewRoom":true,"roomSizeBefore":0,"roomSizeAfter":1,"totalRooms":1}
{"ts":"2026-02-06T16:30:02.000Z","level":"debug","event":"ws.message.received","clientId":"client_1_1704547800123","roomId":"DOC123","type":"broadcast","size":156}
{"ts":"2026-02-06T16:30:02.010Z","level":"debug","event":"ws.message.handle","clientId":"client_1_1704547800123","roomId":"DOC123","type":"broadcast"}
{"ts":"2026-02-06T16:30:02.020Z","level":"debug","event":"ws.message.relay","clientId":"client_1_1704547800123","roomId":"DOC123","type":"broadcast"}
{"ts":"2026-02-06T16:30:02.030Z","level":"info","event":"room.broadcast","roomId":"DOC123","excludeClientId":"client_1_1704547800123","totalClients":2,"sentCount":1,"skippedCount":1,"skippedReasons":{"excluded":1,"notOpen":1,"error":0},"payloadSize":156}
{"ts":"2026-02-06T16:30:02.040Z","level":"info","event":"room.broadcast.cleaned","roomId":"DOC123","cleanedCount":1}
{"ts":"2026-02-06T16:30:03.000Z","level":"info","event":"room.join","clientId":"client_1_1704547800123","roomId":"DOC456","oldRoomId":"DOC123","userInfo":{"id":"user1","name":"User 1"}}
{"ts":"2026-02-06T16:30:03.010Z","level":"info","event":"room.move","clientId":"client_1_1704547800123","fromRoomId":"DOC123","toRoomId":"DOC456"}
{"ts":"2026-02-06T16:30:03.020Z","level":"info","event":"room.leave.completed","clientId":"client_1_1704547800123","roomId":"DOC123","roomSizeBefore":1,"roomSizeAfter":0,"roomDeleted":true,"totalRooms":0}
{"ts":"2026-02-06T16:30:03.030Z","level":"info","event":"room.deleted.empty","roomId":"DOC123"}
{"ts":"2026-02-06T16:30:10.000Z","level":"info","event":"ws.close","clientId":"client_1_1704547800123","roomId":"DOC456","code":1000,"reason":"normal","userInfo":{"id":"user1","name":"User 1"}}
{"ts":"2026-02-06T16:30:10.010Z","level":"info","event":"room.leave","clientId":"client_1_1704547800123","roomId":"DOC456","userInfo":{"id":"user1","name":"User 1"}}
{"ts":"2026-02-06T16:30:10.020Z","level":"info","event":"room.leave.completed","clientId":"client_1_1704547800123","roomId":"DOC456","roomSizeBefore":1,"roomSizeAfter":0,"roomDeleted":true,"totalRooms":0}
```

---

## 로그 필터링 및 검색

### IntelliJ에서 로그 검색

1. **특정 클라이언트 추적**:
   ```
   clientId:client_1_1704547800123
   ```

2. **특정 Room 추적**:
   ```
   roomId:DOC123
   ```

3. **에러만 보기**:
   ```
   "level":"error"
   ```

4. **특정 이벤트만 보기**:
   ```
   "event":"room.broadcast"
   ```

### 로그 레벨별 필터링

- **모든 로그**: `LOG_LEVEL=debug`
- **일반 정보만**: `LOG_LEVEL=info` (기본값)
- **경고 이상만**: `LOG_LEVEL=warn`
- **에러만**: `LOG_LEVEL=error`

### 페이로드 포함 여부

- **페이로드 포함**: `LOG_PAYLOAD=true` (개발 환경)
- **페이로드 제외**: `LOG_PAYLOAD=false` (프로덕션 환경, 기본값)

---

## 로그 분석 팁

### 1. 클라이언트 연결 추적

특정 클라이언트의 전체 생명주기를 추적하려면 `clientId`로 필터링:

```
"clientId":"client_1_1704547800123"
```

### 2. Room 활동 모니터링

특정 Room의 활동을 모니터링하려면 `roomId`로 필터링:

```
"roomId":"DOC123"
```

### 3. 브로드캐스트 성능 확인

`room.broadcast` 이벤트의 `sentCount`와 `skippedCount`를 확인하여 전송 성공률 파악

### 4. 에러 추적

`level:error` 또는 `level:warn`으로 필터링하여 문제 상황 파악

---

## 참고

- [로깅 설정 가이드](../LOGGING.md) - 로그 설정 방법
- [서버 README](../README.md) - 서버 전체 가이드

---

**마지막 업데이트**: 2026-02-06
