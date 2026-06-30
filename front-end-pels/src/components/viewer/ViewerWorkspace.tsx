// src/components/viewer/ViewerWorkspace.tsx

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

import type { TemplatePage, OverlayItem } from '../../types';
import type { ConstraintDoc } from '../../types/constraints';

import {
  evaluateConstraintRule,
  evaluateRuleExpression,
  findComponentRules,
  highlightOverlayStatus,
  applyOverlayRuleStyle,
  getCheckboxGroupIdsFull,
  toNumber,
} from '../../lib/constraints/constraintsLogic';

import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../../constants/pageSize';
import { devLog, devWarn } from '../../utils/devConsole';

export interface TemplatePathData {
  points: number[];
  color?: number; // ARGB Int (ex: -65536)
  strokeWidth?: number; // px
}

type PageBox = { w: number; h: number };
type RenderTaskType = { promise: Promise<unknown>; cancel: () => void };

// -----------------------------------------------------------------------------
// Props / Handle
// -----------------------------------------------------------------------------

export interface ViewerWorkspaceProps {
  fileUrl?: string;
  overlays?: Record<number, OverlayItem[]>;
  logicalPages?: TemplatePage[];
  currentPage?: number;
  scale?: number;

  constraints?: ConstraintDoc | null;
  onQrDetected?: (barcode?: string) => void;
  pathDataByPage?: Record<number, TemplatePathData[]>;

  attachmentsByPage?: Record<number, any[]>;

  onPageInfoChange?: (info: {
    currentPage: number;
    totalPages: number;
  }) => void;

  onOverlaysChange?: (page: number, items: OverlayItem[]) => void;

  onDialogInfoChange?: (info: {
    hasDialog: boolean;
    hasQrDialog: boolean;
  }) => void;
}

export interface ViewerWorkspaceHandle {
  loadPdfFile: (file: File) => void;
  loadPdfFromUrl?: (url: string) => void;
  goPrevPage: () => void;
  goNextPage: () => void;
  goToPage: (page: number) => void;
  getPageInfo: () => { currentPage: number; totalPages: number };
  getAllCircleSlashItems: () => { id: string; title: string }[];
  getSelectedRadioIndex: (page: number, baseId: string) => string | null;
  applyRadioToCheckboxGroup: (
    page: number,
    baseId: string,
    selectedValue: string
  ) => void;
  setOverlayValue: (page: number, id: string, value: string) => void;
}

// -----------------------------------------------------------------------------
// 내부 상수/유틸
// -----------------------------------------------------------------------------

const FIXED_W = BASE_PAGE_WIDTH;
const FIXED_H = BASE_PAGE_HEIGHT;

//페이지 이동
const ENABLE_ARROW_PAGE_NAVIGATION = true;

const isSquareType = (t: OverlayItem['type']) =>
  t === 'checkbox' || t === 'circleslash';

function argbIntToRgba(colorInt: number, alphaOverride?: number) {
  const u = colorInt >>> 0; // signed → unsigned
  const a = alphaOverride ?? ((u >> 24) & 0xff) / 255;
  const r = (u >> 16) & 0xff;
  const g = (u >> 8) & 0xff;
  const b = u & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

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

// ============================================================================
// ViewerWorkspace
// ============================================================================

export const ViewerWorkspace = forwardRef<
  ViewerWorkspaceHandle,
  ViewerWorkspaceProps
>((props, ref) => {
  const {
    fileUrl,
    overlays: overlaysByPage,
    logicalPages,
    constraints: constraintDoc,
    pathDataByPage,
    attachmentsByPage,
    onPageInfoChange,
    onOverlaysChange,
    currentPage: externalPage,
  } = props;

  // ---------------------------------------------------------------------------
  // PDF 상태
  // ---------------------------------------------------------------------------
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => externalPage ?? 1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTaskType | null>(null);
  const renderRequestIdRef = useRef(0);

  const [pageBox, setPageBox] = useState<PageBox>({
    w: FIXED_W,
    h: FIXED_H,
  });
  const [pageBoxByPage, setPageBoxByPage] = useState<Record<number, PageBox>>(
    {}
  );

  // 현재 페이지용 overlay state
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const pendingSyncRef = useRef<OverlayItem[] | null>(null);

  // treelist id → overlay id[] 매핑
  const treelistToOverlayIdsRef = useRef<Map<string, string[]>>(new Map());
  const childrenMapRef = useRef<Map<string, string[]>>(new Map());

  const findLogicalPage = (page: number) => {
    return logicalPages?.find(p => Number(p.page) === Number(page)) ?? null;
  };

  const getCurrentConstraintPageNo = (page = currentPage): number | null => {
    const lp = findLogicalPage(page) as any;

    // Overlay JSON / logicalPages가 없는 로컬 테스트 fallback
    // 이 경우 PDF page 번호와 constraintPageNo가 같다고 가정한다.
    if (!lp) {
      const fallbackNo = Number(page);
      return Number.isFinite(fallbackNo) && fallbackNo > 0 ? fallbackNo : null;
    }

    const no = Number(lp.constraintPageNo);
    return Number.isFinite(no) && no > 0 ? no : null;
  };

  const getCurrentRulePage = (page = currentPage) => {
    const constraintPageNo = getCurrentConstraintPageNo(page);
    if (!constraintPageNo || !constraintDoc) return null;

    return (
      constraintDoc.pages?.find(
        p => Number(p.constraintPageNo) === Number(constraintPageNo)
      ) ?? null
    );
  };

  const getConstraintPageNoByOverlay = (ov: OverlayItem): number | null => {
    const lp = findLogicalPage(ov.page) as any;
    if (!lp) return null;

    const no = Number(lp.constraintPageNo);
    return Number.isFinite(no) && no > 0 ? no : null;
  };

  // ---------------------------------------------------------------------------
  // PDF 로드 공통 함수 (ref / prop 공용)
  // ---------------------------------------------------------------------------
  const loadPdfFromArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
    const makeData = () => {
      const copy = arrayBuffer.slice(0);
      return new Uint8Array(copy);
    };

    const tryLoad = async (withCMap: boolean) => {
      const data = makeData();
      const loadingTask = (pdfjsLib as any).getDocument(
        withCMap
          ? {
              data,
              cMapUrl: '/pels/static/e-link-v2/pdfjs/cmaps/',
              cMapPacked: true,
            }
          : { data }
      );
      const doc: PDFDocumentProxy = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setPageBoxByPage({});
    };

    try {
      await tryLoad(true);
    } catch {
      await tryLoad(false);
    }
  };

  const loadPdfFromUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[ViewerWorkspace] loadPdfFromUrl failed:', url);
      return;
    }
    const arrayBuffer = await res.arrayBuffer();
    await loadPdfFromArrayBuffer(arrayBuffer);
  };

  const loadPdfFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    await loadPdfFromArrayBuffer(arrayBuffer);
  };

  /**
   * treelist node id 와 overlay id 를 동일하게 쓰는 전제에서
   * id -> [id] 형태의 lookup map 을 만든다.
   * (향후 treelist id 와 overlay id 가 분리되면 여기 로직을 확장해야 함)
   */
  useEffect(() => {
    treelistToOverlayIdsRef.current.clear();

    if (!constraintDoc || !overlaysByPage) return;

    Object.values(overlaysByPage).forEach(list => {
      list.forEach(o => {
        const treelistId = String(o.id);
        const arr = treelistToOverlayIdsRef.current.get(treelistId) ?? [];
        arr.push(String(o.id));
        treelistToOverlayIdsRef.current.set(treelistId, arr);
      });
    });

    devLog(
      '[map] treelist → overlay',
      Array.from(treelistToOverlayIdsRef.current.entries())
    );
  }, [constraintDoc, overlaysByPage]);

  const collectDescendants = (id: string, set: Set<string>) => {
    const children = childrenMapRef.current.get(id) ?? [];
    children.forEach(cid => {
      if (set.has(cid)) return;
      set.add(cid);
      collectDescendants(cid, set);
    });
  };

  const cycleButtonValue = (type: string, current?: string) => {
    const map: Record<string, string[]> = {
      button_o: ['none', 'o'],
      button_ox: ['none', 'o', 'x'],
      button_oxn: ['none', 'o', 'x', 'n'],
      button_oxt: ['none', 'o', 'x', 't'],
      button_oxtn: ['none', 'o', 'x', 't', 'n'],
    };

    const order = map[type] ?? ['none'];
    const idx = order.indexOf(current || 'none');
    return order[(idx + 1) % order.length];
  };

  const cycleSatisfactionValue = (current?: string) => {
    const value = String(current ?? '').toLowerCase();

    if (value === 'good') return 'bad';
    if (value === 'bad') return '';

    return 'good';
  };

  const getSatisfactionLabel = (value?: string) => {
    const v = String(value ?? '').toLowerCase();

    if (v === 'good') return '만족';
    if (v === 'bad') return '불만족';

    return '만족/불만족';
  };

  // ---------------------------------------------------------------------------
  // worker 설정
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
  }, []);

  // 외부 currentPage 반영
  useEffect(() => {
    if (typeof externalPage === 'number') {
      setCurrentPage(externalPage);
    }
  }, [externalPage]);

  const getTotalPagesInternal = () =>
    Array.isArray(logicalPages) && logicalPages.length > 0
      ? logicalPages.length
      : (pdfDoc?.numPages ?? numPages);

  const getPageSize = (page?: number): PageBox => {
    const p = page ?? currentPage;
    return pageBoxByPage[p] || pageBox;
  };

  // ---------------------------------------------------------------------------
  // PDF 로드 (fileUrl 기준)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!fileUrl) return;

    const loadFromUrl = async () => {
      try {
        const res = await fetch(fileUrl);
        const arrayBuffer = await res.arrayBuffer();

        // pdfjs 가 읽는 동안 detach 되는 문제를 피하기 위해 복사본 사용
        const makeData = () => {
          const copy = arrayBuffer.slice(0);
          return new Uint8Array(copy);
        };

        const tryLoad = async (withCMap: boolean) => {
          const data = makeData();
          const loadingTask = (pdfjsLib as any).getDocument(
            withCMap
              ? {
                  data,
                  cMapUrl: '/pels/static/e-link-v2/pdfjs/cmaps/',
                  cMapPacked: true,
                }
              : { data }
          );
          const doc: PDFDocumentProxy = await loadingTask.promise;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setPageBoxByPage({});
        };

        try {
          await tryLoad(true);
        } catch (e1) {
          devWarn(
            '[ViewerWorkspace] load from url with CMap failed, retry without CMap',
            e1
          );
          try {
            await tryLoad(false);
          } catch (e2) {
            console.error(
              '[ViewerWorkspace] load from url failed completely',
              e2
            );
          }
        }
      } catch (err) {
        console.error('[ViewerWorkspace] fetch fileUrl failed', err);
      }
    };

    void loadFromUrl();
  }, [fileUrl]);

  // ---------------------------------------------------------------------------
  // 현재 페이지 PDF 렌더링 (실제/가상 페이지)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!pdfDoc) return;

    const requestId = ++renderRequestIdRef.current;

    const render = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          devWarn('[ViewerWorkspace] cancel renderTask failed', e);
        }
        renderTaskRef.current = null;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const hasLogical = Array.isArray(logicalPages) && logicalPages.length > 0;

      const lp = hasLogical
        ? logicalPages!.find(p => Number(p.page) === Number(currentPage))
        : undefined;
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
        let page: PDFPageProxy;

        try {
          page = await pdfDoc.getPage(realPageNo);
        } catch (e) {
          devWarn('[ViewerWorkspace] getPage failed', e);
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

        setPageBox({ w: drawW, h: drawH });
        setPageBoxByPage(prev => ({
          ...prev,
          [currentPage]: { w: drawW, h: drawH },
        }));

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
            devWarn('[ViewerWorkspace] render task error', e);
          }
        } finally {
          if (renderTaskRef.current === task) {
            renderTaskRef.current = null;
          }
        }
      } else {
        // 가상 페이지 (논리 페이지만 있고 실제 PDF 페이지 없음)
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

        resetCanvas(canvas, ctx, BW * dpr, BH * dpr);

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
          devWarn('[ViewerWorkspace] cancel on cleanup failed', e);
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, logicalPages]);

  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // 항상 캔버스 크기/스케일을 현재 pageBox 기준으로 맞춘 뒤 clear
    canvas.width = pageBox.w * dpr;
    canvas.height = pageBox.h * dpr;
    canvas.style.width = `${pageBox.w}px`;
    canvas.style.height = `${pageBox.h}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, pageBox.w, pageBox.h);

    const paths = pathDataByPage?.[currentPage];
    if (!Array.isArray(paths) || paths.length === 0) {
      return;
    }

    const lp = findLogicalPage(currentPage) as any;
    const srcW = Number(lp?.width) || pageBox.w;
    const srcH = Number(lp?.height) || pageBox.h;

    const sx = pageBox.w / srcW;
    const sy = pageBox.h / srcH;
    const strokeScale = (sx + sy) / 2;

    // =========================
    // 드로잉(pathData) PDF 반영
    // =========================
    paths.forEach(path => {
      const pts = path.points;
      if (!Array.isArray(pts) || pts.length < 4) return;
      let idx = 0;
      const int16x2ToInt32 = (low: number, high: number) =>
        ((high & 0xffff) << 16) | (low & 0xffff);
      let x = int16x2ToInt32(pts[idx], pts[idx + 1]);
      idx += 2;
      let y = int16x2ToInt32(pts[idx], pts[idx + 1]);
      idx += 2;
      ctx.beginPath();
      ctx.moveTo((x / 100) * sx, (y / 100) * sy);
      while (idx + 1 < pts.length) {
        x += pts[idx];
        y += pts[idx + 1];
        idx += 2;
        ctx.lineTo((x / 100) * sx, (y / 100) * sy);
      }

      const rawWidth =
        (path as any).strokWidth ?? (path as any).strokeWidth ?? 1;

      ctx.strokeStyle = argbIntToRgba(path.color ?? 0xff000000);
      ctx.lineWidth = rawWidth * strokeScale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [pathDataByPage, currentPage, pageBox, logicalPages]);

  // ---------------------------------------------------------------------------
  // 상위로 페이지 정보 전달
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const total = getTotalPagesInternal();
    onPageInfoChange?.({ currentPage, totalPages: total });
  }, [currentPage, numPages, logicalPages, onPageInfoChange]);

  // ---------------------------------------------------------------------------
  // dialog / qr_dialog 존재 여부 계산
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!constraintDoc || !logicalPages) {
      props.onDialogInfoChange?.({
        hasDialog: false,
        hasQrDialog: false,
      });
      return;
    }

    const constraintPageNo = getCurrentConstraintPageNo();

    if (!constraintPageNo) {
      props.onDialogInfoChange?.({
        hasDialog: false,
        hasQrDialog: false,
      });
      return;
    }

    const pageInfo = constraintDoc.pages?.find(
      p => Number(p.constraintPageNo) === Number(constraintPageNo)
    );

    props.onDialogInfoChange?.({
      hasDialog: !!pageInfo?.dialoges?.length,
      hasQrDialog: !!pageInfo?.qr_dialoges?.length,
    });
  }, [currentPage, constraintDoc, logicalPages, props.onDialogInfoChange]);

  const applyRadioToCheckboxGroup = (
    page: number,
    controlId: string,
    radioValue: string
  ) => {
    if (!constraintDoc) return;

    const constraintPageNo = getCurrentConstraintPageNo(page);
    if (!constraintPageNo) return;

    const groupIds = getCheckboxGroupIdsFull(
      constraintDoc,
      constraintPageNo,
      controlId
    );

    const selectedIndex = Number(radioValue);
    const changed: Array<{ uid: string; value: string }> = [];

    updateOverlaysReadonly(prev =>
      prev.map(o => {
        if (o.page !== page) return o;
        if (!groupIds.includes(String(o.id))) return o;

        const idx = groupIds.indexOf(String(o.id));
        const nextValue = idx === selectedIndex ? 'y' : 'n';

        if (String(o.value ?? '') !== nextValue) {
          changed.push({ uid: o.uid, value: nextValue });
        }

        return {
          ...o,
          value: nextValue,
        };
      })
    );

    changed.forEach(item => {
      applyConstraintsCascade(item.uid, item.value);
    });
  };

  const getSelectedRadioIndex = (
    page: number,
    baseId: string
  ): string | null => {
    if (!constraintDoc) return null;

    const constraintPageNo = getCurrentConstraintPageNo(page);
    if (!constraintPageNo) return null;

    const groupIds = getCheckboxGroupIdsFull(
      constraintDoc,
      constraintPageNo,
      baseId
    );

    const pageItems = overlaysByPage?.[page] ?? [];

    for (let i = 0; i < groupIds.length; i++) {
      const id = groupIds[i];
      const item = pageItems.find(o => o.id === id);

      if (item?.value === 'y') {
        return String(i);
      }
    }

    return null;
  };

  const buildConstraintContextFromList = (
    items: OverlayItem[],
    page: number,
    currentId: string,
    rawValue: any
  ) => {
    const pageItems = items.filter(o => o.page === page);
    const context: Record<string, any> = {};

    pageItems.forEach(item => {
      const raw =
        String(item.id) === String(currentId) ? rawValue : (item.value ?? '');

      let v: any = raw;

      if (item.type === 'checkbox') {
        if (String(v).toLowerCase() === 'y') v = 1;
        else if (String(v).toLowerCase() === 'n') v = 0;
      }

      context[String(item.id)] = v;
      context[`_${String(item.id)}_value`] = raw;
    });

    let currentValue: any = rawValue;

    if (typeof rawValue === 'string' && rawValue.trim() !== '') {
      const normalized = rawValue.replaceAll(',', '').trim();
      const num = Number(normalized);

      if (!Number.isNaN(num)) {
        currentValue = num;
      }
    }

    context.value = currentValue;
    context.toNumber = toNumber;
    context.Number = Number;
    context.Math = Math;
    context.String = String;

    return context;
  };

  const setOverlayValue = (page: number, id: string, value: string) => {
    let targetUid: string | null = null;

    updateOverlaysReadonly(prev =>
      prev.map(o => {
        if (o.page === page && o.id === id) {
          targetUid = o.uid;
          return { ...o, value };
        }
        return o;
      })
    );

    if (targetUid) {
      applyConstraintsCascade(targetUid, value);
    }
  };

  // ---------------------------------------------------------------------------
  // 상위에서 내려준 overlaysByPage → 현재 페이지 overlays 로 반영
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!overlaysByPage) return;
    const list = overlaysByPage[currentPage] ?? [];
    setOverlays(list.map(o => ({ ...o })));
  }, [overlaysByPage, currentPage]);

  // ---------------------------------------------------------------------------
  // 내부 state 변경 → 상위 onOverlaysChange 로 sync
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!onOverlaysChange) return;
    const data = pendingSyncRef.current;
    if (!data) return;

    const pageItems = data.filter(o => o.page === currentPage);
    onOverlaysChange(
      currentPage,
      pageItems.map(o => ({ ...o }))
    );
    pendingSyncRef.current = null;
  }, [overlays, currentPage, onOverlaysChange]);

  const updateOverlaysReadonly = (
    updater: (prev: OverlayItem[]) => OverlayItem[]
  ) => {
    setOverlays(prev => {
      const next = updater(prev);
      pendingSyncRef.current = next;
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // treelist → parent / children map (Viewer 초기화)
  // ---------------------------------------------------------------------------
  const parentMapRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    childrenMapRef.current.clear();
    parentMapRef.current.clear();

    if (!constraintDoc?.treelist) {
      devWarn('[ViewerWorkspace] treelist not found');
      return;
    }

    const walk = (node: any) => {
      const pid = String(node.id);

      if (Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          const cid = String(child.id);

          // parentMap
          parentMapRef.current.set(cid, pid);

          // childrenMap
          const arr = childrenMapRef.current.get(pid) ?? [];
          arr.push(cid);
          childrenMapRef.current.set(pid, arr);

          walk(child);
        });
      }
    };

    constraintDoc.treelist.forEach(walk);

    devLog('[treelist ids]', Array.from(childrenMapRef.current.keys()));
  }, [constraintDoc]);

  // ---------------------------------------------------------------------------
  // Rule 엔진 연동
  // ---------------------------------------------------------------------------
  const getTrailingNo = (id: string): number | null => {
    const match = String(id).match(/_(\d+)$/);
    if (!match) return null;

    const n = Number(match[1]);
    return Number.isFinite(n) ? n : null;
  };

  const buildIdByNo = (prefix: string, no: number) => `${prefix}${no}`;

  const findWorkingOverlay = (
    working: OverlayItem[],
    page: number,
    id: string
  ) => {
    return (
      working.find(o => o.page === page && String(o.id) === String(id)) ?? null
    );
  };

  const setWorkingOverlayValue = (
    working: OverlayItem[],
    page: number,
    id: string,
    value: string
  ): OverlayItem | null => {
    const target = findWorkingOverlay(working, page, id);
    if (!target) return null;

    let nextValue = value;

    if (target.type === 'checkbox') {
      if (nextValue === '1') nextValue = 'y';
      if (nextValue === '0') nextValue = 'n';
    }

    if (String(target.value ?? '') !== nextValue) {
      target.value = nextValue;
    }

    if (target.type === 'checkbox' && nextValue === 'y' && constraintDoc) {
      const constraintPageNo = getConstraintPageNoByOverlay(target);

      if (constraintPageNo) {
        const groupIds = getCheckboxGroupIdsFull(
          constraintDoc,
          constraintPageNo,
          target.id
        );

        if (groupIds.length > 1) {
          working.forEach(o => {
            if (o.page !== page) return;
            if (o.type !== 'checkbox') return;
            if (String(o.id) === String(target.id)) return;
            if (!groupIds.includes(String(o.id))) return;

            o.value = 'n';
          });
        }
      }
    }

    return target;
  };

  const applyStylesForStatus = (
    styles: any[] | undefined,
    status: string,
    sourceId: string,
    targetId?: string
  ) => {
    if (!Array.isArray(styles)) return;

    styles.forEach(style => {
      if (style.onStatus !== status) return;

      if (style.targetSelf) {
        requestAnimationFrame(() => {
          applyOverlayRuleStyle(sourceId, style);
        });
        return;
      }

      if (style.targetId) {
        requestAnimationFrame(() => {
          applyOverlayRuleStyle(String(style.targetId), style);
        });
        return;
      }

      if (Array.isArray(style.targetIds)) {
        requestAnimationFrame(() => {
          style.targetIds.forEach((id: string) => {
            applyOverlayRuleStyle(String(id), style);
          });
        });
        return;
      }

      if (targetId) {
        requestAnimationFrame(() => {
          applyOverlayRuleStyle(targetId, style);
        });
      }
    });
  };

  const runAverageModuloGroup = (
    working: OverlayItem[],
    page: number,
    sourceId: string,
    calc: any
  ): { targetId: string; value: string } | null => {
    const no = getTrailingNo(sourceId);
    if (no == null) return null;

    const first = Number(calc.firstInputNo);
    const last = Number(calc.lastInputNo);
    const columnCount = Number(calc.columnCount);
    const rowCount = Number(calc.rowCount);
    const targetStartNo = Number(calc.targetStartNo);
    const decimal = Number(calc.decimal ?? 3);
    const prefix = String(calc.sourcePrefix ?? '');

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(last) ||
      !Number.isFinite(columnCount) ||
      !Number.isFinite(rowCount) ||
      !Number.isFinite(targetStartNo) ||
      no < first ||
      no > last
    ) {
      return null;
    }

    const columnIndex = ((no - first) % columnCount) + 1;
    let sum = 0;

    for (let r = 0; r < rowCount; r++) {
      const sourceNo = first + r * columnCount + (columnIndex - 1);
      const id = buildIdByNo(prefix, sourceNo);
      const item = findWorkingOverlay(working, page, id);
      sum += toNumber(item?.value ?? '');
    }

    const avg = (sum / rowCount).toFixed(decimal);
    const targetNo = targetStartNo + (columnIndex - 1);
    const targetId = buildIdByNo(prefix, targetNo);

    return { targetId, value: avg };
  };

  const runAverageGroup = (
    working: OverlayItem[],
    page: number,
    sourceId: string,
    calc: any
  ): { targetId: string; value: string } | null => {
    const no = getTrailingNo(sourceId);
    if (no == null) return null;

    const first = Number(calc.firstInputNo);
    const last = Number(calc.lastInputNo);
    const groupSize = Number(calc.groupSize);
    const groupStep = Number(calc.groupStep);
    const targetOffset = Number(calc.targetOffsetFromGroupEnd ?? 1);
    const decimal = Number(calc.decimal ?? 3);
    const prefix = String(calc.sourcePrefix ?? '');

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(last) ||
      !Number.isFinite(groupSize) ||
      !Number.isFinite(groupStep) ||
      no < first ||
      no > last
    ) {
      return null;
    }

    const groupIndex = Math.floor((no - first) / groupStep);
    const groupStart = first + groupIndex * groupStep;
    const groupEnd = groupStart + groupSize - 1;

    let sum = 0;
    for (let sourceNo = groupStart; sourceNo <= groupEnd; sourceNo++) {
      const id = buildIdByNo(prefix, sourceNo);
      const item = findWorkingOverlay(working, page, id);
      sum += toNumber(item?.value ?? '');
    }

    const avg = (sum / groupSize).toFixed(decimal);
    const targetId = buildIdByNo(prefix, groupEnd + targetOffset);

    return { targetId, value: avg };
  };

  const runOffsetByModulo = (
    working: OverlayItem[],
    page: number,
    sourceId: string,
    rawValue: string,
    calc: any
  ): { targetId: string; value: string } | null => {
    const no = getTrailingNo(sourceId);
    if (no == null) return null;

    const first = Number(calc.firstInputNo);
    const last = Number(calc.lastInputNo);
    const columnCount = Number(calc.columnCount);
    const targetStartNo = Number(calc.targetStartNo);
    const prefix = String(calc.sourcePrefix ?? '');

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(last) ||
      !Number.isFinite(columnCount) ||
      !Number.isFinite(targetStartNo) ||
      no < first ||
      no > last
    ) {
      return null;
    }

    const columnIndex = ((no - first) % columnCount) + 1;
    const targetNo = targetStartNo + (columnIndex - 1);
    const targetId = buildIdByNo(prefix, targetNo);

    const context = buildConstraintContextFromList(
      working,
      page,
      sourceId,
      rawValue
    );

    const value = evaluateRuleExpression(calc.expression, context);

    return {
      targetId,
      value: value == null ? '' : String(value),
    };
  };

  const runRelativeIndexFormula = (
    working: OverlayItem[],
    page: number,
    sourceId: string,
    calc: any
  ): { targetId: string; value: string } | null => {
    const no = getTrailingNo(sourceId);
    if (no == null) return null;

    const sourcePrefix = String(calc.sourcePrefix ?? '');
    const referencePrefix = String(calc.referencePrefix ?? sourcePrefix);
    const targetOffset = Number(calc.targetOffset ?? 0);

    const variables: Record<string, any> = {};
    Object.entries(calc.variables ?? {}).forEach(([name, config]: any) => {
      const offset = Number(config.offset ?? 0);
      const prefix =
        config.source === 'reference' ? referencePrefix : sourcePrefix;

      const id = buildIdByNo(prefix, no + offset);
      const item = findWorkingOverlay(working, page, id);
      variables[name] = item?.value ?? '';
    });

    const context = {
      ...variables,
      toNumber,
      Number,
      Math,
      String,
    };

    const result = evaluateRuleExpression(calc.expression, context);
    const targetId = buildIdByNo(referencePrefix, no + targetOffset);

    return {
      targetId,
      value: result == null ? '' : String(result),
    };
  };

  const runTimeCalculationMinutes = (
    working: OverlayItem[],
    page: number,
    calc: any
  ): {
    targetId: string;
    value: string;
    resultTargetId?: string;
    resultValue?: string;
  } | null => {
    const ids: string[] = calc.sourceIds ?? [];
    if (ids.length < 4) return null;

    const getVal = (id: string) =>
      findWorkingOverlay(working, page, id)?.value ?? '';

    const h1 = toNumber(getVal(ids[0]));
    const m1 = toNumber(getVal(ids[1]));
    const h2 = toNumber(getVal(ids[2]));
    const m2 = toNumber(getVal(ids[3]));

    let diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;

    const standard = toNumber(calc.standardMinutes ?? calc.standardMinute ?? 0);
    const resultValue = diff >= standard ? '만족' : '불만족';

    return {
      targetId: String(calc.targetMinuteId ?? calc.targetId),
      value: String(diff),
      resultTargetId: calc.targetResultId,
      resultValue,
    };
  };

  const runTimeCalculation = (
    working: OverlayItem[],
    page: number,
    calc: any
  ): Array<{ targetId: string; value: string }> => {
    const ids: string[] = calc.sourceIds ?? [
      calc.hourStartId,
      calc.minuteStartId,
      calc.hourEndId,
      calc.minuteEndId,
    ];

    if (ids.length < 4 || ids.some(id => !id)) return [];

    const getVal = (id: string) =>
      findWorkingOverlay(working, page, id)?.value ?? '';

    const h1 = toNumber(getVal(ids[0]));
    const m1 = toNumber(getVal(ids[1]));
    const h2 = toNumber(getVal(ids[2]));
    const m2 = toNumber(getVal(ids[3]));

    let diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;

    const standard = toNumber(calc.standardMinutes ?? calc.standardMinute ?? 0);
    const resultValue = diff >= standard ? '만족' : '불만족';

    const hour = Math.floor(diff / 60);
    const minute = diff % 60;

    const result: Array<{ targetId: string; value: string }> = [];

    if (calc.targetHourId) {
      result.push({ targetId: String(calc.targetHourId), value: String(hour) });
    }

    if (calc.targetMinuteId) {
      result.push({
        targetId: String(calc.targetMinuteId),
        value: String(minute),
      });
    }

    if (calc.targetId) {
      result.push({ targetId: String(calc.targetId), value: String(diff) });
    }

    if (calc.targetResultId) {
      result.push({
        targetId: String(calc.targetResultId),
        value: resultValue,
      });
    }

    return result;
  };

  const applyConstraintsCascade = (startUid: string, startRawValue: string) => {
    if (!constraintDoc) return;

    setOverlays(prev => {
      const working = prev.map(o => ({ ...o }));
      const queue: Array<{ uid: string; rawValue: string }> = [
        { uid: startUid, rawValue: startRawValue },
      ];
      const visited = new Set<string>();

      const findOverlayByUid = (uid: string) =>
        working.find(o => o.uid === uid) ?? null;

      const enqueueTarget = (target: OverlayItem | null, value: string) => {
        if (!target) return;
        queue.push({ uid: target.uid, rawValue: value });
      };

      while (queue.length > 0) {
        const { uid, rawValue } = queue.shift()!;
        const visitKey = `${uid}::${rawValue}`;

        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        const ov = findOverlayByUid(uid);
        if (!ov) continue;

        const constraintPageNo = getConstraintPageNoByOverlay(ov);
        if (!constraintPageNo) continue;

        const rules = findComponentRules(
          constraintDoc,
          constraintPageNo,
          ov.id
        );
        if (rules.length === 0) continue;

        for (const rule of rules) {
          const context = buildConstraintContextFromList(
            working,
            ov.page,
            ov.id,
            rawValue
          );

          const calculations = (rule as any).calculations;

          if (Array.isArray(calculations)) {
            calculations.forEach((calc: any) => {
              const results: Array<{ targetId: string; value: string }> = [];

              if (calc.emptyWhen) {
                const isEmpty = evaluateRuleExpression(calc.emptyWhen, context);
                if (isEmpty && calc.targetId) {
                  results.push({
                    targetId: String(calc.targetId),
                    value: String(calc.emptyValue ?? ''),
                  });

                  results.forEach(r => {
                    const target = setWorkingOverlayValue(
                      working,
                      ov.page,
                      r.targetId,
                      r.value
                    );

                    if (calc.chain) {
                      enqueueTarget(target, r.value);
                    }
                  });

                  return;
                }
              }

              if (calc.when) {
                const canRun = evaluateRuleExpression(calc.when, context);
                if (!canRun) return;
              }

              if (calc.type === 'averageModuloGroup') {
                const r = runAverageModuloGroup(working, ov.page, ov.id, calc);
                if (r) results.push(r);
              } else if (calc.type === 'averageGroup') {
                const r = runAverageGroup(working, ov.page, ov.id, calc);
                if (r) results.push(r);
              } else if (calc.type === 'offsetByModulo') {
                const r = runOffsetByModulo(
                  working,
                  ov.page,
                  ov.id,
                  rawValue,
                  calc
                );
                if (r) results.push(r);
              } else if (calc.type === 'relativeIndexFormula') {
                const r = runRelativeIndexFormula(
                  working,
                  ov.page,
                  ov.id,
                  calc
                );
                if (r) results.push(r);
              } else if (calc.type === 'timeCalculationMinutes') {
                const r = runTimeCalculationMinutes(working, ov.page, calc);
                if (r) {
                  results.push({ targetId: r.targetId, value: r.value });
                  if (r.resultTargetId) {
                    results.push({
                      targetId: String(r.resultTargetId),
                      value: String(r.resultValue ?? ''),
                    });
                  }
                }
              } else if (calc.type === 'timeCalculation') {
                results.push(...runTimeCalculation(working, ov.page, calc));
              } else if (calc.targetId && calc.expression) {
                const value = evaluateRuleExpression(calc.expression, context);
                results.push({
                  targetId: String(calc.targetId),
                  value: value == null ? '' : String(value),
                });
              }

              results.forEach(r => {
                const target = setWorkingOverlayValue(
                  working,
                  ov.page,
                  r.targetId,
                  r.value
                );

                if (calc.chain) {
                  enqueueTarget(target, r.value);
                }
              });
            });
          }

          let status = 'none';
          let result: any = undefined;

          if (Array.isArray((rule as any).constraints)) {
            const evaluated = evaluateConstraintRule(
              (rule as any).constraints,
              context,
              String(ov.id)
            );

            status = evaluated.status;
            result = evaluated.result;

            requestAnimationFrame(() => {
              highlightOverlayStatus(ov.id, status);
            });

            applyStylesForStatus((rule as any).styles, status, String(ov.id));
          }

          const events = (rule as any).events;

          if (Array.isArray(events)) {
            events.forEach((ev: any) => {
              let shouldRun = false;
              let nextRawValue = '';

              if (ev.condition) {
                if (ev.when) {
                  const canRun = evaluateRuleExpression(ev.when, context);
                  if (!canRun) return;
                }

                const ok = evaluateRuleExpression(ev.condition, context);
                shouldRun = true;
                nextRawValue = ok
                  ? String(ev.targetValue ?? '')
                  : String(ev.elseValue ?? '');
              } else {
                if (ev.onStatus !== status) return;
                shouldRun = true;
                nextRawValue =
                  String(ev.targetValue ?? '') === 'result'
                    ? String(result ?? '')
                    : String(ev.targetValue ?? '');
              }

              if (!shouldRun) return;

              let targetId = ev.targetId;

              if (ev.targetByModulo && ev.targetPrefix && ev.targetStartNo) {
                const no = getTrailingNo(String(ov.id));
                if (no == null) return;

                const sourceFirstNo = Number(ev.sourceFirstNo);
                const targetStartNo = Number(ev.targetStartNo);
                const columnCount = Number(ev.columnCount ?? 8);

                if (!Number.isFinite(sourceFirstNo)) return;

                const columnIndex =
                  (((no - sourceFirstNo) % columnCount) + columnCount) %
                  columnCount;

                targetId = `${ev.targetPrefix}${targetStartNo + columnIndex}`;
              }

              if (!targetId) return;

              const target = setWorkingOverlayValue(
                working,
                ov.page,
                String(targetId),
                nextRawValue
              );

              if (target) {
                queue.push({ uid: target.uid, rawValue: nextRawValue });
              }
            });
          }
        }
      }

      pendingSyncRef.current = working;
      return working;
    });
  };

  // ---------------------------------------------------------------------------
  // 값 입력용 핸들러들
  // ---------------------------------------------------------------------------
  /*const setCheckbox = (uid: string, checked: boolean) => {
    const value = checked ? 'y' : 'n';

    updateOverlaysReadonly(prev => {
      let next = prev.map(o => (o.uid === uid ? { ...o, value } : o));
      const target = prev.find(o => o.uid === uid);

      // checkbox group (단일 선택)
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

    applyConstraintsCascade(uid, value);
  };*/

  const setCheckbox = (uid: string, checked: boolean) => {
    const value = checked ? 'y' : 'n';

    updateOverlaysReadonly(prev => {
      let next = prev.map(o => (o.uid === uid ? { ...o, value } : o));
      const target = prev.find(o => o.uid === uid);

      if (!target || target.type !== 'checkbox' || !constraintDoc) return next;

      if (value === 'y') {
        const constraintPageNo = getConstraintPageNoByOverlay(target);
        if (!constraintPageNo) return next;

        const groupIds = getCheckboxGroupIdsFull(
          constraintDoc,
          constraintPageNo,
          target.id
        );

        if (groupIds.length > 1) {
          next = next.map(o => {
            if (
              o.page === target.page &&
              o.type === 'checkbox' &&
              groupIds.includes(String(o.id)) &&
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

    applyConstraintsCascade(uid, value);
  };

  const cycleCircle = (uid: string) => {
    let nextValue: string = '';
    let affectedOverlayIds = new Set<string>();

    updateOverlaysReadonly(prev => {
      const target = prev.find(o => o.uid === uid);

      const updated = prev.map(o => {
        if (o.uid !== uid) return o;

        const order = ['', 'c', 'cs', 'na'];
        const current = o.value || '';
        const idx = order.indexOf(current);
        nextValue = order[(idx + 1) % order.length];

        return { ...o, value: nextValue };
      });

      // na일 때만 전파
      if (!constraintDoc || nextValue !== 'na' || !target) return updated;

      const rootTreelistId = String(target.id);

      const affectedTreelistIds = new Set<string>();
      collectDescendants(rootTreelistId, affectedTreelistIds);
      affectedTreelistIds.add(rootTreelistId);

      affectedTreelistIds.forEach(tid => {
        const oids = treelistToOverlayIdsRef.current.get(tid) ?? [];
        oids.forEach(oid => affectedOverlayIds.add(String(oid)));
      });

      // 현재 페이지 즉시 반영
      return updated.map(o =>
        affectedOverlayIds.has(String(o.id)) ? { ...o, value: 'na' } : o
      );
    });

    // 다른 페이지까지 부모 state에 반영
    if (
      constraintDoc &&
      nextValue === 'na' &&
      affectedOverlayIds.size > 0 &&
      overlaysByPage &&
      onOverlaysChange
    ) {
      Object.entries(overlaysByPage).forEach(([pageKey, items]) => {
        const pageNo = Number(pageKey);

        const nextItems = items.map(o =>
          affectedOverlayIds.has(String(o.id)) ? { ...o, value: 'na' } : o
        );

        onOverlaysChange(pageNo, nextItems);
      });
    }

    applyConstraintsCascade(uid, nextValue);
  };

  const normalizeDecimalInput = (value: string) => {
    let next = value.replace(/[^\d.-]/g, '');

    const minus = next.startsWith('-') ? '-' : '';
    next = next.replace(/-/g, '');

    const hasDot = next.includes('.');
    const parts = next.split('.');
    const rawInt = parts[0] ?? '';
    const decimal = parts.slice(1).join('');

    if (rawInt === '') {
      return `${minus}${hasDot ? `.${decimal}` : ''}`;
    }

    const formattedInt = Number(rawInt).toLocaleString('en-US');

    return `${minus}${formattedInt}${hasDot ? `.${decimal}` : ''}`;
  };

  const getDatePartsFromValue = (value?: string) => {
    const raw = String(value ?? '').trim();
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 6) {
      return {
        year: `20${digits.slice(0, 2)}`,
        month: digits.slice(2, 4),
        day: digits.slice(4, 6),
      };
    }

    if (digits.length < 8) return null;

    return {
      year: digits.slice(0, 4),
      month: digits.slice(4, 6),
      day: digits.slice(6, 8),
    };
  };

  const formatViewerDate = (value?: string) => {
    const parts = getDatePartsFromValue(value);
    if (!parts) return String(value ?? '');

    return `${parts.year}.${Number(parts.month)}.${Number(parts.day)}`;
  };

  const formatViewerDateYear2 = (value?: string) => {
    const parts = getDatePartsFromValue(value);
    if (!parts) return String(value ?? '');

    return `${parts.year.slice(-2)}.${Number(parts.month)}.${Number(parts.day)}`;
  };

  const formatViewerMonthDay = (value?: string) => {
    const raw = String(value ?? '').trim();

    if (!raw) return '';

    // input type="date" 값: yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return `${Number(raw.slice(5, 7))}/${Number(raw.slice(8, 10))}`;
    }

    const digits = raw.replace(/\D/g, '');

    // yyyyMMdd
    if (digits.length === 8) {
      return `${Number(digits.slice(4, 6))}/${Number(digits.slice(6, 8))}`;
    }

    // MMdd
    if (digits.length === 4) {
      return `${Number(digits.slice(0, 2))}/${Number(digits.slice(2, 4))}`;
    }

    return raw;
  };

  const formatViewerTime = (value?: string) => {
    const raw = String(value ?? '').trim();

    if (!raw) return '';

    const meridiem = raw.includes('오후')
      ? 'pm'
      : raw.includes('오전')
        ? 'am'
        : '';

    const match = raw.match(/(\d{1,2}):(\d{2})/);

    if (match) {
      let hour = Number(match[1]);
      const minute = match[2];

      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;

      return `${hour}:${minute}`;
    }

    const digits = raw.replace(/\D/g, '').slice(0, 4);

    if (digits.length !== 4) return raw;

    return `${Number(digits.slice(0, 2))}:${digits.slice(2, 4)}`;
  };

  const formatViewerDateTime = (value?: string) => {
    const raw = String(value ?? '').trim();

    if (!raw) return '';

    const date = formatViewerDate(raw);
    const time = formatViewerTime(raw);

    return [date, time].filter(Boolean).join(' ');
  };

  const setText = (uid: string, value: string) => {
    updateOverlaysReadonly(prev =>
      prev.map(o => (o.uid === uid ? { ...o, value } : o))
    );
    applyConstraintsCascade(uid, value);
  };

  const normalizeCalendarValue = (
    option: string | undefined,
    value: string
  ) => {
    const raw = String(value ?? '').trim();

    if (!raw) return '';

    if (option === 'yy-MM-dd') {
      return raw.length >= 10 ? raw.slice(2, 10) : raw;
    }

    if (option === 'MM-dd') {
      return raw.length >= 10 ? raw.slice(5, 10) : raw;
    }

    if (option === 'yyyy-MM-dd HH:mm') {
      return raw.replace('T', ' ');
    }

    return raw;
  };

  const toCalendarInputValue = (option: string | undefined, value?: string) => {
    const raw = String(value ?? '').trim();

    if (!raw) return '';

    if (option === 'yy-MM-dd') {
      return /^\d{2}-\d{2}-\d{2}$/.test(raw) ? `20${raw}` : raw;
    }

    if (option === 'MM-dd') {
      return /^\d{2}-\d{2}$/.test(raw) ? `2026-${raw}` : raw;
    }

    if (option === 'yyyy-MM-dd HH:mm') {
      return raw.replace(' ', 'T');
    }

    return raw;
  };

  const setDate = (uid: string, value: string, option?: string) => {
    const nextValue = normalizeCalendarValue(option, value);

    updateOverlaysReadonly(prev =>
      prev.map(o => (o.uid === uid ? { ...o, value: nextValue } : o))
    );
    applyConstraintsCascade(uid, nextValue);
  };

  const setSignature = (uid: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const f = (e.currentTarget as HTMLInputElement).files?.[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = () => {
        const nextValue = String(reader.result || '');

        updateOverlaysReadonly(prev =>
          prev.map(o => (o.uid === uid ? { ...o, value: nextValue } : o))
        );

        applyConstraintsCascade(uid, nextValue);
      };
      reader.readAsDataURL(f);
    };
    input.click();
  };

  // ---------------------------------------------------------------------------
  // Overlay → px (원본 유지)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // ref 노출
  // ---------------------------------------------------------------------------
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

      if (e.key === 'PageUp') {
        goPrevPage();
        e.preventDefault();
        return;
      }

      if (e.key === 'PageDown') {
        goNextPage();
        e.preventDefault();
        return;
      }

      if (e.key === 'Home') {
        goToPage(1);
        e.preventDefault();
        return;
      }

      if (e.key === 'End') {
        goToPage(getTotalPagesInternal());
        e.preventDefault();
        return;
      }

      // 좌우 방향키 페이지 이동
      // 필요 없으면 ENABLE_ARROW_PAGE_NAVIGATION 값을 false로 변경
      if (ENABLE_ARROW_PAGE_NAVIGATION) {
        if (e.key === 'ArrowLeft') {
          goPrevPage();
          e.preventDefault();
          return;
        }

        if (e.key === 'ArrowRight') {
          goNextPage();
          e.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [currentPage, logicalPages, pdfDoc, numPages]);

  useImperativeHandle(ref, () => ({
    goPrevPage,
    goNextPage,
    goToPage,
    getPageInfo,

    loadPdfFromUrl,
    loadPdfFile,
    getSelectedRadioIndex,
    applyRadioToCheckboxGroup,
    setOverlayValue,
    getAllCircleSlashItems: () =>
      overlays
        .filter(o => o.type === 'circleslash')
        .map(o => ({
          id: o.id,
          title: o.title ?? '',
        })),
  }));

  // ---------------------------------------------------------------------------
  // 뷰어용 오버레이 렌더링
  // ---------------------------------------------------------------------------
  const viewerOpaqueInputLeftStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    background: '#fff',
    color: '#111',
    padding: '0 4px',
    margin: 0,
    fontSize: 12,
    boxSizing: 'border-box',
    outline: 'none',
    textAlign: 'left',
  };

  const viewerOpaqueInputCenterStyle: React.CSSProperties = {
    ...viewerOpaqueInputLeftStyle,
    textAlign: 'center',
  };

  const viewerOpaqueButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    background: '#fff',
    color: '#111',
    padding: 0,
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  const viewerTransparentButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#111',
    padding: 0,
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  const renderFormattedPicker = ({
    value,
    type,
    displayValue,
    icon,
    onChange,
  }: {
    value?: string;
    type: 'date' | 'datetime-local' | 'time';
    displayValue: string;
    icon: string;
    onChange: (value: string) => void;
  }) => {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            ...viewerOpaqueInputCenterStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: 28,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {displayValue}
        </div>

        <span
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13,
            lineHeight: 1,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {icon}
        </span>

        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.currentTarget.value)}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 32,
            height: '100%',
            opacity: 0,
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            zIndex: 3,
          }}
        />
      </div>
    );
  };

  const renderOverlayContent = (ov: OverlayItem) => {
    switch (ov.type) {
      // =========================
      // TEXTBOX 계열
      // =========================
      case 'textbox':
        return (
          <input
            type="text"
            value={ov.value ?? ''}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            style={viewerOpaqueInputLeftStyle}
          />
        );

      case 'textbox_name':
      case 'textbox_verifier':
        return (
          <input
            type="text"
            value={ov.value ?? ''}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            style={viewerOpaqueInputCenterStyle}
          />
        );

      case 'textbox_multiline':
        return (
          <textarea
            value={ov.value ?? ''}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            rows={3}
            style={{
              ...viewerOpaqueInputLeftStyle,
              resize: 'none',
            }}
          />
        );

      case 'textbox_num':
        return (
          <input
            type="text"
            inputMode="decimal"
            value={ov.value ?? ''}
            onChange={e =>
              setText(ov.uid, normalizeDecimalInput(e.currentTarget.value))
            }
            style={viewerOpaqueInputCenterStyle}
          />
        );

      case 'textbox_unusing':
        return (
          <div
            title="미사용 영역"
            style={{
              ...viewerTransparentButtonStyle,
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(148, 163, 184, 0.45)',
              cursor: 'default',
            }}
          />
        );

      // =========================
      // CHECKBOX
      // =========================

      case 'checkbox': {
        const checked = (ov.value || '').toLowerCase() === 'y';

        return (
          <button
            type="button"
            onClick={() => setCheckbox(ov.uid, !checked)}
            title="체크 전환"
            style={{
              ...viewerTransparentButtonStyle,
              padding: 0,
            }}
          >
            {checked ? (
              <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                style={{
                  display: 'block',
                  overflow: 'visible',
                }}
              >
                <path
                  d="M 26 44 L 46 66 L 78 30"
                  fill="none"
                  stroke="#000"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>
        );
      }
      // =========================
      // CIRCLESLASH
      // =========================
      case 'circleslash': {
        type CircleValue = '' | 'c' | 'cs' | 'na';

        const value = (ov.value ?? '') as CircleValue;

        const displayMap: Record<CircleValue, string> = {
          '': '',
          c: '◯',
          cs: '⌀',
          na: 'N/A',
        };

        const display = displayMap[value];

        let size = '160%';
        if (value === 'c' || value === 'cs') size = '200%';
        if (value === '') size = '130%';
        if (value === 'na') size = '95%';

        return (
          <button
            type="button"
            onClick={() => cycleCircle(ov.uid)}
            title="공란 → ◯ → ⌀ → N/A 순환"
            style={{
              ...viewerTransparentButtonStyle,
              fontSize: size,
              whiteSpace: 'nowrap',
            }}
          >
            {display}
          </button>
        );
      }

      // =========================
      // CALENDAR
      // =========================

      case 'calendar': {
        const option = String((ov as any).option || 'yyyy-MM-dd');

        if (option === 'yy-MM-dd') {
          return renderFormattedPicker({
            value: toCalendarInputValue(option, ov.value),
            type: 'date',
            displayValue: formatViewerDateYear2(ov.value),
            icon: '📅',
            onChange: value => setDate(ov.uid, value, option),
          });
        }

        if (option === 'MM-dd') {
          return renderFormattedPicker({
            value: toCalendarInputValue(option, ov.value),
            type: 'date',
            displayValue: formatViewerMonthDay(ov.value),
            icon: '📅',
            onChange: value => setDate(ov.uid, value, option),
          });
        }

        if (option === 'yyyy-MM-dd HH:mm') {
          return renderFormattedPicker({
            value: toCalendarInputValue(option, ov.value),
            type: 'datetime-local',
            displayValue: formatViewerDateTime(ov.value),
            icon: '📅🕐',
            onChange: value => setDate(ov.uid, value, option),
          });
        }

        if (option === 'HH:mm') {
          return renderFormattedPicker({
            value: ov.value,
            type: 'time',
            displayValue: formatViewerTime(ov.value),
            icon: '🕐',
            onChange: value => setDate(ov.uid, value, option),
          });
        }

        return renderFormattedPicker({
          value: ov.value,
          type: 'date',
          displayValue: formatViewerDate(ov.value),
          icon: '📅',
          onChange: value => setDate(ov.uid, value, option),
        });
      }

      // =========================
      // SIGNATURE
      // =========================
      case 'signature_worker':
      case 'signature_verifier':
        return (
          <div
            style={{
              ...viewerTransparentButtonStyle,
              fontSize: 11,
              fontWeight: 400,
            }}
            onClick={() => setSignature(ov.uid)}
            title="서명 업로드"
          >
            {ov.value?.startsWith('data:image/') ? (
              <img
                src={ov.value}
                alt="signature"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : null}
          </div>
        );

      // =========================
      // BUTTON OX 계열
      // =========================

      case 'button_ox':
      case 'button_oxn':
      case 'button_oxt':
      case 'button_oxtn': {
        const displayMap: Record<string, string> = {
          none: '',
          o: 'O',
          x: 'X',
          n: 'N',
          t: 'T',
        };

        const value = ov.value || 'none';
        const display = displayMap[value] ?? '';

        return (
          <button
            type="button"
            onClick={() => setText(ov.uid, cycleButtonValue(ov.type, ov.value))}
            title="클릭하여 값 변경"
            style={{
              ...viewerOpaqueButtonStyle,
              fontSize: '130%',
            }}
          >
            {display}
          </button>
        );
      }

      case 'button_o': {
        const value = ov.value || 'none';
        const display = value === 'o' ? 'O' : '';
        const size = '130%';

        return (
          <button
            type="button"
            onClick={() => setText(ov.uid, cycleButtonValue(ov.type, ov.value))}
            title="공란 → O 순환"
            style={{
              ...viewerTransparentButtonStyle,
              fontSize: size,
              whiteSpace: 'nowrap',
            }}
          >
            {display}
          </button>
        );
      }

      // =========================
      // SATISFACTION
      // =========================

      case 'satisfactionbox':
        return (
          <button
            type="button"
            onClick={() => setText(ov.uid, cycleSatisfactionValue(ov.value))}
            title="만족/불만족 → 만족 → 불만족 순환"
            style={{
              ...viewerOpaqueButtonStyle,
              fontSize: 12,
            }}
          >
            {getSatisfactionLabel(ov.value)}
          </button>
        );

      default:
        return <div />;
    }
  };

  const renderMoveToPageAreas = () => {
    const rulePage = getCurrentRulePage();
    const list = Array.isArray((rulePage as any)?.movetopage)
      ? (rulePage as any).movetopage
      : [];

    if (list.length === 0) return null;

    const lp = findLogicalPage(currentPage) as any;
    const srcW = Number(lp?.width) || pageBox.w;
    const srcH = Number(lp?.height) || pageBox.h;

    return list.map((item: any, index: number) => {
      const x = (Number(item.x ?? 0) / srcW) * pageBox.w;
      const y = (Number(item.y ?? 0) / srcH) * pageBox.h;
      const w = (Number(item.width ?? 0) / srcW) * pageBox.w;
      const h = (Number(item.height ?? 0) / srcH) * pageBox.h;
      const target = Number(item.targetPdfPage ?? 0);

      if (!Number.isFinite(target) || target <= 0) {
        return null;
      }

      return (
        <button
          key={`movetopage-${currentPage}-${index}`}
          type="button"
          title={`페이지 이동: ${target}`}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            goToPage(target);
          }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: w,
            height: h,
            border: '1px solid rgba(59, 130, 246, 0.65)',
            background: 'rgba(59, 130, 246, 0.12)',
            color: '#1d4ed8',
            padding: 0,
            margin: 0,
            boxSizing: 'border-box',
            borderRadius: 4,
            cursor: 'pointer',
            zIndex: 21,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              position: 'absolute',
              right: 3,
              top: 2,
              maxWidth: 'calc(100% - 6px)',
              padding: '1px 4px',
              borderRadius: 3,
              background: 'rgba(30, 64, 175, 0.88)',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
            }}
          >
            이동: {target}
          </span>
        </button>
      );
    });
  };

  const renderFormDrawingAreas = () => {
    const rulePage = getCurrentRulePage();
    const list = Array.isArray((rulePage as any)?.formdrawing)
      ? (rulePage as any).formdrawing
      : [];

    if (list.length === 0) return null;

    const lp = findLogicalPage(currentPage) as any;
    const srcW = Number(lp?.width) || pageBox.w;
    const srcH = Number(lp?.height) || pageBox.h;

    return list.map((item: any, index: number) => {
      const x = (Number(item.x ?? 0) / srcW) * pageBox.w;
      const y = (Number(item.y ?? 0) / srcH) * pageBox.h;
      const w = (Number(item.width ?? 0) / srcW) * pageBox.w;
      const h = (Number(item.height ?? 0) / srcH) * pageBox.h;
      const value = String(item.value ?? '');

      return (
        <div
          key={`formdrawing-${currentPage}-${index}`}
          title={`도면: ${value}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: w,
            height: h,
            border: '1px solid rgba(16, 185, 129, 0.55)',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: 0,
            margin: 0,
            boxSizing: 'border-box',
            borderRadius: 4,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <span
            style={{
              position: 'absolute',
              right: 3,
              top: 2,
              maxWidth: 'calc(100% - 6px)',
              padding: '1px 4px',
              borderRadius: 3,
              background: 'rgba(4, 120, 87, 0.88)',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
            }}
          >
            도면: {value || '-'}
          </span>
        </div>
      );
    });
  };

  // ---------------------------------------------------------------------------
  // 렌더
  // ---------------------------------------------------------------------------
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
          {/* PDF 캔버스 */}
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
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: pageBox.w,
              height: pageBox.h,
            }}
          >
            {renderMoveToPageAreas()}
            {renderFormDrawingAreas()}

            {overlays
              .filter(o => o.page === currentPage)
              .map(ov => {
                const r = toPx(ov);
                return (
                  <div
                    key={ov.uid}
                    id={`overlay-${ov.id}`}
                    style={{
                      position: 'absolute',
                      left: r.x,
                      top: r.y,
                      width: r.w,
                      height: r.h,
                      pointerEvents: 'auto',
                    }}
                  >
                    {renderOverlayContent(ov)}
                  </div>
                );
              })}

            {/* attachments (논리페이지 기준) */}
            {logicalPages &&
              logicalPages.length > 0 &&
              (() => {
                const lp = logicalPages.find(
                  p => Number(p.page) === Number(currentPage)
                ) as any;

                if (!lp) return null;

                const pageW = lp.width || pageBox.w;
                const pageH = lp.height || pageBox.h;
                const sx = pageBox.w / pageW;
                const sy = pageBox.h / pageH;
                const attachments =
                  attachmentsByPage?.[currentPage] ?? lp.attachments ?? [];

                if (!Array.isArray(attachments) || attachments.length === 0)
                  return null;

                return (
                  <>
                    {attachments.map((a: any, idx: number) => {
                      const left = Math.round((a.x || 0) * sx);
                      const top = Math.round((a.y || 0) * sy);
                      const width = Math.round((a.width || 0) * sx);
                      const height = Math.round((a.height || 0) * sy);

                      const imageSrc = a.fileUrl || a.url || a.src || null;

                      if (a.type === 'image' || a.type === 'camera') {
                        if (imageSrc) {
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
                                src={imageSrc}
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

                        return (
                          <div
                            key={`att-img-placeholder-${idx}`}
                            style={{
                              position: 'absolute',
                              left,
                              top,
                              width,
                              height,
                              border: '2px dashed rgba(59,130,246,0.75)',
                              background: 'rgba(59,130,246,0.10)',
                              borderRadius: 8,
                              boxSizing: 'border-box',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1d4ed8',
                              fontSize: Math.max(
                                12,
                                Math.min(width, height) * 0.12
                              ),
                              fontWeight: 700,
                              textAlign: 'center',
                              padding: 8,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            IMAGE BOX
                          </div>
                        );
                      }
                      if (a.type === 'video') {
                        const videoSrc = a.fileUrl || a.url || a.src || null;
                        if (!videoSrc) return null;

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
                              src={videoSrc}
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
                      if (a.type === 'auditorbox') {
                        let parsed: any = null;

                        try {
                          parsed = a.text ? JSON.parse(a.text) : null;
                        } catch (e) {
                          parsed = null;
                        }

                        const wphp = String(parsed?.wphp ?? '').toLowerCase();
                        const date = parsed?.date ?? '';
                        const name = parsed?.name ?? '';
                        const satisfactionRaw = String(
                          parsed?.satisfaction ?? ''
                        ).toLowerCase();

                        const satisfactionText =
                          satisfactionRaw === 'y'
                            ? '만족'
                            : satisfactionRaw === 'n'
                              ? '불만족'
                              : '';

                        const baseFontSize = Math.max(
                          6,
                          Math.round(height * 0.15)
                        );

                        const labelCellStyle: React.CSSProperties = {
                          borderRight: '1px solid #d32f2f',
                          color: '#d32f2f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1,
                          minWidth: 0,
                          padding: '0 3px',
                          boxSizing: 'border-box',
                        };

                        const valueCellStyle: React.CSSProperties = {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1,
                          minWidth: 0,
                          padding: '0 3px',
                          boxSizing: 'border-box',
                          color: '#111',
                        };

                        return (
                          <div
                            key={`att-auditor-${idx}`}
                            style={{
                              position: 'absolute',
                              left,
                              top,
                              width,
                              height,
                              boxSizing: 'border-box',
                              background: 'transparent',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'grid',
                                gridTemplateRows: '1fr 1fr 1fr',
                                border: '1px solid #d32f2f',
                                color: '#111',
                                background: 'transparent',
                                fontSize: baseFontSize,
                                lineHeight: 1,
                                boxSizing: 'border-box',
                              }}
                            >
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.3fr 1fr 1.7fr',
                                  borderBottom: '1px solid #d32f2f',
                                }}
                              >
                                <div
                                  style={{
                                    ...valueCellStyle,
                                    borderRight: '1px solid #d32f2f',
                                    gap: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      color:
                                        wphp === 'wp' ? '#d32f2f' : '#bdbdbd',
                                    }}
                                  >
                                    WP
                                  </span>
                                  <span
                                    style={{ color: '#888', margin: '0 1px' }}
                                  >
                                    /
                                  </span>
                                  <span
                                    style={{
                                      color:
                                        wphp === 'hp' ? '#d32f2f' : '#bdbdbd',
                                    }}
                                  >
                                    HP
                                  </span>
                                </div>

                                <div style={labelCellStyle}>입회일</div>

                                <div style={valueCellStyle}>{date}</div>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.3fr 2.7fr',
                                  borderBottom: '1px solid #d32f2f',
                                  minWidth: 0,
                                }}
                              >
                                <div style={labelCellStyle}>입회자</div>
                                <div style={valueCellStyle}>{name}</div>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.3fr 2.7fr',
                                  minWidth: 0,
                                }}
                              >
                                <div style={labelCellStyle}>입회결과</div>
                                <div style={valueCellStyle}>
                                  {satisfactionText}
                                </div>
                              </div>
                            </div>
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
          </div>

          {/* 드로잉 캔버스 (pathData 표시 전용) */}
          <canvas
            ref={drawCanvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: pageBox.w,
              height: pageBox.h,
              pointerEvents: 'none',
            }}
          />

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
            {currentPage} / {getTotalPagesInternal() || '?'}
          </div>
        </div>
      ) : (
        <div className="mt-40 text-sm text-slate-400">
          상단에서 <b>PDF 파일</b>과 <b>JSON 템플릿</b>을 불러와 주세요.
        </div>
      )}
    </div>
  );
});

ViewerWorkspace.displayName = 'ViewerWorkspace';
