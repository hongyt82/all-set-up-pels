import {
  Braces,
  Bug,
  Clock,
  Code,
  Eye,
  FileEdit,
  PanelsTopLeft,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrowserDisplay } from '../components/common/BrowserDisplay';
import { VersionDisplay } from '../components/common/VersionDisplay';
import { Button } from '../components/ui/button';
import {
  APP_MODE,
  IS_DEV,
  getCurrentOrigin,
  getEffectiveApiBaseUrl,
  getExternalPublicUrl,
  getProxyDotDoEnabled,
} from '../constants/config';
import { ROUTES } from '../constants/routes.ts';
import { useErrorStore } from '../stores/errorStore';
import { triggerError } from '../utils/errorHandler';

export function HomePage() {
  const navigate = useNavigate();
  const { showError } = useErrorStore();

  // ErrorDialog 테스트 함수들
  const testErrorDialog = (
    type:
      | 'not-found'
      | 'client-error'
      | 'server-error'
      | 'network-error'
      | 'runtime-error'
      | 'general-error'
  ) => {
    const messages = {
      'not-found': '테스트 404 에러 - 페이지를 찾을 수 없습니다',
      'client-error': '테스트 400 에러 - 잘못된 요청입니다',
      'server-error': '테스트 500 에러 - 서버 오류가 발생했습니다',
      'network-error': '테스트 네트워크 에러 - 연결을 확인해주세요',
      'runtime-error': '테스트 런타임 에러 - 애플리케이션 오류입니다',
      'general-error': '테스트 일반 에러 - 알 수 없는 오류입니다',
    };

    showError(
      type,
      messages[type],
      `상세 정보: ${type} 테스트`,
      type === 'client-error' ? 400 : type === 'server-error' ? 500 : undefined
    );
  };

  // 전역 에러 핸들러 테스트 함수들
  const testGlobalErrorHandler = () => {
    console.log('🔴 [테스트] HTTP 에러 테스트 시작');
    // HTTP 에러 테스트
    triggerError(
      'http-error',
      'HTTP 404 에러 테스트',
      '존재하지 않는 리소스에 접근했습니다.',
      404
    );
    console.log(
      '✅ [테스트] HTTP 에러 테스트 완료 - ErrorDialog가 표시되어야 함'
    );
  };

  const testNetworkError = () => {
    console.log('🔴 [테스트] 네트워크 에러 테스트 시작');
    // 네트워크 에러 테스트
    triggerError(
      'network-error',
      '네트워크 연결 실패',
      '인터넷 연결을 확인해주세요.'
    );
    console.log(
      '✅ [테스트] 네트워크 에러 테스트 완료 - ErrorDialog가 표시되어야 함'
    );
  };

  const testApiError = () => {
    console.log('🔴 [테스트] API 에러 테스트 시작');
    // API 에러 테스트
    triggerError(
      'api-error',
      'API 요청 실패',
      '서버와의 통신 중 오류가 발생했습니다.'
    );
    console.log(
      '✅ [테스트] API 에러 테스트 완료 - ErrorDialog가 표시되어야 함'
    );
  };

  const testTimeoutError = () => {
    console.log('🔴 [테스트] 타임아웃 에러 테스트 시작');
    // 타임아웃 에러 테스트
    triggerError(
      'timeout-error',
      '요청 시간 초과',
      '서버 응답이 지연되고 있습니다.'
    );
    console.log(
      '✅ [테스트] 타임아웃 에러 테스트 완료 - ErrorDialog가 표시되어야 함'
    );
  };

  const testFetchError = async () => {
    console.log('🔴 [테스트] Fetch 에러 테스트 시작');
    // 실제 Fetch 에러 테스트 (존재하지 않는 URL)
    try {
      await fetch('/api/nonexistent-endpoint');
    } catch {
      console.log(
        '✅ [테스트] Fetch 에러 테스트 완료 - 네트워크 에러가 감지되어야 함'
      );
    }
  };

  const testPromiseRejection = () => {
    console.log('🔴 [테스트] Promise Rejection 테스트 시작');
    // Promise rejection 테스트
    Promise.reject(new Error('테스트 Promise Rejection 에러'));
    console.log(
      '✅ [테스트] Promise Rejection 테스트 완료 - unhandledrejection 이벤트가 감지되어야 함'
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <div>
          <div className="flex items-start justify-center gap-4">
            <h1 className="text-5xl mb-4">PDF E-Link System</h1>
            <div className="mt-1 bg-white/80 border border-gray-200 rounded-md p-3 shadow-sm text-left">
              <div className="text-xs text-gray-700 leading-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">App Version:</span>
                  <VersionDisplay showBadge={true} format="short" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Browser:</span>
                  <BrowserDisplay showBadge={true} format="short" />
                </div>
                <div>
                  <span className="font-semibold">
                    Origin (접속 중인 서버) :
                  </span>{' '}
                  {getCurrentOrigin()}
                </div>
                <div>
                  <span className="font-semibold">APP_Mode (DEV / PROD) :</span>{' '}
                  {APP_MODE}
                </div>
                <div>
                  <span className="font-semibold">
                    OUT_URL (외부 호출 주소 URL):
                  </span>{' '}
                  {getExternalPublicUrl() ?? '(not set)'}
                </div>
                <div>
                  <span className="font-semibold">
                    PROXY_DOT_DO (레거시 API 유형 사용):
                  </span>{' '}
                  {String(getProxyDotDoEnabled())}
                </div>
                <div>
                  <span className="font-semibold">
                    API_EFFECTIVE (API 상위 Root URL):
                  </span>{' '}
                  {getEffectiveApiBaseUrl() ?? '(not set)'}
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">서식화 편집기와 뷰어를 선택하세요</p>
        </div>

        <div className="flex gap-6 justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FileEdit className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h2 className="mb-3">PDF Editor</h2>
            <p className="text-sm text-gray-600 mb-6">
              PDF 서식화 작성 및 편집 도구
            </p>
            <Button
              onClick={() => navigate(ROUTES.EDITOR)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              편집기 시작
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 w-80 hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Eye className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="mb-3">PDF Viewer</h2>
            <p className="text-sm text-gray-600 mb-6">
              PDF 문서 보기 및 확인 도구
            </p>
            <Button
              onClick={() => navigate(ROUTES.VIEWER)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              뷰어 시작
            </Button>
          </div>
        </div>

        {/* ErrorDialog 테스트 섹션 (개발 모드에서만 표시) */}
        {IS_DEV && (
          <div className="mt-12 space-y-6">
            {/* 기본 ErrorDialog 테스트 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bug className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">
                  ErrorDialog 테스트
                </h3>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                각 버튼을 클릭하여 ErrorDialog의 다양한 에러 타입을 테스트할 수
                있습니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  onClick={() => testErrorDialog('not-found')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  404 에러
                </Button>
                <Button
                  onClick={() => testErrorDialog('client-error')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  400 에러
                </Button>
                <Button
                  onClick={() => testErrorDialog('server-error')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  500 에러
                </Button>
                <Button
                  onClick={() => testErrorDialog('network-error')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  네트워크 에러
                </Button>
                <Button
                  onClick={() => testErrorDialog('runtime-error')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  런타임 에러
                </Button>
                <Button
                  onClick={() => testErrorDialog('general-error')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  일반 에러
                </Button>
              </div>
            </div>

            {/* 전역 에러 핸들러 테스트 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bug className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">
                  전역 에러 핸들러 테스트
                </h3>
              </div>
              <p className="text-sm text-red-700 mb-4">
                실제 HTTP 에러, 네트워크 에러, Promise rejection 등을 실시간으로
                감지합니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  onClick={testGlobalErrorHandler}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  HTTP 에러
                </Button>
                <Button
                  onClick={testNetworkError}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  네트워크 에러
                </Button>
                <Button
                  onClick={testApiError}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  API 에러
                </Button>
                <Button
                  onClick={testTimeoutError}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  타임아웃 에러
                </Button>
                <Button
                  onClick={testFetchError}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  Fetch 에러
                </Button>
                <Button
                  onClick={testPromiseRejection}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  Promise Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 하단 테스트 페이지 이동 버튼들 */}
        <div className="pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(ROUTES.API_TEST)}
              className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900"
            >
              <Bug className="w-4 h-4 mr-2" />
              API Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.LODASH_TEST)}
              className="bg-purple-300 hover:bg-purple-400 text-purple-900"
            >
              <Code className="w-4 h-4 mr-2" />
              Lodash Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.MOMENT_TEST)}
              className="bg-blue-300 hover:bg-blue-400 text-blue-900"
            >
              <Clock className="w-4 h-4 mr-2" />
              Moment.js Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.API_DATA_TEST)}
              className="bg-green-300 hover:bg-green-400 text-green-900"
            >
              <Code className="w-4 h-4 mr-2" />
              API Data Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.NETWORK_TEST)}
              className="bg-orange-300 hover:bg-orange-400 text-orange-900"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Network Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.JSON_EDITOR_TEST)}
              className="bg-slate-300 hover:bg-slate-400 text-slate-900"
            >
              <Braces className="w-4 h-4 mr-2" />
              JSON Editor Test Page
            </Button>
            <Button
              onClick={() => navigate(ROUTES.JSON_EDITOR_CUSTOM_TEST)}
              className="bg-indigo-300 hover:bg-indigo-400 text-indigo-950"
            >
              <PanelsTopLeft className="w-4 h-4 mr-2" />
              JSON Editor Custom Test Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
