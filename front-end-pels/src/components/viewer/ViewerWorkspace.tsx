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
  getStatusFromConstraints,
  findComponentRule,
  highlightOverlayStatus,
  getCheckboxGroupIdsFull,
} from '../../lib/constraints/constraintsLogic';

import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../../constants/pageSize';

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
    if (!lp) return null;

    const no = Number(lp.constraintPageNo);
    return Number.isFinite(no) && no > 0 ? no : null;
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
              cMapUrl: '/pdfjs/cmaps/',
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

    console.log(
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
      button_ox: ['none', 'o', 'x'],
      button_oxn: ['none', 'o', 'x', 'n'],
      button_oxt: ['none', 'o', 'x', 't'],
      button_oxtn: ['none', 'o', 'x', 't', 'n'],
    };

    const order = map[type] ?? ['none'];
    const idx = order.indexOf(current || 'none');
    return order[(idx + 1) % order.length];
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
                  cMapUrl: '/pdfjs/cmaps/',
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
          console.warn(
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

    const render = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          console.warn('[ViewerWorkspace] cancel renderTask failed', e);
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
        const page: PDFPageProxy = await pdfDoc.getPage(realPageNo);
        const viewport = page.getViewport({ scale: 1 });
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
        canvas.width = Math.floor(drawW * dpr);
        canvas.height = Math.floor(drawH * dpr);

        const task = (page as any).render({
          canvasContext: ctx as any,
          viewport,
          transform: [s * dpr, 0, 0, s * dpr, 0, 0],
        }) as any;

        renderTaskRef.current = task as RenderTaskType;
        try {
          await task.promise;
        } catch (e) {
          console.warn('[ViewerWorkspace] render task error (ignored)', e);
        } finally {
          renderTaskRef.current = null;
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
          console.warn('[ViewerWorkspace] cancel on cleanup failed', e);
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

    const srcW = logicalPages?.[currentPage - 1]?.width ?? pageBox.w;
    const srcH = logicalPages?.[currentPage - 1]?.height ?? pageBox.h;

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
      p => p.constraintPageNo === constraintPageNo
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

    updateOverlaysReadonly(prev =>
      prev.map(o => {
        if (o.page !== page) return o;
        if (!groupIds.includes(String(o.id))) return o;

        const idx = groupIds.indexOf(String(o.id));

        return {
          ...o,
          value: idx === selectedIndex ? 'y' : 'n',
        };
      })
    );
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

  const setOverlayValue = (page: number, id: string, value: string) => {
    updateOverlaysReadonly(prev =>
      prev.map(o => (o.page === page && o.id === id ? { ...o, value } : o))
    );
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
      console.warn('[ViewerWorkspace] treelist not found');
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

    console.log('[treelist ids]', Array.from(childrenMapRef.current.keys()));
  }, [constraintDoc]);

  // ---------------------------------------------------------------------------
  // Rule 엔진 연동
  // ---------------------------------------------------------------------------
  const applyConstraintsForOverlay = (uid: string, rawValue: string) => {
    if (!constraintDoc) return;

    const ov = overlays.find(o => o.uid === uid);
    if (!ov) return;

    const constraintPageNo = getConstraintPageNoByOverlay(ov);
    if (!constraintPageNo) return;

    const rule = findComponentRule(constraintDoc, constraintPageNo, ov.id);
    if (!rule || !Array.isArray((rule as any).constraints)) return;

    const status = getStatusFromConstraints(
      (rule as any).constraints,
      rawValue
    );

    highlightOverlayStatus(ov.id, status);

    const events = (rule as any).events;
    if (!Array.isArray(events)) return;

    events.forEach((ev: any) => {
      if (ev.onStatus !== status) return;
      const targetValue = String(ev.targetValue ?? '');

      updateOverlaysReadonly(prev =>
        prev.map(o => {
          if (o.page === ov.page && o.id === ev.targetId) {
            let val = String(ev.targetValue ?? '');
            if (o.type === 'checkbox') {
              if (val === '1') val = 'y';
              if (val === '0') val = 'n';
            }
            return { ...o, value: val };
          }
          return o;
        })
      );

      const targetRule = findComponentRule(
        constraintDoc,
        constraintPageNo,
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

    applyConstraintsForOverlay(uid, value);
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

    applyConstraintsForOverlay(uid, value);
  };

  const cycleCircle = (uid: string) => {
    let nextValue: string = '';

    updateOverlaysReadonly(prev => {
      const updated = prev.map(o => {
        if (o.uid !== uid) return o;

        const order = ['', 'c', 'cs', 'na'];
        const current = o.value || '';
        const idx = order.indexOf(current);
        nextValue = order[(idx + 1) % order.length];

        return { ...o, value: nextValue };
      });

      // na일 때만 전파
      if (!constraintDoc || nextValue !== 'na') return updated;

      const target = prev.find(o => o.uid === uid);
      if (!target) return updated;

      const rootTreelistId = String(target.id);

      const affectedTreelistIds = new Set<string>();
      collectDescendants(rootTreelistId, affectedTreelistIds);
      affectedTreelistIds.add(rootTreelistId);

      const affectedOverlayIds = new Set<string>();
      affectedTreelistIds.forEach(tid => {
        const oids = treelistToOverlayIdsRef.current.get(tid) ?? [];
        oids.forEach(oid => affectedOverlayIds.add(String(oid)));
      });

      return updated.map(o =>
        affectedOverlayIds.has(String(o.id)) ? { ...o, value: 'na' } : o
      );
    });

    applyConstraintsForOverlay(uid, nextValue);
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
    input.accept = 'image/*';
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
  const renderOverlayContent = (ov: OverlayItem) => {
    switch (ov.type) {
      // =========================
      // TEXTBOX 계열
      // =========================
      case 'textbox':
      case 'textbox_ml':
      case 'textbox_name':
      case 'textbox_verifier':
        return (
          <textarea
            value={ov.value ?? ''}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            rows={3}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #aaa',
              padding: 2,
              resize: 'none',
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          />
        );

      case 'textbox_num':
        return (
          <input
            type="number"
            value={ov.value ?? ''}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #aaa',
              padding: 2,
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          />
        );

      case 'textbox_unusing':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#f3f4f6',
              border: '1px dashed #ccc',
            }}
          />
        );

      // =========================
      // CHECKBOX
      // =========================

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
      // =========================
      // CIRCLESLASH
      // =========================
      case 'circleslash': {
        type CircleValue = '' | 'c' | 'cs' | 'na';

        const value = (ov.value ?? '') as CircleValue;

        const displayMap: Record<CircleValue, string> = {
          '': '공란',
          c: '◯',
          cs: '⌀',
          na: 'N/A',
        };

        const display = displayMap[value];

        let size = '160%';
        if (value === 'c' || value === 'cs') size = '200%';
        if (value === '' || value === 'na') size = '130%';

        return (
          <button
            onClick={() => cycleCircle(ov.uid)}
            title="공란 → ◯ → ⌀ → N/A 순환"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              border: '',
              background: 'transparent',
              cursor: 'pointer',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              fontSize: size,
            }}
          >
            {display}
          </button>
        );
      }

      // =========================
      // CALENDAR
      // =========================

      case 'calendar_date':
        return (
          <input
            type="date"
            value={ov.value ?? ''}
            onChange={e => setDate(ov.uid, e.currentTarget.value)}
            style={{ width: '100%', height: '100%' }}
          />
        );

      case 'calendar_datetime':
        return (
          <input
            type="datetime-local"
            value={ov.value ?? ''}
            onChange={e => setDate(ov.uid, e.currentTarget.value)}
            style={{ width: '100%', height: '100%' }}
          />
        );

      // =========================
      // SIGNATURE
      // =========================

      case 'signature_worker':
      case 'signature_verifier':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ccc',
              fontSize: 11,
            }}
            onClick={() => setSignature(ov.uid)}
          >
            {ov.value?.startsWith('data:image/') ? (
              <img
                src={ov.value}
                alt="signature"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : (
              '서명 업로드'
            )}
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
        const display = displayMap[ov.value || 'none'] ?? '';
        return (
          <button
            onClick={() => setText(ov.uid, cycleButtonValue(ov.type, ov.value))}
            style={{
              width: '100%',
              height: '100%',
              fontWeight: 600,
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
          <select
            value={ov.value ?? 'na'}
            onChange={e => setText(ov.uid, e.currentTarget.value)}
            style={{ width: '100%', height: '100%' }}
          >
            <option value="na">선택</option>
            <option value="good">만족</option>
            <option value="bad">불만족</option>
          </select>
        );

      default:
        return <div />;
    }
  };

  // ---------------------------------------------------------------------------
  // 렌더
  // ---------------------------------------------------------------------------
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
          {/* 드로잉 캔버스 (pathData 표시 전용) */}
          <canvas
            ref={drawCanvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: pageBox.w,
              height: pageBox.h,
              pointerEvents: 'none', // ★ 중요: 입력 방해 방지
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
