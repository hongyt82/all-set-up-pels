// src/components/editor/EditorFooter.tsx
import { Slider } from '../ui/slider.tsx';

interface EditorFooterProps {
  currentFile?: string | null;
  wordCount?: number;
  pageCount?: number;
  isModified?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageChange?: (page: number) => void;
}

export function EditorFooter({
  currentPage = 1,
  totalPages = 0,
  onPrevPage,
  onNextPage,
  onPageChange,
}: EditorFooterProps) {
  const handleSliderChange = (values: number[]) => {
    if (onPageChange && totalPages > 0) {
      onPageChange(values[0]);
    }
  };

  const isDisabled = totalPages === 0;

  return (
    <footer className="editor-footer h-[32px] border-t border-gray-600 flex items-center justify-between shadow-sm flex-shrink-0 overflow-hidden px-2 bg-gray-800 min-w-[800px]">
      {/* 좌측: 페이지 네비게이션 */}
      <div className="flex items-center space-x-2 flex-shrink-0 min-w-[160px]">
        <button
          onClick={onPrevPage}
          disabled={isDisabled || currentPage <= 1}
          className="px-2 py-0.5 text-xs text-gray-200 hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded transition-colors flex-shrink-0"
        >
          이전
        </button>
        <div className="px-2 py-0.5 bg-gray-700 rounded-md border border-gray-600 shadow-sm flex-shrink-0">
          <span
            className={`text-xs font-medium whitespace-nowrap ${
              isDisabled ? 'text-gray-500' : 'text-gray-100'
            }`}
          >
            {isDisabled ? '0 / 0' : `${currentPage} / ${totalPages}`}
          </span>
        </div>
        <button
          onClick={onNextPage}
          disabled={isDisabled || currentPage >= totalPages}
          className="px-2 py-0.5 text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors flex-shrink-0"
        >
          다음
        </button>
      </div>

      {/* 중앙: 페이지 슬라이더 */}
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

      {/* 우측: 여유 공간 */}
      <div className="flex items-center space-x-2 flex-shrink-0 min-w-[160px] justify-end" />
    </footer>
  );
}
