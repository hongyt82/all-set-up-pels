/**
 * 페이지별 브라우저 타이틀 상수
 * 각 경로에 대응하는 브라우저 탭 제목을 중앙에서 관리
 */

/**
 * 페이지 타이틀 매핑
 */
import { ROUTES } from './routes';

export const PAGE_TITLES = {
  /** 루트 경로 */
  ROOT: 'PDF System',

  /** 홈 페이지 */
  HOME: 'Home',

  /** PDF 편집기 */
  EDITOR: 'PDF Editor',

  /** PDF 뷰어 */
  VIEWER: 'PDF Viewer',

  /** API 테스트 페이지 */
  API_TEST: 'API Test',

  /** Lodash 테스트 페이지 */
  LODASH_TEST: 'Lodash Test',

  /** Moment.js 테스트 페이지 */
  MOMENT_TEST: 'Moment.js Test',

  /** API 데이터 처리 테스트 페이지 */
  API_DATA_TEST: 'API Data Test',

  /** 네트워크 상태 모니터링 테스트 페이지 */
  NETWORK_TEST: 'Network Test',

  /** vanilla-jsoneditor 테스트 페이지 */
  JSON_EDITOR_TEST: 'JSON Editor Test',

  /** vanilla-jsoneditor 커스텀 UI 테스트 페이지 */
  JSON_EDITOR_CUSTOM_TEST: 'JSON Editor Custom Test',

  /** 기본값 (알 수 없는 경로) */
  DEFAULT: 'PDF System',
} as const;

/**
 * 경로별 타이틀 매핑 함수
 * @param pathname - 현재 경로
 * @returns 해당 경로에 맞는 타이틀
 */
export function getPageTitle(pathname: string): string {
  switch (pathname) {
    case ROUTES.EDITOR:
      return PAGE_TITLES.EDITOR;
    case ROUTES.VIEWER:
      return PAGE_TITLES.VIEWER;
    case ROUTES.HOME:
      return PAGE_TITLES.HOME;
    case ROUTES.API_TEST:
      return PAGE_TITLES.API_TEST;
    case ROUTES.LODASH_TEST:
      return PAGE_TITLES.LODASH_TEST;
    case ROUTES.MOMENT_TEST:
      return PAGE_TITLES.MOMENT_TEST;
    case ROUTES.API_DATA_TEST:
      return PAGE_TITLES.API_DATA_TEST;
    case ROUTES.NETWORK_TEST:
      return PAGE_TITLES.NETWORK_TEST;
    case ROUTES.JSON_EDITOR_TEST:
      return PAGE_TITLES.JSON_EDITOR_TEST;
    case ROUTES.JSON_EDITOR_CUSTOM_TEST:
      return PAGE_TITLES.JSON_EDITOR_CUSTOM_TEST;
    case ROUTES.ROOT:
      return PAGE_TITLES.ROOT;
    default:
      return PAGE_TITLES.DEFAULT;
  }
}

/**
 * 타이틀 타입 정의
 */
export type PageTitle = (typeof PAGE_TITLES)[keyof typeof PAGE_TITLES];
