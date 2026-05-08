import { useEffect, useMemo, useRef, useState } from 'react';
import { createJSONEditor, Mode } from 'vanilla-jsoneditor';
import type { Content, JsonEditor, OnChangeStatus } from 'vanilla-jsoneditor';

type Props = {
  title?: string;
  sampleJson: unknown;
};

export function JsonEditorPanel({ title = 'JSON Editor', sampleJson }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JsonEditor | null>(null);

  const [mode, setMode] = useState<Mode>(Mode.tree);

  const initialContent = useMemo<Content>(
    () => ({
      json:
        sampleJson && typeof sampleJson === 'object'
          ? // avoid accidental mutation from the editor
            JSON.parse(JSON.stringify(sampleJson))
          : sampleJson,
    }),
    [sampleJson]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const editor = createJSONEditor({
      target: el,
      props: {
        content: initialContent,
        mode,
        mainMenuBar: false,
        navigationBar: true,
        statusBar: true,
        onChange: (
          updatedContent: Content,
          _previousContent: Content,
          _status: OnChangeStatus
        ) => {
          // keep editor state internal; consumer can add callbacks later if needed
          void updatedContent;
        },
      },
    });

    editorRef.current = editor;

    return () => {
      editorRef.current = null;
      void editor.destroy();
    };
  }, [initialContent, mode]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="font-medium text-slate-800">{title}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(Mode.tree)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              mode === Mode.tree
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => setMode(Mode.text)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              mode === Mode.text
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Text
          </button>
        </div>
      </div>

      <div className="p-4">
        <div ref={containerRef} className="min-h-[520px] w-full" />
      </div>
    </section>
  );
}
