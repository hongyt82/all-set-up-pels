// src/lib/pdfTextPatternBoxDetector.ts
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../constants/pageSize';

export interface DetectedBox {
  page: number; // 1-based
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  text: string;
}

export interface TextPatternDetectOptions {
  patterns: RegExp[];
  place?: 'left' | 'right';
  inflatePx?: number;
  minTextHeightPx?: number;
  baseWidth?: number;
  baseHeight?: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// 같은 줄 판별용 Y 오차 (퍼센트 기준)
const LINE_Y_EPSILON_PCT = 0.004;

/**
 * PDF 페이지(viewport)를 카드(FIXED_W, FIXED_H)에 맞출 때의
 * 스케일/오프셋 계산
 */
function getPageFitForViewport(
  viewportW: number,
  viewportH: number,
  baseW: number,
  baseH: number
) {
  const isLandscape = viewportW > viewportH;
  const BW = isLandscape ? baseH : baseW;
  const BH = isLandscape ? baseW : baseH;

  const s = Math.min(BW / viewportW, BH / viewportH);
  const drawW = viewportW * s;
  const drawH = viewportH * s;
  const offsetX = (BW - drawW) / 2;
  const offsetY = (BH - drawH) / 2;

  return { BW, BH, s, offsetX, offsetY };
}

/**
 * 텍스트 아이템(TextContent item)을 카드 좌표계 퍼센트로 변환
 */
function getTextItemBoxInCardCoords(
  item: any,
  viewport: any,
  inflatePx: number,
  baseW: number,
  baseH: number
) {
  const Util = (pdfjsLib as any).Util;
  const m = Util.transform(viewport.transform, item.transform);

  const a = m[0];
  const b = m[1];
  const c = m[2];
  const d = m[3];
  const e = m[4];
  const f = m[5];

  const textH = Math.hypot(c, d);
  const textW = Math.hypot(a, b) || textH;

  const x = e;
  const yTop = f - textH;

  const xInfl = x - inflatePx;
  const yInfl = yTop - inflatePx;
  const wInfl = textW + inflatePx * 2;
  const hInfl = textH + inflatePx * 2;

  const { BW, BH, s, offsetX, offsetY } = getPageFitForViewport(
    viewport.width,
    viewport.height,
    baseW,
    baseH
  );

  const xCard = xInfl * s + offsetX;
  const yCard = yInfl * s + offsetY;
  const wCard = wInfl * s;
  const hCard = hInfl * s;

  return {
    xPct: clamp01(xCard / BW),
    yPct: clamp01(yCard / BH),
    wPct: Math.max(0.002, clamp01(wCard / BW)),
    hPct: Math.max(0.002, clamp01(hCard / BH)),
    textH,
  };
}

/**
 * 단일 페이지에서 숫자 패턴 기반 박스 검출
 */
async function detectTextPatternBoxesOnPage(
  page: PDFPageProxy,
  pageNo: number,
  options: TextPatternDetectOptions
): Promise<DetectedBox[]> {
  const {
    patterns,
    place = 'left',
    inflatePx = 2,
    minTextHeightPx = 6,
    baseWidth = BASE_PAGE_WIDTH,
    baseHeight = BASE_PAGE_HEIGHT,
  } = options;

  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items: any[] = (content as any).items || [];
  const boxes: DetectedBox[] = [];

  const LEFT_MARGIN_LIMIT = 0.15;

  // 먼저 모든 텍스트 아이템의 좌표를 계산해 둔다
  const positionedItems = items
    .map(it => {
      const str: string = (it.str ?? '').trim();
      if (!str) return null;

      const pos = getTextItemBoxInCardCoords(
        it,
        viewport,
        inflatePx,
        baseWidth,
        baseHeight
      );

      // ===== 왼쪽 본문 영역만 허용 =====
      if (pos.xPct > LEFT_MARGIN_LIMIT) return null;
      // ===============================

      return {
        it,
        str,
        ...pos,
      };
    })
    .filter(Boolean) as {
    it: any;
    str: string;
    xPct: number;
    yPct: number;
    wPct: number;
    hPct: number;
    textH: number;
  }[];

  for (const cur of positionedItems) {
    const { str, xPct, yPct, wPct, hPct, textH } = cur;

    let matched = false;
    for (const pattern of patterns) {
      if (pattern.test(str)) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;

    if (textH < minTextHeightPx) continue;

    // ===== 라인 시작 여부 필터 =====
    const isLineStart = !positionedItems.some(other => {
      if (other === cur) return false;

      const sameLine = Math.abs(other.yPct - yPct) < LINE_Y_EPSILON_PCT;
      const hasLeftText = other.xPct + other.wPct < xPct - 0.002;

      return sameLine && hasLeftText;
    });

    if (!isLineStart) continue;

    // ===== 패턴별 크기 =====
    let sizeScale = 1.0;

    if (/^\d+\.\d+$/.test(str)) {
      sizeScale = 1.25;
    } else if (/^\d+\.\d+\.\d+$/.test(str)) {
      sizeScale = 1.0;
    }

    const finalWPct = wPct * sizeScale;
    const finalHPct = hPct * sizeScale;

    // ===== 핵심: 박스 오른쪽 기준으로 배치 =====
    const gapPct = finalWPct * 0.4;

    let targetXPct = xPct;
    if (place === 'left') {
      targetXPct = xPct - gapPct - finalWPct;
    } else if (place === 'right') {
      targetXPct = xPct + wPct + gapPct;
    }

    boxes.push({
      page: pageNo,
      xPct: clamp01(targetXPct),
      yPct,
      wPct: Math.min(1, finalWPct),
      hPct: Math.min(1, finalHPct),
      text: cur.str,
    });
  }

  return boxes;
}

/**
 * 전체 PDF에서 숫자 패턴 기반 박스 검출
 */
export async function detectTextPatternBoxesInPdf(
  pdfDoc: PDFDocumentProxy,
  options: TextPatternDetectOptions
): Promise<DetectedBox[]> {
  const out: DetectedBox[] = [];

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const boxes = await detectTextPatternBoxesOnPage(page, p, options);
    out.push(...boxes);
  }

  return out;
}
