/**
 * ErrorDialog 컴포넌트
 * 400대/500대 에러 및 런타임 에러 표시를 위한 통합 다이얼로그
 * InfoDialog, ConfirmDialog와 통일된 디자인 적용
 */

import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog.tsx';
import { useErrorStore } from '../../stores/errorStore';
import { DIALOG_MESSAGES } from '../../constants/dialogMessages';
import {
  AlertTriangle,
  ServerCrash,
  Wifi,
  XCircle,
  FileQuestion,
} from 'lucide-react';

export function ErrorDialog() {
  const navigate = useNavigate();
  const {
    isErrorOpen,
    errorType,
    errorMessage,
    errorDetails,
    statusCode,
    closeError,
    resetError,
  } = useErrorStore();

  // 에러 타입에 따른 메시지 가져오기
  const getErrorContent = () => {
    switch (errorType) {
      case 'not-found':
        return DIALOG_MESSAGES.ERROR.NOT_FOUND;
      case 'client-error':
        return DIALOG_MESSAGES.ERROR.CLIENT_ERROR;
      case 'server-error':
        return DIALOG_MESSAGES.ERROR.SERVER_ERROR;
      case 'network-error':
        return DIALOG_MESSAGES.ERROR.NETWORK_ERROR;
      case 'runtime-error':
        return DIALOG_MESSAGES.ERROR.RUNTIME_ERROR;
      case 'http-error':
      case 'api-error':
      case 'fetch-error':
      case 'timeout-error':
      case 'routing-error':
        return DIALOG_MESSAGES.ERROR.GENERAL_ERROR;
      default:
        return DIALOG_MESSAGES.ERROR.GENERAL_ERROR;
    }
  };

  // 에러 타입에 따른 아이콘 가져오기
  const getErrorIcon = () => {
    const iconClass = 'h-5 w-5';
    switch (errorType) {
      case 'not-found':
        return <FileQuestion className={`${iconClass} text-yellow-600`} />;
      case 'client-error':
        return <XCircle className={`${iconClass} text-orange-600`} />;
      case 'server-error':
        return <ServerCrash className={`${iconClass} text-red-600`} />;
      case 'network-error':
        return <Wifi className={`${iconClass} text-purple-600`} />;
      case 'runtime-error':
        return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'http-error':
      case 'api-error':
      case 'fetch-error':
        return <ServerCrash className={`${iconClass} text-red-600`} />;
      case 'timeout-error':
        return <Wifi className={`${iconClass} text-purple-600`} />;
      case 'routing-error':
        return <FileQuestion className={`${iconClass} text-yellow-600`} />;
      default:
        return <AlertTriangle className={`${iconClass} text-gray-600`} />;
    }
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    // 404 에러인 경우 홈으로 이동
    if (errorType === 'not-found') {
      resetError();
      navigate('/');
      return;
    }
    // 런타임 에러인 경우 새로고침
    if (errorType === 'runtime-error') {
      resetError();
      window.location.reload();
      return;
    }

    // 나머지 에러는 다이얼로그만 닫기
    closeError();
  };

  const content = getErrorContent();
  const displayMessage = errorMessage || content.description;
  const displayTitle = content.title;

  // 상세 정보 표시 (statusCode 또는 errorDetails가 있는 경우)
  const detailsText = errorDetails
    ? `\n\n상세 정보:\n${errorDetails}`
    : statusCode
      ? `\n\n상태 코드: ${statusCode}`
      : '';

  return (
    <AlertDialog open={isErrorOpen} onOpenChange={closeError}>
      <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 flex items-center gap-2">
            {getErrorIcon()}
            {displayTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 whitespace-pre-line">
            {displayMessage}
            {detailsText && (
              <span className="text-gray-500 text-sm block mt-2">
                {detailsText}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
