// src/components/viewer/ReplayViewerWorkspace.tsx
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

import type { TemplatePage } from '../../types';
import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../../constants/pageSize';

export interface TemplatePathData {
  points: number[];
  color?: number;
  strokeWidth?: number;
  strokWidth?: number;
  id?: number | string;
}

type PageBox = { w: number; h: number };
type RenderTaskType = { promise: Promise<unknown>; cancel: () => void };

// -----------------------------------------------------------------------------
// Props / Handle
// -----------------------------------------------------------------------------

export interface ReplayViewerWorkspaceProps {
  fileUrl?: string;
  logicalPages?: TemplatePage[];
  currentPage?: number;
  scale?: number;
  pathDataByPage?: Record<number, TemplatePathData[]>;
  attachmentsByPage?: Record<number, any[]>;
  onPageInfoChange?: (info: {
    currentPage: number;
    totalPages: number;
  }) => void;
}

export interface ReplayViewerWorkspaceHandle {
  loadPdfFile: (file: File) => void;
  loadPdfFromUrl?: (url: string) => void;
  goPrevPage: () => void;
  goNextPage: () => void;
  goToPage: (page: number) => void;
  getPageInfo: () => { currentPage: number; totalPages: number };
}

// -----------------------------------------------------------------------------
// 내부 상수/유틸
// -----------------------------------------------------------------------------

const FIXED_W = BASE_PAGE_WIDTH;
const FIXED_H = BASE_PAGE_HEIGHT;

function argbIntToRgba(colorInt: number, alphaOverride?: number) {
  const u = colorInt >>> 0;
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
// ReplayViewerWorkspace
// ============================================================================

export const ReplayViewerWorkspace = forwardRef<
  ReplayViewerWorkspaceHandle,
  ReplayViewerWorkspaceProps
>((props, ref) => {
  const {
    fileUrl,
    logicalPages,
    pathDataByPage,
    attachmentsByPage,
    onPageInfoChange,
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

  const findLogicalPage = (page: number) => {
    return logicalPages?.find(p => Number(p.page) === Number(page)) ?? null;
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
      console.error('[ReplayViewerWorkspace] loadPdfFromUrl failed:', url);
      return;
    }
    const arrayBuffer = await res.arrayBuffer();
    await loadPdfFromArrayBuffer(arrayBuffer);
  };

  const loadPdfFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    await loadPdfFromArrayBuffer(arrayBuffer);
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

  // ---------------------------------------------------------------------------
  // PDF 로드 (fileUrl 기준)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!fileUrl) return;

    const loadFromUrl = async () => {
      try {
        const res = await fetch(fileUrl);
        const arrayBuffer = await res.arrayBuffer();

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
        };

        try {
          await tryLoad(true);
        } catch (e1) {
          console.warn(
            '[ReplayViewerWorkspace] load from url with CMap failed, retry without CMap',
            e1
          );
          try {
            await tryLoad(false);
          } catch (e2) {
            console.error(
              '[ReplayViewerWorkspace] load from url failed completely',
              e2
            );
          }
        }
      } catch (err) {
        console.error('[ReplayViewerWorkspace] fetch fileUrl failed', err);
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
          console.warn('[ReplayViewerWorkspace] cancel renderTask failed', e);
        }
        renderTaskRef.current = null;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const hasLogical = Array.isArray(logicalPages) && logicalPages.length > 0;

      const lp = hasLogical ? (findLogicalPage(currentPage) as any) : undefined;
      const targetPdfPageNo = Number(lp?.targetPdfPageNo);
      const pdfPageNo = Number(lp?.pdfPageNo);
      const mappedNo =
        Number.isFinite(targetPdfPageNo) && targetPdfPageNo > 0
          ? Math.min(Math.max(1, targetPdfPageNo), pdfDoc.numPages)
          : Number.isFinite(pdfPageNo) && pdfPageNo > 0
            ? Math.min(Math.max(1, pdfPageNo), pdfDoc.numPages)
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
          console.warn(
            '[ReplayViewerWorkspace] render task error (ignored)',
            e
          );
        } finally {
          renderTaskRef.current = null;
        }
      } else {
        const W = Number(lp?.width) || FIXED_W;
        const H = Number(lp?.height) || FIXED_H;
        const isLandscape = W > H;
        const BW = isLandscape ? FIXED_H : FIXED_W;
        const BH = isLandscape ? FIXED_W : FIXED_H;

        setPageBox({ w: BW, h: BH });

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
          console.warn('[ReplayViewerWorkspace] cancel on cleanup failed', e);
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
  }));

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
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              borderRadius: 8,
            }}
          />
{/*          <canvas
            ref={drawCanvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: pageBox.w,
              height: pageBox.h,
              pointerEvents: 'none',
            }}
          />*/}

          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: pageBox.w,
              height: pageBox.h,
            }}
          >
            {logicalPages &&
              logicalPages.length > 0 &&
              (() => {
                const lp = findLogicalPage(currentPage) as any;

                if (!lp) return null;

                const pageW = Number(lp.width) || pageBox.w;
                const pageH = Number(lp.height) || pageBox.h;
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
                              fontSize: Math.max(12, Math.min(width, height) * 0.12),
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
          상단에서 <b>PDF 파일</b>을 불러와 주세요.
        </div>
      )}
    </div>
  );
});

ReplayViewerWorkspace.displayName = 'ReplayViewerWorkspace';
