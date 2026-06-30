import React from 'react';
import type { ToolCategory } from './EditorHeader.tsx';
// import type { OverlayType } from '../workspace/PDFWorkspace.tsx';
import type { OverlayType } from '../../components/editor/EditorWorkspace';
import { Button } from '../ui/button.tsx';
import { MENU_LABELS } from '../../constants/mainmenu';
import { devLog } from '../../utils/devConsole';

interface ToolPaletteProps {
  selectedCategory?: ToolCategory | null;
  selectedTool?: string | null; // 🔹 이제 "툴 id" 기준으로 씀
  onToolSelect?: (tool: string) => void; //   (예: 'calendar_default', 'calendar_datetime')
  onAddOverlay?: (tool: OverlayType, option?: string) => void;
  isOverlayVisible?: boolean;
}

// null 제거한 카테고리 타입 (Record 키에서는 null 사용 불가)
type NonNullToolCategory = Exclude<ToolCategory, null>;

// 🔹 툴 정보 타입
type ToolConfig = {
  id: string;
  type: OverlayType;
  label: string;
  option?: string;
};

// 🔹 카테고리 → 퀵 추가 버튼들
//    이제 배열로 바꿔서 한 카테고리에 여러 버튼 가능
const QUICK_TOOL_BY_CATEGORY: Partial<
  Record<NonNullToolCategory, ToolConfig[]>
> = {
  textbox: [
    { id: 'textbox', type: 'textbox', label: '단일 텍스트' },
    { id: 'textbox_multiline', type: 'textbox_multiline', label: '멀티라인' },
    { id: 'textbox_num', type: 'textbox_num', label: '숫자' },
    { id: 'textbox_name', type: 'textbox_name', label: '수행자 이름' },
    { id: 'textbox_verifier', type: 'textbox_verifier', label: '확인자 이름' },
  ],

  checkbox: [{ id: 'checkbox', type: 'checkbox', label: '체크박스' }],

  circleslash: [
    { id: 'circleslash', type: 'circleslash', label: '써클앤슬래시' },
  ],

  calendar: [
    {
      id: 'calendar_date',
      type: 'calendar',
      option: 'yyyy-MM-dd',
      label: '날짜',
    },
    {
      id: 'calendar_date_y2',
      type: 'calendar',
      option: 'yy-MM-dd',
      label: '날짜(년도2)',
    },
    {
      id: 'calendar_datetime',
      type: 'calendar',
      option: 'yyyy-MM-dd HH:mm',
      label: '날짜+시간',
    },
    {
      id: 'calendar_month_day',
      type: 'calendar',
      option: 'MM-dd',
      label: '월/일',
    },
    {
      id: 'calendar_time',
      type: 'calendar',
      option: 'HH:mm',
      label: '시간',
    },
  ],

  signature: [
    { id: 'signature_worker', type: 'signature_worker', label: '수행자 서명' },
    {
      id: 'signature_verifier',
      type: 'signature_verifier',
      label: '확인자 서명',
    },
  ],

  satisfactionbox: [
    {
      id: 'satisfactionbox',
      type: 'satisfactionbox',
      label: '만족 / 불만족',
    },
  ],

  button: [
    { id: 'button_ox', type: 'button_ox', label: 'OX' },
    { id: 'button_oxn', type: 'button_oxn', label: 'OXN' },
    { id: 'button_oxt', type: 'button_oxt', label: 'OXT' },
    { id: 'button_oxtn', type: 'button_oxtn', label: 'OXTN' },
    { id: 'movetopage', type: 'movetopage', label: '페이지 이동' },
    { id: 'formdrawing', type: 'formdrawing', label: '도면조회' },
  ],
};

const ToolPalette = React.memo(
  ({
    selectedCategory,
    selectedTool,
    onToolSelect,
    onAddOverlay,
    isOverlayVisible = true,
  }: ToolPaletteProps) => {
    // 카테고리가 선택되지 않았으면 팔레트 자체 노출 X
    if (!selectedCategory) return null;
    // if (!selectedCategory || selectedCategory === 'all') return null;

    let configs: ToolConfig[] | undefined;

    if (selectedCategory === 'all') {
      // 🔹 모든 카테고리의 버튼을 하나로 합침
      configs = Object.values(QUICK_TOOL_BY_CATEGORY).flat().filter(Boolean);
    } else {
      configs = QUICK_TOOL_BY_CATEGORY[selectedCategory as NonNullToolCategory];
    }

    if (!configs || configs.length === 0) return null;

    const disabled = !isOverlayVisible;

    return (
      <div
        className="bg-white border-r border-gray-200 shadow-sm flex-shrink-0"
        style={{ width: '200px', height: 'calc(100vh - 120px)' }}
      >
        <div className="p-3 h-full overflow-y-auto custom-scrollbar">
          {/* 오버레이 모드 OFF 경고 (v2 스타일 유지) */}
          {!isOverlayVisible && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <div className="font-medium mb-1">
                {MENU_LABELS.TOOLS_MESSAGES.overlayDisabledTitle}
              </div>
              <div>{MENU_LABELS.TOOLS_MESSAGES.overlayDisabledDescription}</div>
            </div>
          )}

          {/* 카테고리별 버튼 여러 개 */}
          <div className="flex flex-col gap-2">
            {configs.map(config => {
              const isActive = selectedTool === config.id;

              const handleClick = () => {
                if (disabled) return;
                // 선택된 툴 id 저장 (스타일용)
                onToolSelect?.(config.id);
                // 실제 오버레이 타입은 여기서 전달
                onAddOverlay?.(config.type, config.option);
                devLog(
                  '[ToolPalette] add overlay:',
                  config.type,
                  config.option,
                  config.id
                );
              };

              return (
                <Button
                  key={config.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={handleClick}
                  className={`w-full px-3 py-2 h-auto text-sm rounded-md border
                    ${
                      disabled
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-300'
                    }
                    ${isActive ? 'bg-blue-500 text-white border-blue-500' : ''}
                  `}
                >
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ToolPalette.displayName = 'ToolPalette';

export { ToolPalette };
