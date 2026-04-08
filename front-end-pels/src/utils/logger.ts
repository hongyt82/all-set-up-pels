/**
 * 통합 로깅 유틸리티
 * 개발/프로덕션 환경에 따라 로그 레벨 조정
 */

import { ENABLE_DEBUG_LOG } from '../constants/config';

/**
 * 로그 레벨
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * 로그 설정
 */
interface LogConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableStackTrace: boolean;
}

/**
 * 기본 로그 설정
 */
const defaultConfig: LogConfig = {
  level: ENABLE_DEBUG_LOG ? LogLevel.DEBUG : LogLevel.INFO,
  enableTimestamp: true,
  enableStackTrace: false,
};

/**
 * 현재 로그 설정
 */
let currentConfig = { ...defaultConfig };

/**
 * 로그 색상
 */
const COLORS = {
  DEBUG: '#9333ea', // purple
  INFO: '#3b82f6', // blue
  WARN: '#f59e0b', // amber
  ERROR: '#ef4444', // red
  SUCCESS: '#10b981', // green
};

/**
 * 이모지 매핑
 */
const EMOJI = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅',
  START: '🚀',
  END: '🏁',
  SAVE: '💾',
  DELETE: '🗑️',
  UPDATE: '🔄',
  CREATE: '➕',
  DRAG: '👆',
  BOUNDARY: '📐',
};

/**
 * 타임스탬프 생성
 */
function getTimestamp(): string {
  return new Date().toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

/**
 * 로그 포맷팅
 */
function formatLog(
  level: keyof typeof EMOJI,
  category: string,
  message: string
): string {
  const parts: string[] = [];

  if (currentConfig.enableTimestamp) {
    parts.push(`[${getTimestamp()}]`);
  }

  parts.push(`${EMOJI[level]} [${category}]`);
  parts.push(message);

  return parts.join(' ');
}

/**
 * 로그 출력
 */
function log(
  level: LogLevel,
  levelName: keyof typeof COLORS,
  category: string,
  message: string,
  data?: any
) {
  if (level < currentConfig.level) return;

  if (!import.meta.env.DEV && level !== LogLevel.ERROR) {
    return;
  }

  const formattedMessage = formatLog(levelName, category, message);
  const color = COLORS[levelName];

  const consoleMethod =
    level === LogLevel.ERROR
      ? console.error
      : level === LogLevel.WARN
        ? console.warn
        : console.log;

  if (data !== undefined) {
    consoleMethod(`%c${formattedMessage}`, `color: ${color}`, data);
  } else {
    consoleMethod(`%c${formattedMessage}`, `color: ${color}`);
  }
}

/**
 * Logger 클래스
 */
export class Logger {
  private category: string;
  constructor(category: string) {
    this.category = category;
  }

  /**
   * Debug 로그
   */
  debug(message: string, data?: any) {
    log(LogLevel.DEBUG, 'DEBUG', this.category, message, data);
  }

  /**
   * Info 로그
   */
  info(message: string, data?: any) {
    log(LogLevel.INFO, 'INFO', this.category, message, data);
  }

  /**
   * Warn 로그
   */
  warn(message: string, data?: any) {
    log(LogLevel.WARN, 'WARN', this.category, message, data);
  }

  /**
   * Error 로그
   */
  error(message: string, data?: any) {
    log(LogLevel.ERROR, 'ERROR', this.category, message, data);

    if (currentConfig.enableStackTrace) {
      console.trace();
    }
  }

  /**
   * Success 로그
   */
  success(message: string, data?: any) {
    log(LogLevel.INFO, 'SUCCESS', this.category, message, data);
  }

  /**
   * 특정 이벤트 로그
   */
  event(emoji: keyof typeof EMOJI, message: string, data?: any) {
    if (!import.meta.env.DEV) return;
    const formattedMessage = `${EMOJI[emoji]} [${this.category}] ${message}`;
    if (data !== undefined) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * 그룹 로그 시작
   */
  group(title: string) {
    if (!import.meta.env.DEV) return;
    console.group(`${EMOJI.START} [${this.category}] ${title}`);
  }

  /**
   * 그룹 로그 종료
   */
  groupEnd() {
    if (!import.meta.env.DEV) return;
    console.groupEnd();
  }

  /**
   * 시간 측정 시작
   */
  time(label: string) {
    if (!import.meta.env.DEV) return;
    console.time(`⏱️ [${this.category}] ${label}`);
  }

  /**
   * 시간 측정 종료
   */
  timeEnd(label: string) {
    if (!import.meta.env.DEV) return;
    console.timeEnd(`⏱️ [${this.category}] ${label}`);
  }
}

/**
 * Logger 인스턴스 생성
 */
export function createLogger(category: string): Logger {
  return new Logger(category);
}

/**
 * 로그 설정 변경
 */
export function setLogConfig(config: Partial<LogConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * 로그 레벨 변경
 */
export function setLogLevel(level: LogLevel) {
  currentConfig.level = level;
}

/**
 * 전역 Logger 인스턴스들
 */
export const loggers = {
  app: createLogger('App'),
  editor: createLogger('Editor'),
  viewer: createLogger('Viewer'),
  boundary: createLogger('Boundary'),
  store: createLogger('Store'),
  error: createLogger('Error'),
  component: createLogger('Component'),
  drag: createLogger('Drag'),
};

/**
 * 빠른 로그 함수들
 */
export const quickLog = {
  /**
   * 컴포넌트 마운트
   */
  mount(componentName: string, props?: any) {
    loggers.component.event('START', `${componentName} 마운트`, props);
  },

  /**
   * 컴포넌트 언마운트
   */
  unmount(componentName: string) {
    loggers.component.event('END', `${componentName} 언마운트`);
  },

  /**
   * 상태 변경
   */
  stateChange(stateName: string, oldValue: any, newValue: any) {
    loggers.store.event('UPDATE', `${stateName} 변경`, {
      이전: oldValue,
      새값: newValue,
    });
  },

  /**
   * API 호출
   */
  apiCall(method: string, url: string, data?: any) {
    loggers.app.event('INFO', `API 호출: ${method} ${url}`, data);
  },

  /**
   * 드래그 시작
   */
  dragStart(componentId: string, position: { x: number; y: number }) {
    loggers.drag.event('DRAG', `드래그 시작: ${componentId}`, position);
  },

  /**
   * 드래그 종료
   */
  dragEnd(componentId: string, position: { x: number; y: number }) {
    loggers.drag.event('DRAG', `드래그 종료: ${componentId}`, position);
  },

  /**
   * 경계 제한
   */
  boundaryConstrain(componentId: string, constrained: boolean) {
    if (constrained) {
      loggers.boundary.event('BOUNDARY', `경계 제한 적용: ${componentId}`);
    }
  },

  /**
   * 에러 발생
   */
  errorOccurred(error: Error, context?: string) {
    loggers.error.error(`에러 발생${context ? ` (${context})` : ''}`, {
      message: error.message,
      stack: error.stack,
    });
  },
};
