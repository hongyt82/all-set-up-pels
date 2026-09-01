// src/lib/pdf/exportFilledPdf.ts

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
import type { TemplateDoc } from '../../types';
import { BASE_PAGE_WIDTH } from '../../constants/pageSize';
import { PDF_BOUNDARY } from '../boundaryUtils';

const BASE_W = BASE_PAGE_WIDTH;
const BASE_H = Math.round((PDF_BOUNDARY.height / PDF_BOUNDARY.width) * BASE_W);

const TEXTBOX_FONT_PX = 12;
const PX_TO_PT = 0.75;

function getFontUrl() {
  if (import.meta.env.PROD) {
    return '/pels/static/e-link-v2/fonts/NotoSansKR-Regular.ttf';
  }
  return '/pels/fonts/NotoSansKR-Regular.ttf';
}

const formatNumberForDisplay = (value: string) => {
  const raw = String(value ?? '')
    .replace(/,/g, '')
    .trim();

  if (!raw) return '';

  const num = Number(raw);

  if (Number.isNaN(num)) {
    return String(value ?? '');
  }

  const hasDecimal = raw.includes('.');
  const decimal = hasDecimal ? (raw.split('.')[1] ?? '') : '';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimal ? decimal.length : 0,
    maximumFractionDigits: hasDecimal ? decimal.length : 0,
  });
};

const formatDateForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();

  if (raw.includes('.')) {
    const parts = raw.split('.').map(v => v.replace(/\D/g, ''));

    const year = parts[0] ?? '';
    const month = parts[1] ? String(Number(parts[1])) : '';
    const day = parts[2] ? String(Number(parts[2])) : '';

    return [year, month, day].filter(Boolean).join('.');
  }

  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length !== 8) return raw;

  const year = digits.slice(0, 4);
  const month = String(Number(digits.slice(4, 6)));
  const day = String(Number(digits.slice(6, 8)));

  return `${year}.${month}.${day}`;
};

const formatDateYear2ForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 8) {
    const year = digits.slice(2, 4);
    const month = String(Number(digits.slice(4, 6)));
    const day = String(Number(digits.slice(6, 8)));

    return `${year}.${month}.${day}`;
  }

  if (digits.length === 6) {
    const year = digits.slice(0, 2);
    const month = String(Number(digits.slice(2, 4)));
    const day = String(Number(digits.slice(4, 6)));

    return `${year}.${month}.${day}`;
  }

  return raw;
};

const formatMonthDayForDisplay = (value: string) => {
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

const formatTimeForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();

  if (raw.includes(':')) {
    const [h = '', m = ''] = raw.split(':');

    const hour = h.replace(/\D/g, '');
    const minute = m.replace(/\D/g, '').slice(0, 2);

    if (!hour) return '';
    if (!minute) return String(Number(hour));

    return `${Number(hour)}:${minute}`;
  }

  const digits = raw.replace(/\D/g, '').slice(0, 4);

  if (digits.length !== 4) return raw;

  const hour = String(Number(digits.slice(0, 2)));
  const minute = digits.slice(2, 4);

  return `${hour}:${minute}`;
};

const formatTimeSecondsForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const match = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}:${match[3]}`;
  }

  const digits = raw.replace(/\D/g, '').slice(0, 6);
  if (digits.length !== 6) return raw;

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
};

const formatMinuteSecondsForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length !== 4) return raw;

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

const formatDateTimeForDisplay = (value: string) => {
  const raw = String(value ?? '').trim();

  if (raw.includes(' ')) {
    const [datePart = '', timePart = ''] = raw.split(/\s+/);
    const date = formatDateForDisplay(datePart);
    const time = formatTimeForDisplay(timePart);

    return [date, time].filter(Boolean).join(' ');
  }

  const digits = raw.replace(/\D/g, '').slice(0, 12);

  if (digits.length !== 12) return raw;

  const date = formatDateForDisplay(digits.slice(0, 8));
  const time = formatTimeForDisplay(digits.slice(8, 12));

  return `${date} ${time}`;
};

export async function exportFilledPdf(params: {
  sourcePdf: File;
  data: TemplateDoc;
  pathDataByPage?: Record<number, any[]>;
  attachmentsByPage?: Record<number, any[]>;
  devWarn?: (...args: any[]) => void;
}) {
  const {
    sourcePdf,
    data,
    pathDataByPage = {},
    attachmentsByPage = {},
    devWarn = console.warn,
  } = params;

  const argbIntToRgbaParts = (color: number) => {
    const u = color >>> 0;
    const a = ((u >> 24) & 0xff) / 255;
    const r = ((u >> 16) & 0xff) / 255;
    const g = ((u >> 8) & 0xff) / 255;
    const b = (u & 0xff) / 255;
    return { r, g, b, a };
  };

  const arrayBuffer = await sourcePdf.arrayBuffer();

  // 원본 PDF는 복사용으로만 사용
  const sourcePdfDoc = await PDFDocument.load(arrayBuffer);

  // 저장용 새 PDF 생성
  const pdfDocLib = await PDFDocument.create();
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
    devWarn('NotoSansKR 임베드 실패 — pdf-lib 기본 폰트로 진행합니다.', e);
  }

  // 각 페이지별 컴포넌트 그리기
  for (const pg of data.pages as any[]) {
    const realNo = Number(pg.pdfPageNo);

    let page: any;

    if (Number.isFinite(realNo) && realNo > 0) {
      // 실제 PDF 페이지는 원본에서 복사해서 새 PDF에 추가
      const sourcePageCount = sourcePdfDoc.getPageCount();
      const sourcePageIndex = Math.min(
        Math.max(realNo - 1, 0),
        sourcePageCount - 1
      );

      const [copiedPage] = await pdfDocLib.copyPages(sourcePdfDoc, [
        sourcePageIndex,
      ]);

      page = pdfDocLib.addPage(copiedPage);
    } else {
      // 가상페이지는 빈 페이지를 새로 만들어 추가
      const virtualW = Number(pg.width) || BASE_W;
      const virtualH = Number(pg.height) || BASE_H;

      page = pdfDocLib.addPage([virtualW, virtualH]);
    }

    const pageW = page.getWidth();
    const pageH = page.getHeight();
    for (const c of pg.components as any[]) {
      const w = c.wPct * pageW;
      const h = c.hPct * pageH;
      const x = c.xPct * pageW;
      const y = pageH - (c.yPct * pageH + h); // PDF 좌표계 변환

      switch (c.type) {
        case 'textbox':
        case 'textbox_multiline':
        case 'textbox_name':
        case 'textbox_verifier': {
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
          const baseY = y + (h - totalH) / 2 + ((lineHeight - size) * 0.5 || 0);

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

        case 'textbox_num': {
          const txt = formatNumberForDisplay(String(c.value ?? ''));
          if (!txt) break;

          const size = TEXTBOX_FONT_PX * PX_TO_PT;

          const textWidth = unicodeFont
            ? unicodeFont.widthOfTextAtSize(txt, size)
            : txt.length * size * 0.6;

          page.drawText(txt, {
            x: x + Math.max(1, (w - textWidth) / 2),
            y: y + (h - size) / 2,
            size,
            font: unicodeFont,
            color: rgb(0, 0, 0),
          });

          break;
        }

        case 'checkbox': {
          const s = Math.min(w, h);
          const ix = x;
          const iy = y + h - s;

          const checked = String(c.value || '').toLowerCase() === 'y';

          if (checked) {
            const t = Math.max(1, s * 0.16);

            const x1 = ix + s * 0.26;
            const y1 = iy + s * 0.56;

            const x2 = ix + s * 0.46;
            const y2 = iy + s * 0.34;

            const x3 = ix + s * 0.78;
            const y3 = iy + s * 0.7;

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

        case 'satisfactionbox': {
          const value = String(c.value ?? '').toLowerCase();

          const txt =
            value === 'good' ? '만족' : value === 'bad' ? '불만족' : '';

          if (!txt) {
            break;
          }

          const size = Math.min(12, h * 0.65);

          const textWidth = unicodeFont
            ? unicodeFont.widthOfTextAtSize(txt, size)
            : txt.length * size * 0.6;

          page.drawText(txt, {
            x: x + Math.max(1, (w - textWidth) / 2),
            y: y + (h - size) / 2,
            size,
            font: unicodeFont,
            color: rgb(0, 0, 0),
          });

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

        case 'button_o':
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

          const value = String(c.value || 'none').toLowerCase();
          const txt = displayMap[value] ?? '';

          if (!txt) {
            break;
          }

          const size = Math.min(14, h * 0.8);

          const textWidth = unicodeFont
            ? unicodeFont.widthOfTextAtSize(txt, size)
            : txt.length * size * 0.6;

          page.drawText(txt, {
            x: x + (w - textWidth) / 2,
            y: y + (h - size) / 2,
            size,
            font: unicodeFont,
            color: rgb(0, 0, 0),
          });

          break;
        }

        case 'calendar': {
          const raw = String(c.value || '');
          const option = String(c.option || 'yyyy-MM-dd');

          const txt =
            option === 'yy-MM-dd'
              ? formatDateYear2ForDisplay(raw)
              : option === 'MM-dd'
                ? formatMonthDayForDisplay(raw)
                : option === 'yyyy-MM-dd HH:mm'
                  ? formatDateTimeForDisplay(raw)
                  : option === 'HH:mm'
                    ? formatTimeForDisplay(raw)
                    : option === 'HH:mm:ss'
                      ? formatTimeSecondsForDisplay(raw)
                      : option === 'mm:ss'
                        ? formatMinuteSecondsForDisplay(raw)
                        : formatDateForDisplay(raw);

          if (txt) {
            page.drawRectangle({
              x,
              y,
              width: w,
              height: h,
              color: rgb(1, 1, 1),
            });

            const size = Math.min(12, h * 0.6);

            const textWidth = unicodeFont
              ? unicodeFont.widthOfTextAtSize(txt, size)
              : txt.length * size * 0.6;

            page.drawText(txt, {
              x: x + Math.max(1, (w - textWidth) / 2),
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
          const val = String(c.value || '');

          if (!val.startsWith('data:image/')) {
            break;
          }

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

          break;
        }
      }
    }

    // =========================
    // 첨부 이미지(attachments) PDF 반영
    // =========================
    const attachments =
      attachmentsByPage[Number(pg.page)] ?? pg.attachments ?? [];

    if (Array.isArray(attachments) && attachments.length > 0) {
      const srcW = Number(pg.width) || BASE_W;
      const srcH = Number(pg.height) || BASE_H;
      const scaleX = pageW / srcW;
      const scaleY = pageH / srcH;

      for (const att of attachments) {
        const type = String(att?.type ?? '').toLowerCase();

        if (type === 'auditorbox') {
          let parsed: any = null;

          try {
            parsed = att.text ? JSON.parse(att.text) : null;
          } catch {
            parsed = null;
          }

          const wphp = String(parsed?.wphp ?? '').toLowerCase();
          const date = String(parsed?.date ?? '');
          const name = String(parsed?.name ?? '');
          const satisfactionRaw = String(
            parsed?.satisfaction ?? ''
          ).toLowerCase();

          const satisfactionText =
            satisfactionRaw === 'y'
              ? '만족'
              : satisfactionRaw === 'n'
                ? '불만족'
                : '';

          const ax = Number(att.x ?? 0);
          const ay = Number(att.y ?? 0);
          const aw = Number(att.width ?? 0);
          const ah = Number(att.height ?? 0);

          if (!aw || !ah) continue;

          const boxX = ax * scaleX;
          const boxY = pageH - (ay + ah) * scaleY;
          const boxW = aw * scaleX;
          const boxH = ah * scaleY;

          const red = rgb(0.827, 0.184, 0.184);
          const gray = rgb(0.741, 0.741, 0.741);
          const darkGray = rgb(0.533, 0.533, 0.533);
          const black = rgb(0, 0, 0);

          const borderW = Math.max(0.5, Math.min(boxW, boxH) * 0.015);
          const fontSize = Math.max(5, Math.min(10, boxH * 0.15));
          const rowH = boxH / 3;

          const col1W = (boxW * 1.3) / 4;
          const col2W = (boxW * 1) / 4;
          const col3W = boxW - col1W - col2W;

          const drawTextCentered = (
            text: string,
            cellX: number,
            cellY: number,
            cellW: number,
            cellH: number,
            color = black
          ) => {
            if (!text) return;

            const textWidth = unicodeFont
              ? unicodeFont.widthOfTextAtSize(text, fontSize)
              : text.length * fontSize * 0.6;

            page.drawText(text, {
              x: cellX + Math.max(1, (cellW - textWidth) / 2),
              y: cellY + Math.max(1, (cellH - fontSize) / 2),
              size: fontSize,
              font: unicodeFont,
              color,
            });
          };

          const drawTextLeft = (
            text: string,
            cellX: number,
            cellY: number,
            cellW: number,
            cellH: number,
            color = black
          ) => {
            if (!text) return;

            const paddingX = Math.min(3, Math.max(1, cellW * 0.04));

            page.drawText(text, {
              x: cellX + paddingX,
              y: cellY + Math.max(1, (cellH - fontSize) / 2),
              size: fontSize,
              font: unicodeFont,
              color,
            });
          };

          // 외곽선
          page.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            borderColor: red,
            borderWidth: borderW,
          });

          // 가로선
          page.drawLine({
            start: { x: boxX, y: boxY + rowH },
            end: { x: boxX + boxW, y: boxY + rowH },
            thickness: borderW,
            color: red,
          });

          page.drawLine({
            start: { x: boxX, y: boxY + rowH * 2 },
            end: { x: boxX + boxW, y: boxY + rowH * 2 },
            thickness: borderW,
            color: red,
          });

          // 1행 세로선
          page.drawLine({
            start: { x: boxX + col1W, y: boxY + rowH * 2 },
            end: { x: boxX + col1W, y: boxY + boxH },
            thickness: borderW,
            color: red,
          });

          page.drawLine({
            start: { x: boxX + col1W + col2W, y: boxY + rowH * 2 },
            end: { x: boxX + col1W + col2W, y: boxY + boxH },
            thickness: borderW,
            color: red,
          });

          // 2행, 3행 세로선
          page.drawLine({
            start: { x: boxX + col1W, y: boxY },
            end: { x: boxX + col1W, y: boxY + rowH * 2 },
            thickness: borderW,
            color: red,
          });

          // 좌표: PDF는 아래에서 위로 증가
          const row1Y = boxY + rowH * 2;
          const row2Y = boxY + rowH;
          const row3Y = boxY;

          // 1행: WP/HP / 입회일 / 날짜
          const wpColor = wphp === 'wp' ? red : gray;
          const hpColor = wphp === 'hp' ? red : gray;

          const wpHpY = row1Y + Math.max(1, (rowH - fontSize) / 2);
          const wpText = 'WP';
          const slashText = '/';
          const hpText = 'HP';

          const wpW = unicodeFont
            ? unicodeFont.widthOfTextAtSize(wpText, fontSize)
            : wpText.length * fontSize * 0.6;
          const slashW = unicodeFont
            ? unicodeFont.widthOfTextAtSize(slashText, fontSize)
            : slashText.length * fontSize * 0.6;
          const hpW = unicodeFont
            ? unicodeFont.widthOfTextAtSize(hpText, fontSize)
            : hpText.length * fontSize * 0.6;

          const gap = 1.5;
          const totalWpHpW = wpW + slashW + hpW + gap * 2;
          let wpHpX = boxX + Math.max(1, (col1W - totalWpHpW) / 2);

          page.drawText(wpText, {
            x: wpHpX,
            y: wpHpY,
            size: fontSize,
            font: unicodeFont,
            color: wpColor,
          });

          wpHpX += wpW + gap;

          page.drawText(slashText, {
            x: wpHpX,
            y: wpHpY,
            size: fontSize,
            font: unicodeFont,
            color: darkGray,
          });

          wpHpX += slashW + gap;

          page.drawText(hpText, {
            x: wpHpX,
            y: wpHpY,
            size: fontSize,
            font: unicodeFont,
            color: hpColor,
          });

          drawTextCentered('입회일', boxX + col1W, row1Y, col2W, rowH, red);
          drawTextCentered(date, boxX + col1W + col2W, row1Y, col3W, rowH);

          // 2행: 입회자 / 이름
          drawTextCentered('입회자', boxX, row2Y, col1W, rowH, red);
          drawTextLeft(name, boxX + col1W, row2Y, boxW - col1W, rowH);

          // 3행: 입회결과 / 만족·불만족
          drawTextCentered('입회결과', boxX, row3Y, col1W, rowH, red);
          drawTextLeft(
            satisfactionText,
            boxX + col1W,
            row3Y,
            boxW - col1W,
            rowH
          );

          continue;
        }

        // PDF에는 정지 이미지 위주로 반영
        if (type !== 'image' && type !== 'camera') continue;

        const imageSrc = att.fileUrl || att.url || att.src || null;
        if (!imageSrc) continue;

        try {
          const res = await fetch(imageSrc, {
            credentials: 'include',
          });

          if (!res.ok) {
            devWarn('[PDF SAVE] attachment image fetch failed', {
              imageSrc,
              status: res.status,
            });
            continue;
          }

          const contentType = res.headers.get('content-type') || '';
          const imgBytes = new Uint8Array(await res.arrayBuffer());

          const lowerSrc = String(imageSrc).toLowerCase();

          const img =
            contentType.includes('png') || lowerSrc.includes('.png')
              ? await pdfDocLib.embedPng(imgBytes)
              : await pdfDocLib.embedJpg(imgBytes);

          const ax = Number(att.x ?? 0);
          const ay = Number(att.y ?? 0);
          const aw = Number(att.width ?? 0);
          const ah = Number(att.height ?? 0);

          if (!aw || !ah) continue;

          const boxX = ax * scaleX;
          const boxY = pageH - (ay + ah) * scaleY;
          const boxW = aw * scaleX;
          const boxH = ah * scaleY;

          const { width: iw, height: ih } = img.size();
          const imgScale = Math.min(boxW / iw, boxH / ih);
          const drawW = iw * imgScale;
          const drawH = ih * imgScale;
          const drawX = boxX + (boxW - drawW) / 2;
          const drawY = boxY + (boxH - drawH) / 2;

          page.drawImage(img, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        } catch (e) {
          devWarn('[PDF SAVE] attachment image embed failed', {
            imageSrc,
            error: e,
          });
        }
      }
    }
    // =========================
    // 드로잉(pathData) PDF 반영
    // =========================
    const drawingPaths = pathDataByPage[Number(pg.page)] ?? pg.pathData ?? [];

    if (Array.isArray(drawingPaths) && drawingPaths.length > 0) {
      const gsCache: Record<string, PDFName> = {};
      const srcW = Number(pg.width) || BASE_W;
      const srcH = Number(pg.height) || BASE_H;
      const scaleX = pageW / srcW;
      const scaleY = pageH / srcH;
      const scaleAvg = (scaleX + scaleY) / 2;

      for (const path of drawingPaths) {
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
        commands.push(moveTo((x / 100) * scaleX, pageH - (y / 100) * scaleY));
        while (idx + 1 < pts.length) {
          x += pts[idx];
          y += pts[idx + 1];
          idx += 2;
          commands.push(lineTo((x / 100) * scaleX, pageH - (y / 100) * scaleY));
        }
        commands.push(stroke());
        commands.push(popGraphicsState());
        page.pushOperators(...commands);
      }
    }
  }

  const bytes = await pdfDocLib.save();

  return new Blob([new Uint8Array(bytes)], {
    type: 'application/pdf',
  });
}
