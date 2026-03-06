// src/lib/pdfGlyphBoxDetector.ts
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import { BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../constants/pageSize';

export interface DetectedBox {
  page: number; // 1-based
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
}

export interface GlyphDetectOptions {
  /** 찾을 글자 목록 (기본: WHITE SQUARE, BALLOT BOX) */
  targetChars?: string[];
  /** 글리프 박스에 더해줄 여백(px, viewport 기준) */
  inflatePx?: number;
  /** 최소 글자 높이(px) – 너무 작은 잡음을 제거 */
  minGlyphHeightPx?: number;
  /**
   * 에디터 카드 기준 폭/높이
   *  - PDFWorkspace 의 FIXED_W / FIXED_H 와 동일 값 사용
   *  - 기본값: 720 x 1020
   */
  baseWidth?: number;
  baseHeight?: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * PDF 페이지(viewport) 를 카드(FIXED_W, FIXED_H) 안에 그릴 때의
 * 스케일/오프셋 계산 (PDFWorkspace 의 getPageFit 과 동일 컨셉)
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
 * 텍스트 아이템 하나(□ 글자 등)를
 *  - PDF viewport 좌표계 → 카드 좌표계(FIXED_W/H) → 퍼센트 단위로 변환
 */
function getItemBoxInCardCoords(
  item: any,
  viewport: any,
  inflatePx: number,
  baseW: number,
  baseH: number
) {
  const Util = (pdfjsLib as any).Util;
  const m = Util.transform(viewport.transform, item.transform); // [a,b,c,d,e,f]
  const a = m[0],
    b = m[1],
    c = m[2],
    d = m[3],
    e = m[4],
    f = m[5];

  // 글리프 높이/폭 (viewport 기준 px)
  const glyphH = Math.hypot(c, d);
  const glyphW = Math.hypot(a, b) || glyphH;

  // viewport 기준 좌상단 박스
  const x = e;
  const yTop = f - glyphH;

  // inflate 적용
  const xInfl = x - inflatePx;
  const yInfl = yTop - inflatePx;
  const wInfl = glyphW + inflatePx * 2;
  const hInfl = glyphH + inflatePx * 2;

  // viewport → 카드 좌표
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

  const xPct = xCard / BW;
  const yPct = yCard / BH;
  const wPct = wCard / BW;
  const hPct = hCard / BH;

  return {
    xPct: clamp01(xPct),
    yPct: clamp01(yPct),
    wPct: Math.max(0.002, clamp01(wPct)),
    hPct: Math.max(0.002, clamp01(hPct)),
    glyphH,
  };
}

/** 단일 페이지에서 목표 글리프(□ 등) 위치를 박스로 검출 */
async function detectGlyphBoxesOnPage(
  page: PDFPageProxy,
  pageNo: number,
  options: GlyphDetectOptions
): Promise<DetectedBox[]> {
  const {
    targetChars = ['□', '☐'],
    inflatePx = 2,
    minGlyphHeightPx = 6,
    // baseWidth = 720,
    // baseHeight = 1020,
    baseWidth = BASE_PAGE_WIDTH,
    baseHeight = BASE_PAGE_HEIGHT,
  } = options;

  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items: any[] = (content as any).items || [];
  const boxes: DetectedBox[] = [];

  for (const it of items) {
    const str: string = it.str ?? '';
    if (!str) continue;

    for (const ch of targetChars) {
      const idx = str.indexOf(ch);
      if (idx === -1) continue;

      const { xPct, yPct, wPct, hPct, glyphH } = getItemBoxInCardCoords(
        it,
        viewport,
        inflatePx,
        baseWidth,
        baseHeight
      );

      if (glyphH >= minGlyphHeightPx) {
        boxes.push({
          page: pageNo,
          xPct,
          yPct,
          wPct,
          hPct,
        });
      }

      // 한 item 에서 같은 문자 반복은 거의 없으니 한 번만 처리
      break;
    }
  }
  return boxes;
}

/** 전체 PDF에서 목표 글리프(□ 등) 박스 검출 */
export async function detectGlyphBoxesInPdf(
  pdfDoc: PDFDocumentProxy,
  options: GlyphDetectOptions = {}
): Promise<DetectedBox[]> {
  const out: DetectedBox[] = [];
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const boxes = await detectGlyphBoxesOnPage(page, p, options);
    out.push(...boxes);
  }
  return out;
}
