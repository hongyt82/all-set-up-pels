/**
 * 공통 헬퍼 함수 모음
 * 프로젝트 전반에서 사용되는 유틸리티 함수들
 */

import type { ComponentPosition, Position } from '../types';
import { PDF_CONFIG } from '../constants/config';

// ============================================
// ID 생성
// ============================================

/**
 * 고유 ID 생성
 * @param prefix - ID 접두사
 * @returns 고유 ID 문자열
 */
export function generateId(prefix: string = 'component'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * UUID v4 생성
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// 숫자 관련
// ============================================

/**
 * 숫자 범위 제한 (클램프)
 * @param value - 제한할 값
 * @param min - 최소값
 * @param max - 최대값
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 그리드에 스냅
 * @param value - 스냅할 값
 * @param gridSize - 그리드 크기
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 두 숫자가 거의 같은지 확인 (부동소수점 오차 고려)
 */
export function nearlyEqual(
  a: number,
  b: number,
  epsilon: number = 0.001
): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * 퍼센트를 픽셀로 변환
 */
export function percentToPixel(percent: number, total: number): number {
  return (percent / 100) * total;
}

/**
 * 픽셀을 퍼센트로 변환
 */
export function pixelToPercent(pixel: number, total: number): number {
  return (pixel / total) * 100;
}

// ============================================
// 좌표 및 위치 관련
// ============================================

/**
 * 두 점 사이의 거리 계산
 */
export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 점이 사각형 안에 있는지 확인
 */
export function isPointInRect(
  point: Position,
  rect: ComponentPosition
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 두 사각형이 겹치는지 확인
 */
export function isRectOverlap(
  rect1: ComponentPosition,
  rect2: ComponentPosition
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * 사각형의 중심점 계산
 */
export function getRectCenter(rect: ComponentPosition): Position {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * PDF 페이지 내에 있는지 확인
 */
export function isInPDFBounds(position: ComponentPosition): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= PDF_CONFIG.WIDTH &&
    position.y + position.height <= PDF_CONFIG.HEIGHT
  );
}

// ============================================
// 문자열 관련
// ============================================

/**
 * 문자열을 케밥 케이스로 변환
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 문자열을 카멜 케이스로 변환
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * 문자열을 파스칼 케이스로 변환
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * 문자열 자르기 (말줄임표 추가)
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// ============================================
// 날짜 및 시간
// ============================================

/**
 * ISO 문자열을 로케일 날짜로 변환
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * ISO 문자열을 로케일 시간으로 변환
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * ISO 문자열을 로케일 날짜+시간으로 변환
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 상대 시간 표시 (예: "3분 전")
 */
export function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const target = new Date(isoString).getTime();
  const diff = now - target;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  if (seconds > 0) return `${seconds}초 전`;
  return '방금 전';
}

// ============================================
// 배열 관련
// ============================================

/**
 * 배열에서 중복 제거
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 배열을 특정 크기로 청크 분할
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 배열 섞기 (Fisher-Yates 알고리즘)
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// 객체 관련
// ============================================

/**
 * 깊은 복사
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj.getTime()) as never;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as never;

  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * 객체 비교 (얕은 비교)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * null/undefined 값 제거
 */
export function removeNullish<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const result: any = {};
  for (const key in obj) {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
  }
  return result;
}

// ============================================
// 파일 관련
// ============================================

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * JSON을 파일로 다운로드
 */
export function downloadJSON(data: any, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// 디바운스 & 쓰로틀
// ============================================

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => never>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: never, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 쓰로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================
// 클래스명 관련
// ============================================

/**
 * 조건부 클래스명 결합
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Tailwind 클래스 병합 (중복 제거)
 */
export function mergeTailwindClasses(...classes: string[]): string {
  return uniqueArray(classes.flatMap(c => c.split(' ')))
    .filter(Boolean)
    .join(' ');
}
