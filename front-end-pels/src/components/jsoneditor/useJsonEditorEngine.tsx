import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createJSONEditor,
  isContentParseError,
  isContentValidationErrors,
  isJSONContent,
  Mode,
  SelectionType,
  type Content,
  type JsonEditor,
  type JSONEditorSelection,
  type OnChangeStatus,
} from 'vanilla-jsoneditor';
import type {
  ContextMenuState,
  LiveJsonIssue,
  ParseIssueMeta,
  RefreshBanner,
} from './types';
import {
  asTextForClipboard,
  clamp,
  formatParseFailureMessage,
  isDocumentVisuallyEmpty,
} from './utils';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

export function useJsonEditorEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JsonEditor | null>(null);

  const [mode, setMode] = useState<Mode>(Mode.text);
  const [documentEmpty, setDocumentEmpty] = useState(true);
  const [liveJsonIssue, setLiveJsonIssue] = useState<LiveJsonIssue | null>(
    null
  );
  const [parseIssueMeta, setParseIssueMeta] = useState<ParseIssueMeta>(null);
  const [refreshBanner, setRefreshBanner] = useState<RefreshBanner | null>(
    null
  );
  const [lastSelection, setLastSelection] = useState<JSONEditorSelection>();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
  });

  const initialContent = useMemo<Content>(() => ({ text: '' }), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const editor = createJSONEditor({
      target: el,
      props: {
        content: initialContent,
        mode: Mode.text,
        mainMenuBar: false,
        navigationBar: true,
        statusBar: false,
        onSelect: (selection: JSONEditorSelection | undefined) =>
          setLastSelection(selection),
        onRenderContextMenu: () => false,
        onChange: (
          content: Content,
          _previous: Content,
          status: OnChangeStatus
        ) => {
          setDocumentEmpty(isDocumentVisuallyEmpty(content));

          const errs = status.contentErrors;
          if (errs === undefined) {
            setLiveJsonIssue(null);
            setParseIssueMeta(null);
            return;
          }
          if (isContentParseError(errs)) {
            const { position, line, column, message } = errs.parseError;
            const loc =
              line != null && column != null
                ? `${line}행 ${column}열`
                : '위치 정보 없음';
            setLiveJsonIssue({
              kind: 'parse',
              title: 'JSON 입력 오류',
              detail: `${loc} 부근에서 구문이 올바르지 않습니다. 상세: ${message}`,
            });
            setParseIssueMeta({
              position,
              line: line ?? undefined,
              column: column ?? undefined,
              isRepairable: errs.isRepairable,
            });
            return;
          }
          if (isContentValidationErrors(errs)) {
            const n = errs.validationErrors.length;
            setLiveJsonIssue({
              kind: 'validation',
              title: '검증 알림',
              detail: `스키마·검증 규칙 기준 ${n}건의 이슈가 있습니다. 에디터 내 표시를 함께 확인해 주세요.`,
            });
            setParseIssueMeta(null);
            return;
          }
          setLiveJsonIssue(null);
          setParseIssueMeta(null);
        },
      },
    });

    editorRef.current = editor;

    return () => {
      void editor.destroy();
      editorRef.current = null;
    };
  }, [initialContent]);

  const setEditorMode = useCallback((next: Mode) => {
    editorRef.current?.updateProps({ mode: next });
    setMode(next);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ open: false });
  }, []);

  useEffect(() => {
    if (!contextMenu.open) return;

    const handleDown = (e: MouseEvent) => {
      const wrap = hostRef.current;
      if (!wrap) return;
      const target = e.target as Node | null;
      if (target && wrap.contains(target)) return;
      closeContextMenu();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };
    window.addEventListener('mousedown', handleDown, true);
    window.addEventListener('keydown', handleEsc, true);
    return () => {
      window.removeEventListener('mousedown', handleDown, true);
      window.removeEventListener('keydown', handleEsc, true);
    };
  }, [closeContextMenu, contextMenu.open]);

  const onHostContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const wrap = hostRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      setContextMenu({
        open: true,
        x: clamp(e.clientX - r.left, 8, r.width - 8),
        y: clamp(e.clientY - r.top, 8, r.height - 8),
        selection: lastSelection,
      });
    },
    [lastSelection]
  );

  const seedTextEmpty = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.updateProps({ content: { text: '' }, mode: Mode.text });
    setMode(Mode.text);
    await ed.refresh();
    setDocumentEmpty(true);
    setLiveJsonIssue(null);
    setParseIssueMeta(null);
  }, []);

  const seedEmptyObject = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.updateProps({ content: { json: {} }, mode: Mode.tree });
    setMode(Mode.tree);
    await ed.refresh();
    setDocumentEmpty(false);
    setLiveJsonIssue(null);
    setParseIssueMeta(null);
  }, []);

  const seedEmptyArray = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.updateProps({ content: { json: [] }, mode: Mode.tree });
    setMode(Mode.tree);
    await ed.refresh();
    setDocumentEmpty(false);
    setLiveJsonIssue(null);
    setParseIssueMeta(null);
  }, []);

  const seedSampleJson = useCallback(async (sample: unknown) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.updateProps({ content: { json: sample }, mode: Mode.tree });
    setMode(Mode.tree);
    await ed.refresh();
    setDocumentEmpty(false);
    setLiveJsonIssue(null);
    setParseIssueMeta(null);
  }, []);

  const handleRefreshValidate = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) {
      setRefreshBanner({
        kind: 'error',
        title: '에디터를 사용할 수 없습니다',
        detail: '페이지를 새로 불러온 뒤 다시 시도해 주세요.',
      });
      return;
    }

    const content = ed.get();

    try {
      if (isJSONContent(content)) {
        if (content.json === undefined || content.json === null) {
          setRefreshBanner({
            kind: 'error',
            title: '문서가 비어 있습니다',
            detail:
              '먼저 빈 객체·배열을 만들거나 붙여넣은 뒤, 새로고침을 눌러 주세요.',
          });
          return;
        }
        const normalized = JSON.parse(JSON.stringify(content.json)) as unknown;
        ed.updateProps({ content: { json: normalized } });
      } else {
        const text = content.text?.trim() ?? '';
        if (text.length === 0) {
          setRefreshBanner({
            kind: 'error',
            title: 'JSON이 비어 있습니다',
            detail: '텍스트 모드에서 내용을 입력한 뒤 다시 눌러 주세요.',
          });
          return;
        }
        const parsed = JSON.parse(text) as unknown;
        ed.updateProps({ content: { json: parsed }, mode: Mode.tree });
        setMode(Mode.tree);
      }

      await ed.refresh();

      const validation = ed.validate();
      if (validation === undefined) {
        setRefreshBanner({
          kind: 'ok',
          title: '검사 완료',
          detail:
            'JSON 구조가 정상입니다. 편집한 내용을 반영해 화면을 다시 표시했습니다.',
        });
        return;
      }

      if (isContentParseError(validation)) {
        const { line, column, message } = validation.parseError;
        const loc =
          line != null && column != null
            ? `${line}행 ${column}열 근처`
            : '입력 위치 확인';
        setRefreshBanner({
          kind: 'error',
          title: 'JSON 구문 오류',
          detail: `${loc}: ${message}`,
        });
        return;
      }

      if (isContentValidationErrors(validation)) {
        const n = validation.validationErrors.length;
        setRefreshBanner({
          kind: 'warn',
          title: '추가 검증 이슈',
          detail: `구조는 유효하지만 검증 규칙에서 ${n}건의 항목이 있습니다. 에디터 안내를 확인해 주세요.`,
        });
        return;
      }

      setRefreshBanner({
        kind: 'ok',
        title: '검사 완료',
        detail: '내용을 반영했습니다.',
      });
    } catch (err) {
      setRefreshBanner({
        kind: 'error',
        title: 'JSON 형식이 올바르지 않습니다',
        detail: `구문을 분석할 수 없습니다. ${formatParseFailureMessage(err)}`,
      });
    }
  }, []);

  const moveCursorToError = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || !parseIssueMeta) return;
    setEditorMode(Mode.text);
    const pos = parseIssueMeta.position;
    if (typeof pos === 'number' && Number.isFinite(pos)) {
      ed.select({
        type: SelectionType.text,
        ranges: [{ anchor: pos, head: pos }],
        main: 0,
      });
    }
    ed.focus();
  }, [parseIssueMeta, setEditorMode]);

  const autoRepairIfPossible = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    try {
      ed.updateProps({ mode: Mode.text });
      setMode(Mode.text);
      await ed.refresh();

      // vanilla-jsoneditor 버전에 따라 acceptAutoRepair가
      // - 내부적으로 바로 적용(void 반환)하거나
      // - 보정된 Content를 반환하는 케이스가 있어 둘 다 지원한다.
      const repaired = ed.acceptAutoRepair() as unknown;
      if (
        repaired &&
        typeof repaired === 'object' &&
        (Object.prototype.hasOwnProperty.call(repaired, 'json') ||
          Object.prototype.hasOwnProperty.call(repaired, 'text'))
      ) {
        ed.set(repaired as Content);
      }
      await ed.refresh();

      const after = ed.validate();
      if (after && isContentParseError(after)) {
        setRefreshBanner({
          kind: 'warn',
          title: '자동 수정은 일부만 적용되었습니다',
          detail:
            '여전히 구문 오류가 남아 있습니다. 오류 위치로 이동 후 수동으로 마무리해 주세요.',
        });
        return;
      }

      setRefreshBanner({
        kind: 'ok',
        title: '자동 수정 완료',
        detail: '손상된 JSON을 보정해 반영했습니다.',
      });
    } catch (err) {
      setRefreshBanner({
        kind: 'error',
        title: '자동 수정 실패',
        detail: `자동 보정에 실패했습니다. ${formatParseFailureMessage(err)}`,
      });
    }
  }, []);

  const copyAllJson = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    try {
      const text = asTextForClipboard(ed.get());
      await navigator.clipboard.writeText(text);
      setRefreshBanner({
        kind: 'ok',
        title: '복사 완료',
        detail: 'JSON 텍스트를 클립보드에 복사했습니다.',
      });
    } catch (err) {
      setRefreshBanner({
        kind: 'error',
        title: '복사 실패',
        detail: `클립보드 접근에 실패했습니다. ${formatParseFailureMessage(err)}`,
      });
    } finally {
      closeContextMenu();
    }
  }, [closeContextMenu]);

  const pasteJsonFromClipboard = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) {
        setRefreshBanner({
          kind: 'error',
          title: '붙여넣기 실패',
          detail: '클립보드가 비어 있습니다.',
        });
        return;
      }
      const parsed = JSON.parse(trimmed) as unknown;
      ed.updateProps({ content: { json: parsed }, mode: Mode.tree });
      setMode(Mode.tree);
      await ed.refresh();
      setRefreshBanner({
        kind: 'ok',
        title: '붙여넣기 완료',
        detail: '클립보드 JSON을 반영했습니다.',
      });
    } catch (err) {
      setRefreshBanner({
        kind: 'error',
        title: '붙여넣기 실패',
        detail: `JSON 해석에 실패했습니다. ${formatParseFailureMessage(err)}`,
      });
    } finally {
      closeContextMenu();
    }
  }, [closeContextMenu]);

  return {
    // refs
    containerRef,
    hostRef,
    editorRef,

    // state
    mode,
    documentEmpty,
    liveJsonIssue,
    parseIssueMeta,
    refreshBanner,
    contextMenu,

    // actions
    setEditorMode,
    onHostContextMenu,
    closeContextMenu,
    seedTextEmpty,
    seedEmptyObject,
    seedEmptyArray,
    seedSampleJson,
    handleRefreshValidate,
    moveCursorToError,
    autoRepairIfPossible,
    copyAllJson,
    pasteJsonFromClipboard,
    setRefreshBanner,
  };
}
