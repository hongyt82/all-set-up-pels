// src/components/viewer/ViewerFooter.tsx
import { Slider } from '../ui/slider.tsx';

interface ViewerFooterProps {
  currentFile?: string | null;
  fileSize?: string;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageChange?: (page: number) => void;
}

export function ViewerFooter({
  currentFile,
  fileSize,
  currentPage = 1,
  totalPages = 0,
  onPrevPage,
  onNextPage,
  onPageChange,
}: ViewerFooterProps) {
  const isDisabled = totalPages === 0;

  const handleSliderChange = (values: number[]) => {
    if (onPageChange && totalPages > 0) {
      onPageChange(values[0]);
    }
  };

  return (
    <footer className="viewer-footer h-[32px] border-t border-emerald-900 flex items-center justify-between shadow-sm flex-shrink-0 overflow-hidden px-2 bg-[#003a34] min-w-[800px]">
      {/* 좌측: 페이지 네비게이션 (EditorFooter와 동일 패턴) */}
      <div className="flex items-center space-x-2 flex-shrink-0 min-w-[160px]">
        <button
          onClick={onPrevPage}
          disabled={isDisabled || currentPage <= 1}
          className="px-2 py-0.5 text-xs text-emerald-50 hover:bg-emerald-900 disabled:text-emerald-500 disabled:cursor-not-allowed rounded transition-colors flex-shrink-0"
        >
          이전
        </button>

        <div className="px-2 py-0.5 bg-emerald-900 rounded-md border border-emerald-700 shadow-sm flex-shrink-0">
          <span
            className={`text-xs font-medium whitespace-nowrap ${
              isDisabled ? 'text-emerald-500' : 'text-emerald-50'
            }`}
          >
            {isDisabled ? '0 / 0' : `${currentPage} / ${totalPages}`}
          </span>
        </div>

        <button
          onClick={onNextPage}
          disabled={isDisabled || currentPage >= totalPages}
          className="px-2 py-0.5 text-xs bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed rounded transition-colors flex-shrink-0"
        >
          다음
        </button>
      </div>

      {/* 중앙: 페이지 슬라이더 (EditorFooter와 동일 패턴) */}
      <div className="flex items-center justify-center flex-1 px-3 min-w-[200px] max-w-[400px]">
        <div
          className={`w-full max-w-xs flex-shrink-0 px-1 ${
            isDisabled ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <Slider
            value={[isDisabled ? 0 : currentPage]}
            onValueChange={handleSliderChange}
            max={isDisabled ? 1 : totalPages}
            min={isDisabled ? 0 : 1}
            step={1}
            disabled={isDisabled}
            className="w-full slider-custom"
          />
        </div>
      </div>

      {/* 우측: 파일 정보 (선택 사항) */}
      <div className="flex items-center space-x-2 flex-shrink-0 min-w-[160px] justify-end text-[11px] text-emerald-50">
        {currentFile && (
          <span className="truncate max-w-[220px]" title={currentFile}>
            파일: {currentFile}
          </span>
        )}
        {fileSize && <span>크기: {fileSize}</span>}
      </div>
    </footer>
  );
}
