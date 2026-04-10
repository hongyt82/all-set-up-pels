/**
 * NotFoundPage 컴포넌트
 * 존재하지 않는 라우트 접근 시 표시되는 404 페이지
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErrorStore } from '../stores/errorStore';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { showError } = useErrorStore();

  useEffect(() => {
    // 404 에러 다이얼로그 표시
    showError(
      'not-found',
      '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
      `경로: ${window.location.pathname}`,
      404
    );
  }, [showError]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-6 p-8">
        {/* 404 아이콘 */}
        <div className="flex justify-center">
          <div className="relative">
            <FileQuestion className="h-32 w-32 text-gray-300" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <span className="font-bold">404</span>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>

        {/* 경로 정보 */}
        <div className="bg-gray-200 rounded-lg px-4 py-2 inline-block">
          <code className="text-sm text-gray-700">
            {window.location.pathname}
          </code>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}
