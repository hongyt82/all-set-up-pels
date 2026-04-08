import { useEffect } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ErrorDialog } from './components/common/ErrorDialog';
import { RouteGuard } from './components/common/RouteGuard';
import {
  APP_MODE,
  APP_MODE_DETAIL_INFO,
  getCurrentOrigin,
  getEffectiveApiBaseUrl,
  getExternalPublicUrl,
  getProxyDotDoEnabled,
  IS_DEV,
} from './constants/config';
import { getPageTitle } from './constants/pageTitles';
import { customRouteGuardConfig } from './constants/routeGuardConfig';
import { ROUTES } from './constants/routes';
import ApiDataTestPage from './pages/ApiDataTestPage';
import { ApiTestPage } from './pages/ApiTestPage';
import { EditorPage } from './pages/EditorPage';
import { HomePage } from './pages/HomePage';
import LodashTestPage from './pages/LodashTestPage';
import MomentTestPage from './pages/MomentTestPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ViewerPage } from './pages/ViewerPage';
import { ReplayViewerPage } from './pages/ReplayViewerPage.tsx';
import { getBrowserInfo, logBrowserInfo } from './utils';
import { globalErrorHandler } from './utils/errorHandler';
import { devLog } from './utils/devConsole';
import NetworkTestPage from './pages/NetworkTestPage.tsx';

/**
 * 동적 타이틀 설정 컴포넌트
 */
function DynamicTitle() {
  const location = useLocation();

  useEffect(() => {
    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  return null;
}

/**
 * Entry
 * @constructor
 */
export default function App() {
  // 전역 에러 핸들러 초기화
  useEffect(() => {
    globalErrorHandler.init();
    // Show current MAIN_URL for verification
    // eslint-disable-next-line no-console
    devLog(
      '[env] ORIGIN =',
      getCurrentOrigin(),
      'MODE =',
      APP_MODE,
      'OUT_MAIN =',
      getExternalPublicUrl(),
      'PROXY_DOT_DO =',
      getProxyDotDoEnabled(),
      'API_EFFECTIVE =',
      getEffectiveApiBaseUrl(),
      'IS_DEV=',
      IS_DEV,
      'APP_MODE_DETAIL_INFO=',
      APP_MODE_DETAIL_INFO
    );

    // 브라우저 정보 및 기능 지원 여부 로그 출력
    const browserInfo = getBrowserInfo();
    // eslint-disable-next-line no-console
    devLog('🔍 Browser Feature Support:');
    // eslint-disable-next-line no-console
    devLog('   Storage:', {
      localStorage: browserInfo.localStorageSupported,
      sessionStorage: browserInfo.sessionStorageSupported,
      indexedDB: browserInfo.indexedDBSupported,
    });
    // eslint-disable-next-line no-console
    devLog('   Web APIs:', {
      webWorker: browserInfo.webWorkerSupported,
      serviceWorker: browserInfo.serviceWorkerSupported,
      webgl: browserInfo.webglSupported,
      webrtc: browserInfo.webrtcSupported,
      websocket: browserInfo.websocketSupported,
      geolocation: browserInfo.geolocationSupported,
    });
    // eslint-disable-next-line no-console
    devLog('   Graphics:', {
      canvas: browserInfo.canvasSupported,
      svg: browserInfo.svgSupported,
    });
    // eslint-disable-next-line no-console
    devLog('   CSS Features:', {
      cssGrid: browserInfo.cssGridSupported,
      flexbox: browserInfo.flexboxSupported,
      cssVariables: browserInfo.cssVariablesSupported,
    });
    // eslint-disable-next-line no-console
    devLog('   JavaScript:', {
      es6: browserInfo.es6Supported,
      fetch: browserInfo.fetchSupported,
      promise: browserInfo.promiseSupported,
      asyncAwait: browserInfo.asyncAwaitSupported,
      modules: browserInfo.moduleSupported,
      webAssembly: browserInfo.webAssemblySupported,
    });
    // eslint-disable-next-line no-console
    devLog('   Device:', {
      touch: browserInfo.touchSupported,
      online: browserInfo.isOnline,
      cookie: browserInfo.cookieEnabled,
    });

    // 전체 브라우저 정보 로그 출력
    logBrowserInfo();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <DynamicTitle />
        <RouteGuard config={customRouteGuardConfig} />
        <Routes>
          <Route path={ROUTES.ROOT} element={<HomePage />} />
          {IS_DEV && <Route path={ROUTES.HOME} element={<HomePage />} />}
          <Route path={ROUTES.EDITOR} element={<EditorPage />} />
          <Route path={ROUTES.VIEWER} element={<ViewerPage />} />
          <Route path={ROUTES.REPLAYVIEWER} element={<ReplayViewerPage />} />
          {IS_DEV && <Route path={ROUTES.API_TEST} element={<ApiTestPage />} />}
          {IS_DEV && (
            <Route path={ROUTES.LODASH_TEST} element={<LodashTestPage />} />
          )}
          {IS_DEV && (
            <Route path={ROUTES.MOMENT_TEST} element={<MomentTestPage />} />
          )}
          {IS_DEV && (
            <Route path={ROUTES.API_DATA_TEST} element={<ApiDataTestPage />} />
          )}
          {IS_DEV && (
            <Route path={ROUTES.NETWORK_TEST} element={<NetworkTestPage />} />
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* 전역 에러 다이얼로그 */}
        <ErrorDialog />
      </Router>
    </ErrorBoundary>
  );
}
