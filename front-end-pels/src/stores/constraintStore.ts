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
  const ensurePageRule = (constraintPageNo: number): ConstraintPageRule => {
    const existing = constraintDoc.pages.find(
      p => p.constraintPageNo === constraintPageNo
    );
    if (existing) return existing;

    const newPage: ConstraintPageRule = {
      constraintPageNo,
      components: [],
    };
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
    constraintPageNo: number,
    id: string,
    overlayType?: string
  ): ConstraintComponentRule => {
    const pageRule = ensurePageRule(constraintPageNo);
    const existing = pageRule.components.find(c => c.id === id);
    if (existing) return existing;

    const newComp: ConstraintComponentRule = { id };

    if (overlayType === 'circleslash') {
      newComp.groupType = 'circleslash';
    }

    const updatedPage: ConstraintPageRule = {
      ...pageRule,
      components: [...pageRule.components, newComp],
    };

    const nextDoc: ConstraintDoc = {
      ...constraintDoc,
      pages: constraintDoc.pages.map(p =>
        p.constraintPageNo === constraintPageNo ? updatedPage : p
      ),
    };

    // 새 페이지였던 경우 map만으로는 안 들어가므로 보정
    if (
      !constraintDoc.pages.some(p => p.constraintPageNo === constraintPageNo)
    ) {
      nextDoc.pages = [...constraintDoc.pages, updatedPage];
    }

    setConstraintDoc(nextDoc);
    return newComp;
  };

  // 체크박스 여러 개를 라디오 그룹처럼 묶는 예시
  const setRadioGroup = (constraintPageNo: number, groupIds: string[]) => {
    if (groupIds.length === 0) return;

    const [representative, ...rest] = groupIds;
    const pageRule = ensurePageRule(constraintPageNo);

    const others = pageRule.components.filter(c => c.id !== representative);
    const repRuleBase = ensureComponentRule(constraintPageNo, representative);

    const repRule: ConstraintComponentRule = {
      ...repRuleBase,
      behavior: 'radio',
      groupby: rest.map(id => ({ id }) as GroupByItem),
    };

    const updatedPage: ConstraintPageRule = {
      ...pageRule,
      components: [...others, repRule],
    };

    const exists = constraintDoc.pages.some(
      p => p.constraintPageNo === constraintPageNo
    );

    const nextDoc: ConstraintDoc = {
      ...constraintDoc,
      pages: exists
        ? constraintDoc.pages.map(p =>
            p.constraintPageNo === constraintPageNo ? updatedPage : p
          )
        : [...constraintDoc.pages, updatedPage],
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
    // ensureComponentRule,
    setRadioGroup,
    loadConstraintDoc,
  };
}
