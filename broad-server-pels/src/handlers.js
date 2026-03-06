/**
 * WebSocket 메시지 타입별 처리 (PDFViewer 프로토콜 호환).
 *
 * 클라이언트 → 서버: newClient, chat, broadcast, broadcastAll, request, response, clientList
 * 서버 → 클라이언트(자동): roomState(신규 입장자), clientLeft(퇴장 시), newClient 브로드캐스트, clientList 응답
 */
import { joinRoom, leaveRoom, getRoomClients, broadcastToRoom, sendToClient } from './rooms.js';
import { updateRoomState, getRoomState } from './roomState.js';
import { logger } from './logger.js';

/**
 * Handle incoming JSON message from a client.
 * @param {object} data - Parsed JSON
 * @param {WebSocket} ws - Sender
 * @param {string} roomId - Client's current room (stored on ws)
 */
export function handleMessage(data, ws, roomId) {
  const type = data?.type;
  if (!type) {
    logger.debug('ws.message.no_type', {
      clientId: ws.clientId,
      roomId: ws.roomId,
      payload: logger.maybePayload(data),
    });
    return;
  }

  logger.debug('ws.message.handle', {
    clientId: ws.clientId,
    roomId: roomId || ws.roomId,
    type,
  });

  switch (type) {
    case 'newClient':
      handleNewClient(data, ws);
      break;
    case 'chat':
      handleChat(data, ws, roomId);
      break;
    case 'broadcast':
      handleBroadcast(data, ws, roomId);
      break;
    case 'broadcastAll':
      handleBroadcastAll(data, ws, roomId);
      break;
    case 'request':
      handleRequest(data, ws, roomId);
      break;
    case 'response':
      handleResponse(data, ws, roomId);
      break;
    case 'clientList':
      sendClientList(roomId, ws);
      break;
    default:
      handleDefault(data, ws, roomId);
  }
}

/** newClient: roomId 검증 후 Room 가입, roomState 전달, 동일 Room에 newClient 브로드캐스트 */
function handleNewClient(data, ws) {
  const rid = data?.roomId;
  if (!rid) {
    logger.warn('room.join.missing_roomId', {
      clientId: ws.clientId,
      payload: logger.maybePayload(data),
    });
    return;
  }

  const oldRoomId = ws.roomId;

  // Room 이동 시 이전 Room에서 제거
  if (oldRoomId && oldRoomId !== rid) {
    logger.info('room.move', {
      clientId: ws.clientId,
      fromRoomId: oldRoomId,
      toRoomId: rid,
    });
    leaveRoom(oldRoomId, ws);
  }

  // 같은 기기(클라이언트)를 식별하기 위한 clientKey 추출
  // - Android DO 클라이언트: newClient 메시지에 top-level clientKey 를 포함하여 전송
  // - 향후 React 클라이언트도 동일 필드를 사용하도록 통일
  const clientKey = data?.clientKey ?? null;
  if (clientKey) {
    ws.clientKey = clientKey;

    // 동일 Room 내에서 같은 clientKey 를 가진 기존 연결이 이미 있으면
    // "새로 들어오려는" 현재 연결(ws)을 4000 코드로 거부한다.
    const clients = getRoomClients(rid);
    for (const client of clients) {
      if (client === ws) continue;
      if (client.readyState !== 1) continue;
      if (client.clientKey && client.clientKey === clientKey) {
        logger.info('room.join.reject_duplicate_client', {
          newClientId: ws.clientId,
          existingClientId: client.clientId,
          roomId: rid,
          clientKey,
        });
        try {
          ws.close(4000, 'Duplicate client in same room (same clientKey)');
        } catch (error) {
          logger.warn('room.join.reject_duplicate_client.close_error', {
            clientId: ws.clientId,
            roomId: rid,
            clientKey,
            error: error.message,
          });
        }
        return;
      }
    }
  }

  ws.roomId = rid;

  logger.info('room.join', {
    clientId: ws.clientId,
    roomId: rid,
    oldRoomId: oldRoomId || null,
    userInfo: data?.user || null,
    clientKey: clientKey || null,
  });

  joinRoom(rid, ws);

  // 신규 입장자에게만 Room 최종 동기화 상태 전달 (기존 참가자에게는 보내지 않음)
  const roomStatePayload = getRoomState(rid);
  if (roomStatePayload && ws.readyState === 1) {
    const roomStateMessage = { type: 'roomState', ...roomStatePayload };
    try {
      ws.send(JSON.stringify(roomStateMessage));
      logger.info('roomState.sent_to_joiner', {
        clientId: ws.clientId,
        roomId: rid,
        hasLastPage: roomStatePayload.lastPage != null,
        formValuesCount: roomStatePayload.formValues?.length ?? 0,
      });
    } catch (err) {
      logger.warn('roomState.send_error', {
        clientId: ws.clientId,
        roomId: rid,
        error: err.message,
      });
    }
  }

  // Broadcast to others in room so they can add this user to clientList
  // 서버에서 생성한 clientId를 메시지에 추가하여 브로드캐스트
  const broadcastData = {
    ...data,
    clientId: ws.clientId, // 서버에서 생성한 clientId 추가
  };
  broadcastToRoom(rid, JSON.stringify(broadcastData), ws);
}

/** chat 메시지: Room 내 릴레이 (targetClientId 시 단일 전송). */
function handleChat(data, ws, roomId) {
  relayToRoom(data, ws, roomId);
}

/** broadcast 메시지: Room 내 릴레이 (targetClientId 시 단일 전송). */
function handleBroadcast(data, ws, roomId) {
  relayToRoom(data, ws, roomId);
}

/** broadcastAll 메시지: Room 내 릴레이 (targetClientId 시 단일 전송). */
function handleBroadcastAll(data, ws, roomId) {
  relayToRoom(data, ws, roomId);
}

/** request 메시지: Room 내 릴레이 (targetClientId 시 단일 전송). */
function handleRequest(data, ws, roomId) {
  relayToRoom(data, ws, roomId);
}

/** response 메시지: Room 내 릴레이 (targetClientId 시 단일 전송). */
function handleResponse(data, ws, roomId) {
  relayToRoom(data, ws, roomId);
}

/** 알 수 없는 타입: 로깅 후 릴레이 (기존 default 동작 유지). */
function handleDefault(data, ws, roomId) {
  logger.debug('ws.message.unknown_type', {
    clientId: ws.clientId,
    roomId: roomId || ws.roomId,
    type: data?.type,
    payload: logger.maybePayload(data),
  });
  relayToRoom(data, ws, roomId);
}

/**
 * Room 내 메시지 릴레이: targetClientId가 있으면 해당 클라이언트에만 전송,
 * 없으면 Room 전체에 브로드캐스트(발신자 제외). broadcast 타입의 movePage/setForm은
 * updateRoomState로 저장하여 신규 입장자 roomState 초기화에 사용한다.
 * @param {object} data - 전달할 메시지 객체
 * @param {WebSocket} ws - 발신 클라이언트 (브로드캐스트 시 제외)
 * @param {string|null} roomId - 대상 Room ID (없으면 ws.roomId 사용)
 */
function relayToRoom(data, ws, roomId) {
  const rid = roomId || ws.roomId;
  if (!rid) {
    logger.warn('ws.message.relay.no_roomId', {
      clientId: ws.clientId,
      type: data?.type,
      payload: logger.maybePayload(data),
    });
    return;
  }

  logger.debug('ws.message.relay', {
    clientId: ws.clientId,
    roomId: rid,
    type: data?.type,
    payload: logger.maybePayload(data),
  });

  // INFO: 전반 모니터링용 — 릴레이된 메시지 타입/이벤트 (LOG_LEVEL=info에서도 확인 가능)
  // setForm 시 value.type(컨트롤 타입) 있으면 ctrlType으로 로그에 출력
  logger.info('ws.message.relayed', {
    clientId: ws.clientId,
    roomId: rid,
    type: data?.type,
    event: data?.value?.event ?? null,
    ctrlType: data?.value?.type ?? null,
  });

  // targetClientId가 있으면 해당 클라이언트에게만 전송, 없으면 Room 전체 브로드캐스트
  const targetClientId = data?.targetClientId;
  if (targetClientId) {
    sendToClient(targetClientId, data);
  } else {
    broadcastToRoom(rid, data, ws);
    // Room 상태 저장: movePage/setForm만 저장 (신규 입장자 초기 동기화용). 기존 릴레이에는 영향 없음.
    if (
      data?.type === 'broadcast' &&
      (data?.value?.event === 'movePage' || data?.value?.event === 'setForm')
    ) {
      updateRoomState(rid, data);
    }
  }
}

/**
 * 요청한 클라이언트에게 해당 Room의 접속 중인 사용자 목록(clientList)을 응답한다.
 * ws.userInfo가 있는 클라이언트만 users 배열에 포함된다.
 * @param {string|null} roomId - Room ID (없으면 ws.roomId 사용)
 * @param {WebSocket} ws - clientList를 요청한 클라이언트 (응답 수신자)
 */
function sendClientList(roomId, ws) {
  const rid = roomId || ws.roomId;
  const clients = getRoomClients(rid);
  const users = [];
  let activeClients = 0;

  for (const client of clients) {
    if (client.readyState === 1) {
      activeClients++;
      if (client.userInfo) {
        users.push(client.userInfo);
      }
    }
  }

  const msg = {
    roomId: rid,
    type: 'clientList',
    users,
  };

  logger.info('room.clientList.response', {
    clientId: ws.clientId,
    roomId: rid,
    totalClients: clients.size,
    activeClients,
    userCount: users.length,
    // 개발 시에는 LOG_PRETTY=true, LOG_PAYLOAD=true 설정 시
    // payload 필드에 users 전체가 예쁘게(JSON 객체) 포함됨.
    payload: logger.maybePayload({ users }),
  });

  if (ws.readyState === 1) {
    ws.send(JSON.stringify(msg));
  } else {
    logger.warn('room.clientList.send_failed', {
      clientId: ws.clientId,
      roomId: rid,
      readyState: ws.readyState,
    });
  }
}

/**
 * newClient 수신 시 data.user를 ws.userInfo에 저장. clientList 응답 시 사용.
 * @param {WebSocket} ws - 클라이언트 소켓
 * @param {object} data - newClient 메시지 (data.user 필드)
 */
export function attachUserInfo(ws, data) {
  if (data?.user) {
    ws.userInfo = data.user;
    logger.debug('ws.userInfo.attached', {
      clientId: ws.clientId,
      roomId: ws.roomId,
      userInfo: data.user,
    });
  }
}

/**
 * 연결 종료 시 Room 내 다른 클라이언트에게 clientLeft 브로드캐스트 후 leaveRoom 호출.
 * @param {WebSocket} ws - 종료된 클라이언트 소켓
 */
export function onClose(ws) {
  const rid = ws.roomId;
  if (rid) {
    const clientLeftPayload = {
      type: 'clientLeft',
      clientId: ws.clientId,
      roomId: rid,
      userInfo: ws.userInfo ?? null,
      timestamp: Date.now(),
    };
    broadcastToRoom(rid, clientLeftPayload, ws);
    logger.info('room.leave', {
      clientId: ws.clientId,
      roomId: rid,
      userInfo: ws.userInfo || null,
    });
    leaveRoom(rid, ws);
  } else {
    logger.debug('room.leave.no_roomId', {
      clientId: ws.clientId,
      userInfo: ws.userInfo || null,
    });
  }
}
