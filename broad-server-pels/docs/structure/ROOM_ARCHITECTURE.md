# Room 기반 다중 클라이언트 동기화 아키텍처

이 문서는 WebSocket 서버의 Room 기반 다중 클라이언트 동기화 설계와 구현을 설명합니다.

---

## 목차

1. [개요](#개요)
2. [Room 구조](#room-구조)
3. [클라이언트 타입 지원](#클라이언트-타입-지원)
4. [동작 흐름](#동작-흐름)
5. [개선 사항](#개선-사항)
6. [동시성 및 안전성](#동시성-및-안전성)
7. [제한 사항 및 고려사항](#제한-사항-및-고려사항)

---

## 개요

### 설계 목표

- **다중 클라이언트 지원**: 하나의 Room에 여러 클라이언트(Android, React 웹)가 동시 접속 가능
- **타입 무관성**: 클라이언트 타입에 관계없이 동일한 프로토콜 사용
- **실시간 동기화**: Room 내 모든 클라이언트에게 메시지 브로드캐스트
- **메모리 효율성**: 연결이 끊긴 클라이언트 자동 정리

### 핵심 개념

- **Room**: `roomId`(예: `DOC123`)를 기준으로 클라이언트를 그룹화
- **브로드캐스트**: Room 내 모든 클라이언트에게 메시지 전송 (송신자 제외)
- **자동 정리**: 연결이 끊긴 클라이언트를 Room에서 자동 제거

---

## Room 구조

### 데이터 구조

```javascript
// rooms.js
const rooms = new Map();  // Map<roomId, Set<WebSocket>>

// 예시:
// rooms = {
//   "DOC123": Set { ws1, ws2, ws3 },
//   "DOC456": Set { ws4, ws5 }
// }
```

### 특징

- **Map 구조**: `roomId`를 키로 사용하여 빠른 조회
- **Set 구조**: 각 Room은 `Set<WebSocket>`으로 클라이언트 저장
  - 중복 자동 방지 (같은 WebSocket이 두 번 추가되지 않음)
  - O(1) 조회 및 삭제 성능

### Room 생명주기

1. **생성**: 첫 클라이언트가 `newClient` 메시지로 Room 입장 시 자동 생성
2. **유지**: 클라이언트가 있는 동안 유지
3. **삭제**: 마지막 클라이언트가 퇴장하면 자동 삭제

---

## 클라이언트 타입 지원

### 지원 클라이언트

| 클라이언트 타입 | 플랫폼 | WebSocket 라이브러리 |
|----------------|--------|---------------------|
| **Android** | Kotlin/Android | OkHttp WebSocket |
| **React 웹** | TypeScript/React | 브라우저 WebSocket API |

### 프로토콜 통일성

모든 클라이언트는 **동일한 WebSocket 프로토콜**을 사용합니다:

```json
// newClient 메시지 (모든 클라이언트 공통)
{
  "type": "newClient",
  "roomId": "DOC123",
  "user": {
    "id": "user1",
    "name": "User 1"
  }
}

// broadcast 메시지 (모든 클라이언트 공통)
{
  "type": "broadcast",
  "roomId": "DOC123",
  "data": {
    "page": 2,
    "action": "movePage"
  }
}
```

### 서버 측 클라이언트 구분

서버는 클라이언트 타입을 구분하지 않습니다:
- 모든 클라이언트는 동일한 `WebSocket` 객체로 처리
- `clientId`로만 구분 (타입 정보 없음)
- User-Agent 헤더는 로깅용으로만 사용

---

## 동작 흐름

### 1. 클라이언트 연결 및 Room 입장

```
[Android Client A]                    [React Web Client B]
      |                                       |
      |  WebSocket 연결                       |  WebSocket 연결
      |-------------------------------------->|
      |<--------------------------------------|
      |                                       |
      |  newClient { roomId: "DOC123" }      |
      |-------------------------------------->|
      |                                       |
      |  [서버] joinRoom("DOC123", wsA)      |
      |  rooms.get("DOC123").add(wsA)        |
      |                                       |
      |  newClient { roomId: "DOC123" }      |
      |<--------------------------------------|
      |-------------------------------------->|
      |                                       |
      |  [서버] joinRoom("DOC123", wsB)      |
      |  rooms.get("DOC123").add(wsB)        |
      |                                       |
      |  Room "DOC123": { wsA, wsB }         |
```

**코드 위치**: `handlers.js` → `handleNewClient()`

### 2. 메시지 브로드캐스트

```
[Client A]                              [Client B]              [Client C]
    |                                       |                       |
    |  broadcast { roomId: "DOC123" }      |                       |
    |------------------------------------->|                       |
    |  [서버] broadcastToRoom("DOC123")    |                       |
    |    - excludeWs: wsA (송신자 제외)     |                       |
    |    - 전송 대상: { wsB, wsC }         |                       |
    |                                       |                       |
    |<-------------------------------------|                       |
    |                                       |<---------------------|
    |  메시지 수신                          |  메시지 수신          |
```

**코드 위치**: `rooms.js` → `broadcastToRoom()`

### 3. Room 이동 (개선 적용)

```
[Client A]
    |
    |  현재: Room "DOC123"
    |
    |  newClient { roomId: "DOC456" }
    |------------------------------------->|
    |  [서버] handleNewClient()            |
    |    - oldRoomId: "DOC123"             |
    |    - newRoomId: "DOC456"             |
    |    - leaveRoom("DOC123", wsA) ✅     |
    |    - joinRoom("DOC456", wsA) ✅      |
    |
    |  이제: Room "DOC456"
```

**개선 사항**: Room 이동 시 이전 Room에서 자동 제거

### 4. 연결 종료 및 정리

```
[Client A]                              [Client B]
    |                                       |
    |  연결 종료 (브라우저 닫기/네트워크 끊김)
    |------------------------------------->|
    |  [서버] ws.on('close')               |
    |    - onClose(wsA)                     |
    |    - leaveRoom("DOC123", wsA)         |
    |    - rooms.get("DOC123").delete(wsA)  |
    |
    |  Room "DOC123": { wsB } (wsA 제거됨)
```

**코드 위치**: `index.js` → `ws.on('close')` → `handlers.js` → `onClose()`

---

## 개선 사항

### 1. Room 이동 시 이전 Room에서 제거

#### 문제점

기존 코드는 클라이언트가 Room을 변경할 때 이전 Room에서 제거하지 않아 메모리 누수가 발생할 수 있었습니다.

#### 개선 내용

```javascript
// handlers.js - handleNewClient()
function handleNewClient(data, ws) {
  const rid = data?.roomId;
  const oldRoomId = ws.roomId;

  // ✅ Room 이동 시 이전 Room에서 제거
  if (oldRoomId && oldRoomId !== rid) {
    logger.info('room.move', {
      clientId: ws.clientId,
      fromRoomId: oldRoomId,
      toRoomId: rid,
    });
    leaveRoom(oldRoomId, ws);
  }

  ws.roomId = rid;
  joinRoom(rid, ws);
  broadcastToRoom(rid, JSON.stringify(data), ws);
}
```

#### 효과

- 메모리 누수 방지
- Room 크기 정확성 향상
- `clientList` 응답의 정확성 향상

---

### 2. 연결이 끊긴 클라이언트 자동 정리

#### 문제점

기존 코드는 `readyState !== 1`인 클라이언트를 전송에서만 제외하고 Set에 남겨두어 메모리 누수가 발생할 수 있었습니다.

#### 개선 내용

```javascript
// rooms.js - broadcastToRoom()
export function broadcastToRoom(roomId, message, excludeWs = null) {
  const set = rooms.get(roomId);
  const disconnectedClients = []; // 연결이 끊긴 클라이언트 추적

  for (const client of set) {
    if (client.readyState !== 1) {
      disconnectedClients.push(client); // 제거 대상 기록
      continue;
    }
    // ... 전송 로직
  }

  // ✅ 연결이 끊긴 클라이언트 정리
  if (disconnectedClients.length > 0) {
    for (const client of disconnectedClients) {
      set.delete(client);
    }
    
    // Room이 비어있으면 삭제
    if (set.size === 0) {
      rooms.delete(roomId);
    }
  }
}
```

#### 효과

- 메모리 누수 방지
- Room 크기 정확성 향상
- 불필요한 반복 제거로 성능 향상

---

## 동시성 및 안전성

### Node.js 단일 스레드 모델

- **이벤트 루프**: 모든 WebSocket 이벤트는 단일 스레드에서 순차 처리
- **동시성 안전성**: 기본적으로 race condition이 발생하지 않음
- **비동기 처리**: `client.send()`는 비동기이지만, Room 조작은 동기적으로 처리

### 안전성 보장

1. **Set 중복 방지**: 같은 WebSocket이 두 번 추가되지 않음
2. **연결 상태 체크**: `readyState === 1` (OPEN)인 클라이언트만 전송
3. **에러 처리**: 개별 클라이언트 전송 실패가 전체 브로드캐스트를 중단시키지 않음
4. **자동 정리**: 연결이 끊긴 클라이언트 자동 제거

---

## 제한 사항 및 고려사항

### 현재 제한 사항

1. **인메모리 저장소**: 서버 재시작 시 모든 Room 정보 손실
   - 해결책: Redis 등 외부 저장소 사용 고려 (향후 확장)

2. **단일 서버**: 여러 서버 인스턴스 간 Room 공유 불가
   - 해결책: Redis Pub/Sub 또는 메시지 큐 사용 (향후 확장)

3. **Room 크기 제한 없음**: 이론적으로 무제한 클라이언트 가능
   - 고려사항: 대량 클라이언트 시 성능 모니터링 필요

### 성능 고려사항

- **브로드캐스트 복잡도**: O(n) - n은 Room 내 클라이언트 수
- **Room 조회**: O(1) - Map 조회
- **클라이언트 추가/제거**: O(1) - Set 연산

### 확장성

현재 설계는 **수백 ~ 수천 개의 동시 연결**까지 안정적으로 처리 가능합니다. 더 큰 규모가 필요한 경우:

1. **로드 밸런싱**: 여러 서버 인스턴스로 분산
2. **Redis 기반 Room 관리**: 서버 간 Room 공유
3. **메시지 큐**: 대량 메시지 처리

---

## 검증 시나리오

### 시나리오 1: 다중 클라이언트 동시 접속

```
1. Android Client A → Room "DOC123" 입장
2. React Web Client B → Room "DOC123" 입장
3. Android Client C → Room "DOC123" 입장
4. Room "DOC123": { wsA, wsB, wsC }
5. Client A가 broadcast 전송
6. Client B, C가 메시지 수신 ✅
```

### 시나리오 2: Room 이동

```
1. Client A → Room "DOC123" 입장
2. Client A → Room "DOC456" 입장 (newClient 재전송)
3. Room "DOC123": {} (비어있음, 삭제됨) ✅
4. Room "DOC456": { wsA } ✅
```

### 시나리오 3: 연결 끊김 처리

```
1. Room "DOC123": { wsA, wsB, wsC }
2. Client B 연결 끊김 (네트워크 오류)
3. Client A가 broadcast 전송
4. broadcastToRoom() 실행 중 Client B의 readyState !== 1 감지
5. Client B를 Set에서 제거 ✅
6. Room "DOC123": { wsA, wsC } ✅
```

---

## 로그 예시

### Room 입장 (개선 후)

```json
{"ts":"2026-02-06T16:30:01.000Z","level":"info","event":"room.join","clientId":"client_1_123","roomId":"DOC456","oldRoomId":"DOC123","userInfo":{"id":"user1"}}
{"ts":"2026-02-06T16:30:01.010Z","level":"info","event":"room.move","clientId":"client_1_123","fromRoomId":"DOC123","toRoomId":"DOC456"}
{"ts":"2026-02-06T16:30:01.020Z","level":"info","event":"room.leave.completed","clientId":"client_1_123","roomId":"DOC123","roomSizeBefore":2,"roomSizeAfter":1,"roomDeleted":false}
{"ts":"2026-02-06T16:30:01.030Z","level":"info","event":"room.join.completed","clientId":"client_1_123","roomId":"DOC456","isNewRoom":true,"roomSizeBefore":0,"roomSizeAfter":1}
```

### 브로드캐스트 및 정리 (개선 후)

```json
{"ts":"2026-02-06T16:30:02.000Z","level":"info","event":"room.broadcast","roomId":"DOC123","totalClients":3,"sentCount":1,"skippedCount":2,"skippedReasons":{"excluded":1,"notOpen":1,"error":0}}
{"ts":"2026-02-06T16:30:02.010Z","level":"info","event":"room.broadcast.cleaned","roomId":"DOC123","cleanedCount":1}
{"ts":"2026-02-06T16:30:02.020Z","level":"info","event":"room.broadcast","roomId":"DOC123","totalClients":2,"sentCount":1,"skippedCount":1,"skippedReasons":{"excluded":1,"notOpen":0,"error":0}}
```

---

## 결론

현재 Room 방식은 **다중 클라이언트(Android, React 웹) 지원**이 올바르게 구현되어 있으며, 개선 사항 적용으로 다음과 같은 이점을 얻었습니다:

✅ **메모리 효율성**: Room 이동 및 연결 끊김 시 자동 정리  
✅ **정확성**: Room 크기 및 클라이언트 목록 정확성 향상  
✅ **안정성**: 연결이 끊긴 클라이언트 자동 제거  
✅ **확장성**: 수백 ~ 수천 개의 동시 연결 처리 가능

---

## 참고 문서

- [로그 형식 가이드](../logs/LOG_FORMAT.md) - Room 관련 로그 상세
- [서버 README](../README.md) - 서버 전체 가이드
- [아키텍처 가이드](../ARCHITECTURE.md) - 전체 시스템 아키텍처

---

**마지막 업데이트**: 2026-02-06  
**개선 사항 적용**: Room 이동 시 이전 Room 제거, 연결 끊김 클라이언트 자동 정리
