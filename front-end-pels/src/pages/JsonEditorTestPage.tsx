import { ArrowLeft, Braces } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ROUTES } from '../constants/routes';
import { createJSONEditor, Mode } from 'vanilla-jsoneditor';
import type { Content } from 'vanilla-jsoneditor';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

const SAMPLE_JSON = {
  title: 'vanilla-jsoneditor 테스트',
  version: '3.11.0',
  items: [1, 2, 3],
  nested: { enabled: true },
} as const;

/**
 * vanilla-jsoneditor 동작 확인용 개발 페이지
 *
 */
export default function JsonEditorTestPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const initialContent = useMemo<Content>(
    () => ({ json: { ...SAMPLE_JSON } }),
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const editor = createJSONEditor({
      target: el,
      props: {
        content: initialContent,
        mode: Mode.tree,
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
      },
    });

    return () => {
      void editor.destroy();
    };
  }, [initialContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Braces className="h-8 w-8 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-800">
              JsonEditorTestPage
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.ROOT)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Button>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle>JSON Editor</CardTitle>
            <CardDescription>
              트리 모드로 샘플 JSON을 편집해 보세요. (vanilla-jsoneditor 3.11.0)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={containerRef}
              className="jse-theme-dark h-[min(70vh,720px)] min-h-[360px] w-full overflow-hidden rounded-md border border-slate-600"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
