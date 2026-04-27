import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JsonEditorPanel } from '../components/jsoneditor';
import { Button } from '../components/ui/button';
import { ROUTES } from '../constants/routes';

const SAMPLE_JSON = {
  title: '커스텀 UI + vanilla-jsoneditor',
  version: '3.11.0',
  note: '상단 메뉴바는 끄고, 아래 버튼으로 모드·변환을 제어합니다.',
  items: [1, 2, 3],
  nested: { enabled: true },
} as const;

/**
 * 본판(데모) 페이지: 실제 구현은 `src/components/jsoneditor/` 모듈에 위치.
 */
export default function JsonEditorCustomTestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-800">
            JsonEditorCustomTestPage
          </h1>
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

        <JsonEditorPanel
          title="JSON Editor (커스텀 툴바)"
          sampleJson={{ ...SAMPLE_JSON }}
        />
      </div>
    </div>
  );
}
