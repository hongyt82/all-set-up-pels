# WebSocket 프로토콜 정리 – React 클라이언트용

이 문서는 **서버 ↔ React Web 클라이언트** 간 WebSocket 프로토콜을 정리합니다.  
JSON 포맷과 의미는 안드로이드 클라이언트와 동일하며, React 환경에서 사용할 수 있도록 **타입/예시 코드 중심**으로 설명합니다.

> ⚠️ 서버 기준 프로토콜 정의 문서: `DO_WebSocket_프로토콜_정리.md` 를 반드시 선행해서 참고하세요.  
> 여기서는 그 내용을 React에서 어떻게 소비/전송할지에 초점을 맞춥니다.

---

## 1. 공통 타입 정의 (TypeScript 예시)

```ts
export type WsMessageType =
  | 'newClient'
  | 'chat'
  | 'broadcast'
  | 'broadcastAll'
  | 'request'
  | 'response'
  | 'clientList'
  | 'roomState'
  | 'clientLeft';

export interface WsBaseMessage {
  roomId?: string;
  type: WsMessageType;
  // 릴레이/일부 타입에서만 사용
  value?: any;
  // 특정 클라이언트에게만 전송하고 싶을 때
  targetClientId?: string;
}

export interface WsUserInfo {
  USER_ID: string;
  USER_NAME: string;
  DEPT_NM: string;
}
```

---

## 2. 클라이언트 → 서버 메시지 (React)

### 2.1 Room 입장: `newClient`

```ts
export interface NewClientMessage extends WsBaseMessage {
  type: 'newClient';
  roomId: string;
  clientKey: string;
  user: WsUserInfo;
}

// 예시 전송
ws.send(
  JSON.stringify({
    roomId: `DOC${docId}`,
    type: 'newClient',
    clientKey: deviceKey,    // 로컬스토리지/쿠키 등에 저장된 식별자
    user: {
      USER_ID: currentUser.id,
      USER_NAME: currentUser.name,
      DEPT_NM: currentUser.dept,
    },
  } satisfies NewClientMessage),
);
```

---

### 2.2 페이지 이동 브로드캐스트: `broadcast movePage`

```ts
export interface MovePageValue {
  event: 'movePage';
  // 1-based 페이지 번호
  page: string; // 서버/안드로이드 규격에 맞추어 문자열 사용
}

export interface MovePageBroadcast extends WsBaseMessage {
  type: 'broadcast';
  roomId: string;
  value: MovePageValue;
}

// 현재 페이지 변경 시 전송 (루프 방지를 위한 guard는 클라이언트에서 추가)
function sendMovePage(ws: WebSocket, roomId: string, page: number) {
  const msg: MovePageBroadcast = {
    roomId,
    type: 'broadcast',
    value: {
      event: 'movePage',
      page: String(page), // 1-based
    },
  };
  ws.send(JSON.stringify(msg));
}
```

---

### 2.3 컨트롤 값 브로드캐스트: `broadcast setForm`

```ts
export type ControlType =
  | 'checkbox'
  | 'text'
  | 'calendar'
  | 'drawing'
  | string; // 확장용

export interface SetFormValue {
  event: 'setForm';
  formId: string;
  value: string;   // 텍스트, O/X, JSON 직렬화된 drawing 등
  page: number;    // 1-based 페이지 번호
  type?: ControlType;
}

export interface SetFormBroadcast extends WsBaseMessage {
  type: 'broadcast';
  roomId: string;
  value: SetFormValue;
}

function sendSetForm(
  ws: WebSocket,
  roomId: string,
  payload: SetFormValue,
) {
  const msg: SetFormBroadcast = {
    roomId,
    type: 'broadcast',
    value: payload,
  };
  ws.send(JSON.stringify(msg));
}
```

**예시 – drawing 컨트롤**:

```ts
const drawingPayload: SetFormValue = {
  event: 'setForm',
  formId: '30000',
  value: JSON.stringify({ paths: pathDataList }), // PathData 배열 등
  page: 8,
  type: 'drawing',
};
sendSetForm(ws, roomId, drawingPayload);
```

---

### 2.4 채팅: `chat`

```ts
export interface ChatValue {
  senderDept: string | null;
  senderId: string | null;
  senderName: string | null;
  message: string;    // \n 대신 <br> 사용
  createdAt: string;  // ISO8601 문자열
}

export interface ChatMessage extends WsBaseMessage {
  type: 'chat';
  roomId: string;
  value: ChatValue;
  targetClientId?: string; // 선택: 특정 clientId에게만 전송할 때
}

function sendChat(
  ws: WebSocket,
  roomId: string,
  value: ChatValue,
  targetClientId?: string,
) {
  const msg: ChatMessage = {
    roomId,
    type: 'chat',
    value,
    ...(targetClientId ? { targetClientId } : {}),
  };
  ws.send(JSON.stringify(msg));
}
```

---

### 2.5 Room 상태/참여자 목록 요청

```ts
// roomState/기타 요청
ws.send(JSON.stringify({ roomId, type: 'request' }));

// 참여자 목록 요청
ws.send(JSON.stringify({ roomId, type: 'clientList' }));
```

---

## 3. 서버 → React 클라이언트 메시지 파싱

React 쪽에서는 수신 메시지의 `type` 으로 분기합니다.

```ts
ws.onmessage = (event) => {
  let data: WsBaseMessage;
  try {
    data = JSON.parse(event.data);
  } catch {
    console.warn('Invalid JSON from server', event.data);
    return;
  }

  switch (data.type) {
    case 'roomState':
      handleRoomStateMessage(data as RoomStateMessage);
      break;
    case 'clientList':
      handleClientListMessage(data as ClientListMessage);
      break;
    case 'newClient':
      handleNewClientMessage(data as NewClientServerMessage);
      break;
    case 'clientLeft':
      handleClientLeftMessage(data as ClientLeftMessage);
      break;
    case 'chat':
      handleChatMessage(data as ChatMessage);
      break;
    case 'broadcast':
    case 'broadcastAll':
      handleBroadcastMessage(data as BroadcastMessage);
      break;
    default:
      console.debug('Unhandled ws message', data);
  }
};
```

아래는 주요 서버 → 클라이언트 메시지 타입 정의 예시입니다.

### 3.1 Room 상태 동기화: `roomState`

```ts
export interface RoomStateFormValue {
  formId: string;
  page: number;
  value: string;
  type?: ControlType | null;
  raw?: any; // 서버 roomState.js 의 data.value 전체
}

export interface RoomStateMessage extends WsBaseMessage {
  type: 'roomState';
  roomId: string;
  lastPage?: number;
  formValues: RoomStateFormValue[];
}

function handleRoomStateMessage(msg: RoomStateMessage) {
  const { lastPage, formValues } = msg;

  // 1) lastPage가 있다면 화면 이동
  if (lastPage && lastPage > 0) {
    // 예: React PDF 뷰어에 1-based 페이지로 점프
    pdfViewerRef.current?.jumpToPage(lastPage);
  }

  // 2) formValues 적용
  for (const fv of formValues) {
    applyControlValue({
      formId: fv.formId,
      page: fv.page,
      value: fv.value,
      type: fv.type ?? undefined,
      raw: fv.raw,
    });
  }
}
```

---

### 3.2 클라이언트 리스트 응답: `clientList`

```ts
export interface ClientListMessage extends WsBaseMessage {
  type: 'clientList';
  roomId: string;
  users: WsUserInfo[];
}

function handleClientListMessage(msg: ClientListMessage) {
  setClientList(msg.users);
}
```

---

### 3.3 신규 입장 / 퇴장 알림

```ts
export interface NewClientServerMessage extends WsBaseMessage {
  type: 'newClient';
  roomId: string;
  clientKey?: string | null;
  clientId: string;
  user: WsUserInfo | null;
}

export interface ClientLeftMessage extends WsBaseMessage {
  type: 'clientLeft';
  clientId: string;
  roomId: string;
  userInfo: WsUserInfo | null;
  timestamp: number;
}
```

이 두 메시지는 **참여자 목록/히스토리 UI** 업데이트 용도로 사용합니다.

---

### 3.4 채팅 / 브로드캐스트 릴레이

서버는 클라이언트가 보낸 `chat` / `broadcast` / `broadcastAll` 을 **내용 거의 그대로** 릴레이합니다.  
React 클라이언트는 동일한 타입 정의(`ChatMessage`, `SetFormBroadcast`, `MovePageBroadcast`)를 사용해 파싱하면 됩니다.

---

## 4. targetClientId 사용 (React)

기존 안드로이드와 동일하게, React에서도 `targetClientId` 필드를 사용하여 특정 클라이언트에게만 메시지를 보낼 수 있습니다.

```ts
// 특정 clientId 에게만 채팅 보내기
sendChat(ws, roomId, chatValue, targetClientId);
```

서버 규칙:

- `data.targetClientId` 가 존재하면: `sendToClient(targetClientId, data)` → 해당 클라이언트 1명에게만 전송.
- 없으면: `broadcastToRoom(roomId, data, ws)` → Room 내 나머지 클라이언트 전체에 전송.

---

## 5. React 클라이언트 구현 시 권장 사항

1. **단일 타입 정의 공유**  
   - 이 문서에 있는 TypeScript 인터페이스를 기준으로,  
     안드로이드/React/서버에서 사용하는 메시지 모델을 최대한 일치시킵니다.
2. **페이지 이동 루프 방지**  
   - 안드로이드와 마찬가지로,
     - `roomState` / `movePage` 수신으로 인한 페이지 이동 중에는
       클라이언트에서 movePage 재전송을 막는 플래그(`isApplyingRemoteSync` 등)를 두는 것을 권장합니다.
3. **roomState 우선 적용**  
   - 신규 입장 시 서버가 보내는 `roomState` 의 `lastPage` 와 `formValues` 를 먼저 적용한 뒤,
   - 이후 실시간 `broadcast` 이벤트를 처리하도록 순서를 맞춥니다.
4. **에러 및 unknown type 처리**  
   - `type` 이 예상 목록에 없는 경우에도 파싱이 완전히 실패하지 않도록,
     `default` 블록에서 로그만 찍고 무시하는 방식을 유지합니다.

이 문서를 기반으로, **React Web 클라이언트도 안드로이드와 동일한 WebSocket 프로토콜**을 사용해 서버와 안정적으로 통신할 수 있습니다.

