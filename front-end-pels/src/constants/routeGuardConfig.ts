import type { RouteGuardConfig } from '../components/common/RouteGuard';
import { ROUTES } from './routes';
import { IS_DEV } from './config.ts';

/**
 * 전역 가드 활성화 플래그 (true 시 guards 로직 활성화)
 * 한 곳에서 on/off 할 수 있도록 단일 플래그로 관리
 */
export const ROUTE_GUARDS_ENABLED = false;

/**
 * 커스텀 RouteGuard 설정
 * 프로젝트별 경로 제어 로직을 중앙에서 관리
 */
export const customRouteGuardConfig: RouteGuardConfig = {
  debug: IS_DEV,

  /**
   * 경로 변경 전 실행되는 로직
   * false를 반환하면 경로 변경을 차단
   */
  onBeforeRouteChange: async (from, to) => {
    console.log('🔄 [RouteGuard] 경로 변경 시작:', {
      from,
      to,
      timestamp: new Date().toISOString(),
    });

    // 예: 저장되지 않은 변경사항 체크
    if (from === ROUTES.EDITOR && to !== ROUTES.EDITOR) {
      const hasUnsavedChanges = checkUnsavedChanges();
      if (hasUnsavedChanges) {
        const shouldLeave = confirm(
          '저장되지 않은 변경사항이 있습니다. 정말 떠나시겠습니까?'
        );
        if (!shouldLeave) {
          console.log('🚫 [RouteGuard] 사용자가 경로 변경을 취소함');
          return false;
        }
      }
    }

    // 예: 특정 경로로의 이동 전 로딩 상태 설정
    if (to === ROUTES.EDITOR || to === ROUTES.EDITOR) {
      console.log('⏳ [RouteGuard] PDF 도구 페이지로 이동 중...');
    }

    return true;
  },

  /**
   * 경로 변경 후 실행되는 로직
   */
  onAfterRouteChange: async (from, to) => {
    console.log('✅ [RouteGuard] 경로 변경 완료:', {
      from,
      to,
      timestamp: new Date().toISOString(),
    });

    // 예: 페이지별 초기화 로직
    if (to === ROUTES.EDITOR) {
      console.log('📝 [RouteGuard] 편집기 페이지 초기화');
      // 편집기 관련 초기화 로직
    } else if (to === ROUTES.VIEWER) {
      console.log('👁️ [RouteGuard] 뷰어 페이지 초기화');
      // 뷰어 관련 초기화 로직
    } else if (to === ROUTES.HOME || to === ROUTES.ROOT) {
      console.log('🏠 [RouteGuard] 홈 페이지 초기화');
      // 홈 페이지 관련 초기화 로직
    }

    // 예: 페이지 방문 통계
    trackPageVisit(to);
  },

  /**
   * 특정 경로에 대한 가드 설정
   */
  guards: {
    [ROUTES.EDITOR]: {
      canAccess: async (from, to) => {
        console.log('🔒 [RouteGuard] 편집기 접근 권한 체크:', { from, to });
        // 가드 비활성화 시 항상 통과
        if (!ROUTE_GUARDS_ENABLED) return true;

        // 예: 로그인 상태 체크
        const isLoggedIn = checkLoginStatus();
        if (!isLoggedIn) {
          console.log('🚫 [RouteGuard] 로그인이 필요합니다');
          return false;
        }

        // 예: 편집 권한 체크
        const hasEditPermission = checkEditPermission();
        if (!hasEditPermission) {
          console.log('🚫 [RouteGuard] 편집 권한이 없습니다');
          return false;
        }

        return true;
      },
      redirectTo: ROUTES.HOME, // 접근 불가 시 리다이렉트할 경로
      onAccessDenied: (from, to) => {
        if (!ROUTE_GUARDS_ENABLED) return;
        console.log('🚫 [RouteGuard] 편집기 접근 거부:', { from, to });
        alert('편집기 접근 권한이 없습니다.');
      },
    },

    [ROUTES.VIEWER]: {
      canAccess: async (from, to) => {
        console.log('🔒 [RouteGuard] 뷰어 접근 권한 체크:', { from, to });
        // 가드 비활성화 시 항상 통과
        if (!ROUTE_GUARDS_ENABLED) return true;

        // 예: 로그인 상태 체크
        const isLoggedIn = checkLoginStatus();
        if (!isLoggedIn) {
          console.log('🚫 [RouteGuard] 로그인이 필요합니다');
          return false;
        }

        return true;
      },
      redirectTo: ROUTES.HOME,
      onAccessDenied: (from, to) => {
        if (!ROUTE_GUARDS_ENABLED) return;
        console.log('🚫 [RouteGuard] 뷰어 접근 거부:', { from, to });
        alert('뷰어 접근 권한이 없습니다.');
      },
    },

    [ROUTES.HOME]: {
      canAccess: async (from, to) => {
        console.log('🔒 [RouteGuard] 홈 페이지 접근 권한 체크:', { from, to });
        // 홈 페이지는 항상 접근 가능
        return true;
      },
    },
  },
};

/**
 * 저장되지 않은 변경사항 체크 함수
 */
function checkUnsavedChanges(): boolean {
  // 예: 편집기 상태에서 저장되지 않은 변경사항이 있는지 체크
  // 실제 구현에서는 Zustand store나 다른 상태 관리 시스템을 사용
  const editorState = localStorage.getItem('editor-unsaved-changes');
  return editorState === 'true';
}

/**
 * 로그인 상태 체크 함수
 */
function checkLoginStatus(): boolean {
  // 예: 로그인 상태 체크
  // 실제 구현에서는 인증 토큰이나 세션을 확인
  const authToken = localStorage.getItem('auth-token');
  return !!authToken;
}

/**
 * 편집 권한 체크 함수
 */
function checkEditPermission(): boolean {
  // 예: 편집 권한 체크
  // 실제 구현에서는 사용자 권한을 확인
  const userRole = localStorage.getItem('user-role');
  return userRole === 'admin' || userRole === 'editor';
}

/**
 * 페이지 방문 통계 함수
 */
function trackPageVisit(path: string): void {
  // 예: 페이지 방문 통계 수집
  console.log('📊 [RouteGuard] 페이지 방문 통계:', {
    path,
    timestamp: new Date().toISOString(),
  });

  // 실제 구현에서는 분석 도구(Google Analytics, Mixpanel 등)에 데이터 전송
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
    });
  }
}
