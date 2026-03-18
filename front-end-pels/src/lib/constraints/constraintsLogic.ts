// src/lib/constraints/constraintsLogic.ts
import type { ConstraintDoc } from '../../types/constraints';

// 개별 expression 평가
export function evaluateConstraintExpression(
  expression: string,
  value: any
): boolean {
  if (expression === 'default') return true;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('value', `return (${expression});`);
    return fn(value);
  } catch (e) {
    console.error('[Constraint] expression 에러:', expression, e);
    return false;
  }
}

// constraints 배열에서 status 하나 결정
export function getStatusFromConstraints(
  constraints: any[] | undefined,
  value: any
): string {
  if (!Array.isArray(constraints) || constraints.length === 0) {
    return 'error';
  }
  for (const c of constraints) {
    if (evaluateConstraintExpression(c.expression, value)) {
      return c.status;
    }
  }
  return 'error';
}

// 특정 page/id 의 rule 찾기
export function findComponentRule(
  constraintDoc: ConstraintDoc | null | undefined,
  constraintPageNo: number,
  id: string
): any | null {
  if (!constraintDoc) return null;

  const pageRule = constraintDoc.pages?.find(
    p => Number(p.constraintPageNo) === Number(constraintPageNo)
  );

  if (!pageRule) return null;

  return pageRule.components?.find(c => String(c.id) === String(id)) || null;
}

// status 에 따른 하이라이트
export function highlightOverlayStatus(id: string, status: string): void {
  const el = document.getElementById(`overlay-${id}`);
  if (!el) return;

  const color =
    {
      allow: 'transparent',
      warning: 'rgba(255, 215, 0, 0.45)',
      error: 'rgba(255, 0, 0, 0.45)',
    }[status] || 'transparent';

  el.style.backgroundColor = color;
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

  // 1) 내가 대표 rule인 경우
  const directRule = findComponentRule(doc, constraintPageNo, base) as any;

  if (directRule?.groupby?.length) {
    ids.add(String(directRule.id));
    directRule.groupby.forEach((g: any) => {
      ids.add(String(g.id));
    });
    return Array.from(ids);
  }

  // 2) 내가 groupby에 포함된 경우
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

// ============================================================================
// circleslash 그룹 "트리형 연쇄" N/A 전파
// - changedId가 속한 모든 circleslash rule을 seed로 잡는다 (union).
// - seed rule의 멤버들을 추가하고,
// - 멤버 중 "대표 id(rule.id)"로 존재하는 것이 있으면 그 rule도 계속 확장(BFS).
// ============================================================================
/*export function getCircleSlashGroupIds(
  constraintDoc: ConstraintDoc | null | undefined,
  changedId: string,
  newValue: string
): string[] {
  if (!constraintDoc?.pages) return [];
  if (newValue !== 'N/A') return [];

  const result = new Set<string>();

  const collect = (node: any) => {
    if (!node?.id) return;
    const id = String(node.id);
    if (result.has(id)) return;

    result.add(id);
    if (Array.isArray(node.children)) {
      node.children.forEach(collect);
    }
  };

  for (const page of constraintDoc.pages) {
    for (const rule of page.components || []) {
      if (rule.groupType !== 'circleslash') continue;

      // 1️⃣ rule 자체가 changedId인 경우
      if (String(rule.id) === String(changedId)) {
        result.add(String(rule.id));
        if (Array.isArray(rule.children)) {
          rule.children.forEach(collect);
        }
        return Array.from(result);
      }

      // 2️⃣ children 트리 안에서 changedId 찾기
      const stack = Array.isArray(rule.children) ? [...rule.children] : [];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur) continue;

        if (String(cur.id) === String(changedId)) {
          collect(cur);
          return Array.from(result);
        }

        if (Array.isArray(cur.children)) {
          stack.push(...cur.children);
        }
      }
    }
  }

  // fallback: 자기 자신만
  return [String(changedId)];
}*/
