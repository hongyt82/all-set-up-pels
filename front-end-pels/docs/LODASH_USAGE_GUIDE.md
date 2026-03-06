# Lodash 사용법 가이드

## 개요

이 문서는 PDF Formatter 프로젝트에서 사용하는 Lodash 라이브러리의 활용법을 정리한 가이드입니다. 실제 프로젝트에서 사용되는 함수들과 실용적인 예제를 중심으로 설명합니다.

## 목차

1. [설치 및 설정](#설치-및-설정)
2. [기본 사용법](#기본-사용법)
3. [문자열 처리](#문자열-처리)
4. [데이터 변환](#데이터-변환)
5. [유틸리티 함수](#유틸리티-함수)
6. [체이닝과 함수형 프로그래밍](#체이닝과-함수형-프로그래밍)
7. [실제 사용 사례](#실제-사용-사례)
8. [성능 최적화](#성능-최적화)
9. [문제 해결](#문제-해결)

## 설치 및 설정

### 의존성 설치

```json
{
  "dependencies": {
    "lodash": "^4.17.21",
    "@types/lodash": "^4.17.20"
  }
}
```

### TypeScript 설정

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler"
  }
}
```

### Import 방식

```typescript
// 권장: 전체 import (트리쉐이킹 자동 적용)
import _ from 'lodash';

// 개별 import (더 작은 번들)
import { camelCase, kebabCase, trim } from 'lodash';
```

## 기본 사용법

### 안전한 타입 체크

```typescript
// 안전한 문자열화
const safeStringify = (value: any) => {
  try {
    return _.isString(value) ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// 사용 예제
safeStringify('Hello');        // "Hello"
safeStringify(123);            // "123"
safeStringify({ test: 'value' }); // '{"test":"value"}'
safeStringify(null);           // "null"
safeStringify(undefined);      // "undefined"
```

### 기본 타입 체크 함수들

```typescript
_.isString(value)     // 문자열 체크
_.isNumber(value)     // 숫자 체크
_.isArray(value)      // 배열 체크
_.isObject(value)     // 객체 체크
_.isNull(value)       // null 체크
_.isUndefined(value)  // undefined 체크
_.isNaN(value)        // NaN 체크
_.isEqual(a, b)       // 깊은 비교
```

## 문자열 처리

### 1. 문자열 분해

```typescript
// 기본 분해
_.split('Hello World', ' ');           // ['Hello', 'World']
_.split('a,b,c', ',');                 // ['a', 'b', 'c']

// limit 옵션
_.split('a,b,c,d', ',', 2);            // ['a', 'b']

// 정규식 사용
_.split('Hello World', /\s+/);         // ['Hello', 'World']
```

### 2. 포함 여부 검사

```typescript
// 기본 포함 검사
_.includes('Hello World', 'World');    // true
_.includes([1, 2, 3], 2);              // true

// 대소문자 무시 검사
const includesIgnoreCase = (text: string, search: string) => {
  return _.includes(_.toLower(text), _.toLower(search));
};

includesIgnoreCase('Hello World', 'world'); // true
```

### 3. 문자열 치환

```typescript
// 단건 치환 (첫 매치만)
_.replace('Hello World', 'World', 'Lodash'); // "Hello Lodash"

// 전체 치환 (문자열 패턴)
const replaceAll = (text: string, search: string, replace: string, ignoreCase = false) => {
  const flags = ignoreCase ? 'gi' : 'g';
  const regex = new RegExp(_.escapeRegExp(search), flags);
  return _.replace(text, regex, replace);
};

replaceAll('Hello World', 'l', 'L', true); // "HeLLo WorLd"

// 정규식 패턴 치환
const replaceRegex = (text: string, pattern: string, replace: string) => {
  const regex = new RegExp(pattern, 'g');
  return _.replace(text, regex, replace);
};

replaceRegex('Hello   World', '\\s+', ' '); // "Hello World"
```

### 4. 문자열 삭제

```typescript
// 특정 문자열들 삭제
const removeStrings = (text: string, toRemove: string[]) => {
  return _.reduce(toRemove, (result, str) => {
    return _.replace(result, new RegExp(_.escapeRegExp(str), 'g'), '');
  }, text);
};

removeStrings('Hello World Test', ['World', 'Test']); // "Hello  "
```

### 5. 공백 정규화

```typescript
// 앞뒤 trim + 내부 다중 공백 1칸으로 정규화
const normalizeWhitespace = (text: string) => {
  return _.replace(_.trim(text), /\s+/g, ' ');
};

normalizeWhitespace('  Hello   World  '); // "Hello World"
```

## 데이터 변환

### 1. 케이스 변환

```typescript
const caseConversions = (text: string) => {
  return {
    camelCase: _.camelCase(text),      // "helloWorld"
    kebabCase: _.kebabCase(text),      // "hello-world"
    snakeCase: _.snakeCase(text),      // "hello_world"
    startCase: _.startCase(text),      // "Hello World"
    upperCase: _.upperCase(text),      // "HELLO WORLD"
    lowerCase: _.lowerCase(text),      // "hello world"
    capitalize: _.capitalize(text),    // "Hello world"
    upperFirst: _.upperFirst(text),    // "Hello world"
    lowerFirst: _.lowerFirst(text)     // "hello world"
  };
};

caseConversions('hello world'); 
// {
//   camelCase: 'helloWorld',
//   kebabCase: 'hello-world',
//   snakeCase: 'hello_world',
//   startCase: 'Hello World',
//   upperCase: 'HELLO WORLD',
//   lowerCase: 'hello world',
//   capitalize: 'Hello world',
//   upperFirst: 'Hello world',
//   lowerFirst: 'hello world'
// }
```

### 2. 악센트 제거

```typescript
// 라틴 문자 악센트 제거 (슬러그 생성 등에 유용)
_.deburr('café naïve résumé'); // "cafe naive resume"
```

### 3. HTML 이스케이프

```typescript
// HTML 엔티티 이스케이프
_.escape('<p>Hello & "World"</p>'); 
// "&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;"

// HTML 엔티티 역변환 (수동 구현)
const htmlUnescape = (text: string) => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};
```

### 4. 패딩과 트렁케이트

```typescript
const paddingAndTruncate = (text: string, length = 20) => {
  return {
    padStart: _.padStart(text, length, '0'),  // "0000000000Hello World"
    padEnd: _.padEnd(text, length, '-'),      // "Hello World---------"
    pad: _.pad(text, length),                 // "    Hello World    "
    truncate: _.truncate(text, { length, omission: '...' }) // "Hello World..."
  };
};
```

### 5. 단어 토큰화

```typescript
// 영문/숫자/한글 단어 추출
_.words('Hello World 123 안녕하세요', /[a-zA-Z0-9가-힣]+/g);
// ['Hello', 'World', '123', '안녕하세요']

// 기본 단어 분리
_.words('hello-world_test'); // ['hello', 'world', 'test']
```

## 유틸리티 함수

### 1. 금액/숫자 문자열 정제

```typescript
const cleanAmount = (text: string) => {
  const cleaned = _.replace(text, /[,\s원]/g, '');
  const number = _.toNumber(cleaned);
  return {
    original: text,
    cleaned: cleaned,
    number: number,
    formatted: _.isNaN(number) ? 'Invalid' : number.toLocaleString()
  };
};

cleanAmount('1,234,567원'); 
// {
//   original: '1,234,567원',
//   cleaned: '1234567',
//   number: 1234567,
//   formatted: '1,234,567'
// }
```

### 2. 개인정보 마스킹

```typescript
// 이메일 마스킹
const maskEmail = (email: string) => {
  const [local, domain] = _.split(email, '@');
  if (local.length <= 2) return email;
  return _.padEnd(local.substring(0, 2), local.length, '*') + '@' + domain;
};

maskEmail('test@example.com'); // "te**@example.com"

// 휴대폰 마스킹
const maskPhone = (phone: string) => {
  const cleaned = _.replace(phone, /[^\d]/g, '');
  if (cleaned.length !== 11) return phone;
  return cleaned.substring(0, 3) + '-****-' + cleaned.substring(7);
};

maskPhone('010-1234-5678'); // "010-****-5678"
```

### 3. 안전한 비교

```typescript
// 공백/대소문자 무시 비교
const safeCompare = (text1: string, text2: string) => {
  const normalize = (str: string) => _.toLower(_.trim(str));
  return _.isEqual(normalize(text1), normalize(text2));
};

safeCompare('Hello World', '  hello world  '); // true
```

### 4. 검색 하이라이트

```typescript
const highlightSearch = (text: string, search: string) => {
  if (!search) return text;
  const regex = new RegExp(`(${_.escapeRegExp(search)})`, 'gi');
  return _.replace(text, regex, '<mark>$1</mark>');
};

highlightSearch('Hello World', 'world'); 
// "Hello <mark>World</mark>"
```

## 체이닝과 함수형 프로그래밍

### Lodash 체이닝

```typescript
// 체이닝을 통한 복합 변환
const createSearchKey = (text: string) => {
  return _.chain(text)
    .trim()                    // 앞뒤 공백 제거
    .toLower()                 // 소문자 변환
    .deburr()                  // 악센트 제거
    .replace(/\s+/g, '-')      // 공백을 하이픈으로
    .replace(/[^\w-]/g, '')    // 특수문자 제거
    .value();                  // 체이닝 종료
};

createSearchKey('  Café Naïve Résumé  '); // "cafe-naive-resume"
```

### 함수형 프로그래밍 패턴

```typescript
// reduce를 활용한 데이터 변환
const processData = (items: any[]) => {
  return _.reduce(items, (result, item) => {
    if (_.isString(item) && !_.isEmpty(item)) {
      result.push(_.trim(item));
    }
    return result;
  }, []);
};

// filter와 map 조합
const getValidEmails = (emails: string[]) => {
  return _.chain(emails)
    .filter(email => _.includes(email, '@'))
    .map(email => _.toLower(_.trim(email)))
    .uniq()
    .value();
};
```

## 실제 사용 사례

### 1. 폼 데이터 정제

```typescript
const sanitizeFormData = (data: Record<string, any>) => {
  return _.mapValues(data, (value) => {
    if (_.isString(value)) {
      return normalizeWhitespace(value);
    }
    return value;
  });
};
```

### 2. URL 슬러그 생성

```typescript
const createSlug = (title: string) => {
  return _.chain(title)
    .toLower()
    .deburr()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim('-')
    .value();
};

createSlug('Hello World! @#$%'); // "hello-world"
```

### 3. 데이터 검증

```typescript
const validateUserInput = (input: any) => {
  const errors: string[] = [];
  
  if (!_.isString(input.name) || _.isEmpty(_.trim(input.name))) {
    errors.push('이름은 필수입니다.');
  }
  
  if (input.email && !_.includes(input.email, '@')) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }
  
  return {
    isValid: _.isEmpty(errors),
    errors
  };
};
```

### 4. 배열/객체 조작

```typescript
// 중복 제거 및 정렬
const uniqueSorted = (arr: any[]) => {
  return _.chain(arr)
    .uniq()
    .sort()
    .value();
};

// 객체 깊은 병합
const mergeConfigs = (defaultConfig: any, userConfig: any) => {
  return _.merge({}, defaultConfig, userConfig);
};

// 그룹화
const groupByCategory = (items: any[]) => {
  return _.groupBy(items, 'category');
};
```

## 성능 최적화

### 1. 트리쉐이킹 활용

```typescript
// 전체 import (권장 - Vite가 자동으로 트리쉐이킹)
import _ from 'lodash';

// 개별 import (더 작은 번들)
import { camelCase, kebabCase, trim } from 'lodash';
```

### 2. 메모이제이션

```typescript
// 무거운 계산 결과 캐싱
const expensiveCalculation = _.memoize((input: string) => {
  // 복잡한 계산 로직
  return _.chain(input)
    .toLower()
    .deburr()
    .replace(/\s+/g, '-')
    .value();
});
```

### 3. 지연 평가

```typescript
// 체이닝에서 지연 평가 활용
const processLargeDataset = (data: any[]) => {
  return _.chain(data)
    .filter(item => item.active)      // 먼저 필터링
    .map(item => transformItem(item))  // 필요한 것만 변환
    .take(100)                        // 처음 100개만
    .value();
};
```

## 문제 해결

### 1. TypeScript 타입 오류

```typescript
// Object.entries 결과 타입 처리
const processEntries = (obj: Record<string, any>) => {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: safeStringify(value) // 안전한 문자열화
  }));
};
```

### 2. 빈 값 처리

```typescript
// 안전한 값 접근
const safeGet = (obj: any, path: string, defaultValue: any = '') => {
  const value = _.get(obj, path);
  return _.isNil(value) ? defaultValue : value;
};
```

### 3. 정규식 이스케이프

```typescript
// 사용자 입력을 정규식으로 사용할 때
const searchInText = (text: string, searchTerm: string) => {
  const escaped = _.escapeRegExp(searchTerm);
  const regex = new RegExp(escaped, 'gi');
  return _.replace(text, regex, '<mark>$&</mark>');
};
```

## 모범 사례

### 1. 일관된 네이밍

```typescript
// 함수명에 용도 명시
const normalizeString = (str: string) => _.trim(_.toLower(str));
const sanitizeInput = (input: string) => _.escape(input);
const formatDisplay = (value: any) => safeStringify(value);
```

### 2. 에러 처리

```typescript
const safeLodashOperation = (operation: () => any, fallback: any = '') => {
  try {
    return operation();
  } catch (error) {
    console.warn('Lodash operation failed:', error);
    return fallback;
  }
};
```

### 3. 성능 모니터링

```typescript
const measurePerformance = (fn: Function, ...args: any[]) => {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  console.log(`Operation took ${end - start} milliseconds`);
  return result;
};
```

## 참고 자료

- [Lodash 공식 문서](https://lodash.com/docs)
- [Lodash TypeScript 타입 정의](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash)
- [Vite 번들링 최적화](https://vitejs.dev/guide/build.html#chunking-strategy)

---

이 가이드는 PDF Formatter 프로젝트의 실제 사용 사례를 바탕으로 작성되었습니다. 추가적인 함수나 사용법이 필요하시면 프로젝트의 `LodashTestPage.tsx`를 참고하시기 바랍니다.
