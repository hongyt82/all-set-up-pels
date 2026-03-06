/**
 * Editor 상태 관리 Store (Zustand + IndexedDB Persist)
 *
 * 이 Store는 EditorPage의 모든 상태를 중앙에서 관리하고,
 * IndexedDB를 통해 리로드 시에도 완전한 상태 복원을 제공합니다.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { ToolCategory } from '../components/editor/EditorHeader';

/**
 * 페이지별 컴포넌트 데이터 인터페이스 (더미 데이터용)
 */
export interface PageComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, unknown>;
}

export interface PageData {
  pageNumber: number;
  components: PageComponent[];
  metadata: {
    lastModified: string;
    componentCount: number;
  };
}

/**
 * Editor 상태 인터페이스
 */
export interface EditorState {
  // 1. 기본 UI 상태
  selectedCategory: ToolCategory;
  selectedTool: string | null;
  isOverlayVisible: boolean;

  // 2. 페이지 네비게이션
  currentPage: number;
  totalPages: number;

  // 3. 파일 정보
  currentFile: string | null;
  isModified: boolean;
  wordCount: number;
  pageCount: number;

  // 4. 전체 페이지 컴포넌트 데이터 (더미 데이터)
  pages: PageData[];

  // 5. 메타데이터
  metadata: {
    lastAutoSave: string | null;
    version: string;
    sessionId: string;
  };

  // 6. 상태 저장 활성화 여부
  isPersistEnabled: boolean;

  // 액션들
  setSelectedCategory: (category: ToolCategory) => void;
  setSelectedTool: (tool: string | null) => void;
  setIsOverlayVisible: (visible: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setCurrentFile: (file: string | null) => void;
  setIsModified: (modified: boolean) => void;
  setWordCount: (count: number) => void;
  setPageCount: (count: number) => void;
  updatePageData: (pageNumber: number, components: PageComponent[]) => void;
  addComponent: (pageNumber: number, component: PageComponent) => void;
  updateComponentPosition: (
    pageNumber: number,
    componentId: string,
    x: number,
    y: number
  ) => void;
  updateComponentSize: (
    pageNumber: number,
    componentId: string,
    width: number,
    height: number
  ) => void;
  removeComponent: (pageNumber: number, componentId: string) => void;
  resetAllState: () => void;
  togglePersist: () => void;
  updateMetadata: () => void;
}

/**
 * 초기 상태 (더미 데이터 포함)
 */
const initialState = {
  selectedCategory: null as ToolCategory,
  selectedTool: null,
  isOverlayVisible: true,
  currentPage: 1,
  totalPages: 37,
  currentFile: null,
  isModified: false,
  wordCount: 0,
  pageCount: 1,
  pages: [] as PageData[],
  metadata: {
    lastAutoSave: null,
    version: '1.0.0',
    sessionId: generateSessionId(),
  },
  isPersistEnabled: true,
};

/**
 * 세션 ID 생성
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 더미 페이지 데이터 생성 (테스트용)
 */
function generateDummyPages(totalPages: number): PageData[] {
  return Array.from({ length: totalPages }, (_, i) => ({
    pageNumber: i + 1,
    components: [],
    metadata: {
      lastModified: new Date().toISOString(),
      componentCount: 0,
    },
  }));
}

/**
 * IndexedDB Storage 어댑터
 */
const storage = createJSONStorage<EditorState>(() => ({
  getItem: async (name: string) => {
    try {
      const value = await get(name);
      if (value) {
        console.log('📖 [EditorStore] 상태 복원:', {
          키: name,
          데이터크기: JSON.stringify(value).length + ' bytes',
          시간: new Date().toLocaleTimeString(),
        });
      }
      return value;
    } catch (error) {
      console.error('❌ [EditorStore] 상태 복원 실패:', error);
      return null;
    }
  },
  setItem: async (name: string, value: unknown) => {
    try {
      const state = value as EditorState;
      // isPersistEnabled가 false면 저장하지 않음
      if (!state.isPersistEnabled) {
        console.log('⏸️ [EditorStore] 상태 저장 건너뛰기 (비활성화됨)');
        return;
      }

      await set(name, value);
      console.log('💾 [EditorStore] 상태 저장:', {
        키: name,
        선택된카테고리: state.selectedCategory,
        현재페이지: state.currentPage,
        총페이지: state.totalPages,
        오버레이표시: state.isOverlayVisible,
        데이터크기: JSON.stringify(value).length + ' bytes',
        시간: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('❌ [EditorStore] 상태 저장 실패:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await del(name);
      console.log('🗑️ [EditorStore] 상태 삭제:', {
        키: name,
        시간: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('❌ [EditorStore] 상태 삭제 실패:', error);
    }
  },
}));

/**
 * Zustand Store 생성
 */
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedCategory: category => {
        console.log('📝 [EditorStore] 카테고리 변경:', {
          이전: get().selectedCategory,
          새로운값: category,
          시간: new Date().toLocaleTimeString(),
        });
        set({ selectedCategory: category });
        get().updateMetadata();
      },

      setSelectedTool: tool => {
        console.log('🔧 [EditorStore] 도구 변경:', {
          이전: get().selectedTool,
          새로운값: tool,
          시간: new Date().toLocaleTimeString(),
        });
        set({ selectedTool: tool });
        get().updateMetadata();
      },

      setIsOverlayVisible: visible => {
        console.log('👁️ [EditorStore] 오버레이 표시 변경:', {
          이전: get().isOverlayVisible,
          새로운값: visible,
          시간: new Date().toLocaleTimeString(),
        });
        set({ isOverlayVisible: visible });
        get().updateMetadata();
      },

      setCurrentPage: page => {
        const totalPages = get().totalPages;
        const validPage = Math.max(1, Math.min(page, totalPages));
        console.log('📄 [EditorStore] 현재 페이지 변경:', {
          이전: get().currentPage,
          새로운값: validPage,
          시간: new Date().toLocaleTimeString(),
        });
        set({ currentPage: validPage });
        get().updateMetadata();
      },

      setTotalPages: total => {
        console.log('📚 [EditorStore] 총 페이지 변경:', {
          이전: get().totalPages,
          새로운값: total,
          시간: new Date().toLocaleTimeString(),
        });

        // 페이지 수가 변경되면 더미 페이지 데이터 재생성
        const pages = total > 0 ? generateDummyPages(total) : [];
        set({
          totalPages: total,
          pages,
          currentPage: total > 0 ? Math.min(get().currentPage, total) : 0,
        });
        get().updateMetadata();
      },

      setCurrentFile: file => {
        console.log('📁 [EditorStore] 현재 파일 변경:', {
          이전: get().currentFile,
          새로운값: file,
          시간: new Date().toLocaleTimeString(),
        });
        set({ currentFile: file });
        get().updateMetadata();
      },

      setIsModified: modified => {
        set({ isModified: modified });
        get().updateMetadata();
      },

      setWordCount: count => {
        set({ wordCount: count });
      },

      setPageCount: count => {
        set({ pageCount: count });
      },

      updatePageData: (pageNumber, components) => {
        const state = get();
        const pages = [...state.pages];
        const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);

        if (pageIndex !== -1) {
          pages[pageIndex] = {
            ...pages[pageIndex],
            components,
            metadata: {
              lastModified: new Date().toISOString(),
              componentCount: components.length,
            },
          };

          console.log('🔄 [EditorStore] 페이지 데이터 업데이트:', {
            페이지번호: pageNumber,
            컴포넌트수: components.length,
            시간: new Date().toLocaleTimeString(),
          });

          set({ pages, isModified: true });
          get().updateMetadata();
        }
      },

      addComponent: (pageNumber, component) => {
        const state = get();
        const pages = [...state.pages];
        const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);

        if (pageIndex !== -1) {
          const updatedComponents = [...pages[pageIndex].components, component];
          pages[pageIndex] = {
            ...pages[pageIndex],
            components: updatedComponents,
            metadata: {
              lastModified: new Date().toISOString(),
              componentCount: updatedComponents.length,
            },
          };

          console.log('➕ [EditorStore] 컴포넌트 추가:', {
            페이지번호: pageNumber,
            컴포넌트ID: component.id,
            컴포넌트타입: component.type,
            위치: { x: component.x, y: component.y },
            크기: { width: component.width, height: component.height },
            현재컴포넌트수: updatedComponents.length,
            시간: new Date().toLocaleTimeString(),
          });

          set({ pages, isModified: true });
          get().updateMetadata();
        }
      },

      updateComponentPosition: (pageNumber, componentId, x, y) => {
        const state = get();
        const pages = [...state.pages];
        const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);

        if (pageIndex !== -1) {
          const componentIndex = pages[pageIndex].components.findIndex(
            c => c.id === componentId
          );

          if (componentIndex !== -1) {
            const updatedComponents = [...pages[pageIndex].components];
            updatedComponents[componentIndex] = {
              ...updatedComponents[componentIndex],
              x,
              y,
            };

            pages[pageIndex] = {
              ...pages[pageIndex],
              components: updatedComponents,
              metadata: {
                lastModified: new Date().toISOString(),
                componentCount: updatedComponents.length,
              },
            };

            console.log('🔄 [EditorStore] 컴포넌트 위치 업데이트:', {
              페이지번호: pageNumber,
              컴포넌트ID: componentId,
              새위치: { x, y },
              시간: new Date().toLocaleTimeString(),
            });

            set({ pages, isModified: true });
            get().updateMetadata();
          }
        }
      },

      updateComponentSize: (pageNumber, componentId, width, height) => {
        const state = get();
        const pages = [...state.pages];
        const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);

        if (pageIndex !== -1) {
          const componentIndex = pages[pageIndex].components.findIndex(
            c => c.id === componentId
          );

          if (componentIndex !== -1) {
            const updatedComponents = [...pages[pageIndex].components];
            updatedComponents[componentIndex] = {
              ...updatedComponents[componentIndex],
              width,
              height,
            };

            pages[pageIndex] = {
              ...pages[pageIndex],
              components: updatedComponents,
              metadata: {
                lastModified: new Date().toISOString(),
                componentCount: updatedComponents.length,
              },
            };

            console.log('📏 [EditorStore] 컴포넌트 크기 업데이트:', {
              페이지번호: pageNumber,
              컴포넌트ID: componentId,
              새크기: { width, height },
              시간: new Date().toLocaleTimeString(),
            });

            set({ pages, isModified: true });
            get().updateMetadata();
          }
        }
      },

      removeComponent: (pageNumber, componentId) => {
        const state = get();
        const pages = [...state.pages];
        const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);

        if (pageIndex !== -1) {
          const updatedComponents = pages[pageIndex].components.filter(
            c => c.id !== componentId
          );
          pages[pageIndex] = {
            ...pages[pageIndex],
            components: updatedComponents,
            metadata: {
              lastModified: new Date().toISOString(),
              componentCount: updatedComponents.length,
            },
          };

          console.log('➖ [EditorStore] 컴포넌트 삭제:', {
            페이지번호: pageNumber,
            컴포넌트ID: componentId,
            남은컴포넌트수: updatedComponents.length,
            시간: new Date().toLocaleTimeString(),
          });

          set({ pages, isModified: true });
          get().updateMetadata();
        }
      },

      resetAllState: () => {
        console.log('🔄 [EditorStore] 전체 상태 초기화:', {
          시간: new Date().toLocaleTimeString(),
        });
        set({
          ...initialState,
          metadata: {
            ...initialState.metadata,
            sessionId: generateSessionId(),
          },
          isPersistEnabled: get().isPersistEnabled, // persist 설정은 유지
        });
      },

      togglePersist: () => {
        const newValue = !get().isPersistEnabled;
        console.log('🔀 [EditorStore] 상태 저장 토글:', {
          이전값: get().isPersistEnabled,
          새로운값: newValue,
          시간: new Date().toLocaleTimeString(),
        });
        set({ isPersistEnabled: newValue });

        // 비활성화 시 저장된 상태 삭제
        if (!newValue) {
          del('editor-storage')
            .then(() => {
              console.log('🗑️ [EditorStore] 저장된 상태 삭제 완료');
            })
            .catch(error => {
              console.error('❌ [EditorStore] 저장된 상태 삭제 실패:', error);
            });
        }
      },

      updateMetadata: () => {
        set({
          metadata: {
            ...get().metadata,
            lastAutoSave: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'editor-storage',
      storage,
      partialize: state => {
        // isPersistEnabled가 false면 저장하지 않음
        if (!state.isPersistEnabled) {
          return {} as EditorState;
        }

        // 전체 상태 저장
        return {
          selectedCategory: state.selectedCategory,
          selectedTool: state.selectedTool,
          isOverlayVisible: state.isOverlayVisible,
          currentPage: state.currentPage,
          totalPages: state.totalPages,
          currentFile: state.currentFile,
          isModified: state.isModified,
          wordCount: state.wordCount,
          pageCount: state.pageCount,
          pages: state.pages,
          metadata: state.metadata,
          isPersistEnabled: state.isPersistEnabled,
        } as EditorState;
      },
    }
  )
);
