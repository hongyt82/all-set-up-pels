import {
  AlertTriangle,
  Braces,
  LayoutList,
  ListTree,
  PanelTop,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mode } from 'vanilla-jsoneditor';
import { useJsonEditorEngine } from './useJsonEditorEngine';

type Props = {
  title?: string;
  sampleJson?: unknown;
};

export function JsonEditorPanel({ title = 'JSON Editor', sampleJson }: Props) {
  const engine = useJsonEditorEngine();

  const {
    containerRef,
    hostRef,
    mode,
    documentEmpty,
    liveJsonIssue,
    parseIssueMeta,
    refreshBanner,
    contextMenu,
    setEditorMode,
    onHostContextMenu,
    closeContextMenu,
    seedEmptyObject,
    seedEmptyArray,
    seedSampleJson,
    handleRefreshValidate,
    moveCursorToError,
    autoRepairIfPossible,
    copyAllJson,
    pasteJsonFromClipboard,
  } = engine;

  return (
    <Card className="border-slate-200 shadow-md">
      {/* Scoped style: hide vanilla-jsoneditor bottom message/status bar */}
      <style>{`
        .jsoneditor-host .jse-status-bar,
        .jsoneditor-host .jse-message,
        .jsoneditor-host .jse-message-bar,
        .jsoneditor-host .jse-text-error,
        .jsoneditor-host .jse-text-status,
        .jsoneditor-host .jse-main .jse-status-bar,
        .jsoneditor-host .jse-main .jse-message,
        .jsoneditor-host .jse-main .jse-message-bar,
        .jsoneditor-host .jse-main .jse-text-error,
        .jsoneditor-host .jse-main .jse-text-status {
          display: none !important;
        }

        /* Tree mode: hide expand/collapse caret (left arrow) */
        .jsoneditor-host .jse-tree-mode .jse-expand,
        .jsoneditor-host .jse-tree-mode .jse-collapse,
        .jsoneditor-host .jse-tree-mode .jse-toggle,
        .jsoneditor-host .jse-tree-mode .jse-expand-button,
        .jsoneditor-host .jse-tree-mode .jse-collapse-button,
        .jsoneditor-host .jse-tree-mode button[aria-label*="Expand"],
        .jsoneditor-host .jse-tree-mode button[aria-label*="Collapse"] {
          display: none !important;
        }
      `}</style>

      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {liveJsonIssue ? (
          <Alert
            variant={liveJsonIssue.kind === 'parse' ? 'destructive' : 'default'}
            className={
              liveJsonIssue.kind === 'validation'
                ? 'border-amber-300 bg-amber-50 text-amber-950 [&>svg]:text-amber-700'
                : undefined
            }
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>{liveJsonIssue.title}</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <div>{liveJsonIssue.detail}</div>
                {liveJsonIssue.kind === 'parse' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={moveCursorToError}
                    >
                      오류 위치로 이동
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={autoRepairIfPossible}
                      disabled={!parseIssueMeta?.isRepairable}
                    >
                      자동 수정
                    </Button>
                  </div>
                ) : null}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {refreshBanner ? (
          <Alert
            variant={refreshBanner.kind === 'error' ? 'destructive' : 'default'}
            className={
              refreshBanner.kind === 'warn'
                ? 'border-amber-300 bg-amber-50 text-amber-950 [&>svg]:text-amber-700'
                : refreshBanner.kind === 'ok'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : undefined
            }
          >
            <RefreshCw className="size-4" />
            <AlertTitle>{refreshBanner.title}</AlertTitle>
            <AlertDescription>{refreshBanner.detail}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-300 bg-slate-100/80 p-3">
          <span className="text-xs font-medium text-slate-600">모드</span>
          <Button
            type="button"
            size="sm"
            variant={mode === Mode.text ? 'default' : 'outline'}
            onClick={() => setEditorMode(Mode.text)}
            className="gap-1"
          >
            <PanelTop className="h-3.5 w-3.5" />
            text
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === Mode.tree ? 'default' : 'outline'}
            onClick={() => setEditorMode(Mode.tree)}
            className="gap-1"
          >
            <LayoutList className="h-3.5 w-3.5" />
            tree
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRefreshValidate}
            className="gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            새로고침
          </Button>
        </div>

        <div
          ref={hostRef}
          onContextMenu={onHostContextMenu}
          className="jsoneditor-host relative h-[min(65vh,680px)] min-h-[320px] w-full overflow-hidden rounded-md border border-slate-600"
        >
          <div ref={containerRef} className="jse-theme-dark absolute inset-0" />

          {contextMenu.open ? (
            <div
              className="absolute z-30 min-w-56 rounded-md border border-slate-700 bg-[#2a2a2a] p-1 text-sm text-slate-100 shadow-xl"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
              role="menu"
              aria-label="JSON 컨텍스트 메뉴"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-700/60"
                onClick={copyAllJson}
              >
                JSON 복사(전체)
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-700/60"
                onClick={pasteJsonFromClipboard}
              >
                JSON 붙여넣기
              </button>
              <div className="my-1 h-px bg-slate-700/80" />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-700/60"
                onClick={() => {
                  void seedEmptyObject();
                  closeContextMenu();
                }}
              >
                빈 객체 만들기 {'{}'}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-700/60"
                onClick={() => {
                  void seedEmptyArray();
                  closeContextMenu();
                }}
              >
                빈 배열 만들기 {'[]'}
              </button>
              {sampleJson !== undefined ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-700/60"
                  onClick={() => {
                    void seedSampleJson(sampleJson);
                    closeContextMenu();
                  }}
                >
                  예시 JSON 불러오기
                </button>
              ) : null}
            </div>
          ) : null}

          {documentEmpty ? (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#1e1e1e] px-6 text-center text-slate-200"
              role="region"
              aria-label="빈 JSON 문서 안내"
            >
              <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold text-white">
                  문서가 비어 있습니다
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  클립보드 내용을 붙여넣거나, 아래에서 새 JSON을 시작할 수
                  있습니다.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => void seedEmptyObject()}
                >
                  <Braces className="h-4 w-4" />빈 객체 만들기 {'{}'}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => void seedEmptyArray()}
                >
                  <ListTree className="h-4 w-4" />빈 배열 만들기 {'[]'}
                </Button>
                {sampleJson !== undefined ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    onClick={() => void seedSampleJson(sampleJson)}
                  >
                    예시 JSON 불러오기
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
