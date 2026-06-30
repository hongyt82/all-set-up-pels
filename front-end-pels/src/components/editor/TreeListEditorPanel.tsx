// src/components/editor/TreeListEditorPanel.tsx
import React, { useMemo, useState } from 'react';
import type { TreeListItem } from '../../types/constraints';
import { Rnd } from 'react-rnd';
import { devLog } from '../../utils/devConsole';

interface CircleSlashItem {
  id: string;
  title: string;
}

interface Props {
  circleSlashItems: CircleSlashItem[];
  initialTree?: TreeListItem[];
  onSave: (tree: TreeListItem[]) => void;
  onClose: () => void;
}

interface UiNode {
  id: string;
  title: string;
  children: UiNode[];
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const MAX_TREE_DEPTH = 10;

export const TreeListEditorPanel: React.FC<Props> = ({
  circleSlashItems,
  initialTree,
  onSave,
  onClose,
}) => {
  /**
   * ---------------------------------
   * 1. 초기 트리 구성
   * ---------------------------------
   */
  const initialUiTree: UiNode[] = useMemo(() => {
    const used = new Set<string>();

    // circleslash id → title 매핑 (rule 기반 or fallback)
    const titleMap = new Map<string, string>();
    circleSlashItems.forEach((item, idx) => {
      titleMap.set(item.id, item.title || `${idx + 1}.0`);
    });

    const fromTree = (nodes: TreeListItem[] = []): UiNode[] =>
      nodes.map(n => {
        used.add(n.id);
        return {
          id: n.id,
          // treelist에 title 없으면 circleslash title 사용
          title: n.title ?? titleMap.get(n.id) ?? n.id,
          children: fromTree(n.children ?? []),
        };
      });

    const tree = initialTree ? fromTree(initialTree) : [];

    // 트리에 없는 circleslash → root 자동 추가
    circleSlashItems.forEach(item => {
      if (!used.has(item.id)) {
        tree.push({
          id: item.id,
          // create 모드에서도 3.1.1 같은 값 보장
          title: titleMap.get(item.id) ?? item.id,
          children: [],
        });
      }
    });

    devLog('[TreeListEditorPanel] circleSlashItems', circleSlashItems);
    devLog('[TreeListEditorPanel] initialTree', initialTree);
    devLog('[TreeListEditorPanel] built tree', tree);

    return tree;
  }, [circleSlashItems, initialTree]);

  const [tree, setTree] = useState<UiNode[]>(initialUiTree);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [size, setSize] = useState({ width: 520, height: 600 });
  const [position, setPosition] = useState({ x: 100, y: 80 });

  /**
   * ---------------------------------
   * 2. 트리 유틸
   * ---------------------------------
   */
  const flatten = (nodes: UiNode[], out: UiNode[] = []): UiNode[] => {
    nodes.forEach(n => {
      out.push(n);
      flatten(n.children, out);
    });
    return out;
  };

  const findNode = (nodes: UiNode[], id: string): UiNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const c = findNode(n.children, id);
      if (c) return c;
    }
    return null;
  };

  const isDescendant = (parent: UiNode, childId: string): boolean =>
    parent.children.some(c => c.id === childId || isDescendant(c, childId));

  const filterTopLevelSelection = (nodes: UiNode[], selected: string[]) =>
    selected.filter(id => {
      const node = findNode(nodes, id);
      if (!node) return false;
      return !selected.some(otherId => {
        if (otherId === id) return false;
        const other = findNode(nodes, otherId);
        return other ? isDescendant(other, id) : false;
      });
    });

  // subtree 전체 제거 (복사/잔상 방지)
  const removeMany = (nodes: UiNode[], removeIds: Set<string>): UiNode[] => {
    const walk = (list: UiNode[]): UiNode[] => {
      const result: UiNode[] = [];
      for (const n of list) {
        if (removeIds.has(n.id)) continue;
        result.push({ ...n, children: walk(n.children) });
      }
      return result;
    };
    return walk(nodes);
  };

  const insertAsChild = (
    nodes: UiNode[],
    parentId: string,
    childrenToInsert: UiNode[]
  ): UiNode[] =>
    nodes.map(n =>
      n.id === parentId
        ? { ...n, children: [...n.children, ...childrenToInsert] }
        : {
            ...n,
            children: insertAsChild(n.children, parentId, childrenToInsert),
          }
    );

  /**
   * depth 제한 (최대 5단계)
   */
  const getDepth = (nodes: UiNode[], id: string, depth = 1): number | null => {
    for (const n of nodes) {
      if (n.id === id) return depth;
      const d = getDepth(n.children, id, depth + 1);
      if (d) return d;
    }
    return null;
  };

  const maxDepthOf = (n: UiNode): number =>
    n.children.length ? 1 + Math.max(...n.children.map(maxDepthOf)) : 1;

  const wouldExceedDepth = (
    nodes: UiNode[],
    targetId: string,
    movingRoots: UiNode[]
  ) => {
    const targetDepth = getDepth(nodes, targetId);
    if (!targetDepth) return true;
    const movingDepth = Math.max(...movingRoots.map(maxDepthOf));
    return targetDepth + movingDepth > MAX_TREE_DEPTH;
  };

  /**
   * ---------------------------------
   * 3. Drag & Drop
   * ---------------------------------
   */
  const handleDrop = (targetId: string) => {
    if (!draggingIds.length || draggingIds.includes(targetId)) return;

    const topLevelIds = filterTopLevelSelection(tree, draggingIds);
    const movingNodes = topLevelIds
      .map(id => findNode(tree, id))
      .filter(Boolean)
      .map(n => clone(n!));

    if (wouldExceedDepth(tree, targetId, movingNodes)) {
      alert(`최대 ${MAX_TREE_DEPTH}단계까지만 허용됩니다.`);
      return;
    }

    const removeSet = new Set(topLevelIds);
    let next = removeMany(tree, removeSet);
    next = insertAsChild(next, targetId, movingNodes);

    setTree(next);
    setDraggingIds([]);
    setSelectedIds([]);
  };

  /**
   * ---------------------------------
   * 4. 저장
   * ---------------------------------
   */
  const buildResult = (nodes: UiNode[]): TreeListItem[] =>
    nodes.map(n => ({
      id: n.id,
      title: n.title,
      children: buildResult(n.children),
    }));

  /**
   * ---------------------------------
   * 5. 렌더
   * ---------------------------------
   */
  const renderNode = (node: UiNode, depth = 0) => {
    const isSelected = selectedIds.includes(node.id);

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={() =>
            setDraggingIds(isSelected ? selectedIds : [node.id])
          }
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(node.id)}
          onClick={e => {
            if (e.shiftKey && lastSelectedId) {
              const flat = flatten(tree);
              const a = flat.findIndex(n => n.id === lastSelectedId);
              const b = flat.findIndex(n => n.id === node.id);
              if (a >= 0 && b >= 0) {
                setSelectedIds(
                  flat.slice(Math.min(a, b), Math.max(a, b) + 1).map(n => n.id)
                );
              }
            } else if (e.ctrlKey || e.metaKey) {
              setSelectedIds(prev =>
                prev.includes(node.id)
                  ? prev.filter(id => id !== node.id)
                  : [...prev, node.id]
              );
              setLastSelectedId(node.id);
            } else {
              setSelectedIds([node.id]);
              setLastSelectedId(node.id);
            }
          }}
          style={{
            marginLeft: depth * 20,
            padding: '6px 8px',
            borderRadius: 4,
            cursor: 'grab',
            background: isSelected ? '#e0e7ff' : 'transparent',
            userSelect: 'none',
          }}
        >
          <b>{node.title}</b>
          <span style={{ marginLeft: 6, fontSize: 11, color: '#6b7280' }}>
            ({node.id})
          </span>
        </div>
        {node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <Rnd
      size={size}
      position={position}
      onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(pos);
      }}
      minWidth={420}
      minHeight={300}
      bounds="window"
      dragHandleClassName="cst-drag-handle"
      style={{ zIndex: 1000, position: 'fixed' }}
    >
      <div className="w-full h-full bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <div
          className="cst-drag-handle"
          style={{
            padding: 12,
            fontWeight: 600,
            cursor: 'move',
            borderBottom: '1px solid #e5e7eb',
            userSelect: 'none',
          }}
        >
          ⌀ CircleSlash Tree Editor
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {tree.map(n => renderNode(n))}
        </div>

        <div
          style={{
            padding: 12,
            borderTop: '1px solid #e5e7eb',
            textAlign: 'right',
          }}
        >
          <button onClick={onClose}>취소</button>
          <button
            style={{ marginLeft: 8 }}
            onClick={() => {
              onSave(buildResult(tree));
              onClose();
            }}
          >
            저장
          </button>
        </div>
      </div>
    </Rnd>
  );
};
