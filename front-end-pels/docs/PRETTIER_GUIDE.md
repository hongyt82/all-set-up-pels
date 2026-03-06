# Prettier 설정 가이드

## 📋 개요

이 문서는 PDF Formatter 프로젝트에서 사용하는 Prettier 코드 포맷팅 설정에 대한 가이드입니다.

## ⚙️ 현재 설정

### 기본 설정 파일: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🔧 설정 옵션 상세 설명

### 1. **세미콜론 (semi)**
- **값**: `true`
- **설명**: 모든 문장 끝에 세미콜론을 추가
- **예시**:
  ```javascript
  // ✅ 적용됨
  const name = 'John';
  console.log(name);
  
  // ❌ 적용 안됨
  const name = 'John'
  console.log(name)
  ```

### 2. **후행 쉼표 (trailingComma)**
- **값**: `"es5"`
- **설명**: ES5에서 유효한 곳에만 후행 쉼표 추가 (객체, 배열)
- **예시**:
  ```javascript
  // ✅ 적용됨
  const obj = {
    name: 'John',
    age: 30, // ← 후행 쉼표
  };
  
  const arr = [
    'apple',
    'banana', // ← 후행 쉼표
  ];
  
  // ❌ 적용 안됨 (함수 매개변수)
  function greet(name, age,) { // ← ES5에서 유효하지 않음
    return `Hello ${name}`;
  }
  ```

### 3. **따옴표 (singleQuote)**
- **값**: `true`
- **설명**: 작은따옴표 사용 (큰따옴표 대신)
- **예시**:
  ```javascript
  // ✅ 적용됨
  const message = 'Hello World';
  const template = `Hello ${name}`;
  
  // ❌ 적용 안됨
  const message = "Hello World";
  ```

### 4. **줄 길이 (printWidth)**
- **값**: `80`
- **설명**: 한 줄의 최대 문자 수
- **예시**:
  ```javascript
  // ✅ 적용됨 (80자 이내)
  const shortFunction = (a, b) => a + b;
  
  // ✅ 적용됨 (80자 초과시 줄바꿈)
  const longFunction = (
    veryLongParameterName1,
    veryLongParameterName2,
    veryLongParameterName3
  ) => {
    return veryLongParameterName1 + veryLongParameterName2;
  };
  ```

### 5. **탭 너비 (tabWidth)**
- **값**: `2`
- **설명**: 들여쓰기 공백 수
- **예시**:
  ```javascript
  // ✅ 적용됨 (2칸 들여쓰기)
  function example() {
    if (true) {
      return 'indented';
    }
  }
  ```

### 6. **탭 사용 (useTabs)**
- **값**: `false`
- **설명**: 공백 사용 (탭 대신)
- **예시**:
  ```javascript
  // ✅ 적용됨 (공백 사용)
  function example() {
    return 'spaces';
  }
  
  // ❌ 적용 안됨 (탭 사용)
  function example() {
  	return 'tabs';
  }
  ```

### 7. **괄호 공백 (bracketSpacing)**
- **값**: `true`
- **설명**: 객체 리터럴의 괄호 안에 공백 추가
- **예시**:
  ```javascript
  // ✅ 적용됨
  const obj = { name: 'John', age: 30 };
  
  // ❌ 적용 안됨
  const obj = {name: 'John', age: 30};
  ```

### 8. **괄호 줄바꿈 (bracketSameLine)**
- **값**: `false`
- **설명**: JSX의 닫는 괄호를 같은 줄에 두지 않음
- **예시**:
  ```jsx
  // ✅ 적용됨
  <div
    className="example"
    onClick={handleClick}
  >
    Content
  </div>
  
  // ❌ 적용 안됨
  <div
    className="example"
    onClick={handleClick}>
    Content
  </div>
  ```

### 9. **화살표 함수 괄호 (arrowParens)**
- **값**: `"avoid"`
- **설명**: 화살표 함수에서 매개변수가 하나일 때 괄호 생략
- **예시**:
  ```javascript
  // ✅ 적용됨
  const single = x => x * 2;
  const multiple = (x, y) => x + y;
  
  // ❌ 적용 안됨
  const single = (x) => x * 2;
  ```

### 10. **줄 끝 문자 (endOfLine)**
- **값**: `"lf"`
- **설명**: Unix 스타일 줄 끝 문자 사용 (LF)
- **설명**: Windows(CRLF)나 Mac(CR) 대신 Unix(LF) 사용

## 📁 적용 대상 파일

### Prettier가 포맷팅하는 파일 확장자:
- **JavaScript**: `.js`, `.jsx`
- **TypeScript**: `.ts`, `.tsx`
- **JSON**: `.json`
- **CSS**: `.css`, `.scss`
- **Markdown**: `.md`
- **기타**: `package.json`

### 적용 경로:
```bash
# 소스 코드
src/**/*.{js,jsx,ts,tsx,json,css,scss,md}

# 루트 파일
package.json
```

## 🚀 사용 방법

### 1. **포맷팅 확인**
```bash
npm run prettier:check
```
- 파일들이 Prettier 규칙에 맞는지 확인
- 포맷팅이 필요한 파일 목록 출력

### 2. **자동 포맷팅**
```bash
npm run prettier:write
```
- 모든 파일을 Prettier 규칙에 맞게 자동 포맷팅
- 파일이 직접 수정됨

### 3. **ESLint와 통합**
```bash
npm run lint:fix
```
- ESLint와 Prettier가 함께 실행
- 코드 품질과 포맷팅을 동시에 적용

## 🔗 관련 설정

### ESLint 통합
- `eslint-plugin-prettier`: ESLint에서 Prettier 실행
- `eslint-config-prettier`: ESLint와 Prettier 규칙 충돌 방지

### VS Code 설정 권장사항
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📝 예시

### Before (포맷팅 전):
```javascript
const user={name:"John",age:30,hobbies:["reading","coding","gaming"]};
function greet(name,age){
return `Hello ${name}, you are ${age} years old`;
}
const result=greet(user.name,user.age);
console.log(result);
```

### After (포맷팅 후):
```javascript
const user = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'coding', 'gaming'],
};

function greet(name, age) {
  return `Hello ${name}, you are ${age} years old`;
}

const result = greet(user.name, user.age);
console.log(result);
```

## ⚠️ 주의사항

1. **팀 협업**: 모든 팀원이 동일한 Prettier 설정 사용 권장
2. **Git Hook**: 커밋 전 자동 포맷팅 설정 고려
3. **CI/CD**: 빌드 과정에서 포맷팅 검사 포함 권장
4. **설정 변경**: 기존 코드베이스에 설정 변경 시 전체 포맷팅 필요

## 🔄 설정 변경 방법

1. `.prettierrc` 파일 수정
2. `npm run prettier:write` 실행하여 전체 코드베이스 포맷팅
3. 변경사항 커밋 및 팀 공유

---

**마지막 업데이트**: 2025-01-27  
**버전**: 1.2.1
