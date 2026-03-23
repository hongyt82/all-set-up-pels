// src/components/editor/ConstraintRuleListPanel.tsx
import React from 'react';
import type { ConstraintDoc } from '../../types/constraints';

interface ConstraintRuleListPanelProps {
  displayPage: number;
  constraintPageNo: number;
  constraintDoc: ConstraintDoc | null;
  onSelectRule: (payload: {
    page: number;
    constraintPageNo: number;
    ruleId: string;
    ids: string[];
  }) => void;
  onClose: () => void;
}

export const ConstraintRuleListPanel: React.FC<
  ConstraintRuleListPanelProps
  // > = ({ constraintPageNo, constraintDoc, onSelectRule, onClose }) => {
> = ({
  displayPage,
  constraintPageNo,
  constraintDoc,
  onSelectRule,
  onClose,
}) => {
  if (!constraintDoc?.pages?.length) return null;

  // page가 number/string 혼재해도 매칭되도록
  const pageRule = constraintDoc.pages.find(
    (p: any) => Number(p.constraintPageNo) === Number(constraintPageNo)
  );

  const rules = (pageRule as any)?.components || [];

  // 이 페이지에 있는 모든 rule id + groupby id
  const allGroupIds: string[] = rules.length
    ? Array.from(
        new Set(
          rules.flatMap((rule: any) => [
            String(rule.id),
            ...((rule.groupby || []) as any[]).map(g => String(g.id)),
          ])
        )
      )
    : [];

  return (
    <div
      className="
        fixed
        right-4
        top-24
        w-[260px]
        max-h-[60vh]
        bg-slate-900
        text-slate-50
        border border-slate-700
        rounded-xl
        shadow-xl
        p-3
        flex
        flex-col
        gap-2
        z-40
      "
    >
      <div className="flex items-center justify-between mb-1">
        {/*<div className="text-xs font-semibold">Rule 목록 (page {constraintPageNo})</div>*/}
        <div className="text-xs font-semibold">
          Rule 목록 (page {displayPage})
        </div>
        <button
          type="button"
          className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
          onClick={onClose}
        >
          닫기
        </button>
      </div>

      {/* 맨 위: 이 페이지 전체 JSON 편집 (components 없어도 dialoges/qr_dialoges 때문에 pageRule은 존재할 수 있음) */}
      {pageRule && (
        <button
          type="button"
          onClick={() =>
            onSelectRule({
              page: displayPage,
              constraintPageNo,
              ruleId: '__PAGE_ALL__',
              ids: allGroupIds,
            })
          }
          className="
            w-full
            text-left
            text-[11px]
            px-2 py-1.5
            rounded
            bg-emerald-700
            hover:bg-emerald-600
            border border-emerald-500/70
            flex flex-col
            gap-0.5
            mb-1
          "
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">이 페이지 전체 JSON</span>
            <span className="text-[10px] text-emerald-100">
              rules: {rules.length}
            </span>
          </div>
          <div className="text-[10px] text-emerald-100/80">
            page {constraintPageNo} 의 전체 JSON
          </div>
        </button>
      )}

      {/* 개별 rule 목록 */}
      {rules.length === 0 ? (
        <div className="text-[11px] text-slate-400">
          이 페이지에는 rule 이 없습니다.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mt-1 space-y-1">
          {rules.map((rule: any, idx: number) => {
            const id = String(rule.id);
            const groupIds: string[] = [
              id,
              ...((rule.groupby || []) as any[]).map(g => String(g.id)),
            ];
            const constraintsCount = (rule.constraints || []).length;
            const eventsCount = (rule.events || []).length;

            return (
              <button
                key={`${id}-${idx}`}
                type="button"
                onClick={() =>
                  onSelectRule({
                    page: displayPage,
                    constraintPageNo,
                    ruleId: id,
                    ids: Array.from(new Set(groupIds)),
                  })
                }
                className="
                  w-full
                  text-left
                  text-[11px]
                  px-2 py-1.5
                  rounded
                  bg-slate-800
                  hover:bg-slate-700
                  border border-slate-700/60
                  flex flex-col
                  gap-0.5
                "
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] truncate max-w-[140px]">
                    {id}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    grp {groupIds.length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  constraints: {constraintsCount}, events: {eventsCount}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
