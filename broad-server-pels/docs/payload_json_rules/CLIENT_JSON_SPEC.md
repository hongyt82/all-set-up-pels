# 클라이언트 → 서버 JSON 전송 규격 및 유의사항

Android·React 등 **클라이언트가 서버로 보내는 WebSocket 메시지**의 규격과, 꼭 지켜야 할 점을 정리한 문서입니다.

---

## 목차

1. [실제 JSON 전송 형태 (필수)](#1-실제-json-전송-형태-필수) ★
2. [공통 규칙](#2-공통-규칙)
3. [타입별 메시지 규격](#3-타입별-메시지-규격)
4. [유의사항 요약](#4-유의사항-요약)
5. [참고 문서](#5-참고-문서)

---

## 1. 실제 JSON 전송 형태 (필수) ★

클라이언트(Android, React 등)는 서버로 **반드시 아래 형태**로만 보내야 합니다.

### 1.1 보내는 것은 “문자열”만 가능하다

- WebSocket의 `send()`에는 **문자열**(또는 바이너리)만 넣을 수 있습니다.
- **JSON 객체를 그대로 보내면 안 됩니다.** 객체를 **JSON 문자열로 직렬화한 결과**를 보내야 서버가 `JSON.parse()`로 해석할 수 있습니다.

| 플랫폼 | 올바른 방법 | 잘못된 방법 |
|--------|--------------|-------------|
| **JavaScript/React** | `ws.send(JSON.stringify({ type: "newClient", roomId: "DOC123" }))` | ~~`ws.send({ type: "newClient", roomId: "DOC123" })`~~ (객체는 문자열이 아님) |
| **Kotlin/Android** | `val json = Json.encodeToString(obj)` 후 `webSocket.send(json)` 또는 `org.json.JSONObject`로 만든 뒤 `obj.toString()` 후 send | ~~직렬화 없이 객체를 send에 넘김~~ |

### 1.2 서버가 받는 “실제 형태”

서버는 **한 줄의 JSON 문자열**을 받습니다. 아래는 **실제로 전송되는 문자열 예시**입니다 (따옴표 이스케이프 포함된 하나의 문자열).

**newClient 전송 시, wire 상에서 가는 형태 예:**

```
{"type":"newClient","roomId":"DOC123","user":{"id":"user1","name":"User 1"}}
```

**broadcast(movePage) 전송 시:**

```
{"type":"broadcast","value":{"event":"movePage","page":2}}
```

**clientList 요청 시:**

```
{"type":"clientList"}
```

- 위와 같이 **유효한 JSON 한 덩어리**가 되어야 합니다. 줄바꿈·앞뒤 공백은 허용되지만, **구문 오류**(쉼표 누락, 따옴표 불일치 등)가 있으면 서버가 파싱 실패로 **해당 메시지를 버립니다**.

### 1.3 타입별 “이렇게 보내야 한다” 최소 형태

아래는 **반드시 포함해야 할 필드만** 넣은, 전송 시 참고할 JSON **객체** 예시입니다.  
실제 전송 시에는 이 객체를 **JSON 문자열로 변환**한 뒤 `send()` 해야 합니다.

| type | 보내야 할 JSON 객체 (직렬화 후 전송) |
|------|--------------------------------------|
| **newClient** | `{ "type": "newClient", "roomId": "DOC123" }` ← roomId 필수. user, clientKey는 선택. |
| **chat** | `{ "type": "chat", "value": { "text": "메시지" } }` (value 구조는 협약) |
| **broadcast (movePage)** | `{ "type": "broadcast", "value": { "event": "movePage", "page": 2 } }` |
| **broadcast (setForm)** | `{ "type": "broadcast", "value": { "event": "setForm", "formId": "id", "page": 1, "value": "입력값" } }` |
| **broadcastAll** | `{ "type": "broadcastAll", "value": { ... } }` |
| **request / response** | `{ "type": "request", ... }` / `{ "type": "response", ... }` |
| **clientList** | `{ "type": "clientList" }` |
| **특정 1명에게만** | 위 아무 타입에 `"targetClientId": "client_2_1234567890"` 추가 |

### 1.4 코드 예시 (직렬화 → 전송)

**JavaScript (React 등)**

```javascript
// ✅ 올바른 예: 객체를 JSON 문자열로 만든 뒤 전송
const msg = { type: "newClient", roomId: "DOC123", user: { id: "u1", name: "User" } };
webSocket.send(JSON.stringify(msg));
```

**Kotlin (Android)**

```kotlin
// ✅ 올바른 예: JSON 문자열로 직렬화한 뒤 전송
val msg = buildMap<String, Any?> {
    put("type", "newClient")
    put("roomId", "DOC123")
    put("user", mapOf("id" to "u1", "name" to "User"))
}
val jsonString = Json.encodeToString(msg)  // 또는 JSONObject(msg).toString()
webSocket.send(Frame.Text(jsonString))
```

- **공통**: 최종적으로 `send()`에 들어가는 값은 **문자열**이며, 그 문자열을 `JSON.parse()` 하면 위와 같은 **객체**가 나와야 합니다.

---

## 2. 공통 규칙

### 2.1 전송 형식

- **반드시 JSON 문자열**로 전송합니다. (객체를 `JSON.stringify()` 등으로 직렬화한 뒤 `send()`)
- **UTF-8** 인코딩을 사용합니다.
- 서버는 수신한 문자열을 `JSON.parse()` 하며, **파싱 실패 시 해당 메시지는 무시**되고 로그만 남습니다. (연결은 유지)

### 2.2 필수 필드 (모든 메시지)

| 필드 | 타입 | 설명 |
|------|------|------|
| **type** | string | 메시지 종류. 없으면 서버가 **처리하지 않고** 로그만 남김. |

### 2.3 메시지 크기 제한

- 서버 설정값 **maxMessageSize**(기본 **1MB** = 1048576 바이트)를 초과하면 **연결이 1009 코드로 종료**됩니다.
- 개발 환경(.env.dev)에서는 5MB 등 더 큰 값이 설정될 수 있으나, **프로덕션에서는 1MB 기준**으로 설계하는 것이 안전합니다.

### 2.4 Room이 필요한 메시지

- `chat`, `broadcast`, `broadcastAll`, `request`, `response`, `clientList` 는 **이미 입장한 Room**이 있어야 합니다.
- **newClient를 보내기 전**에 위 타입을 보내면 서버가 `ws.roomId`가 없어 **릴레이/응답하지 않고** 경고 로그만 남깁니다.
- **순서**: 연결 → **newClient**(roomId 포함) 전송 → 이후 다른 타입 전송.

---

## 3. 타입별 메시지 규격

### 3.1 newClient (Room 입장)

**용도**: 특정 Room에 입장(또는 Room 변경). 서버가 `clientId`를 붙여 Room 내 다른 클라이언트에게 알립니다.

| 필드 | 필수 | 타입 | 설명 |
|------|------|------|------|
| type | ✅ | string | `"newClient"` |
| roomId | ✅ | string | 입장할 Room ID (예: `"DOC123"`) |
| user | | object | clientList·표시용 사용자 정보 (서버는 그대로 보관·전달) |
| clientKey | | string | 동일 기기 식별자. **같은 Room에 동일 clientKey가 이미 있으면 새 연결은 4000 코드로 거부**됨 |

**예시**

```json
{
  "type": "newClient",
  "roomId": "DOC123",
  "user": { "id": "user1", "name": "User 1" },
  "clientKey": "device-uuid-xxx"
}
```

**유의**
- `roomId`를 빼면 서버가 입장 처리하지 않고 경고 로그만 남깁니다.
- 한 기기에서 같은 Room에 **한 연결만** 허용하려면 `clientKey`를 넣고, 재연결 시 같은 값을 쓰면 이전 연결이 살아 있을 때 4000으로 거부됩니다.

---

### 3.2 chat (채팅)

**용도**: Room 내 채팅 메시지 릴레이. `targetClientId`가 있으면 해당 1명에게만 전송.

| 필드 | 필수 | 타입 | 설명 |
|------|------|------|------|
| type | ✅ | string | `"chat"` |
| targetClientId | | string | 넣으면 이 clientId 1명에게만 전송, 없으면 Room 전체 브로드캐스트 |
| value / message / 기타 | | any | 내용은 클라이언트 협약. 서버는 그대로 릴레이 |

**유의**
- **Room 입장(newClient) 후**에 보내야 합니다. roomId는 서버가 `ws.roomId`로 알고 있어 별도 필드 불필요합니다.

---

### 3.3 broadcast (이벤트 브로드캐스트)

**용도**: 페이지 이동·폼 입력 등 이벤트를 Room 내에 전파. **movePage / setForm** 이벤트는 서버가 Room 상태로 저장해, 나중에 입장한 클라이언트에게 `roomState`로 전달합니다.

| 필드 | 필수 | 타입 | 설명 |
|------|------|------|------|
| type | ✅ | string | `"broadcast"` |
| targetClientId | | string | 넣으면 해당 1명에게만 전송 |
| value | | object | 이벤트 payload. 서버는 그대로 릴레이. **Room 상태 저장을 위해** 아래 규칙 권장 |

**Room 상태 저장 시 서버가 보는 value 구조**

- **movePage**: `value.event === "movePage"`, `value.page` (숫자). 없거나 NaN이면 저장 생략.
- **setForm**: `value.event === "setForm"`, `value.formId` (필수), `value.value`, `value.page` (없으면 1), `value.type`(컨트롤 타입, 선택). `formId` 없으면 저장 생략.

**예시 (movePage)**

```json
{
  "type": "broadcast",
  "value": {
    "event": "movePage",
    "page": 2
  }
}
```

**예시 (setForm)**

```json
{
  "type": "broadcast",
  "value": {
    "event": "setForm",
    "formId": "field1",
    "page": 1,
    "value": "입력값",
    "type": "text"
  }
}
```

**유의**
- `value`를 생략해도 릴레이는 되지만, **movePage/setForm**으로 신규 입장자 동기화를 쓰려면 위와 같은 `value.event`·`value.page`·`value.formId` 등 구조를 맞추는 것이 좋습니다.
- 서버는 `value` 전체를 `roomState`의 setForm 항목에 `raw`로 보관해, 신규 입장자에게 그대로 넘깁니다 (예: drawingPath 등 추가 필드 포함).

---

### 3.4 broadcastAll

**용도**: Room 전체 브로드캐스트. 규격은 broadcast와 동일하게 `type: "broadcastAll"` + `value` 등. 서버는 **Room 상태 저장을 하지 않고** 릴레이만 합니다. (movePage/setForm이어도 broadcastAll은 저장 대상 아님)

---

### 3.5 request / response

**용도**: 데이터 요청·응답 릴레이. 서버는 내용을 해석하지 않고 Room 내에 그대로 전달합니다.

| 필드 | 필수 | 타입 | 설명 |
|------|------|------|------|
| type | ✅ | string | `"request"` 또는 `"response"` |
| targetClientId | | string | 넣으면 해당 1명에게만 전송 |
| 기타 | | any | 요청/응답 payload. 서버는 그대로 릴레이 |

---

### 3.6 clientList (참가자 목록 요청)

**용도**: 현재 Room 참가자 목록을 **요청한 클라이언트 1명에게만** 응답합니다.

| 필드 | 필수 | 타입 | 설명 |
|------|------|------|------|
| type | ✅ | string | `"clientList"` |

**예시**

```json
{ "type": "clientList" }
```

**유의**
- **newClient 시 `user`를 보내 둔** 클라이언트만 응답의 `users` 배열에 포함됩니다. 서버는 `ws.userInfo`를 그대로 넘깁니다.
- roomId는 서버가 `ws.roomId`로 알고 있어 별도로 보낼 필요 없습니다.

---

### 3.7 그 외 타입

- 서버에 정의되지 않은 `type`(예: 커스텀 이벤트)도 **그대로 릴레이**됩니다.
- `type`만 있으면 되며, **Room에 입장한 뒤** 보내면 relayToRoom으로 Room 전체(또는 targetClientId 1명)에게 전달됩니다.
- `type`이 없으면 서버가 **처리하지 않고** 로그만 남깁니다.

---

## 4. 유의사항 요약

| 항목 | 내용 |
|------|------|
| **JSON 형식** | 반드시 유효한 JSON 문자열. 파싱 실패 시 메시지만 무시되고 로그만 남음. |
| **type 필수** | 모든 메시지에 `type` 포함. 없으면 처리 안 함. |
| **전송 순서** | 연결 후 **먼저 newClient**(roomId 포함) 전송 → 이후 chat/broadcast/clientList 등 사용. |
| **newClient roomId** | `roomId` 없으면 입장 처리 안 함. |
| **clientKey 중복** | 같은 Room에 동일 `clientKey`가 이미 있으면 새 연결 **4000**으로 거부. |
| **메시지 크기** | 프로덕션 기본 **1MB** 초과 시 연결 **1009**로 종료. |
| **Room 필요** | chat/broadcast/clientList 등은 **이미 Room 입장 후**에만 유효. |
| **targetClientId** | 문자열로 **서버가 부여한 clientId** 지정. 해당 1명에게만 전송. (newClient 브로드캐스트로 알 수 있음) |
| **broadcast + roomState** | movePage/setForm으로 신규 입장자 동기화를 쓰려면 `value.event`, `value.page`, setForm 시 `value.formId` 등 서버 규격에 맞추기. |

---

## 5. 참고 문서

- [메시지_유형별_처리_및_특정클라이언트_전송.md](../message_type/메시지_유형별_처리_및_특정클라이언트_전송.md) — 타입별 처리 상세, roomState·clientLeft
- [ARCHITECTURE.md](ARCHITECTURE.md) — 서버 아키텍처·실행 흐름
- [LOG_FORMAT.md](LOG_FORMAT.md) — 서버 로그 필드 (디버깅 시 참고)
