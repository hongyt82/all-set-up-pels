/**
 * useBoundaryConstraint 훅
 * 컴포넌트 드래그/리사이즈 시 PDF 페이지 경계를 벗어나지 않도록 제한하는 커스텀 훅
 */

import { useCallback, useRef, useState } from 'react';
import {
  constrainToBoundary,
  constrainSizeToBoundary,
  adjustDragDelta,
  isNearBoundary,
  canPlaceComponent,
  calculateCenteredPosition,
  snapToGrid,
  logBoundaryConstraint,
  PDF_BOUNDARY,
  type ComponentPosition,
} from '../lib/boundaryUtils';
import { devWarn } from '../utils/devConsole';

export interface UseBoundaryConstraintOptions {
  enableSnap?: boolean; // 그리드 스냅 활성화
  snapGridSize?: number; // 그리드 크기 (px)
  enableLogging?: boolean; // 디버그 로깅
  minWidth?: number; // 최소 너비
  minHeight?: number; // 최소 높이
}

export interface BoundaryState {
  isNearBoundary: boolean;
  nearLeft: boolean;
  nearRight: boolean;
  nearTop: boolean;
  nearBottom: boolean;
}

export function useBoundaryConstraint(
  componentId: string,
  initialPosition: ComponentPosition,
  options: UseBoundaryConstraintOptions = {}
) {
  const {
    enableSnap = false,
    snapGridSize = 5,
    enableLogging = false,
    minWidth = 20,
    minHeight = 20,
  } = options;

  const [position, setPosition] = useState<ComponentPosition>(initialPosition);
  const [boundaryState, setBoundaryState] = useState<BoundaryState>({
    isNearBoundary: false,
    nearLeft: false,
    nearRight: false,
    nearTop: false,
    nearBottom: false,
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * 드래그 시작
   */
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX, y: clientY };
  }, []);

  /**
   * 드래그 중 - 강화된 경계 체크
   */
  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStartRef.current) return;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      // 델타 조정 (경계 고려)
      const adjusted = adjustDragDelta(position, deltaX, deltaY);

      let newX = position.x + adjusted.deltaX;
      let newY = position.y + adjusted.deltaY;

      // 스냅 그리드 적용
      if (enableSnap) {
        const snapped = snapToGrid(newX, newY, snapGridSize);
        newX = snapped.x;
        newY = snapped.y;
      }

      // 경계 Rule 적용 (강제)
      const constrained = constrainToBoundary({
        x: newX,
        y: newY,
        width: position.width,
        height: position.height,
      });

      // 추가 안전장치: 절대로 경계를 벗어날 수 없도록
      const safeX = Math.max(
        0,
        Math.min(constrained.x, PDF_BOUNDARY.width - position.width)
      );
      const safeY = Math.max(
        0,
        Math.min(constrained.y, PDF_BOUNDARY.height - position.height)
      );

      // 로깅
      if (enableLogging && constrained.isConstrained) {
        logBoundaryConstraint(componentId, position, constrained);
      }

      // 경계 근처 상태 업데이트
      const nearBoundary = isNearBoundary({
        x: safeX,
        y: safeY,
        width: position.width,
        height: position.height,
      });

      setBoundaryState({
        isNearBoundary:
          nearBoundary.nearLeft ||
          nearBoundary.nearRight ||
          nearBoundary.nearTop ||
          nearBoundary.nearBottom,
        ...nearBoundary,
      });

      // 위치 업데이트
      setPosition(prev => ({
        ...prev,
        x: safeX,
        y: safeY,
      }));

      // 드래그 시작점 업데이트
      dragStartRef.current = { x: clientX, y: clientY };
    },
    [position, enableSnap, snapGridSize, enableLogging, componentId]
  );

  /**
   * 드래그 종료
   */
  const handleDragEnd = useCallback(() => {
    dragStartRef.current = null;

    // 경계 근처 상태 초기화
    setBoundaryState({
      isNearBoundary: false,
      nearLeft: false,
      nearRight: false,
      nearTop: false,
      nearBottom: false,
    });
  }, []);

  /**
   * 리사이즈
   */
  const handleResize = useCallback(
    (newWidth: number, newHeight: number) => {
      // 최소 크기 보장
      const width = Math.max(minWidth, newWidth);
      const height = Math.max(minHeight, newHeight);

      // 경계 Rule 적용
      const constrained = constrainSizeToBoundary(
        position.x,
        position.y,
        width,
        height
      );

      if (enableLogging && constrained.isConstrained) {
        devWarn(`[Boundary] Component ${componentId} size constrained:`, {
          requested: { width, height },
          constrained: { width: constrained.width, height: constrained.height },
        });
      }

      setPosition(prev => ({
        ...prev,
        width: constrained.width,
        height: constrained.height,
      }));
    },
    [position.x, position.y, minWidth, minHeight, enableLogging, componentId]
  );

  /**
   * 위치 직접 설정 (경계 Rule 적용)
   */
  const setPositionConstrained = useCallback(
    (newPosition: Partial<ComponentPosition>) => {
      const updated = { ...position, ...newPosition };

      const constrained = constrainToBoundary(updated);

      setPosition({
        x: constrained.x,
        y: constrained.y,
        width: updated.width,
        height: updated.height,
      });
    },
    [position]
  );

  /**
   * 중심점 기준으로 위치 설정
   */
  const setCenteredPosition = useCallback(
    (centerX: number, centerY: number) => {
      const centered = calculateCenteredPosition(
        centerX,
        centerY,
        position.width,
        position.height
      );

      setPosition(centered);
    },
    [position.width, position.height]
  );

  /**
   * 배치 가능 여부 확인
   */
  const checkCanPlace = useCallback(
    (x: number, y: number, width?: number, height?: number) => {
      return canPlaceComponent(
        x,
        y,
        width ?? position.width,
        height ?? position.height
      );
    },
    [position.width, position.height]
  );

  /**
   * 경계 정보 가져오기
   */
  const getBoundaryInfo = useCallback(() => {
    return {
      boundary: PDF_BOUNDARY,
      position,
      remainingSpace: {
        right: PDF_BOUNDARY.width - (position.x + position.width),
        bottom: PDF_BOUNDARY.height - (position.y + position.height),
        left: position.x,
        top: position.y,
      },
    };
  }, [position]);

  return {
    // 상태
    position,
    boundaryState,

    // 드래그 핸들러
    handleDragStart,
    handleDrag,
    handleDragEnd,

    // 리사이즈 핸들러
    handleResize,

    // 위치 설정
    setPosition: setPositionConstrained,
    setCenteredPosition,

    // 유틸리티
    checkCanPlace,
    getBoundaryInfo,
  };
}

/**
 * 간단한 경계 체크만 필요한 경우를 위한 경량 훅
 */
export function useBoundaryCheck() {
  const checkBoundary = useCallback((position: ComponentPosition) => {
    const constrained = constrainToBoundary(position);
    return {
      isValid: !constrained.isConstrained,
      constrained,
    };
  }, []);

  const checkSize = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const constrained = constrainSizeToBoundary(x, y, width, height);
      return {
        isValid: !constrained.isConstrained,
        constrained,
      };
    },
    []
  );

  return {
    checkBoundary,
    checkSize,
    PDF_BOUNDARY,
  };
}
