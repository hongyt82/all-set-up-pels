/**
 * 전역 에러 처리 유틸리티
 * HTTP 에러, 네트워크 에러, 라우팅 에러 등을 실시간으로 감지하고 처리
 */

import { useErrorStore } from '../stores/errorStore';

// 에러 타입 정의
export type GlobalErrorType =
  | 'http-error'
  | 'network-error'
  | 'routing-error'
  | 'api-error'
  | 'fetch-error'
  | 'timeout-error';

// HTTP 상태 코드별 에러 타입 매핑
const getErrorTypeFromStatus = (status: number): GlobalErrorType => {
  if (status >= 400 && status < 500) return 'http-error';
  if (status >= 500) return 'http-error';
  return 'api-error';
};

// 전역 에러 핸들러 클래스
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private isInitialized = false;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  // 전역 에러 핸들러 초기화
  init() {
    if (this.isInitialized) return;

    this.setupWindowErrorHandler();
    this.setupUnhandledRejectionHandler();
    this.setupFetchErrorHandler();
    this.setupXHRErrorHandler();

    this.isInitialized = true;
    console.log('🔧 GlobalErrorHandler 초기화 완료');
  }

  // Window 에러 핸들러 (JavaScript 런타임 에러)
  private setupWindowErrorHandler() {
    window.addEventListener('error', event => {
      console.error('🚨 [GlobalErrorHandler] Window Error 감지:', event.error);
      console.log('📍 에러 위치:', {
        파일: event.filename,
        라인: event.lineno,
        컬럼: event.colno,
        메시지: event.error?.message,
      });

      const { showError } = useErrorStore.getState();
      showError(
        'runtime-error',
        event.error?.message || 'JavaScript 런타임 에러가 발생했습니다.',
        `파일: ${event.filename}\n라인: ${event.lineno}\n컬럼: ${event.colno}`
      );
    });
  }

  // Promise rejection 핸들러 (미처리 Promise 에러)
  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', event => {
      console.error(
        '🚨 [GlobalErrorHandler] Unhandled Promise Rejection 감지:',
        event.reason
      );
      console.log('📍 Promise 에러 정보:', {
        메시지: event.reason?.message,
        상태코드: event.reason?.status,
        스택: event.reason?.stack,
      });

      const { showError } = useErrorStore.getState();

      // HTTP 에러인지 확인
      if (event.reason?.status) {
        const errorType = getErrorTypeFromStatus(event.reason.status);
        console.log('🔴 HTTP 에러로 처리:', errorType, event.reason.status);
        showError(
          errorType,
          `HTTP ${event.reason.status} 에러가 발생했습니다.`,
          event.reason.message || undefined,
          event.reason.status
        );
      } else {
        console.log('🔴 런타임 에러로 처리');
        showError(
          'runtime-error',
          event.reason?.message || 'Promise 에러가 발생했습니다.',
          event.reason?.stack || undefined
        );
      }

      // 기본 동작 방지 (브라우저 콘솔 에러 방지)
      event.preventDefault();
    });
  }

  // Fetch API 에러 핸들러
  private setupFetchErrorHandler() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      console.log('🌐 [GlobalErrorHandler] Fetch 요청 시작:', args[0]);

      try {
        const response = await originalFetch(...args);

        // HTTP 에러 상태 코드 체크
        if (!response.ok) {
          const errorType = getErrorTypeFromStatus(response.status);
          const { showError } = useErrorStore.getState();

          console.error('🚨 [GlobalErrorHandler] Fetch HTTP 에러 감지:', {
            URL: response.url,
            상태: response.status,
            상태텍스트: response.statusText,
            에러타입: errorType,
          });

          let errorMessage = `HTTP ${response.status} 에러`;
          if (response.status === 404) {
            errorMessage = '요청한 리소스를 찾을 수 없습니다.';
          } else if (response.status >= 500) {
            errorMessage = '서버 내부 오류가 발생했습니다.';
          }

          showError(
            errorType,
            errorMessage,
            `URL: ${response.url}\n상태: ${response.status} ${response.statusText}`,
            response.status
          );
        } else {
          console.log(
            '✅ [GlobalErrorHandler] Fetch 요청 성공:',
            response.status
          );
        }

        return response;
      } catch (error) {
        // 네트워크 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('🚨 [GlobalErrorHandler] Fetch 네트워크 에러 감지:', {
            URL: args[0],
            에러메시지: error.message,
          });

          const { showError } = useErrorStore.getState();
          showError(
            'network-error',
            '네트워크 연결을 확인해주세요.',
            `URL: ${args[0]}\n에러: ${error.message}`
          );
        }
        throw error;
      }
    };
  }

  // XMLHttpRequest 에러 핸들러
  private setupXHRErrorHandler() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      method,
      url,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      (this as any)._url = url;
      (this as any)._method = method;
      console.log('🌐 [GlobalErrorHandler] XHR 요청 시작:', { method, url });
      return originalXHROpen.call(
        this,
        method,
        url,
        async ?? true,
        username ?? null,
        password ?? null
      );
    };

    XMLHttpRequest.prototype.send = function (data) {
      this.addEventListener('error', () => {
        console.error('🚨 [GlobalErrorHandler] XHR 네트워크 에러 감지:', {
          URL: (this as any)._url,
          Method: (this as any)._method,
        });

        const { showError } = useErrorStore.getState();
        showError(
          'network-error',
          '네트워크 요청 중 오류가 발생했습니다.',
          `URL: ${(this as any)._url}\nMethod: ${(this as any)._method}`
        );
      });

      this.addEventListener('timeout', () => {
        console.error('🚨 [GlobalErrorHandler] XHR 타임아웃 에러 감지:', {
          URL: (this as any)._url,
          Method: (this as any)._method,
        });

        const { showError } = useErrorStore.getState();
        showError(
          'timeout-error',
          '요청 시간이 초과되었습니다.',
          `URL: ${(this as any)._url}\nMethod: ${(this as any)._method}`
        );
      });

      return originalXHRSend.apply(this, [data]);
    };
  }

  // 수동 에러 발생 (테스트용)
  triggerError(
    type: GlobalErrorType,
    message: string,
    details?: string,
    statusCode?: number
  ) {
    console.log('🔴 [GlobalErrorHandler] 수동 에러 발생:', {
      타입: type,
      메시지: message,
      상세정보: details,
      상태코드: statusCode,
    });

    const { showError } = useErrorStore.getState();
    showError(type, message, details, statusCode);
  }

  // API 에러 처리 헬퍼
  handleApiError(error: any, context?: string) {
    const { showError } = useErrorStore.getState();

    if (error.response) {
      // HTTP 응답 에러
      const status = error.response.status;
      const errorType = getErrorTypeFromStatus(status);

      showError(
        errorType,
        `API 요청 실패 (${status})`,
        `${context ? `컨텍스트: ${context}\n` : ''}URL: ${error.config?.url}\n응답: ${error.response.data?.message || error.message}`,
        status
      );
    } else if (error.request) {
      // 네트워크 에러
      showError(
        'network-error',
        '네트워크 연결 오류',
        `${context ? `컨텍스트: ${context}\n` : ''}URL: ${error.config?.url}`
      );
    } else {
      // 기타 에러
      showError(
        'api-error',
        'API 요청 중 오류가 발생했습니다.',
        `${context ? `컨텍스트: ${context}\n` : ''}에러: ${error.message}`
      );
    }
  }
}

// 전역 인스턴스 export
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// 편의 함수들
export const triggerError = (
  type: GlobalErrorType,
  message: string,
  details?: string,
  statusCode?: number
) => {
  globalErrorHandler.triggerError(type, message, details, statusCode);
};

export const handleApiError = (error: any, context?: string) => {
  globalErrorHandler.handleApiError(error, context);
};
