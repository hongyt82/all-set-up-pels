# Lodash 유틸리티 함수 사용 가이드

## 개요

`lodashUtils.ts`는 LodashTestPage.tsx의 모든 기능을 재사용 가능한 유틸리티 함수로 분리한 모듈입니다. 어디서든 쉽게 문자열 처리를 할 수 있습니다.

## 설치 및 Import

```typescript
// 개별 함수 import
import { safeStringify, caseConversions, cleanAmount } from '../utils/lodashUtils';

// 또는 통합 import
import { safeStringify, caseConversions, cleanAmount } from '../utils';
```

## 사용 예제

### 1. 안전한 문자열화

```typescript
import { safeStringify } from '../utils/lodashUtils';

console.log(safeStringify('Hello'));        // "Hello"
console.log(safeStringify(123));            // "123"
console.log(safeStringify({ test: 'value' })); // '{"test":"value"}'
console.log(safeStringify(null));           // "null"
console.log(safeStringify(undefined));      // "undefined"
```

### 2. 문자열 분해

```typescript
import { splitString } from '../utils/lodashUtils';

console.log(splitString('Hello World'));           // ['Hello', 'World']
console.log(splitString('a,b,c', ','));            // ['a', 'b', 'c']
console.log(splitString('a,b,c,d', ',', 2));       // ['a', 'b']
```

### 3. 포함 여부 검사

```typescript
import { includesIgnoreCase } from '../utils/lodashUtils';

console.log(includesIgnoreCase('Hello World', 'world')); // true
console.log(includesIgnoreCase('Hello World', 'WORLD')); // true
```

### 4. 문자열 치환

```typescript
import { replaceFirst, replaceAll, replaceRegex } from '../utils/lodashUtils';

console.log(replaceFirst('Hello World', 'World', 'Lodash')); // "Hello Lodash"
console.log(replaceAll('Hello World', 'l', 'L', true));      // "HeLLo WorLd"
console.log(replaceRegex('Hello   World', '\\s+', ' '));     // "Hello World"
```

### 5. 문자열 삭제

```typescript
import { removeStrings } from '../utils/lodashUtils';

console.log(removeStrings('Hello World Test', ['World', 'Test'])); // "Hello  "
```

### 6. 공백 정규화

```typescript
import { normalizeWhitespace } from '../utils/lodashUtils';

console.log(normalizeWhitespace('  Hello   World  ')); // "Hello World"
```

### 7. 케이스 변환

```typescript
import { caseConversions } from '../utils/lodashUtils';

const conversions = caseConversions('hello world');
console.log(conversions.camelCase);    // "helloWorld"
console.log(conversions.kebabCase);    // "hello-world"
console.log(conversions.snakeCase);    // "hello_world"
console.log(conversions.startCase);    // "Hello World"
```

### 8. 악센트 제거

```typescript
import { removeAccents } from '../utils/lodashUtils';

console.log(removeAccents('café naïve résumé')); // "cafe naive resume"
```

### 9. HTML 이스케이프

```typescript
import { htmlEscape, htmlUnescape } from '../utils/lodashUtils';

const escaped = htmlEscape('<p>Hello & "World"</p>');
console.log(escaped); // "&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;"

const unescaped = htmlUnescape(escaped);
console.log(unescaped); // "<p>Hello & "World"</p>"
```

### 10. 패딩과 트렁케이트

```typescript
import { paddingAndTruncate } from '../utils/lodashUtils';

const result = paddingAndTruncate('Hello', 10);
console.log(result.padStart);  // "00000Hello"
console.log(result.padEnd);    // "Hello-----"
console.log(result.truncate);  // "Hello..."
```

### 11. 단어 토큰화

```typescript
import { wordTokens } from '../utils/lodashUtils';

console.log(wordTokens('Hello World 123 안녕하세요')); // ['Hello', 'World', '123', '안녕하세요']
```

### 12. 금액 정제

```typescript
import { cleanAmount } from '../utils/lodashUtils';

const result = cleanAmount('1,234,567원');
console.log(result.original);  // "1,234,567원"
console.log(result.cleaned);   // "1234567"
console.log(result.number);    // 1234567
console.log(result.formatted); // "1,234,567"
```

### 13. 개인정보 마스킹

```typescript
import { maskEmail, maskPhone } from '../utils/lodashUtils';

console.log(maskEmail('test@example.com'));    // "te**@example.com"
console.log(maskPhone('010-1234-5678'));       // "010-****-5678"
```

### 14. 안전한 비교

```typescript
import { safeCompare } from '../utils/lodashUtils';

console.log(safeCompare('Hello World', '  hello world  ')); // true
```

### 15. 검색 하이라이트

```typescript
import { highlightSearch } from '../utils/lodashUtils';

console.log(highlightSearch('Hello World', 'world')); 
// "Hello <mark>World</mark>"
```

### 16. 검색키 생성

```typescript
import { createSearchKey } from '../utils/lodashUtils';

console.log(createSearchKey('  Café Naïve Résumé  ')); // "cafe-naive-resume"
```

## 추가 유틸리티 함수들

### 문자열 유효성 검사

```typescript
import { isValidString, safeGetString } from '../utils/lodashUtils';

console.log(isValidString('hello'));     // true
console.log(isValidString(''));          // false
console.log(safeGetString(null, 'default')); // "default"
```

### 문자열 길이 제한

```typescript
import { limitString } from '../utils/lodashUtils';

console.log(limitString('Hello World', 5)); // "He..."
```

### 문자열 배열 정리

```typescript
import { cleanStringArray } from '../utils/lodashUtils';

const arr = ['hello', '', 'world', 'hello', 'test'];
console.log(cleanStringArray(arr)); // ['hello', 'world', 'test']
```

### 문자열 검색

```typescript
import { searchInStrings } from '../utils/lodashUtils';

const items = ['Hello World', 'Hello Test', 'Goodbye World'];
console.log(searchInStrings(items, 'hello')); // ['Hello World', 'Hello Test']
```

### 문자열 그룹화

```typescript
import { groupByFirstLetter } from '../utils/lodashUtils';

const words = ['Apple', 'Banana', 'Cherry', 'Date'];
console.log(groupByFirstLetter(words));
// { A: ['Apple'], B: ['Banana'], C: ['Cherry'], D: ['Date'] }
```

### 문자열 통계

```typescript
import { getStringStats } from '../utils/lodashUtils';

const stats = getStringStats('Hello World\nThis is a test');
console.log(stats.words);              // 5
console.log(stats.characters);         // 25
console.log(stats.charactersNoSpaces); // 20
console.log(stats.lines);              // 2
```

### 문자열 변환 체이닝

```typescript
import { transformString } from '../utils/lodashUtils';

const result = transformString('  Hello World  ', [
  str => str.trim(),
  str => str.toUpperCase(),
  str => str.replace(' ', '-')
]);
console.log(result); // "HELLO-WORLD"
```

### 문자열 비교

```typescript
import { compareStrings } from '../utils/lodashUtils';

console.log(compareStrings('Hello', 'hello', { caseSensitive: false })); // true
console.log(compareStrings('  Hello  ', 'Hello', { trim: true }));       // true
console.log(compareStrings('café', 'cafe', { normalize: true }));        // true
```

## React 컴포넌트에서 사용 예제

```typescript
import React, { useState } from 'react';
import { safeStringify, caseConversions, cleanAmount } from '../utils/lodashUtils';

const StringProcessor = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const processString = () => {
    const conversions = caseConversions(input);
    const processed = safeStringify(conversions);
    setResult(processed);
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="문자열을 입력하세요"
      />
      <button onClick={processString}>처리</button>
      <pre>{result}</pre>
    </div>
  );
};
```

## 폼 검증에서 사용 예제

```typescript
import { safeStringify, normalizeWhitespace, isValidString } from '../utils/lodashUtils';

const validateForm = (formData: any) => {
  const errors: string[] = [];
  
  // 이름 검증
  if (!isValidString(formData.name)) {
    errors.push('이름은 필수입니다.');
  } else {
    formData.name = normalizeWhitespace(formData.name);
  }
  
  // 이메일 검증
  if (!isValidString(formData.email)) {
    errors.push('이메일은 필수입니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: formData
  };
};
```

## 타입 정의

모든 함수는 TypeScript 타입이 정의되어 있어 타입 안전성을 보장합니다:

```typescript
import type { 
  CaseConversions, 
  CleanAmount, 
  StringStats,
  CompareOptions 
} from '../utils/lodashUtils';
```

## 성능 최적화 팁

1. **메모이제이션 사용**: React에서 `useMemo`를 활용하여 불필요한 재계산 방지
2. **배치 처리**: 여러 문자열을 한 번에 처리할 때는 배열 함수 활용
3. **정규식 캐싱**: 자주 사용하는 정규식은 미리 컴파일하여 캐시

이 유틸리티 함수들을 사용하면 LodashTestPage.tsx의 모든 기능을 어디서든 쉽게 활용할 수 있습니다.
