# ESLint Node 전역 설정 정리

이 문서는 서버 프로젝트(`server/`)에서 ESLint가 **Node 전역 API**(`setTimeout`, `setInterval` 등)를 인식하도록 설정한 내용을 정리합니다.

---

## 1. 왜 에러가 났는가?

- `src/index.js` 등에서 `setInterval`, `setTimeout`, `clearInterval`, `clearTimeout` 을 사용하고 있음.
- 하지만 기존 `eslint.config.js` 의 `globals` 에는 `console`, `process`, `Buffer` 등만 등록되어 있어,
  ESLint 관점에서는 위 타이머 함수들이 **정의되지 않은 전역(no-undef)** 으로 보였음.
- Node 런타임에서는 이 함수들이 **기본 제공 전역**이기 때문에, 실제 실행에는 문제가 없었으나 린트 에러가 발생했음.

---

## 2. 적용한 해결책: Node 전역을 ESLint에 명시

### 2.1 `globals` 패키지 추가

`devDependencies` 에 `globals` 패키지를 추가했습니다.

```bash
cd server
npm install --save-dev globals
```

`package.json` 발췌:

```json
\"devDependencies\": {
  \"@eslint/js\": \"^9.15.0\",
  \"esbuild\": \"^0.27.3\",
  \"eslint\": \"^9.15.0\",
  \"eslint-config-prettier\": \"^9.1.0\",
  \"globals\": \"^17.3.0\",
  \"javascript-obfuscator\": \"^5.3.0\",
  \"prettier\": \"^3.3.3\"
}
```

### 2.2 `eslint.config.js` 에 Node 전역 반영

```js
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node 런타임 전역 (setTimeout, setInterval, clearTimeout, clearInterval 등)
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
```

- `globals.node` 안에는 다음과 같은 Node 전역들이 포함되어 있습니다.
  - `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`
  - `console`, `process`, `Buffer`, `__dirname`, `__filename`, `require` 등
- 이 설정 이후, ESLint는 Node 환경 전역들을 **정상적인 전역 식별자**로 인식하게 되어,
  `setInterval is not defined` 류의 **no-undef 에러가 더 이상 발생하지 않습니다.**

---

## 3. 현재 상태 요약

- `npm run lint` 실행 시:
  - 이전에 보였던 `setInterval/setTimeout/clearInterval/clearTimeout is not defined` 에러는 발생하지 않음.
  - 프로젝트는 **Node 런타임 전제를 가진 서버 코드**로, ESLint 설정도 이에 맞게 정렬됨.

---

## 4. 참고

- `eslint.config.js` 는 **새로운(flat) ESLint 구성 방식**을 사용 중이며, `languageOptions.globals` 를 통해 전역을 정의합니다.
- 만약 브라우저 전역(window, document 등)을 추가로 사용할 일이 생기면, `globals.browser` 등을 조합해 사용할 수 있습니다.

