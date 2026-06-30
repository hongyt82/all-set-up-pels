// src/types/index.ts
/**
 * 타입 정의 통합 파일
 * 프로젝트 전체에서 사용되는 공통 타입 정의
 */

// ============================================
// 기본 타입
// ============================================

/**
 * PDF 페이지 번호 (1부터 시작)
 */
export type PageNumber = number;

/**
 * 컴포넌트 고유 ID
 */
export type ComponentId = string;

// ============================================
// 도구 관련 타입
// ============================================

/**
 * 도구 카테고리
 */
export type ToolCategory =
  | 'ban'
  | 'circle'
  | 'text'
  | 'signature'
  | 'checkbox'
  | 'calendar'
  | null;

/**
 * 카테고리별 도구 타입
 */
export type BanTool = 'ban-circle' | 'ban-square' | 'ban-line' | 'ban-cross';
export type CircleTool =
  | 'circle-empty'
  | 'circle-filled'
  | 'circle-dotted'
  | 'circle-check';
export type TextTool = 'text-input' | 'text-area' | 'text-label';
export type SignatureTool =
  | 'signature-line'
  | 'signature-box'
  | 'signature-stamp';
export type CheckboxTool =
  | 'checkbox-empty'
  | 'checkbox-checked'
  | 'checkbox-radio';
export type CalendarTool =
  | 'calendar-datepicker'
  | 'calendar-month'
  | 'calendar-range';

/**
 * 모든 도구 타입의 유니온
 */
export type Tool =
  | BanTool
  | CircleTool
  | TextTool
  | SignatureTool
  | CheckboxTool
  | CalendarTool;

// ============================================
// 컴포넌트 위치 및 크기
// ============================================

/**
 * 컴포넌트 위치 정보
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 컴포넌트 크기 정보
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 컴포넌트 위치 및 크기 (통합)
 */
export interface ComponentPosition extends Position, Size {}

// ============================================
// 경계 제한 관련
// ============================================

/**
 * PDF 페이지 경계 정보
 */
export interface BoundaryConfig {
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * 경계 Rule 결과
 */
export interface BoundaryConstraintResult {
  x: number;
  y: number;
  isConstrained: boolean;
  constrainedX: boolean;
  constrainedY: boolean;
}

/**
 * 경계 근처 상태
 */
export interface BoundaryProximity {
  nearLeft: boolean;
  nearRight: boolean;
  nearTop: boolean;
  nearBottom: boolean;
}

/**
 * 경계 상태 (전체)
 */
export interface BoundaryState extends BoundaryProximity {
  isNearBoundary: boolean;
}

// ============================================
// 컴포넌트 요소 타입
// ============================================

/**
 * 기본 컴포넌트 속성
 */
export interface BaseComponent {
  id: ComponentId;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber?: PageNumber;
  createdAt?: string;
}

/**
 * Ban 도구 컴포넌트
 */
export interface BanElement extends BaseComponent {
  type: 'ban-circle' | 'ban-square' | 'ban-line' | 'ban-cross';
  color?: string;
  strokeWidth?: number;
}

/**
 * Circle 도구 컴포넌트
 */
export interface CircleElement extends BaseComponent {
  type: 'circle-empty' | 'circle-filled' | 'circle-dotted' | 'circle-check';
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
}

/**
 * Text 도구 컴포넌트
 */
export interface TextElement extends BaseComponent {
  type: 'text-input' | 'text-area' | 'text-label';
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

/**
 * Signature 도구 컴포넌트
 */
export interface SignatureElement extends BaseComponent {
  type: 'signature-line' | 'signature-box' | 'signature-stamp';
  signatureData?: string;
}

/**
 * Checkbox 도구 컴포넌트
 */
export interface CheckboxElement extends BaseComponent {
  type: 'checkbox-empty' | 'checkbox-checked' | 'checkbox-radio';
  checked?: boolean;
}

/**
 * Calendar 도구 컴포넌트
 */
export interface CalendarElement extends BaseComponent {
  type: 'calendar-datepicker' | 'calendar-month' | 'calendar-range';
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 모든 컴포넌트 타입의 유니온
 */
export type ComponentElement =
  | BanElement
  | CircleElement
  | TextElement
  | SignatureElement
  | CheckboxElement
  | CalendarElement;

// ============================================
// 페이지 데이터
// ============================================

/**
 * PDF 페이지 데이터
 */
export interface PageData {
  pageNumber: PageNumber;
  components: ComponentElement[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
}

/**
 * 전체 페이지 맵
 */
export type PagesMap = Record<PageNumber, PageData>;

// ============================================
// 에디터 상태
// ============================================

/**
 * 에디터 전역 상태
 */
export interface EditorState {
  // 선택 상태
  selectedCategory: ToolCategory;
  selectedTool: string | null;

  // 오버레이
  isOverlayVisible: boolean;

  // 페이지 정보
  currentPage: PageNumber;
  totalPages: number;
  pages: PagesMap;

  // 파일 정보
  currentFile: string | null;
  isModified: boolean;
  wordCount: number;
  pageCount: number;

  // 설정
  isPersistEnabled: boolean;

  // 메타데이터
  metadata: {
    lastSaved?: string;
    version: string;
    [key: string]: any;
  };
}

// ============================================
// 에러 관련
// ============================================

/**
 * 에러 타입
 */
export type ErrorType =
  | 'http'
  | 'runtime'
  | 'validation'
  | 'network'
  | 'unknown';

/**
 * HTTP 에러 상태 코드
 */
export type HttpStatusCode = 400 | 401 | 403 | 404 | 500 | 502 | 503;

/**
 * 에러 정보
 */
export interface ErrorInfo {
  id: string;
  type: ErrorType;
  message: string;
  statusCode?: HttpStatusCode;
  details?: any;
  timestamp: string;
  stack?: string;
}

/**
 * 에러 스토어 상태
 */
export interface ErrorState {
  currentError: ErrorInfo | null;
  errorHistory: ErrorInfo[];
}

// ============================================
// 다이얼로그 관련
// ============================================

/**
 * 확인 다이얼로그 설정
 */
export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * 정보 다이얼로그 설정
 */
export interface InfoDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  closeText?: string;
  onClose?: () => void;
}

// ============================================
// 드래그 관련
// ============================================

/**
 * 드래그 시작 정보
 */
export interface DragStartInfo {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * 드래그 옵션
 */
export interface DragOptions {
  enableSnap?: boolean;
  snapGridSize?: number;
  enableLogging?: boolean;
  minWidth?: number;
  minHeight?: number;
  constrainToBoundary?: boolean;
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 부분 업데이트 타입
 */
export type PartialUpdate<T> = Partial<T>;

/**
 * 필수 필드 타입
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 읽기 전용 깊은 복사
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================
// v1 호환 뷰어/에디터 공용 JSON 스키마 (append-only)
// ============================================

/**
 * 오버레이 요소 타입 (폼 컨트롤)
 * - 좌표/크기는 draw 박스(프레임) 기준 비율값(0~1)
 */
export type OverlayType =
  // textbox
  | 'textbox'
  | 'textbox_multiline'
  | 'textbox_num'
  | 'textbox_unusing'
  | 'textbox_name'
  | 'textbox_verifier'

  // checkbox
  | 'checkbox'

  // circleslash
  | 'circleslash'

  // calendar
  | 'calendar'

  // signature
  | 'signature_worker'
  | 'signature_verifier'

  // extra
  | 'satisfactionbox'
  | 'button_ox'
  | 'button_oxn'
  | 'button_oxt'
  | 'button_oxtn'

  // rule-only clickable area
  | 'movetopage'
  | 'formdrawing';

export interface OverlayItem {
  /** 서버/문서 전역 고유 키 */
  uid: string;
  /** 페이지 내 요소 식별자 */
  id: string;
  title?: string;
  type: OverlayType;
  option?: string;
  /** draw 박스 기준 비율 좌표/크기 (0~1) */
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  /** 논리 페이지 번호 (1-based) */
  page: number;
  /** 표시/입력 값 (선택) */
  value?: string;
}

/**
 * 가상 페이지 첨부 요소 (이미지/텍스트/비디오)
 * - 좌표/크기는 논리 페이지의 절대 px 기준
 */
export type Attachment =
  | {
      type: 'text';
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: 'image';
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: 'video';
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      controls?: boolean;
    };

/**
 * 템플릿 컴포넌트
 * - OverlayItem(비율 좌표) 기반
 * - 필요 시 절대 좌표(px) 필드도 함께 저장 가능
 */
export interface TemplateComponent extends OverlayItem {
  x?: number; // px (선택)
  y?: number; // px (선택)
  width?: number; // px (선택)
  height?: number; // px (선택)
}

/**
 * 템플릿 페이지
 * - pdfPageNo: 1-based 실제 PDF 페이지 (생략/0/음수면 가상 페이지)
 * - attachments: 가상 페이지에서만 사용 가능
 */
export interface TemplatePage {
  page: number;
  width: number; // 논리 페이지의 기준 폭(px)
  height: number; // 논리 페이지의 기준 높이(px)
  isChange: 'Y' | 'N';
  components: TemplateComponent[];
  pdfPageNo?: number; // 실제 PDF 페이지 매핑(선택)
  constraintPageNo?: number;
  attachments?: Attachment[]; // 가상 페이지 첨부(선택)
}

/**
 * 템플릿 문서 루트
 * - pdfInfo.canvasWidth/Height는 v2 고정 프레임(예: 520x736)과는 독립적으로
 *   템플릿 기반의 기준 사이즈(예: 720x1020)를 기록하는 용도
 */
export interface TemplateDoc {
  creationDate: string;
  user: string;
  department: string;
  pdfInfo: {
    totalPages: number;
    canvasWidth: number;
    canvasHeight: number;
  };
  pages: TemplatePage[];
  removePages?: RemovedTemplatePage[];
}

export interface TemplatePathData {
  id?: number;
  points: number[];
  color?: number;
  strokWidth?: number;
  strokeWidth?: number;
}

export interface RemovedTemplatePage extends TemplatePage {
  pageDataSeq?: number;
  pathData?: TemplatePathData[];
  removeDate?: string;
}
