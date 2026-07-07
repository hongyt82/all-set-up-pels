// src/lib/constraints/constraintsLogic.ts
import type { ConstraintDoc } from '../../types/constraints';
import { decodeHtmlEntities } from '../../utils/ruleHtmlDecode';

export function normalizeNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;

  const normalized = String(value).replaceAll(',', '').trim();

  const n = globalThis.Number(normalized);
  return globalThis.Number.isNaN(n) ? 0 : n;
}

// 기존 Rule 호환용
export const toNumber = normalizeNumber;

export function evaluateRuleExpression(
  expression: string | undefined,
  context: Record<string, any>
): any {
  if (!expression) return undefined;

  const safeExpression = decodeHtmlEntities(String(expression));

  if (safeExpression === 'default') return '__DEFAULT__';

  try {
    const fullContext = {
      ...context,

      // 기존 웹 Rule 호환
      toNumber: normalizeNumber,

      // 모바일/일반 수식 작성 방식 호환
      // expression 안에서 Number("1,234") → 1234 로 동작
      Number: normalizeNumber,

      Math,
      String,
      parseInt,
      parseFloat,
    };

    const entries = Object.entries(fullContext).filter(([key]) =>
      /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    );

    const argNames = entries.map(([key]) => key);
    const argValues = entries.map(([, value]) => value);

    const fn = new Function(...argNames, `return (${safeExpression});`);
    return fn(...argValues);
  } catch (e) {
    console.error('[Constraint] expression 에러:', safeExpression, e);
    return undefined;
  }
}

// 기존 이름 유지용
export function evaluateConstraintExpression(
  expression: string,
  context: Record<string, any>
): any {
  return evaluateRuleExpression(expression, context);
}

function isRuleIdMatched(ruleId: string, targetId: string): boolean {
  if (String(ruleId) === String(targetId)) return true;

  if (!String(ruleId).includes('*')) return false;

  const escaped = String(ruleId)
    .split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');

  return new RegExp(`^${escaped}$`).test(String(targetId));
}

function getTrailingNumber(id: string): number | null {
  const match = String(id).match(/_(\d+)$/);
  if (!match) return null;

  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function isRangeMatched(range: any, id: string): boolean {
  if (!range) return true;

  const no = getTrailingNumber(id);
  if (no == null) return false;

  const first = Number(range.firstInputNo);
  const last = Number(range.lastInputNo);

  if (!Number.isFinite(first) || !Number.isFinite(last)) return false;

  if (no < first || no > last) return false;

  if (range.sourcePrefix) {
    return String(id).startsWith(String(range.sourcePrefix));
  }

  return true;
}

export function evaluateConstraintRule(
  constraints: any[] | undefined,
  context: Record<string, any>,
  currentId?: string
): { status: string; result: any } {
  if (!Array.isArray(constraints) || constraints.length === 0) {
    return { status: 'none', result: undefined };
  }

  let defaultConstraint: any | null = null;
  let hasApplicableConstraint = false;

  for (const c of constraints) {
    if (c.expression === 'default') {
      defaultConstraint = c;
      continue;
    }

    if (c.range && currentId && !isRangeMatched(c.range, currentId)) {
      continue;
    }

    hasApplicableConstraint = true;

    const evaluated = evaluateRuleExpression(c.expression, context);

    if (typeof evaluated === 'boolean') {
      if (evaluated) {
        return {
          status: c.status ?? 'allow',
          result: evaluated,
        };
      }
      continue;
    }

    if (evaluated !== undefined && evaluated !== null) {
      if (typeof evaluated === 'number' && Number.isNaN(evaluated)) {
        continue;
      }

      return {
        status: c.status ?? 'calculated',
        result: evaluated,
      };
    }
  }

  if (defaultConstraint && hasApplicableConstraint) {
    return {
      status: defaultConstraint.status ?? 'error',
      result: undefined,
    };
  }

  return { status: 'none', result: undefined };
}

// 특정 page/id 의 rule 찾기
export function findComponentRules(
  constraintDoc: ConstraintDoc | null | undefined,
  constraintPageNo: number,
  id: string
): any[] {
  if (!constraintDoc) return [];

  const pageRule = constraintDoc.pages?.find(
    p => Number(p.constraintPageNo) === Number(constraintPageNo)
  );

  if (!pageRule?.components) return [];

  const exactRules = pageRule.components.filter(
    c => String(c.id) === String(id)
  );

  const wildcardRules = pageRule.components.filter(
    c =>
      String(c.id) !== String(id) && isRuleIdMatched(String(c.id), String(id))
  );

  return [...exactRules, ...wildcardRules];
}

function cssColor(value?: string): string | undefined {
  if (!value) return undefined;

  const parts = String(value)
    .split(',')
    .map(v => Number(v.trim()));

  if (parts.length >= 3 && parts.every(n => Number.isFinite(n))) {
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }

  return value;
}

export function applyOverlayRuleStyle(id: string, style: any): void {
  const root = document.getElementById(`overlay-${id}`);
  if (!root) return;

  const el = root.querySelector('input, textarea, select, button, div') ?? root;

  const target = el as HTMLElement;

  const borderColor = cssColor(style.borderColor);
  const borderWidth =
    style.borderWidth !== undefined ? `${style.borderWidth}px` : undefined;

  if (borderColor) target.style.borderColor = borderColor;
  if (borderWidth) target.style.borderWidth = borderWidth;

  if (style.rightBorderWidth !== undefined) {
    target.style.borderRightWidth = `${style.rightBorderWidth}px`;
  }

  if (style.leftBorderWidth !== undefined) {
    target.style.borderLeftWidth = `${style.leftBorderWidth}px`;
  }

  if (style.topBorderWidth !== undefined) {
    target.style.borderTopWidth = `${style.topBorderWidth}px`;
  }

  if (style.bottomBorderWidth !== undefined) {
    target.style.borderBottomWidth = `${style.bottomBorderWidth}px`;
  }

  if (borderColor || borderWidth) {
    target.style.borderStyle = 'solid';
  }
}

// status 에 따른 하이라이트
export function highlightOverlayStatus(id: string, status: string): void {
  const root = document.getElementById(`overlay-${id}`);
  if (!root) return;

  const target = root.querySelector('input, textarea, select, button') ?? root;

  const htmlTarget = target as HTMLElement;

  const color =
    {
      allow: 'transparent',
      warning: 'rgba(255, 215, 0, 0.18)',
      error: 'rgba(255, 0, 0, 0.12)',
      empty: 'transparent',
      none: 'transparent',
    }[status] || 'transparent';

  root.style.backgroundColor = color;

  if (status === 'warning') {
    htmlTarget.style.border = '1.5px solid rgba(255, 215, 0, 0.9)';
    return;
  }

  if (status === 'error') {
    htmlTarget.style.border = '1.5px solid rgba(255, 0, 0, 0.75)';
    return;
  }

  htmlTarget.style.border = '1px solid rgba(139, 92, 246, 0.35)';
  htmlTarget.style.borderRightWidth = '';
  htmlTarget.style.borderLeftWidth = '';
  htmlTarget.style.borderTopWidth = '';
  htmlTarget.style.borderBottomWidth = '';
}

// ---------------------------------------------------------------------------
// groupby가 대표쪽에만 있는 비대칭 구조까지 커버하는 "완전 그룹 id" 추출
// ---------------------------------------------------------------------------
export function getCheckboxGroupIdsFull(
  doc: ConstraintDoc,
  constraintPageNo: number,
  checkboxId: string
): string[] {
  const ids = new Set<string>();
  const base = String(checkboxId);

  ids.add(base);

  const directRule = findComponentRules(doc, constraintPageNo, base).find(
    rule => String(rule.id) === base
  ) as any;

  if (directRule?.groupby?.length) {
    ids.add(String(directRule.id));
    directRule.groupby.forEach((g: any) => {
      ids.add(String(g.id));
    });
    return Array.from(ids);
  }

  const pageRule = doc.pages?.find(
    p => Number(p.constraintPageNo) === Number(constraintPageNo)
  );

  if (!pageRule?.components) return Array.from(ids);

  for (const comp of pageRule.components) {
    const list = [
      String(comp.id),
      ...(comp.groupby ?? []).map(g => String(g.id)),
    ];

    if (list.includes(base)) {
      list.forEach(id => ids.add(id));
      break;
    }
  }

  return Array.from(ids);
}
