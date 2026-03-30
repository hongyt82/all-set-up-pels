// src/pages/ViewerPage.tsx
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { BaseLayout } from '../components/layout/BaseLayout';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { ViewerFooter } from '../components/viewer/ViewerFooter';
import {
  ViewerWorkspace,
  type ViewerWorkspaceHandle,
} from '../components/viewer/ViewerWorkspace';
import type { ConstraintDoc } from '../types/constraints';
import { PDF_BOUNDARY } from '../lib/boundaryUtils';
import type { TemplateDoc, OverlayItem } from '../types';
import { BASE_PAGE_WIDTH } from '../constants/pageSize';

import { saveAs } from 'file-saver';
import {
  PDFDocument,
  pushGraphicsState,
  popGraphicsState,
  setLineWidth,
  setLineCap,
  setLineJoin,
  setStrokingColor,
  setGraphicsState,
  moveTo,
  lineTo,
  stroke,
  rgb,
  PDFName,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import axios from 'axios';
import { useWebSocketRoom } from '../hooks/useWebSocketRoom';

// import NotoUrl from '/fonts/NotoSansKR-Regular.ttf?url';
function getFontUrl() {
  if (import.meta.env.PROD) {
    // 서버 실경로 (운영 서버 구조에 맞춤)
    return '/static/e-link-v2/fonts/NotoSansKR-Regular.ttf';
  }
  // 로컬 dev
  return '/fonts/NotoSansKR-Regular.ttf';
}

const BASE_W = BASE_PAGE_WIDTH;
const BASE_H = Math.round((PDF_BOUNDARY.height / PDF_BOUNDARY.width) * BASE_W);

// Viewer에서 지원하는 컴포넌트 타입만 허용
import type { OverlayType } from '../types';

const SUPPORTED_TYPES: OverlayType[] = [
  // textbox
  'textbox',
  'textbox_ml',
  'textbox_num',
  'textbox_unusing',
  'textbox_name',
  'textbox_verifier',

  // checkbox
  'checkbox',

  // circleslash
  'circleslash',

  // calendar
  'calendar_date',
  'calendar_datetime',

  // signature
  'signature_worker',
  'signature_verifier',

  // extra (Viewer에서 보여줄 거면 유지)
  'satisfactionbox',
  'button_ox',
  'button_oxn',
  'button_oxt',
  'button_oxtn',
];

// type SupportedType = (typeof SUPPORTED_TYPES)[number];
type SupportedType = OverlayType;

// 텍스트박스 폰트/테두리 설정
const TEXTBOX_FONT_PX = 12;
const PX_TO_PT = 0.75; // 1px ≈ 0.75pt
const BOX_BORDER_COLOR = rgb(0.6, 0.6, 0.6);
const BOX_BORDER_W = 0.5;

export function ViewerPage() {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // 실제 업로드된 PDF 파일 (PDF 저장할 때 필요)
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const params = new URLSearchParams(window.location.search);
  const isDbMode = !!params.get('CHCK_SNO');
  const hasPdf = !!pdfFile;

  // 줌 / 스케일
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageScale, setPageScale] = useState(1);

  const [vPages, setVPages] = useState<TemplateDoc['pages']>([]);
  const [overlaysByPage, setOverlaysByPage] = useState<
    Record<number, OverlayItem[]>
  >({});
  type TemplatePathData = {
    id?: number;
    points: number[];
    color?: number;
    strokWidth?: number;
    strokeWidth?: number;
  };

  const [pathDataByPage, setPathDataByPage] = useState<
    Record<number, TemplatePathData[]>
  >({});

  const [attachmentsByPage, setAttachmentsByPage] = useState<
    Record<number, any[]>
  >({});

  // JSON 전체 (값 포함 JSON 저장할 때 필요)
  const [templateDoc, setTemplateDoc] = useState<TemplateDoc | null>(null);

  // PDFWorkspace에서 알려주는 현재/총 페이지
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 0 });

  const wsRef = useRef<ViewerWorkspaceHandle | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

  // ===== 페이지 스케일 계산 (에디터와 동일) =====
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

  const [constraintDoc, setConstraintDoc] = useState<ConstraintDoc | null>(
    null
  );

  // ===== dialog / qr_dialoges 상태 =====
  type ActiveDialog = {
    kind: 'group' | 'qr';
    page: number; // logical page
    dialoges: any[]; // 시간별 dialog 리스트 (항상 배열)
    meta?: any; // qr 객체 등 원본(선택)
  };

  const getConstraintPageNoByLogicalPage = useCallback(
    (logicalPage: number) => {
      const lp = vPages.find(p => Number(p.page) === Number(logicalPage));
      const no = Number((lp as any)?.constraintPageNo);
      return Number.isFinite(no) && no > 0 ? no : null;
    },
    [vPages]
  );

  //필요없으면 삭제
  const getLogicalPageByConstraintPageNo = useCallback(
    (constraintPageNo: number) => {
      const lp = vPages.find(
        p => Number((p as any)?.constraintPageNo) === Number(constraintPageNo)
      );
      return Number(lp?.page ?? 0);
    },
    [vPages]
  );

  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);
  const [dialogTag, setDialogTag] = useState<string | null>(null);
  const [selectedDialogIdx, setSelectedDialogIdx] = useState(0);

  function showDialogGroupInCurrentPage() {
    if (!constraintDoc) return;

    const logicalPage = pageInfo.currentPage;
    const constraintPageNo = getConstraintPageNoByLogicalPage(logicalPage);
    if (!constraintPageNo) return;

    const rulePage = constraintDoc.pages.find(
      p => Number(p.constraintPageNo) === Number(constraintPageNo)
    );

    const dialoges = rulePage?.dialoges;
    if (!dialoges || dialoges.length === 0) return;

    setActiveDialog({
      kind: 'group',
      page: logicalPage,
      dialoges,
    });
    setSelectedDialogIdx(0);
    setDialogTag('DialogGroupInPdfPage');
  }

  function showQrCodeInCurrentPage(barcode?: string) {
    if (!barcode || !constraintDoc) return;
    if (dialogTag === 'QRDialogGroupInPdfPage') return;

    const matches: any[] = [];
    let targetPdfPageNo: number | null = null;

    for (const pg of constraintDoc.pages) {
      const list = pg.qr_dialoges ?? [];

      for (const qr of list) {
        if (qr.qr === barcode) {
          matches.push(qr);

          if (targetPdfPageNo == null) {
            targetPdfPageNo = Number(qr.targetPdfPageNo ?? pg.constraintPageNo);
          }
        }
      }
    }

    if (matches.length === 0) return;
    if (!targetPdfPageNo) return;

    const targetLogicalPage = getLogicalPageByConstraintPageNo(targetPdfPageNo);

    if (!targetLogicalPage) return;

    const first = matches[0];
    const dialoges = first.dialoges ?? first.dialogs ?? matches;

    setActiveDialog({
      kind: 'qr',
      page: targetLogicalPage,
      dialoges,
      meta: first,
    });
    setSelectedDialogIdx(0);
    setDialogTag('QRDialogGroupInPdfPage');
    wsRef.current?.goToPage(targetLogicalPage);
  }

  function showFirstQrDialogInCurrentPage() {
    if (!constraintDoc) return;

    const logicalPage = pageInfo.currentPage;
    const constraintPageNo = getConstraintPageNoByLogicalPage(logicalPage);
    if (!constraintPageNo) return;

    const rulePage = constraintDoc.pages.find(
      p => Number(p.constraintPageNo) === Number(constraintPageNo)
    );

    const qrs: any[] = rulePage?.qr_dialoges ?? [];
    if (qrs.length === 0) return;

    const first = qrs[0];

    const targetPdfPageNo = Number(first.targetPdfPageNo ?? 0);
    const targetLogicalPage = targetPdfPageNo
      ? getLogicalPageByConstraintPageNo(targetPdfPageNo)
      : logicalPage;

    const dialoges = first.dialoges ?? first.dialogs ?? qrs;

    setActiveDialog({
      kind: 'qr',
      page: targetLogicalPage,
      dialoges,
      meta: first,
    });
    setSelectedDialogIdx(0);
    setDialogTag('QRDialogGroupInPdfPage');
    wsRef.current?.goToPage(targetLogicalPage);
  }

  const [hasDialogInPage, setHasDialogInPage] = useState(false);
  const [hasQrInPage, setHasQrInPage] = useState(false);

  type ChatMsg = { ts: number; from?: string; text: string };

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMsg[]>([]);
  const seenChatKeysRef = useRef<Set<string>>(new Set());

  type Participant = { USER_ID: string; USER_NAME: string; DEPT_NM: string };
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // onChat 콜백 클로저 이슈 방지용
  const chatOpenRef = useRef(false);
  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  //채팅시 스크롤 제어
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!chatOpen) return;

    requestAnimationFrame(() => {
      const el = chatScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }, [chatOpen, chatLog.length]);

  // ==========================
  // WebSocket 식별자 구성 + 수신 반영 + hook 호출
  // ==========================
  const DOC_ID =
    params.get('DOC_ID') ||
    params.get('docId') ||
    params.get('DOC') ||
    params.get('CHCK_SNO') ||
    'UNKNOWN';

  const roomId = `DOC${DOC_ID}`;

  // 11111
  function genClientKey(prefix = 'WEB') {
    const c: any = globalThis.crypto;

    // 1) randomUUID 가능하면 사용
    if (c && typeof c.randomUUID === 'function') {
      return `${prefix}_${c.randomUUID()}`;
    }

    // 2) getRandomValues로 UUID v4 형태 만들어서 사용
    if (c && typeof c.getRandomValues === 'function') {
      const buf = new Uint8Array(16);
      c.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const hex = [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
      const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      return `${prefix}_${uuid}`;
    }

    // 3) 최후 fallback
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  }

  function getOrCreateClientKey() {
    const key = 'viewer_clientKey';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const v = genClientKey('WEB');
    localStorage.setItem(key, v);
    return v;
  }

  //  기존 clientKey 선언 교체
  const clientKey = getOrCreateClientKey();

  // 1111

  const user = useMemo(
    () => ({
      USER_ID: localStorage.getItem('viewer_USER_ID') || 'WEB_DUMMY',
      USER_NAME: localStorage.getItem('viewer_USER_NAME') || 'WEB_VIEWER',
      DEPT_NM: localStorage.getItem('viewer_DEPT_NM') || 'WEB',
    }),
    []
  );

  // echo 방지용: 수신으로 페이지 이동했을 때는 다음 1회 송신 스킵
  const suppressNextOutboundMoveRef = useRef(false);

  const pendingRoomStateRef = useRef<{
    lastPage?: number;
    formValues?: any[];
  } | null>(null);

  // setForm이 overlays 준비 전에 오면 버려지므로, 잠시 쌓아두는 큐
  const pendingSetFormsRef = useRef<
    Array<{
      formId: string;
      page: number;
      value: string;
      type?: string;
      raw?: any;
    }>
  >([]);

  // (선택) 초기 roomState로 동기화 완료되기 전까지 outbound movePage 막고 싶으면
  const hasSyncedFromRoomStateRef = useRef(false);

  // roomState가 아예 안 오면 fallback으로 outbound 허용(첫 입장 방)
  const roomStateFallbackTimerRef = useRef<number | null>(null);
  const applyIncomingMovePage = useCallback((logicalPage: number) => {
    const n = Number(logicalPage);
    if (!Number.isFinite(n) || n <= 0) return;

    suppressNextOutboundMoveRef.current = true;
    wsRef.current?.goToPage(n);
  }, []);

  const applyIncomingSetForm = useCallback(
    (p: {
      formId: string;
      page: number;
      value: string;
      type?: string;
      raw?: any;
    }) => {
      const logicalPage = Number(p.page);

      if (String(p.type || '').toLowerCase() === 'drawing') {
        let obj: any;
        try {
          obj = typeof p.value === 'string' ? JSON.parse(p.value) : p.value;
        } catch {
          return;
        }

        const incoming: any[] = Array.isArray(obj?.paths)
          ? obj.paths
          : obj && Array.isArray(obj.points) && obj.points.length > 0
            ? [obj]
            : Array.isArray(obj)
              ? obj
              : [];

        //  지우기/삭제 판정 (모바일 points:[] 케이스 처리)
        const isPointsEmpty =
          Array.isArray(obj?.points) && obj.points.length === 0;
        const hasStrokeId = obj?.id != null && String(obj.id) !== '';

        const isClearAll =
          (Array.isArray(obj?.paths) && obj.paths.length === 0) ||
          (isPointsEmpty && !hasStrokeId);

        // 1) 전체 clear
        if (isClearAll) {
          setPathDataByPage(prev => ({ ...prev, [logicalPage]: [] }));
          if (import.meta.env.DEV)
            console.log('[DRAW CLEAR ALL]', { logicalPage });
          return;
        }

        // 2) 특정 stroke 삭제 (points:[] + id 있음)
        if (isPointsEmpty && hasStrokeId) {
          const delId = String(obj.id);
          setPathDataByPage(prev => {
            const cur = prev[logicalPage] ?? [];
            const next = cur.filter(
              s => String((s as any)?.id ?? '') !== delId
            );
            if (import.meta.env.DEV)
              console.log('[DRAW DELETE ONE]', {
                logicalPage,
                delId,
                before: cur.length,
                after: next.length,
              });
            return { ...prev, [logicalPage]: next };
          });
          return;
        }

        setPathDataByPage(prev => {
          const cur = prev[logicalPage] ?? [];

          // id 기준 dedupe (같은 stroke 재수신 방지)
          const seen = new Set(cur.map(x => String((x as any)?.id ?? '')));
          const next = [...cur];

          for (const s of incoming) {
            const id = String(s?.id ?? '');
            if (id && seen.has(id)) continue;
            next.push(s);
            if (id) seen.add(id);
          }

          // 여기서 확인할 로그
          if (import.meta.env.DEV) {
            console.log('[DRAW APPLY]', {
              logicalPage,
              added: incoming.length,
              total: next.length,
            });
          }

          return { ...prev, [logicalPage]: next };
        });

        return;
      }

      if (String(p.type || '').toLowerCase() === 'auditorbox') {
        const logicalPage = Number(p.page);

        setAttachmentsByPage(prev => {
          const list = prev[logicalPage] ?? [];

          const nextItem = {
            id: String(p.formId ?? ''),
            type: 'auditorbox',
            text: String(p.value ?? ''),
            x: Number(p.raw?.x ?? 100),
            y: Number(p.raw?.y ?? 100),
            width: Number(p.raw?.width ?? 190),
            height: Number(p.raw?.height ?? 78),
          };

          const found = list.some(
            item =>
              String(item.id) === String(nextItem.id) &&
              String(item.type) === 'auditorbox'
          );

          const next = found
            ? list.map(item =>
                String(item.id) === String(nextItem.id) &&
                String(item.type) === 'auditorbox'
                  ? { ...item, ...nextItem }
                  : item
              )
            : [...list, nextItem];

          return {
            ...prev,
            [logicalPage]: next,
          };
        });

        return;
      }

      type PageItem = TemplateDoc['pages'][number];

      if (String(p.type || '').toLowerCase() === 'addpage') {
        const insertAt = Number(p.value ?? p.page ?? 0);

        if (!Number.isFinite(insertAt) || insertAt <= 0) return;

        setVPages(prev => {
          if (!Array.isArray(prev) || prev.length === 0) return prev;

          const idx = Math.max(0, Math.min(prev.length, insertAt - 1));

          const blankPage: PageItem = {
            page: insertAt,
            width: prev[0]?.width ?? BASE_W,
            height: prev[0]?.height ?? BASE_H,
            isChange: 'N',
            components: [],
            pdfPageNo: -1,
            constraintPageNo: -1,
            attachments: [],
          };

          const inserted: PageItem[] = [
            ...prev.slice(0, idx),
            blankPage,
            ...prev.slice(idx),
          ];

          return inserted.map((pg, i) => ({
            ...pg,
            page: i + 1,
          }));
        });

        setOverlaysByPage(prev => {
          const next: Record<number, OverlayItem[]> = {};
          Object.entries(prev).forEach(([key, value]) => {
            const pageNo = Number(key);
            next[pageNo >= insertAt ? pageNo + 1 : pageNo] = value.map(
              item => ({
                ...item,
                page: pageNo >= insertAt ? pageNo + 1 : pageNo,
              })
            );
          });
          next[insertAt] = [];
          return next;
        });

        setAttachmentsByPage(prev => {
          const next: Record<number, any[]> = {};
          Object.entries(prev).forEach(([key, value]) => {
            const pageNo = Number(key);
            next[pageNo >= insertAt ? pageNo + 1 : pageNo] = value;
          });
          next[insertAt] = [];
          return next;
        });

        setPathDataByPage(prev => {
          const next: Record<number, TemplatePathData[]> = {};
          Object.entries(prev).forEach(([key, value]) => {
            const pageNo = Number(key);
            next[pageNo >= insertAt ? pageNo + 1 : pageNo] = value;
          });
          next[insertAt] = [];
          return next;
        });

        return;
      }

      setOverlaysByPage(prev => {
        const list = prev[logicalPage] ?? [];

        // overlays가 아직 준비 전이면 일단 큐에 쌓고 나중에 flush
        if (list.length === 0) {
          pendingSetFormsRef.current.push(p);
          if (import.meta.env.DEV) {
            console.log('[setForm] queued (overlays not ready)', {
              logicalPage,
              // pdfPageNo,
              formId: p.formId,
              type: p.type,
              value: p.value,
            });
          }
          return prev;
        }

        if (import.meta.env.DEV) {
          const has = list.some(o => String(o.id) === String(p.formId));
          if (!has)
            console.warn('[setForm] id not found', {
              logicalPage,
              formId: p.formId,
              sampleIds: list.slice(0, 10).map(o => o.id),
            });
        }

        const next = list.map(o => {
          if (String(o.id) !== String(p.formId)) return o;

          let v = String(p.value ?? '');
          if (o.type === 'checkbox') {
            const low = v.trim().toLowerCase();
            if (low === '1' || low === 'true') v = 'y';
            if (low === '0' || low === 'false') v = 'n';
          }
          return { ...o, value: v };
        });

        return { ...prev, [logicalPage]: next };
      });
    },
    [getLogicalPageByConstraintPageNo]
  );

  // const wsUrl = (() => {
  //   const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  //   const host = window.location.hostname; // localhost 또는 192.168.0.20
  //   return `${proto}://${host}:8600`;
  // })();

  // const wsUrl = import.meta.env.VITE_SYNC_WS_URL as string;

  const wsUrl =
    (import.meta.env.VITE_SYNC_WS_URL as string) ||
    (() => {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.hostname; // 192.168.0.20 / localhost / 도메인
      return `${proto}://${host}:8600`;
    })();

  const wsRoom = useWebSocketRoom({
    wsUrl,
    roomId,
    clientKey,
    user,

    onRoomState: rs => {
      if (!vPages.length) {
        pendingRoomStateRef.current = rs;
        return;
      }

      hasSyncedFromRoomStateRef.current = true;

      if (rs.lastPage && rs.lastPage > 0) {
        lastSentPdfPageNoRef.current = Number(rs.lastPage);
        applyIncomingMovePage(rs.lastPage);
      }

      const list = rs.formValues || [];

      //  drawing은 page별로 모아서 한번에 apply (중복/순서 안정화)
      const drawByPage: Record<number, any[]> = {};

      for (const fv of list) {
        const type = String(fv.type ?? '').toLowerCase();
        if (type !== 'drawing') continue;

        const page = Number(fv.page ?? 0);
        if (!page) continue;

        let obj: any;
        try {
          obj = typeof fv.value === 'string' ? JSON.parse(fv.value) : fv.value;
        } catch {
          continue;
        }

        const strokes = Array.isArray(obj?.paths)
          ? obj.paths
          : obj && Array.isArray(obj.points)
            ? [obj]
            : Array.isArray(obj)
              ? obj
              : [];

        (drawByPage[page] ||= []).push(...strokes);
      }

      // drawing 먼저 적용
      Object.entries(drawByPage).forEach(([pdfPage, strokes]) => {
        applyIncomingSetForm({
          formId: 'drawing',
          page: Number(pdfPage),
          value: JSON.stringify({ paths: strokes }),
          type: 'drawing',
        });
      });

      // 나머지 폼 적용
      list.forEach((fv: any) => {
        const type = String(fv.type ?? '').toLowerCase();
        if (type === 'drawing') return;

        // DB 최종 JSON(pages)에 이미 반영된 페이지 구조는 roomState로 다시 적용하지 않음
        if (isDbMode && (type === 'addpage' || type === 'deletepage')) return;

        applyIncomingSetForm({
          formId: String(fv.formId ?? ''),
          page: Number(fv.page ?? 0),
          value: String(fv.value ?? ''),
          type: fv.type ? String(fv.type) : undefined,
          raw: fv.raw,
        });
      });
    },

    // onMovePage: ({ page }) => applyIncomingMovePage(page),
    onMovePage: ({ page }) => {
      //디버깅
      if (import.meta.env.DEV)
        console.log('[movePage] IN  constraintPageNo=', page);
      applyIncomingMovePage(page);
    },

    onSetForm: payload => applyIncomingSetForm(payload),

    onChat: chat => {
      const from = String(chat?.senderName ?? 'unknown');
      const text = String(chat?.message ?? '');
      const createdAt = String(chat?.createdAt ?? '');
      const senderId = String(chat?.senderId ?? '');
      const clientKeyInMsg = String(chat?.clientKey ?? '');

      const key = `${createdAt}|${senderId}|${clientKeyInMsg}|${text}`;
      if (seenChatKeysRef.current.has(key)) return;
      seenChatKeysRef.current.add(key);

      setChatLog(prev => [...prev, { ts: Date.now(), from, text }]);

      // 내가 보낸 건 unread로 안 잡기
      const isMe =
        String(chat?.senderId ?? '') === String(user.USER_ID) ||
        String(chat?.clientKey ?? '') === String(clientKey);

      if (!isMe && !chatOpenRef.current) {
        setUnreadChatCount(c => c + 1);
      }
    },

    onClientList: ({ users }) => {
      setParticipants(users || []);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV)
      console.log('[WS OPEN?]', wsRoom.isOpen, wsUrl, roomId);
    if (wsRoom.isOpen) {
      wsRoom.requestClientList(); // 열리자마자 한번 더 요청
    }
  }, [wsRoom.isOpen]);

  // roomState 미수신 fallback: 일정 시간 지나면 "동기화 완료"로 간주
  useEffect(() => {
    // 이미 동기화 끝났으면 필요 없음
    if (hasSyncedFromRoomStateRef.current) return;

    // 타이머 중복 방지
    if (roomStateFallbackTimerRef.current != null) return;

    roomStateFallbackTimerRef.current = window.setTimeout(() => {
      // vPages가 아직 없으면 더 기다렸다가 vPages 생기면 pending 처리 useEffect가 실행됨
      if (!vPages.length) {
        roomStateFallbackTimerRef.current = null;
        return;
      }

      // roomState가 끝내 안 온 경우: "빈 상태"로 동기화 완료 처리
      hasSyncedFromRoomStateRef.current = true;

      // 핵심: 첫 브로드캐스트가 1페이지로 나가서 방 전체를 덮는 것 방지
      const logical = pageInfo.currentPage;
      lastSentPdfPageNoRef.current = logical;

      roomStateFallbackTimerRef.current = null;
    }, 1200); // 0.8~1.5s 사이 추천 (서버 응답/네트워크 고려)
  }, [vPages.length]);

  useEffect(() => {
    return () => {
      if (roomStateFallbackTimerRef.current != null) {
        clearTimeout(roomStateFallbackTimerRef.current);
        roomStateFallbackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const pending = pendingRoomStateRef.current;
    if (!pending || !vPages.length) return;

    pendingRoomStateRef.current = null;
    hasSyncedFromRoomStateRef.current = true;

    if (pending.lastPage && pending.lastPage > 0)
      applyIncomingMovePage(pending.lastPage);

    (pending.formValues || []).forEach((fv: any) =>
      applyIncomingSetForm({
        formId: String(fv.formId ?? ''),
        page: Number(fv.page ?? 0),
        value: String(fv.value ?? ''),
        type: fv.type ? String(fv.type) : undefined,
        raw: fv.raw,
      })
    );
  }, [vPages, applyIncomingMovePage, applyIncomingSetForm]);

  // overlaysByPage / vPages 준비 이후, 큐에 쌓인 setForm 재적용
  useEffect(() => {
    if (!vPages.length) return;

    const q = pendingSetFormsRef.current;
    if (!q.length) return;

    // 한 번에 털기 (재진입 방지)
    pendingSetFormsRef.current = [];

    if (import.meta.env.DEV) {
      console.log('[setForm] flush pending queue', q.length);
    }

    q.forEach(p => applyIncomingSetForm(p));
  }, [vPages.length, overlaysByPage, applyIncomingSetForm]);

  const lastSentPdfPageNoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!constraintDoc) {
      setHasDialogInPage(false);
      setHasQrInPage(false);
      return;
    }

    const logicalPage = pageInfo.currentPage;
    // const constraintPageNo = getPdfPageNoByLogicalPage(logicalPage); 확인필요hyt
    const constraintPageNo = getConstraintPageNoByLogicalPage(logicalPage);

    if (!constraintPageNo) {
      setHasDialogInPage(false);
      setHasQrInPage(false);
      return;
    }

    const rulePage = constraintDoc.pages?.find(
      p => Number(p.constraintPageNo) === Number(constraintPageNo)
    );

    setHasDialogInPage(!!rulePage?.dialoges?.length);
    setHasQrInPage(!!rulePage?.qr_dialoges?.length);
  }, [pageInfo.currentPage, constraintDoc, getConstraintPageNoByLogicalPage]);

  // ==========================
  // 페이지 이동 브로드캐스트 (WEB -> Room)
  // ==========================

  const IS_VIEWER_READONLY = true;

  useEffect(() => {
    if (IS_VIEWER_READONLY) return; //웹을 “read-only client”로
    if (!wsRoom.isOpen) return;
    if (!hasSyncedFromRoomStateRef.current) return;

    if (suppressNextOutboundMoveRef.current) {
      suppressNextOutboundMoveRef.current = false;
      return;
    }

    const logical = pageInfo.currentPage;
    if (!logical || logical <= 0) return;

    // 중복 constraintPageNo 문제 회피: "논리 페이지"를 그대로 전송
    if (lastSentPdfPageNoRef.current === logical) return; // (이 ref는 이름만 pdf지만 그대로 써도 됨)
    lastSentPdfPageNoRef.current = logical;

    if (import.meta.env.DEV) {
      console.log('[movePage] OUT logical', { logical });
    }

    const ok = wsRoom.sendMovePage(logical);
    if (import.meta.env.DEV && !ok) {
      console.log('[movePage] sendMovePage skipped (ws not open)');
    }
  }, [pageInfo.currentPage, wsRoom.isOpen, wsRoom.sendMovePage]);

  // ===============================
  // ViewerPage – DB 로딩 + Rule 공용 처리
  // ===============================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const CHCK_SNO = params.get('CHCK_SNO');
    if (!CHCK_SNO) return;

    const isProd = import.meta.env.PROD;

    const load = async () => {
      const metaRes = await axios.get('/api/Exam_Json_M.do', {
        params: { CHCK_SNO },
        withCredentials: true,
      });

      const { PDF_PATH, FRM_OVER_JSON, FRM_CONS_JSON } = metaRes.data;
      if (!PDF_PATH) return;

      if (isProd) {
        // 서버에서도 PDF를 File 로 만들어야 함
        const res = await fetch(PDF_PATH);
        const blob = await res.blob();

        const file = new File([blob], 'viewer.pdf', {
          type: 'application/pdf',
        });

        setPdfFile(file);
        setCurrentFile('viewer.pdf');
        setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
        setFileUrl(URL.createObjectURL(file));

        wsRef.current?.loadPdfFile(file);
      } else {
        // 로컬에서만 proxy 사용
        const pdfRes = await axios.get('/proxy/pdf', {
          params: { path: PDF_PATH },
          responseType: 'blob',
          withCredentials: true,
        });

        const file = new File([pdfRes.data], 'viewer.pdf', {
          type: 'application/pdf',
        });

        // 디버깅
        const ct = pdfRes.headers?.['content-type'];
        console.log(
          '[PDF PROXY] content-type=',
          ct,
          'size=',
          pdfRes.data?.size
        );

        const textHead = await (pdfRes.data as Blob).slice(0, 50).text();
        console.log('[PDF PROXY] head=', JSON.stringify(textHead));

        setPdfFile(file);
        setCurrentFile('viewer.pdf');
        setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
        setFileUrl(URL.createObjectURL(file));

        wsRef.current?.loadPdfFile(file);
      }

      if (FRM_OVER_JSON) {
        const parsed = JSON.parse(FRM_OVER_JSON);

        const templateJson = {
          ...(parsed.doc || {}),
          pages: parsed.pages || [],
        };

        const json = templateJson as TemplateDoc;
        setTemplateDoc(json);
        setVPages(json.pages || []);

        const pathMap: Record<number, TemplatePathData[]> = {};
        (parsed.pages || []).forEach((pg: any) => {
          if (Array.isArray(pg.pathData)) {
            pathMap[pg.page] = pg.pathData;
          }
        });
        setPathDataByPage(pathMap);

        const attachmentMap: Record<number, any[]> = {};
        (parsed.pages || []).forEach((pg: any) => {
          attachmentMap[pg.page] = Array.isArray(pg.attachments)
            ? pg.attachments
            : [];
        });
        setAttachmentsByPage(attachmentMap);

        console.log('[ViewerPage] pathDataByPage', pathMap);

        const map: Record<number, OverlayItem[]> = {};
        (json.pages || []).forEach(pg => {
          const W = pg.width || BASE_W;
          const H = pg.height || BASE_H;

          (pg.components || []).forEach((c, i) => {
            if (!SUPPORTED_TYPES.includes(c.type as any)) return;

            const xPct = typeof c.xPct === 'number' ? c.xPct : (c.x ?? 0) / W;
            const yPct = typeof c.yPct === 'number' ? c.yPct : (c.y ?? 0) / H;
            const wPct =
              typeof c.wPct === 'number' ? c.wPct : (c.width ?? 0) / W;
            const hPct =
              typeof c.hPct === 'number' ? c.hPct : (c.height ?? 0) / H;

            (map[pg.page] ||= []).push({
              uid: `${c.type}-${Date.now()}-${Math.random()}`,
              id: String(c.id ?? `${pg.page}-${i}`),
              type: c.type as any,
              page: pg.page,
              xPct,
              yPct,
              wPct,
              hPct,
              value: c.value || '',
            });
          });
        });

        setOverlaysByPage(map);
      }

      if (FRM_CONS_JSON) {
        applyRuleJsonObject(JSON.parse(FRM_CONS_JSON));
      }
    };

    load().catch(err => {
      console.error('[Viewer][DB] load failed', err);
    });
  }, []);

  // ===============================
  // Rule 적용 (파일 / DB 공용)
  // ===============================

  const applyRuleJsonObject = (obj: any) => {
    // 템플릿 JSON 차단
    if (obj?.pages?.[0]?.components?.[0]?.type) {
      console.error('[Rule] template json detected');
      return;
    }

    if (!obj || !Array.isArray(obj.pages)) {
      console.error('[Rule] invalid rule json');
      return;
    }

    if (!obj.docId) obj.docId = 'UNKNOWN';

    console.log('[Rule] apply', {
      pages: obj.pages.length,
      treelist: obj.treelist?.length,
    });

    setConstraintDoc(obj);
  };

  // ===============================
  // Rule JSON 파일 불러오기
  // ===============================

  const handlePickConstraintJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || ''));
        applyRuleJsonObject(obj);
      } catch (e) {
        console.error('[Rule] parse failed', e);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

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

  // ===== 줌 컨트롤 (25% ~ 200%) =====
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 25));

  // ===== 페이지 이동 (Footer → ViewerWorkspace 핸들 호출) =====
  const handlePrevPage = () => wsRef.current?.goPrevPage();
  const handleNextPage = () => wsRef.current?.goNextPage();
  const handlePageChange = (target: number) => wsRef.current?.goToPage(target);

  // ==========================
  //   값 포함 JSON 구성
  // ==========================
  const buildFilledJson = () => {
    if (!templateDoc) return null;

    const base: any = { ...templateDoc };

    const pages = (vPages || []).map(pg => {
      const W = pg.width || BASE_W;
      const H = pg.height || BASE_H;
      const items = overlaysByPage[pg.page] || [];

      const components = items.map(o => ({
        id: o.id,
        type: o.type,
        x: Math.round(o.xPct * W),
        y: Math.round(o.yPct * H),
        width: Math.round(o.wPct * W),
        height: Math.round(o.hPct * H),
        xPct: o.xPct,
        yPct: o.yPct,
        wPct: o.wPct,
        hPct: o.hPct,
        value: o.value ?? '',
      }));

      return {
        ...pg,
        width: W,
        height: H,
        isChange: components.length > 0 ? 'Y' : 'N',
        components,
        pathData: pathDataByPage[pg.page] || [],
      };
    });

    base.pages = pages;

    const now = new Date();
    const z = (n: number) => String(n).padStart(2, '0');
    const nowStr = `${now.getFullYear()}-${z(
      now.getMonth() + 1
    )}-${z(now.getDate())} ${z(now.getHours())}:${z(
      now.getMinutes()
    )}:${z(now.getSeconds())}`;

    base.updateDate = nowStr;
    if (!base.createDate) {
      base.createDate = nowStr;
    }

    return base as TemplateDoc;
  };

  // ==========================
  //   값 포함 JSON 저장
  // ==========================
  const handleSaveJsonWithValues = () => {
    const data = buildFilledJson();
    if (!data) {
      alert('JSON 템플릿이 없습니다. 먼저 JSON을 불러와 주세요.');
      return;
    }

    const baseName =
      (currentFile?.replace(/\.[^/.]+$/, '') || 'filled_template') +
      '_with_values';
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${baseName}.json`);
  };

  // ==========================
  //   서식화된 PDF 저장
  // ==========================
  const handleSavePdf = async () => {
    const argbIntToRgbaParts = (color: number) => {
      const u = color >>> 0;
      const a = ((u >> 24) & 0xff) / 255;
      const r = ((u >> 16) & 0xff) / 255;
      const g = ((u >> 8) & 0xff) / 255;
      const b = (u & 0xff) / 255;
      return { r, g, b, a };
    };

    let sourcePdf: File | null = pdfFile;

    if (!sourcePdf) {
      alert('PDF 파일이 로드되지 않았습니다. 먼저 PDF를 불러와 주세요.');
      return;
    }

    const data = buildFilledJson();
    if (!data) {
      alert(
        'JSON 템플릿이 없습니다. JSON을 불러오고 값을 입력한 후 다시 시도해 주세요.'
      );
      return;
    }

    const defaultBase =
      currentFile?.replace(/\.[^/.]+$/, '') || 'formatted_pdf';
    const fileName =
      window.prompt(
        '서식화된 PDF 파일명을 입력하세요 (확장자 제외):',
        defaultBase
      ) || '';
    if (!fileName.trim()) return;

    try {
      const arrayBuffer = await sourcePdf.arrayBuffer();
      const pdfDocLib = await PDFDocument.load(arrayBuffer);
      pdfDocLib.registerFontkit(fontkit);

      // 한글 포함 폰트 임베드
      let unicodeFont: any | undefined;
      try {
        const fontUrl = getFontUrl();
        const res = await fetch(fontUrl);
        if (!res.ok) {
          throw new Error(`Font load failed: ${fontUrl}`);
        }
        const bytes = new Uint8Array(await res.arrayBuffer());
        unicodeFont = await pdfDocLib.embedFont(bytes, { subset: false });
      } catch (e) {
        console.warn(
          'NotoSansKR 임베드 실패 — pdf-lib 기본 폰트로 진행합니다.',
          e
        );
      }

      // 각 페이지별 컴포넌트 그리기
      for (const pg of data.pages as any[]) {
        const realNo =
          typeof pg.constraintPageNo === 'number' && pg.constraintPageNo > 0
            ? // ? pg.constraintPageNo
              pg.pdfPageNo
            : null;
        if (!realNo) continue; // 가상 페이지는 스킵

        const pageCount = pdfDocLib.getPageCount();
        const pageIndex = Math.min(Math.max(realNo - 1, 0), pageCount - 1);

        const page = pdfDocLib.getPage(pageIndex);

        const pageW = page.getWidth();
        const pageH = page.getHeight();

        for (const c of pg.components as any[]) {
          const w = c.wPct * pageW;
          const h = c.hPct * pageH;
          const x = c.xPct * pageW;
          const y = pageH - (c.yPct * pageH + h); // PDF 좌표계 변환

          switch (c.type) {
            case 'textbox': {
              page.drawRectangle({
                x,
                y,
                width: w,
                height: h,
                borderColor: BOX_BORDER_COLOR,
                borderWidth: BOX_BORDER_W,
              });

              const txt = String(c.value ?? '');
              if (!txt) break;

              const size = TEXTBOX_FONT_PX * PX_TO_PT;
              const lineHeight = size * 1.25;
              const padding = 0;
              const maxWidth = Math.max(4, w - padding * 2);

              const wrapWidth = (s: string) =>
                unicodeFont
                  ? unicodeFont.widthOfTextAtSize(s, size)
                  : s.length * size * 0.6;

              const wrapLines = (text: string) => {
                const out: string[] = [];
                const paragraphs = text.replace(/\r\n?/g, '\n').split('\n');

                for (const p of paragraphs) {
                  if (p === '') {
                    out.push('');
                    continue;
                  }
                  const hasSpace = /\s/.test(p);
                  const tokens = hasSpace ? p.split(/\s+/) : Array.from(p);
                  let line = '';

                  for (const token of tokens) {
                    const sep = hasSpace && line ? ' ' : '';
                    const test = line + sep + token;
                    const width = wrapWidth(test);

                    if (width <= maxWidth) {
                      line = test;
                    } else {
                      if (line) out.push(line);

                      if (hasSpace && token.length > 1) {
                        let chunk = '';
                        for (const ch of token) {
                          const t = chunk + ch;
                          if (wrapWidth(t) <= maxWidth) chunk = t;
                          else {
                            if (chunk) out.push(chunk);
                            chunk = ch;
                          }
                        }
                        line = chunk;
                      } else {
                        line = token;
                      }
                    }
                  }
                  if (line) out.push(line);
                }
                return out;
              };

              const lines = wrapLines(txt);
              const totalH = lines.length * lineHeight;
              const baseY =
                y + (h - totalH) / 2 + ((lineHeight - size) * 0.5 || 0);

              lines.forEach((line, i) => {
                page.drawText(line, {
                  x: x + padding,
                  y: baseY + (lines.length - 1 - i) * lineHeight,
                  size,
                  font: unicodeFont,
                  color: rgb(0, 0, 0),
                });
              });
              break;
            }

            case 'checkbox': {
              const s = Math.min(w, h);
              const ix = x;
              const iy = y + (h - s);

              page.drawRectangle({
                x: ix,
                y: iy,
                width: s,
                height: s,
                borderColor: BOX_BORDER_COLOR,
                borderWidth: BOX_BORDER_W,
              });

              const checked = String(c.value || '').toLowerCase() === 'y';
              if (checked) {
                const t = Math.max(1, s * 0.16);
                const x1 = ix + s * 0.26,
                  y1 = iy + s * 0.56;
                const x2 = ix + s * 0.46,
                  y2 = iy + s * 0.34;
                const x3 = ix + s * 0.78,
                  y3 = iy + s * 0.7;

                page.drawLine({
                  start: { x: x1, y: y1 },
                  end: { x: x2, y: y2 },
                  thickness: t,
                  color: rgb(0, 0, 0),
                });
                page.drawLine({
                  start: { x: x2, y: y2 },
                  end: { x: x3, y: y3 },
                  thickness: t,
                  color: rgb(0, 0, 0),
                });

                const capR = t / 2;
                page.drawCircle({
                  x: x1,
                  y: y1,
                  size: capR,
                  color: rgb(0, 0, 0),
                });
                page.drawCircle({
                  x: x2,
                  y: y2,
                  size: capR,
                  color: rgb(0, 0, 0),
                });
                page.drawCircle({
                  x: x3,
                  y: y3,
                  size: capR,
                  color: rgb(0, 0, 0),
                });
              }
              break;
            }

            case 'circleslash': {
              const cx = x + w / 2;
              const cy = y + h / 2;

              // 페이지 기준 고정 크기
              const base = Math.min(pageW, pageH);
              const r = base * 0.015; // 원 반지름
              const tCircle = base * 0.004; // 원 두께
              const tSlash = base * 0.006; // 슬래시 두께

              const v = String(c.value ?? '')
                .trim()
                .toLowerCase();

              if (v === '') break;

              if (v === 'na') {
                page.drawText('N/A', {
                  x: cx - r * 1.2,
                  y: cy - r * 0.5,
                  size: r * 1.6,
                  font: unicodeFont,
                  color: rgb(0, 0, 0),
                });
                break;
              }

              // 원
              page.drawCircle({
                x: cx,
                y: cy,
                size: r,
                borderColor: rgb(0, 0, 0),
                borderWidth: tCircle,
              });

              // 슬래시
              if (v === 'cs') {
                const k = Math.SQRT1_2;
                const px = r * k;
                const py = r * k;

                page.drawLine({
                  start: { x: cx + px, y: cy + py },
                  end: { x: cx - px, y: cy - py },
                  thickness: tSlash,
                  color: rgb(0, 0, 0),
                });
              }

              break;
            }

            case 'calendar_date':
            case 'calendar_datetime': {
              page.drawRectangle({
                x,
                y,
                width: w,
                height: h,
                borderColor: BOX_BORDER_COLOR,
                borderWidth: BOX_BORDER_W,
              });
              const txt = String(c.value || '');
              if (txt) {
                const size = Math.min(12, h * 0.6);
                page.drawText(txt, {
                  x: x + 2,
                  y: y + (h - size) / 2,
                  size,
                  font: unicodeFont,
                  color: rgb(0, 0, 0),
                });
              }
              break;
            }

            case 'signature_worker':
            case 'signature_verifier': {
              page.drawRectangle({
                x,
                y,
                width: w,
                height: h,
                borderColor: BOX_BORDER_COLOR,
                borderWidth: BOX_BORDER_W,
              });
              const val = String(c.value || '');
              if (val.startsWith('data:image/')) {
                const res = await fetch(val);
                const imgBytes = new Uint8Array(await res.arrayBuffer());
                const img = val.startsWith('data:image/png')
                  ? await pdfDocLib.embedPng(imgBytes)
                  : await pdfDocLib.embedJpg(imgBytes);

                const { width: iw, height: ih } = img.size();
                const pad = Math.max(2, Math.min(8, Math.min(w, h) * 0.05));
                const maxW = Math.max(1, w - pad * 2);
                const maxH = Math.max(1, h - pad * 2);
                const sImg = Math.min(maxW / iw, maxH / ih);
                const dw = iw * sImg;
                const dh = ih * sImg;
                const dx = x + (w - dw) / 2;
                const dy = y + (h - dh) / 2;

                page.drawImage(img, {
                  x: dx,
                  y: dy,
                  width: dw,
                  height: dh,
                });
              } else {
                const size = Math.min(12, h * 0.5);
                page.drawText('서명 없음', {
                  x: x + 2,
                  y: y + (h - size) / 2,
                  size,
                  font: unicodeFont,
                  color: rgb(0.2, 0.2, 0.2),
                });
              }
              break;
            }
          }
        }
        // =========================
        // 드로잉(pathData) PDF 반영
        // =========================
        if (Array.isArray(pg.pathData)) {
          const gsCache: Record<string, PDFName> = {};
          const scaleX = pageW / pg.width;
          const scaleY = pageH / pg.height;
          const scaleAvg = (scaleX + scaleY) / 2;
          for (const path of pg.pathData) {
            const pts = path.points as number[];
            if (!Array.isArray(pts) || pts.length < 4) continue;
            const { r, g, b, a } = argbIntToRgbaParts(path.color ?? 0xff000000);
            const color = rgb(r, g, b);
            const rawWidth =
              (path as any).strokWidth ?? (path as any).strokeWidth ?? 1;
            const thickness = rawWidth * scaleAvg;
            const int16x2ToInt32 = (low: number, high: number) =>
              ((high & 0xffff) << 16) | (low & 0xffff);
            let idx = 0;
            let x = int16x2ToInt32(pts[idx], pts[idx + 1]);
            idx += 2;
            let y = int16x2ToInt32(pts[idx], pts[idx + 1]);
            idx += 2;
            let gsName: PDFName | undefined;
            if (a < 0.999) {
              const key = `GS_${Math.floor(a * 1000)}`;
              if (!gsCache[key]) {
                const name = PDFName.of(key);
                page.node.setExtGState(
                  name,
                  pdfDocLib.context.obj({
                    Type: 'ExtGState',
                    CA: a,
                    ca: a,
                  })
                );
                gsCache[key] = name;
              }
              gsName = gsCache[key];
            }
            const commands: any[] = [];
            commands.push(pushGraphicsState());
            if (gsName) {
              commands.push(setGraphicsState(gsName));
            }
            commands.push(setLineWidth(thickness));
            commands.push(setLineCap(1)); // round
            commands.push(setLineJoin(1)); // round
            commands.push(setStrokingColor(color));
            commands.push(
              moveTo((x / 100) * scaleX, pageH - (y / 100) * scaleY)
            );
            while (idx + 1 < pts.length) {
              x += pts[idx];
              y += pts[idx + 1];
              idx += 2;
              commands.push(
                lineTo((x / 100) * scaleX, pageH - (y / 100) * scaleY)
              );
            }
            commands.push(stroke());
            commands.push(popGraphicsState());
            page.pushOperators(...commands);
          }
        }
      }

      const bytes = await pdfDocLib.save();
      const safeBytes = new Uint8Array(bytes); // ArrayBuffer 기반으로 복사
      saveAs(
        new Blob([safeBytes], { type: 'application/pdf' }),
        `${fileName}.pdf`
      );

      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      saveAs(jsonBlob, `${fileName}_overlays.json`);

      alert(
        `서식화된 PDF와 JSON이 저장되었습니다:\n- ${fileName}.pdf\n- ${fileName}_overlays.json`
      );
    } catch (e) {
      console.error(e);
      alert('PDF 서식화 중 오류가 발생했습니다.');
    }
  };

  return (
    <BaseLayout>
      <div ref={headerRef}>
        <ViewerHeader
          isDbMode={isDbMode}
          hasPdf={hasPdf}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomLevel={zoomLevel}
          onRotate={() => {
            /* 필요 없으면 ViewerHeader.tsx에서 버튼 주석 처리 */
          }}
          onSearch={() => {
            showDialogGroupInCurrentPage();
          }}
          onDownload={() => {
            /* 필요하면 여기 구현 */
          }}
          onPickPdf={f => {
            setPdfFile(f);
            setCurrentFile(f.name);
            setFileSize(`${(f.size / 1024 / 1024).toFixed(2)} MB`);
            setFileUrl(URL.createObjectURL(f));

            // 새 PDF → 이전 JSON/오버레이 초기화
            setTemplateDoc(null);
            setVPages([]);
            setOverlaysByPage({});
          }}
          onPickJson={async f => {
            try {
              const json = JSON.parse(await f.text()) as TemplateDoc;
              setTemplateDoc(json);
              setVPages(json.pages || []);

              const map: Record<number, OverlayItem[]> = {};
              (json.pages || []).forEach(pg => {
                const W = pg.width || BASE_W;
                const H = pg.height || BASE_H;

                (pg.components || []).forEach((c, i) => {
                  // 지원하지 않는 type은 스킵 (예: satisfactionbox, 기타 사용자 정의 타입 등)
                  if (!SUPPORTED_TYPES.includes(c.type as SupportedType)) {
                    console.warn(
                      '[ViewerPage] unsupported component type, skip:',
                      c.type,
                      c
                    );
                    return;
                  }

                  const xPct =
                    typeof c.xPct === 'number' ? c.xPct : (c.x ?? 0) / W;
                  const yPct =
                    typeof c.yPct === 'number' ? c.yPct : (c.y ?? 0) / H;
                  const wPct =
                    typeof c.wPct === 'number' ? c.wPct : (c.width ?? 0) / W;
                  const hPct =
                    typeof c.hPct === 'number' ? c.hPct : (c.height ?? 0) / H;

                  (map[pg.page] ||= []).push({
                    uid: `${c.type}-${Date.now()}-${Math.random()}`,
                    id: String(c.id ?? `${pg.page}-${i}`),
                    type: c.type as SupportedType,
                    page: pg.page,
                    xPct,
                    yPct,
                    wPct,
                    hPct,
                    value: c.value || '',
                  });
                });
              });
              setOverlaysByPage(map);
            } catch (e) {
              console.error('[ViewerPage] JSON 로드 실패', e);
              alert('JSON 템플릿을 불러오는 중 오류가 발생했습니다.');
            }
          }}
          onPickConstraintJson={handlePickConstraintJson}
          onSaveJsonWithValues={handleSaveJsonWithValues}
          onSavePdf={handleSavePdf}
          hasDialog={hasDialogInPage}
          hasQrDialog={hasQrInPage}
          onShowDialog={showDialogGroupInCurrentPage}
          onShowQrDialog={showFirstQrDialogInCurrentPage}
        />
      </div>

      <div className="px-3 py-1 text-xs text-slate-600 bg-slate-50 border-b">
        참여자: {participants.length}
        {participants.length > 0 && (
          <span className="ml-2 text-slate-400">
            ({participants.map(u => u.USER_NAME).join(', ')})
          </span>
        )}
      </div>

      {/* ⚠️ 여기: centerRef에 min-h-0, 내부에 zoom>100일 때만 overflow-auto */}
      <div
        ref={centerRef}
        className={`flex flex-1 bg-slate-100 ${
          zoomLevel >= 110 ? 'overflow-auto' : 'overflow-hidden'
        }`}
      >
        <div className="flex flex-1 justify-center items-start py-3">
          {/* � 여기부터 래퍼 2단계 구조로 변경 */}
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
              <ViewerWorkspace
                ref={wsRef}
                scale={pageScale}
                fileUrl={fileUrl ?? undefined}
                overlays={overlaysByPage}
                logicalPages={vPages}
                pathDataByPage={pathDataByPage}
                attachmentsByPage={attachmentsByPage}
                onPageInfoChange={info => setPageInfo(info)}
                onOverlaysChange={(page, items) =>
                  setOverlaysByPage(prev => ({
                    ...prev,
                    [page]: items,
                  }))
                }
                constraints={constraintDoc}
                onQrDetected={showQrCodeInCurrentPage}
                onDialogInfoChange={({ hasDialog, hasQrDialog }) => {
                  setHasDialogInPage(hasDialog);
                  setHasQrInPage(hasQrDialog);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {activeDialog && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40"
          onMouseDown={() => {
            setActiveDialog(null);
            setDialogTag(null);
            setSelectedDialogIdx(0);
          }}
        >
          <div
            className="bg-white w-[90vw] max-w-xl max-h-[80vh] overflow-auto rounded shadow-lg"
            onMouseDown={e => e.stopPropagation()} //  select 클릭 안정
          >
            <div className="p-3 border-b flex justify-between items-center">
              <div className="font-semibold flex gap-2 items-center">
                시간:
                {(activeDialog.dialoges?.length ?? 0) > 1 ? (
                  <select
                    value={selectedDialogIdx}
                    onChange={e => setSelectedDialogIdx(Number(e.target.value))}
                    className="border px-2 py-1 text-sm"
                  >
                    {activeDialog.dialoges.map((dlg: any, idx: number) => (
                      <option key={idx} value={idx}>
                        {dlg.title ?? `#${idx + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-slate-600">
                    {activeDialog.dialoges?.[0]?.title ?? ''}
                  </span>
                )}
              </div>

              <button
                className="text-sm px-2"
                onClick={() => {
                  setActiveDialog(null);
                  setDialogTag(null);
                  setSelectedDialogIdx(0);
                }}
              >
                닫기
              </button>
            </div>

            <div className="p-4 space-y-3">
              {(() => {
                const dlg = activeDialog.dialoges?.[selectedDialogIdx];
                if (!dlg) return null;

                return (
                  <div>
                    {dlg.columnes?.map((col: any, ci: number) => (
                      <div key={ci} className="mb-3">
                        <div className="text-sm font-medium mb-1">
                          {col.title}
                        </div>

                        {col.controls?.map((ctrl: any) => {
                          if (ctrl.type === 'radio') {
                            return (
                              <div key={ctrl.id} className="flex gap-3 text-sm">
                                {ctrl.options?.map((opt: any) => (
                                  <label
                                    key={opt.value}
                                    className="flex items-center gap-1"
                                  >
                                    <input
                                      type="radio"
                                      name={ctrl.id}
                                      value={opt.value}
                                      checked={
                                        wsRef.current?.getSelectedRadioIndex(
                                          activeDialog.page,
                                          ctrl.id
                                        ) === opt.value
                                      }
                                      onChange={() =>
                                        wsRef.current?.applyRadioToCheckboxGroup(
                                          activeDialog.page,
                                          ctrl.id,
                                          opt.value
                                        )
                                      }
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            );
                          }

                          if (ctrl.type === 'textbox_num') {
                            return (
                              <div
                                key={ctrl.id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="number"
                                  className="border px-2 py-1 w-24"
                                  value={
                                    (
                                      overlaysByPage[activeDialog.page] ?? []
                                    ).find(o => o.id === ctrl.id)?.value ?? ''
                                  }
                                  onChange={e =>
                                    wsRef.current?.setOverlayValue(
                                      activeDialog.page,
                                      ctrl.id,
                                      e.target.value
                                    )
                                  }
                                />
                                <span className="text-xs text-slate-500">
                                  {ctrl.unit}
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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

      {/*  Chat FAB + Panel */}
      <div className="fixed bottom-9 right-4 z-[99999]">
        {!chatOpen ? (
          <button
            className="relative px-3 py-1 rounded bg-black text-white text-sm shadow"
            onClick={() => {
              setChatOpen(true);
              setUnreadChatCount(0);
            }}
          >
            Chat
            {unreadChatCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </button>
        ) : (
          <div className="w-[320px] h-[360px] bg-white rounded shadow-lg border flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Room Chat</div>
              <button
                className="text-xs px-2"
                onClick={() => setChatOpen(false)}
              >
                닫기
              </button>
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-auto p-2 space-y-2 text-sm"
            >
              {chatLog.map((m, i) => (
                <div key={i}>
                  <span className="text-slate-500 text-xs mr-2">{m.from}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>

            <div className="p-2 border-t flex gap-2">
              <input
                className="flex-1 border px-2 py-1 text-sm"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const t = chatInput.trim();
                    if (!t) return;

                    const createdAt = new Date().toISOString();
                    const key = `${createdAt}|${user.USER_ID}|${clientKey}|${t}`;

                    seenChatKeysRef.current.add(key);
                    setChatLog(prev => [
                      ...prev,
                      { ts: Date.now(), from: user.USER_NAME, text: t },
                    ]);

                    wsRoom.sendChat?.(t, { createdAt });
                    setChatInput('');
                  }
                }}
                placeholder="메시지 입력"
              />
              <button
                className="px-3 py-1 rounded bg-slate-900 text-white text-sm"
                onClick={() => {
                  const t = chatInput.trim();
                  if (!t) return;

                  const createdAt = new Date().toISOString();
                  const key = `${createdAt}|${user.USER_ID}|${clientKey}|${t}`;

                  seenChatKeysRef.current.add(key);
                  setChatLog(prev => [
                    ...prev,
                    { ts: Date.now(), from: user.USER_NAME, text: t },
                  ]);

                  wsRoom.sendChat?.(t, { createdAt });
                  setChatInput('');
                }}
              >
                전송
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
