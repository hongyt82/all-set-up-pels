/**
 * ErrorBoundary 컴포넌트
 * React 런타임 에러를 캐치하여 에러 다이얼로그로 표시
 */

import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { useErrorStore } from '../../stores/errorStore';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary는 클래스 컴포넌트로만 작성 가능
class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Zustand 스토어에 에러 등록
    const { showError } = useErrorStore.getState();
    showError(
      'runtime-error',
      error.message,
      errorInfo.componentStack || undefined
    );

    // 에러 로깅 (실제 프로젝트에서는 에러 모니터링 서비스로 전송)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // 실제 프로젝트에서는 Sentry, LogRocket 등의 서비스로 전송
    console.group('🚨 Error Boundary Log');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  render() {
    // 에러가 발생해도 자식 컴포넌트를 계속 렌더링
    // 에러 다이얼로그가 전역으로 표시됨
    return this.props.children;
  }
}

// 함수형 컴포넌트로 감싸서 export
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}
