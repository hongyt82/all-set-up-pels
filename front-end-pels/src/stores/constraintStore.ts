// src/stores/constraintStore.ts
import { useState } from 'react';
import type {
  ConstraintDoc,
  ConstraintPageRule,
  ConstraintComponentRule,
  GroupByItem,
} from '../types/constraints';

// constraint.json 을 에디터에서 편집하기 위한 기본 상태/함수 모음
export function useConstraintStore() {
  const [constraintDoc, setConstraintDoc] = useState<ConstraintDoc>({
    docId: 'W2345A', // 임시 기본값
    pages: [],
  });

  // 특정 페이지 규칙을 가져오되 없으면 새로 만든다
  const ensurePageRule = (page: number): ConstraintPageRule => {
    const existing = constraintDoc.pages.find(p => p.page === page);
    if (existing) return existing;

    const newPage: ConstraintPageRule = { page, components: [] };
    const next: ConstraintDoc = {
      ...constraintDoc,
      pages: [...constraintDoc.pages, newPage],
    };
    setConstraintDoc(next);
    return newPage;
  };

  // 특정 컴포넌트 규칙을 가져오되 없으면 새로 만든다
  // overlayType을 추가로 받아 circleslash rule 생성 시 groupType 자동 부여
  const ensureComponentRule = (
    page: number,
    id: string,
    overlayType?: string
  ): ConstraintComponentRule => {
    const pageRule = ensurePageRule(page);
    const existing = pageRule.components.find(c => c.id === id);
    if (existing) return existing;

    // 신규 rule 생성
    const newComp: ConstraintComponentRule = { id };

    // 🔥 circleslash인 경우 groupType 자동 삽입
    if (overlayType === 'circleslash') {
      newComp.groupType = 'circleslash';
    }

    const updatedPage: ConstraintPageRule = {
      ...pageRule,
      components: [...pageRule.components, newComp],
    };

    const nextPages = constraintDoc.pages.map(p =>
      p.page === page ? updatedPage : p
    );

    const nextDoc: ConstraintDoc = { ...constraintDoc, pages: nextPages };
    setConstraintDoc(nextDoc);

    return newComp;
  };

  // 체크박스 여러 개를 라디오 그룹처럼 묶는 예시
  const setRadioGroup = (page: number, groupIds: string[]) => {
    if (groupIds.length === 0) return;

    const [representative, ...rest] = groupIds;
    const pageRule = ensurePageRule(page);

    const others = pageRule.components.filter(c => c.id !== representative);
    const repRuleBase = ensureComponentRule(page, representative);

    const repRule: ConstraintComponentRule = {
      ...repRuleBase,
      behavior: 'radio',
      groupby: rest.map(id => ({ id }) as GroupByItem),
    };

    const updatedPage: ConstraintPageRule = {
      ...pageRule,
      components: [...others, repRule],
    };

    const nextDoc: ConstraintDoc = {
      ...constraintDoc,
      pages: constraintDoc.pages.map(p => (p.page === page ? updatedPage : p)),
    };
    setConstraintDoc(nextDoc);
  };

  const loadConstraintDoc = (doc: ConstraintDoc) => {
    setConstraintDoc(doc);
  };

  return {
    constraintDoc,
    setConstraintDoc,
    ensurePageRule,
    ensureComponentRule,
    setRadioGroup,
    loadConstraintDoc,
  };
}
