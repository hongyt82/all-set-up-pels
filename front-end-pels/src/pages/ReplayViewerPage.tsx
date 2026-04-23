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

type ReplayAttachmentItem = {
  id: string;
  type?: string | null;
  text?: string | null;
  x?: number | null;
  y?: number | null;
  posX?: number | null;
  posY?: number | null;
  width?: number | null;
  height?: number | null;
  fileUrl?: string | null;
  url?: string | null;
  imagePath?: string | null;
};

type ReplayEventItem = {
  EVENT_SNO: number;
  EVENT_TYP_SQNO: number;
  CHCK_SNO: number;
  PAGE_CNT: number;
  INSRTN_PAGE_CNT: number | null;
  PDF_PAGE_CNT: number | null;
  STRK_SEQ: number | null;
  IMAGE_SEQ: number | null;
  USER_ID: string;
  USER_FNM?: string | null;
  CHKPR_BLNG_JBPS_NM?: string | null;
  EVENT_CRTE_DT: string;

  EVENT_NM?: string | null;
  EVENT_NAME?: string | null;
  ATTACHMENT_EVENT_TYPE?: string | null;

  STRK_X_CRDNT?: number | null;
  STRK_Y_CRDNT?: number | null;
  LINE_SNO?: number | null;
  LINE_ETT?: number | null;

  IMG_ID?: string | null;
  IMG_X_CRDNT?: number | null;
  IMG_Y_CRDNT?: number | null;
  WDTH_NUMV?: number | null;
  HDTH_NUMV?: number | null;
  URL_INFO?: string | null;

  STROKE?: {
    X_CRDNT?: number | null;
    Y_CRDNT?: number | null;
    LINE_SNO?: number | null;
    LINE_ETT?: number | null;
  } | null;

  IMAGE?: ReplayAttachmentItem | null;
};

type ReplayLogicalPage = any;

type ReplayState = {
  logicalPages: ReplayLogicalPage[];
  pathDataByPage: Record<number, TemplatePathData[]>;
  attachmentsByPage: Record<number, any[]>;
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

  while (cursor < bytes.length) {
    const boundaryStart = indexOfSubarray(bytes, boundaryBytes, cursor);
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

function getBaseUrl(url?: string | null) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || '';
    const uploadIdx = pathname.indexOf('/upload/');
    const basePath = uploadIdx >= 0 ? pathname.slice(0, uploadIdx) : '';
    return `${parsed.origin}${basePath}`;
  } catch {
    return '';
  }
}

function shouldUseFileProxy(filePath: string) {
  try {
    const fileOrigin = new URL(filePath).origin;
    return fileOrigin !== window.location.origin;
  } catch {
    return true;
  }
}

function toProxyFileUrl(filePath: string) {
  return `/pels/proxy/file?path=${encodeURIComponent(filePath)}`;
}

function toImageUrl(url?: string | null, fileBaseUrl?: string) {
  if (!url) return null;

  let resolvedUrl = url;

  if (!/^https?:\/\//i.test(resolvedUrl)) {
    if (!fileBaseUrl) return resolvedUrl;
    resolvedUrl = `${fileBaseUrl}/${String(resolvedUrl).replace(/^\/+/, '')}`;
  }

  if (shouldUseFileProxy(resolvedUrl)) {
    return toProxyFileUrl(resolvedUrl);
  }

  return resolvedUrl;
}

function normalizeImageSrc(
  fileUrl?: string | null,
  url?: string | null,
  fileBaseUrl?: string
) {
  return toImageUrl(fileUrl ?? url ?? null, fileBaseUrl);
}

function mapAttachmentEventName(eventType: number) {
  if (eventType === 5) return 'addAttachment';
  if (eventType === 6) return 'changeUrlAttachment';
  if (eventType === 7) return 'changeLayoutAttachment';
  if (eventType === 8) return 'removeAttachment';
  return null;
}

function getReplayEventLabel(eventType: number) {
  switch (Number(eventType)) {
    case 1:
      return '페이지 추가';
    case 2:
      return '페이지 삭제';
    case 3:
      return '스트로크 추가';
    case 4:
      return '스트로크 삭제';
    case 5:
      return '사진 컨테이너 추가';
    case 6:
      return '사진 추가/변경';
    case 7:
      return '사진 크기 변경';
    case 8:
      return '사진 삭제';
    default:
      return '알 수 없는 이벤트';
  }
}

async function getPdfPageCountFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer.slice(0));

  const loadingTask = (await import('pdfjs-dist')).getDocument({ data });
  const doc = await loadingTask.promise;
  return doc.numPages;
}

function getFilenameFromPath(path?: string | null) {
  if (!path) return 'replay_viewer.pdf';
  const clean = path.split('?')[0];
  const name = clean.substring(clean.lastIndexOf('/') + 1);
  return name || 'replay_viewer.pdf';
}

function normalizeAttachment(
  att?: ReplayAttachmentItem | null,
  fileBaseUrl?: string
) {
  if (!att?.id) return null;

  const normalizedSrc = normalizeImageSrc(att.fileUrl, att.url, fileBaseUrl);

  return {
    ...att,
    id: String(att.id),
    x: att.x ?? att.posX ?? 0,
    y: att.y ?? att.posY ?? 0,
    width: att.width ?? 0,
    height: att.height ?? 0,
    fileUrl: normalizedSrc,
    url: normalizedSrc,
  };
}

function buildBasePagesFromPdf(
  pdfPageCount: number,
  parsedPages: any[] = []
): any[] {
  const firstParsed = parsedPages.find(
    pg => Number(pg?.pdfPageNo) === 1 || Number(pg?.page) === 1
  );

  const fallbackWidth = Number(firstParsed?.width) || BASE_W;
  const fallbackHeight = Number(firstParsed?.height) || BASE_H;

  return Array.from({ length: pdfPageCount }, (_, idx) => {
    const pdfPageNo = idx + 1;

    const matched =
      parsedPages.find(pg => Number(pg?.pdfPageNo) === pdfPageNo) ??
      parsedPages.find(pg => Number(pg?.page) === pdfPageNo);

    return {
      page: pdfPageNo,
      pageKey: `pdf-${pdfPageNo}`,
      pdfPageNo,
      insrtnPageCnt: null,
      targetPdfPageNo: pdfPageNo,
      constraintPageNo: pdfPageNo,
      width: Number(matched?.width) || fallbackWidth,
      height: Number(matched?.height) || fallbackHeight,
      isChange: 'N',
      components: Array.isArray(matched?.components) ? matched.components : [],
      attachments: [],
    };
  });
}

function makeReplayPageKey(
  pdfPageCnt?: number | null,
  insrtnPageCnt?: number | null
) {
  const pdfNo = Number(pdfPageCnt);
  const insertNo = Number(insrtnPageCnt);

  if (Number.isFinite(pdfNo) && pdfNo > 0) {
    return `pdf-${pdfNo}`;
  }

  if (Number.isFinite(insertNo) && insertNo > 0) {
    return `insert-${insertNo}`;
  }

  return null;
}

function findPageByCurrentPage(pages: ReplayLogicalPage[], pageCnt: number) {
  return pages.find(p => Number(p.page) === Number(pageCnt)) ?? null;
}

function getEventPageKey(ev: ReplayEventItem) {
  return (
    makeReplayPageKey(
      ev.PDF_PAGE_CNT == null ? null : Number(ev.PDF_PAGE_CNT),
      ev.INSRTN_PAGE_CNT == null ? null : Number(ev.INSRTN_PAGE_CNT)
    ) ?? null
  );
}

export function ReplayViewerPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const chckSno = params.get('CHCK_SNO') || '';
  const pwplId = params.get('PWPL_ID') || '';

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileBaseUrl, setFileBaseUrl] = useState('');

  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageScale, setPageScale] = useState(1);

  const [basePages, setBasePages] = useState<TemplateDoc['pages']>([]);
  const [attachmentsByPage, setAttachmentsByPage] = useState<
    Record<number, any[]>
  >({});
  const [replayAttachmentsByPage, setReplayAttachmentsByPage] = useState<
    Record<number, any[]>
  >({});

  const [events, setEvents] = useState<ReplayEventItem[]>([]);
  const [strokePathByPage, setStrokePathByPage] = useState<
    Record<string, Record<number, TemplatePathData>>
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
  const [showReplayInfoPanel, setShowReplayInfoPanel] = useState(false);
  const [listFilterMode, setListFilterMode] = useState<'all' | 'currentPage'>(
    'all'
  );

  const wsRef = useRef<ReplayViewerWorkspaceHandle | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const playTimerRef = useRef<number | null>(null);

  const [replayPanelWidth, setReplayPanelWidth] = useState(0);
  const replayPanelRef = useRef<HTMLDivElement | null>(null);
  const replayListBodyRef = useRef<HTMLDivElement | null>(null);
  const replayItemRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const handleLoadedFile = async (file: File, frmOverJson?: string | null) => {
    setPdfFile(file);
    setCurrentFile(file.name);
    setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    setFileUrl(URL.createObjectURL(file));
    // wsRef.current?.loadPdfFile(file);

    if (frmOverJson) {
      const parsed = JSON.parse(frmOverJson);
      const parsedPages = Array.isArray(parsed.pages) ? parsed.pages : [];
      const initialPdfPageCount = await getPdfPageCountFromFile(file);
      const initialBasePages = buildBasePagesFromPdf(
        initialPdfPageCount,
        parsedPages
      );
      setBasePages(initialBasePages);
    }
  };

  const recalcScale = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const footerH = footerRef.current?.offsetHeight ?? 0;
    const centerW = centerRef.current?.offsetWidth ?? window.innerWidth;

    const verticalPadding = 24;
    const horizontalPadding = 32;
    const panelOffset = showReplayInfoPanel ? (replayPanelWidth + 16) / 2 : 0;

    const availableH = window.innerHeight - headerH - footerH - verticalPadding;
    const availableW = centerW - horizontalPadding - panelOffset * 2;

    const sH = availableH / BASE_H;
    const sW = availableW / BASE_W;

    const base = Math.min(1, Math.max(0.1, Math.min(sH, sW)));
    const zoomFactor = zoomLevel / 100;

    setPageScale(base * zoomFactor);
  }, [zoomLevel, showReplayInfoPanel, replayPanelWidth]);

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
            pageKey:
              (pg as any).pageKey ??
              makeReplayPageKey(pdfPageNo, (pg as any).insrtnPageCnt) ??
              `page-${pageNo}`,
            pdfPageNo,
            insrtnPageCnt:
              (pg as any).insrtnPageCnt == null
                ? null
                : Number((pg as any).insrtnPageCnt),
            width: Number((pg as any).width) || BASE_W,
            height: Number((pg as any).height) || BASE_H,
            attachments: Array.isArray((pg as any).attachments)
              ? (pg as any).attachments
              : [],
          };
        })
        .sort((a, b) => Number(a.page) - Number(b.page));

      const activeStrokeIdsByPageKey = new Map<string, Set<number>>();
      const activeAttachmentsByPageKey = new Map<string, Map<string, any>>();

      nextLogicalPages.forEach(page => {
        const pageKey = String(page.pageKey);
        activeAttachmentsByPageKey.set(pageKey, new Map<string, any>());
      });

      const ensureAttachmentPageByKey = (pageKey: string) => {
        if (!activeAttachmentsByPageKey.has(pageKey)) {
          activeAttachmentsByPageKey.set(pageKey, new Map<string, any>());
        }
        return activeAttachmentsByPageKey.get(pageKey)!;
      };

      for (let i = 0; i <= appliedIndex; i++) {
        const ev = sourceEvents[i];
        if (!ev) continue;

        const eventType = Number(ev.EVENT_TYP_SQNO);
        const pageNo = Number(ev.PAGE_CNT);
        const pdfPageNo =
          ev.PDF_PAGE_CNT == null ? null : Number(ev.PDF_PAGE_CNT);
        const strokeSeq = ev.STRK_SEQ == null ? null : Number(ev.STRK_SEQ);

        const eventName =
          ev.ATTACHMENT_EVENT_TYPE ?? ev.EVENT_NM ?? ev.EVENT_NAME ?? null;

        const attachment = normalizeAttachment(ev.IMAGE, fileBaseUrl);

        if (eventType === 1) {
          const insertIdx = Math.max(
            0,
            Math.min(nextLogicalPages.length, pageNo - 1)
          );
          const insertSeq =
            ev.INSRTN_PAGE_CNT == null ? null : Number(ev.INSRTN_PAGE_CNT);

          const pageKey =
            makeReplayPageKey(pdfPageNo, insertSeq) ??
            `insert-fallback-${eventType}-${i}`;

          nextLogicalPages.splice(insertIdx, 0, {
            page: 0,
            pageKey,
            pdfPageNo,
            insrtnPageCnt: insertSeq,
            targetPdfPageNo: null,
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

          if (!activeAttachmentsByPageKey.has(pageKey)) {
            activeAttachmentsByPageKey.set(pageKey, new Map<string, any>());
          }
          if (!activeStrokeIdsByPageKey.has(pageKey)) {
            activeStrokeIdsByPageKey.set(pageKey, new Set<number>());
          }

          continue;
        }

        if (eventType === 2) {
          const deleteKey = makeReplayPageKey(
            ev.PDF_PAGE_CNT == null ? null : Number(ev.PDF_PAGE_CNT),
            ev.INSRTN_PAGE_CNT == null ? null : Number(ev.INSRTN_PAGE_CNT)
          );

          let removeIdx = -1;

          if (deleteKey) {
            removeIdx = nextLogicalPages.findIndex(
              pg => String(pg.pageKey) === deleteKey
            );
          }

          if (removeIdx < 0) {
            removeIdx = pageNo - 1;
          }

          if (removeIdx >= 0 && removeIdx < nextLogicalPages.length) {
            const removed = nextLogicalPages[removeIdx];
            const removedKey = String(removed.pageKey);

            nextLogicalPages.splice(removeIdx, 1);

            nextLogicalPages.forEach((pg, idx) => {
              pg.page = idx + 1;
            });

            activeAttachmentsByPageKey.delete(removedKey);
            activeStrokeIdsByPageKey.delete(removedKey);
          }

          continue;
        }

        if (eventType === 3 && strokeSeq != null) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const set =
            activeStrokeIdsByPageKey.get(pageKey) ?? new Set<number>();
          set.add(strokeSeq);
          activeStrokeIdsByPageKey.set(pageKey, set);
          continue;
        }

        if (eventType === 4 && strokeSeq != null) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const set =
            activeStrokeIdsByPageKey.get(pageKey) ?? new Set<number>();
          set.delete(strokeSeq);
          activeStrokeIdsByPageKey.set(pageKey, set);
          continue;
        }

        if (eventName === 'addAttachment' && attachment?.id) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const pageMap = ensureAttachmentPageByKey(pageKey);
          pageMap.set(attachment.id, attachment);
          continue;
        }

        if (eventName === 'changeLayoutAttachment' && attachment?.id) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const pageMap = ensureAttachmentPageByKey(pageKey);
          const prev = pageMap.get(attachment.id);

          if (prev) {
            pageMap.set(attachment.id, {
              ...prev,
              x: attachment.x ?? prev.x,
              y: attachment.y ?? prev.y,
              width: attachment.width ?? prev.width,
              height: attachment.height ?? prev.height,
            });
          } else {
            pageMap.set(attachment.id, attachment);
          }

          continue;
        }

        if (eventName === 'changeUrlAttachment' && attachment?.id) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const pageMap = ensureAttachmentPageByKey(pageKey);
          const prev = pageMap.get(attachment.id);

          if (prev) {
            pageMap.set(attachment.id, {
              ...prev,
              fileUrl: attachment.fileUrl ?? prev.fileUrl,
              url: attachment.url ?? prev.url,
              imagePath: attachment.imagePath ?? prev.imagePath,
            });
          } else {
            pageMap.set(attachment.id, attachment);
          }

          continue;
        }

        if (eventName === 'removeAttachment' && attachment?.id) {
          const targetPage = findPageByCurrentPage(nextLogicalPages, pageNo);
          if (!targetPage) continue;

          const pageKey = String(targetPage.pageKey);
          const pageMap = ensureAttachmentPageByKey(pageKey);
          pageMap.delete(attachment.id);
          continue;
        }
      }

      const nextPathDataByPage: Record<number, TemplatePathData[]> = {};
      const nextAttachmentsByPage: Record<number, any[]> = {};

      nextLogicalPages.forEach(page => {
        const pageNo = Number(page.page);
        const pageKey = String(page.pageKey);

        const activeIds =
          activeStrokeIdsByPageKey.get(pageKey) ?? new Set<number>();

        const strokeMap = strokePathByPage[pageKey] ?? {};

        nextPathDataByPage[pageNo] = Array.from(activeIds)
          .map(id => strokeMap[id])
          .filter(Boolean);

        const attachmentMap =
          activeAttachmentsByPageKey.get(pageKey) ?? new Map<string, any>();

        nextAttachmentsByPage[pageNo] = Array.from(attachmentMap.values());

        page.attachments = nextAttachmentsByPage[pageNo];
      });

      // console.log('[replay] buildReplayState', {
      //   appliedIndex,
      //   logicalPages: nextLogicalPages,
      //   pathDataByPage: nextPathDataByPage,
      //   attachmentsByPage: nextAttachmentsByPage,
      // });

      return {
        logicalPages: nextLogicalPages,
        pathDataByPage: nextPathDataByPage,
        attachmentsByPage: nextAttachmentsByPage,
      };
    },
    [attachmentsByPage, basePages, strokePathByPage, fileBaseUrl]
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
    if (!showReplayInfoPanel) {
      setReplayPanelWidth(0);
      return;
    }

    const updateWidth = () => {
      const width = replayPanelRef.current?.offsetWidth ?? 0;
      setReplayPanelWidth(width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    if (replayPanelRef.current) {
      observer.observe(replayPanelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [showReplayInfoPanel]);

  useEffect(() => {
    if (!chckSno) return;
    // if (!chckSno || !pwplId) return;

    const load = async () => {
      setLoading(true);
      try {
        const metaRes = await axios.get('/pels/api/Exam_Json_M', {
          params: { CHCK_SNO: chckSno },
          withCredentials: true,
        });

        const { PDF_PATH, FRM_OVER_JSON } = metaRes.data;

        const origin = getBaseUrl(PDF_PATH);
        setFileBaseUrl(origin);

        if (!PDF_PATH) return;
        const viewerFileName = getFilenameFromPath(PDF_PATH);

        // PDF origin이 다르면 프록시 사용
        if (shouldUseFileProxy(PDF_PATH)) {
          const pdfRes = await axios.get('/pels/proxy/file', {
            params: { path: PDF_PATH },
            responseType: 'blob',
            withCredentials: true,
          });

          const file = new File([pdfRes.data], viewerFileName, {
            type: 'application/pdf',
          });

          await handleLoadedFile(file, FRM_OVER_JSON);
        } else {
          const res = await fetch(PDF_PATH, {
            credentials: 'include',
          });

          if (!res.ok) {
            throw new Error(`PDF load failed: ${PDF_PATH}`);
          }

          const blob = await res.blob();
          const file = new File([blob], viewerFileName, {
            type: 'application/pdf',
          });

          await handleLoadedFile(file, FRM_OVER_JSON);
        }

        if (FRM_OVER_JSON) {
          const parsed = JSON.parse(FRM_OVER_JSON);
          const parsedPages = Array.isArray(parsed.pages) ? parsed.pages : [];

          const attachmentMap: Record<number, any[]> = {};
          parsedPages.forEach((pg: any) => {
            attachmentMap[Number(pg.page)] = Array.isArray(pg.attachments)
              ? pg.attachments
              : [];
          });
          setAttachmentsByPage(attachmentMap);
        }

        const eventRes = await axios.get('/pels/api/events', {
          params: {
            pwplId,
            chckSno: chckSno,
          },
          withCredentials: true,
        });

        const fileBaseUrl = getBaseUrl(PDF_PATH);

        const nextEvents: ReplayEventItem[] = Array.isArray(eventRes.data?.data)
          ? [...eventRes.data.data]
              .map((row: any) => {
                const nestedStroke = row.STROKE ?? null;
                // const nestedImage = row.IMAGE ?? null;

                const mappedStroke =
                  nestedStroke ??
                  (Number(row.EVENT_TYP_SQNO) === 3 ||
                  Number(row.EVENT_TYP_SQNO) === 4
                    ? {
                        X_CRDNT: row.STRK_X_CRDNT ?? null,
                        Y_CRDNT: row.STRK_Y_CRDNT ?? null,
                        LINE_SNO: row.LINE_SNO ?? null,
                        LINE_ETT: row.LINE_ETT ?? null,
                      }
                    : null);

                const mappedImage =
                  Number(row.EVENT_TYP_SQNO) >= 5 &&
                  Number(row.EVENT_TYP_SQNO) <= 8
                    ? {
                        id: String(
                          row.IMG_ID ?? row.IMAGE_SEQ ?? row.IMAGE?.id ?? ''
                        ),
                        type: row.IMAGE?.type ?? 'camera',

                        x:
                          row.IMAGE?.x ??
                          row.IMAGE?.posX ??
                          row.IMAGE?.X_CRDNT ??
                          row.IMG_X_CRDNT ??
                          0,

                        y:
                          row.IMAGE?.y ??
                          row.IMAGE?.posY ??
                          row.IMAGE?.Y_CRDNT ??
                          row.IMG_Y_CRDNT ??
                          0,

                        width:
                          row.IMAGE?.width ??
                          row.IMAGE?.WDTH_NUMV ??
                          row.WDTH_NUMV ??
                          0,

                        height:
                          row.IMAGE?.height ??
                          row.IMAGE?.HDTH_NUMV ??
                          row.HDTH_NUMV ??
                          0,

                        fileUrl: toImageUrl(
                          row.IMAGE?.fileUrl ??
                            row.IMAGE?.url ??
                            row.IMAGE?.URL_INFO ??
                            row.URL_INFO ??
                            null,
                          fileBaseUrl
                        ),

                        url: toImageUrl(
                          row.IMAGE?.url ??
                            row.IMAGE?.fileUrl ??
                            row.IMAGE?.URL_INFO ??
                            row.URL_INFO ??
                            null,
                          fileBaseUrl
                        ),
                      }
                    : null;

                return {
                  ...row,
                  IMAGE_SEQ: row.IMAGE_SEQ ?? row.IMG_ID ?? null,
                  ATTACHMENT_EVENT_TYPE:
                    row.ATTACHMENT_EVENT_TYPE ??
                    row.EVENT_NM ??
                    row.EVENT_NAME ??
                    mapAttachmentEventName(Number(row.EVENT_TYP_SQNO)),
                  STROKE: mappedStroke,
                  IMAGE: mappedImage,
                };
              })
              .sort((a, b) => {
                const ta = new Date(a.EVENT_CRTE_DT).getTime();
                const tb = new Date(b.EVENT_CRTE_DT).getTime();

                if (ta !== tb) return ta - tb;
                return Number(a.EVENT_SNO) - Number(b.EVENT_SNO);
              })
          : [];

        setEvents(nextEvents);
        setPlayheadIndex(-1);

        const strokeFetchPageNos = Array.from(
          new Set(
            nextEvents
              .filter(
                ev =>
                  Number(ev.EVENT_TYP_SQNO) === 3 ||
                  Number(ev.EVENT_TYP_SQNO) === 4
              )
              .map(ev => Number(ev.PAGE_CNT))
              .filter(pageNo => Number.isFinite(pageNo) && pageNo > 0)
          )
        );

        const nextStrokePathByPageKey: Record<
          string,
          Record<number, TemplatePathData>
        > = {};

        for (const pageNo of strokeFetchPageNos) {
          const strokeRes = await axios.get('/pels/api/events/strokes', {
            params: {
              pwplId,
              chckSno,
              pageCnt: pageNo,
            },
            responseType: 'arraybuffer',
            withCredentials: true,
          });

          const contentType = strokeRes.headers['content-type'] || '';
          const boundary = extractBoundary(contentType);
          if (!boundary) continue;

          const rawBuffer = strokeRes.data as ArrayBuffer;
          const parts = parseMultipartMixedBinary(rawBuffer, boundary);

          const pageEvents = nextEvents.filter(
            ev => Number(ev.PAGE_CNT) === Number(pageNo)
          );

          for (const part of parts) {
            const eventSno = parseEventSnoFromFilename(part.filename);
            if (!eventSno) continue;

            const addEvent = [...pageEvents]
              .reverse()
              .find(
                ev =>
                  Number(ev.EVENT_TYP_SQNO) === 3 &&
                  Number(ev.EVENT_SNO) === Number(eventSno)
              );

            if (!addEvent) continue;

            const pageKey = getEventPageKey(addEvent);
            if (!pageKey) continue;

            if (!nextStrokePathByPageKey[pageKey]) {
              nextStrokePathByPageKey[pageKey] = {};
            }

            const strokeSeq =
              addEvent.STRK_SEQ == null ? null : Number(addEvent.STRK_SEQ);

            const strokeColor = addEvent.STROKE?.LINE_SNO ?? null;
            const strokeWidth = addEvent.STROKE?.LINE_ETT ?? null;

            const decoded = decodeStrokeBinary(
              part.body,
              strokeColor,
              strokeWidth,
              strokeSeq
            );

            const safeStrokeSeq = strokeSeq ?? eventSno;

            if (decoded) {
              nextStrokePathByPageKey[pageKey][safeStrokeSeq] = {
                ...decoded,
                id: safeStrokeSeq,
              };
            }
          }
        }

        setStrokePathByPage(nextStrokePathByPageKey);
      } catch (err) {
        console.error('[ReplayViewerPage] load failed', err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [chckSno, pwplId]);

  useEffect(() => {
    if (!basePages.length) return;

    const nextState = buildReplayState(events, playheadIndex);
    setLogicalPages(nextState.logicalPages);
    setPathDataByPage(nextState.pathDataByPage);
    setReplayAttachmentsByPage(nextState.attachmentsByPage);

    // console.log('[replay] next attachmentsByPage', nextState.attachmentsByPage);

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

  useEffect(() => {
    if (!showReplayInfoPanel) return;
    if (playheadIndex < 0) return;

    const activeEl = replayItemRefs.current[playheadIndex];
    if (!activeEl) return;

    activeEl.scrollIntoView({
      block: 'nearest',
      behavior: isPlaying ? 'smooth' : 'auto',
    });
  }, [playheadIndex, showReplayInfoPanel, isPlaying]);

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

  /*const currentEventTime =
    playheadIndex >= 0 && events[playheadIndex]
      ? events[playheadIndex].EVENT_CRTE_DT
      : '-';*/
  /*const currentEventTime =
    playheadIndex >= 0 && events[playheadIndex]
      ? String(events[playheadIndex].EVENT_CRTE_DT).slice(11, 19)
      : '-';*/
  const currentEventTime =
    playheadIndex >= 0 && events[playheadIndex]
      ? String(events[playheadIndex].EVENT_CRTE_DT)
          .replace('T', ' ')
          .slice(0, 19)
      : '-';

  const replayEventList = events
    .map((event, index) => ({
      event,
      originalIndex: index,
    }))
    .filter(({ event }) =>
      listFilterMode === 'currentPage'
        ? Number(event.PAGE_CNT) === Number(pageInfo.currentPage)
        : true
    )
    .map(({ event, originalIndex }) => {
      const prevEvent = originalIndex > 0 ? events[originalIndex - 1] : null;

      const eventLabel = getReplayEventLabel(event.EVENT_TYP_SQNO);
      const userName = event.USER_FNM?.trim() || event.USER_ID || '';
      const chkprBlngJbpsNm = event.CHKPR_BLNG_JBPS_NM?.trim() || '';
      const pageNo = Number(event.PAGE_CNT);

      const pageText =
        listFilterMode === 'currentPage'
          ? `페이지 ${pageNo}`
          : prevEvent && Number(prevEvent.PAGE_CNT) !== Number(event.PAGE_CNT)
            ? `페이지 이동 ${Number(prevEvent.PAGE_CNT)} → ${Number(event.PAGE_CNT)}`
            : `페이지 ${pageNo}`;

      const timeText = String(event.EVENT_CRTE_DT)
        .replace('T', ' ')
        .slice(0, 19);

      return {
        key: `${event.EVENT_SNO}-${originalIndex}`,
        index: originalIndex,
        displayIndex: originalIndex + 1,
        eventLabel,
        userName,
        chkprBlngJbpsNm,
        pageText,
        timeText,
        isActive: playheadIndex === originalIndex,
      };
    });

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
          hideDialogControls={true}
          hidePdfSave={true}
          hideValueJsonSave={true}
        />
      </div>

      <div className="px-3 py-2 text-xs text-slate-600 bg-slate-50 border-b">
        <div className="flex items-center gap-3">
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
            <option value={10}>10x</option>
            <option value={50}>50x</option>
          </select>

          <span className="text-slate-500">
            {playheadIndex < 0 ? 0 : playheadIndex + 1} / {totalEvents}
          </span>

          <span className="text-slate-500">{currentEventTime}</span>

          {loading && <span className="text-slate-500">불러오는 중...</span>}

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
        </div>
      </div>

      <div
        ref={centerRef}
        className={`flex flex-1 bg-slate-100 ${
          zoomLevel >= 110 ? 'overflow-auto' : 'overflow-hidden'
        }`}
      >
        <div className="flex flex-1 items-start justify-center py-3 overflow-visible">
          <div
            style={{
              position: 'relative',
              width: BASE_W * pageScale,
              height: BASE_H * pageScale,
              transform: `translateX(${
                showReplayInfoPanel ? (replayPanelWidth + 16) / 2 : 0
              }px)`,
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              style={{
                width: BASE_W,
                height: BASE_H,
                transform: `scale(${pageScale})`,
                transformOrigin: 'top left',
              }}
            >
              <ReplayViewerWorkspace
                ref={wsRef}
                scale={pageScale}
                fileUrl={fileUrl ?? undefined}
                logicalPages={logicalPages as any}
                pathDataByPage={pathDataByPage}
                attachmentsByPage={replayAttachmentsByPage}
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
      {/* 🔹 Rule 목록 토글 버튼 & 패널 */}
      <button
        type="button"
        className=" fixed
              left-4
              top-25
              z-40
              px-3
              py-1
              rounded-full
              text-[11px]
              bg-slate-800
              text-slate-100
              border border-slate-600
              hover:bg-slate-700
            "
        onClick={() => setShowReplayInfoPanel(prev => !prev)}
      >
        Replay 목록
      </button>

      {showReplayInfoPanel && (
        <div
          ref={replayPanelRef}
          className=" fixed
          left-4
          top-25
          w-[360px]
          max-h-[80vh]
          bg-slate-900
          text-slate-50
          border border-slate-700
          rounded-xl
          shadow-xl
          p-3
          flex
          flex-col
          gap-2
          z-40
        "
        >
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="text-xs font-semibold">Replay 목록</div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`text-[10px] px-2 py-0.5 rounded ${
                  listFilterMode === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                onClick={() => setListFilterMode('all')}
              >
                전체
              </button>

              <button
                type="button"
                className={`text-[10px] px-2 py-0.5 rounded ${
                  listFilterMode === 'currentPage'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                onClick={() => setListFilterMode('currentPage')}
              >
                현재 페이지
              </button>

              <button
                type="button"
                className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
                onClick={() => setShowReplayInfoPanel(false)}
              >
                닫기
              </button>
            </div>
          </div>

          <div
            ref={replayListBodyRef}
            className="flex-1 overflow-y-auto mt-1 space-y-1.5 pr-1"
          >
            {replayEventList.map(item => (
              <button
                key={item.key}
                ref={el => {
                  replayItemRefs.current[item.index] = el;
                }}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPlayheadIndex(item.index);

                  requestAnimationFrame(() => {
                    moveToEventPage(item.index);
                  });
                }}
                className={`w-full
                  text-left
                  text-[11px]
                  px-3
                  py-1.5
                  rounded
                  border
                  flex
                  flex-col
                  gap-0.5
                  ${
                    item.isActive
                      ? 'bg-sky-900/60 border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700/60 text-slate-100 hover:bg-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">
                    {item.displayIndex}. {item.eventLabel}
                  </span>

                  <span
                    className={`text-[10px] shrink-0 ${
                      item.isActive ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    {item.pageText} / {item.timeText}
                  </span>
                </div>

                <div
                  className={`text-[10px] flex items-center gap-2 ${
                    item.isActive ? 'text-sky-100' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">
                    사용자: {item.userName || '-'}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="truncate">
                    점검자: {item.chkprBlngJbpsNm || '-'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </BaseLayout>
  );
}
