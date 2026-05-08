// src/components/editor/EditorWorkspace.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Rnd } from 'react-rnd';
import { saveAs } from 'file-saver';
import { safeUUID } from '../../lib/safeUuid';

import { detectGlyphBoxesInPdf } from '../../lib/pdfGlyphBoxDetector';
import { detectTextPatternBoxesInPdf } from '../../lib/pdfTextPatternBoxDetector';
import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../../constants/pageSize';
import axios from 'axios';
import { devLog, devWarn } from '../../utils/devConsole';

// -----------------------------------------------------------------------------
// 타입 정의
// -----------------------------------------------------------------------------

export type OverlayType =
  // textbox
  | 'textbox'
  | 'textbox_ml'
  | 'textbox_num'
  | 'textbox_unusing'
  | 'textbox_name'
  | 'textbox_verifier'

  // checkbox
  | 'checkbox'

  // circleslash
  | 'circleslash'

  // calendar
  | 'calendar_date'
  | 'calendar_datetime'

  // signature
  | 'signature_worker'
  | 'signature_verifier'

  // etc
  | 'satisfactionbox'
  | 'button_ox'
  | 'button_oxn'
  | 'button_oxt'
  | 'button_oxtn';

export type MajorOverlayType =
  | 'textbox'
  | 'checkbox'
  | 'circleslash'
  | 'calendar'
  | 'signature'
  | 'button'
  | 'etc';

const OVERLAY_MAJOR_MAP: Record<OverlayType, MajorOverlayType> = {
  textbox: 'textbox',
  textbox_ml: 'textbox',
  textbox_num: 'textbox',
  textbox_unusing: 'textbox',
  textbox_name: 'textbox',
  textbox_verifier: 'textbox',
  checkbox: 'checkbox',
  circleslash: 'circleslash',
  calendar_date: 'calendar',
  calendar_datetime: 'calendar',
  signature_worker: 'signature',
  signature_verifier: 'signature',
  satisfactionbox: 'etc',
  button_ox: 'button',
  button_oxn: 'button',
  button_oxt: 'button',
  button_oxtn: 'button',
};

const getMajorType = (type: OverlayType) => OVERLAY_MAJOR_MAP[type];

const OVERLAY_PREVIEW_MAJOR: Record<
  MajorOverlayType,
  { defaultLabel: string }
> = {
  textbox: { defaultLabel: '텍스트' },
  checkbox: { defaultLabel: '체크박스' },
  circleslash: { defaultLabel: '써클앤슬래시' },
  calendar: { defaultLabel: '날짜' },
  signature: { defaultLabel: '서명' },
  button: { defaultLabel: '버튼' },
  etc: { defaultLabel: '' },
};

export interface OverlayItem {
  uid: string;
  id: string;
  id_key?: string;
  title: string;
  type: OverlayType;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  pageId: string;
  value?: string;
}

export interface PageItem {
  pageId: string;
  logicalPageIndex: number; // 내부 순서 (ID/채번 기준)
  pdfPageNo: number; // -1 가능
  constraintPageNo: number; // rule 매칭용 고유키
  width: number;
  height: number;

  basePageId?: string; // 복사 원본
  pageLabel?: string; // UI 표시용
}
type RenderTaskType = { promise: Promise<unknown>; cancel: () => void };

const FIXED_W = BASE_PAGE_WIDTH;
const FIXED_H = BASE_PAGE_HEIGHT;

const isSquareType = (t: OverlayType) =>
  t === 'circleslash' || t === 'checkbox';

const OVERLAY_PREVIEW: Partial<
  Record<OverlayType, { label?: string; icon?: string; multiline?: boolean }>
> = {
  textbox: { label: '텍스트' },
  textbox_ml: { label: '텍스트\n(멀티라인)', multiline: true },
  textbox_num: { label: '숫자' },
  textbox_name: { label: '점검자 이름' },
  textbox_verifier: { label: '확인자 이름' },

  calendar_date: { icon: '📅', label: '날짜' },
  calendar_datetime: { icon: '📅🕐', label: '날짜 + 시간' },

  signature_worker: { label: '점검자 서명' },
  signature_verifier: { label: '확인자 서명' },

  satisfactionbox: { label: '만족/불만족' },

  button_ox: { label: 'O/X' },
  button_oxn: { label: 'O/X/N' },
  button_oxt: { label: 'O/X/T' },
  button_oxtn: { label: 'O/X/T/N' },
};

function getPageFit(
  viewportW: number,
  viewportH: number,
  BW: number = FIXED_W,
  BH: number = FIXED_H
) {
  const s = Math.min(BW / viewportW, BH / viewportH);
  const drawW = viewportW * s;
  const drawH = viewportH * s;
  return { s, drawW, drawH };
}

function normalizePdfRotation(rotation?: number | null) {
  const r = (((Number(rotation) || 0) % 360) + 360) % 360;

  // 특정 PDF가 /Rotate 180으로 들어와 위아래가 뒤집혀 보이는 경우 보정
  if (r === 180) return 0;

  return r;
}

function resetCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getNextConstraintPageNo(items: PageItem[]) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(p => Number(p.constraintPageNo) || 0)) + 1;
}

// -----------------------------------------------------------------------------
// 에디터 전용 Props / Handle
// -----------------------------------------------------------------------------

export interface EditorWorkspaceProps {
  onPageInfoChange?: (info: {
    currentPage: number;
    totalPages: number;
  }) => void;
  docId?: string;
  isOverlayVisible?: boolean;
  scale?: number;

  sourceMode?: string;
  docKey?: string;
  onChangeDocKey?: (next: string) => void;

  // 우클릭 시 constraint 편집 패널 열기용 콜백
  onOpenConstraintEditor?: (payload: {
    constraintPageNo: number;
    overlays: OverlayItem[];
    rightClickedUid: string;
  }) => void;

  selectedCategory?: MajorOverlayType | null;

  selectedTool?: OverlayType | undefined;
  constraints?: any;
  onPdfLoadedChange?: (loaded: boolean) => void;

  onCopyPageResult?: (info: {
    fromConstraintPageNo: number;
    toConstraintPageNo: number;
    idMap: Record<string, string>;
  }) => void;
}

export interface EditorWorkspaceHandle {
  // 파일/JSON
  loadPdfFile: (file: File) => void;
  loadPdfFromUrl?: (url: string) => void;
  restoreFromJson: (file: File) => Promise<void>;
  downloadJson: () => void;
  downloadJsonAs: () => void;
  downloadJsonCreate: () => void; // 새로운 버전 서식 생성 (createNewVersion: true)
  changeDocKey: () => void;

  // 컴포넌트 조작
  addOverlay: (type: OverlayType) => void;
  clearPage: () => void;
  clearAll: () => void;

  // 정렬
  alignLeft: () => void;
  alignHCenter: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignVCenter: () => void;
  alignBottom: () => void;
  distributeHorizontally: () => void;
  distributeVertically: () => void;

  // 크기
  resizeSelectedPlus: () => void;
  resizeSelectedMinus: () => void;

  // 아래줄 + 이후 페이지 이동
  shiftBelowAndNext: (dxPct: number, dyPct: number) => void;

  // 글리프 기반 체크박스 자동 배치
  autoDetectGlyphCheckboxes: () => Promise<void>;

  autoDetectCircleSlashByNumber: () => Promise<void>;

  // 페이지 이동
  goPrevPage: () => void;
  goNextPage: () => void;
  goToPage: (page: number) => void;
  getPageInfo: () => { currentPage: number; totalPages: number };
  copyCurrentPage: () => void;
  // deleteCurrentPage: () => { deletedPage: number } | null;
  deleteCurrentPage: () => { deletedConstraintPageNo: number } | null;
  exportToJsonString: () => string;
  restoreFromJsonString: (json: string) => void;
  // 선택된 컴포넌트 ID
  getSelectedOverlayIds: () => string[];

  // treelist용: 현재 문서의 모든 circleslash title 목록
  // getAllCircleSlashTitles: () => string[];

  getAllCircleSlashItems: () => { id: string; title: string }[];

  getSelectedOverlay: () => OverlayItem | null;
  updateSelectedOverlay: (patch: Partial<OverlayItem>) => void;
  updateOverlayByUid: (uid: string, patch: Partial<OverlayItem>) => void;
  exportFullState: () => {
    pages: PageItem[];
    overlays: OverlayItem[];
    currentPageId: string | null;
  };

  restoreFullState: (state: {
    pages: PageItem[];
    overlays: OverlayItem[];
    currentPageId: string | null;
  }) => void;

  copyPageRange(params: {
    fromStart: number;
    fromEnd: number;
    insertAfter: number;
  }):
    | {
        fromConstraintPageNo: number;
        toConstraintPageNo: number;
        idMap: Record<string, string>;
      }[]
    | void;
}

// ============================================================================
// EditorWorkspace
// ============================================================================

export const EditorWorkspace = forwardRef<
  EditorWorkspaceHandle,
  EditorWorkspaceProps
>((props, ref) => {
  const {
    constraints,
    onPageInfoChange,
    docId,
    docKey = 'DOC0001',
    onChangeDocKey,
    isOverlayVisible = true,
    scale = 1,
    onOpenConstraintEditor,
    onCopyPageResult,
  } = props;

  devLog('[EditorWorkspace] docKey:', docKey);

  // ===== PDF 상태 & 렌더링 =====
  // - PDF 파일/문서 상태, 현재 페이지, 캔버스, 페이지 박스 사이즈 등
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  // const [numPages, setNumPages] = useState(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTaskType | null>(null);
  const renderRequestIdRef = useRef(0);

  const [pageBox, setPageBox] = useState<{ w: number; h: number }>({
    w: FIXED_W,
    h: FIXED_H,
  });
  const [pageBoxByPage, setPageBoxByPage] = useState<
    Record<string, { w: number; h: number }>
  >({});

  // ===== 오버레이 상태 & 유틸 =====
  // - 문서 메타, ID 채번, 오버레이 배열, 선택 상태 등

  // 문서 메타 / ID 채번
  // const [docKey, setDocKey] = useState('2345A');
  const seqRef = useRef({
    circleslash: 1000,
    textbox: 2000,
    checkbox: 3000,
    calendar: 4000,
    signature: 5000,
    button: 7000,
    drawing: 8000,
  });

  const [meta, setMeta] = useState({
    creationDate: '',
    user: 'admin',
    department: '경영팀',
  });

  // ===== Undo / Redo / History =====
  // - 오버레이 히스토리 스택, 드래그 전 스냅샷 등
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const undoStack = useRef<OverlayItem[][]>([]);
  const redoStack = useRef<OverlayItem[][]>([]);
  const dragUndoSnapshotRef = useRef<OverlayItem[] | null>(null);
  const MAX_HISTORY = 100;

  // ===== Selection / 마퀴 / 그룹 드래그 =====
  // - 선택 박스, 마퀴(드래그 선택), 그룹 드래그 상태 등
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isMarquee, setIsMarquee] = useState(false);
  const [marquee, setMarquee] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  const groupDragRef = useRef<{
    active: boolean;
    cascade: boolean;
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

  const clipboardRef = useRef<OverlayItem[] | null>(null);

  // ===== PDF 상태 & 렌더링 - worker / 공통 유틸 =====

  // worker 설정
  useEffect(() => {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
  }, []);

  useEffect(() => {
    props.onPdfLoadedChange?.(!!pdfDoc);
  }, [pdfDoc]);

  useEffect(() => {
    if (!docId) return;
    loadPdfFromUrl(`/pdfs/${docId}.pdf`);
  }, [docId]);

  // 공통 유틸 (PDF/오버레이에서 함께 사용)

  const getTotalPagesInternal = () => pages.length;

  const getPageSize = (pageId?: string) => {
    const pid = pageId ?? currentPageId;
    if (!pid) return pageBox;
    return pageBoxByPage[pid] ?? pageBox;
  };

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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

  const syncSeqRefFromOverlays = (items: OverlayItem[]) => {
    const maxByMajor: Record<string, number> = {
      circleslash: 1000,
      textbox: 2000,
      checkbox: 3000,
      calendar: 4000,
      signature: 5000,
      button: 7000,
      drawing: 8000,
    };

    items.forEach(o => {
      const m = o.id.match(/(\d{4})$/);
      if (!m) return;
      const seq = Number(m[1]);
      const major = getMajorType(o.type);
      if (seq > maxByMajor[major]) {
        maxByMajor[major] = seq;
      }
    });

    Object.keys(maxByMajor).forEach(k => {
      (seqRef.current as any)[k] = maxByMajor[k];
    });
  };

  const copyCurrentPage = () => {
    if (!currentPageId) return;

    const srcPage = pages.find(p => p.pageId === currentPageId);
    if (!srcPage) return;

    const maxLogicalIndex = Math.max(...pages.map(p => p.logicalPageIndex));

    const newPage: PageItem = {
      pageId: safeUUID(),
      logicalPageIndex: maxLogicalIndex + 1,
      pdfPageNo: srcPage.pdfPageNo,
      constraintPageNo: getNextConstraintPageNo(pages),
      width: srcPage.width,
      height: srcPage.height,
    };

    const idMap: Record<string, string> = {};

    setPages(prev => [...prev, newPage]);

    setOverlays(prev => {
      const next = [
        ...prev,
        ...prev
          .filter(o => o.pageId === srcPage.pageId)
          .map(o => {
            const newId = nextId(o.type, newPage.logicalPageIndex);
            idMap[o.id] = newId;

            return {
              ...o,
              uid: `${o.type}-${Date.now()}-${Math.random()}`,
              id: newId,
              pageId: newPage.pageId,
            };
          }),
      ];

      onCopyPageResult?.({
        fromConstraintPageNo: srcPage.constraintPageNo,
        toConstraintPageNo: newPage.constraintPageNo,
        idMap,
      });

      return next;
    });

    setCurrentPageId(newPage.pageId);
  };

  const deleteCurrentPage = () => {
    if (!currentPageId) return null;
    if (pages.length <= 1) return null;

    const target = pages.find(p => p.pageId === currentPageId);
    if (!target) return null;

    const deletedLogicalPageIndex = target.logicalPageIndex;
    const deletedConstraintPageNo = target.constraintPageNo;

    const nextPages = pages
      .filter(p => p.pageId !== currentPageId)
      .map(p =>
        p.logicalPageIndex > deletedLogicalPageIndex
          ? { ...p, logicalPageIndex: p.logicalPageIndex - 1 }
          : p
      );

    setOverlays(prev => prev.filter(o => o.pageId !== currentPageId));
    setPages(nextPages);

    const next =
      nextPages.find(p => p.logicalPageIndex === deletedLogicalPageIndex) ??
      nextPages.find(p => p.logicalPageIndex === deletedLogicalPageIndex - 1);

    setCurrentPageId(next?.pageId ?? null);

    return { deletedConstraintPageNo };
  };

  //
  const copyPageRange = ({
    fromStart,
    fromEnd,
    insertAfter,
  }: {
    fromStart: number;
    fromEnd: number;
    insertAfter: number;
  }) => {
    if (fromStart > fromEnd) return;

    const sourcePages = pages
      .filter(
        p => p.logicalPageIndex >= fromStart && p.logicalPageIndex <= fromEnd
      )
      .sort((a, b) => a.logicalPageIndex - b.logicalPageIndex);

    if (sourcePages.length === 0) return;

    const insertIndex = pages.findIndex(
      p => p.logicalPageIndex === insertAfter
    );
    if (insertIndex === -1) return;

    const results: {
      fromConstraintPageNo: number;
      toConstraintPageNo: number;
      idMap: Record<string, string>;
    }[] = [];

    const newPages: PageItem[] = [];
    const newOverlays: OverlayItem[] = [];
    let logicalOffset = insertAfter;

    sourcePages.forEach(srcPage => {
      const newPageId = safeUUID();
      logicalOffset++;

      const idMap: Record<string, string> = {};
      const newConstraintPageNo = getNextConstraintPageNo([
        ...pages,
        ...newPages,
      ]);

      const newPage: PageItem = {
        ...srcPage,
        pageId: newPageId,
        logicalPageIndex: logicalOffset,
        constraintPageNo: newConstraintPageNo,
      };

      newPages.push(newPage);

      overlays
        .filter(o => o.pageId === srcPage.pageId)
        .forEach(o => {
          const newId = nextId(o.type, logicalOffset);
          idMap[o.id] = newId;

          newOverlays.push({
            ...o,
            uid: `${o.type}-${Date.now()}-${Math.random()}`,
            id: newId,
            pageId: newPageId,
          });
        });

      results.push({
        fromConstraintPageNo: srcPage.constraintPageNo,
        toConstraintPageNo: newConstraintPageNo,
        idMap,
      });
    });

    const updatedPages = pages.map(p =>
      p.logicalPageIndex > insertAfter
        ? {
            ...p,
            logicalPageIndex: p.logicalPageIndex + sourcePages.length,
          }
        : p
    );

    setPages([
      ...updatedPages.slice(0, insertIndex + 1),
      ...newPages,
      ...updatedPages.slice(insertIndex + 1),
    ]);

    setOverlays(prev => [...prev, ...newOverlays]);
    setCurrentPageId(newPages[0].pageId);

    return results;
  };

  const nextId = (type: OverlayType, page: number) => {
    const major = getMajorType(type);
    const cur = ++(seqRef.current as any)[major];

    const safeDocKey = String(docKey).replace(/[^A-Za-z0-9]/g, '');
    const p = String(page).padStart(3, '0');
    const c = String(cur).padStart(4, '0');

    return `${safeDocKey}${p}${c}`;
  };

  const selectedInPage = () =>
    overlays.filter(
      o => o.pageId === currentPageId && selected.includes(o.uid)
    );

  const toPx = (ov: OverlayItem) => {
    const { w: PW, h: PH } = getPageSize(ov.pageId);
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

  const pushUndoSnapshot = (snapshot?: OverlayItem[]) => {
    const snap = snapshot ?? overlays.map(o => ({ ...o }));
    undoStack.current.push(snap);
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
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

  // ===== PDF 상태 & 렌더링 - 파일 로드 / 렌더링 =====

  const loadPdfFromUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      alert('PDF 파일을 불러오지 못했습니다.');
      return;
    }

    const blob = await res.blob();
    const file = new File([blob], 'remote.pdf', {
      type: 'application/pdf',
    });

    setFile(file);
    // setHasPdfLoaded(true);
    setOverlays([]);
    setSelected([]);
    clearHistory();
  };

  // PDF 로드 (File 기준)
  useEffect(() => {
    if (!file) {
      setPdfDoc(null);
      setCurrentPageId(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const makeData = () => {
        const copy = arrayBuffer.slice(0); // 새로운 ArrayBuffer 생성
        return new Uint8Array(copy); // 이 복사본으로 Uint8Array 생성
      };

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

        // setNumPages(doc.numPages);
        const newPages: PageItem[] = Array.from(
          { length: doc.numPages },
          (_, i) => ({
            pageId: safeUUID(),
            logicalPageIndex: i + 1,
            pdfPageNo: i + 1,
            constraintPageNo: i + 1,
            width: FIXED_W,
            height: FIXED_H,
          })
        );

        setPages(newPages);
        setCurrentPageId(newPages[0]?.pageId ?? null);
        setMeta(genMeta());
        clearHistory();
        setOverlays([]);
        setPageBoxByPage({});
      };

      try {
        await tryLoad(true);
      } catch (e) {
        devWarn('[EditorWorkspace] load with CMap failed, retry', e);
        await tryLoad(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  // PDF 렌더링
  useEffect(() => {
    if (!pdfDoc) return;

    const requestId = ++renderRequestIdRef.current;

    const render = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          devWarn('[EditorWorkspace] cancel renderTask failed', e);
        }
        renderTaskRef.current = null;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pg = pages.find(p => p.pageId === currentPageId);
      const pdfPageNo = pg?.pdfPageNo ?? 1;

      let page: PDFPageProxy;

      try {
        page = await pdfDoc.getPage(pdfPageNo);
      } catch (e) {
        devWarn('[EditorWorkspace] getPage failed', e);
        return;
      }

      if (requestId !== renderRequestIdRef.current) return;

      const viewport = page.getViewport({
        scale: 1,
        rotation: normalizePdfRotation((page as any).rotate),
      });

      const isLandscape = viewport.width > viewport.height;
      const BW = isLandscape ? FIXED_H : FIXED_W;
      const BH = isLandscape ? FIXED_W : FIXED_H;

      const { s, drawW, drawH } = getPageFit(
        viewport.width,
        viewport.height,
        BW,
        BH
      );

      if (currentPageId) {
        setPageBox({ w: drawW, h: drawH });
        setPageBoxByPage(prev => ({
          ...prev,
          [currentPageId]: { w: drawW, h: drawH },
        }));
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${drawW}px`;
      canvas.style.height = `${drawH}px`;

      resetCanvas(canvas, ctx, drawW * dpr, drawH * dpr);

      if (requestId !== renderRequestIdRef.current) return;

      const task = (page as any).render({
        canvasContext: ctx as any,
        viewport,
        transform: [s * dpr, 0, 0, s * dpr, 0, 0],
      }) as any;

      renderTaskRef.current = task as RenderTaskType;

      try {
        await task.promise;
      } catch (e: any) {
        if (e?.name !== 'RenderingCancelledException') {
          devWarn('[EditorWorkspace] render task error', e);
        }
      } finally {
        if (renderTaskRef.current === task) {
          renderTaskRef.current = null;
        }
      }
    };

    void render();

    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          devWarn('[EditorWorkspace] cancel on cleanup failed', e);
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPageId]);

  // 페이지 전환 시 pageBox 동기화 (이미 계산된 값 즉시 반영)
  useEffect(() => {
    if (!currentPageId) return;
    const pb = pageBoxByPage[currentPageId];
    if (pb) setPageBox(pb);
  }, [currentPageId, pageBoxByPage]);

  // 상위로 페이지 정보 전달
  useEffect(() => {
    const total = getTotalPagesInternal();
    const currentPage =
      pages.find(p => p.pageId === currentPageId)?.logicalPageIndex ?? 1;

    onPageInfoChange?.({
      currentPage,
      totalPages: total,
    });
  }, [currentPageId, pages, onPageInfoChange]);

  // ===== 위치/크기 적용 헬퍼 (오버레이용) =====

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
        const { w: PW, h: PH } = getPageSize(o.pageId);

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

        const { w: PW, h: PH } = getPageSize(o.pageId);
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

  // ===== 오버레이 추가/삭제 =====

  const addOverlay = (type: OverlayType) => {
    if (!pdfDoc) return;

    // circleslash는 title 필수
    let title = '';
    if (type === 'circleslash') {
      title = window.prompt('항목 이름(title)을 입력하세요')?.trim() || '';
      if (!title) {
        alert('title은 필수입니다.');
        return;
      }
    }

    pushUndoSnapshot();

    const def: Record<
      OverlayType,
      { wPct: number; hPct: number; value: string }
    > = {
      circleslash: { wPct: 0.04, hPct: 0.04, value: '' },

      textbox: { wPct: 0.32, hPct: 0.04, value: '' },
      textbox_ml: { wPct: 0.32, hPct: 0.08, value: '' },
      textbox_num: { wPct: 0.24, hPct: 0.04, value: '' },
      textbox_unusing: { wPct: 0.32, hPct: 0.04, value: '' },
      textbox_name: { wPct: 0.24, hPct: 0.04, value: '' },
      textbox_verifier: { wPct: 0.24, hPct: 0.04, value: '' },

      checkbox: { wPct: 0.02, hPct: 0.02, value: 'n' },

      calendar_date: { wPct: 0.26, hPct: 0.04, value: '' },
      calendar_datetime: { wPct: 0.26, hPct: 0.04, value: '' },

      signature_worker: { wPct: 0.18, hPct: 0.04, value: '' },
      signature_verifier: { wPct: 0.18, hPct: 0.04, value: '' },

      satisfactionbox: { wPct: 0.18, hPct: 0.04, value: '' },
      button_ox: { wPct: 0.18, hPct: 0.04, value: '' },
      button_oxn: { wPct: 0.18, hPct: 0.04, value: '' },
      button_oxt: { wPct: 0.18, hPct: 0.04, value: '' },
      button_oxtn: { wPct: 0.18, hPct: 0.04, value: '' },
    };

    const preset = def[type];
    if (!preset) {
      console.error('[addOverlay] undefined preset for type:', type);
      alert(`정의되지 않은 오버레이 타입입니다: ${type}`);
      return;
    }

    let { wPct, hPct } = preset;
    const { value } = preset;
    if (isSquareType(type)) {
      const s = Math.min(wPct, hPct);
      wPct = s;
      hPct = s;
    }

    const pg = pages.find(p => p.pageId === currentPageId);
    if (!pg) return;
    const id = nextId(type, pg.logicalPageIndex);
    setOverlays(prev => [
      ...prev,
      {
        uid: `${type}-${Date.now()}-${Math.random()}`,
        id,
        title: type === 'circleslash' ? title : '',
        type,
        xPct: 0.25,
        yPct: 0.25,
        wPct,
        hPct,
        pageId: currentPageId!,
        value,
      },
    ]);
  };

  const clearPage = () => {
    pushUndoSnapshot();
    setOverlays(prev => prev.filter(o => o.pageId !== currentPageId));
  };

  const resetSeqRef = () => {
    seqRef.current = {
      circleslash: 1000,
      textbox: 2000,
      checkbox: 3000,
      calendar: 4000,
      signature: 5000,
      button: 7000,
      drawing: 8000,
    };
  };

  const clearAll = () => {
    pushUndoSnapshot();
    setOverlays([]);
    setSelected([]);
    clearHistory();

    resetSeqRef();
  };

  // ===== JSON 저장/복원 =====
  const buildTemplateJson = () => {
    if (!pdfDoc) return null;

    const out: any = {
      doc: {
        id: '',
        publishId: '',
        name: '',
        doc_type: '',
      },
      pages: [] as any[],
    };

    pages.forEach(pg => {
      const items = overlays.filter(o => o.pageId === pg.pageId);

      out.pages.push({
        page: pg.logicalPageIndex,
        pdfPageNo: pg.pdfPageNo,
        constraintPageNo: pg.constraintPageNo,
        width: pg.width,
        height: pg.height,
        isChange: items.length > 0 ? 'Y' : 'N',
        components: items.map(o => ({
          id: o.id,
          ...(o.id_key ? { id_key: o.id_key } : {}),
          type: o.type,
          x: Math.round(o.xPct * pg.width),
          y: Math.round(o.yPct * pg.height),
          width: Math.round(o.wPct * pg.width),
          height: Math.round(o.hPct * pg.height),
          xPct: o.xPct,
          yPct: o.yPct,
          wPct: o.wPct,
          hPct: o.hPct,
          value: o.value ?? '',
        })),
      });
    });

    return out;
  };

  // Rule(JSON) 생성 함수
  const buildRuleJson = () => {
    if (!constraints) {
      return { pages: [] };
    }

    const hasRule =
      Array.isArray(constraints.pages) &&
      constraints.pages.some(
        (p: any) => Array.isArray(p.components) && p.components.length > 0
      );

    if (!hasRule) {
      return { pages: [] };
    }

    // 그대로 서버에 저장
    return constraints;
  };

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

    pages.forEach(pg => {
      const items = overlays.filter(o => o.pageId === pg.pageId);

      out.pages.push({
        page: pg.logicalPageIndex,
        pdfPageNo: pg.pdfPageNo,
        constraintPageNo: pg.constraintPageNo,
        width: pg.width,
        height: pg.height,
        isChange: items.length > 0 ? 'Y' : 'N',
        components: items.map(o => ({
          id: o.id,
          ...(o.id_key ? { id_key: o.id_key } : {}),
          type: o.type,
          x: Math.round(o.xPct * pg.width),
          y: Math.round(o.yPct * pg.height),
          width: Math.round(o.wPct * pg.width),
          height: Math.round(o.hPct * pg.height),
          xPct: o.xPct,
          yPct: o.yPct,
          wPct: o.wPct,
          hPct: o.hPct,
          value: o.value ?? '',
        })),
      });
    });

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

  // 저장 (없으면 생성, 있으면 수정)
  const downloadJsonCreate = async () => {
    // Overlay(JSON)
    const templateJson = buildTemplateJson();

    // Constraint(JSON)
    const ruleJson = buildRuleJson();

    devLog('downloadJsonCreate = templateJson =', templateJson);
    devLog('downloadJsonCreate = ruleJson =', ruleJson);

    if (!templateJson) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const FRM_UNQ_KY_VAL = urlParams.get('FRM_UNQ_KY_VAL');

      if (!FRM_UNQ_KY_VAL) {
        alert('서식 키가 없습니다. PDF를 먼저 불러온 후 저장해주세요.');
        return;
      }

      devLog(
        `[EditorWorkspace] API Request: POST /FormJsonSave_M.do (FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL})`
      );

      // � 핵심: form-urlencoded 로 변환
      const formParams = new URLSearchParams();
      formParams.append('FRM_UNQ_KY_VAL', FRM_UNQ_KY_VAL);
      formParams.append('FRM_OVER_JSON', JSON.stringify(templateJson));
      formParams.append('FRM_CONS_JSON', JSON.stringify(ruleJson));

      devLog('SAVE PAYLOAD', {
        FRM_UNQ_KY_VAL,
        FRM_OVER_JSON: JSON.stringify(templateJson).length,
        FRM_CONS_JSON: JSON.stringify(ruleJson).length,
      });

      const API_BASE = import.meta.env.PROD ? '' : '/api';

      const response = await axios.post(
        `${API_BASE}/FormJsonSave_M.do`,
        formParams,
        {
          withCredentials: true,
          timeout: 30000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      devLog('[EditorWorkspace] Form JSON saved:', response.data);
      const message = response.data?.resultMsg || '서식이 저장되었습니다.';
      alert(`✅ ${message}`);
    } catch (error: any) {
      console.error('[EditorWorkspace] Form save error:', error);

      const errorMessage =
        error.response?.data?.error || error.message || '알 수 없는 오류';

      if (error.code === 'ECONNABORTED') {
        alert(`저장 중 타임아웃이 발생했습니다.\n\n잠시 후 다시 시도해주세요.`);
      } else {
        alert(`저장 중 오류가 발생했습니다.\n\n${errorMessage}`);
      }
    }
  };

  const restoreFromJson = async (jf: File) => {
    try {
      const txt = await jf.text();
      const obj = JSON.parse(txt);
      if (!Array.isArray(obj?.pages)) {
        alert('올바른 템플릿 JSON 포맷이 아닙니다.\n(pages 배열이 없습니다)');
        return;
      }

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
      const pbp: Record<string, { w: number; h: number }> = {};
      const usedIds = new Set<string>(); // ★ 추가: 중복 ID 방지
      const MIN_PCT = 0.0025;

      const newPages: PageItem[] = obj.pages.map((pg: any, index: number) => ({
        pageId: safeUUID(),
        logicalPageIndex: Number(pg.page) || index + 1,
        pdfPageNo: pg.pdfPageNo ?? index + 1,
        constraintPageNo: Number(pg.constraintPageNo) || index + 1,
        width: pg.width || FIXED_W,
        height: pg.height || FIXED_H,
      }));

      setPages(newPages);

      obj.pages.forEach((pg: any) => {
        const pageNo: number = Number(pg.page) || 1;
        const W: number = pg.width || FIXED_W;
        const H: number = pg.height || FIXED_H;
        const pageId = newPages[pageNo - 1]?.pageId;
        if (pageId) {
          pbp[pageId] = { w: W, h: H };
        }

        (pg.components || []).forEach((c: any) => {
          if (c.type === 'satisfactionbox') return;

          const xPct = typeof c.xPct === 'number' ? c.xPct : c.x / W;
          const yPct = typeof c.yPct === 'number' ? c.yPct : c.y / H;
          const wPct = typeof c.wPct === 'number' ? c.wPct : c.width / W;
          const hPct = typeof c.hPct === 'number' ? c.hPct : c.height / H;

          let id = String(c.id);

          // ★ 이미 사용된 ID면 새로 생성
          if (usedIds.has(id)) {
            id = nextId(c.type as OverlayType, pageNo);
          }
          usedIds.add(id);

          restored.push({
            uid: `${c.type}-${Date.now()}-${Math.random()}`,
            id,
            id_key: typeof c.id_key === 'string' ? c.id_key : undefined,
            title: c.type === 'circleslash' ? (c.title ?? '') : '',
            type: c.type as OverlayType,
            xPct: Math.max(0, Math.min(1, xPct)),
            yPct: Math.max(0, Math.min(1, yPct)),
            wPct: Math.max(MIN_PCT, Math.min(1, wPct)),
            hPct: Math.max(MIN_PCT, Math.min(1, hPct)),
            pageId: newPages[pageNo - 1]?.pageId,
            value: typeof c.value === 'string' ? c.value : '',
          });
        });
      });

      setOverlays(restored);
      syncSeqRefFromOverlays(restored);
      setCurrentPageId(newPages[0]?.pageId ?? null);
      setSelected([]);
      setPageBoxByPage(pbp);
      if (newPages[0]?.pageId && pbp[newPages[0].pageId]) {
        setPageBox(pbp[newPages[0].pageId]);
      }
    } catch (err) {
      console.error(err);
      alert('JSON 로드 중 오류가 발생했습니다.');
    }
  };

  // ===== shiftBelowAndNext (아래줄+이후 페이지 이동) =====

  const shiftBelowAndNext = (deltaXPct: number, deltaYPct: number) => {
    const items = selectedInPage();
    if (items.length === 0) return;

    const anchorY = Math.min(...items.map(o => o.yPct));
    // const totalPages = getTotalPagesInternal();

    setOverlays(prev =>
      prev.map(o => {
        const curIdx = pages.findIndex(p => p.pageId === currentPageId);
        const ovIdx = pages.findIndex(p => p.pageId === o.pageId);

        const isOnCurrentAndBelow =
          o.pageId === currentPageId && o.yPct >= anchorY;
        const isOnLaterPage = ovIdx > curIdx;

        if (!isOnCurrentAndBelow && !isOnLaterPage) return o;

        let x = o.xPct + deltaXPct;
        const maxX = 1 - o.wPct;
        x = Math.max(0, Math.min(maxX, x));

        let y = o.yPct + deltaYPct;
        let pageIdx = ovIdx;

        if (deltaYPct > 0) {
          while (y + o.hPct > 1 && pageIdx < pages.length - 1) {
            y -= 1;
            pageIdx += 1;
          }
        } else if (deltaYPct < 0) {
          while (y < 0 && pageIdx > 0) {
            y += 1;
            pageIdx -= 1;
          }
        }

        const maxY = 1 - o.hPct;
        y = Math.max(0, Math.min(maxY, y));

        return {
          ...o,
          pageId: pages[pageIdx].pageId,
          xPct: x,
          yPct: y,
        };
      })
    );
  };

  // ===== 글리프 기반 체크박스 자동 감지 =====
  const autoDetectGlyphCheckboxes = async () => {
    if (!pdfDoc) return;

    const boxes = await detectGlyphBoxesInPdf(pdfDoc, {
      targetChars: ['□', '☐'],
      inflatePx: 2,
      minGlyphHeightPx: 6,
      baseWidth: FIXED_W,
      baseHeight: FIXED_H,
    });

    if (boxes.length === 0) return;

    pushUndoSnapshot();

    const epsilon = 0.002;

    setOverlays(prev => {
      const next = [...prev];
      const existingIds = new Set(next.map(o => o.id));

      for (const b of boxes) {
        const exists = next.some(
          o =>
            o.pageId === pages[b.page - 1]?.pageId &&
            o.type === 'checkbox' &&
            Math.abs(o.xPct - b.xPct) < epsilon &&
            Math.abs(o.yPct - b.yPct) < epsilon
        );

        if (exists) continue;

        let newId = nextId('checkbox', b.page);

        while (existingIds.has(newId)) {
          newId = nextId('checkbox', b.page);
        }
        existingIds.add(newId);

        const cx = b.xPct + b.wPct / 2;
        const cy = b.yPct + b.hPct / 2;

        let adjX = 0;
        let adjY = 0;
        if (b.hPct < 0.015) {
          adjX = -0.003;
          adjY = -0.0035;
        }

        const x = Math.max(0, Math.min(1 - b.wPct, cx - b.wPct / 2 + adjX));
        const y = Math.max(0, Math.min(1 - b.hPct, cy - b.hPct / 2 + adjY));

        next.push({
          uid: `checkbox-${Date.now()}-${Math.random()}`,
          id: newId,
          title: newId,
          type: 'checkbox',
          pageId: pages[b.page - 1].pageId,
          xPct: x,
          yPct: y,
          wPct: b.wPct,
          hPct: b.hPct,
          value: 'n',
        });
      }

      return next;
    });
  };

  // ===== 숫자 패턴 기반 circleslash 자동 감지 =====
  const autoDetectCircleSlashByNumber = async () => {
    if (!pdfDoc) return;

    const boxes = await detectTextPatternBoxesInPdf(pdfDoc, {
      patterns: [/^\d+\.\d+$/, /^\d+\.\d+\.\d+$/],
      place: 'left',
      inflatePx: 2,
      minTextHeightPx: 6,
      baseWidth: FIXED_W,
      baseHeight: FIXED_H,
    });

    if (boxes.length === 0) return;

    pushUndoSnapshot();

    const epsilon = 0.002;

    setOverlays(prev => {
      const next = [...prev];
      const existingIds = new Set(next.map(o => o.id));

      for (const b of boxes) {
        const exists = next.some(
          o =>
            o.pageId === pages[b.page - 1]?.pageId &&
            o.type === 'circleslash' &&
            Math.abs(o.xPct - b.xPct) < epsilon &&
            Math.abs(o.yPct - b.yPct) < epsilon
        );
        if (exists) continue;

        let newId = nextId('circleslash', b.page);
        while (existingIds.has(newId)) {
          newId = nextId('circleslash', b.page);
        }
        existingIds.add(newId);

        const x = Math.max(0, Math.min(1 - b.wPct, b.xPct));
        const y = Math.max(0, Math.min(1 - b.hPct, b.yPct));

        next.push({
          uid: `circleslash-${Date.now()}-${Math.random()}`,
          id: newId,
          title: b.text,
          type: 'circleslash',
          pageId: pages[b.page - 1].pageId,
          xPct: x,
          yPct: y,
          wPct: b.wPct,
          hPct: b.hPct,
          value: '',
        });
      }

      return next;
    });
  };

  // ===== Selection / 마퀴 / 그룹 드래그 - 마우스 핸들러 =====

  const onInnerMouseDown: React.MouseEventHandler<HTMLDivElement> = e => {
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
  ) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const onInnerMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!isMarquee) return;
    setIsMarquee(false);
    marqueeStartRef.current = null;
    if (marquee.w < 3 && marquee.h < 3) return;
    const newly = overlays
      .filter(o => o.pageId === currentPageId)
      .filter(o => {
        const r = toPx(o);
        return rectsIntersect({ x: r.x, y: r.y, w: r.w, h: r.h }, marquee);
      })
      .map(o => o.uid);
    setSelected(prev => Array.from(new Set([...prev, ...newly])));
  };

  const onOverlayMouseDown = (e: MouseEvent, uid: string) => {
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
    const sel = selected.includes(uid) ? selected : [uid];
    const startPxByUid: Record<string, { x: number; y: number }> = {};
    overlays
      .filter(o => o.pageId === currentPageId && sel.includes(o.uid))
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
    const st = groupDragRef.current;
    if (!st.active || !st.startAnchorPx) return;

    const dx = d.x - st.startAnchorPx.x;
    const dy = d.y - st.startAnchorPx.y;

    if (st.cascade) {
      const deltaDx = dx - st.lastDx;
      const deltaDy = dy - st.lastDy;
      if (deltaDx === 0 && deltaDy === 0) return;

      st.lastDx = dx;
      st.lastDy = dy;

      if (!currentPageId) return;
      const PB = getPageSize(currentPageId);
      const deltaXPct = PB.w > 0 ? deltaDx / PB.w : 0;
      const deltaYPct = PB.h > 0 ? deltaDy / PB.h : 0;

      shiftBelowAndNext(deltaXPct, deltaYPct);
      return;
    }

    const sel = selected.includes(uid) ? selected : [uid];
    setOverlays(prev =>
      prev.map(o => {
        if (o.pageId !== currentPageId || !sel.includes(o.uid)) return o;
        const PB = getPageSize(o.pageId);
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

  // ===== Keyboard Shortcuts =====
  // - Ctrl/⌘ + Z/Y/C/V/D/A, Delete, 방향키, Ctrl+방향키(shiftBelowAndNext) 등
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

      const inPage = overlays.filter(o => o.pageId === currentPageId);

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
        if (!currentPageId) return;
        const pg = pages.find(p => p.pageId === currentPageId);
        if (!pg) return;
        pushUndoSnapshot();
        const offsetPx = 12;
        const PB = getPageSize(currentPageId);
        setOverlays(prev => {
          const created: OverlayItem[] = [];
          src.forEach(s => {
            const r = toPx(s);
            const nx = Math.min(Math.max(0, r.x + offsetPx), PB.w - r.w);
            const ny = Math.min(Math.max(0, r.y + offsetPx), PB.h - r.h);
            created.push({
              ...s,
              uid: `${s.type}-${Date.now()}-${Math.random()}`,
              id: nextId(s.type, pg.logicalPageIndex),
              title: s.title ?? '',
              pageId: currentPageId,
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
        if (!currentPageId) return;
        const pg = pages.find(p => p.pageId === currentPageId);
        if (!pg) return;
        const src = inPage.filter(o => selected.includes(o.uid));
        if (src.length === 0) return;
        pushUndoSnapshot();
        const offsetPx = 12;
        const PB = getPageSize(currentPageId);
        setOverlays(prev => {
          const created: OverlayItem[] = [];
          src.forEach(s => {
            const r = toPx(s);
            const nx = Math.min(Math.max(0, r.x + offsetPx), PB.w - r.w);
            const ny = Math.min(Math.max(0, r.y + offsetPx), PB.h - r.h);
            created.push({
              ...s,
              uid: `${s.type}-${Date.now()}-${Math.random()}`,
              id: nextId(s.type, pg.logicalPageIndex),
              title: s.title ?? '',
              pageId: currentPageId,
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

      const isArrowKey =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight';
      if (!isArrowKey) return;

      const hasSelectedInPage = overlays.some(
        o => o.pageId === currentPageId && selected.includes(o.uid)
      );
      if (!hasSelectedInPage) return;

      // 단일 이동
      if (!hasCtrl) {
        const baseStep = 0.005;
        const altStep = 0.001;
        let step = baseStep;

        if (hasAlt && hasShift) step = altStep * 0.5;
        else if (hasAlt) step = altStep;
        else if (hasShift) step = baseStep * 0.25;

        pushUndoSnapshot();

        setOverlays(prev =>
          prev.map(o => {
            if (o.pageId !== currentPageId || !selected.includes(o.uid))
              return o;

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

            return { ...o, xPct: x, yPct: y };
          })
        );

        e.preventDefault();
        return;
      }

      // Ctrl + 방향키 → 아래줄 + 이후 페이지 전체 이동
      const coarseStep = 0.02;
      const mediumStep = 0.005;
      const ultraFineStep = 0.001;

      let globalStep = coarseStep;
      if (hasShift && hasAlt) globalStep = ultraFineStep;
      else if (hasShift) globalStep = mediumStep;

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
  }, [selected, overlays, currentPageId]);

  // ===== 정렬 / 분배 / 크기조정 =====

  const alignLeft = () => {
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

  const alignVCenter = () => {
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

  const distributeHorizontally = () => {
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

  const resizeSelected = (factor: number) => {
    const items = overlays.filter(
      o => o.pageId === currentPageId && selected.includes(o.uid)
    );
    if (items.length === 0) return;
    pushUndoSnapshot();

    const minPx = 14;

    setOverlays(prev =>
      prev.map(o => {
        if (o.pageId !== currentPageId || !selected.includes(o.uid)) return o;
        const PB = getPageSize(o.pageId);

        if (isSquareType(o.type)) {
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

  // ===== 문서키 변경 =====

  const changeDocKey = () => {
    const key = prompt('문서키(4~6자리 영숫자):', docKey) || docKey;
    const v = (key.match(/[A-Za-z0-9]+/g)?.join('') || docKey).slice(0, 6);
    onChangeDocKey?.(v);
    resetSeqRef();
    alert(`문서키=${v} / 채번 초기화됨`);
  };

  // ===== 페이지 이동 =====

  const goPrevPage = () => {
    setCurrentPageId(pid => {
      if (!pid) return pid;
      const idx = pages.findIndex(p => p.pageId === pid);
      if (idx <= 0) return pid;
      return pages[idx - 1].pageId;
    });
  };

  const goNextPage = () => {
    setCurrentPageId(pid => {
      if (!pid) return pid;
      const idx = pages.findIndex(p => p.pageId === pid);
      if (idx === -1 || idx >= pages.length - 1) return pid;
      return pages[idx + 1].pageId;
    });
  };

  const goToPage = (logicalPageIndex: number) => {
    const target = pages.find(p => p.logicalPageIndex === logicalPageIndex);
    if (target) setCurrentPageId(target.pageId);
  };

  const getPageInfo = () => ({
    currentPage:
      pages.find(p => p.pageId === currentPageId)?.logicalPageIndex ?? 1,
    totalPages: getTotalPagesInternal(),
  });

  // ===== ref 노출 (useImperativeHandle) =====

  const _loadPdfFile = (f: File) => {
    setFile(f);
    setOverlays([]);
    setSelected([]);
    clearHistory();
  };

  useImperativeHandle(ref, () => ({
    // 기존 파일 로드
    loadPdfFile: _loadPdfFile,

    // URL 로드 (서버/로컬 분기용)
    loadPdfFromUrl: async (url: string) => {
      const res = await fetch(url);
      const blob = await res.blob();

      const file = new File([blob], 'form.pdf', {
        type: 'application/pdf',
      });

      _loadPdfFile(file);
    },
    restoreFromJson,
    downloadJson,
    downloadJsonAs,
    downloadJsonCreate,
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
    autoDetectCircleSlashByNumber,
    goPrevPage,
    goNextPage,
    goToPage,
    getPageInfo,
    copyCurrentPage,
    copyPageRange,
    deleteCurrentPage,
    getSelectedOverlayIds: () =>
      selected
        .map(uid => overlays.find(o => o.uid === uid)?.id)
        .filter((id): id is string => !!id),
    // getAllCircleSlashTitles: () =>
    //   overlays.filter(o => o.type === 'circleslash').map(o => o.title),
    getAllCircleSlashItems: () =>
      overlays
        .filter(o => o.type === 'circleslash')
        .map(o => ({
          id: o.id,
          title: o.title,
        })),

    getSelectedOverlay: () => {
      if (selected.length !== 1) return null;
      return overlays.find(o => o.uid === selected[0]) ?? null;
    },

    updateOverlayByUid: (uid: string, patch: Partial<OverlayItem>) => {
      setOverlays(prev =>
        prev.map(o =>
          o.uid === uid
            ? {
                ...o,
                ...patch,
              }
            : o
        )
      );
    },

    updateSelectedOverlay: (patch: Partial<OverlayItem>) => {
      if (selected.length !== 1) return;

      const uid = selected[0];

      setOverlays(prev =>
        prev.map(o =>
          o.uid === uid
            ? {
                ...o,
                ...patch,
              }
            : o
        )
      );
    },
    exportToJsonString() {
      const json = buildJson();
      return json ? JSON.stringify(json) : '';
    },
    restoreFromJsonString(json: string) {
      const file = new File([json], 'overlay.json', {
        type: 'application/json',
      });
      restoreFromJson(file);
    },

    exportFullState() {
      return {
        pages: JSON.parse(JSON.stringify(pages)),
        overlays: JSON.parse(JSON.stringify(overlays)),
        currentPageId,
      };
    },

    restoreFullState(state) {
      setPages(state.pages);
      setOverlays(state.overlays);
      setCurrentPageId(state.currentPageId);
    },
  }));

  // ===== 렌더링 (return JSX) =====
  // - 오버레이 placeholder 내용 + 전체 JSX 구조

  // 오버레이 표시용 (에디터: placeholder)
  const renderOverlayContent = (ov: OverlayItem) => {
    const base: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      color: '#333',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.9)',
      whiteSpace: 'pre-line',
      pointerEvents: 'none',
    };

    // checkbox / circleslash 는 특수 처리
    if (ov.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          disabled
          style={{ width: '100%', height: '100%' }}
        />
      );
    }

    if (ov.type === 'circleslash') {
      return (
        <div style={{ ...base, padding: 0 }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
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
              />
            </g>
          </svg>
        </div>
      );
    }

    const meta = OVERLAY_PREVIEW[ov.type] ?? {
      label: OVERLAY_PREVIEW_MAJOR[getMajorType(ov.type)].defaultLabel,
    };

    return (
      <div style={base}>
        {meta.icon && <span style={{ marginRight: 4 }}>{meta.icon}</span>}
        {meta.label}
      </div>
    );
  };

  // 실제 JSX 렌더링
  return (
    <div className="flex items-start justify-start">
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
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              borderRadius: 8,
            }}
          />

          {/* 오버레이 */}
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
                .filter(o => o.pageId === currentPageId)
                .map(ov => {
                  const r = toPx(ov);
                  const isSel = selected.includes(ov.uid);
                  const isSquare = isSquareType(ov.type);
                  const isTextboxType = (t: OverlayType) =>
                    t.startsWith('textbox');
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
                        isTextboxType(ov.type) ? 15 : isSquare ? 1 : 15
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
                        border: isSel ? '2px solid #1e90ff' : '1px dashed #d33',
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
                        // � 우클릭 시 constraint 편집 콜백 호출
                        onContextMenu={e => {
                          e.preventDefault();
                          if (!onOpenConstraintEditor) return;

                          const selectedUids = selected.includes(ov.uid)
                            ? selected
                            : [ov.uid];

                          const overlaysInPage = overlays.filter(
                            o =>
                              o.pageId === currentPageId &&
                              selectedUids.includes(o.uid)
                          );

                          const pg = pages.find(p => p.pageId === ov.pageId);
                          onOpenConstraintEditor({
                            constraintPageNo: pg?.constraintPageNo ?? 1,
                            overlays:
                              overlaysInPage.length > 0 ? overlaysInPage : [ov],
                            rightClickedUid: ov.uid,
                          });
                        }}
                      >
                        {renderOverlayContent(ov)}
                      </div>
                    </Rnd>
                  );
                })}

            {/* 마퀴 영역 */}
            {isOverlayVisible && isMarquee && (
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

          {/* 페이지 표시 */}
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
            {pages.find(p => p.pageId === currentPageId)?.pageLabel ??
              pages.find(p => p.pageId === currentPageId)?.logicalPageIndex}
            / {getTotalPagesInternal() || '?'}
          </div>
        </div>
      ) : docId ? null : (
        <div className="mt-40 text-sm text-slate-400">
          상단의 <b>PDF 불러오기</b> 버튼으로 파일을 선택해 주세요.
        </div>
      )}
    </div>
  );
});

EditorWorkspace.displayName = 'EditorWorkspace';
