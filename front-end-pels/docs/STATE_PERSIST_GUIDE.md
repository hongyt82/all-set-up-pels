# PDF Formatter 상태 저장 시스템 가이드

## 📋 개요

PDF Formatter 편집기에 **Zustand + IndexedDB Persist** 기반의 완전한 상태 복원 시스템이 적용되었습니다.

리로드하더라도 페이지를 떠나지 않는 한 모든 작업 상태가 자동으로 저장되고 복원됩니다.

---

## 🎯 주요 기능

### 1. **자동 상태 저장**

- 모든 사용자 작업이 IndexedDB에 실시간 자동 저장
- 브라우저를 닫아도 데이터 유지 (localStorage보다 강력)
- 대용량 데이터 저장 가능 (수백 MB~GB)

### 2. **완전한 상태 복원**

리로드 시 다음 상태들이 모두 복원됩니다:

#### **기본 UI 상태**

- ✅ 선택된 카테고리 (`selectedCategory`)
- ✅ 선택된 도구 (`selectedTool`)
- ✅ 오버레이 표시 여부 (`isOverlayVisible`)

#### **페이지 네비게이션**

- ✅ 현재 페이지 번호 (`currentPage`)
- ✅ 총 페이지 수 (`totalPages`)

#### **파일 정보**

- ✅ 현재 파일명 (`currentFile`)
- ✅ 수정 여부 (`isModified`)
- ✅ 단어 수 (`wordCount`)
- ✅ 페이지 수 (`pageCount`)

#### **페이지별 컴포넌트 데이터 (더미)**

- ✅ 전체 37페이지의 컴포넌트 정보
- ✅ 각 페이지별 메타데이터
- ✅ 컴포넌트 추가/삭제 히스토리

#### **메타데이터**

- ✅ 마지막 자동 저장 시간
- ✅ 버전 정보
- ✅ 세션 ID

### 3. **상태 저장 ON/OFF 토글**

- 헤더 우측에 상태 저장 토글 버튼 추가
- 🔵 파란색 (DatabaseZap 아이콘): 상태 저장 **활성화**
- ⚪ 회색 (Database 아이콘): 상태 저장 **비활성화**
- 버튼 위에 마우스를 올리면 현재 상태 확인 가능

---

## 🔧 사용 방법

### **1. 상태 저장 활성화 (기본값)**

상태 저장이 활성화된 경우:

1. 모든 작업이 자동으로 IndexedDB에 저장됨
2. 페이지를 리로드해도 상태 복원됨
3. 브라우저를 닫고 다시 열어도 상태 유지됨

```
예시:
1. 카테고리 "금지" 선택
2. 현재 페이지 5로 이동
3. 오버레이 활성화
4. 브라우저 F5 새로고침 → 모든 상태 복원! ✅
```

### **2. 상태 저장 비활성화**

상태 저장 토글 버튼(회색 아이콘)을 클릭하면:

1. IndexedDB에 저장된 기존 데이터 삭제
2. 이후 작업은 메모리에만 저장 (IndexedDB 저장 안 됨)
3. 리로드하면 초기 상태로 돌아감

```
예시:
1. 상태 저장 토글 OFF
2. 카테고리 "텍스트박스" 선택
3. 브라우저 F5 새로고침 → 초기 상태로 복원됨 ⚠️
```

### **3. 적용 전/후 비교 테스트**

#### **테스트 시나리오 A: 상태 저장 활성화**

```
1. 헤더 우측 상태 저장 버튼이 파란색(🔵)인지 확인
2. 카테고리 "금지" 선택
3. 현재 페이지를 5로 변경
4. 오버레이 활성화
5. F5 새로고침 → 모든 상태 유지됨! ✅
```

#### **테스트 시나리오 B: 상태 저장 비활성화**

```
1. 헤더 우측 상태 저장 버튼 클릭 (회색⚪으로 변경)
2. 카테고리 "텍스트박스" 선택
3. 현재 페이지를 10으로 변경
4. F5 새로고침 → 초기 상태로 돌아감 ⚠️
```

---

## 📂 파일 구조

```
/lib/storage.ts                    # IndexedDB 유틸리티
/stores/editorStore.ts             # Zustand Store (상태 관리)
/pages/EditorPage.tsx              # EditorPage (Store 통합)
/components/editor/EditorHeader.tsx # 상태 저장 토글 버튼 추가
/constants/dialogMessages.ts       # 상태 저장 관련 메시지
/constants/mainmenu.ts             # 상태 저장 버튼 라벨
/docs/STATE_PERSIST_GUIDE.md       # 이 문서
```

---

## 🎨 UI 변경사항

### **헤더 전체 레이아웃**

```
[☰] [🚫] [T] [☑] [📅] [✍] [⭕]     주기-3592     [💾] [</>] [37P] [👁]
 메뉴  ← 카테고리 버튼들 →                    상태  개발  페이지 오버레이
                                             저장  용    모드
```

- **상태 저장 토글 버튼** 위치: 헤더 **우측**, 개발용 메뉴 **바로 좌측**
- 파란색(🔵): 활성화됨
- 회색(⚪): 비활성화됨

---

## 🧪 더미 데이터 구조

### **PageData 인터페이스**

```typescript
interface PageData {
  pageNumber: number; // 페이지 번호 (1-37)
  components: PageComponent[]; // 페이지 내 컴포넌트 배열
  metadata: {
    lastModified: string; // 마지막 수정 시간
    componentCount: number; // 컴포넌트 개수
  };
}
```

### **PageComponent 인터페이스**

```typescript
interface PageComponent {
  id: string; // 컴포넌트 고유 ID
  type: string; // 컴포넌트 타입 (ban-circle, textbox 등)
  x: number; // X 좌표
  y: number; // Y 좌표
  width: number; // 너비
  height: number; // 높이
  content?: string; // 텍스트 내용 (선택)
  style?: Record<string, any>; // 스타일 (선택)
}
```

---

## 📊 콘솔 로그

모든 상태 변경과 저장/복원 작업은 콘솔에 상세 로그가 출력됩니다:

```
🚀 [EditorPage] 컴포넌트 마운트
📖 [EditorStore] 상태 복원
💾 [EditorStore] 상태 저장
📝 [EditorStore] 카테고리 변경
🔧 [EditorStore] 도구 변경
👁️ [EditorStore] 오버레이 표시 변경
📄 [EditorStore] 현재 페이지 변경
🔀 [EditorStore] 상태 저장 토글
🔄 [EditorStore] 전체 상태 초기화
```

---

## ⚙️ Store 액션 목록

### **기본 상태 액션**

- `setSelectedCategory(category)` - 카테고리 선택
- `setSelectedTool(tool)` - 도구 선택
- `setIsOverlayVisible(visible)` - 오버레이 표시 토글
- `setCurrentPage(page)` - 현재 페이지 변경
- `setTotalPages(total)` - 총 페이지 수 변경
- `setCurrentFile(file)` - 현재 파일명 설정
- `setIsModified(modified)` - 수정 여부 설정
- `setWordCount(count)` - 단어 수 설정
- `setPageCount(count)` - 페이지 수 설정

### **페이지 데이터 액션**

- `updatePageData(pageNumber, components)` - 페이지 데이터 업데이트
- `addComponent(pageNumber, component)` - 컴포넌트 추가
- `removeComponent(pageNumber, componentId)` - 컴포넌트 삭제

### **시스템 액션**

- `resetAllState()` - 전체 상태 초기화
- `togglePersist()` - 상태 저장 ON/OFF
- `updateMetadata()` - 메타데이터 업데이트 (자동 호출)

---

## 🔍 디버깅

### **IndexedDB 확인 방법**

1. 브라우저 개발자 도구 열기 (F12)
2. Application 탭 > IndexedDB 선택
3. `keyval-store` > `keyval` 확인
4. `editor-storage` 항목에서 저장된 상태 확인

### **상태 저장 확인**

```javascript
// 브라우저 콘솔에서 실행
import { useEditorStore } from './stores/editorStore';
const state = useEditorStore.getState();
console.log(state);
```

---

## ⚠️ 주의사항

1. **프라이빗 브라우징 모드**: IndexedDB 사용 불가능할 수 있음
2. **저장 용량**: 브라우저마다 IndexedDB 용량 제한 있음 (보통 수백 MB)
3. **크로스 도메인**: 다른 도메인에서는 저장된 데이터 접근 불가
4. **상태 저장 비활성화**: 기존 저장된 데이터도 함께 삭제됨

---

## 🚀 향후 확장 가능 기능

- ✅ Undo/Redo 히스토리 저장
- ✅ PDF 파일 원본 저장 (Blob)
- ✅ 자동 저장 타이밍 설정
- ✅ 클라우드 동기화 (Supabase 연동)
- ✅ 여러 탭 간 상태 동기화
- ✅ 버전 관리 및 마이그레이션

---

## 📝 문의

상태 저장 시스템 관련 문의사항은 개발팀에 문의하세요.

**버전**: 1.0.0  
**작성일**: 2025-10-01  
**업데이트**: 2025-10-01
