/**
 * Server configuration built from process.env only.
 * Dotenv loading is done in env.js; import this after env.js has run (config.js imports env.js first).
 * Override via environment variables (e.g. PORT, HOST).
 * Supports WAS deployment (Nginx, Tomcat) with reverse proxy configuration.
 */
import './env.js';

const env = process.env.NODE_ENV || 'development';
let envFile = '.env';
if (env === 'production') {
  envFile = '.env.production';
} else if (env === 'development' || env === 'dev') {
  envFile = '.env.dev';
}

// WAS/프록시 관련 파생값 (ENV_WAS_SETTINGS.md 참고)
const wasType = (process.env.WAS_TYPE || 'none').toLowerCase();
const isReverseProxy = process.env.REVERSE_PROXY === 'true' || wasType !== 'none';
const internalPort = Number(process.env.INTERNAL_PORT) || Number(process.env.PORT) || 8300;
const externalPort = Number(process.env.EXTERNAL_PORT) || internalPort;

export const config = {
  /** WebSocket 서버 리스닝 포트 (Health는 port+1에서 별도 HTTP 서버) */
  port: internalPort,
  /** 바인드 주소 (0.0.0.0 = 모든 인터페이스) */
  host: process.env.HOST || process.env.IP || '0.0.0.0',
  env,
  envFile,

  /** 로깅 옵션 (LOG_LEVEL, LOG_PAYLOAD, LOG_MAX_LEN, LOG_PRETTY, LOG_COLOR) */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    payload: process.env.LOG_PAYLOAD === 'true',
    maxLen: Number(process.env.LOG_MAX_LEN) || 2000,
    pretty: process.env.LOG_PRETTY === 'true',
    color: process.env.LOG_COLOR === 'true',
  },

  /** WAS/리버스 프록시 정보 (로깅·문서용, 실제 프록시는 Nginx/Apache 설정에서 관리) */
  was: {
    type: wasType,
    enabled: isReverseProxy,
    reverseProxy: isReverseProxy,
    internalPort,
    externalPort,
    proxyPath: process.env.PROXY_PATH || '/ws',
  },

  /** SSL 설정 (현재 서버 코드에서는 미사용, WAS에서 SSL 처리 권장) */
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    certPath: process.env.SSL_CERT_PATH || '',
    keyPath: process.env.SSL_KEY_PATH || '',
  },

  /** Health Check HTTP 서버 (config.port + 1 에서 /health 제공) */
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    path: process.env.HEALTH_CHECK_PATH || '/health',
  },

  /** WebSocket 제한 및 옵션 (연결 수/IP, ping 간격, 최대 메시지 크기) */
  websocket: {
    upgradeHeaders: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    },
    maxConnectionsPerIP: Number(process.env.WS_MAX_CONNECTIONS_PER_IP) || 0,
    pingInterval: Number(process.env.WS_PING_INTERVAL) || 30000,
    maxMessageSize: Number(process.env.WS_MAX_MESSAGE_SIZE) || 1048576,
  },
};
