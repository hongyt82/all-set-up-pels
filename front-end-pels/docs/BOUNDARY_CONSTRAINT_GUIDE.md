# 📐 경계 제한 시스템 가이드

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [구성 요소](#구성-요소)
3. [사용 방법](#사용-방법)
4. [실전 예제](#실전-예제)
5. [커스터마이징](#커스터마이징)

---

## 시스템 개요

PDF Formatter 애플리케이션의 경계 제한 시스템은 오버레이 위에 배치되는 모든 컴포넌트가 **PDF 페이지 영역(520x736px)을 절대로 벗어날 수 없도록** 강제로 제한합니다.

### ✨ 주요 기능

- **드래그 앤 드롭 방식**: 도구 선택 시 좌측 상단(x:20, y:40)에 컴포넌트 자동 생성
- **강제 경계 제한**: 이중 안전장치로 드래그 시 절대 페이지 밖으로 나갈 수 없음
- **실시간 경고 시스템**: 경계 근처에서 빨간색 경고선 + 경고 메시지 표시
- **경계 벗어남 감지**: 영역을 벗어나면 상단에 경고 배너 애니메이션
- **그리드 스냅**: 5px 단위로 정렬 (선택적)
- **실시간 좌표 표시**: 드래그 중 현재 위치 표시

### 📏 PDF 페이지 경계

```typescript
const PDF_BOUNDARY = {
  width: 520, // A4 비율 고정
  height: 736,
  minX: 0,
  minY: 0,
};
```

---

## 구성 요소

### 📁 파일 구조

```
├── lib/
│   └── boundaryUtils.ts              # 경계 제한 유틸리티 함수
├── hooks/
│   └── useBoundaryConstraint.ts      # 경계 제한 커스텀 훅
├── components/editor/
│   ├── BoundaryIndicator.tsx         # 경계 시각적 인디케이터
│   └── DraggableComponent.tsx        # 드래그 가능한 컴포넌트 래퍼
└── stores/
    └── editorStore.ts                # 컴포넌트 위치/크기 상태 관리
```

---

## 사용 방법

### 🎯 기본 동작 방식

1. **헤더에서 도구 선택** → 좌측 상단(x:20, y:40)에 컴포넌트 자동 생성
2. **생성된 컴포넌트 드래그** → 원하는 위치로 이동
3. **경계 근처 도달** → 빨간색 경고선 + 메시지 표시
4. **경계 벗어남 시도** → 자동으로 경계 내로 제한
5. **Delete 키 또는 X 버튼** → 컴포넌트 삭제

### 1️⃣ DraggableComponent 사용 (권장)

가장 간단한 방법은 `DraggableComponent` 래퍼를 사용하는 것입니다.

```tsx
import { DraggableComponent } from '../components/editor/DraggableComponent';

function MyOverlayComponent() {
  return (
    <DraggableComponent
      id="unique-id-1"
      initialX={20} // 좌측 상단 시작
      initialY={40}
      initialWidth={40}
      initialHeight={40}
      pageNumber={1}
      resizable={false}
      onDelete={() => console.log('Delete')}
    >
      <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
        🚫
      </div>
    </DraggableComponent>
  );
}
```

### 2️⃣ useBoundaryConstraint 훅 직접 사용

더 세밀한 제어가 필요한 경우 훅을 직접 사용할 수 있습니다.

```tsx
import { useBoundaryConstraint } from '../hooks/useBoundaryConstraint';

function CustomDraggableComponent() {
  const {
    position,
    boundaryState,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  } = useBoundaryConstraint(
    'my-component',
    { x: 100, y: 100, width: 40, height: 40 },
    {
      enableSnap: true,
      snapGridSize: 5,
      enableLogging: true,
    }
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  // ... 나머지 구현
}
```

### 3️⃣ 경계 유틸리티 함수 사용

컴포넌트 생성 시점에 경계 체크만 필요한 경우:

```tsx
import { constrainToBoundary, canPlaceComponent } from '../lib/boundaryUtils';

// 배치 가능 여부 확인
if (canPlaceComponent(x, y, width, height)) {
  // 컴포넌트 생성
}

// 위치 제한
const constrained = constrainToBoundary({ x, y, width, height });
console.log('제한된 위치:', constrained.x, constrained.y);
```

---

## 실전 예제

### 예제 1: 금지 표시 컴포넌트 (Ban)

```tsx
import { useState } from 'react';
import { DraggableComponent } from '../components/editor/DraggableComponent';
import { useEditorStore } from '../stores/editorStore';

function BanComponent() {
  const [banElements, setBanElements] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
    }>
  >([]);

  const currentPage = useEditorStore(state => state.currentPage);

  // 클릭으로 Ban 요소 추가
  const handleOverlayClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBan = {
      id: `ban-${Date.now()}`,
      x: x - 20, // 중심점 기준
      y: y - 20,
    };

    setBanElements([...banElements, newBan]);
  };

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onClick={handleOverlayClick}
      style={{ width: '520px', height: '736px' }}
    >
      {banElements.map(ban => (
        <DraggableComponent
          key={ban.id}
          id={ban.id}
          initialX={ban.x}
          initialY={ban.y}
          initialWidth={40}
          initialHeight={40}
          pageNumber={currentPage}
          onDelete={() => {
            setBanElements(banElements.filter(b => b.id !== ban.id));
          }}
        >
          <div className="w-full h-full border-2 border-red-600 rounded-full bg-red-100/30 flex items-center justify-center">
            <div className="bg-red-600 w-8 h-1 transform rotate-45" />
          </div>
        </DraggableComponent>
      ))}
    </div>
  );
}
```

### 예제 2: 리사이즈 가능한 텍스트박스

```tsx
function TextBoxComponent() {
  const [textBoxes, setTextBoxes] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      text: string;
    }>
  >([]);

  return (
    <div
      className="absolute inset-0"
      style={{ width: '520px', height: '736px' }}
    >
      {textBoxes.map(box => (
        <DraggableComponent
          key={box.id}
          id={box.id}
          initialX={box.x}
          initialY={box.y}
          initialWidth={150}
          initialHeight={60}
          pageNumber={1}
          resizable={true}
          onDelete={() => {
            setTextBoxes(textBoxes.filter(b => b.id !== box.id));
          }}
        >
          <textarea
            className="w-full h-full p-2 border border-gray-300 rounded resize-none"
            defaultValue={box.text}
            placeholder="텍스트 입력..."
          />
        </DraggableComponent>
      ))}
    </div>
  );
}
```

### 예제 3: 경계 근처 감지

```tsx
import { useBoundaryConstraint } from '../hooks/useBoundaryConstraint';
import { BoundaryIndicator } from '../components/editor/BoundaryIndicator';

function ComponentWithBoundaryWarning() {
  const {
    position,
    boundaryState,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  } = useBoundaryConstraint('my-id', { x: 100, y: 100, width: 40, height: 40 });

  return (
    <>
      {/* 경계 경고 표시 */}
      <BoundaryIndicator
        showWarning={boundaryState.isNearBoundary}
        nearLeft={boundaryState.nearLeft}
        nearRight={boundaryState.nearRight}
        nearTop={boundaryState.nearTop}
        nearBottom={boundaryState.nearBottom}
      />

      {/* 컴포넌트 */}
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
        }}
        onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
      >
        내용
      </div>
    </>
  );
}
```

### 예제 4: 스토어와 연동

```tsx
import { useEditorStore } from '../stores/editorStore';

function ComponentWithStore() {
  const {
    addComponent,
    updateComponentPosition,
    removeComponent,
    currentPage,
  } = useEditorStore();

  const handleAddBan = (x: number, y: number) => {
    const newComponent = {
      id: `ban-${Date.now()}`,
      type: 'ban-circle',
      x,
      y,
      width: 40,
      height: 40,
    };

    // 스토어에 추가
    addComponent(currentPage, newComponent);
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    // 스토어 업데이트
    updateComponentPosition(currentPage, id, x, y);
  };

  const handleDelete = (id: string) => {
    // 스토어에서 제거
    removeComponent(currentPage, id);
  };

  // ... 렌더링
}
```

---

## 커스터마이징

### 경계 크기 변경

`/lib/boundaryUtils.ts` 파일에서 `PDF_BOUNDARY` 상수를 수정:

```typescript
export const PDF_BOUNDARY = {
  width: 600, // 변경
  height: 800, // 변경
  minX: 0,
  minY: 0,
} as const;
```

### 그리드 스냅 크기 조정

```tsx
useBoundaryConstraint('id', position, {
  enableSnap: true,
  snapGridSize: 10, // 10px 단위로 변경
});
```

### 최소 크기 설정

```tsx
useBoundaryConstraint('id', position, {
  minWidth: 50, // 최소 너비
  minHeight: 50, // 최소 높이
});
```

### 경계 경고 임계값 조정

`/lib/boundaryUtils.ts`의 `isNearBoundary` 함수:

```typescript
export function isNearBoundary(
  position: ComponentPosition,
  threshold: number = 20  // 20px로 변경
): { ... } {
  // ...
}
```

### 경계 스타일 변경

`/components/editor/BoundaryIndicator.tsx`에서 스타일 수정:

```tsx
// 경계선 색상 변경
<div className="... bg-yellow-500 ..." /> // 빨간색 → 노란색
```

---

## 🎯 유틸리티 함수 목록

### boundaryUtils.ts

| 함수명                      | 설명                   | 반환값                             |
| --------------------------- | ---------------------- | ---------------------------------- |
| `isOutOfBounds`             | 경계를 벗어나는지 확인 | `boolean`                          |
| `constrainToBoundary`       | 위치를 경계 내로 제한  | `{ x, y, isConstrained }`          |
| `constrainSizeToBoundary`   | 크기를 경계 내로 제한  | `{ width, height, isConstrained }` |
| `canPlaceComponent`         | 배치 가능 여부 확인    | `boolean`                          |
| `calculateCenteredPosition` | 중심점 기준 위치 계산  | `ComponentPosition`                |
| `isNearBoundary`            | 경계 근처 여부 확인    | `{ nearLeft, nearRight, ... }`     |
| `adjustDragDelta`           | 드래그 델타 조정       | `{ deltaX, deltaY }`               |
| `snapToGrid`                | 그리드 스냅 적용       | `{ x, y }`                         |

---

## 📊 상태 관리 (editorStore)

### 추가된 액션

```typescript
// 컴포넌트 위치 업데이트
updateComponentPosition(pageNumber: number, componentId: string, x: number, y: number)

// 컴포넌트 크기 업데이트
updateComponentSize(pageNumber: number, componentId: string, width: number, height: number)
```

### 사용 예시

```tsx
const { updateComponentPosition, updateComponentSize } = useEditorStore();

// 위치 업데이트
updateComponentPosition(1, 'ban-123', 150, 200);

// 크기 업데이트
updateComponentSize(1, 'ban-123', 50, 50);
```

---

## ⚠️ 주의사항

1. **PDF 페이지 크기 고정**
   - 현재 520x736px로 고정되어 있으며, 변경 시 모든 컴포넌트에 영향

2. **드래그 중 부모 스크롤 방지**
   - `touchAction: 'none'` 스타일이 자동 적용됨

3. **Delete 키 충돌**
   - 선택된 컴포넌트가 있을 때 Delete 키를 누르면 삭제됨
   - 텍스트 입력 중에는 주의 필요

4. **리사이즈 핸들**
   - 현재 우하단 핸들만 구현됨
   - 필요 시 8방향 핸들 추가 가능

5. **성능 최적화**
   - 많은 컴포넌트(100개 이상) 사용 시 `React.memo` 적용 권장

---

## 🐛 디버깅

### 로깅 활성화

```tsx
useBoundaryConstraint('id', position, {
  enableLogging: true, // 콘솔에 로그 출력
});
```

### 콘솔 출력 예시

```
🔄 [EditorStore] 컴포넌트 위치 업데이트: {
  페이지번호: 1,
  컴포넌트ID: "ban-123",
  새위치: { x: 150, y: 200 },
  시간: "10:30:45"
}

⚠️ [Boundary] Component ban-123 constrained: {
  before: { x: 550, y: 200 },
  after: { x: 480, y: 200 },
  constrainedX: true,
  constrainedY: false
}
```

---

## ✅ 체크리스트

새로운 도구에 경계 제한 적용 시:

- [ ] `DraggableComponent` 래퍼 사용
- [ ] `pageNumber` prop 전달
- [ ] `onDelete` 핸들러 구현
- [ ] 필요 시 `resizable` 옵션 활성화
- [ ] 스토어 연동 (`addComponent`, `updateComponentPosition`)
- [ ] 경계 경고 표시 확인
- [ ] 드래그/리사이즈 테스트

---

**작성일:** 2025-10-01  
**버전:** 1.0.0  
**관련 문서:**

- [상태 저장 시스템 가이드](/docs/STATE_PERSIST_GUIDE.md)
- [에러 핸들링 시스템 가이드](/docs/ERROR_HANDLING_GUIDE.md)
