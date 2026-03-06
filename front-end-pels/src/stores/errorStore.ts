/**
 * 에러 상태 관리 스토어 (Zustand)
 * 전역 에러 처리를 위한 상태 관리
 */

import { create } from 'zustand';

export type ErrorType =
  | 'not-found' // 404
  | 'client-error' // 400대
  | 'server-error' // 500대
  | 'network-error' // 네트워크 에러
  | 'runtime-error' // React 런타임 에러
  | 'general-error' // 일반 에러
  | 'http-error' // HTTP 에러
  | 'routing-error' // 라우팅 에러
  | 'api-error' // API 에러
  | 'fetch-error' // Fetch 에러
  | 'timeout-error'; // 타임아웃 에러

export interface ErrorState {
  // 에러 정보
  isErrorOpen: boolean;
  errorType: ErrorType | null;
  errorMessage: string;
  errorDetails?: string;
  statusCode?: number;

  // 에러 표시 액션
  showError: (
    type: ErrorType,
    message: string,
    details?: string,
    statusCode?: number
  ) => void;

  // 에러 닫기 액션
  closeError: () => void;

  // 에러 초기화 액션
  resetError: () => void;
}

export const useErrorStore = create<ErrorState>(set => ({
  // 초기 상태
  isErrorOpen: false,
  errorType: null,
  errorMessage: '',
  errorDetails: undefined,
  statusCode: undefined,

  // 에러 표시
  showError: (type, message, details, statusCode) => {
    set({
      isErrorOpen: true,
      errorType: type,
      errorMessage: message,
      errorDetails: details,
      statusCode,
    });
  },

  // 에러 닫기
  closeError: () => {
    set({
      isErrorOpen: false,
    });
  },

  // 에러 초기화
  resetError: () => {
    set({
      isErrorOpen: false,
      errorType: null,
      errorMessage: '',
      errorDetails: undefined,
      statusCode: undefined,
    });
  },
}));
