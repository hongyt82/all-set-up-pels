// src/components/editor/EditorHeader.tsx
import {
  // Ban,
  Calendar,
  CheckSquare,
  Database,
  DatabaseZap,
  Eye,
  EyeOff,
  PenTool,
  Type,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  CircleSlash,
  ThumbsUp,
  ToggleLeft,
} from 'lucide-react';
import { useState } from 'react';
import { MENU_LABELS } from '../../constants/mainmenu';
import { Button } from '../ui/button.tsx';
import { devLog, devWarn } from '../../utils/devConsole';

/**
 * 에디터에서 사용하는 도구 카테고리
 */
export type ToolCategory =
  | 'textbox'
  | 'checkbox'
  | 'circleslash'
  | 'calendar'
  | 'signature'
  | 'satisfactionbox'
  | 'button'
  | 'all'
  | null;

interface EditorHeaderProps {
  // 카테고리 / 오버레이 / 상태 저장
  selectedCategory?: ToolCategory;
  onCategorySelect?: (category: ToolCategory | null) => void;
  isOverlayVisible?: boolean;
  onToggleOverlay?: () => void;
  totalPages?: number;
  isPersistEnabled?: boolean;
  onTogglePersist?: () => void;

  onSaveFormJson?: () => void; // 새로운 버전 서식 생성

  // 템플릿/파일 액션
  onSaveTemplate?: () => void;
  onSaveTemplateAs?: () => void; // JSON 다른 이름 저장
  onLoadTemplate?: (file: File) => void;

  onImportPdf?: (file: File) => void;

  // 정렬/분배/크기/초기화 액션
  onAlignLeft?: () => void;
  onAlignHCenter?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignVCenter?: () => void;
  onAlignBottom?: () => void;
  onDistributeHorizontally?: () => void;
  onDistributeVertically?: () => void;
  onResizePlus?: () => void;
  onResizeMinus?: () => void;
  onClearPage?: () => void;
  onClearAll?: () => void;

  // □ 글리프 기반 자동 체크박스 배치
  onAutoDetectGlyphCheckboxes?: () => void;

  // ⌀ 숫자 패턴 기반 자동 circleslash 배치
  onAutoDetectCircleSlashByNumber?: () => void;

  // 🔍 줌 컨트롤
  zoomLevel?: number; // 예: 100 (%)
  onZoomIn?: () => void;
  onZoomOut?: () => void;

  // Rule JSON 저장
  onSaveConstraintJson?: () => void;
  onLoadConstraintJson?: (file: File) => void;

  onCreateTreeList?: () => void;
  onEditTreeList?: () => void;
  hasPdfLoaded?: boolean;
  onCopyPages?: (params: {
    fromStart: number;
    fromEnd: number;
    insertAfter: number;
  }) => void;

  onDeletePage?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  sourceMode?: 'db' | 'local';
  docKey?: string;
  onChangeDocKey?: (next: string) => void;
}

export function EditorHeader({
  selectedCategory,
  onCategorySelect,
  isOverlayVisible,
  onToggleOverlay,
  totalPages = 0,
  isPersistEnabled = true,
  onTogglePersist,
  onSaveFormJson,
  onSaveTemplate,
  onSaveTemplateAs,
  onLoadTemplate,
  onImportPdf,
  onAlignLeft,
  onAlignHCenter,
  onAlignRight,
  onAlignTop,
  onAlignVCenter,
  onAlignBottom,
  onDistributeHorizontally,
  onDistributeVertically,
  onResizePlus,
  onResizeMinus,
  onClearPage,
  onClearAll,
  onAutoDetectGlyphCheckboxes,
  onAutoDetectCircleSlashByNumber,
  zoomLevel = 100,
  onZoomIn,
  onZoomOut,
  onSaveConstraintJson,
  onLoadConstraintJson,
  onCreateTreeList,
  onEditTreeList,
  onCopyPages,
  onDeletePage,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  hasPdfLoaded = false,
  sourceMode = 'local',
  docKey = 'DOC0001',
  onChangeDocKey,
}: EditorHeaderProps) {
  // PDF 한 번이라도 불러와야 JSON 관련 버튼/기능 활성화
  // const [hasPdfLoaded, setHasPdfLoaded] = useState(false);

  const [showCopyPanel, setShowCopyPanel] = useState(false);
  const [copyStart, setCopyStart] = useState(1);
  const [copyEnd, setCopyEnd] = useState(1);
  const [insertAfter, setInsertAfter] = useState(1);

  // 정렬/간격/크기 패널 접기/펼치기
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleSaveFormJson = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF와 템플릿을 로드한 뒤 저장할 수 있습니다.');
      return;
    }
    devLog('💾 [EditorHeader] 새로운 버전 서식 생성');
    onSaveFormJson?.();
  };

  // ==========================
  // 파일 선택 헬퍼
  // ==========================
  const pickPdfFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      onImportPdf?.(f); // PDFWorkspace 로 전달
      // setHasPdfLoaded(true);
      devLog('📄 [EditorHeader] PDF 불러오기:', {
        file: f.name,
        size: f.size,
      });
    };
    input.click();
  };

  const pickJsonFile = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF를 불러온 후 JSON 템플릿을 불러와 주세요.');
      devWarn('[EditorHeader] JSON 불러오기 차단: PDF 미로드');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      devLog('[EditorHeader] JSON 파일 선택:', {
        name: f.name,
        size: f.size,
      });
      onLoadTemplate?.(f);
    };
    input.click();
  };

  const pickConstraintJsonFile = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF를 불러온 후 Rule JSON을 불러와 주세요.');
      devWarn('[EditorHeader] Rule JSON 불러오기 차단: PDF 미로드');
      return;
    }

    if (!onLoadConstraintJson) {
      devWarn('[EditorHeader] onLoadConstraintJson 핸들러가 없습니다.');
      alert('Rule JSON 로드 핸들러가 연결되어 있지 않습니다.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      devLog('[EditorHeader] Rule JSON 파일 선택:', {
        name: f.name,
        size: f.size,
      });
      onLoadConstraintJson(f);
    };
    input.click();
  };

  const handleSaveTemplate = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF와 템플릿을 로드한 뒤 저장할 수 있습니다.');
      return;
    }
    devLog('💾 [EditorHeader] JSON 템플릿 저장');
    onSaveTemplate?.();
  };

  const handleSaveTemplateAs = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF와 템플릿을 로드한 뒤 저장할 수 있습니다.');
      return;
    }
    devLog('💾 [EditorHeader] JSON 템플릿 다른 이름으로 저장');
    onSaveTemplateAs?.();
  };

  const handleSetDocKey = () => {
    const next = window.prompt('문서 키를 입력하세요.', docKey);
    if (next && next.trim()) {
      onChangeDocKey?.(next.trim());
      devLog('🔑 [EditorHeader] 문서키 변경:', next.trim());
    }
  };

  // ==========================
  // 카테고리
  // ==========================
  const categories = [
    {
      id: 'all' as const,
      icon: LayoutGrid, // 👁 Eye보다 "전체 보기" 의미 정확
      label: (MENU_LABELS.CATEGORIES as any)?.all ?? '전체',
    },
    {
      id: 'textbox' as const,
      icon: Type,
      label: MENU_LABELS.CATEGORIES.textbox,
    },
    {
      id: 'checkbox' as const,
      icon: CheckSquare,
      label: MENU_LABELS.CATEGORIES.checkbox,
    },
    {
      id: 'circleslash' as const,
      icon: CircleSlash, // ⌀ 의미
      label: (MENU_LABELS.CATEGORIES as any)?.circleslash ?? '⌀',
    },
    {
      id: 'calendar' as const,
      icon: Calendar,
      label: MENU_LABELS.CATEGORIES.calendar,
    },
    {
      id: 'signature' as const,
      icon: PenTool,
      label: MENU_LABELS.CATEGORIES.signature,
    },
    {
      id: 'satisfactionbox' as const,
      icon: ThumbsUp, // 만족/불만족 의미 정확
      label: (MENU_LABELS.CATEGORIES as any)?.satisfactionbox ?? '만족/불만족',
    },
    {
      id: 'button' as const,
      icon: ToggleLeft, // 상태 전환 / 선택 버튼 의미
      label: (MENU_LABELS.CATEGORIES as any)?.button ?? '버튼',
    },
  ];

  const handleCategoryClick = (category: {
    id: ToolCategory;
    label: string;
  }) => {
    const isDisabled = totalPages === 0;
    const isSelected = selectedCategory === category.id;
    const newSelection = isSelected ? null : category.id;

    if (isDisabled) {
      devLog('🚫 [EditorHeader] 카테고리 클릭 차단 (총 페이지 0)', {
        category: category.id,
      });
      return;
    }

    onCategorySelect?.(newSelection);
  };

  const alignDisabled = totalPages === 0;
  const actionDisabled = totalPages === 0;

  return (
    <header
      className="
        editor-header
        flex flex-col gap-1
        px-4 py-1
        flex-shrink-0
        overflow-hidden
        border-b border-slate-700
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
        text-white shadow-md
      "
    >
      {/* ===== 1줄: 파일 / 상태 / 줌 / 고급도구 토글 ===== */}
      <div className="flex items-center justify-between gap-3">
        {/* 파일 관련 그룹 */}
        <div className="flex items-center space-x-2 bg-white/5 rounded-xl px-2 py-1">
          {sourceMode === 'db' && (
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-1 text-xs rounded-lg bg-sky-500/70 hover:bg-sky-400 text-white"
              onClick={handleSaveFormJson}
              disabled={!hasPdfLoaded}
              title={
                hasPdfLoaded
                  ? '새로운 버전으로 서식 생성 (버전 증가)'
                  : '먼저 PDF/템플릿을 불러와야 합니다'
              }
            >
              서식 생성
            </Button>
          )}
          {sourceMode === 'local' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg bg-sky-500/70 hover:bg-sky-400 text-white"
                onClick={pickPdfFile}
                title="PDF 파일 불러오기"
              >
                PDF 불러오기
              </Button>

              {sourceMode === 'local' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-1 text-xs rounded-lg hover:bg-white/10"
                  onClick={handleSetDocKey}
                  title="문서 키 설정"
                >
                  문서키: {docKey}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40"
                onClick={pickJsonFile}
                disabled={!hasPdfLoaded}
                title={
                  hasPdfLoaded
                    ? 'JSON 템플릿 불러오기'
                    : '먼저 PDF를 불러와야 합니다'
                }
              >
                JSON 불러오기
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40"
                onClick={handleSaveTemplate}
                disabled={!hasPdfLoaded}
                title={
                  hasPdfLoaded
                    ? '현재 템플릿 JSON 저장'
                    : '먼저 PDF/템플릿을 불러와야 합니다'
                }
              >
                JSON 저장
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40"
                onClick={handleSaveTemplateAs}
                disabled={!hasPdfLoaded}
                title={
                  hasPdfLoaded
                    ? '현재 템플릿 JSON 다른 이름으로 저장'
                    : '먼저 PDF/템플릿을 불러와야 합니다'
                }
              >
                JSON 다른이름 저장
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40"
                onClick={pickConstraintJsonFile}
                disabled={!hasPdfLoaded}
                title={
                  hasPdfLoaded
                    ? 'Rule JSON 불러오기'
                    : '먼저 PDF를 불러와야 합니다'
                }
              >
                Rule 불러오기
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40"
                onClick={onSaveConstraintJson}
                disabled={!hasPdfLoaded}
                title={
                  hasPdfLoaded
                    ? '현재 Rule 조건을 JSON 파일로 저장'
                    : '먼저 PDF를 불러와야 합니다'
                }
              >
                Rule 저장(다른 이름)
              </Button>
            </>
          )}

          {/* ✅ 체크박스 자동 배치 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs rounded-lg bg-emerald-500/70 hover:bg-emerald-500/80 disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages === 0}
            onClick={() => onAutoDetectGlyphCheckboxes?.()}
            title="현재 PDF 에서 '□' 글자를 찾아 체크박스를 자동 배치합니다"
          >
            □ 자동 배치
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs rounded-lg bg-indigo-500/70 hover:bg-indigo-500/80 disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages === 0}
            onClick={() => onAutoDetectCircleSlashByNumber?.()}
            title="숫자 패턴 왼쪽에 ⌀ 를 자동 배치합니다"
          >
            ⌀ 자동 배치
          </Button>

          <button
            className="px-3 py-1 text-xs rounded-lg bg-indigo-700 text-white  disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages === 0}
            onClick={onCreateTreeList}
          >
            ⌀ 트리 생성
          </button>

          <button
            className="px-3 py-1 text-xs rounded-lg bg-slate-700 text-white disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages === 0}
            onClick={onEditTreeList}
          >
            ⌀ 트리 수정
          </button>

          {/* ===== 페이지 액션 ===== */}
          {/*<Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs rounded-lg bg-violet-500/70 hover:bg-violet-500/80 disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages === 0}
            onClick={onCopyPages}
            title="현재 페이지를 복사하여 새 페이지로 추가합니다"
          >
            페이지 복사
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs rounded-lg bg-rose-600/70 hover:bg-rose-600/80 disabled:opacity-40"
            disabled={!hasPdfLoaded || totalPages <= 1}
            onClick={() => {
              if (!window.confirm('현재 페이지를 삭제하시겠습니까?')) return;
              onDeletePage?.();
            }}
            title="현재 페이지를 삭제합니다"
          >
            페이지 삭제
          </Button>*/}
        </div>

        {/* 상태 / 줌 / 오버레이 / 고급도구 토글 */}
        <div className="flex items-center space-x-2">
          {/* 🔍 줌 컨트롤 */}
          <div className="flex items-center bg-white/5 rounded-xl px-2 py-1 space-x-1">
            <span className="text-[11px] text-slate-200 mr-1">줌:</span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 rounded-lg hover:bg-white/15"
              onClick={onZoomOut}
              title="축소"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-[11px] w-10 text-center tabular-nums">
              {zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 rounded-lg hover:bg-white/15"
              onClick={onZoomIn}
              title="확대"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePersist}
            className={`
              p-2 rounded-lg transition-colors
              border
              ${
                isPersistEnabled
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400'
                  : 'bg-slate-700/60 hover:bg-slate-600 border-slate-500'
              }
            `}
            title={
              isPersistEnabled
                ? MENU_LABELS.DEV.statePersistTooltipOn
                : MENU_LABELS.DEV.statePersistTooltipOff
            }
          >
            {isPersistEnabled ? (
              <DatabaseZap className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleOverlay}
            className={`
              px-3 py-1 text-xs rounded-lg
              flex items-center
              transition-colors
              ${
                isOverlayVisible
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-slate-700/60 hover:bg-slate-600'
              }
            `}
            title={
              isOverlayVisible
                ? MENU_LABELS.OVERLAY.hide
                : MENU_LABELS.OVERLAY.show
            }
          >
            {isOverlayVisible ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {MENU_LABELS.OVERLAY.label}
          </Button>

          {/* 고급 도구 접기/펼치기 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(v => !v)}
            className="px-2 py-1 text-xs rounded-lg bg-slate-800/70 hover:bg-slate-700 flex items-center"
            title="정렬/간격/크기/초기화 도구 접기/펼치기"
          >
            {showAdvanced ? (
              <>
                고급 도구 접기
                <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                고급 도구 펼치기
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ===== 2줄: 도구 / 정렬 등 (고급 도구) ===== */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* 카테고리 버튼 그룹 */}
        <div className="flex items-center space-x-1 bg-white/5 rounded-xl px-2 py-1">
          {categories.map(category => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const isDisabled = totalPages === 0;
            return (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryClick(category)}
                disabled={isDisabled}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                  ${
                    isSelected
                      ? 'bg-sky-500/80 hover:bg-sky-400'
                      : 'hover:bg-white/15'
                  }
                `}
                title={
                  isDisabled
                    ? `${category.label} (비활성화 - ${totalPages}페이지)`
                    : category.label
                }
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* 오른쪽: 정렬/간격/크기/초기화 그룹 (접었다/펼쳤다) */}
        {showAdvanced && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* 페이지 액션 */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-200 mr-1">페이지:</span>

              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={actionDisabled}
                onClick={() => setShowCopyPanel(v => !v)}
              >
                페이지 복사
              </Button>
              {showCopyPanel && (
                <div
                  className="
    absolute z-50 mt-2 right-0
    bg-slate-900
    border border-slate-600
    rounded-lg
    p-4
    shadow-2xl
    text-sm
    space-y-3
    w-64
  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">시작</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={copyStart}
                        onChange={e => setCopyStart(Number(e.target.value))}
                        className="
            w-16
            px-2 py-1
            rounded
            bg-slate-700
            text-white
            border border-slate-500
            focus:outline-none focus:ring-1 focus:ring-indigo-400
          "
                      />
                      <span className="text-slate-400">~</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={copyEnd}
                        onChange={e => setCopyEnd(Number(e.target.value))}
                        className="
            w-16
            px-2 py-1
            rounded
            bg-slate-700
            text-white
            border border-slate-500
            focus:outline-none focus:ring-1 focus:ring-indigo-400
          "
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">삽입 위치</span>
                    <input
                      type="number"
                      min={0}
                      max={totalPages}
                      value={insertAfter}
                      onChange={e => setInsertAfter(Number(e.target.value))}
                      className="
          w-16
          px-2 py-1
          rounded
          bg-slate-700
          text-white
          border border-slate-500
          focus:outline-none focus:ring-1 focus:ring-indigo-400
        "
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-slate-600 hover:bg-slate-500"
                      onClick={() => setShowCopyPanel(false)}
                    >
                      취소
                    </Button>

                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500"
                      onClick={() => {
                        if (copyStart > copyEnd) {
                          alert('시작 페이지가 끝보다 클 수 없습니다.');
                          return;
                        }

                        onCopyPages?.({
                          fromStart: copyStart,
                          fromEnd: copyEnd,
                          insertAfter,
                        });

                        setShowCopyPanel(false);
                      }}
                    >
                      적용
                    </Button>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-red-500/30 text-red-200"
                disabled={actionDisabled}
                onClick={onDeletePage}
              >
                삭제
              </Button>
            </div>
            <Button size="sm" onClick={onUndo} disabled={!canUndo}>
              ⟲
            </Button>

            <Button size="sm" onClick={onRedo} disabled={!canRedo}>
              ⟳
            </Button>
            {/* 정렬 */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-200 mr-1">정렬:</span>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignLeft}
              >
                좌
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignHCenter}
              >
                가운데
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignRight}
              >
                우
              </Button>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignTop}
              >
                상
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignVCenter}
              >
                중앙
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onAlignBottom}
              >
                하
              </Button>
            </div>

            {/* 간격 */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-200 mr-1">간격:</span>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onDistributeHorizontally}
              >
                가로 간격
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={alignDisabled}
                onClick={onDistributeVertically}
              >
                세로 간격
              </Button>
            </div>

            {/* 크기 */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-200 mr-1">크기:</span>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={actionDisabled}
                onClick={onResizePlus}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-white/15"
                disabled={actionDisabled}
                onClick={onResizeMinus}
              >
                -
              </Button>
            </div>

            {/* 초기화 */}
            <div className="flex items-center space-x-1 bg-red-500/10 rounded-xl px-2 py-1 border border-red-400/60">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-red-500/40 text-red-100"
                disabled={actionDisabled}
                onClick={onClearPage}
              >
                현재 페이지 초기화
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-[11px] hover:bg-red-500/40 text-red-100"
                disabled={actionDisabled}
                onClick={onClearAll}
              >
                전체 초기화
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
