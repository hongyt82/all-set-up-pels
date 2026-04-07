/**
 * 경계 제한 유틸리티
 * 오버레이 위에 배치되는 컴포넌트들이 PDF 페이지 영역을 넘어가지 않도록 제한
 */

import { devWarn } from '../utils/devConsole';

/**
 * PDF 페이지 경계 상수 (A4 비율 고정)
 */
export const PDF_BOUNDARY = {
  width: 520, // PDF 페이지 너비
  height: 736, // PDF 페이지 높이
  minX: 0,
  minY: 0,
} as const;

/**
 * 컴포넌트 위치 인터페이스
 */
export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 경계 Rule 결과 인터페이스
 */
export interface BoundaryConstraintResult {
  x: number;
  y: number;
  isConstrained: boolean;
  constrainedX: boolean;
  constrainedY: boolean;
}

/**
 * 컴포넌트 위치가 경계를 벗어나는지 체크
 */
export function isOutOfBounds(position: ComponentPosition): boolean {
  const { x, y, width, height } = position;

  return (
    x < PDF_BOUNDARY.minX ||
    y < PDF_BOUNDARY.minY ||
    x + width > PDF_BOUNDARY.width ||
    y + height > PDF_BOUNDARY.height
  );
}

/**
 * 컴포넌트 위치를 경계 내로 제한
 * 드래그 시 사용
 * 절대로 경계를 벗어날 수 없도록 강제 제한
 */
export function constrainToBoundary(
  position: ComponentPosition
): BoundaryConstraintResult {
  const { x, y, width, height } = position;

  let constrainedX = x;
  let constrainedY = y;
  let wasConstrainedX = false;
  let wasConstrainedY = false;

  // 좌측 경계 체크
  if (constrainedX < PDF_BOUNDARY.minX) {
    constrainedX = PDF_BOUNDARY.minX;
    wasConstrainedX = true;
  }

  // 우측 경계 체크
  if (constrainedX + width > PDF_BOUNDARY.width) {
    constrainedX = PDF_BOUNDARY.width - width;
    wasConstrainedX = true;
  }

  // 상단 경계 체크
  if (constrainedY < PDF_BOUNDARY.minY) {
    constrainedY = PDF_BOUNDARY.minY;
    wasConstrainedY = true;
  }

  // 하단 경계 체크
  if (constrainedY + height > PDF_BOUNDARY.height) {
    constrainedY = PDF_BOUNDARY.height - height;
    wasConstrainedY = true;
  }

  // 이중 안전장치: 최종 값이 경계를 벗어나지 않도록 강제 클램핑
  const finalX = Math.max(
    PDF_BOUNDARY.minX,
    Math.min(constrainedX, PDF_BOUNDARY.width - width)
  );
  const finalY = Math.max(
    PDF_BOUNDARY.minY,
    Math.min(constrainedY, PDF_BOUNDARY.height - height)
  );

  return {
    x: finalX,
    y: finalY,
    isConstrained:
      wasConstrainedX || wasConstrainedY || finalX !== x || finalY !== y,
    constrainedX: wasConstrainedX || finalX !== x,
    constrainedY: wasConstrainedY || finalY !== y,
  };
}

/**
 * 리사이즈 시 경계를 벗어나지 않도록 제한
 * width/height 조정 시 사용
 */
export function constrainSizeToBoundary(
  x: number,
  y: number,
  width: number,
  height: number
): { width: number; height: number; isConstrained: boolean } {
  let constrainedWidth = width;
  let constrainedHeight = height;
  let wasConstrained = false;

  // 우측 경계를 넘지 않도록 너비 제한
  if (x + constrainedWidth > PDF_BOUNDARY.width) {
    constrainedWidth = PDF_BOUNDARY.width - x;
    wasConstrained = true;
  }

  // 하단 경계를 넘지 않도록 높이 제한
  if (y + constrainedHeight > PDF_BOUNDARY.height) {
    constrainedHeight = PDF_BOUNDARY.height - y;
    wasConstrained = true;
  }

  // 최소 크기 보장
  constrainedWidth = Math.max(20, constrainedWidth);
  constrainedHeight = Math.max(20, constrainedHeight);

  return {
    width: constrainedWidth,
    height: constrainedHeight,
    isConstrained: wasConstrained,
  };
}

/**
 * 마우스 이벤트 좌표를 PDF 페이지 내부 좌표로 변환
 * 오버레이 기준 좌표계로 변환
 */
export function convertMouseToPdfCoordinate(
  mouseX: number,
  mouseY: number,
  pdfContainerRect: DOMRect
): { x: number; y: number; isInsideBoundary: boolean } {
  // 컨테이너 기준 상대 좌표 계산
  const relativeX = mouseX - pdfContainerRect.left;
  const relativeY = mouseY - pdfContainerRect.top;

  // 경계 체크
  const isInsideBoundary =
    relativeX >= PDF_BOUNDARY.minX &&
    relativeX <= PDF_BOUNDARY.width &&
    relativeY >= PDF_BOUNDARY.minY &&
    relativeY <= PDF_BOUNDARY.height;

  return {
    x: relativeX,
    y: relativeY,
    isInsideBoundary,
  };
}

/**
 * 컴포넌트가 배치 가능한 위치인지 확인
 * 생성 시점에 사용
 */
export function canPlaceComponent(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return (
    x >= PDF_BOUNDARY.minX &&
    y >= PDF_BOUNDARY.minY &&
    x + width <= PDF_BOUNDARY.width &&
    y + height <= PDF_BOUNDARY.height
  );
}

/**
 * 컴포넌트 중심점을 기준으로 배치 가능한 위치 계산
 * 클릭 위치를 중심으로 컴포넌트 배치 시 사용
 */
export function calculateCenteredPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number
): ComponentPosition {
  const x = centerX - width / 2;
  const y = centerY - height / 2;

  const constrained = constrainToBoundary({ x, y, width, height });

  return {
    x: constrained.x,
    y: constrained.y,
    width,
    height,
  };
}

/**
 * 경계 근처에 있는지 확인 (시각적 피드백용)
 * 드래그 중 경계에 가까워지면 표시
 */
export function isNearBoundary(
  position: ComponentPosition,
  threshold: number = 10
): {
  nearLeft: boolean;
  nearRight: boolean;
  nearTop: boolean;
  nearBottom: boolean;
} {
  const { x, y, width, height } = position;

  return {
    nearLeft: x <= threshold,
    nearRight: x + width >= PDF_BOUNDARY.width - threshold,
    nearTop: y <= threshold,
    nearBottom: y + height >= PDF_BOUNDARY.height - threshold,
  };
}

/**
 * 복수 컴포넌트의 경계 박스 계산
 * 그룹 선택 시 사용
 */
export function calculateBoundingBox(
  components: ComponentPosition[]
): ComponentPosition | null {
  if (components.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  components.forEach(comp => {
    minX = Math.min(minX, comp.x);
    minY = Math.min(minY, comp.y);
    maxX = Math.max(maxX, comp.x + comp.width);
    maxY = Math.max(maxY, comp.y + comp.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 드래그 델타를 경계를 고려하여 조정
 */
export function adjustDragDelta(
  currentPosition: ComponentPosition,
  deltaX: number,
  deltaY: number
): { deltaX: number; deltaY: number } {
  const newX = currentPosition.x + deltaX;
  const newY = currentPosition.y + deltaY;

  const constrained = constrainToBoundary({
    x: newX,
    y: newY,
    width: currentPosition.width,
    height: currentPosition.height,
  });

  return {
    deltaX: constrained.x - currentPosition.x,
    deltaY: constrained.y - currentPosition.y,
  };
}

/**
 * 스냅 그리드 적용 (선택적 기능)
 * 정밀한 배치를 위한 그리드 스냅
 */
export function snapToGrid(
  x: number,
  y: number,
  gridSize: number = 5
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

/**
 * 컴포넌트가 PDF 경계의 몇 퍼센트를 차지하는지 계산
 * 경고 표시용
 */
export function calculateBoundaryUsage(position: ComponentPosition): number {
  const { width, height } = position;
  const totalArea = PDF_BOUNDARY.width * PDF_BOUNDARY.height;
  const componentArea = width * height;

  return (componentArea / totalArea) * 100;
}

/**
 * 로그용: 경계 Rule 정보 출력
 */
export function logBoundaryConstraint(
  componentId: string,
  before: ComponentPosition,
  after: BoundaryConstraintResult
): void {
  if (after.isConstrained) {
    devWarn(`[Boundary] Component ${componentId} constrained:`, {
      before: { x: before.x, y: before.y },
      after: { x: after.x, y: after.y },
      constrainedX: after.constrainedX,
      constrainedY: after.constrainedY,
    });
  }
}
