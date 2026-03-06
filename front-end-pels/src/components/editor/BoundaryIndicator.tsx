/**
 * BoundaryIndicator 컴포넌트
 * PDF 페이지 경계를 시각적으로 표시하는 인디케이터
 * 드래그 중 경계에 가까워지면 경고 표시
 */

import { XCircle, AlertTriangle } from 'lucide-react';
import { PDF_BOUNDARY } from '../../lib/boundaryUtils';

interface BoundaryIndicatorProps {
  showWarning?: boolean;
  nearLeft?: boolean;
  nearRight?: boolean;
  nearTop?: boolean;
  nearBottom?: boolean;
}

export function BoundaryIndicator({
  showWarning = false,
  nearLeft = false,
  nearRight = false,
  nearTop = false,
  nearBottom = false,
}: BoundaryIndicatorProps) {
  if (!showWarning) return null;

  // 경고 위치 텍스트
  const warningPosition = [];
  if (nearLeft) warningPosition.push('좌측');
  if (nearRight) warningPosition.push('우측');
  if (nearTop) warningPosition.push('상단');
  if (nearBottom) warningPosition.push('하단');

  return (
    <>
      {/* 경계 경고 메시지 */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-xl z-50 pointer-events-none animate-pulse">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            {warningPosition.join('·')} 경계 근처입니다! 영역을 벗어날 수
            없습니다.
          </span>
        </div>
      </div>

      {/* 좌측 경계 경고 */}
      {nearLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 bg-red-500 opacity-70 animate-pulse pointer-events-none z-50"
          style={{ height: `${PDF_BOUNDARY.height}px` }}
        />
      )}

      {/* 우측 경계 경고 */}
      {nearRight && (
        <div
          className="absolute top-0 bottom-0 w-2 bg-red-500 opacity-70 animate-pulse pointer-events-none z-50"
          style={{
            left: `${PDF_BOUNDARY.width - 2}px`,
            height: `${PDF_BOUNDARY.height}px`,
          }}
        >
          <XCircle
            className="absolute -right-5 top-1/2 transform -translate-y-1/2 text-red-500 w-8 h-8 drop-shadow-lg"
            strokeWidth={3}
          />
        </div>
      )}

      {/* 상단 경계 경고 */}
      {nearTop && (
        <div
          className="absolute left-0 right-0 top-0 h-2 bg-red-500 opacity-70 animate-pulse pointer-events-none z-50"
          style={{ width: `${PDF_BOUNDARY.width}px` }}
        />
      )}

      {/* 하단 경계 경고 */}
      {nearBottom && (
        <div
          className="absolute left-0 right-0 h-2 bg-red-500 opacity-70 animate-pulse pointer-events-none z-50"
          style={{
            top: `${PDF_BOUNDARY.height - 2}px`,
            width: `${PDF_BOUNDARY.width}px`,
          }}
        >
          <XCircle
            className="absolute left-1/2 -bottom-5 transform -translate-x-1/2 text-red-500 w-8 h-8 drop-shadow-lg"
            strokeWidth={3}
          />
        </div>
      )}

      {/* 코너 마커 (항상 표시) */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* 좌상단 */}
        <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-gray-300 opacity-30" />

        {/* 우상단 */}
        <div
          className="absolute top-0 w-4 h-4 border-r-2 border-t-2 border-gray-300 opacity-30"
          style={{ left: `${PDF_BOUNDARY.width - 16}px` }}
        />

        {/* 좌하단 */}
        <div
          className="absolute left-0 w-4 h-4 border-l-2 border-b-2 border-gray-300 opacity-30"
          style={{ top: `${PDF_BOUNDARY.height - 16}px` }}
        />

        {/* 우하단 */}
        <div
          className="absolute w-4 h-4 border-r-2 border-b-2 border-gray-300 opacity-30"
          style={{
            left: `${PDF_BOUNDARY.width - 16}px`,
            top: `${PDF_BOUNDARY.height - 16}px`,
          }}
        />
      </div>
    </>
  );
}

/**
 * 경계 안내 오버레이
 * 처음 카테고리 선택 시 경계 정보를 표시
 */
interface BoundaryGuideProps {
  show: boolean;
  onDismiss: () => void;
}

export function BoundaryGuide({ show, onDismiss }: BoundaryGuideProps) {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center pointer-events-none z-50"
      style={{
        width: `${PDF_BOUNDARY.width}px`,
        height: `${PDF_BOUNDARY.height}px`,
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md pointer-events-auto">
        <h3 className="text-gray-900 mb-2 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          경계 제한 안내
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          컴포넌트는 PDF 페이지 영역({PDF_BOUNDARY.width}x{PDF_BOUNDARY.height}
          px)을 벗어날 수 없습니다. 드래그 시 자동으로 경계 내로 제한됩니다.
        </p>
        <button
          onClick={onDismiss}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}
