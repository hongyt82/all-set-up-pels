// src/types/constraints.ts

export interface ConstraintExpression {
  expression: string; // 예: "100 < value && value < 1000", "default"
  status: string; // 예: "allow" | "warning" | "error" | "calculated"
}

export interface ConstraintEvent {
  onStatus: string; // 위 status 와 매칭되는 값
  targetId: string; // 영향을 받는 컨트롤 ID (예: "00010201")
  targetValue: string; // "0", "1", "result", 문자열 등
}

export interface GroupByItem {
  id: string;
  title?: string; // 나중에 UI에서 보여줄 이름
}

export interface ConstraintComponentRule {
  id: string; // ★ 단일 ID (string)
  groupby?: GroupByItem[]; // 라디오 그룹 등
  children?: TreeListItem[];
  constraints?: ConstraintExpression[]; // 판정 수식들
  events?: ConstraintEvent[]; // 판정 결과에 따라 수행되는 이벤트들
  behavior?: 'radio' | 'normal' | string;
  groupType?: 'checkbox' | 'circleslash';
}

export interface ConstraintPageRule {
  page: number; // 페이지 번호
  components: ConstraintComponentRule[]; // 해당 페이지의 컴포넌트 규칙들

  dialoges?: {
    sectionId?: string;
    title?: string;
    columnes: {
      sectionId?: string;
      title?: string;
      controls: {
        id: string;
        type: string;
        value?: string;
        title?: string;
        options?: { value: string; label: string }[];
        unit?: string;
      }[];
    }[];
  }[];

  qr_dialoges?: {
    sectionId?: string;
    title: string;
    qr: string;
    targetPdfPageNo: number;
    columnes: {
      sectionId?: string;
      title?: string;
      controls: {
        id: string;
        type: string;
        value?: string;
        title?: string;
        options?: { value: string; label: string }[];
        unit?: string;
      }[];
    }[];
  }[];
}

export interface ConstraintDoc {
  docId: string; // 문서 ID (컨트롤러 json 과 짝)
  pages: ConstraintPageRule[];
  treelist?: TreeListItem[];
}

// export interface ConstraintTreeNode {
//   id: string;
//   title?: string;
//   children?: ConstraintTreeNode[];
// }

export interface TreeListItem {
  id: string;
  title?: string;
  children?: TreeListItem[];
}
