// src/pages/ViewerPage.tsx
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
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
  const isDbMode = !!params.get('TST_UNQ_KY_VAL');
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

  const getPdfPageNoByLogicalPage = (logicalPage: number) => {
    const lp = vPages.find(p => Number(p.page) === Number(logicalPage));
    const pdf = (lp as any)?.pdfPageNo;
    return Number(pdf ?? logicalPage);
  };

  const getLogicalPageByPdfPageNo = (pdfPageNo: number) => {
    const lp = vPages.find(
      p => Number((p as any)?.pdfPageNo) === Number(pdfPageNo)
    );
    return Number(lp?.page ?? pdfPageNo);
  };

  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);
  const [dialogTag, setDialogTag] = useState<string | null>(null);
  const [selectedDialogIdx, setSelectedDialogIdx] = useState(0);

  function showDialogGroupInCurrentPage() {
    if (!constraintDoc) return;

    const logicalPage = pageInfo.currentPage;
    const pdfPageNo = getPdfPageNoByLogicalPage(logicalPage);

    const rulePage = constraintDoc.pages.find(
      p => Number((p as any).page) === Number(pdfPageNo)
    );

    const dialoges = rulePage?.dialoges;
    if (!dialoges || dialoges.length === 0) return;

    setActiveDialog({ kind: 'group', page: logicalPage, dialoges });
    setSelectedDialogIdx(0);
    setDialogTag('DialogGroupInPdfPage');
  }

  function showQrCodeInCurrentPage(barcode?: string) {
    if (!barcode || !constraintDoc) return;
    if (dialogTag === 'QRDialogGroupInPdfPage') return;

    const matches: any[] = [];
    let targetPdfPageNo: number | null = null;

    for (const pg of constraintDoc.pages) {
      const list = (pg as any).qr_dialoges ?? [];
      for (const qr of list) {
        if (qr.qr === barcode) {
          matches.push(qr);
          if (targetPdfPageNo == null) {
            targetPdfPageNo = Number(qr.targetPdfPageNo ?? (pg as any).page);
          }
        }
      }
    }

    if (matches.length === 0) return;

    const targetLogicalPage = getLogicalPageByPdfPageNo(
      Number(targetPdfPageNo)
    );
    const first = matches[0];

    const dialoges = first.dialoges ?? first.dialogs ?? matches; //  중첩이 없으면 matches 자체가 시간 리스트

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
    const pdfPageNo = getPdfPageNoByLogicalPage(logicalPage);

    const rulePage = constraintDoc.pages.find(
      p => Number((p as any).page) === Number(pdfPageNo)
    );

    const qrs: any[] = (rulePage as any)?.qr_dialoges ?? [];
    if (qrs.length === 0) return;

    const first = qrs[0];

    const targetPdfPageNo = Number(first.targetPdfPageNo ?? pdfPageNo);
    const targetLogicalPage = getLogicalPageByPdfPageNo(targetPdfPageNo);

    //  1) first.dialoges(중첩형) 있으면 그걸 쓰고
    //  2) 없으면 qrs 자체를 시간 리스트로 사용
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

  useEffect(() => {
    if (!constraintDoc) {
      setHasDialogInPage(false);
      setHasQrInPage(false);
      return;
    }

    const logicalPage = pageInfo.currentPage;
    const pdfPageNo = getPdfPageNoByLogicalPage(logicalPage);

    const rulePage = constraintDoc.pages?.find(
      p => Number((p as any).page) === Number(pdfPageNo)
    );

    setHasDialogInPage(!!rulePage?.dialoges?.length);
    setHasQrInPage(!!(rulePage as any)?.qr_dialoges?.length);
  }, [pageInfo.currentPage, constraintDoc, vPages]);

  // ===============================
  // ViewerPage – DB 로딩 + Rule 공용 처리
  // ===============================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const TST_UNQ_KY_VAL = params.get('TST_UNQ_KY_VAL');
    if (!TST_UNQ_KY_VAL) return;

    const isProd = import.meta.env.PROD;

    const load = async () => {
      const metaRes = await axios.get('/api/Exam_Json_M.do', {
        params: { TST_UNQ_KY_VAL },
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
        });

        const file = new File([pdfRes.data], 'viewer.pdf', {
          type: 'application/pdf',
        });

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

    const pages = (templateDoc.pages || []).map(pg => {
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
          typeof pg.pdfPageNo === 'number' && pg.pdfPageNo > 0
            ? pg.pdfPageNo
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

      {/* ⚠️ 여기: centerRef에 min-h-0, 내부에 zoom>100일 때만 overflow-auto */}
      <div
        ref={centerRef}
        className={`flex flex-1 bg-slate-100 ${
          zoomLevel >= 110 ? 'overflow-auto' : 'overflow-hidden'
        }`}
      >
        <div className="flex flex-1 justify-center items-start py-3">
          {/* 🔹 여기부터 래퍼 2단계 구조로 변경 */}
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
    </BaseLayout>
  );
}
