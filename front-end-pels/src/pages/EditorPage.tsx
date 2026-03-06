// src/pages/EditorPage.tsx
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from 'react';
import type { ConstraintComponentRule } from '../types/constraints';
import { BaseLayout } from '../components/layout/BaseLayout';
import { EditorHeader } from '../components/editor/EditorHeader';
import type { ToolCategory } from '../components/editor/EditorHeader';
import { EditorFooter } from '../components/editor/EditorFooter';
import { ToolPalette } from '../components/editor/ToolPalette';
import {
  EditorWorkspace,
  type EditorWorkspaceHandle,
} from '../components/editor/EditorWorkspace';
// import type { OverlayType } from '../components/workspace/PDFWorkspace';
import type { OverlayType } from '../components/editor/EditorWorkspace';
import { useEditorStore } from '../stores/editorStore';
import { PDF_BOUNDARY } from '../lib/boundaryUtils';
import '../styles/editor.css';
import { useConstraintStore } from '../stores/constraintStore';
import { saveAs } from 'file-saver';
import { ConstraintEditorPanel } from '../components/editor/ConstraintEditorPanel';
import { ConstraintRuleListPanel } from '../components/editor/ConstraintRuleListPanel';
import { TreeListEditorPanel } from '../components/editor/TreeListEditorPanel';
// import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// V1 과 동일한 A4 비율 기준
const DESIGN_RATIO = PDF_BOUNDARY.height / PDF_BOUNDARY.width; // 736/520
const BASE_W = 720;
const BASE_H = Math.round(BASE_W * DESIGN_RATIO);

// 🔹 constraint JSON 포매터
//   - 기본 pretty-print(JSON.stringify(obj, null, 2))
//   - 그 뒤에 { "id": "XXXX" } 구조만 한 줄로 압축
function formatConstraintJson(obj: any): string {
  let s = JSON.stringify(obj, null, 2);

  // 1) 가장 단순한 { "id": "XXX" } 블럭 한 줄로
  //    줄 앞뒤 공백/탭, 중간 공백 다 허용
  s = s.replace(
    /\{\s*[\r\n]+\s*"id"\s*:\s*"([^"]+)"\s*[\r\n]+\s*\}/g,
    '{ "id": "$1" }'
  );

  return s;
}

export function EditorPage() {
  const {
    selectedCategory,
    // selectedTool,
    isOverlayVisible,
    currentFile,
    isModified,
    wordCount,
    pageCount,
    isPersistEnabled,
    setSelectedCategory,
    setSelectedTool,
    setIsOverlayVisible,
    setCurrentPage,
    togglePersist,
  } = useEditorStore();

  // constraint.json 편집용 상태
  const { constraintDoc, setConstraintDoc, ensureComponentRule } =
    useConstraintStore();

  const handleCopyPageResult = ({
    fromPage,
    toPage,
    idMap,
  }: {
    fromPage: number;
    toPage: number;
    idMap: Record<string, string>;
  }) => {
    setConstraintDoc(prev => {
      if (!prev?.pages?.length) return prev;

      console.log('fromPage', {
        fromPage,
        rulePages: prev.pages.map(p => p.page),
      });

      const srcPageRule = prev.pages.find(p => p.page === fromPage);
      if (!srcPageRule) return prev;

      const copiedComponents: ConstraintComponentRule[] = (
        srcPageRule.components || []
      )
        .filter((c): c is ConstraintComponentRule => !!idMap[c.id])
        .map(c => ({
          ...c,
          id: idMap[c.id],
          groupby: Array.isArray(c.groupby)
            ? c.groupby
                .map(g => ({
                  ...g,
                  id: idMap[g.id] ?? g.id,
                }))
                .filter(g => g.id)
            : undefined,
        }));

      if (copiedComponents.length === 0) return prev;

      const pages = [...prev.pages];
      const idx = pages.findIndex(p => p.page === toPage);

      if (idx === -1) {
        pages.push({ page: toPage, components: copiedComponents });
      } else {
        pages[idx] = { ...pages[idx], components: copiedComponents };
      }

      return { ...prev, pages };
    });
  };

  const handleDeletePageResult = ({ deletedPage }: { deletedPage: number }) => {
    setConstraintDoc(prev => ({
      ...prev,
      pages: prev.pages
        .filter(p => p.page !== deletedPage)
        .map(p => (p.page > deletedPage ? { ...p, page: p.page - 1 } : p)),
    }));
  };

  // 현재 constraint 편집 대상 (페이지, 컴포넌트 id)
  const [constraintSelection, setConstraintSelection] = useState<{
    page: number;
    primaryId: string; // 대표 id (rule.id 로 쓰일 것 or "__PAGE_ALL__")
    ids: string[]; // 선택된 전체 id
    mode: 'rule' | 'page';
  } | null>(null);

  // const [rightClickedOverlayUid, setRightClickedOverlayUid] = useState<
  //   string | null
  // >(null);

  const [rightClickedOverlay, setRightClickedOverlay] = useState<{
    uid: string;
    type: OverlayType;
    option?: string;
    id_key?: string;
  } | null>(null);

  // 편집 텍스트 (JSON 형태)
  const [constraintEditorText, setConstraintEditorText] = useState('');

  const wsRef = useRef<EditorWorkspaceHandle | null>(null);

  // Header / Footer / Center 높이 측정용
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

  // 줌 레벨(%) & 실제 페이지 스케일
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageScale, setPageScale] = useState(1);

  // Workspace 가 알려주는 현재 페이지/총 페이지
  const [pageInfo, setPageInfo] = useState<{ current: number; total: number }>({
    current: 1,
    total: 0,
  });

  // ===== undo / redo snapshot =====
  interface EditorSnapshot {
    workspaceState: any;
    constraintDoc: any;
  }

  const undoStack = useRef<EditorSnapshot[]>([]);
  const redoStack = useRef<EditorSnapshot[]>([]);
  const MAX_HISTORY = 10;

  const pushSnapshot = useCallback(() => {
    if (!wsRef.current) return;

    undoStack.current.push({
      workspaceState: wsRef.current.exportFullState(),
      constraintDoc: JSON.parse(JSON.stringify(constraintDoc)),
    });

    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }

    redoStack.current = [];
  }, [constraintDoc]);

  const handleUndo = useCallback(() => {
    if (!undoStack.current.length || !wsRef.current) return;

    const currentState = wsRef.current.exportFullState();

    const snapshot = undoStack.current.pop()!;

    redoStack.current.push({
      workspaceState: currentState,
      constraintDoc: JSON.parse(JSON.stringify(constraintDoc)),
    });

    wsRef.current.restoreFullState(snapshot.workspaceState);
    setConstraintDoc(snapshot.constraintDoc);
  }, [constraintDoc]);

  const handleRedo = useCallback(() => {
    if (!redoStack.current.length || !wsRef.current) return;

    const currentState = wsRef.current.exportFullState();

    const snapshot = redoStack.current.pop()!;

    undoStack.current.push({
      workspaceState: currentState,
      constraintDoc: JSON.parse(JSON.stringify(constraintDoc)),
    });

    wsRef.current.restoreFullState(snapshot.workspaceState);
    setConstraintDoc(snapshot.constraintDoc);
  }, [constraintDoc]);

  const handleCopyPageResults = (
    results: {
      fromPage: number;
      toPage: number;
      idMap: Record<string, string>;
    }[]
  ) => {
    setConstraintDoc(prev => {
      if (!prev?.pages?.length) return prev;

      const pages = [...prev.pages];

      results.forEach(({ fromPage, toPage, idMap }) => {
        const srcPageRule = pages.find(p => p.page === fromPage);
        if (!srcPageRule) return;

        const copiedComponents = (srcPageRule.components || [])
          .filter(c => idMap[c.id])
          .map(c => ({
            ...c,
            id: idMap[c.id],
            groupby: Array.isArray(c.groupby)
              ? c.groupby.map(g => ({
                  ...g,
                  id: idMap[g.id] ?? g.id,
                }))
              : undefined,
          }));

        if (!copiedComponents.length) return;

        const idx = pages.findIndex(p => p.page === toPage);

        if (idx === -1) {
          pages.push({ page: toPage, components: copiedComponents });
        } else {
          pages[idx] = {
            ...pages[idx],
            components: copiedComponents,
          };
        }
      });

      return { ...prev, pages };
    });
  };

  // PDF 로드 완료 상태 (총 페이지가 0보다 크면 PDF가 로드된 것으로 간주)
  const hasPdfLoaded = pageInfo.total > 0;

  const [isRuleListOpen, setIsRuleListOpen] = useState(false);

  const [isTreeEditorOpen, setIsTreeEditorOpen] = useState(false);
  const [treeEditorMode, setTreeEditorMode] = useState<'create' | 'edit'>(
    'create'
  );

  // const [searchParams] = useSearchParams();
  // const docId = searchParams.get('docId') ?? undefined;

  const params = new URLSearchParams(window.location.search);
  const FRM_UNQ_KY_VAL = params.get('FRM_UNQ_KY_VAL');
  const isDbMode = !!FRM_UNQ_KY_VAL;

  useEffect(() => {
    if (!FRM_UNQ_KY_VAL) return;
    if (pageInfo.total > 0) return;

    const load = async () => {
      const metaRes = await axios.get('/api/Form_Json_M.do', {
        params: { FRM_UNQ_KY_VAL },
        withCredentials: true,
      });

      const { PDF_PATH, FRM_OVER_JSON, FRM_CONS_JSON } = metaRes.data;
      if (!PDF_PATH) return;

      const isProd = import.meta.env.PROD;

      if (isProd) {
        // 서버: 정적 리소스 직접 로딩
        await wsRef.current?.loadPdfFromUrl?.(PDF_PATH);
      } else {
        // 로컬: proxy 사용
        const pdfRes = await axios.get('/proxy/pdf', {
          params: { path: PDF_PATH },
          responseType: 'blob',
        });

        const file = new File([pdfRes.data], 'form.pdf', {
          type: 'application/pdf',
        });

        wsRef.current?.loadPdfFile(file);
      }

      // Constraint
      if (FRM_CONS_JSON) {
        setConstraintDoc(JSON.parse(FRM_CONS_JSON));
      }

      // Overlay (PDF 이후)
      if (FRM_OVER_JSON) {
        const overlayFile = new File([FRM_OVER_JSON], 'overlay.json', {
          type: 'application/json',
        });

        setTimeout(() => {
          wsRef.current?.restoreFromJson(overlayFile);
        }, 300);
      }
    };

    load().catch(err => {
      console.error('[Editor][DB] load failed', err);
    });
  }, [pageInfo.total]);

  // ===== 스케일 계산 (V1 방식 + 줌 반영) =====
  const recalcScale = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const footerH = footerRef.current?.offsetHeight ?? 0;
    const centerW = centerRef.current?.offsetWidth ?? window.innerWidth;

    const verticalPadding = 24; // 위아래 여유 (py-3 * 2 = 24)
    const horizontalPadding = 32; // 좌우 여유

    const availableH = window.innerHeight - headerH - footerH - verticalPadding;
    const availableW = centerW - horizontalPadding;

    const sH = availableH / BASE_H;
    const sW = availableW / BASE_W;

    // 기본 스케일 (0.1배 ~ 1배)
    const base = Math.min(1, Math.max(0.1, Math.min(sH, sW)));
    const zoomFactor = zoomLevel / 100;

    setPageScale(base * zoomFactor);
  }, [zoomLevel]);

  useLayoutEffect(() => {
    recalcScale();

    const onResize = () => recalcScale();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => recalcScale());
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    if (centerRef.current) ro.observe(centerRef.current);

    // 첫 프레임 한번 더
    requestAnimationFrame(() => recalcScale());

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [recalcScale]);

  // ===== 줌 컨트롤 =====
  const handleZoomIn = useCallback(
    () => setZoomLevel(prev => Math.min(prev + 10, 200)),
    []
  );
  const handleZoomOut = useCallback(
    () => setZoomLevel(prev => Math.max(prev - 10, 25)),
    []
  );

  // ===== 카테고리 선택 =====
  const handleCategorySelect = useCallback(
    (category: ToolCategory | null) => {
      const totalPages = pageInfo.total;
      const currentPage = pageInfo.current;
      const isDisabled = totalPages === 0;

      if (isDisabled) {
        console.log('🚫 [EditorPage] Category 선택 차단 (총 페이지 0)', {
          category,
        });
        return;
      }
      if (category && !isOverlayVisible) {
        setIsOverlayVisible(true);
      }
      setSelectedCategory(category);
      console.log('📝 [EditorPage] Category 선택 변경', {
        previous: selectedCategory,
        next: category,
        currentPage,
        totalPages,
      });
    },
    [
      pageInfo,
      selectedCategory,
      isOverlayVisible,
      setSelectedCategory,
      setIsOverlayVisible,
    ]
  );

  // ===== constraint JSON 저장 =====
  const handleSaveConstraintJson = () => {
    if (!constraintDoc || !constraintDoc.pages.length) {
      alert('저장할 Rule 조건 데이터가 없습니다.');
      return;
    }

    const defaultBase =
      (currentFile?.replace(/\.[^/.]+$/, '') || 'constraints') + '_rules';

    const input = window.prompt(
      '저장할 Rule JSON 파일명을 입력하세요 (확장자 없이 또는 .json 포함):',
      defaultBase
    );

    if (input === null) {
      // 취소
      return;
    }

    const safeBase = input.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!safeBase) {
      alert('파일명이 올바르지 않습니다.');
      return;
    }

    const fileName = safeBase.toLowerCase().endsWith('.json')
      ? safeBase
      : `${safeBase}.json`;

    const blob = new Blob([formatConstraintJson(constraintDoc)], {
      type: 'application/json',
    });

    saveAs(blob, fileName);
  };

  // ===== constraint JSON 불러오기 =====
  const handleLoadConstraintJson = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const obj = JSON.parse(text);

        if (!obj || !Array.isArray(obj.pages)) {
          alert(
            '올바른 constraint JSON 형식이 아닙니다.\n(pages 배열이 없습니다)'
          );
          return;
        }

        // 🔍 1) 템플릿 JSON처럼 생긴 경우 걸러내기
        const firstPage = obj.pages[0];
        const firstComp = firstPage?.components?.[0];

        const looksLikeTemplate =
          !!obj.doc || // 템플릿 JSON은 doc 정보가 있을 가능성 큼
          (firstComp && firstComp.type && typeof firstComp.x === 'number');

        if (looksLikeTemplate) {
          alert(
            '이 파일은 "템플릿 JSON"으로 보입니다.\n상단의 "JSON 불러오기" 버튼을 사용해 주세요.'
          );
          return;
        }

        // 🔍 2) 정말 constraint JSON 같이 생겼는지 한 번 더 체크
        const looksLikeConstraint =
          !!obj.docId ||
          obj.pages.some((p: any) =>
            (p.components || []).some(
              (c: any) => c.constraints || c.events || c.groupby
            )
          );

        if (!looksLikeConstraint) {
          alert(
            'constraint JSON 형식으로 보이지 않습니다.\n파일 내용을 다시 확인해 주세요.'
          );
          return;
        }

        if (!obj.docId) {
          obj.docId = 'W2345A';
        }

        setConstraintDoc(obj);
        alert('constraint JSON이 불러와졌습니다.');
      } catch (err) {
        console.error(err);
        alert('constraint JSON 파싱에 실패했습니다.');
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleToolSelect = useCallback(
    (tool: string) => {
      setSelectedTool(tool);
    },
    [setSelectedTool]
  );

  const handleToggleOverlay = useCallback(() => {
    setIsOverlayVisible(!isOverlayVisible);
  }, [isOverlayVisible, setIsOverlayVisible]);

  const handleTogglePersist = useCallback(() => {
    togglePersist();
  }, [togglePersist]);

  // Workspace → EditorPage 로 페이지 정보 전달
  const handlePageInfoChange = useCallback(
    ({
      currentPage,
      totalPages,
    }: {
      currentPage: number;
      totalPages: number;
    }) => {
      setPageInfo({
        current: currentPage,
        total: totalPages,
      });
      setCurrentPage(currentPage);
    },
    [setCurrentPage]
  );

  // ===== 정렬/간격/크기/초기화 → EditorWorkspaceHandle 연결 =====
  const handleAlignLeft = useCallback(() => {
    wsRef.current?.alignLeft();
  }, []);
  const handleAlignHCenter = useCallback(() => {
    wsRef.current?.alignHCenter();
  }, []);
  const handleAlignRight = useCallback(() => {
    wsRef.current?.alignRight();
  }, []);
  const handleAlignTop = useCallback(() => {
    wsRef.current?.alignTop();
  }, []);
  const handleAlignVCenter = useCallback(() => {
    wsRef.current?.alignVCenter();
  }, []);
  const handleAlignBottom = useCallback(() => {
    wsRef.current?.alignBottom();
  }, []);
  const handleDistributeHorizontally = useCallback(() => {
    wsRef.current?.distributeHorizontally();
  }, []);
  const handleDistributeVertically = useCallback(() => {
    wsRef.current?.distributeVertically();
  }, []);
  const handleResizePlus = useCallback(() => {
    wsRef.current?.resizeSelectedPlus();
  }, []);
  const handleResizeMinus = useCallback(() => {
    wsRef.current?.resizeSelectedMinus();
  }, []);
  const handleClearPage = useCallback(() => {
    wsRef.current?.clearPage();
  }, []);
  const handleClearAll = useCallback(() => {
    wsRef.current?.clearAll();
  }, []);
  const handleAutoDetectGlyphCheckboxes = useCallback(() => {
    wsRef.current?.autoDetectGlyphCheckboxes?.();
  }, []);
  const handleAutoDetectCircleSlashByNumber = useCallback(() => {
    wsRef.current?.autoDetectCircleSlashByNumber?.();
  }, []);

  // ===== 페이지 이동 (Footer → Workspace) =====
  const handlePrevPage = useCallback(() => {
    wsRef.current?.goPrevPage();
  }, []);
  const handleNextPage = useCallback(() => {
    wsRef.current?.goNextPage();
  }, []);
  const handlePageChange = useCallback((page: number) => {
    wsRef.current?.goToPage(page);
  }, []);

  // const selectedOverlay = wsRef.current?.getSelectedOverlay?.() ?? null;
  const [idKeyDraft, setIdKeyDraft] = useState('');

  useEffect(() => {
    setIdKeyDraft(rightClickedOverlay?.id_key ?? '');
  }, [rightClickedOverlay]);

  useEffect(() => {
    if (!isOverlayVisible) {
      setRightClickedOverlay(null);
    }
  }, [isOverlayVisible]);

  return (
    <BaseLayout>
      {/* 헤더 높이 측정용 wrapper */}
      <div ref={headerRef}>
        <EditorHeader
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          isOverlayVisible={isOverlayVisible}
          onToggleOverlay={handleToggleOverlay}
          totalPages={pageInfo.total}
          isPersistEnabled={isPersistEnabled}
          onTogglePersist={handleTogglePersist}
          hasPdfLoaded={hasPdfLoaded}
          onSaveTemplate={() => wsRef.current?.downloadJson()}
          onSaveTemplateAs={() => wsRef.current?.downloadJsonAs()}
          onLoadTemplate={file => {
            wsRef.current?.restoreFromJson(file);
            if (!isOverlayVisible) {
              setIsOverlayVisible(true);
            }
          }}
          onImportPdf={
            isDbMode
              ? undefined
              : file => {
                  console.log(
                    '📄 [EditorPage] importPdf from header',
                    file.name
                  );
                  wsRef.current?.loadPdfFile(file);
                }
          }
          onSaveFormJson={() => wsRef.current?.downloadJsonCreate()}
          // 정렬/간격/크기/초기화
          onAlignLeft={handleAlignLeft}
          onAlignHCenter={handleAlignHCenter}
          onAlignRight={handleAlignRight}
          onAlignTop={handleAlignTop}
          onAlignVCenter={handleAlignVCenter}
          onAlignBottom={handleAlignBottom}
          onDistributeHorizontally={handleDistributeHorizontally}
          onDistributeVertically={handleDistributeVertically}
          onResizePlus={handleResizePlus}
          onResizeMinus={handleResizeMinus}
          onClearPage={handleClearPage}
          onClearAll={handleClearAll}
          // 자동 체크박스 감지
          onAutoDetectGlyphCheckboxes={handleAutoDetectGlyphCheckboxes}
          // 자동 ⌀ 감지
          onAutoDetectCircleSlashByNumber={handleAutoDetectCircleSlashByNumber}
          // 줌 컨트롤
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onSaveConstraintJson={handleSaveConstraintJson}
          onLoadConstraintJson={handleLoadConstraintJson}
          // treelist 생성
          onCreateTreeList={() => {
            const items = wsRef.current?.getAllCircleSlashItems() ?? [];
            console.warn('[TreeList OPEN]', items);
            setTreeEditorMode('create');
            setIsTreeEditorOpen(true);
          }}
          onEditTreeList={() => {
            if (!constraintDoc?.treelist) {
              alert('기존 treelist가 없습니다. 새로 생성해야 합니다.');
              return;
            }
            setTreeEditorMode('edit');
            setIsTreeEditorOpen(true);
          }}
          onCopyPages={({ fromStart, fromEnd, insertAfter }) => {
            pushSnapshot();

            const results = wsRef.current?.copyPageRange({
              fromStart,
              fromEnd,
              insertAfter,
            });

            // console.log("COPY RESULT:", results);

            if (results && Array.isArray(results)) {
              handleCopyPageResults(results);
            }
          }}
          onDeletePage={() => {
            pushSnapshot();
            const result = wsRef.current?.deleteCurrentPage();
            if (result) {
              handleDeletePageResult(result);
            }
          }}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.current.length > 0}
          canRedo={redoStack.current.length > 0}
        />
      </div>

      {/* 가운데 영역: min-h-0 + zoom>=110일 때만 overflow-auto */}
      <div
        ref={centerRef}
        className={`flex flex-1 bg-slate-100 ${
          zoomLevel >= 110 ? 'overflow-auto' : 'overflow-hidden'
        }`}
      >
        <ToolPalette
          selectedCategory={selectedCategory}
          onToolSelect={handleToolSelect}
          onAddOverlay={tool => wsRef.current?.addOverlay(tool)}
          isOverlayVisible={isOverlayVisible}
        />
        {/* 선택된 Overlay 속성 패널 */}
        {/*{selectedOverlay && (*/}
        {rightClickedOverlay && rightClickedOverlay.type === 'textbox' && (
          <div className="px-3 py-2 border-b bg-white text-sm">
            <label className="block text-xs text-slate-500 mb-1">
              ID KEY (선택)
            </label>

            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="id_key 입력 (선택)"
              value={idKeyDraft}
              onChange={e => setIdKeyDraft(e.target.value)}
              onBlur={() => {
                const v = idKeyDraft.trim();
                if (!rightClickedOverlay) return;

                wsRef.current?.updateOverlayByUid?.(rightClickedOverlay.uid, {
                  id_key: v.length > 0 ? v : undefined,
                });

                setRightClickedOverlay(null);
              }}
            />
          </div>
        )}

        {/* PDF 영역: 확대 시 스크롤 대응 */}
        <div className="flex flex-1 justify-center items-start py-3">
          {/* 이 div 크기만큼 스크롤 생김 */}
          <div
            style={{
              width: BASE_W * pageScale,
              height: BASE_H * pageScale,
            }}
          >
            {/* 실제 PDF 페이지는 scale 로 축소/확대 */}
            <div
              style={{
                width: BASE_W,
                height: BASE_H,
                transform: `scale(${pageScale})`,
                transformOrigin: 'top center',
              }}
            >
              <EditorWorkspace
                ref={wsRef}
                // docId={docId}
                isOverlayVisible={isOverlayVisible}
                onPageInfoChange={handlePageInfoChange}
                scale={pageScale}
                constraints={constraintDoc}
                onCopyPageResult={handleCopyPageResult}
                onOpenConstraintEditor={({
                  page,
                  overlays,
                  rightClickedUid,
                }) => {
                  if (!overlays.length) return;

                  const primary =
                    overlays.find(o => o.uid === rightClickedUid) ??
                    overlays[0];

                  setRightClickedOverlay({
                    uid: rightClickedUid,
                    type: primary.type,
                    id_key: primary.id_key,
                  });

                  const ids = overlays.map(o => o.id);

                  // 대표 id 기준으로 rule 확보/생성
                  const rule = ensureComponentRule(
                    page,
                    primary.id,
                    primary.type
                  );

                  setConstraintSelection({
                    page,
                    primaryId: primary.id,
                    ids,
                    mode: 'rule',
                  });

                  setConstraintEditorText(formatConstraintJson(rule));
                }}
                // onPdfLoadedChange={setHasPdfLoaded}
              />
            </div>
          </div>
        </div>
      </div>

      {/* constraint 편집 패널 (오버레이 우클릭 시 표시) */}
      {constraintSelection && (
        <ConstraintEditorPanel
          selection={constraintSelection}
          text={constraintEditorText}
          onChangeText={setConstraintEditorText}
          onClose={() => setConstraintSelection(null)}
          onRevert={() => {
            if (!constraintSelection) return;
            const { page, primaryId, mode } = constraintSelection;

            if (mode === 'page') {
              const pageRule = constraintDoc?.pages?.find(
                (p: any) => Number(p.page) === Number(page)
              );
              if (!pageRule) return;
              setConstraintEditorText(formatConstraintJson(pageRule));
              return;
            }

            // 단일 rule 모드
            const rule = ensureComponentRule(page, primaryId);
            setConstraintEditorText(formatConstraintJson(rule));
          }}
          onSave={() => {
            if (!constraintSelection) return;
            const { page, primaryId, mode } = constraintSelection;

            try {
              const parsed = JSON.parse(constraintEditorText || '{}') as any;

              if (mode === 'page') {
                const pageNo = Number(parsed.page ?? page);

                setConstraintDoc(prev => {
                  const pages = [...prev.pages];
                  const idx = pages.findIndex(
                    (p: any) => Number(p.page) === pageNo
                  );

                  // parsed 전체를 저장 (components 뿐 아니라 qr_dialoges 등 포함)
                  const newPageObj = { ...parsed, page: pageNo };

                  if (idx === -1) pages.push(newPageObj);
                  else pages[idx] = newPageObj;

                  return { ...prev, pages };
                });

                alert('해당 페이지 데이터가 저장되었습니다.');
                return;
              }

              // 🔹 단일 rule 편집 저장 (기존 로직)
              parsed.id = primaryId; // 항상 대표 id 하나만 사용
              const pageNo = page;

              setConstraintDoc(prev => {
                const pages = [...prev.pages];
                const pageIndex = pages.findIndex(p => p.page === pageNo);

                if (pageIndex === -1) {
                  // 페이지가 없으면 새 페이지 규칙 생성
                  pages.push({
                    page: pageNo,
                    components: [parsed],
                  });
                } else {
                  const pageRule = pages[pageIndex];
                  const comps = [...pageRule.components];
                  const compIndex = comps.findIndex(c => c.id === parsed.id);

                  if (compIndex === -1) {
                    comps.push(parsed);
                  } else {
                    comps[compIndex] = parsed;
                  }

                  pages[pageIndex] = {
                    ...pageRule,
                    components: comps,
                  };
                }

                return {
                  ...prev,
                  pages,
                };
              });

              alert('constraint가 저장되었습니다.');
            } catch (err) {
              console.error(err);
              alert('JSON 파싱에 실패했습니다. 형식을 다시 확인해 주세요.');
            }
          }}
          onAppendSelectedIds={() => {
            if (!constraintSelection) return;
            const { primaryId, ids: prevIds, mode } = constraintSelection;

            // 페이지 전체 모드에서는 복잡하니 일단 막기
            if (mode === 'page') {
              alert(
                '페이지 전체 편집 모드에서는 "선택 추가"를 사용할 수 없습니다.\n개별 rule 을 선택해서 편집해 주세요.'
              );
              return;
            }

            const idsFromWs = wsRef.current?.getSelectedOverlayIds?.() ?? [];
            if (!idsFromWs.length) return;

            const mergedIds = Array.from(
              new Set<string>([primaryId, ...prevIds, ...idsFromWs])
            );

            setConstraintSelection(prev => {
              if (!prev) return prev;
              return { ...prev, ids: mergedIds };
            });

            try {
              const raw = (constraintEditorText || '').trim();
              const base: any = raw ? JSON.parse(raw) : {};
              base.id = primaryId;
              base.groupby = mergedIds.map(id => ({ id }));
              setConstraintEditorText(formatConstraintJson(base));
            } catch (err) {
              console.error(err);
              alert('현재 constraint 텍스트가 올바른 JSON 형식이 아닙니다.');
            }
          }}
          onDelete={() => {
            const { page, primaryId, mode } = constraintSelection;

            // 페이지 전체 삭제는 일단 보류
            if (mode === 'page') {
              // 필요하면 여기서 페이지 단위 rule 삭제 구현 가능
              alert('페이지 전체 rule 삭제는 아직 구현하지 않았습니다.');
              return;
            }

            if (
              !window.confirm(
                `이 rule을 삭제할까요? (page: ${page}, id: ${primaryId})`
              )
            ) {
              return;
            }

            setConstraintDoc(prev => {
              const pages = [...prev.pages];
              const pageIdx = pages.findIndex(p => p.page === page);
              if (pageIdx === -1) return prev;

              const pageRule = pages[pageIdx];
              const comps = (pageRule.components || []).filter(
                (c: any) => String(c.id) !== String(primaryId)
              );

              pages[pageIdx] = {
                ...pageRule,
                components: comps,
              };

              return { ...prev, pages };
            });

            setConstraintSelection(null);
            alert('rule 이 삭제되었습니다.');
          }}
        />
      )}

      {isTreeEditorOpen && (
        <TreeListEditorPanel
          circleSlashItems={wsRef.current?.getAllCircleSlashItems() ?? []}
          initialTree={
            treeEditorMode === 'edit' ? constraintDoc?.treelist : undefined
          }
          onSave={tree => {
            setConstraintDoc(prev => {
              if (!prev) return prev;

              // 1️ treelist 저장
              const nextDoc = {
                ...prev,
                treelist: tree,
              };

              // 2 treelist id → overlay id 매핑 생성
              // (circleSlashItems 는 overlay.id 리스트)
              const overlayIds = new Set(
                (wsRef.current?.getAllCircleSlashItems() ?? []).map(o => o.id)
              );

              // 3 모든 treelist 노드를 순회하며
              //     rule.id 를 overlay.id 로 강제 맞춤
              const rewriteRules = (nodes: any[]) => {
                nodes.forEach(n => {
                  if (overlayIds.has(n.id)) {
                    // n.id 가 overlay.id 인 경우만 rule 생성
                    ensureComponentRule(
                      /* page */ pageInfo.current,
                      /* id */ n.id,
                      /* type */ 'circleslash'
                    );
                  }
                  if (Array.isArray(n.children)) {
                    rewriteRules(n.children);
                  }
                });
              };

              rewriteRules(tree);

              return nextDoc;
            });

            alert('treelist + rule 매핑이 저장되었습니다.');
          }}
          onClose={() => setIsTreeEditorOpen(false)}
        />
      )}

      {/* 🔹 Rule 목록 토글 버튼 & 패널 */}
      <button
        type="button"
        className="
          fixed
          right-4
          top-24
          z-40
          px-3
          py-1
          rounded-full
          text-[11px]
          bg-slate-800
          text-slate-100
          border border-slate-600
          hover:bg-slate-700
        "
        onClick={() => setIsRuleListOpen(prev => !prev)}
      >
        Rule 목록
      </button>

      {isRuleListOpen && (
        <ConstraintRuleListPanel
          page={pageInfo.current}
          constraintDoc={constraintDoc}
          onSelectRule={({ page, ruleId, ids }) => {
            const pageRule = constraintDoc?.pages?.find(
              (p: any) => Number(p.page) === Number(page)
            );

            // 1) "이 페이지 전체 JSON"
            if (ruleId === '__PAGE_ALL__') {
              if (!pageRule) return;

              setConstraintSelection({
                page,
                primaryId: '__PAGE_ALL__',
                ids,
                mode: 'page',
              });

              // 핵심: components만 말고 pageRule 전체!
              setConstraintEditorText(formatConstraintJson(pageRule));
              return;
            }

            // 2) 개별 rule 선택
            const rule = pageRule?.components?.find(
              (c: any) => String(c.id) === String(ruleId)
            );
            if (!rule) return;

            setConstraintSelection({
              page,
              primaryId: ruleId,
              ids,
              mode: 'rule',
            });

            setConstraintEditorText(formatConstraintJson(rule));
          }}
          onClose={() => setIsRuleListOpen(false)}
        />
      )}

      {/* Footer 높이 측정용 wrapper */}
      <div ref={footerRef}>
        <EditorFooter
          currentFile={currentFile}
          wordCount={wordCount}
          pageCount={pageCount}
          isModified={isModified}
          currentPage={pageInfo.current}
          totalPages={pageInfo.total}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onPageChange={handlePageChange}
        />
      </div>
    </BaseLayout>
  );
}
