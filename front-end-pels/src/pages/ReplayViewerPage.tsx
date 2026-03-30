// src/pages/ReplayViewerPage.tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { BaseLayout } from '../components/layout/BaseLayout';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { ViewerFooter } from '../components/viewer/ViewerFooter';
import {
  ReplayViewerWorkspace,
  type ReplayViewerWorkspaceHandle,
  type TemplatePathData,
} from '../components/viewer/ReplayViewerWorkspace';
import { PDF_BOUNDARY } from '../lib/boundaryUtils';
import type { TemplateDoc } from '../types';
import { BASE_PAGE_WIDTH } from '../constants/pageSize';

const BASE_W = BASE_PAGE_WIDTH;
const BASE_H = Math.round((PDF_BOUNDARY.height / PDF_BOUNDARY.width) * BASE_W);

type ReplayEventItem = {
  EVENT_SNO: number;
  EVENT_SQNO: number;
  CHCK_SNO: number;
  PAGE_CNT: number;
  INSRTN_PAGE_CNT: number | null;
  PDF_PAGE_CNT: number | null;
  STROKE_SEQ: number | null;
  IMAGE_SEQ: number | null;
  USER_ID: string;
  EVENT_CRTE_DT: string;
  STROKE?: {
    X_CRDNT?: number | null;
    Y_CRDNT?: number | null;
    LINE_SNO?: number | null;
    LINE_ETT?: number | null;
  } | null;
  IMAGE?: {
    posX?: number | null;
    posY?: number | null;
    width?: number | null;
    height?: number | null;
    fileUrl?: string | null;
  } | null;
};

type ReplayLogicalPage = any;

type ReplayState = {
  logicalPages: ReplayLogicalPage[];
  pathDataByPage: Record<number, TemplatePathData[]>;
};

function extractBoundary(contentType: string) {
  const match = contentType.match(/boundary=([^;]+)/i);
  return match?.[1]?.replace(/^"|"$/g, '') ?? null;
}

function parseFilename(headers: string) {
  const match = headers.match(/filename="([^"]+)"/i);
  return match?.[1] ?? '';
}

function parseEventSnoFromFilename(filename: string) {
  const match = filename.match(/_(\d+)\.bin$/i);
  return match ? Number(match[1]) : null;
}

function indexOfSubarray(
  source: Uint8Array,
  target: Uint8Array,
  fromIndex = 0
) {
  outer: for (let i = fromIndex; i <= source.length - target.length; i++) {
    for (let j = 0; j < target.length; j++) {
      if (source[i + j] !== target[j]) continue outer;
    }
    return i;
  }

  return -1;
}

function parseMultipartMixedBinary(
  raw: ArrayBuffer,
  boundary: string
): Array<{ filename: string; body: Uint8Array }> {
  const bytes = new Uint8Array(raw);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const boundaryBytes = encoder.encode(`--${boundary}`);
  const headerSepBytes = encoder.encode('\r\n\r\n');
  const out: Array<{ filename: string; body: Uint8Array }> = [];

  let cursor = 0;

  while (true) {
    let boundaryStart = indexOfSubarray(bytes, boundaryBytes, cursor);
    if (boundaryStart < 0) break;

    let partStart = boundaryStart + boundaryBytes.length;

    if (bytes[partStart] === 45 && bytes[partStart + 1] === 45) break;

    if (bytes[partStart] === 13 && bytes[partStart + 1] === 10) {
      partStart += 2;
    }

    const headerEnd = indexOfSubarray(bytes, headerSepBytes, partStart);
    if (headerEnd < 0) break;

    const headerText = decoder.decode(bytes.slice(partStart, headerEnd));
    const filename = parseFilename(headerText);

    const bodyStart = headerEnd + headerSepBytes.length;
    const nextBoundary = indexOfSubarray(bytes, boundaryBytes, bodyStart);
    if (nextBoundary < 0) break;

    let bodyEnd = nextBoundary;
    if (bytes[bodyEnd - 2] === 13 && bytes[bodyEnd - 1] === 10) {
      bodyEnd -= 2;
    }

    out.push({
      filename,
      body: bytes.slice(bodyStart, bodyEnd),
    });

    cursor = nextBoundary;
  }

  return out;
}

function decodeStrokeBinary(
  bytes: Uint8Array,
  fallbackColor?: number | null,
  fallbackWidth?: number | null,
  strokeSeq?: number | null
): TemplatePathData | null {
  if (!bytes || bytes.byteLength < 8) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const points: number[] = [];

  for (let i = 0; i + 1 < bytes.byteLength; i += 2) {
    points.push(view.getInt16(i, true));
  }

  if (points.length < 4) return null;

  return {
    id: strokeSeq ?? undefined,
    points,
    color: fallbackColor ?? 0xff000000,
    strokeWidth: fallbackWidth ?? 1,
  };
}

export function ReplayViewerPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const chckSno = params.get('CHCK_SNO') || '';

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageScale, setPageScale] = useState(1);

  const [baseTemplateDoc, setBaseTemplateDoc] = useState<TemplateDoc | null>(
    null
  );
  const [basePages, setBasePages] = useState<TemplateDoc['pages']>([]);
  const [attachmentsByPage, setAttachmentsByPage] = useState<
    Record<number, any[]>
  >({});

  const [events, setEvents] = useState<ReplayEventItem[]>([]);
  const [strokePathByPage, setStrokePathByPage] = useState<
    Record<number, Record<number, TemplatePathData>>
  >({});

  const [logicalPages, setLogicalPages] = useState<ReplayLogicalPage[]>([]);
  const [pathDataByPage, setPathDataByPage] = useState<
    Record<number, TemplatePathData[]>
  >({});

  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 0 });
  const [playheadIndex, setPlayheadIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef<ReplayViewerWorkspaceHandle | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const playTimerRef = useRef<number | null>(null);

  const recalcScale = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const footerH = footerRef.current?.offsetHeight ?? 0;
    const centerW = centerRef.current?.offsetWidth ?? window.innerWidth;

    const verticalPadding = 24;
    const horizontalPadding = 32;

    const availableH = window.innerHeight - headerH - footerH - verticalPadding;
    const availableW = centerW - horizontalPadding;

    const sH = availableH / BASE_H;
    const sW = availableW / BASE_W;

    const base = Math.min(1, Math.max(0.1, Math.min(sH, sW)));
    const zoomFactor = zoomLevel / 100;

    setPageScale(base * zoomFactor);
  }, [zoomLevel]);

  const buildReplayState = useCallback(
    (sourceEvents: ReplayEventItem[], appliedIndex: number): ReplayState => {
      const nextLogicalPages: ReplayLogicalPage[] = [...basePages]
        .map(pg => {
          const pageNo = Number((pg as any).page);
          const pdfPageNo =
            (pg as any).pdfPageNo == null
              ? null
              : Number((pg as any).pdfPageNo);

          return {
            ...pg,
            page: pageNo,
            pdfPageNo,
            width: Number((pg as any).width) || BASE_W,
            height: Number((pg as any).height) || BASE_H,
            attachments:
              attachmentsByPage[pageNo] ??
              (Array.isArray((pg as any).attachments)
                ? (pg as any).attachments
                : []),
          };
        })
        .sort((a, b) => Number(a.page) - Number(b.page));

      const activeStrokeIdsByPage = new Map<number, Set<number>>();

      for (let i = 0; i <= appliedIndex; i++) {
        const ev = sourceEvents[i];
        if (!ev) continue;

        const eventType = Number(ev.EVENT_SQNO);
        const pageNo = Number(ev.PAGE_CNT);
        const pdfPageNo =
          ev.PDF_PAGE_CNT == null ? null : Number(ev.PDF_PAGE_CNT);
        const strokeSeq = ev.STROKE_SEQ == null ? null : Number(ev.STROKE_SEQ);

        if (eventType === 1) {
          const insertIdx = Math.max(
            0,
            Math.min(nextLogicalPages.length, pageNo - 1)
          );

          nextLogicalPages.splice(insertIdx, 0, {
            page: 0,
            pdfPageNo,
            constraintPageNo: pdfPageNo ?? -1,
            width: nextLogicalPages[0]?.width ?? BASE_W,
            height: nextLogicalPages[0]?.height ?? BASE_H,
            isChange: 'N',
            components: [],
            attachments: [],
          });

          nextLogicalPages.forEach((pg, idx) => {
            pg.page = idx + 1;
          });

          continue;
        }

        if (eventType === 2) {
          const removeIdx = pageNo - 1;

          if (removeIdx >= 0 && removeIdx < nextLogicalPages.length) {
            nextLogicalPages.splice(removeIdx, 1);

            nextLogicalPages.forEach((pg, idx) => {
              pg.page = idx + 1;
            });
          }

          continue;
        }

        if (eventType === 3 && strokeSeq != null) {
          const set = activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
          set.add(strokeSeq);
          activeStrokeIdsByPage.set(pageNo, set);
        }

        if (eventType === 4 && strokeSeq != null) {
          const set = activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
          set.delete(strokeSeq);
          activeStrokeIdsByPage.set(pageNo, set);
        }
      }

      const nextPathDataByPage: Record<number, TemplatePathData[]> = {};

      nextLogicalPages.forEach(page => {
        const pageNo = Number(page.page);
        const activeIds =
          activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
        const strokeMap = strokePathByPage[pageNo] ?? {};

        nextPathDataByPage[pageNo] = Array.from(activeIds)
          .map(id => strokeMap[id])
          .filter(Boolean);
      });

      // console
      console.log('[replay] buildReplayState', {
        appliedIndex,
        logicalPages: nextLogicalPages,
        pathDataByPage: nextPathDataByPage,
      });
      // console

      return {
        logicalPages: nextLogicalPages,
        pathDataByPage: nextPathDataByPage,
      };
    },
    [attachmentsByPage, basePages, strokePathByPage]
  );

  const moveToEventPage = useCallback(
    (eventIndex: number) => {
      const event = events[eventIndex];
      if (!event) return;

      const targetPage = Number(event.PAGE_CNT);
      if (!Number.isFinite(targetPage) || targetPage <= 0) return;

      const exists = logicalPages.some(
        page => Number(page.page) === targetPage
      );

      if (!exists) return;

      wsRef.current?.goToPage(targetPage);
    },
    [events, logicalPages]
  );

  useEffect(() => {
    if (!chckSno) return;

    const load = async () => {
      setLoading(true);
      try {
        const metaRes = await axios.get('/api/Exam_Json_M.do', {
          params: { CHCK_SNO: chckSno },
          withCredentials: true,
        });

        const { PDF_PATH, FRM_OVER_JSON } = metaRes.data;
        if (!PDF_PATH) return;

        const isProd = import.meta.env.PROD;
        if (isProd) {
          const res = await fetch(PDF_PATH);
          const blob = await res.blob();
          const file = new File([blob], 'replay_viewer.pdf', {
            type: 'application/pdf',
          });
          setPdfFile(file);
          setCurrentFile(file.name);
          setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
          setFileUrl(URL.createObjectURL(file));
          wsRef.current?.loadPdfFile(file);
        } else {
          const pdfRes = await axios.get('/proxy/pdf', {
            params: { path: PDF_PATH },
            responseType: 'blob',
            withCredentials: true,
          });
          const file = new File([pdfRes.data], 'replay_viewer.pdf', {
            type: 'application/pdf',
          });
          setPdfFile(file);
          setCurrentFile(file.name);
          setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
          setFileUrl(URL.createObjectURL(file));
          wsRef.current?.loadPdfFile(file);
        }

        if (FRM_OVER_JSON) {
          const parsed = JSON.parse(FRM_OVER_JSON);
          const templateJson = {
            ...(parsed.doc || {}),
            pages: parsed.pages || [],
          } as TemplateDoc;

          setBaseTemplateDoc(templateJson);
          setBasePages(templateJson.pages || []);

          const attachmentMap: Record<number, any[]> = {};
          (parsed.pages || []).forEach((pg: any) => {
            attachmentMap[Number(pg.page)] = Array.isArray(pg.attachments)
              ? pg.attachments
              : [];
          });
          setAttachmentsByPage(attachmentMap);
        }

        const eventRes = await axios.get('/api/events', {
          params: { chckSno: chckSno },
          withCredentials: true,
        });

        const nextEvents: ReplayEventItem[] = Array.isArray(eventRes.data?.data)
          ? [...eventRes.data.data].sort((a, b) => {
              const ta = new Date(a.EVENT_CRTE_DT).getTime();
              const tb = new Date(b.EVENT_CRTE_DT).getTime();

              if (ta !== tb) return ta - tb;
              return Number(a.EVENT_SNO) - Number(b.EVENT_SNO);
            })
          : [];

        setEvents(nextEvents);
        console.log('[replay] event sample', nextEvents[0]);

        const pageNos = Array.from(
          new Set(
            nextEvents
              .filter(
                ev => Number(ev.EVENT_SQNO) === 3 || Number(ev.EVENT_SQNO) === 4
              )
              .map(ev => Number(ev.PAGE_CNT))
              .filter(pageNo => Number.isFinite(pageNo) && pageNo > 0)
          )
        );

        const nextStrokePathByPage: Record<
          number,
          Record<number, TemplatePathData>
        > = {};

        for (const pageNo of pageNos) {
          const strokeRes = await fetch(
            `/api/events/strokes?chckSno=${encodeURIComponent(
              chckSno
            )}&pageNo=${pageNo}`,
            { credentials: 'include' }
          );

          if (!strokeRes.ok) continue;

          const contentType = strokeRes.headers.get('content-type') || '';
          const boundary = extractBoundary(contentType);
          if (!boundary) continue;

          const rawBuffer = await strokeRes.arrayBuffer();
          const parts = parseMultipartMixedBinary(rawBuffer, boundary);

          const pageEvents = nextEvents.filter(
            ev => Number(ev.PAGE_CNT) === Number(pageNo)
          );

          nextStrokePathByPage[pageNo] = {};

          for (const part of parts) {
            const eventSno = parseEventSnoFromFilename(part.filename);
            if (!eventSno) continue;

            const addEvent = [...pageEvents]
              .reverse()
              .find(
                ev =>
                  Number(ev.EVENT_SQNO) === 3 &&
                  Number(ev.EVENT_SNO) === Number(eventSno)
              );

            if (!addEvent) continue;

            const strokeSeq =
              addEvent.STROKE_SEQ == null ? null : Number(addEvent.STROKE_SEQ);

            // const strokeColor = addEvent.STROKE?.strokeColor ?? null;
            // const strokeWidth = addEvent.STROKE?.strokeWidth ?? null;
            const strokeColor = addEvent.STROKE?.LINE_SNO ?? null;
            const strokeWidth = addEvent.STROKE?.LINE_ETT ?? null;

            const decoded = decodeStrokeBinary(
              part.body,
              strokeColor,
              strokeWidth,
              strokeSeq
            );

            console.log('[replay] matched addEvent', addEvent);

            console.log('[replay] decode result', {
              pageNo,
              filename: part.filename,
              eventSno,
              strokeSeq,
              blobLength: part.body.length,
              strokeColor,
              strokeWidth,
              decoded,
            });

            const safeStrokeSeq = strokeSeq ?? eventSno;

            if (decoded) {
              nextStrokePathByPage[pageNo][safeStrokeSeq] = {
                ...decoded,
                id: safeStrokeSeq,
              };
            }
          }
        }

        // console
        console.log('[replay] nextStrokePathByPage', nextStrokePathByPage);
        setStrokePathByPage(nextStrokePathByPage);
      } catch (err) {
        console.error('[ReplayViewerPage] load failed', err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [chckSno]);

  useEffect(() => {
    if (!basePages.length) return;

    const nextState = buildReplayState(events, playheadIndex);
    setLogicalPages(nextState.logicalPages);
    setPathDataByPage(nextState.pathDataByPage);

    if (nextState.logicalPages.length > 0) {
      const exists = nextState.logicalPages.some(
        page => Number(page.page) === Number(pageInfo.currentPage)
      );
      if (!exists) {
        const firstPage = Number(nextState.logicalPages[0]?.page ?? 1);
        wsRef.current?.goToPage(firstPage);
      }
    }
  }, [
    basePages,
    events,
    playheadIndex,
    buildReplayState,
    pageInfo.currentPage,
  ]);

  useEffect(() => {
    if (!isPlaying) return;
    if (playheadIndex < 0) return;
    if (!events.length) return;
    if (!logicalPages.length) return;

    const currentEvent = events[playheadIndex];
    if (!currentEvent) return;

    const targetPage = Number(currentEvent.PAGE_CNT);
    if (!Number.isFinite(targetPage) || targetPage <= 0) return;

    const exists = logicalPages.some(page => Number(page.page) === targetPage);

    if (!exists) return;

    if (pageInfo.currentPage !== targetPage) {
      wsRef.current?.goToPage(targetPage);
    }
  }, [isPlaying, playheadIndex, events, logicalPages, pageInfo.currentPage]);

  useEffect(() => {
    if (!isPlaying) return;
    if (playheadIndex >= events.length - 1) {
      setIsPlaying(false);
      return;
    }

    const interval = Math.max(100, Math.round(800 / playSpeed));
    playTimerRef.current = window.setTimeout(() => {
      setPlayheadIndex(prev => {
        const next = prev + 1;
        return next >= events.length ? events.length - 1 : next;
      });
    }, interval);

    return () => {
      if (playTimerRef.current != null) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, playheadIndex, playSpeed, events.length]);

  useEffect(() => {
    return () => {
      if (playTimerRef.current != null) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    recalcScale();

    const onResize = () => recalcScale();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => recalcScale());
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    if (centerRef.current) ro.observe(centerRef.current);

    requestAnimationFrame(() => recalcScale());

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [recalcScale]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 25));
  const handlePrevPage = () => wsRef.current?.goPrevPage();
  const handleNextPage = () => wsRef.current?.goNextPage();
  const handlePageChange = (target: number) => wsRef.current?.goToPage(target);

  const currentEventTime =
    playheadIndex >= 0 && events[playheadIndex]
      ? events[playheadIndex].EVENT_CRTE_DT
      : '-';

  const totalEvents = events.length;

  return (
    <BaseLayout>
      <div ref={headerRef}>
        <ViewerHeader
          isDbMode={!!chckSno}
          hasPdf={!!pdfFile}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomLevel={zoomLevel}
          onRotate={() => {}}
          onSearch={() => {}}
          onDownload={() => {}}
          onPickPdf={() => {}}
          onPickJson={async () => {}}
          onPickConstraintJson={() => {}}
          onSaveJsonWithValues={() => {}}
          onSavePdf={() => {}}
          hasDialog={false}
          hasQrDialog={false}
          onShowDialog={() => {}}
          onShowQrDialog={() => {}}
        />
      </div>

      <div className="px-3 py-2 text-xs text-slate-600 bg-slate-50 border-b flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-slate-900 text-white"
          onClick={() => {
            setIsPlaying(false);
            setPlayheadIndex(-1);
          }}
        >
          처음
        </button>
        <button
          className="px-3 py-1 rounded bg-slate-900 text-white"
          onClick={() => setIsPlaying(prev => !prev)}
          disabled={totalEvents === 0}
        >
          {isPlaying ? '일시정지' : '재생'}
        </button>
        <button
          className="px-3 py-1 rounded bg-slate-900 text-white"
          onClick={() => {
            setIsPlaying(false);

            setPlayheadIndex(prev => {
              const next = Math.max(-1, prev - 1);

              if (next >= 0) {
                requestAnimationFrame(() => {
                  moveToEventPage(next);
                });
              }

              return next;
            });
          }}
          disabled={totalEvents === 0}
        >
          이전 이벤트
        </button>
        <button
          className="px-3 py-1 rounded bg-slate-900 text-white"
          onClick={() => {
            setIsPlaying(false);

            setPlayheadIndex(prev => {
              const next = Math.min(totalEvents - 1, prev + 1);

              if (next >= 0) {
                requestAnimationFrame(() => {
                  moveToEventPage(next);
                });
              }

              return next;
            });
          }}
          disabled={totalEvents === 0}
        >
          다음 이벤트
        </button>
        <select
          className="border px-2 py-1"
          value={playSpeed}
          onChange={e => setPlaySpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
        <input
          type="range"
          min={-1}
          max={Math.max(-1, totalEvents - 1)}
          value={playheadIndex}
          onChange={e => {
            setIsPlaying(false);
            setPlayheadIndex(Number(e.target.value));
          }}
          className="flex-1"
        />
        <span className="text-slate-500">
          {playheadIndex < 0 ? 0 : playheadIndex + 1} / {totalEvents}
        </span>
        <span className="text-slate-500">{currentEventTime}</span>
        {loading && <span className="text-slate-500">불러오는 중...</span>}
      </div>

      <div
        ref={centerRef}
        className={`flex flex-1 bg-slate-100 ${
          zoomLevel >= 110 ? 'overflow-auto' : 'overflow-hidden'
        }`}
      >
        <div className="flex flex-1 justify-center items-start py-3">
          <div
            style={{
              width: BASE_W * pageScale,
              height: BASE_H * pageScale,
            }}
          >
            <div
              style={{
                width: BASE_W,
                height: BASE_H,
                transform: `scale(${pageScale})`,
                transformOrigin: 'top center',
              }}
            >
              <ReplayViewerWorkspace
                ref={wsRef}
                scale={pageScale}
                fileUrl={fileUrl ?? undefined}
                logicalPages={logicalPages as any}
                pathDataByPage={pathDataByPage}
                attachmentsByPage={attachmentsByPage}
                onPageInfoChange={info => setPageInfo(info)}
              />
            </div>
          </div>
        </div>
      </div>

      <div ref={footerRef}>
        <ViewerFooter
          currentFile={currentFile}
          fileSize={fileSize}
          currentPage={pageInfo.currentPage}
          totalPages={pageInfo.totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onPageChange={handlePageChange}
        />
      </div>
    </BaseLayout>
  );
}
