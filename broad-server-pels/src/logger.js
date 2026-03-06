/**
 * 레벨 필터링이 있는 단순 구조화 로거.
 *
 * LOG_LEVEL: debug | info | warn | error (기본값: info)
 * LOG_PAYLOAD: true | false (기본값: false) - 로그에 메시지 payload 포함 여부
 * LOG_MAX_LEN: number (기본값: 2000) - 로깅 시 payload 최대 길이
 */
import { config } from '../config/config.js';

/** 로그 레벨 순서 (debug < info < warn < error). 비교용 rank Map 생성에 사용 */
const LEVELS = /** @type {const} */ (['debug', 'info', 'warn', 'error']);
const LEVEL_RANK = new Map(LEVELS.map((l, i) => [l, i]));

/** ISO 8601 타임스탬프 (로그 라인 ts 필드용) */
function nowIso() {
  return new Date().toISOString();
}

/** 객체를 JSON 문자열로 직렬화. 실패 시 "[unserializable]" 반환. pretty=true 시 2칸 들여쓰기 */
function safeJson(value, pretty = false) {
  try {
    return JSON.stringify(value, null, pretty ? 2 : 0);
  } catch {
    return '"[unserializable]"';
  }
}

/** 문자열이 maxLen 초과 시 잘라서 "…(truncated N chars)" 접미사 붙여 반환 */
function truncate(str, maxLen) {
  if (typeof str !== 'string') return str;
  if (!maxLen || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + `…(truncated ${str.length - maxLen} chars)`;
}

/** 로그 레벨 문자열 정규화 (소문자, 유효하지 않으면 'info') */
function normalizeLevel(level) {
  const l = String(level || '').toLowerCase();
  return LEVEL_RANK.has(l) ? l : 'info';
}

/** config에서 읽은 실제 적용 값 (레벨, payload 포함 여부, 최대 길이, pretty/color) */
const effective = {
  level: normalizeLevel(config.logging?.level),
  payload: Boolean(config.logging?.payload),
  maxLen: Number(config.logging?.maxLen) || 2000,
  pretty: Boolean(config.logging?.pretty),
  color: Boolean(config.logging?.color),
};

/** ANSI 색상 코드. LOG_COLOR=true + TTY일 때만 사용 (파일 리디렉션 시 비권장) */
const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

/** 레벨·이벤트에 따라 콘솔 출력용 색상 선택 (error=red, warn=yellow, roomState=cyan 등) */
function colorFor(level, event) {
  if (level === 'error') return COLORS.red;
  if (level === 'warn') return COLORS.yellow;
  if (level === 'info') return COLORS.green;
  if (event && typeof event === 'string') {
    if (event.startsWith('roomState.')) return COLORS.cyan;
    if (event.startsWith('room.clientList')) return COLORS.green;
    if (event.startsWith('ws.')) return COLORS.gray;
  }
  return COLORS.gray;
}

/** 현재 effective 레벨 이상일 때만 해당 레벨 로그를 출력하도록 판단 */
function shouldLog(level) {
  const want = LEVEL_RANK.get(normalizeLevel(level));
  const have = LEVEL_RANK.get(effective.level);
  return want >= have;
}

/** 한 줄 JSON 로그 출력 (level에 따라 console.log/warn/error 분기, color 적용) */
function emit(level, event, meta) {
  const line = {
    ts: nowIso(),
    level,
    event,
    ...meta,
  };
  let out = safeJson(line, effective.pretty);

  // 개발용 컬러 로그: TTY 콘솔이고 color 옵션이 켜진 경우에만 ANSI 색상 적용
  if (effective.color && process.stdout.isTTY) {
    const color = colorFor(level, event);
    out = color + out + COLORS.reset;
  }

  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

export const logger = {
  debug(event, meta = {}) {
    if (!shouldLog('debug')) return;
    emit('debug', event, meta);
  },
  info(event, meta = {}) {
    if (!shouldLog('info')) return;
    emit('info', event, meta);
  },
  warn(event, meta = {}) {
    if (!shouldLog('warn')) return;
    emit('warn', event, meta);
  },
  error(event, meta = {}) {
    if (!shouldLog('error')) return;
    emit('error', event, meta);
  },
  /**
   * LOG_PAYLOAD 설정에 따라 payload를 조건부로 포함한다.
   * @param {unknown} payload - 로그에 넣을 payload (객체/문자열 등)
   */
  maybePayload(payload) {
    if (!effective.payload) return undefined;

    // 개발 편의를 위해 pretty 모드(LOG_PRETTY=true)에서는 payload를
    // JSON 객체 그대로 포함시켜서 중첩 구조를 바로 볼 수 있게 한다.
    // (이 경우 로그 스키마가 달라지므로, 기본값은 false 로 두고
    //  운영 환경에서는 LOG_PRETTY 를 켜지 않는 것을 전제로 한다.)
    if (effective.pretty) {
      if (payload == null) return undefined;
      if (typeof payload === 'string') {
        try {
          // JSON 문자열이면 파싱해서 객체로 넣어준다.
          return JSON.parse(payload);
        } catch {
          // JSON 이 아니면 원본 문자열 그대로 기록
          return payload;
        }
      }
      // 이미 객체/배열이면 그대로 사용
      return payload;
    }

    // 기본 모드는 기존과 동일: 문자열로 직렬화 + 길이 제한 후 필드에 넣음
    const asString = typeof payload === 'string' ? payload : safeJson(payload);
    return truncate(asString, effective.maxLen);
  },
};
