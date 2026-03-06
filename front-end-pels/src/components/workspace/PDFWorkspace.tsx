/*
// src/components/workspace/PDFWorkspace.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import type { TemplatePage } from '../../types';
import { Rnd } from 'react-rnd';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { saveAs } from 'file-saver';
import { detectGlyphBoxesInPdf } from '../../lib/pdfGlyphBoxDetector.ts';
import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../../constants/pageSize.ts';
import type { ConstraintDoc } from '../../types/constraints';

// 제약(조건) 관련 공통 로직
// - constraint 표현식 평가
// - 특정 컴포넌트의 rule 찾기
// - status 에 따른 강조 표시
// - 체크박스 그룹 찾기
import {
  getStatusFromConstraints,
  findComponentRule,
  highlightOverlayStatus,
  getCheckboxGroupIds,
} from '../../lib/constraints/constraintsLogic';

// -----------------------------------------------------------------------------
// 타입 정의
// -----------------------------------------------------------------------------

// 에디터/뷰어 공통으로 사용하는 오버레이 타입
export type OverlayType =
  | 'circleslash'
  | 'textbox'
  | 'checkbox'
  | 'calendar'
  | 'signature';

// 한 개의 오버레이(텍스트박스, 체크박스 등)를 표현하는 데이터 구조
export interface OverlayItem {
  uid: string; // React 렌더링 및 선택용 고유 ID (화면에서만 사용)
  id: string; // 실제 문서에서 사용하는 컴포넌트 ID (2345A001000 이런 형태)
  type: OverlayType;
  xPct: number; // 페이지 기준 X 좌표 (0 ~ 1)
  yPct: number; // 페이지 기준 Y 좌표 (0 ~ 1)
  wPct: number; // 페이지 기준 폭 비율 (0 ~ 1)
  hPct: number; // 페이지 기준 높이 비율 (0 ~ 1)
  page: number; // 페이지 번호 (1-based)
  value?: string; // 입력 값 (뷰어 모드에서 사용)
}

type RenderTaskType = { promise: Promise<unknown>; cancel: () => void };

// PDF 렌더링 기준 고정 사이즈 (V1 기준 비율과 호환되도록 유지)
const FIXED_W = BASE_PAGE_WIDTH;
const FIXED_H = BASE_PAGE_HEIGHT;

// 정사각형 비율을 유지해야 하는 타입
const isSquareType = (t: OverlayType) =>
  t === 'checkbox' || t === 'circleslash';

// pdf.js 의 viewport 크기를 FIXED_W / FIXED_H 안에 맞추기 위한 헬퍼
// - viewportW / viewportH : pdf.js 가 알려주는 페이지 실제 픽셀 크기
// - BW / BH               : 우리가 맞추고 싶은 기준 박스 크기
// 반환값
//   - s      : 스케일
//   - drawW  : 실제 캔버스에 그려질 폭
//   - drawH  : 실제 캔버스에 그려질 높이
function getPageFit(
  viewportW: number,
  viewportH: number,
  BW: number = FIXED_W,
  BH: number = FIXED_H
) {
  const s = Math.min(BW / viewportW, BH / viewportH);
  const drawW = viewportW * s;
  const drawH = viewportH * s;

  // 좌상단(0,0)에 바로 그림. offsetX / offsetY 는 사용하지 않음.
  return { s, drawW, drawH };
}

// -----------------------------------------------------------------------------
// 컴포넌트 Props / Handle 타입
// -----------------------------------------------------------------------------

// 부모(페이지)에서 내려주는 속성들
export interface PDFWorkspaceProps {
  // 현재 페이지 / 전체 페이지를 상위에 알려줄 때 사용
  onPageInfoChange?: (info: {
    currentPage: number;
    totalPages: number;
  }) => void;

  // 에디터 모드에서만 의미 있음
  isOverlayVisible?: boolean;
  selectedCategory?: string | null;
  selectedTool?: string | null;
  readonly?: boolean; // true면 뷰어 모드로 동작
  scale?: number; // 상위에서 줌(scale)을 적용할 때 사용

  // 뷰어 모드 전용
  fileUrl?: string; // 실제 PDF 파일 URL
  overlays?: Record<number, OverlayItem[]>; // 페이지별 오버레이 (뷰어에서 내려줌)
  logicalPages?: TemplatePage[]; // 논리 페이지(가상 페이지 포함)
  currentPage?: number; // 외부에서 페이지를 직접 지정할 때 사용

  // 뷰어 모드에서 값이 변경됐을 때 상위로 올려주기 위한 콜백
  onOverlaysChange?: (page: number, items: OverlayItem[]) => void;

  // 에디터 모드에서 오버레이를 우클릭했을 때 Rule 편집 패널을 열기 위한 콜백
  onOpenConstraintEditor?: (payload: {
    page: number;
    overlays: OverlayItem[];
  }) => void;

  // Rule JSON (뷰어에서 내려줌)
  constraints?: ConstraintDoc | null;
}

// 외부로 노출되는 메서드 모음
export interface PDFWorkspaceHandle {
  // 파일/JSON 관련
  loadPdfFile: (file: File) => void;
  restoreFromJson: (file: File) => Promise<void>;
  downloadJson: () => void;
  downloadJsonAs: () => void;
  changeDocKey: () => void;

  // 컴포넌트 조작
  addOverlay: (type: OverlayType) => void;
  clearPage: () => void;
  clearAll: () => void;

  // 정렬 관련
  alignLeft: () => void;
  alignHCenter: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignVCenter: () => void;
  alignBottom: () => void;
  distributeHorizontally: () => void;
  distributeVertically: () => void;

  // 크기 조절
  resizeSelectedPlus: () => void;
  resizeSelectedMinus: () => void;

  // 선택 + 아래줄 + 이후 페이지 전체 이동
  shiftBelowAndNext: (deltaXPct: number, deltaYPct: number) => void;

  // 글리프(□, ☐) 기반 체크박스 자동 배치
  autoDetectGlyphCheckboxes: () => Promise<void>;

  // 페이지 이동
  goPrevPage: () => void;
  goNextPage: () => void;
  goToPage: (page: number) => void;
  getPageInfo: () => { currentPage: number; totalPages: number };

  // 현재 선택된 오버레이들의 컴포넌트 ID 목록
  getSelectedOverlayIds: () => string[];

  // 현재 적용 중인 constraint 문서 (에디터에서 참조할 수 있도록 노출)
  constraints?: any | null;
}

// ============================================================================
// PDFWorkspace (에디터 + 뷰어 공용 컴포넌트)
// - 에디터 모드 : readonly=false
// - 뷰어 모드   : readonly=true
//   → ViewerWorkspace.tsx 에서 readonly 고정으로 감싸서 사용
// ============================================================================
export const PDFWorkspace = forwardRef<PDFWorkspaceHandle, PDFWorkspaceProps>(
  (props, ref) => {
    const {
      onPageInfoChange,
      isOverlayVisible = true,
      readonly = false,
      scale = 1,
      fileUrl,
      currentPage: externalPage,
      logicalPages,
      onOverlaysChange,
      onOpenConstraintEditor,
      constraints,
    } = props;

    // 뷰어 모드에서 상위에서 내려준 overlays(페이지별)를 참조
    const overlaysByPage = props.overlays;

    // Rule JSON 문서 (뷰어/에디터 공통으로 사용)
    const constraintDoc = constraints;

    // -------------------------------------------------------------------------
    // readonly(뷰어) 모드에서 값 변경 시 상위로 sync 하기 위한 래퍼
    //   - 에디터 모드는 setOverlays 만 사용
    //   - 뷰어 모드는 setOverlays + pendingSyncRef 를 통해 상위로 값 전달
    // -------------------------------------------------------------------------
    const [overlays, setOverlays] = useState<OverlayItem[]>([]);
    const pendingSyncRef = useRef<OverlayItem[] | null>(null);

    const updateOverlaysReadonly = (
      updater: (prev: OverlayItem[]) => OverlayItem[]
    ) => {
      // 에디터 모드에서는 그냥 state만 바꾼다.
      if (!readonly) {
        setOverlays(updater);
        return;
      }

      // 뷰어 모드에서는 state + 상위 sync 둘 다 고려
      setOverlays(prev => {
        const next = updater(prev);
        pendingSyncRef.current = next;
        return next;
      });
    };

    // -------------------------------------------------------------------------
    // Rule 적용 유틸 (뷰어 모드에서 값이 바뀔 때마다 호출)
    //
    // 흐름:
    // 1) constraintDoc 에서 (page, id) 기준 rule 조회
    // 2) constraints 배열을 돌면서 status 결정
    // 3) 상태에 따라 overlay DOM 에 배경색 표시
    // 4) rule.events 가 있으면, onStatus 조건을 만족하는 이벤트들 실행
    //    - targetId / targetValue 기반으로 다른 필드 값도 변경
    //    - 해당 타겟 필드에도 제약이 있으면 다시 평가
    // -------------------------------------------------------------------------
    const applyConstraintsForOverlay = (uid: string, rawValue: string) => {
      if (!constraintDoc) return;

      // uid로 실제 overlay 찾기
      const ov = overlays.find(o => o.uid === uid);
      if (!ov) return;

      const rule = findComponentRule(constraintDoc, ov.page, ov.id);
      if (!rule || !Array.isArray((rule as any).constraints)) return;

      const status = getStatusFromConstraints(
        (rule as any).constraints,
        rawValue
      );

      // 상태에 따라 배경 표시 (allow / warning / error)
      highlightOverlayStatus(ov.id, status);

      // 이벤트 처리
      const events = (rule as any).events;
      if (!Array.isArray(events)) return;

      events.forEach((ev: any) => {
        // 현재 status 와 onStatus 가 일치하는 이벤트만 실행
        if (ev.onStatus !== status) return;

        const targetValue = String(ev.targetValue ?? '');

        // 타겟 컴포넌트 값 변경
        updateOverlaysReadonly(prev =>
          prev.map(o => {
            if (o.page === ov.page && o.id === ev.targetId) {
              let val = String(ev.targetValue ?? '');

              // 체크박스의 경우 1/0 을 y/n 으로 자동 변환
              if (o.type === 'checkbox') {
                if (val === '1') val = 'y';
                if (val === '0') val = 'n';
              }

              return { ...o, value: val };
            }
            return o;
          })
        );

        // 타겟 컴포넌트에도 제약이 있다면 이어서 평가
        const targetRule = findComponentRule(
          constraintDoc,
          ov.page,
          ev.targetId
        );
        if (targetRule && Array.isArray((targetRule as any).constraints)) {
          const targetStatus = getStatusFromConstraints(
            (targetRule as any).constraints,
            targetValue
          );
          highlightOverlayStatus(ev.targetId, targetStatus);
        }
      });
    };

    // -------------------------------------------------------------------------
    // PDF / 페이지 / 캔버스 관련 상태
    // -------------------------------------------------------------------------
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(() => externalPage ?? 1);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<RenderTaskType | null>(null);

    // 현재 페이지의 "화면상 카드(프레임)" 크기
    // (줌 전 기준. 실제 화면에서는 상위에서 scale 로 다시 줄여서 보여줌)
    const [pageBox, setPageBox] = useState<{ w: number; h: number }>({
      w: FIXED_W,
      h: FIXED_H,
    });

    // 페이지별 프레임 크기 (JSON width/height 와 1:1 대응)
    const [pageBoxByPage, setPageBoxByPage] = useState<
      Record<number, { w: number; h: number }>
    >({});

    // -------------------------------------------------------------------------
    // 문서 메타 / ID 채번 관련 상태
    // -------------------------------------------------------------------------
    const [docKey, setDocKey] = useState('2345A');
    const seqRef = useRef({
      circleslash: 1000,
      textbox: 2000,
      checkbox: 3000,
      calendar: 4000,
      signature: 5000,
    });

    const [meta, setMeta] = useState({
      creationDate: '',
      user: 'admin',
      department: '경영팀',
    });

    // -------------------------------------------------------------------------
    // Undo / Redo
    //   - overlays 전체 스냅샷을 스택으로 관리
    //   - 큰 작업(추가/삭제/이동/크기조정 등) 전에 pushUndoSnapshot 호출
    // -------------------------------------------------------------------------
    const undoStack = useRef<OverlayItem[][]>([]);
    const redoStack = useRef<OverlayItem[][]>([]);
    const dragUndoSnapshotRef = useRef<OverlayItem[] | null>(null);
    const MAX_HISTORY = 100;

    const pushUndoSnapshot = (snapshot?: OverlayItem[]) => {
      const snap = snapshot ?? overlays.map(o => ({ ...o }));
      undoStack.current.push(snap);
      if (undoStack.current.length > MAX_HISTORY) {
        undoStack.current.shift();
      }
      redoStack.current = [];
    };

    const clearHistory = () => {
      undoStack.current = [];
      redoStack.current = [];
      dragUndoSnapshotRef.current = null;
    };

    const undo = () => {
      if (!undoStack.current.length) return;
      const prevSnap = undoStack.current.pop()!;
      const currentSnap = overlays.map(o => ({ ...o }));
      redoStack.current.push(currentSnap);
      setOverlays(prevSnap.map(o => ({ ...o })));
    };

    const redo = () => {
      if (!redoStack.current.length) return;
      const nextSnap = redoStack.current.pop()!;
      const currentSnap = overlays.map(o => ({ ...o }));
      undoStack.current.push(currentSnap);
      setOverlays(nextSnap.map(o => ({ ...o })));
    };

    // -------------------------------------------------------------------------
    // 에디터 모드에서만 사용하는 상태 (선택, 드래그, 마퀴 등)
    // -------------------------------------------------------------------------
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [isMarquee, setIsMarquee] = useState(false);
    const [marquee, setMarquee] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

    // 여러 컴포넌트를 한번에 드래그하는 상태 (Ctrl + 드래그 포함)
    const groupDragRef = useRef<{
      active: boolean;
      cascade: boolean; // true면 Ctrl 드래그: 아래줄/다음 페이지까지 연쇄 이동
      anchorUid: string | null;
      startPxByUid: Record<string, { x: number; y: number }>;
      startAnchorPx: { x: number; y: number } | null;
      lastDx: number;
      lastDy: number;
    }>({
      active: false,
      cascade: false,
      anchorUid: null,
      startPxByUid: {},
      startAnchorPx: null,
      lastDx: 0,
      lastDy: 0,
    });

    // 복사/붙여넣기용 클립보드
    const clipboardRef = useRef<OverlayItem[] | null>(null);

    // -------------------------------------------------------------------------
    // pdf.js worker 설정 (앱 전체에서 한번만 설정되어도 되지만, 여기서 보정)
    // -------------------------------------------------------------------------
    useEffect(() => {
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
    }, []);

    // -------------------------------------------------------------------------
    // 외부에서 currentPage 값을 바꿔주었을 때 (뷰어에서 사용)
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (typeof externalPage === 'number') {
        setCurrentPage(externalPage);
      }
    }, [externalPage]);

    // -------------------------------------------------------------------------
    // 공통 유틸 함수들
    // -------------------------------------------------------------------------
    const genMeta = () => {
      const now = new Date();
      const z = (n: number) => String(n).padStart(2, '0');
      return {
        creationDate: `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(
          now.getDate()
        )} ${z(now.getHours())}:${z(now.getMinutes())}:${z(now.getSeconds())}`,
        user: meta.user,
        department: meta.department,
      };
    };

    // type, page 기준으로 새 컴포넌트 ID 생성
    const nextId = (type: OverlayType, page: number) => {
      const cur = ++(seqRef.current as any)[type];
      const p = String(page).padStart(3, '0');
      const c = String(cur).padStart(4, '0');
      return `${docKey}${p}${c}`.slice(0, 12);
    };

    // 특정 페이지의 width/height 조회
    // - JSON 에서 page마다 width, height 를 따로 가질 수 있으므로,
    //   pageBoxByPage 에 저장된 값을 우선 사용
    const getPageSize = (page?: number) => {
      const p = page ?? currentPage;
      return pageBoxByPage[p] || pageBox;
    };

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    // 현재 전체 페이지 수
    // - 뷰어(논리 페이지 기반)일 경우 logicalPages 길이
    // - 에디터(PDF 기준)일 경우 pdfDoc.numPages
    const getTotalPagesInternal = () =>
      readonly && Array.isArray(logicalPages) && logicalPages.length > 0
        ? logicalPages.length
        : (pdfDoc?.numPages ?? numPages);

    // 현재 페이지에서 선택된 오버레이들
    const selectedInPage = () =>
      overlays.filter(o => o.page === currentPage && selected.includes(o.uid));

    // OverlayItem 을 페이지 내 실제 px 좌표/크기로 변환
    // - 렌더링/드래그 계산에 사용
    const toPx = (ov: OverlayItem) => {
      const { w: PW, h: PH } = getPageSize(ov.page);
      const w = ov.wPct * PW;
      const h = ov.hPct * PH;
      const x = ov.xPct * PW;
      const y = ov.yPct * PH;
      if (isSquareType(ov.type)) {
        const s = Math.min(w, h);
        return { x, y, w: s, h: s };
      }
      return { x, y, w, h };
    };

    // -------------------------------------------------------------------------
    // 선택 + 아래줄 + 이후 페이지 전체 이동
    //
    // - 기준: 현재 페이지에서 선택된 것들의 최소 yPct (anchorY)
    // - 현재 페이지에서 anchorY 이하 + 이후 페이지의 모든 컴포넌트에 delta 적용
    // -------------------------------------------------------------------------
    const shiftBelowAndNext = (deltaXPct: number, deltaYPct: number) => {
      if (readonly) return;

      const items = selectedInPage();
      if (items.length === 0) return;

      const anchorY = Math.min(...items.map(o => o.yPct));
      const totalPages = getTotalPagesInternal();

      setOverlays(prev =>
        prev.map(o => {
          const isOnCurrentAndBelow =
            o.page === currentPage && o.yPct >= anchorY;
          const isOnLaterPage = o.page > currentPage;

          if (!isOnCurrentAndBelow && !isOnLaterPage) return o;

          // X 이동
          let x = o.xPct + deltaXPct;
          const maxX = 1 - o.wPct;
          x = Math.max(0, Math.min(maxX, x));

          // Y 이동 (페이지 넘어가는 경우 처리)
          let y = o.yPct + deltaYPct;
          let page = o.page;

          if (deltaYPct > 0) {
            // 아래로 이동하다가 페이지를 넘어갈 경우
            while (y + o.hPct > 1 && page < totalPages) {
              y -= 1;
              page += 1;
            }
          } else if (deltaYPct < 0) {
            // 위로 올라가면서 이전 페이지로 넘어가는 경우
            while (y < 0 && page > 1) {
              y += 1;
              page -= 1;
            }
          }

          const maxY = 1 - o.hPct;
          y = Math.max(0, Math.min(maxY, y));

          return {
            ...o,
            page,
            xPct: x,
            yPct: y,
          };
        })
      );
    };

    // -------------------------------------------------------------------------
    // 글리프(□, ☐) 기반 체크박스 자동 감지
    // - pdfGlyphBoxDetector 를 이용해서 PDF 내 텍스트를 분석
    // - 감지된 위치에 checkbox 오버레이를 자동으로 생성
    // -------------------------------------------------------------------------
    const autoDetectGlyphCheckboxes = async () => {
      if (!pdfDoc || readonly) return;

      const boxes = await detectGlyphBoxesInPdf(pdfDoc, {
        targetChars: ['□', '☐'],
        inflatePx: 2,
        minGlyphHeightPx: 6,
        baseWidth: FIXED_W,
        baseHeight: FIXED_H,
      });

      if (boxes.length === 0) {
        console.log('[PDFWorkspace] glyph 기반 체크박스 감지 결과 없음');
        return;
      }

      pushUndoSnapshot();

      setOverlays(prev => {
        const next = [...prev];
        const epsilon = 0.002;

        for (const b of boxes) {
          const exists = next.some(
            o =>
              o.page === b.page &&
              o.type === 'checkbox' &&
              Math.abs(o.xPct - b.xPct) < epsilon &&
              Math.abs(o.yPct - b.yPct) < epsilon
          );
          if (exists) continue;

          const newW = b.wPct;
          const newH = b.hPct;
          const cx = b.xPct + b.wPct / 2;
          const cy = b.yPct + b.hPct / 2;

          let adjX = 0;
          let adjY = 0;

          if (b.hPct < 0.015) {
            // 작은 박스인 경우 → 글리프 위치 보정
            adjX = -0.003;
            adjY = -0.0035;
          } else if (b.hPct <= 0.017) {
            // 중간 박스 (보정 거의 없음)
            adjX = -0.0;
            adjY = -0.0;
          } else {
            // 큰 박스 (현재는 별도 보정 없음)
            adjX = -0.0;
            adjY = -0.0;
          }

          let x = cx - newW / 2 + adjX;
          let y = cy - newH / 2 + adjY;

          const maxX = 1 - newW;
          const maxY = 1 - newH;

          x = Math.max(0, Math.min(maxX, x));
          y = Math.max(0, Math.min(maxY, y));

          next.push({
            uid: `checkbox-${Date.now()}-${Math.random()}`,
            id: nextId('checkbox', b.page),
            type: 'checkbox',
            page: b.page,
            xPct: x,
            yPct: y,
            wPct: newW,
            hPct: newH,
            value: 'n',
          });
        }

        return next;
      });
    };

    // -------------------------------------------------------------------------
    // PDF 로드 1) 에디터 : File 객체 기준
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (!file) {
        if (!fileUrl) {
          setPdfDoc(null);
          setNumPages(0);
          setCurrentPage(1);
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        const makeData = () => new Uint8Array(arrayBuffer);

        const tryLoad = async (withCMap: boolean) => {
          const data = makeData();
          const loadingTask = (pdfjsLib as any).getDocument(
            withCMap
              ? {
                  data,
                  cMapUrl: '/pdfjs/cmaps/',
                  cMapPacked: true,
                }
              : { data }
          );
          const doc: PDFDocumentProxy = await loadingTask.promise;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setMeta(genMeta());
          clearHistory();
          setOverlays([]);
          setPageBoxByPage({});
        };

        try {
          await tryLoad(true);
        } catch (e) {
          console.warn('[PDFWorkspace] load with CMap failed, retry', e);
          await tryLoad(false);
        }
      };

      reader.readAsArrayBuffer(file);
    }, [file, fileUrl]);

    // -------------------------------------------------------------------------
    // PDF 로드 2) 뷰어 : fileUrl 기준
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (!fileUrl) return;

      const loadFromUrl = async () => {
        try {
          const res = await fetch(fileUrl);
          const arrayBuffer = await res.arrayBuffer();

          const makeData = () => new Uint8Array(arrayBuffer);

          const tryLoad = async (withCMap: boolean) => {
            const data = makeData();
            const loadingTask = (pdfjsLib as any).getDocument(
              withCMap
                ? {
                    data,
                    cMapUrl: '/pdfjs/cmaps/',
                    cMapPacked: true,
                  }
                : { data }
            );
            const doc: PDFDocumentProxy = await loadingTask.promise;
            setPdfDoc(doc);
            setNumPages(doc.numPages);
            setCurrentPage(1);
            setMeta(genMeta());
            clearHistory();
            setOverlays([]);
            setPageBoxByPage({});
          };

          try {
            await tryLoad(true);
          } catch (e1) {
            console.warn(
              '[PDFWorkspace] load from url failed, retry without CMap',
              e1
            );
            try {
              await tryLoad(false);
            } catch (e2) {
              console.error(
                '[PDFWorkspace] load from url failed completely',
                e2
              );
            }
          }
        } catch (err) {
          console.error('[PDFWorkspace] fetch fileUrl failed', err);
        }
      };

      void loadFromUrl();
    }, [fileUrl]);

    // -------------------------------------------------------------------------
    // 현재 페이지 PDF 렌더링
    //
    // - 실제 PDF 페이지가 있는 경우 : pdf.js 로 캔버스에 그린다.
    // - 논리 페이지가지만, 실제 PDF 페이지가 없으면(가상 페이지)
    //   흰 배경만 채운 빈 페이지를 만든다.
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (!pdfDoc) return;

      const render = async () => {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            console.warn('[PDFWorkspace] cancel renderTask failed', e);
          }
          renderTaskRef.current = null;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const hasLogical =
          readonly && Array.isArray(logicalPages) && logicalPages.length > 0;

        const lp = hasLogical ? logicalPages![currentPage - 1] : undefined;
        const mappedNo =
          lp &&
          typeof (lp as any).pdfPageNo === 'number' &&
          (lp as any).pdfPageNo > 0
            ? Math.min(
                Math.max(1, (lp as any).pdfPageNo as number),
                pdfDoc.numPages
              )
            : null;

        const isVirtual = hasLogical && !mappedNo;
        const realPageNo =
          mappedNo ?? Math.min(Math.max(currentPage, 1), pdfDoc.numPages);

        if (!isVirtual) {
          // 실제 PDF 페이지 렌더링
          const page: PDFPageProxy = await pdfDoc.getPage(realPageNo);
          const viewport = page.getViewport({ scale: 1 });

          // 가로/세로 비율에 따라 기준 박스를 다르게 사용
          const isLandscape = viewport.width > viewport.height;
          const BW = isLandscape ? FIXED_H : FIXED_W;
          const BH = isLandscape ? FIXED_W : FIXED_H;

          const { s, drawW, drawH } = getPageFit(
            viewport.width,
            viewport.height,
            BW,
            BH
          );

          // 페이지 박스 크기 갱신 (오버레이와 동일한 좌표계 사용)
          setPageBox({ w: drawW, h: drawH });
          setPageBoxByPage(prev => ({
            ...prev,
            [currentPage]: { w: drawW, h: drawH },
          }));

          const dpr = window.devicePixelRatio || 1;
          canvas.style.width = `${drawW}px`;
          canvas.style.height = `${drawH}px`;
          canvas.width = Math.floor(drawW * dpr);
          canvas.height = Math.floor(drawH * dpr);

          // transform 의 마지막 두 인자(offsetX, offsetY)는 0으로 유지
          const task = (page as any).render({
            canvasContext: ctx as any,
            viewport,
            transform: [s * dpr, 0, 0, s * dpr, 0, 0],
          }) as any;
          renderTaskRef.current = task as RenderTaskType;
          try {
            await task.promise;
          } catch (e) {
            console.warn('[PDFWorkspace] render task error (ignored)', e);
          } finally {
            renderTaskRef.current = null;
          }
        } else {
          // 논리 페이지는 있으나 실제 PDF 페이지가 없는 경우(가상 페이지)
          const W = (lp as any)?.width || FIXED_W;
          const H = (lp as any)?.height || FIXED_H;
          const isLandscape = W > H;
          const BW = isLandscape ? FIXED_H : FIXED_W;
          const BH = isLandscape ? FIXED_W : FIXED_H;

          setPageBox({ w: BW, h: BH });
          setPageBoxByPage(prev => ({
            ...prev,
            [currentPage]: { w: BW, h: BH },
          }));

          const dpr = window.devicePixelRatio || 1;
          canvas.style.width = `${BW}px`;
          canvas.style.height = `${BH}px`;
          canvas.width = Math.floor(BW * dpr);
          canvas.height = Math.floor(BH * dpr);

          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, BW, BH);
          ctx.restore();
        }
      };

      void render();

      return () => {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            console.warn('[PDFWorkspace] cancel on cleanup failed', e);
          }
          renderTaskRef.current = null;
        }
      };
    }, [pdfDoc, currentPage, readonly, logicalPages]);

    // -------------------------------------------------------------------------
    // 상위 컴포넌트 (EditorPage / ViewerPage) 에 현재 페이지 / 전체 페이지 전달
    // -------------------------------------------------------------------------
    useEffect(() => {
      const total = getTotalPagesInternal();
      onPageInfoChange?.({ currentPage, totalPages: total });
    }, [currentPage, numPages, onPageInfoChange, readonly, logicalPages]);

    // -------------------------------------------------------------------------
    // 뷰어 : 상위에서 내려주는 overlaysByPage 를 현재 페이지 기준으로 반영
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (!readonly || !overlaysByPage) return;
      const list = overlaysByPage[currentPage] ?? [];
      setOverlays(list.map(o => ({ ...o })));
    }, [readonly, overlaysByPage, currentPage]);

    // -------------------------------------------------------------------------
    // 뷰어 : 내부 state 변경 내용을 상위(onOverlaysChange)로 전달
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (!readonly) return;
      if (!onOverlaysChange) return;

      const data = pendingSyncRef.current;
      if (!data) return;

      const pageItems = data.filter(o => o.page === currentPage);
      onOverlaysChange(
        currentPage,
        pageItems.map(o => ({ ...o }))
      );

      pendingSyncRef.current = null;
    }, [overlays, readonly, currentPage, onOverlaysChange]);

    // -------------------------------------------------------------------------
    // 위치/크기 조정 헬퍼 (페이지 사이즈 기반)
    // -------------------------------------------------------------------------
    const applyRect = (
      uid: string,
      left: number,
      top: number,
      width: number,
      height: number
    ) => {
      pushUndoSnapshot();
      setOverlays(prev =>
        prev.map(o => {
          if (o.uid !== uid) return o;
          const { w: PW, h: PH } = getPageSize(o.page);

          const wPct = clamp01(width / PW);
          const hPct = clamp01(height / PH);
          const xPct = clamp01(left / PW);
          const yPct = clamp01(top / PH);

          const finalW = isSquareType(o.type) ? Math.min(wPct, hPct) : wPct;
          const finalH = isSquareType(o.type) ? Math.min(wPct, hPct) : hPct;

          return {
            ...o,
            xPct: Math.max(0, Math.min(1 - finalW, xPct)),
            yPct: Math.max(0, Math.min(1 - finalH, yPct)),
            wPct: finalW,
            hPct: finalH,
          };
        })
      );
    };

    const applyPos = (uid: string, left: number, top: number) => {
      setOverlays(prev =>
        prev.map(o => {
          if (o.uid !== uid) return o;

          const { w: PW, h: PH } = getPageSize(o.page);
          const sW = isSquareType(o.type) ? Math.min(o.wPct, o.hPct) : o.wPct;
          const sH = isSquareType(o.type) ? Math.min(o.wPct, o.hPct) : o.hPct;

          const w = sW * PW;
          const h = sH * PH;

          const clampedX = Math.max(0, Math.min(PW - w, left));
          const clampedY = Math.max(0, Math.min(PH - h, top));

          return {
            ...o,
            xPct: clampedX / PW,
            yPct: clampedY / PH,
          };
        })
      );
    };

    // -------------------------------------------------------------------------
    // 오버레이 추가/삭제
    // -------------------------------------------------------------------------
    const addOverlay = (type: OverlayType) => {
      if (readonly) return;
      if (!pdfDoc) return;

      pushUndoSnapshot();

      const def: Record<
        OverlayType,
        { wPct: number; hPct: number; value: string }
      > = {
        circleslash: { wPct: 0.04, hPct: 0.04, value: '' },
        textbox: { wPct: 0.32, hPct: 0.12, value: '' },
        checkbox: { wPct: 0.02, hPct: 0.02, value: 'n' },
        calendar: { wPct: 0.26, hPct: 0.09, value: '' },
        signature: { wPct: 0.18, hPct: 0.1, value: '' },
      };

      let { wPct, hPct } = def[type];
      const { value } = def[type];
      if (isSquareType(type)) {
        const s = Math.min(wPct, hPct);
        wPct = s;
        hPct = s;
      }

      const id = nextId(type, currentPage);
      setOverlays(prev => [
        ...prev,
        {
          uid: `${type}-${Date.now()}-${Math.random()}`,
          id,
          type,
          xPct: 0.25,
          yPct: 0.25,
          wPct,
          hPct,
          page: currentPage,
          value,
        },
      ]);
    };

    const clearPage = () => {
      if (readonly) return;
      pushUndoSnapshot();
      setOverlays(prev => prev.filter(o => o.page !== currentPage));
    };

    const clearAll = () => {
      if (readonly) return;
      pushUndoSnapshot();
      setOverlays([]);
    };

    // -------------------------------------------------------------------------
    // JSON 저장/로드 (페이지 width/height 포함하여 통일된 포맷 유지)
    // -------------------------------------------------------------------------
    const buildJson = () => {
      if (!pdfDoc) return null;

      const now = new Date();
      const z = (n: number) => String(n).padStart(2, '0');
      const nowStr = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(
        now.getDate()
      )} ${z(now.getHours())}:${z(now.getMinutes())}:${z(now.getSeconds())}`;

      const createDate = meta.creationDate || nowStr;

      const out: any = {
        createDate,
        updateDate: nowStr,
        startDate: '0000-00-00 00:00:00',
        endDate: '0000-00-00 00:00:00',
        logVersion: 0,

        doc: {
          id: '',
          publishId: '',
          name: '',
          doc_type: '',
        },

        department: meta.department || '경영팀',

        pages: [] as any[],
      };

      for (let p = 1; p <= numPages; p++) {
        const items = overlays.filter(o => o.page === p);
        const PB = pageBoxByPage[p] || { w: FIXED_W, h: FIXED_H };
        out.pages.push({
          page: p,
          pdfPageNo: p,
          width: PB.w,
          height: PB.h,
          isChange: items.length > 0 ? 'Y' : 'N',
          components: items.map(o => ({
            id: o.id,
            type: o.type,
            x: Math.round(o.xPct * PB.w),
            y: Math.round(o.yPct * PB.h),
            width: Math.round(o.wPct * PB.w),
            height: Math.round(o.hPct * PB.h),
            xPct: o.xPct,
            yPct: o.yPct,
            wPct: o.wPct,
            hPct: o.hPct,
            value: o.value ?? '',
          })),
        });
      }
      return out;
    };

    const downloadJson = () => {
      const data = buildJson();
      if (!data) return;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, `template_${new Date().toISOString().slice(0, 10)}.json`);
    };

    const downloadJsonAs = () => {
      const data = buildJson();
      if (!data) return;
      const today = new Date().toISOString().slice(0, 10);
      const defaultBase = `template_${docKey}_${today}`;
      const input = prompt(
        '저장할 파일명을 입력하세요 (확장자 없이 또는 .json 포함):',
        defaultBase
      );
      if (input === null) return;
      const safeBase = input.trim().replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = safeBase.toLowerCase().endsWith('.json')
        ? safeBase
        : `${safeBase}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, fileName);
    };

    const restoreFromJson = async (jf: File) => {
      try {
        const txt = await jf.text();
        const obj = JSON.parse(txt);
        if (!Array.isArray(obj?.pages)) {
          alert('올바른 템플릿 JSON 포맷이 아닙니다.\n(pages 배열이 없습니다)');
          return;
        }

        // Rule JSON처럼 보이는 경우 방지
        const firstPage = obj.pages[0];
        const firstComp = firstPage?.components?.[0];

        const looksLikeConstraint =
          (!!obj.docId && !obj.doc) ||
          (firstComp &&
            !firstComp.type &&
            (firstComp.constraints || firstComp.events || firstComp.groupby));

        if (looksLikeConstraint) {
          alert(
            '이 파일은 "Rule JSON"으로 보입니다.\n상단의 "Rule 불러오기" 버튼을 사용해 주세요.'
          );
          return;
        }

        pushUndoSnapshot();

        const restored: OverlayItem[] = [];
        const pbp: Record<number, { w: number; h: number }> = {};
        const MIN_PCT = 0.0025; // 0.25% 정도 (A4 가로 720px 기준 약 1.8px)

        obj.pages.forEach((pg: any) => {
          const pageNo: number = Number(pg.page) || 1;
          const W: number = pg.width || FIXED_W;
          const H: number = pg.height || FIXED_H;
          pbp[pageNo] = { w: W, h: H };

          (pg.components || []).forEach((c: any) => {
            if (c.type === 'satisfactionbox') return;

            const xPct = typeof c.xPct === 'number' ? c.xPct : c.x / W;
            const yPct = typeof c.yPct === 'number' ? c.yPct : c.y / H;
            const wPct = typeof c.wPct === 'number' ? c.wPct : c.width / W;
            const hPct = typeof c.hPct === 'number' ? c.hPct : c.height / H;
            restored.push({
              uid: `${c.type}-${Date.now()}-${Math.random()}`,
              id: String(c.id),
              type: c.type as OverlayType,
              xPct: Math.max(0, Math.min(1, xPct)),
              yPct: Math.max(0, Math.min(1, yPct)),
              wPct: Math.max(MIN_PCT, Math.min(1, wPct)),
              hPct: Math.max(MIN_PCT, Math.min(1, hPct)),
              page: pageNo,
              value: typeof c.value === 'string' ? c.value : '',
            });
          });
        });

        setOverlays(restored);
        setCurrentPage(1);
        setSelected([]);
        setPageBoxByPage(pbp);
        if (pbp[1]) setPageBox(pbp[1]);
      } catch (err) {
        console.error(err);
        alert('JSON 로드 중 오류가 발생했습니다.');
      }
    };

    // -------------------------------------------------------------------------
    // 뷰어용 값 입력 컨트롤
    //   - readonly 모드에서만 의미 있음
    //   - 값이 변경되면 updateOverlaysReadonly → applyConstraintsForOverlay 순서로 호출
    // -------------------------------------------------------------------------
    const setCheckbox = (uid: string, checked: boolean) => {
      const value = checked ? 'y' : 'n';

      updateOverlaysReadonly(prev => {
        // 1) 클릭된 체크박스 값 반영
        let next = prev.map(o => (o.uid === uid ? { ...o, value } : o));

        const target = prev.find(o => o.uid === uid);

        // 2) 체크박스 그룹 제약이 있는 경우 (단일 선택 보장)
        if (
          value === 'y' &&
          target &&
          target.type === 'checkbox' &&
          constraintDoc
        ) {
          const groupIds = getCheckboxGroupIds(
            constraintDoc,
            target.page,
            target.id
          );

          if (groupIds.length > 1) {
            // 같은 페이지 + 같은 그룹 + 자신 제외 → 나머지 모두 'n'
            next = next.map(o => {
              if (
                o.page === target.page &&
                o.type === 'checkbox' &&
                groupIds.includes(o.id) &&
                o.uid !== uid
              ) {
                return { ...o, value: 'n' };
              }
              return o;
            });
          }
        }

        return next;
      });

      applyConstraintsForOverlay(uid, value);
    };

    const cycleCircle = (uid: string) => {
      let nextValue = '';

      updateOverlaysReadonly(prev =>
        prev.map(o => {
          if (o.uid !== uid) return o;
          const order = ['', '◯', '⌀', 'N/A'];
          const idx = order.indexOf(o.value || '');
          nextValue = order[(idx + 1 + order.length) % order.length];
          return { ...o, value: nextValue };
        })
      );

      if (nextValue !== '') {
        applyConstraintsForOverlay(uid, nextValue);
      }
    };

    const setText = (uid: string, value: string) => {
      updateOverlaysReadonly(prev =>
        prev.map(o => (o.uid === uid ? { ...o, value } : o))
      );

      applyConstraintsForOverlay(uid, value);
    };

    const setDate = (uid: string, value: string) => {
      updateOverlaysReadonly(prev =>
        prev.map(o => (o.uid === uid ? { ...o, value } : o))
      );

      applyConstraintsForOverlay(uid, value);
    };

    const setSignature = (uid: string) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/!*';
      input.onchange = e => {
        const f = (e.currentTarget as HTMLInputElement).files?.[0];
        if (!f) return;

        const reader = new FileReader();
        reader.onload = () => {
          updateOverlaysReadonly(prev =>
            prev.map(o =>
              o.uid === uid ? { ...o, value: String(reader.result || '') } : o
            )
          );
        };
        reader.readAsDataURL(f);
      };
      input.click();
    };

    // -------------------------------------------------------------------------
    // 편집용 마우스 핸들러 (페이지 전체 기준 좌표 사용)
    // -------------------------------------------------------------------------
    const onInnerMouseDown: React.MouseEventHandler<HTMLDivElement> = e => {
      if (readonly) return;
      if (!innerRef.current) return;
      const r = innerRef.current.getBoundingClientRect();
      const s = scale || 1;
      const x = (e.clientX - r.left) / s;
      const y = (e.clientY - r.top) / s;
      marqueeStartRef.current = { x, y };
      setMarquee({ x, y, w: 0, h: 0 });
      setIsMarquee(true);
      if (!(e.shiftKey || e.ctrlKey || e.metaKey)) setSelected([]);
    };

    const onInnerMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
      if (readonly) return;
      if (!isMarquee || !marqueeStartRef.current || !innerRef.current) return;
      const r = innerRef.current.getBoundingClientRect();
      const s = scale || 1;
      const x = (e.clientX - r.left) / s;
      const y = (e.clientY - r.top) / s;
      const x0 = Math.min(marqueeStartRef.current.x, x);
      const y0 = Math.min(marqueeStartRef.current.y, y);
      const w = Math.abs(x - marqueeStartRef.current.x);
      const h = Math.abs(y - marqueeStartRef.current.y);
      setMarquee({ x: x0, y: y0, w, h });
    };

    const rectsIntersect = (
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number }
    ) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const onInnerMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
      if (readonly) return;
      if (!isMarquee) return;
      setIsMarquee(false);
      marqueeStartRef.current = null;
      if (marquee.w < 3 && marquee.h < 3) return;
      const newly = overlays
        .filter(o => o.page === currentPage)
        .filter(o => {
          const r = toPx(o);
          return rectsIntersect({ x: r.x, y: r.y, w: r.w, h: r.h }, marquee);
        })
        .map(o => o.uid);
      setSelected(prev => Array.from(new Set([...prev, ...newly])));
    };

    const onOverlayMouseDown = (e: MouseEvent, uid: string) => {
      if (readonly) return;
      e.stopPropagation();
      setIsMarquee(false);
      marqueeStartRef.current = null;
      setMarquee({ x: 0, y: 0, w: 0, h: 0 });
      const multi =
        (e as MouseEvent).shiftKey ||
        (e as MouseEvent).ctrlKey ||
        (e as MouseEvent).metaKey;
      setSelected(prev => {
        const has = prev.includes(uid);
        return multi
          ? has
            ? prev.filter(id => id !== uid)
            : [...prev, uid]
          : has
            ? prev
            : [uid];
      });
    };

    const onOverlayDragStart = (uid: string, e: any, d: any) => {
      if (readonly) return;
      const sel = selected.includes(uid) ? selected : [uid];
      const startPxByUid: Record<string, { x: number; y: number }> = {};
      overlays
        .filter(o => o.page === currentPage && sel.includes(o.uid))
        .forEach(o => {
          const { x, y } = toPx(o);
          startPxByUid[o.uid] = { x, y };
        });

      dragUndoSnapshotRef.current = overlays.map(o => ({ ...o }));

      const isCascade =
        (e as MouseEvent)?.ctrlKey || (e as MouseEvent)?.metaKey || false;

      groupDragRef.current = {
        active: true,
        cascade: isCascade,
        anchorUid: uid,
        startPxByUid,
        startAnchorPx: { x: d.x, y: d.y },
        lastDx: 0,
        lastDy: 0,
      };
    };

    const onOverlayDrag = (uid: string, _e: any, d: any) => {
      if (readonly) return;
      const st = groupDragRef.current;
      if (!st.active || !st.startAnchorPx) return;

      const dx = d.x - st.startAnchorPx.x;
      const dy = d.y - st.startAnchorPx.y;

      if (st.cascade) {
        // Ctrl 드래그 모드: 아래줄 + 이후 페이지 전체 이동
        const deltaDx = dx - st.lastDx;
        const deltaDy = dy - st.lastDy;
        if (deltaDx === 0 && deltaDy === 0) return;

        st.lastDx = dx;
        st.lastDy = dy;

        const PB = getPageSize(currentPage);
        const deltaXPct = PB.w > 0 ? deltaDx / PB.w : 0;
        const deltaYPct = PB.h > 0 ? deltaDy / PB.h : 0;

        shiftBelowAndNext(deltaXPct, deltaYPct);
        return;
      }

      // 일반 드래그: 선택된 요소들만 이동
      const sel = selected.includes(uid) ? selected : [uid];

      setOverlays(prev =>
        prev.map(o => {
          if (o.page !== currentPage || !sel.includes(o.uid)) return o;
          const PB = getPageSize(o.page);
          const start = st.startPxByUid[o.uid] || toPx(o);
          const nx = start.x + dx;
          const ny = start.y + dy;

          const sW = isSquareType(o.type) ? Math.min(o.wPct, o.hPct) : o.wPct;
          const sH = isSquareType(o.type) ? Math.min(o.wPct, o.hPct) : o.hPct;

          const w = sW * PB.w;
          const h = sH * PB.h;

          const clampedX = Math.max(0, Math.min(PB.w - w, nx));
          const clampedY = Math.max(0, Math.min(PB.h - h, ny));

          return {
            ...o,
            xPct: clampedX / PB.w,
            yPct: clampedY / PB.h,
          };
        })
      );
    };

    const onOverlayDragStop = () => {
      if (readonly) return;

      if (dragUndoSnapshotRef.current) {
        pushUndoSnapshot(dragUndoSnapshotRef.current);
        dragUndoSnapshotRef.current = null;
      }

      groupDragRef.current = {
        active: false,
        cascade: false,
        anchorUid: null,
        startPxByUid: {},
        startAnchorPx: null,
        lastDx: 0,
        lastDy: 0,
      };
    };

    // -------------------------------------------------------------------------
    // 키보드 단축키
    //   - input/textarea/contentEditable 에 포커스가 있을 때는 동작하지 않게 처리
    // -------------------------------------------------------------------------
    useEffect(() => {
      if (readonly) return;

      const onKey = (e: KeyboardEvent) => {
        // 입력 필드에서의 기본 단축키(Ctrl+C/V/Z 등)는 그대로 사용
        const target = e.target as HTMLElement | null;
        if (target) {
          const tag = target.tagName;
          if (
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT' ||
            target.isContentEditable
          ) {
            return;
          }
        }

        const hasCtrl = e.ctrlKey || e.metaKey;
        const hasShift = e.shiftKey;
        const hasAlt = e.altKey;

        const inPage = overlays.filter(o => o.page === currentPage);

        // Undo / Redo
        if (hasCtrl && !hasShift && e.key.toLowerCase() === 'z') {
          undo();
          e.preventDefault();
          return;
        }
        if (hasCtrl && hasShift && e.key.toLowerCase() === 'z') {
          redo();
          e.preventDefault();
          return;
        }
        if (hasCtrl && e.key.toLowerCase() === 'y') {
          redo();
          e.preventDefault();
          return;
        }

        // Copy
        if (hasCtrl && e.key.toLowerCase() === 'c') {
          clipboardRef.current = inPage
            .filter(o => selected.includes(o.uid))
            .map(o => ({ ...o }));
          e.preventDefault();
          return;
        }

        // Paste
        if (hasCtrl && e.key.toLowerCase() === 'v') {
          const src = clipboardRef.current || [];
          if (src.length === 0) return;
          pushUndoSnapshot();
          const offsetPx = 12;
          setOverlays(prev => {
            const created: OverlayItem[] = [];
            const PB = getPageSize(currentPage);
            src.forEach(s => {
              const r = toPx(s);
              const nx = Math.min(Math.max(0, r.x + offsetPx), PB.w - r.w);
              const ny = Math.min(Math.max(0, r.y + offsetPx), PB.h - r.h);
              created.push({
                ...s,
                uid: `${s.type}-${Date.now()}-${Math.random()}`,
                id: nextId(s.type, currentPage),
                page: currentPage,
                xPct: nx / PB.w,
                yPct: ny / PB.h,
              });
            });
            setSelected(created.map(c => c.uid));
            return [...prev, ...created];
          });
          e.preventDefault();
          return;
        }

        // Duplicate
        if (hasCtrl && e.key.toLowerCase() === 'd') {
          const src = inPage.filter(o => selected.includes(o.uid));
          if (src.length === 0) return;
          pushUndoSnapshot();
          const offsetPx = 12;
          setOverlays(prev => {
            const created: OverlayItem[] = [];
            const PB = getPageSize(currentPage);
            src.forEach(s => {
              const r = toPx(s);
              const nx = Math.min(Math.max(0, r.x + offsetPx), PB.w - r.w);
              const ny = Math.min(Math.max(0, r.y + offsetPx), PB.h - r.h);
              created.push({
                ...s,
                uid: `${s.type}-${Date.now()}-${Math.random()}`,
                id: nextId(s.type, currentPage),
                page: currentPage,
                xPct: nx / PB.w,
                yPct: ny / PB.h,
              });
            });
            setSelected(created.map(c => c.uid));
            return [...prev, ...created];
          });
          e.preventDefault();
          return;
        }

        // Select All
        if (hasCtrl && e.key.toLowerCase() === 'a') {
          setSelected(inPage.map(o => o.uid));
          e.preventDefault();
          return;
        }

        // Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selected.length === 0) return;
          pushUndoSnapshot();
          setOverlays(prev => prev.filter(o => !selected.includes(o.uid)));
          setSelected([]);
          e.preventDefault();
          return;
        }

        // 방향키 이동
        const isArrowKey =
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight';

        if (!isArrowKey) return;

        const hasSelectedInPage = overlays.some(
          o => o.page === currentPage && selected.includes(o.uid)
        );
        if (!hasSelectedInPage) return;

        // Ctrl 없음 → 선택된 것들만 미세 이동
        if (!hasCtrl) {
          const baseStep = 0.005;
          const altStep = 0.001;
          let step = baseStep;

          if (hasAlt && hasShift) {
            step = altStep * 0.5;
          } else if (hasAlt) {
            step = altStep;
          } else if (hasShift) {
            step = baseStep * 0.25;
          }

          pushUndoSnapshot();

          setOverlays(prev =>
            prev.map(o => {
              if (o.page !== currentPage || !selected.includes(o.uid)) {
                return o;
              }

              let x = o.xPct;
              let y = o.yPct;

              if (e.key === 'ArrowLeft') x -= step;
              if (e.key === 'ArrowRight') x += step;
              if (e.key === 'ArrowUp') y -= step;
              if (e.key === 'ArrowDown') y += step;

              const maxX = 1 - o.wPct;
              const maxY = 1 - o.hPct;
              x = Math.max(0, Math.min(maxX, x));
              y = Math.max(0, Math.min(maxY, y));

              return {
                ...o,
                xPct: x,
                yPct: y,
              };
            })
          );

          e.preventDefault();
          return;
        }

        // Ctrl 있음 → 아래줄 + 이후 페이지 전체 이동
        const coarseStep = 0.02;
        const mediumStep = 0.005;
        const ultraFineStep = 0.001;

        let globalStep = coarseStep;
        if (hasShift && hasAlt) {
          globalStep = ultraFineStep;
        } else if (hasShift) {
          globalStep = mediumStep;
        }

        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowDown') dy = globalStep;
        if (e.key === 'ArrowUp') dy = -globalStep;
        if (e.key === 'ArrowRight') dx = globalStep;
        if (e.key === 'ArrowLeft') dx = -globalStep;

        if (dx !== 0 || dy !== 0) {
          pushUndoSnapshot();
          shiftBelowAndNext(dx, dy);
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [selected, overlays, currentPage, readonly]);

    // -------------------------------------------------------------------------
    // 정렬/분배 + 크기 조정 (페이지 사이즈 기반)
    // -------------------------------------------------------------------------
    const alignLeft = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const minL = Math.min(...items.map(o => toPx(o).x));
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, minL, r.y);
      });
    };

    const alignRight = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const maxR = Math.max(
        ...items.map(o => {
          const r = toPx(o);
          return r.x + r.w;
        })
      );
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, maxR - r.w, r.y);
      });
    };

    const alignHCenter = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const minL = Math.min(...items.map(o => toPx(o).x));
      const maxR = Math.max(
        ...items.map(o => {
          const r = toPx(o);
          return r.x + r.w;
        })
      );
      const center = (minL + maxR) / 2;
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, center - r.w / 2, r.y);
      });
    };

    const alignTop = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const minT = Math.min(...items.map(o => toPx(o).y));
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, r.x, minT);
      });
    };

    const alignBottom = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const maxB = Math.max(
        ...items.map(o => {
          const r = toPx(o);
          return r.y + r.h;
        })
      );
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, r.x, maxB - r.h);
      });
    };

    const distributeHorizontally = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 3) return;
      pushUndoSnapshot();
      const sorted = [...items].sort(
        (a, b) => toPx(a).x + toPx(a).w / 2 - (toPx(b).x + toPx(b).w / 2)
      );
      const centers = sorted.map(o => toPx(o).x + toPx(o).w / 2);
      const minC = centers[0];
      const maxC = centers[centers.length - 1];
      const step = (maxC - minC) / (centers.length - 1);
      sorted.forEach((o, i) => {
        if (i === 0 || i === sorted.length - 1) return;
        const r = toPx(o);
        const cx = minC + step * i;
        applyPos(o.uid, cx - r.w / 2, r.y);
      });
    };

    const distributeVertically = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 3) return;
      pushUndoSnapshot();
      const sorted = [...items].sort(
        (a, b) => toPx(a).y + toPx(a).h / 2 - (toPx(b).y + toPx(b).h / 2)
      );
      const centers = sorted.map(o => toPx(o).y + toPx(o).h / 2);
      const minC = centers[0];
      const maxC = centers[centers.length - 1];
      const step = (maxC - minC) / (centers.length - 1);
      sorted.forEach((o, i) => {
        if (i === 0 || i === sorted.length - 1) return;
        const r = toPx(o);
        const cy = minC + step * i;
        applyPos(o.uid, r.x, cy - r.h / 2);
      });
    };

    const alignVCenter = () => {
      if (readonly) return;
      const items = selectedInPage();
      if (items.length < 2) return;
      pushUndoSnapshot();
      const minT = Math.min(...items.map(o => toPx(o).y));
      const maxB = Math.max(
        ...items.map(o => {
          const r = toPx(o);
          return r.y + r.h;
        })
      );
      const center = (minT + maxB) / 2;
      items.forEach(o => {
        const r = toPx(o);
        applyPos(o.uid, r.x, center - r.h / 2);
      });
    };

    const resizeSelected = (factor: number) => {
      const items = overlays.filter(
        o => o.page === currentPage && selected.includes(o.uid)
      );
      if (items.length === 0) return;

      pushUndoSnapshot();

      const minPx = 14;

      setOverlays(prev =>
        prev.map(o => {
          if (o.page !== currentPage || !selected.includes(o.uid)) return o;

          const PB = getPageSize(o.page);

          if (isSquareType(o.type)) {
            // 정사각형 타입은 가로/세로를 같은 비율로 수정
            const s = Math.min(o.wPct, o.hPct);
            let newS = s * factor;

            const minBase = minPx / Math.min(PB.w, PB.h);
            newS = Math.max(minBase, newS);
            newS = Math.min(1, newS);

            const cx = o.xPct + s / 2;
            const cy = o.yPct + s / 2;
            let nx = cx - newS / 2;
            let ny = cy - newS / 2;
            nx = Math.max(0, Math.min(1 - newS, nx));
            ny = Math.max(0, Math.min(1 - newS, ny));
            return { ...o, xPct: nx, yPct: ny, wPct: newS, hPct: newS };
          }

          // 일반 타입은 가로/세로 각각 factor 를 곱하고 중앙 기준으로 확대/축소
          const r = toPx(o);
          let newW = r.w * factor;
          let newH = r.h * factor;

          newW = Math.max(minPx, newW);
          newH = Math.max(minPx, newH);

          let nx = r.x + r.w / 2 - newW / 2;
          let ny = r.y + r.h / 2 - newH / 2;

          nx = Math.max(0, Math.min(PB.w - newW, nx));
          ny = Math.max(0, Math.min(PB.h - newH, ny));

          const wPct = newW / PB.w;
          const hPct = newH / PB.h;
          const xPct = nx / PB.w;
          const yPct = ny / PB.h;
          return {
            ...o,
            xPct: Math.max(0, Math.min(1 - wPct, xPct)),
            yPct: Math.max(0, Math.min(1 - hPct, yPct)),
            wPct,
            hPct,
          };
        })
      );
    };

    // 문서 키 변경 (2345A 이런 값)
    const changeDocKey = () => {
      const key = prompt('문서키(4~5자리 영숫자):', docKey) || docKey;
      const v = (key.match(/[A-Za-z0-9]+/g)?.join('') || docKey).slice(0, 5);
      setDocKey(v);
      seqRef.current = {
        circleslash: 1000,
        textbox: 2000,
        checkbox: 3000,
        calendar: 4000,
        signature: 5000,
      };
      alert(`문서키=${v} / 채번 초기화됨`);
    };

    // -------------------------------------------------------------------------
    // 페이지 이동
    // -------------------------------------------------------------------------
    const goPrevPage = () => {
      setCurrentPage(p => Math.max(1, p - 1));
    };
    const goNextPage = () => {
      const total = getTotalPagesInternal();
      setCurrentPage(p => Math.min(total, p + 1));
    };
    const goToPage = (page: number) => {
      const total = getTotalPagesInternal();
      const p = Math.min(Math.max(1, page), total);
      setCurrentPage(p);
    };

    const getPageInfo = () => ({
      currentPage,
      totalPages: getTotalPagesInternal(),
    });

    // -------------------------------------------------------------------------
    // 외부 ref 로 노출되는 메서드들
    // -------------------------------------------------------------------------
    useImperativeHandle(ref, () => ({
      loadPdfFile: (f: File) => {
        setFile(f);
        setOverlays([]);
        setSelected([]);
        clearHistory();
      },
      restoreFromJson,
      downloadJson,
      downloadJsonAs,
      changeDocKey,
      addOverlay,
      clearPage,
      clearAll,
      alignLeft,
      alignHCenter,
      alignRight,
      alignTop,
      alignVCenter,
      alignBottom,
      distributeHorizontally,
      distributeVertically,
      resizeSelectedPlus: () => resizeSelected(1.1),
      resizeSelectedMinus: () => resizeSelected(0.9),
      shiftBelowAndNext,
      autoDetectGlyphCheckboxes,
      goPrevPage,
      goNextPage,
      goToPage,
      getPageInfo,
      getSelectedOverlayIds: () =>
        selected
          .map(uid => overlays.find(o => o.uid === uid)?.id)
          .filter((id): id is string => !!id),
      constraints: constraintDoc ?? null,
    }));

    // -------------------------------------------------------------------------
    // 오버레이 내부에 실제로 렌더링할 콘텐츠 (에디터/뷰어 분기)
    // -------------------------------------------------------------------------
    const renderOverlayContent = (ov: OverlayItem) => {
      if (readonly) {
        // 뷰어 모드 : 실제 입력 컴포넌트 렌더링
        switch (ov.type) {
          case 'textbox':
            return (
              <textarea
                value={ov.value ?? ''}
                onChange={e => {
                  setText(ov.uid, e.currentTarget.value);
                }}
                rows={3}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #aaa',
                  borderRadius: 0,
                  padding: 0,
                  resize: 'none',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  fontSize: 12,
                  lineHeight: 1.25,
                }}
              />
            );
          case 'checkbox': {
            const checked = (ov.value || '').toLowerCase() === 'y';
            return (
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setCheckbox(ov.uid, e.currentTarget.checked)}
                style={{ width: '100%', height: '100%', cursor: 'pointer' }}
              />
            );
          }
          case 'circleslash': {
            const v = ov.value || '공란';
            let size = '160%';
            if (v === '◯' || v === '⌀') size = '200%';
            if (v === '공란' || v === 'N/A') size = '130%';
            return (
              <button
                onClick={() => cycleCircle(ov.uid)}
                title="'', ◯, ⌀, N/A 순환"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  fontSize: size,
                }}
              >
                {v}
              </button>
            );
          }
          case 'calendar':
            return (
              <input
                type="date"
                value={ov.value ?? ''}
                onChange={e => setDate(ov.uid, e.currentTarget.value)}
                style={{
                  width: '96%',
                  height: '80%',
                  fontSize: 12,
                  color: '#333',
                }}
              />
            );
          case 'signature':
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 2,
                  boxSizing: 'border-box',
                }}
              >
                {ov.value?.startsWith('data:image/') ? (
                  <img
                    src={ov.value}
                    alt="서명"
                    style={{
                      maxWidth: '70%',
                      maxHeight: '70%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 11, color: '#666' }}>서명 없음</span>
                )}
                <button
                  type="button"
                  onClick={() => setSignature(ov.uid)}
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    background: '#f9fafb',
                  }}
                >
                  업로드
                </button>
              </div>
            );
          default:
            return <div />;
        }
      }

      // 에디터 모드 : 타입별로 단순한 placeholder UI만 보여줌
      const base: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        color: '#333',
      };
      switch (ov.type) {
        case 'textbox':
          return (
            <div style={{ ...base, background: 'rgba(255,255,255,0.9)' }}>
              텍스트박스
            </div>
          );
        case 'checkbox':
          return (
            <input
              type="checkbox"
              disabled
              style={{
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
              }}
            />
          );
        case 'circleslash':
          return (
            <div style={{ ...base, padding: 0 }}>
              <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                style={{ display: 'block' }}
              >
                <g transform="translate(12,12)">
                  <circle
                    cx="38"
                    cy="38"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <line
                    x1="12"
                    y1="64"
                    x2="64"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
          );
        case 'calendar':
          return <div style={{ ...base, fontSize: 18 }}>📅</div>;
        case 'signature':
          return <div style={base}>서명</div>;
        default:
          return <div />;
      }
    };

    // -------------------------------------------------------------------------
    // 실제 렌더링
    // -------------------------------------------------------------------------
    return (
      <div className="w-full flex items-center justify-center">
        {pdfDoc ? (
          <div
            style={{
              position: 'relative',
              width: pageBox.w,
              height: pageBox.h,
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,0.6)',
            }}
          >
            {/!* PDF 캔버스 *!/}
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: 8,
              }}
            />

            {/!* 오버레이 / 선택 영역 (캔버스 위에 얹음) *!/}
            <div
              ref={innerRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: pageBox.w,
                height: pageBox.h,
              }}
              onMouseDown={onInnerMouseDown}
              onMouseMove={onInnerMouseMove}
              onMouseUp={onInnerMouseUp}
            >
              {isOverlayVisible &&
                overlays
                  // 현재 페이지 것만 렌더링
                  .filter(o => o.page === currentPage)
                  // 뷰어 + satisfactionbox 숨김 (기존 로직 유지)
                  .filter(
                    o => !(readonly && (o as any).type === 'satisfactionbox')
                  )
                  .map(ov => {
                    const r = toPx(ov);

                    // 뷰어 모드: 드래그/리사이즈 없이 값 입력만 가능
                    if (readonly) {
                      const FIX_OFFSET = 0;
                      return (
                        <div
                          key={ov.uid}
                          id={`overlay-${ov.id}`}
                          style={{
                            position: 'absolute',
                            left: r.x + pageBox.w * FIX_OFFSET,
                            top: r.y,
                            width: r.w,
                            height: r.h,
                            pointerEvents: 'auto',
                          }}
                        >
                          {renderOverlayContent(ov)}
                        </div>
                      );
                    }

                    // 에디터 모드: Rnd 로 드래그/리사이즈 가능
                    const isSel = selected.includes(ov.uid);
                    const isSquare = isSquareType(ov.type);

                    return (
                      <Rnd
                        key={ov.uid}
                        size={{ width: r.w, height: r.h }}
                        position={{ x: r.x, y: r.y }}
                        bounds="parent"
                        scale={scale}
                        lockAspectRatio={isSquare ? 1 : undefined}
                        minWidth={isSquare ? 1 : 20}
                        minHeight={
                          ov.type === 'textbox' ? 28 : isSquare ? 1 : 20
                        }
                        enableResizing={
                          isSquare
                            ? false
                            : {
                                top: true,
                                right: true,
                                bottom: true,
                                left: true,
                                topRight: true,
                                bottomRight: true,
                                bottomLeft: true,
                                topLeft: true,
                              }
                        }
                        onMouseDown={e =>
                          onOverlayMouseDown(e as unknown as MouseEvent, ov.uid)
                        }
                        onDragStart={(e, d) => onOverlayDragStart(ov.uid, e, d)}
                        onDrag={(e, d) => onOverlayDrag(ov.uid, e, d)}
                        onDragStop={onOverlayDragStop}
                        onResizeStop={(_e, _dir, el, _delta, pos) =>
                          applyRect(
                            ov.uid,
                            pos.x,
                            pos.y,
                            el.offsetWidth,
                            el.offsetHeight
                          )
                        }
                        style={{
                          border: isSel
                            ? '2px solid #1e90ff'
                            : '1px dashed #d33',
                          background: isSel
                            ? 'rgba(30,144,255,0.12)'
                            : 'rgba(255,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div
                          style={{ width: '100%', height: '100%' }}
                          onContextMenu={e => {
                            e.preventDefault();
                            if (!onOpenConstraintEditor) return;

                            const selectedUids = selected.includes(ov.uid)
                              ? selected
                              : [ov.uid];

                            const overlaysInPage = overlays.filter(
                              o =>
                                o.page === currentPage &&
                                selectedUids.includes(o.uid)
                            );

                            onOpenConstraintEditor({
                              page: ov.page,
                              overlays: overlaysInPage.length
                                ? overlaysInPage
                                : [ov],
                            });
                          }}
                        >
                          {renderOverlayContent(ov)}
                        </div>
                      </Rnd>
                    );
                  })}

              {/!* 뷰어 전용 attachments (논리 페이지 좌표 기준) *!/}
              {readonly &&
                logicalPages &&
                logicalPages.length > 0 &&
                (() => {
                  const lp = logicalPages[currentPage - 1] as any;
                  if (!lp || !Array.isArray(lp.attachments)) return null;

                  const pageW = lp.width || pageBox.w;
                  const pageH = lp.height || pageBox.h;
                  const sx = pageBox.w / pageW;
                  const sy = pageBox.h / pageH;

                  return (
                    <>
                      {lp.attachments.map((a: any, idx: number) => {
                        const left = Math.round((a.x || 0) * sx);
                        const top = Math.round((a.y || 0) * sy);
                        const width = Math.round((a.width || 0) * sx);
                        const height = Math.round((a.height || 0) * sy);

                        if (a.type === 'image') {
                          return (
                            <div
                              key={`att-img-${idx}`}
                              style={{
                                position: 'absolute',
                                left,
                                top,
                                width,
                                height,
                              }}
                            >
                              <img
                                src={a.src}
                                alt="attachment"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  display: 'block',
                                }}
                              />
                            </div>
                          );
                        }
                        if (a.type === 'video') {
                          return (
                            <div
                              key={`att-video-${idx}`}
                              style={{
                                position: 'absolute',
                                left,
                                top,
                                width,
                                height,
                              }}
                            >
                              <video
                                src={a.src}
                                width={width}
                                height={height}
                                controls={a.controls ?? true}
                                autoPlay={a.autoplay ?? false}
                                loop={a.loop ?? false}
                                muted={a.muted ?? true}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  display: 'block',
                                  borderRadius: 4,
                                }}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`att-text-${idx}`}
                            style={{
                              position: 'absolute',
                              left,
                              top,
                              width,
                              height,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              color: '#333',
                              fontSize: 14,
                            }}
                          >
                            {a.text || ''}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

              {/!* 에디터에서 드래그 선택(마퀴) 영역 표시 *!/}
              {isOverlayVisible && !readonly && isMarquee && (
                <div
                  style={{
                    position: 'absolute',
                    left: marquee.x,
                    top: marquee.y,
                    width: marquee.w,
                    height: marquee.h,
                    border: '1px dashed #1e90ff',
                    background: 'rgba(30,144,255,0.12)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {/!* 페이지 번호 표시 *!/}
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 8,
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(15,23,42,0.75)',
                color: '#e5e7eb',
              }}
            >
              {currentPage} / {getTotalPagesInternal() || '?'}
            </div>
          </div>
        ) : (
          <div className="mt-40 text-sm text-slate-400">
            상단의 <b>PDF 불러오기</b> 버튼으로 파일을 선택해 주세요.
          </div>
        )}
      </div>
    );
  }
);

PDFWorkspace.displayName = 'PDFWorkspace';
*/
