// src/components/editor/ConstraintEditorPanel.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

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

  externalInsertText?: {
    value: string;
    seq: number;
  } | null;
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
  externalInsertText,
}) => {
  const { page, primaryId, ids, mode = 'rule' } = selection;

  const [size, setSize] = useState({ width: 490, height: 560 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const sizeRef = useRef(size);
  const editorRef = useRef<any>(null);

  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  {
    /* 필드 참조는 수식 문법 확정 후 다시 활성화 */
  }
  // const [formulaError, setFormulaError] = useState('');

  const [cursorInfo, setCursorInfo] = useState({ from: 0, to: 0 });
  const [canSave, setCanSave] = useState(true);

  const formulaTokens = [
    '<=',
    '>=',
    '==',
    '!=',
    'AND',
    'OR',
    '+',
    '-',
    '*',
    '/',
  ];

  useEffect(() => {
    let nextJsonError = '';

    try {
      JSON.parse(text || '{}');
    } catch (err: any) {
      nextJsonError = err?.message || 'JSON 문법 오류';
    }

    setJsonError(nextJsonError);
    setCanSave(!nextJsonError);
  }, [text]);

  const insertAtCursor = (insertText: string) => {
    const view = editorRef.current?.view;
    if (!view) {
      onChangeText(`${text}${insertText}`);
      return;
    }

    const { from, to } = view.state.selection.main;

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: { anchor: from + insertText.length },
    });

    const nextValue = view.state.doc.toString();
    onChangeText(nextValue);
  };

  useEffect(() => {
    if (!externalInsertText?.value) return;

    insertAtCursor(externalInsertText.value);
  }, [externalInsertText?.seq]);

  {
    /* Formula Validator는 추후 수식 필드 기준으로 별도 적용 */
  }
  // const handleInsertFieldRef = () => {
  //   const fieldName = window
  //     .prompt('삽입할 필드명을 입력하세요', 'FIELD_ID')
  //     ?.trim();
  //   if (!fieldName) return;
  //
  //   insertAtCursor(`\${${fieldName}}`);
  // };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      const margin = 15;
      const currentSize = sizeRef.current;

      const x = window.innerWidth - currentSize.width - margin;
      const y = window.innerHeight - currentSize.height - 45;

      setPosition({
        x: Math.max(margin, x),
        y: Math.max(80, y),
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const formatConstraintJson = (obj: any): string => {
    let s = JSON.stringify(obj, null, 2);

    s = s.replace(
      /\{\s*[\r\n]+\s*"id"\s*:\s*"([^"]+)"\s*[\r\n]+\s*\}/g,
      '{ "id": "$1" }'
    );

    return s;
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(text || '{}');
      onChangeText(formatConstraintJson(parsed));
    } catch (err) {
      alert('JSON 형식이 올바르지 않아 자동 정렬할 수 없습니다.');
    }
  };

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
      minHeight={340}
      bounds="window"
      dragHandleClassName="cep-drag-handle"
      style={{
        position: 'fixed',
        zIndex: 50,
      }}
    >
      <div className="w-full h-full bg-slate-900 text-slate-50 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="cep-drag-handle px-3 py-2 flex items-center justify-between border-b border-slate-700 cursor-move select-none">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{title}</span>
            <span className="text-[10px] text-slate-400">
              선택된 컴포넌트: {ids.length}개
            </span>
          </div>
          <div className="flex items-center gap-1">
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
              className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500"
              onClick={handleBeautify}
            >
              Format
            </button>
            <button
              type="button"
              className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
              onClick={onRevert}
            >
              되돌리기
            </button>
            <button
              type="button"
              className={`text-[10px] px-2 py-0.5 rounded ${
                canSave
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-slate-600 text-slate-300 cursor-not-allowed'
              }`}
              onClick={onSave}
              disabled={!canSave}
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

        <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
          <div className="flex flex-col gap-1 text-[11px]">
            {mode === 'rule' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-300 min-w-[62px]">대표 ID</span>
                <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-slate-800 text-[11px] font-mono">
                  {primaryId}
                </span>
              </div>
            )}

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

          <div className="flex flex-wrap gap-1">
            {formulaTokens.map(token => (
              <button
                key={token}
                type="button"
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px]"
                onClick={() => insertAtCursor(` ${token} `)}
              >
                {token}
              </button>
            ))}

            {/* 필드 참조는 수식 문법 확정 후 다시 활성화 */}
            {/*<button
              type="button"
              className="px-2 py-0.5 rounded bg-indigo-700 hover:bg-indigo-600 text-[11px]"
              onClick={handleInsertFieldRef}
            >
              필드 참조
            </button>*/}
          </div>

          <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
            <span>Cursor: {cursorInfo.from}</span>
            <span>JSON: {jsonError ? '오류' : '정상'}</span>
            <span>Formula: 미검사</span>
            <span>저장 가능: {canSave ? '가능' : '불가'}</span>
          </div>

          {jsonError && (
            <div className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-800 rounded px-2 py-1">
              JSON 오류: {jsonError}
            </div>
          )}

          {/* Formula Validator는 추후 수식 필드 기준으로 별도 적용 */}
          {/*{!jsonError && formulaError && (
            <div className="text-[10px] text-amber-300 bg-amber-950/30 border border-amber-800 rounded px-2 py-1">
              Formula 오류: {formulaError}
            </div>
          )}*/}

          <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
            <span className="text-[11px] text-slate-300">JSON 편집</span>
            <div className="flex-1 min-h-0 overflow-auto border border-slate-700 rounded-md bg-slate-950/60">
              <CodeMirror
                value={text}
                height="100%"
                extensions={[json()]}
                theme="dark"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  autocompletion: true,
                  bracketMatching: true,
                }}
                style={{
                  height: '100%',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  lineHeight: '1.4',
                }}
                onCreateEditor={view => {
                  editorRef.current = { view };
                }}
                onUpdate={update => {
                  if (update.selectionSet) {
                    const { from, to } = update.state.selection.main;
                    setCursorInfo({ from, to });
                  }

                  if (update.docChanged) {
                    onChangeText(update.state.doc.toString());
                  }
                }}
              />
            </div>
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
