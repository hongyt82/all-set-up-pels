import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IS_DEV } from '../../constants/config.ts';
import { ROUTES } from '../../constants/routes';
import { useEditorStore } from '../../stores/editorStore';
import { checkNetworkConnection } from '../../utils';
import { devLog, devWarn } from '../../utils/devConsole';

/**
 * 상태 보존 관련 상수
 */
const DRAFT_STORAGE_KEY = 'pdf-editor-draft-state';
const DRAFT_TIMESTAMP_KEY = 'pdf-editor-draft-timestamp';
const DRAFT_EXPIRY_HOURS = 24; // 24시간 후 자동 삭제

/**
 * 상태 보존 헬퍼 함수들
 */
const saveDraftState = (state: any) => {
  try {
    const draftData = {
      state,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());

    devLog('💾 [RouteGuard] 상태 보존 완료:', {
      timestamp: draftData.timestamp,
      stateKeys: Object.keys(state),
    });
  } catch (error) {
    console.error('❌ [RouteGuard] 상태 보존 실패:', error);
  }
};

const loadDraftState = () => {
  try {
    const draftData = localStorage.getItem(DRAFT_STORAGE_KEY);
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);

    if (!draftData || !timestamp) return null;

    // 만료 시간 체크
    const draftTime = new Date(timestamp);
    const expiryTime = new Date(
      draftTime.getTime() + DRAFT_EXPIRY_HOURS * 60 * 60 * 1000
    );

    if (new Date() > expiryTime) {
      clearDraftState();
      return null;
    }

    const parsed = JSON.parse(draftData);

    devLog('📂 [RouteGuard] 상태 복원:', {
      timestamp: parsed.timestamp,
      stateKeys: Object.keys(parsed.state),
    });

    return parsed.state;
  } catch (error) {
    console.error('❌ [RouteGuard] 상태 복원 실패:', error);
    return null;
  }
};

const clearDraftState = () => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  localStorage.removeItem(DRAFT_TIMESTAMP_KEY);

  devLog('🗑️ [RouteGuard] 임시 상태 삭제 완료');
};

const isEditorRoute = (path: string) => {
  return path === ROUTES.EDITOR || path === ROUTES.VIEWER;
};

/**
 * 경로 변경 인터셉터 설정
 */
export interface RouteGuardConfig {
  /** 경로 변경 전 실행할 함수 */
  onBeforeRouteChange?: (
    from: string,
    to: string
  ) => boolean | Promise<boolean>;
  /** 경로 변경 후 실행할 함수 */
  onAfterRouteChange?: (from: string, to: string) => void | Promise<void>;
  /** 특정 경로에 대한 가드 설정 */
  guards?: {
    [path: string]: {
      /** 접근 권한 체크 함수 */
      canAccess?: (from: string, to: string) => boolean | Promise<boolean>;
      /** 리다이렉트 경로 (접근 불가 시) */
      redirectTo?: string;
      /** 접근 불가 시 실행할 함수 */
      onAccessDenied?: (from: string, to: string) => void;
    };
  };
  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * RouteGuard 컴포넌트
 * 경로 변경을 중간에서 가로채서 제어 로직을 실행
 */
export function RouteGuard({ config }: { config: RouteGuardConfig }) {
  const location = useLocation();
  const navigate = useNavigate();
  const previousPathRef = useRef<string>(location.pathname);
  const isNavigatingRef = useRef<boolean>(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // 같은 경로면 무시
    if (currentPath === previousPath) return;

    // 이미 네비게이션 중이면 무시
    if (isNavigatingRef.current) return;

    const handleRouteChange = async () => {
      try {
        isNavigatingRef.current = true;

        if (config.debug) {
          devLog('🛡️ [RouteGuard] 경로 변경 감지:', {
            from: previousPath,
            to: currentPath,
            timestamp: new Date().toISOString(),
          });
        }

        // 1. 경로 변경 전 로직 실행
        if (config.onBeforeRouteChange) {
          const canProceed = await config.onBeforeRouteChange(
            previousPath,
            currentPath
          );
          if (canProceed === false) {
            if (config.debug) {
              devLog('🚫 [RouteGuard] 경로 변경 차단:', {
                from: previousPath,
                to: currentPath,
              });
            }
            // 이전 경로로 되돌리기
            navigate(previousPath, { replace: true });
            return;
          }
        }

        // 2. 특정 경로 가드 체크
        if (config.guards && config.guards[currentPath]) {
          const guard = config.guards[currentPath];

          if (guard.canAccess) {
            const hasAccess = await guard.canAccess(previousPath, currentPath);
            if (!hasAccess) {
              if (config.debug) {
                devLog('🚫 [RouteGuard] 접근 권한 없음:', {
                  from: previousPath,
                  to: currentPath,
                });
              }

              // 접근 불가 시 실행할 함수
              if (guard.onAccessDenied) {
                guard.onAccessDenied(previousPath, currentPath);
              }

              // 리다이렉트 또는 이전 경로로 되돌리기
              if (guard.redirectTo) {
                navigate(guard.redirectTo, { replace: true });
              } else {
                navigate(previousPath, { replace: true });
              }
              return;
            }
          }
        }

        // 3. 경로 변경 후 로직 실행
        if (config.onAfterRouteChange) {
          await config.onAfterRouteChange(previousPath, currentPath);
        }

        if (config.debug) {
          devLog('✅ [RouteGuard] 경로 변경 완료:', {
            from: previousPath,
            to: currentPath,
          });
        }
      } catch (error) {
        console.error('❌ [RouteGuard] 경로 변경 중 오류:', error);
        // 오류 발생 시 이전 경로로 되돌리기
        navigate(previousPath, { replace: true });
      } finally {
        isNavigatingRef.current = false;
        previousPathRef.current = currentPath;
      }
    };

    handleRouteChange();
  }, [location.pathname, navigate, config]);

  return null;
}

/**
 * RouteGuard 훅
 * 컴포넌트에서 직접 사용할 수 있는 훅
 */
export function useRouteGuard(config: RouteGuardConfig) {
  const navigate = useNavigate();

  const guardRoute = async (from: string, to: string) => {
    if (config.onBeforeRouteChange) {
      const canProceed = await config.onBeforeRouteChange(from, to);
      if (canProceed === false) {
        return false;
      }
    }

    if (config.guards && config.guards[to]) {
      const guard = config.guards[to];
      if (guard.canAccess) {
        const hasAccess = await guard.canAccess(from, to);
        if (!hasAccess) {
          if (guard.redirectTo) {
            navigate(guard.redirectTo);
          }
          return false;
        }
      }
    }

    if (config.onAfterRouteChange) {
      await config.onAfterRouteChange(from, to);
    }

    return true;
  };

  return { guardRoute };
}

/**
 * 네트워크 상태 기반 상태 보존 RouteGuard 설정
 */
export const networkAwareRouteGuardConfig: RouteGuardConfig = {
  debug: IS_DEV,
  onBeforeRouteChange: async (from, to) => {
    devLog('🔄 [RouteGuard] 경로 변경 시작:', { from, to });

    // 편집기/뷰어 경로 간 이동인지 확인
    const isEditorToEditor = isEditorRoute(from) && isEditorRoute(to);
    const isEditorToOther = isEditorRoute(from) && !isEditorRoute(to);

    if (isEditorToEditor || isEditorToOther) {
      // 편집기에서 다른 곳으로 이동할 때 상태 보존 검토
      try {
        const isOnline = navigator.onLine;
        let isConnected = false;

        if (isOnline) {
          try {
            isConnected = await checkNetworkConnection();
          } catch (error) {
            devWarn('⚠️ [RouteGuard] 네트워크 연결 확인 실패:', error);
            isConnected = false;
          }
        }

        // 네트워크가 불안정하거나 끊어진 경우 상태 보존
        if (!isOnline || !isConnected) {
          const currentState = useEditorStore.getState();

          // 상태가 비어있지 않은 경우에만 보존
          if (currentState && Object.keys(currentState).length > 0) {
            saveDraftState(currentState);

            devLog('💾 [RouteGuard] 네트워크 불안정으로 상태 보존:', {
              isOnline,
              isConnected,
              from,
              to,
            });
          }
        } else {
          // 네트워크가 안정적인 경우 기존 임시 상태 삭제
          clearDraftState();
        }
      } catch (error) {
        console.error('❌ [RouteGuard] 상태 보존 처리 중 오류:', error);
      }
    }

    return true;
  },
  onAfterRouteChange: async (from, to) => {
    devLog('✅ [RouteGuard] 경로 변경 완료:', { from, to });

    // 편집기로 이동할 때 임시 상태 복원 검토
    if (isEditorRoute(to)) {
      try {
        const draftState = loadDraftState();

        if (draftState) {
          // 임시 상태가 있으면 복원
          useEditorStore.setState(draftState);

          devLog('📂 [RouteGuard] 임시 상태 복원 완료:', {
            from,
            to,
            restoredKeys: Object.keys(draftState),
          });
        }
      } catch (error) {
        console.error('❌ [RouteGuard] 상태 복원 중 오류:', error);
      }
    }
  },
  guards: {
    [ROUTES.EDITOR]: {
      canAccess: (from: string, to: string): boolean => {
        devLog('🔒 [RouteGuard] 편집기 접근 권한 체크:', { from, to });
        return true;
      },
      onAccessDenied: (from: string, to: string): void => {
        devLog('🚫 [RouteGuard] 편집기 접근 거부:', { from, to });
      },
    },
    [ROUTES.VIEWER]: {
      canAccess: (from: string, to: string): boolean => {
        devLog('🔒 [RouteGuard] 뷰어 접근 권한 체크:', { from, to });
        return true;
      },
    },
  },
};

/**
 * 기본 RouteGuard 설정 (기존 호환성 유지)
 */
export const defaultRouteGuardConfig: RouteGuardConfig = {
  debug: IS_DEV,
  onBeforeRouteChange: (from, to) => {
    devLog('🔄 [RouteGuard] 경로 변경 시작:', { from, to });
    return true;
  },
  onAfterRouteChange: (from, to) => {
    devLog('✅ [RouteGuard] 경로 변경 완료:', { from, to });
  },
  guards: {
    [ROUTES.EDITOR]: {
      canAccess: (from: string, to: string): boolean => {
        devLog('🔒 [RouteGuard] 편집기 접근 권한 체크:', { from, to });
        return true;
      },
      onAccessDenied: (from: string, to: string): void => {
        devLog('🚫 [RouteGuard] 편집기 접근 거부:', { from, to });
      },
    },
    [ROUTES.VIEWER]: {
      canAccess: (from: string, to: string): boolean => {
        devLog('🔒 [RouteGuard] 뷰어 접근 권한 체크:', { from, to });
        return true;
      },
    },
  },
};
