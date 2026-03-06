# Lodash API 데이터 처리 함수 가이드

## 📋 개요

이 문서는 `src/utils/lodashUtils.ts`에 추가된 API 데이터 처리 함수들의 사용법과 용도를 정리한 가이드입니다. 이 함수들은 API 요청/응답 데이터를 효율적으로 처리하고 변환하는 데 사용됩니다.

**문서 생성일**: 2025-10-22  
**프로젝트 버전**: 2.0.0  
**관련 파일**: `src/utils/lodashUtils.ts`, `src/pages/ApiDataTestPage.tsx`

## 🎯 주요 기능 카테고리

### 1. 데이터 변환 (Data Transformation)
- Object ↔ Array 변환
- 필드 추출 및 변환
- 데이터 깊은 복사

### 2. 데이터 집계 및 분석 (Data Aggregation & Analysis)
- 그룹핑 및 집계
- 중복 제거
- 정렬 및 필터링

### 3. API 요청/응답 처리 (API Request/Response Processing)
- API 요청 바디 생성
- 통계 생성
- 데이터 검색 및 카운트

### 4. 데이터 관리 (Data Management)
- 데이터 병합
- 페이지네이션
- 조건부 데이터 가공

## 📚 함수별 상세 가이드

### 🔄 데이터 변환 함수들

#### `objectToArray<T>(obj: Record<string, T>): T[]`
**용도**: Object를 Array로 변환  
**사용 예시**:
```typescript
const products = { '1': { name: 'Laptop', price: 1000 }, '2': { name: 'Mouse', price: 20 } };
const productArray = objectToArray(products);
// 결과: [{ name: 'Laptop', price: 1000 }, { name: 'Mouse', price: 20 }]
```

#### `arrayToObject<T>(arr: T[], keyField: keyof T): Record<string, T>`
**용도**: Array를 Object로 변환 (지정된 키 기준)  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
const userObject = arrayToObject(users, 'id');
// 결과: { '1': { id: 1, name: 'John' }, '2': { id: 2, name: 'Jane' } }
```

#### `extractFields<T>(data: T[], fields: (keyof T)[]): Partial<T>[]`
**용도**: 객체 배열에서 특정 필드만 추출  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John', email: 'john@example.com', age: 30 }];
const userFields = extractFields(users, ['id', 'name', 'email']);
// 결과: [{ id: 1, name: 'John', email: 'john@example.com' }]
```

#### `extractAndTransform<T>(data: T[], transformFn: (item: T) => any): any[]`
**용도**: 필드 추출 및 사용자 정의 변환  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John', department: 'IT' }];
const transformed = extractAndTransform(users, user => ({
  id: user.id,
  fullName: `${user.name} (${user.department})`,
  isSenior: user.age >= 30
}));
```

#### `deepClone<T>(data: T): T`
**용도**: 데이터 깊은 복사 (원본 데이터 보호)  
**사용 예시**:
```typescript
const originalData = { users: [{ id: 1, name: 'John' }] };
const clonedData = deepClone(originalData);
// 원본과 완전히 독립적인 복사본 생성
```

### 📊 데이터 집계 및 분석 함수들

#### `groupAndAggregate<T>(data: T[], groupField: keyof T, aggregateFn?: (group: T[]) => any)`
**용도**: 데이터 그룹핑 및 집계  
**사용 예시**:
```typescript
const users = [
  { id: 1, name: 'John', department: 'IT', age: 30 },
  { id: 2, name: 'Jane', department: 'IT', age: 25 },
  { id: 3, name: 'Bob', department: 'HR', age: 35 }
];

// 단순 그룹핑
const grouped = groupAndAggregate(users, 'department');

// 집계 함수와 함께
const departmentStats = groupAndAggregate(users, 'department', (group) => ({
  count: group.length,
  averageAge: Math.round(group.reduce((sum, user) => sum + user.age, 0) / group.length)
}));
```

#### `removeDuplicates<T>(data: T[], keyField: keyof T): T[]`
**용도**: 중복 제거 (지정된 필드 기준)  
**사용 예시**:
```typescript
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 1, name: 'John' } // 중복
];
const uniqueUsers = removeDuplicates(users, 'id');
// 결과: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
```

#### `sortData<T>(data: T[], sortField: keyof T, order: 'asc' | 'desc' = 'asc'): T[]`
**용도**: 단일 필드 기준 정렬  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Alice' }];
const sortedByName = sortData(users, 'name', 'asc');
const sortedById = sortData(users, 'id', 'desc');
```

#### `sortDataMultiple<T>(data: T[], sortFields: (keyof T)[], orders: ('asc' | 'desc')[] = ['asc']): T[]`
**용도**: 복수 필드 기준 정렬  
**사용 예시**:
```typescript
const users = [
  { department: 'IT', age: 30, name: 'John' },
  { department: 'IT', age: 25, name: 'Jane' },
  { department: 'HR', age: 35, name: 'Bob' }
];
const multiSorted = sortDataMultiple(users, ['department', 'age'], ['asc', 'desc']);
```

#### `filterData<T>(data: T[], predicate: (item: T) => boolean): T[]`
**용도**: 조건부 데이터 필터링  
**사용 예시**:
```typescript
const users = [{ id: 1, age: 30 }, { id: 2, age: 25 }];
const seniorUsers = filterData(users, user => user.age >= 30);
```

### 🔧 API 요청/응답 처리 함수들

#### `createApiRequestBody<T>(data: T[], fields?: (keyof T)[], metadata?: Record<string, any>)`
**용도**: API 요청 바디 생성  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John', email: 'john@example.com' }];
const apiRequest = createApiRequestBody(users, ['id', 'name'], {
  requestType: 'userList',
  source: 'testPage'
});
// 결과: {
//   data: [{ id: 1, name: 'John' }],
//   metadata: { totalCount: 1, timestamp: '2025-01-14T...', requestType: 'userList', source: 'testPage' }
// }
```

#### `generateStatistics<T>(data: T[], numericFields: (keyof T)[])`
**용도**: 데이터 통계 생성  
**사용 예시**:
```typescript
const users = [{ age: 30 }, { age: 25 }, { age: 35 }];
const stats = generateStatistics(users, ['age']);
// 결과: {
//   totalCount: 3,
//   fieldStats: {
//     age: { min: 25, max: 35, average: 30, sum: 90 }
//   }
// }
```

#### `findData<T>(data: T[], searchCriteria: Partial<T>): T | undefined`
**용도**: 데이터 검색 및 찾기  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
const foundUser = findData(users, { id: 1 });
const foundByEmail = findData(users, { email: 'john@example.com' });
```

#### `hasData<T>(data: T[], searchCriteria: Partial<T>): boolean`
**용도**: 데이터 존재 여부 확인  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John' }];
const hasUser1 = hasData(users, { id: 1 }); // true
const hasUser99 = hasData(users, { id: 99 }); // false
```

#### `countData<T>(data: T[], searchCriteria?: Partial<T>): number`
**용도**: 데이터 카운트  
**사용 예시**:
```typescript
const users = [{ id: 1, department: 'IT' }, { id: 2, department: 'IT' }, { id: 3, department: 'HR' }];
const totalUsers = countData(users); // 3
const itUserCount = countData(users, { department: 'IT' }); // 2
```

### 🔗 데이터 관리 함수들

#### `mergeData<T>(baseData: T[], mergeData: T[], keyField: keyof T): T[]`
**용도**: 데이터 병합 (객체 배열)  
**사용 예시**:
```typescript
const baseUsers = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
const additionalUsers = [{ id: 3, name: 'Bob' }, { id: 1, name: 'John Updated' }];
const mergedUsers = mergeData(baseUsers, additionalUsers, 'id');
// 결과: [{ id: 1, name: 'John Updated' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Bob' }]
```

#### `paginateData<T>(data: T[], page: number = 1, pageSize: number = 10)`
**용도**: 데이터 분할 (페이지네이션)  
**사용 예시**:
```typescript
const users = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
const page1 = paginateData(users, 1, 3);
// 결과: {
//   data: [{ id: 1 }, { id: 2 }, { id: 3 }],
//   pagination: { currentPage: 1, pageSize: 3, totalItems: 5, totalPages: 2, hasNextPage: true, hasPrevPage: false }
// }
```

#### `processData<T>(data: T[], processFn: (item: T) => T): T[]`
**용도**: 조건부 데이터 가공  
**사용 예시**:
```typescript
const users = [{ id: 1, name: 'John', age: 30 }];
const processedUsers = processData(users, user => ({
  ...user,
  salary: user.age * 1000,
  grade: user.age >= 30 ? 'Senior' : 'Junior'
}));
```

## 🎯 실제 사용 시나리오

### 1. API 응답 데이터 처리
```typescript
// API에서 받은 데이터를 UI에 맞게 변환
const apiResponse = await fetch('/api/users');
const rawUsers = await apiResponse.json();

// 필요한 필드만 추출하여 UI에 표시
const displayUsers = extractFields(rawUsers, ['id', 'name', 'email']);

// 부서별로 그룹핑하여 통계 표시
const departmentStats = groupAndAggregate(rawUsers, 'department', (group) => ({
  count: group.length,
  averageAge: Math.round(group.reduce((sum, user) => sum + user.age, 0) / group.length)
}));
```

### 2. 폼 데이터를 API 요청으로 변환
```typescript
// 폼에서 수집한 데이터
const formData = [
  { id: 1, name: 'John', email: 'john@example.com', age: 30 },
  { id: 2, name: 'Jane', email: 'jane@example.com', age: 25 }
];

// API 요청 바디 생성
const requestBody = createApiRequestBody(formData, ['id', 'name', 'email'], {
  action: 'updateUsers',
  timestamp: new Date().toISOString()
});
```

### 3. 데이터 검색 및 필터링
```typescript
// 사용자 검색 기능
const searchUsers = (query: string, users: User[]) => {
  const filtered = filterData(users, user => 
    user.name.toLowerCase().includes(query.toLowerCase())
  );
  
  // 검색 결과를 이름순으로 정렬
  return sortData(filtered, 'name', 'asc');
};
```

## ⚠️ 주의사항

1. **타입 안전성**: 모든 함수는 TypeScript 제네릭을 사용하여 타입 안전성을 보장합니다.
2. **성능**: 대용량 데이터 처리 시 `paginateData`를 사용하여 메모리 사용량을 제어하세요.
3. **원본 데이터 보호**: 데이터 수정이 필요한 경우 `deepClone`을 사용하여 원본을 보호하세요.
4. **에러 처리**: API 요청 시 적절한 에러 처리를 구현하세요.

## 🔗 관련 파일

- **구현 파일**: `src/utils/lodashUtils.ts`
- **테스트 페이지**: `src/pages/ApiDataTestPage.tsx`
- **통합 내보내기**: `src/utils/index.ts`

## 📝 업데이트 이력

- **2025-01-14**: 초기 문서 생성
- **버전 1.2.1**: 18개 API 데이터 처리 함수 추가

---

이 가이드를 통해 API 데이터 처리 함수들을 효과적으로 활용하여 더 나은 데이터 관리와 사용자 경험을 제공할 수 있습니다.
