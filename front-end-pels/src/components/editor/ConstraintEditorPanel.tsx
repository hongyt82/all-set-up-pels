// src/components/editor/ConstraintEditorPanel.tsx
import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

interface ConstraintSelection {
  page: number;
  primaryId: string;
  ids: string[];
  mode?: 'rule' | 'page';
}

interface ConstraintEditorPanelProps {
  selection: ConstraintSelection;
  text: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onRevert: () => void;
  onSave: () => void;
  onAppendSelectedIds: () => void;
  onDelete?: () => void;
  helperText?: string;
  onChangeHelperText?: (value: string) => void;
}

export const ConstraintEditorPanel: React.FC<ConstraintEditorPanelProps> = ({
  selection,
  text,
  onChangeText,
  onClose,
  onRevert,
  onSave,
  onAppendSelectedIds,
  onDelete,
  helperText,
  onChangeHelperText,
}) => {
  const { page, primaryId, ids, mode = 'rule' } = selection;

  // 🔹 초기 크기 / 위치
  const [size, setSize] = useState({ width: 440, height: 440 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const margin = 24;
    const x = window.innerWidth - size.width - margin;
    const y = window.innerHeight - size.height - 140; // 푸터 피해서 살짝 위

    setPosition({
      x: Math.max(margin, x),
      y: Math.max(80, y),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title =
    mode === 'page'
      ? `페이지 전체 Rule 편집 (page ${page})`
      : `Rule 편집 (page ${page}, id: ${primaryId})`;

  return (
    <Rnd
      size={size}
      position={position}
      onDragStop={(_e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition({ x: pos.x, y: pos.y });
      }}
      minWidth={360}
      minHeight={260}
      bounds="window"
      // 🔹 헤더(className="cep-drag-handle") 부분에서만 드래그 가능
      dragHandleClassName="cep-drag-handle"
      style={{
        position: 'fixed',
        zIndex: 50,
      }}
    >
      <div className="w-full h-full bg-slate-900 text-slate-50 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 : 여기만 드래그 핸들 */}
        <div className="cep-drag-handle px-3 py-2 flex items-center justify-between border-b border-slate-700 cursor-move select-none">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{title}</span>
            <span className="text-[10px] text-slate-400">
              선택된 컴포넌트: {ids.length}개
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* 🔹 삭제 버튼 (rule 모드일 때만 노출 / onDelete 있을 때만) */}
            {mode === 'rule' && onDelete && (
              <button
                type="button"
                className="text-[10px] px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600"
                onClick={onDelete}
              >
                삭제
              </button>
            )}
            <button
              type="button"
              className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
              onClick={onRevert}
            >
              되돌리기
            </button>
            <button
              type="button"
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500"
              onClick={onSave}
            >
              저장
            </button>
            <button
              type="button"
              className="ml-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
          {/* 대표 ID / 선택된 ID 표시 영역 */}
          <div className="flex flex-col gap-1 text-[11px]">
            {mode === 'rule' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-300 min-w-[62px]">대표 ID</span>
                <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-slate-800 text-[11px] font-mono">
                  {primaryId}
                </span>
              </div>
            )}

            {/*{mode === 'rule' && selection.primaryId && (
              <div className="flex items-start gap-1 mt-1 text-[10px]">
                <span className="text-slate-400 min-w-[62px]">groupType</span>
                <span className="px-2 py-[2px] rounded bg-slate-800 text-[10px] font-mono">
                  {(() => {
                    try {
                      return JSON.parse(text)?.groupType ?? '없음';
                    } catch (e) {
                      return '없음';
                    }
                  })()}
                </span>
              </div>
            )}*/}

            <div className="flex items-start gap-1">
              <span className="text-slate-300 min-w-[62px] mt-[2px]">
                선택된 ID
              </span>
              <div className="flex flex-wrap gap-1">
                {ids.map(id => (
                  <span
                    key={id}
                    className="inline-flex items-center px-2 py-[2px] rounded-full bg-slate-800 text-[10px] font-mono"
                  >
                    {id}
                  </span>
                ))}
                {ids.length === 0 && (
                  <span className="text-[10px] text-slate-500">
                    선택된 컴포넌트가 없습니다.
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px]"
                onClick={onAppendSelectedIds}
              >
                {mode === 'page'
                  ? '선택 추가(ID 임시영역)'
                  : '선택 추가(groupby)'}
              </button>
            </div>
          </div>

          {/* JSON 편집 textarea */}
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <span className="text-[11px] text-slate-300">JSON 편집</span>
            <textarea
              className="flex-1 w-full text-xs font-mono bg-slate-950/60 text-slate-50 border border-slate-700 rounded-md p-2 resize-none leading-[1.4] overflow-auto"
              value={text}
              onChange={e => onChangeText(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();
              }}
              onClick={e => {
                e.stopPropagation();
              }}
            />
          </div>
          {mode === 'page' && (
            <div className="flex flex-col gap-1 mb-2">
              <span className="text-[11px] text-slate-300">
                선택 ID 임시영역
              </span>
              <textarea
                className="w-full h-24 text-xs font-mono bg-slate-950/60 text-slate-50 border border-slate-700 rounded-md p-2 resize-none leading-[1.4] overflow-auto"
                value={helperText ?? ''}
                onChange={e => onChangeHelperText?.(e.target.value)}
                onKeyDown={e => {
                  e.stopPropagation();
                }}
                onClick={e => {
                  e.stopPropagation();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
};
