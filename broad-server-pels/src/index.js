/**
 * WebSocket Room 중계 서버 진입점.
 *
 * - Room 단위 메시지 릴레이 (roomId 기준)
 * - Health Check용 HTTP 서버는 config.port + 1 에서 /health 제공
 * - 클라이언트: Android (DOTabLayoutContainerFragment), React 등
 */
import { WebSocketServer } from 'ws';
import http from 'http';
import { config } from '../config/config.js';
import { handleMessage, attachUserInfo, onClose } from './handlers.js';
import { logger } from './logger.js';
import { rooms } from './rooms.js';

const wss = new WebSocketServer({ port: config.port, host: config.host });

// ---------------------------------------------------------------------------
// Health Check HTTP 서버 (port+1 에서 리스닝, Nginx 등에서 /health → 8701 프록시)
// ---------------------------------------------------------------------------
const httpServer = http.createServer((req, res) => {
  if (config.healthCheck.enabled && req.url === config.healthCheck.path && req.method === 'GET') {
    const totalConnections = wss.clients.size;
    const totalRooms = rooms.size;
    const isHealthy = true; // 서버가 실행 중이면 healthy

    // Node 프로세스 메모리 사용량 (Bytes 단위)
    const mem = process.memoryUsage();

    // 사람이 보기 쉬운 MB 단위 변환 (소수점 2자리까지)
    const toMB = (bytes) => Math.round((bytes / (1024 * 1024)) * 100) / 100;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: isHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        server: {
          connections: totalConnections,
          rooms: totalRooms,
        },
        memory: {
          // 프로세스 전체 RSS (Resident Set Size)
          rss: mem.rss,
          rssMB: toMB(mem.rss),
          // V8 힙 메모리 총량 / 사용량
          heapTotal: mem.heapTotal,
          heapTotalMB: toMB(mem.heapTotal),
          heapUsed: mem.heapUsed,
          heapUsedMB: toMB(mem.heapUsed),
          // 바깥(native) 메모리 및 ArrayBuffer 사용량 (참고용)
          external: mem.external,
          externalMB: toMB(mem.external),
          arrayBuffers: mem.arrayBuffers,
          arrayBuffersMB: toMB(mem.arrayBuffers),
        },
      })
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

if (config.healthCheck.enabled) {
  httpServer.listen(config.port + 1, config.host, () => {
    console.log(
      `[sync-server] Health Check server listening on http://${config.host}:${config.port + 1}${config.healthCheck.path}`
    );
  });
}

// 서버가 부여하는 클라이언트 고유 ID (newClient 브로드캐스트 시 다른 클라이언트에 전달됨)
let clientIdCounter = 0;
function generateClientId() {
  return `client_${++clientIdCounter}_${Date.now()}`;
}

// IP별 동시 연결 수 (WS_MAX_CONNECTIONS_PER_IP > 0 일 때 제한용)
const connectionsByIP = new Map();

// ---------------------------------------------------------------------------
// WebSocket connection 핸들러
// ---------------------------------------------------------------------------
wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  ws.clientId = clientId;
  ws.roomId = null;
  ws.userInfo = null;

  const clientIp = req.socket.remoteAddress || 'unknown';
  const clientPort = req.socket.remotePort || 'unknown';

  // WS_MAX_CONNECTIONS_PER_IP 초과 시 1008 코드로 거부
  if (config.websocket.maxConnectionsPerIP > 0 && clientIp !== 'unknown') {
    const currentCount = connectionsByIP.get(clientIp) || 0;
    if (currentCount >= config.websocket.maxConnectionsPerIP) {
      logger.warn('ws.connection.limit_exceeded', {
        clientId,
        clientIp,
        currentCount,
        maxConnections: config.websocket.maxConnectionsPerIP,
      });
      ws.close(1008, 'Connection limit exceeded');
      return;
    }
    connectionsByIP.set(clientIp, currentCount + 1);
  }

  logger.info('ws.connection', {
    clientId,
    clientIp,
    clientPort,
    url: req.url,
    headers: {
      'user-agent': req.headers['user-agent'] || 'unknown',
    },
    connectionCount: clientIp !== 'unknown' ? connectionsByIP.get(clientIp) || 0 : null,
  });

  // Ping/Pong: WS_PING_INTERVAL 마다 ping 전송, PONG_TIMEOUT 내 pong 없으면 연결 종료
  let pingInterval = null;
  let pongTimeout = null;
  const PONG_TIMEOUT = 10000;

  if (config.websocket.pingInterval > 0) {
    pingInterval = setInterval(() => {
      if (ws.readyState === 1) {
        try {
          // Pong 응답 대기 타이머 설정
          pongTimeout = setTimeout(() => {
            logger.warn('ws.pong.timeout', {
              clientId: ws.clientId,
              roomId: ws.roomId,
            });
            if (pingInterval) clearInterval(pingInterval);
            onClose(ws);
            ws.terminate();
          }, PONG_TIMEOUT);

          ws.ping();
          logger.debug('ws.ping.sent', {
            clientId: ws.clientId,
            roomId: ws.roomId,
          });
        } catch (error) {
          logger.warn('ws.ping.error', {
            clientId: ws.clientId,
            roomId: ws.roomId,
            error: error.message,
          });
          if (pingInterval) clearInterval(pingInterval);
          if (pongTimeout) clearTimeout(pongTimeout);
          onClose(ws);
        }
      } else {
        if (pingInterval) clearInterval(pingInterval);
        if (pongTimeout) clearTimeout(pongTimeout);
      }
    }, config.websocket.pingInterval);
  }

  ws.on('message', (raw) => {
    const rawStr = raw.toString();
    const messageSize = rawStr.length;

    // maxMessageSize 초과 시 1009 코드로 연결 종료
    if (config.websocket.maxMessageSize > 0 && messageSize > config.websocket.maxMessageSize) {
      logger.warn('ws.message.size_exceeded', {
        clientId,
        roomId: ws.roomId,
        size: messageSize,
        maxSize: config.websocket.maxMessageSize,
      });
      ws.close(1009, 'Message too large');
      return;
    }

    try {
      const data = JSON.parse(rawStr);
      const messageType = data?.type || 'unknown';

      logger.debug('ws.message.received', {
        clientId,
        roomId: ws.roomId,
        type: messageType,
        size: messageSize,
        payload: logger.maybePayload(data),
      });

      // newClient 시 user 필드를 ws.userInfo에 저장 (clientList 응답용)
      if (data?.type === 'newClient') {
        attachUserInfo(ws, data);
      }
      handleMessage(data, ws, ws.roomId);
    } catch (parseError) {
      // JSON 파싱 실패 시 해당 메시지만 무시, 연결은 유지
      logger.warn('ws.message.invalid_json', {
        clientId,
        roomId: ws.roomId,
        size: messageSize,
        error: parseError.message,
        payload: logger.maybePayload(rawStr),
      });
    }
  });

  ws.on('pong', () => {
    if (pongTimeout) {
      clearTimeout(pongTimeout);
      pongTimeout = null;
    }
    logger.debug('ws.pong.received', {
      clientId: ws.clientId,
      roomId: ws.roomId,
    });
  });

  ws.on('close', (code, reason) => {
    if (pingInterval) clearInterval(pingInterval);
    if (pongTimeout) clearTimeout(pongTimeout);

    if (config.websocket.maxConnectionsPerIP > 0 && clientIp !== 'unknown') {
      const count = connectionsByIP.get(clientIp) || 0;
      if (count <= 1) {
        connectionsByIP.delete(clientIp);
      } else {
        connectionsByIP.set(clientIp, count - 1);
      }
    }

    logger.info('ws.close', {
      clientId,
      roomId: ws.roomId,
      code,
      reason: reason?.toString() || 'normal',
      userInfo: ws.userInfo || null,
    });
    onClose(ws);
  });

  ws.on('error', (error) => {
    // 정리 작업
    if (pingInterval) clearInterval(pingInterval);
    if (pongTimeout) clearTimeout(pongTimeout);

    // 연결수 제한 추적에서 제거
    if (config.websocket.maxConnectionsPerIP > 0 && clientIp !== 'unknown') {
      const count = connectionsByIP.get(clientIp) || 0;
      if (count <= 1) {
        connectionsByIP.delete(clientIp);
      } else {
        connectionsByIP.set(clientIp, count - 1);
      }
    }

    logger.error('ws.error', {
      clientId,
      roomId: ws.roomId,
      error: error.message,
      stack: error.stack,
    });

    // 에러 발생 시에도 Room에서 제거
    if (ws.readyState !== ws.CLOSED && ws.readyState !== ws.CLOSING) {
      onClose(ws);
    }
  });
});

console.log(`[sync-server] WebSocket server listening on ws://${config.host}:${config.port}`);
console.log(`[sync-server] Environment: ${config.env} (using ${config.envFile})`);
console.log(
  `[sync-server] WAS Type: ${config.was.type}, Reverse Proxy: ${config.was.reverseProxy}`
);
if (config.was.reverseProxy) {
  console.log(
    `[sync-server] Internal Port: ${config.was.internalPort}, External Port: ${config.was.externalPort}`
  );
  console.log(`[sync-server] Proxy Path: ${config.was.proxyPath}`);
}

// 주기적인 메모리 사용량 로그 (운영 동작에는 영향 없음, 관찰용)
// LOG_LEVEL=debug 일 때만 출력되므로, 필요 시에만 활성화해서 사용.
setInterval(() => {
  try {
    const mem = process.memoryUsage();
    logger.debug('process.memory', {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
    });
  } catch {
    // 메모리 조회 중 예외는 무시 (모니터링 보조 기능일 뿐이므로)
  }
}, 60_000);
