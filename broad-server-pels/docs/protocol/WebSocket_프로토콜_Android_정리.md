# WebSocket 프로토콜 정리 (서버 ↔ 안드로이드 클라이언트)

## 1. 공통 규칙

### 1.1 전송 형식

- **텍스트 메시지(JSON)** 만 사용.
- 최상위 공통 필드:

| 필드 | 타입 | 설명 |
|------|------|------|
| `roomId` | string | Room 식별자. 예: `"DOC{doc_id}"` |
| `type` | string | 메시지 타입. 예: `newClient`, `chat`, `broadcast`, `clientList`, `roomState` |
| `value` | object? | `chat`, `broadcast` 계열에서 실제 payload |
| `targetClientId` | string? | 지정 시, 해당 `clientId` 한 명에게만 전송 (없으면 Room 전체 릴레이) |

### 1.2 clientId / clientKey / userInfo

- `clientId`: 서버가 WebSocket 연결마다 부여하는 ID. 예: `"client_1_1770884971227"`.
- `clientKey`: 같은 기기(클라이언트 앱)를 구분하기 위한 키. `newClient` 전송 시 클라이언트가 포함.
- `userInfo` / `user`: DO 사용자 정보:

```json
{
  "USER_ID": "DO_DUMMY_1e574d7b",
  "USER_NAME": "홍길동",
  "DEPT_NM": "OOO 부서"
}
```

---

## 2. 클라이언트 → 서버 메시지

### 2.1 Room 입장: `newClient`

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "newClient",
  "clientKey": "some-device-key-123",
  "user": {
    "USER_ID": "DO_DUMMY_1e574d7b",
    "USER_NAME": "홍길동",
    "DEPT_NM": "OOO 부서"
  }
}
```

- 서버 처리(`handleNewClient`):
  - `joinRoom(roomId, ws)` → 해당 Room에 WebSocket 추가.
  - 동일 Room에 같은 `clientKey` 가진 다른 클라이언트가 있으면 `4000` 코드로 새 연결 거절.
  - 입장한 클라이언트(`ws`)에게 **roomState**(있으면) 1회 전송.
  - 기존 클라이언트들에게 `newClient` 브로드캐스트.

---

### 2.2 페이지 이동 브로드캐스트: `broadcast movePage`

안드로이드에서 `DOWebSocketMessageBuilder.buildBroadcastMovePage` 로 생성.

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "broadcast",
  "value": {
    "event": "movePage",
    "page": "37"
  }
}
```

- 서버 처리:
  - `relayToRoom` → 같은 Room의 다른 클라이언트에게 릴레이.
  - `updateRoomState(roomId, data)` 에서 `lastPage = Number(value.page)` 로 저장 (roomState 용).

---

### 2.3 컨트롤 값 브로드캐스트: `broadcast setForm`

안드로이드: `buildBroadcastSetForm`.

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "broadcast",
  "value": {
    "event": "setForm",
    "formId": "30000",
    "value": "{\"paths\":[...]}",
    "page": 8,
    "type": "drawing"
  }
}
```

- 필드:
  - `formId`: 컨트롤 ID (checkbox, textbox, drawing 등).
  - `value`: 문자열 값 (텍스트, O/X, drawing path JSON 등).
  - `page`: 컨트롤이 위치한 페이지 번호 (1-based).
  - `type`: 컨트롤 타입 구분 (예: `"checkbox"`, `"text"`, `"calendar"`, `"drawing"`).

- 서버 처리:
  - `relayToRoom` → 같은 Room에 브로드캐스트.
  - `updateRoomState(roomId, data)`:
    - `key = formId_page`.
    - `formValuesByKey[key] = { formId, page, value, type, raw: data.value }`.

---

### 2.4 채팅: `chat`

안드로이드: `buildChat`.

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "chat",
  "value": {
    "senderDept": "OOO 부서",
    "senderId": "DO_DUMMY_1e574d7b",
    "senderName": "홍길동",
    "message": "안녕하세요<br>두 줄입니다",
    "createdAt": "2026-02-12T08:15:30.000Z"
  }
}
```

- `message` 내 개행은 `<br>` 로 치환해서 전송.
- 서버 처리:
  - `relayToRoom` → Room 내 다른 클라이언트에게 릴레이.
  - `targetClientId` 가 있으면 해당 `clientId` 한 명에게만 전송.

---

### 2.5 Room 상태 요청: `request`

안드로이드: `buildRequest`.

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "request"
}
```

- 현재 구현에서는 `relayToRoom` 를 통해 Room 내 다른 클라이언트에게 전달하는 형태.
- (사용처에 따라 응답/처리 로직은 클라이언트에서 구현.)

---

### 2.6 참여자 목록 요청: `clientList`

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "clientList"
}
```

- 서버 처리:
  - `sendClientList(roomId, ws)` 호출.
  - `room.clientList.response` 로그 + 해당 클라이언트에게만 `clientList` 응답 전송.

---

## 3. 서버 → 클라이언트 메시지

### 3.1 Room 참가자 목록 응답: `clientList`

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "clientList",
  "users": [
    {
      "USER_ID": "DO_DUMMY_1e574d7b",
      "USER_NAME": "홍길동",
      "DEPT_NM": "OOO 부서"
    },
    {
      "USER_ID": "DO_DUMMY_2ab34c",
      "USER_NAME": "이몽룡",
      "DEPT_NM": "YYY 부서"
    }
  ]
}
```

- 송신 대상: **요청한 클라이언트 한 명**.
- 서버 로그 예:
  - `event: "room.clientList.response", totalClients, activeClients, userCount, payload.users[]`

---

### 3.2 신규 입장 알림: `newClient` (서버 → Room 내 다른 클라이언트)

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "newClient",
  "clientKey": "some-device-key-123",
  "clientId": "client_2_1770885275841",
  "user": {
    "USER_ID": "DO_DUMMY_2ab34c",
    "USER_NAME": "이몽룡",
    "DEPT_NM": "YYY 부서"
  }
}
```

- 대상: **해당 Room의 기존 참가자들** (새로 들어온 ws 제외).
- 용도: 채팅/참여자 목록 UI 갱신.

---

### 3.3 퇴장 알림: `clientLeft`

```json
{
  "type": "clientLeft",
  "clientId": "client_1_1770884971227",
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "userInfo": {
    "USER_ID": "DO_DUMMY_1e574d7b",
    "USER_NAME": "홍길동",
    "DEPT_NM": "OOO 부서"
  },
  "timestamp": 1730085293997
}
```

- 대상: Room 내 나머지 클라이언트.
- 용도: 퇴장 히스토리 / UI 업데이트.

---

### 3.4 Room 상태 동기화: `roomState` (신규 입장자 한 명에게만)

```json
{
  "type": "roomState",
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "lastPage": 37,
  "formValues": [
    { "formId": "ctrl_1", "page": 1, "value": "y" },
    {
      "formId": "30000",
      "page": 8,
      "value": "{\"paths\":[...]}",
      "type": "drawing",
      "raw": {
        "event": "setForm",
        "formId": "30000",
        "value": "{\"paths\":[...]}",
        "page": 8,
        "type": "drawing"
      }
    }
  ]
}
```

- **수신 대상**: 해당 Room에 **막 입장한 클라이언트 1명**.
- 의미:
  - `lastPage`:
    - 기존 참가자가 마지막으로 `movePage` 한 페이지 (1-based).
    - 신규 입장자는 이 페이지로 `syncJumpToPage(lastPage)` 호출.
  - `formValues`:
    - (formId, page) 별로 마지막 `setForm` 값.
    - 각 컨트롤 타입별 값을 `syncSetControlValue(formId, page, value, type, raw)` 로 적용.

---

### 3.5 채팅/브로드캐스트 릴레이

클라이언트에서 보낸 `chat`, `broadcast`, `broadcastAll`, `request`, `response` 등은 서버에서 **내용을 거의 그대로** Room 내 다른 클라이언트에게 릴레이합니다.

예: `chat` 릴레이

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "chat",
  "value": {
    "senderDept": "OOO 부서",
    "senderId": "DO_DUMMY_1e574d7b",
    "senderName": "홍길동",
    "message": "안녕하세요<br>두 줄입니다",
    "createdAt": "2026-02-12T08:15:30.000Z"
  }
}
```

---

## 4. targetClientId 를 이용한 단일 클라이언트 전송

### 4.1 개념

- `targetClientId` 필드를 추가하면, 서버는 Room 브로드캐스트 대신 해당 `clientId` 한 명에게만 전송합니다.

### 4.2 예시

특정 사용자에게만 채팅 보내기:

```json
{
  "roomId": "DOC3dfbd58b-b7b3-4607-8bdb-468999f888b2",
  "type": "chat",
  "targetClientId": "client_2_1770885275841",
  "value": {
    "senderDept": "OOO 부서",
    "senderId": "DO_DUMMY_1e574d7b",
    "senderName": "홍길동",
    "message": "이 메시지는 당신에게만 보입니다",
    "createdAt": "2026-02-12T08:20:00.000Z"
  }
}
```

- 서버 `relayToRoom` 동작:
  - `targetClientId` 있음 → `sendToClient(targetClientId, data)` 호출.
  - 없음 → `broadcastToRoom(roomId, data, ws)` 로 Room 전체 브로드캐스트.

---

## 5. 요약

- **클라이언트 → 서버**
  - `newClient`, `chat`, `broadcast(movePage/setForm)`, `request`, `clientList`, (+ optional `targetClientId`).
- **서버 → 클라이언트**
  - Room 관리: `newClient`, `clientLeft`, `clientList`, `roomState`.
  - 릴레이: `chat`, `broadcast`, `broadcastAll`, `request`, `response` (내용 거의 그대로).
- **roomState**
  - 신규 입장자 1명에게만 전달되는 Room 최종 동기화 상태 (`lastPage`, `formValues`).
- **movePage / setForm**
  - Room 실시간 동기화 + roomState 저장의 기반 이벤트.

이 문서를 기준으로 서버와 안드로이드 클라이언트 사이의 WebSocket 메시지 규격을 통합해서 관리할 수 있습니다.

