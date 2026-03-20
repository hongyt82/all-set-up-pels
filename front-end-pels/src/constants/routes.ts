/**
 * 애플리케이션 경로 상수
 * 경로가 늘어나더라도 한 곳에서 관리할 수 있도록 중앙화
 */
export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  EDITOR: '/e-link-v2/editor',
  VIEWER: '/e-link-v2/viewer',
  REPLAYVIEWER: '/e-link-v2/ReplayViewer',
  API_TEST: '/api-test',
  LODASH_TEST: '/lodash-test',
  MOMENT_TEST: '/moment-test',
  API_DATA_TEST: '/api-data-test',
  NETWORK_TEST: '/network-test',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
