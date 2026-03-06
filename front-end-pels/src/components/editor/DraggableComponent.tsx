/**
 * DraggableComponent
 * 경계 제한이 적용된 드래그 가능한 컴포넌트 래퍼
 * 모든 오버레이 컴포넌트에서 사용
 * 절대로 PDF 페이지 영역(520x736px)을 벗어날 수 없음
 */

import type { ReactNode } from 'react';
import { useRef, useState, useEffect } from 'react';
import { useBoundaryConstraint } from '../../hooks/useBoundaryConstraint';
import { useEditorStore } from '../../stores/editorStore';
import { BoundaryIndicator } from './BoundaryIndicator.tsx';
import { PDF_BOUNDARY, isOutOfBounds } from '../../lib/boundaryUtils';

interface DraggableComponentProps {
  id: string;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  pageNumber: number;
  children: ReactNode;
  onPositionChange?: (x: number, y: number) => void;
  onSizeChange?: (width: number, height: number) => void;
  onDelete?: () => void;
  resizable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function DraggableComponent({
  id,
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  pageNumber,
  children,
  onPositionChange,
  onSizeChange,
  onDelete,
  resizable = false,
  className = '',
  style = {},
}: DraggableComponentProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isOutOfBoundsWarning, setIsOutOfBoundsWarning] = useState(false);

  const { updateComponentPosition, updateComponentSize } = useEditorStore();

  const {
    position,
    boundaryState,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResize,
  } = useBoundaryConstraint(
    id,
    {
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight,
    },
    {
      enableSnap: true,
      snapGridSize: 5,
      enableLogging: true,
      minWidth: 30,
      minHeight: 30,
    }
  );

  // 실시간 경계 체크
  useEffect(() => {
    const outOfBounds = isOutOfBounds(position);
    setIsOutOfBoundsWarning(outOfBounds);

    if (outOfBounds) {
      console.warn(`⚠️ [경계 벗어남] Component ${id}:`, {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        경계: PDF_BOUNDARY,
      });
    }
  }, [position, id]);

  // 위치 변경 시 스토어 업데이트
  useEffect(() => {
    updateComponentPosition(pageNumber, id, position.x, position.y);
    onPositionChange?.(position.x, position.y);
  }, [
    position.x,
    position.y,
    pageNumber,
    id,
    updateComponentPosition,
    onPositionChange,
  ]);

  // 크기 변경 시 스토어 업데이트
  useEffect(() => {
    updateComponentSize(pageNumber, id, position.width, position.height);
    onSizeChange?.(position.width, position.height);
  }, [
    position.width,
    position.height,
    pageNumber,
    id,
    updateComponentSize,
    onSizeChange,
  ]);

  // 마우스 다운 - 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 좌클릭만

    e.stopPropagation();
    setIsDragging(true);
    setIsSelected(true);
    handleDragStart(e.clientX, e.clientY);
  };

  // 마우스 이동 - 드래그 중
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Delete 키로 삭제
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && onDelete) {
        onDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, onDelete]);

  // 외부 클릭 시 선택 해제
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(e.target as Node)
      ) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* 경계 인디케이터 (드래그 중에만 표시) */}
      {isDragging && (
        <BoundaryIndicator
          showWarning={boundaryState.isNearBoundary}
          nearLeft={boundaryState.nearLeft}
          nearRight={boundaryState.nearRight}
          nearTop={boundaryState.nearTop}
          nearBottom={boundaryState.nearBottom}
        />
      )}

      {/* 경계 벗어남 경고 메시지 */}
      {isOutOfBoundsWarning && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs py-2 px-3 text-center z-50 animate-pulse shadow-lg">
          ⚠️ 컴포넌트가 PDF 영역을 벗어났습니다! 영역 안으로 이동해주세요.
        </div>
      )}

      {/* 드래그 가능한 컴포넌트 */}
      <div
        ref={componentRef}
        onMouseDown={handleMouseDown}
        className={`absolute cursor-move transition-shadow ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${isDragging ? 'opacity-80 cursor-grabbing' : ''} ${
          isOutOfBoundsWarning ? 'ring-4 ring-red-500 animate-pulse' : ''
        } ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
          userSelect: 'none',
          touchAction: 'none',
          ...style,
        }}
      >
        {children}

        {/* 선택 시 삭제 버튼 */}
        {isSelected && onDelete && (
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors z-10"
            title="삭제 (Delete)"
          >
            ×
          </button>
        )}

        {/* 리사이즈 핸들 (resizable=true인 경우) */}
        {resizable && isSelected && (
          <>
            {/* 우하단 리사이즈 핸들 */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize z-10"
              onMouseDown={e => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = position.width;
                const startHeight = position.height;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaY = moveEvent.clientY - startY;
                  handleResize(startWidth + deltaX, startHeight + deltaY);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </>
        )}

        {/* 드래그 중 좌표 표시 */}
        {isDragging && (
          <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
            x: {Math.round(position.x)}, y: {Math.round(position.y)}
          </div>
        )}
      </div>
    </>
  );
}
