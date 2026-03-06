# PDF Formatter 상태 저장 시스템 - 필요 라이브러리

## 📦 필수 패키지

상태 저장 시스템을 위해 다음 패키지들이 필요합니다:

### 1. **Zustand** (상태 관리)

```bash
npm install zustand
# or
yarn add zustand
# or
pnpm add zustand
```

- **용량**: ~3KB (gzipped)
- **역할**: 가벼운 전역 상태 관리
- **공식 문서**: https://github.com/pmndrs/zustand

---

### 2. **idb-keyval** (IndexedDB 래퍼)

```bash
npm install idb-keyval
# or
yarn add idb-keyval
# or
pnpm add idb-keyval
```

- **용량**: ~500 bytes (gzipped)
- **역할**: IndexedDB를 간단하게 사용할 수 있는 유틸리티
- **제작자**: Jake Archibald (Google)
- **공식 문서**: https://github.com/jakearchibald/idb-keyval

---

## 🔧 설치 방법

### **한 번에 설치**

```bash
npm install zustand idb-keyval
```

---

## 📋 현재 사용 중인 패키지

프로젝트에서 이미 사용 중인 패키지들:

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.x",

    // 새로 추가된 패키지
    "zustand": "^4.x",
    "idb-keyval": "^6.x"
  }
}
```

---

## 🎯 패키지 선택 이유

### **Zustand를 선택한 이유**

- ✅ Redux보다 훨씬 가볍고 간단 (3KB vs 50KB+)
- ✅ Boilerplate 코드가 거의 없음
- ✅ TypeScript 완벽 지원
- ✅ React 19와 완벽 호환
- ✅ Middleware 지원 (persist 등)
- ✅ DevTools 사용 가능

### **idb-keyval을 선택한 이유**

- ✅ 매우 가벼움 (500 bytes)
- ✅ Promise 기반 간단한 API
- ✅ Google 엔지니어가 제작
- ✅ localStorage와 유사한 사용법
- ✅ IndexedDB의 모든 이점 제공

---

## 🔍 대안 패키지 비교

### **상태 관리 라이브러리**

| 라이브러리  | 크기  | 복잡도     | 추천도          |
| ----------- | ----- | ---------- | --------------- |
| Zustand     | 3KB   | ⭐         | ✅ **선택**     |
| Redux       | 50KB+ | ⭐⭐⭐⭐⭐ | ❌ 과도함       |
| Jotai       | 3KB   | ⭐⭐       | ✅ 대안         |
| Recoil      | 21KB  | ⭐⭐⭐     | ⚠️ 복잡함       |
| Context API | 0KB   | ⭐⭐       | ⚠️ persist 불가 |

### **IndexedDB 라이브러리**

| 라이브러리  | 크기  | 복잡도   | 추천도      |
| ----------- | ----- | -------- | ----------- |
| idb-keyval  | 500B  | ⭐       | ✅ **선택** |
| idb         | 1.5KB | ⭐⭐     | ✅ 대안     |
| Dexie.js    | 50KB  | ⭐⭐⭐⭐ | ❌ 과도함   |
| localForage | 12KB  | ⭐⭐     | ⚠️ 무거움   |

---

## 📝 Import 예시

### **stores/editorStore.ts**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
```

### **lib/storage.ts**

```typescript
import { get, set, del, clear } from 'idb-keyval';
```

### **pages/EditorPage.tsx**

```typescript
import { useEditorStore } from '../stores/editorStore';
```

---

## ⚠️ 주의사항

1. **Zustand 버전**: v4.x 이상 사용 권장
2. **idb-keyval 버전**: v6.x 이상 사용 권장
3. **React 버전**: React 18+ 필수 (현재 19.1.1 사용 중)
4. **TypeScript**: 타입 정의 자동 포함됨

---

## 🚀 향후 추가 가능 패키지

향후 기능 확장 시 고려할 패키지:

### **Undo/Redo 기능**

```bash
npm install immer use-immer
```

### **상태 디버깅**

```bash
npm install @redux-devtools/extension
```

### **폼 관리 (텍스트박스 등)**

```bash
npm install react-hook-form@7.55.0 zod
```

---

## 📚 참고 자료

- Zustand 공식 문서: https://docs.pmnd.rs/zustand
- idb-keyval GitHub: https://github.com/jakearchibald/idb-keyval
- IndexedDB MDN: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

**작성일**: 2025-10-01  
**버전**: 1.0.0
