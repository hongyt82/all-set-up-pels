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

function getOriginFromUrl(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

function toImageUrl(url?: string | null, fileBaseUrl?: string) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!fileBaseUrl) return url;
  return `${fileBaseUrl}/${String(url).replace(/^\/+/, '')}`;
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
      pdfPageNo,
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

  const handleLoadedFile = async (file: File, frmOverJson?: string | null) => {
    setPdfFile(file);
    setCurrentFile(file.name);
    setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    setFileUrl(URL.createObjectURL(file));
    wsRef.current?.loadPdfFile(file);

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
      const activeAttachmentsByPage = new Map<number, Map<string, any>>();

      nextLogicalPages.forEach(page => {
        const pageNo = Number(page.page);
        activeAttachmentsByPage.set(pageNo, new Map<string, any>());
      });

      const ensureAttachmentPage = (pageNo: number) => {
        if (!activeAttachmentsByPage.has(pageNo)) {
          activeAttachmentsByPage.set(pageNo, new Map<string, any>());
        }
        return activeAttachmentsByPage.get(pageNo)!;
      };

      const rebuildAttachmentMapByLogicalPages = () => {
        const rebuilt = new Map<number, Map<string, any>>();

        nextLogicalPages.forEach((pg, idx) => {
          const newPageNo = idx + 1;
          const prevPageNo = Number(pg.page);
          rebuilt.set(
            newPageNo,
            activeAttachmentsByPage.get(prevPageNo) ?? new Map<string, any>()
          );
        });

        activeAttachmentsByPage.clear();
        rebuilt.forEach((value, key) => {
          activeAttachmentsByPage.set(key, value);
        });
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

          rebuildAttachmentMapByLogicalPages();
          ensureAttachmentPage(pageNo);

          continue;
        }

        if (eventType === 2) {
          const removeIdx = pageNo - 1;

          if (removeIdx >= 0 && removeIdx < nextLogicalPages.length) {
            nextLogicalPages.splice(removeIdx, 1);

            nextLogicalPages.forEach((pg, idx) => {
              pg.page = idx + 1;
            });

            rebuildAttachmentMapByLogicalPages();
          }

          continue;
        }

        if (eventType === 3 && strokeSeq != null) {
          const set = activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
          set.add(strokeSeq);
          activeStrokeIdsByPage.set(pageNo, set);
          continue;
        }

        if (eventType === 4 && strokeSeq != null) {
          const set = activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
          set.delete(strokeSeq);
          activeStrokeIdsByPage.set(pageNo, set);
          continue;
        }

        if (eventName === 'addAttachment' && attachment?.id) {
          const pageMap = ensureAttachmentPage(pageNo);
          pageMap.set(attachment.id, attachment);
          continue;
        }

        if (eventName === 'changeLayoutAttachment' && attachment?.id) {
          const pageMap = ensureAttachmentPage(pageNo);
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
          const pageMap = ensureAttachmentPage(pageNo);
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
          const pageMap = ensureAttachmentPage(pageNo);
          pageMap.delete(attachment.id);
          continue;
        }
      }

      const nextPathDataByPage: Record<number, TemplatePathData[]> = {};
      const nextAttachmentsByPage: Record<number, any[]> = {};

      nextLogicalPages.forEach(page => {
        const pageNo = Number(page.page);
        const activeIds =
          activeStrokeIdsByPage.get(pageNo) ?? new Set<number>();
        const strokeMap = strokePathByPage[pageNo] ?? {};

        nextPathDataByPage[pageNo] = Array.from(activeIds)
          .map(id => strokeMap[id])
          .filter(Boolean);

        const attachmentMap =
          activeAttachmentsByPage.get(pageNo) ?? new Map<string, any>();

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
    if (!chckSno) return;
    // if (!chckSno || !pwplId) return;

    const load = async () => {
      setLoading(true);
      try {
        const metaRes = await axios.get('/api/Exam_Json_M', {
          params: { CHCK_SNO: chckSno },
          withCredentials: true,
        });

        const { PDF_PATH, FRM_OVER_JSON } = metaRes.data;
        // console.log('[replay] PDF_PATH=', PDF_PATH);
        // console.log('[replay] has FRM_OVER_JSON=', !!FRM_OVER_JSON);

        const origin = getOriginFromUrl(PDF_PATH);
        setFileBaseUrl(origin);

        if (!PDF_PATH) return;

        const isProd = import.meta.env.PROD;
        const viewerFileName = getFilenameFromPath(PDF_PATH);

        if (isProd) {
          const res = await fetch(PDF_PATH);
          const blob = await res.blob();
          const file = new File([blob], viewerFileName, {
            type: 'application/pdf',
          });

          await handleLoadedFile(file, FRM_OVER_JSON);
        } else {
          const pdfRes = await axios.get('/proxy/pdf', {
            params: { path: PDF_PATH },
            responseType: 'blob',
            withCredentials: true,
          });

          // console.log('[replay] pdfRes.status=', pdfRes.status);
          // console.log(
          //   '[replay] pdfRes.content-type=',
          //   pdfRes.headers['content-type']
          // );
          // console.log('[replay] pdfRes.size=', pdfRes.data?.size);

          const file = new File([pdfRes.data], viewerFileName, {
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

          // basePages는 여기서 바로 세팅하지 말고,
          // PDF 로드 후 실제 pdf page 수를 안 다음에 세팅
        }

        const eventRes = await axios.get('/api/events', {
          params: {
            pwplId,
            chckSno: chckSno,
          },
          withCredentials: true,
        });

        // console.log(
        //   '[replay] raw image rows',
        //   (eventRes.data?.data ?? []).filter(
        //     (row: any) =>
        //       Number(row.EVENT_TYP_SQNO) >= 5 && Number(row.EVENT_TYP_SQNO) <= 8
        //   )
        // );
        //
        // console.log(
        //   '[replay] raw image row keys',
        //   (eventRes.data?.data ?? []).find(
        //     (row: any) =>
        //       Number(row.EVENT_TYP_SQNO) >= 5 && Number(row.EVENT_TYP_SQNO) <= 8
        //   ) || null
        // );
        //
        // console.log('[replay] eventRes.status=', eventRes.status);
        // console.log('[replay] eventRes.data=', eventRes.data);

        const fileBaseUrl = getOriginFromUrl(PDF_PATH);

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

        // console.log(
        //   '[replay] mapped image rows',
        //   nextEvents.filter(
        //     ev =>
        //       Number(ev.EVENT_TYP_SQNO) >= 5 && Number(ev.EVENT_TYP_SQNO) <= 8
        //   )
        // );

        setEvents(nextEvents);
        setPlayheadIndex(-1);

        // console.log('[replay] event sample', nextEvents[0]);
        // console.log(
        //   '[replay] image events',
        //   nextEvents.filter(ev => ev.IMAGE?.fileUrl || ev.IMAGE?.url)
        // );
        //
        // console.log('[replay] event sample', nextEvents[0]);
        // console.log(
        //   '[replay] image events',
        //   nextEvents
        //     .filter(
        //       ev =>
        //         Number(ev.EVENT_TYP_SQNO) >= 5 && Number(ev.EVENT_TYP_SQNO) <= 8
        //     )
        //     .map(ev => ({
        //       eventSno: ev.EVENT_SNO,
        //       eventType: ev.EVENT_TYP_SQNO,
        //       id: ev.IMAGE?.id,
        //       x: ev.IMAGE?.x,
        //       y: ev.IMAGE?.y,
        //       width: ev.IMAGE?.width,
        //       height: ev.IMAGE?.height,
        //       fileUrl: ev.IMAGE?.fileUrl,
        //       url: ev.IMAGE?.url,
        //       attachmentEventType: ev.ATTACHMENT_EVENT_TYPE,
        //     }))
        // );

        const pageNos = Array.from(
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

        const nextStrokePathByPage: Record<
          number,
          Record<number, TemplatePathData>
        > = {};

        for (const pageNo of pageNos) {
          const strokeRes = await axios.get('/api/events/strokes', {
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

          nextStrokePathByPage[pageNo] = {};

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

            const strokeSeq =
              addEvent.STRK_SEQ == null ? null : Number(addEvent.STRK_SEQ);

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

            // console.log('[replay] matched addEvent', addEvent);
            //
            // console.log('[replay] decode result', {
            //   pageNo,
            //   filename: part.filename,
            //   eventSno,
            //   strokeSeq,
            //   blobLength: part.body.length,
            //   strokeColor,
            //   strokeWidth,
            //   decoded,
            // });

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
        // console.log('[replay] nextStrokePathByPage', nextStrokePathByPage);
        setStrokePathByPage(nextStrokePathByPage);
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

  const currentReplayEvent =
    playheadIndex >= 0 && events[playheadIndex] ? events[playheadIndex] : null;

  const prevReplayEvent =
    playheadIndex > 0 && events[playheadIndex - 1]
      ? events[playheadIndex - 1]
      : null;

  const currentReplayEventLabel = currentReplayEvent
    ? getReplayEventLabel(currentReplayEvent.EVENT_TYP_SQNO)
    : '처음 상태';

  const currentReplayPageText = currentReplayEvent
    ? `페이지 ${Number(currentReplayEvent.PAGE_CNT)}`
    : '';

  const pageMoveText =
    currentReplayEvent &&
    prevReplayEvent &&
    Number(currentReplayEvent.PAGE_CNT) !== Number(prevReplayEvent.PAGE_CNT)
      ? `페이지 이동 ${Number(prevReplayEvent.PAGE_CNT)} → ${Number(
          currentReplayEvent.PAGE_CNT
        )}`
      : '';

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
          <option value={10}>10x</option>
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
              position: 'relative',
              width: BASE_W * pageScale,
              height: BASE_H * pageScale,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 12,
                // right: -150,
                left: 'calc(100% + 50px)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                alignItems: 'flex-start',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'rgba(15, 23, 42, 0.82)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentReplayEventLabel}
              </div>

              {(currentReplayPageText || pageMoveText) && (
                <div
                  style={{
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.92)',
                    color: '#0f172a',
                    fontSize: 11,
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(148,163,184,0.35)',
                  }}
                >
                  {pageMoveText || currentReplayPageText}
                </div>
              )}
            </div>

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
    </BaseLayout>
  );
}
