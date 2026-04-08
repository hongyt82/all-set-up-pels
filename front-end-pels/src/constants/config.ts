/**
 * 애플리케이션 설정 상수
 * 모든 고정 설정 값을 중앙에서 관리
 */

import { devLog } from '../utils/devConsole';

// ============================================
// PDF 관련 설정
// ============================================

/**
 * PDF 페이지 크기 (A4 기준)
 */
export const PDF_CONFIG = {
  /**
   * 페이지 너비 (px)
   */
  WIDTH: 520,

  /**
   * 페이지 높이 (px)
   */
  HEIGHT: 736,

  /**
   * A4 실제 크기 (포인트)
   */
  A4_WIDTH: 595,
  A4_HEIGHT: 842,

  /**
   * 최대 페이지 수
   */
  MAX_PAGES: 999,

  /**
   * 기본 페이지 수 (테스트용)
   */
  DEFAULT_TOTAL_PAGES: 37,
} as const;

// ============================================
// 레이아웃 설정
// ============================================

/**
 * 레이아웃 크기 설정
 */
export const LAYOUT_CONFIG = {
  /**
   * 헤더 높이 (px)
   */
  HEADER_HEIGHT: 60,

  /**
   * 푸터 높이 (px)
   */
  FOOTER_HEIGHT: 60,

  /**
   * 사이드바 너비 (px)
   */
  SIDEBAR_WIDTH: 200,

  /**
   * 메인 영역 높이 계산
   */
  get MAIN_HEIGHT() {
    return `calc(100vh - ${this.HEADER_HEIGHT + this.FOOTER_HEIGHT}px)`;
  },
} as const;

// ============================================
// 경계 제한 설정
// ============================================

/**
 * 경계 제한 관련 설정
 */
export const BOUNDARY_CONFIG = {
  /**
   * 경계 근접 감지 거리 (px)
   */
  PROXIMITY_THRESHOLD: 10,

  /**
   * 스냅 그리드 크기 (px)
   */
  SNAP_GRID_SIZE: 5,

  /**
   * 최소 컴포넌트 크기
   */
  MIN_WIDTH: 30,
  MIN_HEIGHT: 30,

  /**
   * 기본 컴포넌트 생성 위치
   */
  DEFAULT_X: 20,
  DEFAULT_Y: 40,

  /**
   * 경계 체크 활성화
   */
  ENABLE_BOUNDARY_CHECK: true,

  /**
   * 로깅 활성화
   */
  ENABLE_LOGGING: true,
} as const;

// ============================================
// 컴포넌트 기본 설정
// ============================================

/**
 * 각 도구별 기본 크기
 */
export const COMPONENT_DEFAULTS = {
  BAN: {
    CIRCLE_SIZE: 40,
    SQUARE_SIZE: 40,
    LINE_LENGTH: 60,
    CROSS_SIZE: 30,
  },
  CIRCLE: {
    SIZE: 40,
  },
  TEXT: {
    INPUT_WIDTH: 150,
    INPUT_HEIGHT: 30,
    AREA_WIDTH: 200,
    AREA_HEIGHT: 80,
    LABEL_TEXT: '텍스트',
  },
  SIGNATURE: {
    LINE_WIDTH: 120,
    BOX_WIDTH: 100,
    BOX_HEIGHT: 60,
    STAMP_SIZE: 50,
  },
  CHECKBOX: {
    SIZE: 24,
  },
  CALENDAR: {
    DATEPICKER_WIDTH: 150,
    DATEPICKER_HEIGHT: 35,
    MONTH_WIDTH: 100,
    MONTH_HEIGHT: 35,
    RANGE_WIDTH: 200,
    RANGE_HEIGHT: 35,
  },
} as const;

// ============================================
// 스타일 설정
// ============================================

/**
 * 색상 설정
 */
export const COLORS = {
  PRIMARY: '#030213',
  SECONDARY: '#ececf0',
  ACCENT: '#e9ebef',
  DESTRUCTIVE: '#d4183d',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',

  // 경계 경고
  BOUNDARY_WARNING: '#ef4444',
  BOUNDARY_SAFE: '#10b981',

  // 오버레이
  OVERLAY_BG: 'rgba(251, 191, 36, 0.03)',
  OVERLAY_BORDER: 'rgba(251, 191, 36, 0.2)',
} as const;

/**
 * 애니메이션 설정
 */
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    DEFAULT: 'ease-in-out',
    IN: 'ease-in',
    OUT: 'ease-out',
  },
} as const;

// ============================================
// 스토리지 설정
// ============================================

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  EDITOR_STATE: 'pdf-editor-state',
  USER_PREFERENCES: 'pdf-editor-preferences',
  RECENT_FILES: 'pdf-editor-recent-files',
} as const;

/**
 * IndexedDB 설정
 */
export const INDEXEDDB_CONFIG = {
  DB_NAME: 'pdf-formatter-db',
  VERSION: 1,
  STORES: {
    PAGES: 'pages',
    COMPONENTS: 'components',
    METADATA: 'metadata',
  },
} as const;

// ============================================
// 에러 메시지
// ============================================

/**
 * 에러 메시지 템플릿
 */
export const ERROR_MESSAGES = {
  NETWORK: '네트워크 연결을 확인해주세요.',
  NOT_FOUND: '요청하신 페이지를 찾을 수 없습니다.',
  UNAUTHORIZED: '권한이 없습니다. 다시 로그인해주세요.',
  FORBIDDEN: '접근이 거부되었습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  VALIDATION: '입력값이 올바르지 않습니다.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',

  // 경계 관련
  BOUNDARY_EXCEEDED: '컴포넌트가 PDF 영역을 벗어났습니다!',
  BOUNDARY_WARNING: '경계 근처입니다. 영역을 벗어날 수 없습니다.',
} as const;

// ============================================
// 다이얼로그 기본 텍스트
// ============================================

/**
 * 다이얼로그 기본 텍스트
 */
export const DIALOG_DEFAULTS = {
  CONFIRM_TEXT: '확인',
  CANCEL_TEXT: '취소',
  CLOSE_TEXT: '닫기',
  DELETE_TEXT: '삭제',
  SAVE_TEXT: '저장',
} as const;

// ============================================
// 버전 정보
// ============================================

/**
 * 애플리케이션 버전
 */
export const APP_VERSION = '1.2.1' as const;

/**
 * 빌드 정보
 */
export const BUILD_INFO = {
  VERSION: APP_VERSION,
  BUILD_DATE: '2025-10-01',
  DESCRIPTION: 'PDF Formatter - 드래그 앤 드롭 기반 PDF 편집기',
} as const;

// ============================================
// 개발 모드 설정
// ============================================

/**
 * 개발 모드 여부
 */
export const IS_DEV =
  import.meta.env.MODE === 'development' ||
  import.meta.env.MODE === 'localdev' ||
  import.meta.env.MODE === 'dev';

/**
 * 프로덕션 모드 여부
 */
export const IS_PROD = import.meta.env.PROD;

/**
 * 모드 상세
 */
export const APP_MODE_DETAIL_INFO = import.meta.env.MODE;

/**
 * 정규화된 앱 모드 문자열
 * - development → dev
 * - production → production
 * - 그 외 → import.meta.env.MODE 그대로
 */
export const APP_MODE =
  import.meta.env.MODE === 'development' ||
  import.meta.env.MODE === 'localdev' ||
  import.meta.env.MODE === 'dev'
    ? 'dev'
    : import.meta.env.MODE === 'production'
      ? 'production'
      : (import.meta.env.MODE as string);

/**
 * 현재 브라우저가 접속 중인 서버 origin (예: http://localhost:4000)
 */
export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
}

/**
 * 외부 시스템에 공유/리다이렉트 등에 사용할 수 있는 외부 공개 URL
 * - .env의 VITE_OUT_MAIN_URL을 그대로 반환
 */
export function getExternalPublicUrl(): string | undefined {
  return import.meta.env.VITE_OUT_MAIN_URL as string | undefined;
}

// ============================================
// API 엔드포인트 및 프록시 플래그
// ============================================

/**
 * 레거시 .do 프록시 사용 여부 (개발 환경용)
 */
export function getProxyDotDoEnabled(): boolean {
  const raw = import.meta.env.VITE_PROXY_DOT_DO as string | undefined;
  return typeof raw === 'string' && raw.toLowerCase() === 'true';
}

/**
 * 일반 API 베이스 URL (.env의 VITE_API_URL)
 */
export function getApiBaseUrl(): string | undefined {
  return import.meta.env.VITE_API_URL as string | undefined;
}

/**
 * 레거시 API 베이스 URL (.env의 VITE_API_LEGACY_URL)
 */
export function getLegacyApiBaseUrl(): string | undefined {
  return import.meta.env.VITE_API_LEGACY_URL as string | undefined;
}

/**
 * 실제로 사용할 API 베이스 URL 반환
 * - VITE_PROXY_DOT_DO === true 이면 레거시 URL 우선
 * - 아니면 일반 URL 사용
 */
export function getEffectiveApiBaseUrl(): string | undefined {
  return getProxyDotDoEnabled() ? getLegacyApiBaseUrl() : getApiBaseUrl();
}

/**
 * 디버그 로그 활성화
 */
export const ENABLE_DEBUG_LOG = IS_DEV;

// ============================================
// 헬퍼 함수
// ============================================

/**
 * PDF 페이지 경계 정보 반환
 */
export function getPDFBoundary() {
  return {
    width: PDF_CONFIG.WIDTH,
    height: PDF_CONFIG.HEIGHT,
    minX: 0,
    minY: 0,
    maxX: PDF_CONFIG.WIDTH,
    maxY: PDF_CONFIG.HEIGHT,
  };
}

/**
 * 레이아웃 높이 계산
 */
export function getMainHeight() {
  return `calc(100vh - ${LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.FOOTER_HEIGHT}px)`;
}

/**
 * 디버그 로그 출력 (개발 모드에서만)
 */
export function debugLog(message: string, ...args: any[]) {
  if (ENABLE_DEBUG_LOG) {
    devLog(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * 설정 값 검증
 */
export function validateConfig() {
  const errors: string[] = [];

  if (PDF_CONFIG.WIDTH <= 0 || PDF_CONFIG.HEIGHT <= 0) {
    errors.push('PDF 크기가 올바르지 않습니다.');
  }

  if (LAYOUT_CONFIG.HEADER_HEIGHT < 0 || LAYOUT_CONFIG.FOOTER_HEIGHT < 0) {
    errors.push('레이아웃 크기가 올바르지 않습니다.');
  }

  if (BOUNDARY_CONFIG.SNAP_GRID_SIZE <= 0) {
    errors.push('스냅 그리드 크기가 올바르지 않습니다.');
  }

  if (errors.length > 0) {
    console.error('❌ 설정 검증 실패:', errors);
    return false;
  }

  devLog('✅ 설정 검증 성공');
  return true;
}
