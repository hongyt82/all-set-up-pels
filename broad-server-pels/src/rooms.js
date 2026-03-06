/**
 * Room 단위 WebSocket 관리 모듈.
 *
 * roomId → Set<WebSocket> 구조로 같은 Room 내 클라이언트에게만
 * 브로드캐스트/단일 전송을 수행한다. Room 삭제 시 roomState도 함께 초기화한다.
 */
import { logger } from './logger.js';
import { clearRoomState } from './roomState.js';

/** @type {Map<string, Set<WebSocket>>} roomId → 해당 Room에 속한 WebSocket 집합 */
export const rooms = new Map();

/**
 * 클라이언트를 지정 Room에 참가시킨다. Room이 없으면 새로 생성한다.
 * @param {string} roomId - 참가할 Room ID
 * @param {WebSocket} ws - 참가할 클라이언트 (ws.roomId는 index.js에서 별도 설정)
 */
export function joinRoom(roomId, ws) {
  if (!roomId) {
    logger.warn('room.join.invalid_roomId', {
      clientId: ws.clientId,
    });
    return;
  }

  const isNewRoom = !rooms.has(roomId);
  if (isNewRoom) {
    rooms.set(roomId, new Set());
  }

  const room = rooms.get(roomId);
  const beforeSize = room.size;
  room.add(ws);
  const afterSize = room.size;

  logger.info('room.join.completed', {
    clientId: ws.clientId,
    roomId,
    isNewRoom,
    roomSizeBefore: beforeSize,
    roomSizeAfter: afterSize,
    totalRooms: rooms.size,
  });
}

/**
 * 클라이언트를 Room에서 제거한다. Room에 남은 클라이언트가 없으면
 * Room과 해당 roomState를 삭제한다.
 * @param {string} roomId - 나갈 Room ID
 * @param {WebSocket} ws - 나갈 클라이언트
 */
export function leaveRoom(roomId, ws) {
  if (!roomId) {
    logger.warn('room.leave.invalid_roomId', {
      clientId: ws.clientId,
    });
    return;
  }

  const set = rooms.get(roomId);
  if (!set) {
    logger.warn('room.leave.room_not_found', {
      clientId: ws.clientId,
      roomId,
    });
    return;
  }

  const beforeSize = set.size;
  set.delete(ws);
  const afterSize = set.size;
  const roomDeleted = afterSize === 0;

  if (roomDeleted) {
    rooms.delete(roomId);
    clearRoomState(roomId);
  }

  logger.info('room.leave.completed', {
    clientId: ws.clientId,
    roomId,
    roomSizeBefore: beforeSize,
    roomSizeAfter: afterSize,
    roomDeleted,
    totalRooms: rooms.size,
  });
}

/**
 * 해당 Room에 속한 WebSocket Set을 반환한다. Room이 없으면 빈 Set을 반환한다.
 * @param {string} roomId - Room ID
 * @returns {Set<WebSocket>}
 */
export function getRoomClients(roomId) {
  return rooms.get(roomId) || new Set();
}

/**
 * clientId로 단일 클라이언트에게 메시지를 전송한다. 모든 Room을 검색하여 대상 클라이언트를 찾는다.
 * @param {string} clientId - 대상 클라이언트 ID (ws.clientId)
 * @param {object|string} message - 전송할 메시지 (객체는 JSON.stringify 됨)
 * @returns {boolean} - 전송 성공 시 true, 클라이언트 미발견 또는 전송 실패 시 false
 */
export function sendToClient(clientId, message) {
  if (!clientId) {
    logger.warn('room.sendToClient.no_clientId', {});
    return false;
  }

  for (const [, set] of rooms) {
    for (const client of set) {
      if (client.clientId === clientId) {
        if (client.readyState !== 1) {
          logger.debug('room.sendToClient.not_open', {
            clientId,
            readyState: client.readyState,
          });
          return false;
        }
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        try {
          client.send(payload);
          logger.debug('room.sendToClient.sent', {
            clientId,
            payloadSize: payload.length,
            payload: logger.maybePayload(message),
          });
          return true;
        } catch (error) {
          logger.warn('room.sendToClient.send_error', {
            clientId,
            error: error.message,
          });
          return false;
        }
      }
    }
  }

  logger.debug('room.sendToClient.not_found', { clientId });
  return false;
}

/**
 * Room 내 모든 클라이언트에게 메시지를 전송한다. excludeWs는 제외(발신자 제외용).
 * 전송 실패/연결 끊김 클라이언트는 Set에서 제거하며, Room이 비면 Room 및 roomState를 삭제한다.
 * @param {string} roomId - 대상 Room ID
 * @param {object|string} message - 전송할 메시지 (객체는 JSON.stringify)
 * @param {WebSocket|null} [excludeWs=null] - 제외할 클라이언트 (보통 발신자)
 */
export function broadcastToRoom(roomId, message, excludeWs = null) {
  const set = rooms.get(roomId);
  if (!set) {
    logger.debug('room.broadcast.no_room', {
      roomId,
      excludeClientId: excludeWs?.clientId || null,
    });
    return;
  }

  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  const payloadSize = payload.length;
  let sentCount = 0;
  let skippedCount = 0;
  const disconnectedClients = []; // 연결이 끊긴 클라이언트 추적
  const skippedReasons = {
    excluded: 0,
    notOpen: 0,
    error: 0,
  };

  for (const client of set) {
    if (client === excludeWs) {
      skippedReasons.excluded++;
      skippedCount++;
      continue;
    }

    if (client.readyState !== 1) {
      skippedReasons.notOpen++;
      skippedCount++;
      disconnectedClients.push(client); // 나중에 제거할 클라이언트 기록
      continue;
    }

    try {
      client.send(payload);
      sentCount++;
    } catch (error) {
      skippedReasons.error++;
      skippedCount++;
      disconnectedClients.push(client); // 에러 발생한 클라이언트도 제거
      logger.warn('room.broadcast.send_error', {
        roomId,
        clientId: client.clientId,
        error: error.message,
      });
    }
  }

  // 연결이 끊긴 클라이언트 정리
  if (disconnectedClients.length > 0) {
    for (const client of disconnectedClients) {
      set.delete(client);
    }
    logger.info('room.broadcast.cleaned', {
      roomId,
      cleanedCount: disconnectedClients.length,
    });

    // Room이 비어있으면 삭제 및 해당 Room 동기화 상태 초기화
    if (set.size === 0) {
      rooms.delete(roomId);
      clearRoomState(roomId);
      logger.info('room.deleted.empty', {
        roomId,
      });
    }
  }

  logger.info('room.broadcast', {
    roomId,
    excludeClientId: excludeWs?.clientId || null,
    totalClients: set.size,
    sentCount,
    skippedCount,
    skippedReasons,
    payloadSize,
    payload: logger.maybePayload(message),
  });
}
