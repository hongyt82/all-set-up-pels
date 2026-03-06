# 소스 수정·추가 구현 시 난독화/번들 유의사항

소스를 수정하거나 새 기능을 넣을 때, **번들(esbuild)** 과 **난독화(javascript-obfuscator)** 로 인해 런타임에서 깨지지 않도록 반드시 지켜야 할 사항을 정리한 문서입니다.

---

## 1. 한눈에 보기

| 구분 | 유의사항 |
|------|----------|
| **문자열** | 런타임에 그대로 유지되어야 하는 문자열은 **반드시** `build/reservedStrings.json` 에 추가 |
| **process.env** | 새로 읽는 환경 변수는 `process.env['KEY']` 형태 권장, `'KEY'` 를 reservedStrings 에 추가 |
| **경로** | 번들 실행 시 기준 디렉터리는 **dist/index.js 가 있는 쪽** → .env 는 dist 의 **부모(server 루트)** 기준 |
| **새 의존성** | Node 내장만 동적 require 하는 패키지는 그대로 동작. 그 외는 빌드 후 **dist 로 반드시 테스트** |
| **빌드 후** | 소스 수정 후 **npm run build** 실행하고, **dist 기동·health** 로 동작 검증 |

---

## 2. reservedStrings — 반드시 추가해야 하는 문자열

난독화 시 **문자열 리터럴**은 stringArray 등으로 치환됩니다. 아래에 해당하는 문자열은 **그대로 유지**되어야 하므로 `build/reservedStrings.json` 에 넣어야 합니다.

### 2.1 이미 등록된 항목 (참고)

- **.env 파일명**: `.env`, `.env.dev`, `.env.production`
- **프로토콜 메시지 type**: `newClient`, `chat`, `broadcast`, `broadcastAll`, `request`, `response`, `clientList`, `movePage`, `setForm`, `clientLeft`, `roomState`
- **JSON/메시지 키**: `roomId`, `type`, `value`, `event`, `user`, `targetClientId`
- **NODE_ENV 값**: `development`, `production`, `dev`

### 2.2 새로 추가할 때 체크리스트

다음을 **소스에 추가했다면** reservedStrings 에도 **반드시** 추가하세요.

| 추가한 것 | 예시 | reservedStrings 에 추가할 문자열 |
|-----------|------|-----------------------------------|
| **새 메시지 타입** | 클라이언트↔서버 프로토콜에 새 type | 해당 type 문자열 (예: `'myNewMessage'`) |
| **새 JSON 키** | 클라이언트와 주고받는 객체의 키 | 해당 키 이름 (예: `'payload'`, `'clientKey'`) |
| **.env 파일명** | 새 환경별 .env 사용 | 파일명 (예: `.env.staging`) |
| **문자열 비교/분기** | `data?.type === 'xxx'`, `msg.event === 'yyy'` | `'xxx'`, `'yyy'` |
| **process.env 키** | `process.env['NEW_KEY']` 로 읽는 키 | `'NEW_KEY'` (문자열로 쓸 때) |

- **위치**: `server/build/reservedStrings.json` 에 문자열 추가 후 저장.
- **추가 후**: `npm run build` 실행하고, `NODE_ENV=production node dist/index.js` 및 health·동기화 동작 확인.

---

## 3. process.env 접근

- **현재**: config 등에서 `process.env.PORT`, `process.env.IP` 처럼 **점 표기법** 사용. 난독화 옵션에 따라 속성명이 바뀌면 런타임에 읽히지 않을 수 있습니다.
- **권장**: **새로** 사용하는 환경 변수는 `process.env['KEY']` 형태로 쓰고, **`'KEY'`** 를 reservedStrings 에 추가하면 안전합니다.

```javascript
// 권장 (문자열이므로 reservedStrings 로 보호 가능)
const port = Number(process.env['PORT']) || 8700;

// 기존처럼 쓸 경우, 해당 키가 난독화되지 않도록 빌드 설정 확인 필요
const port = Number(process.env.PORT) || 8700;
```

---

## 4. 경로 (import.meta.url, __dirname, .env 로드)

- **번들 실행 시**: 진입점은 **dist/index.js** 하나. `import.meta.url` / `__dirname` 은 **dist/index.js 가 있는 디렉터리**를 가리킵니다.
- **rootDir**: config/env 에서 `rootDir = join(__dirname, '..')` → 즉 **dist 의 부모 = server 루트**. `.env`, `.env.production` 은 **server 루트**에서 로드됩니다.
- **새로 경로를 쓰는 코드**를 넣을 때: “실행 시 현재 작업 디렉터리”가 server 루트라고 가정하고, 상대 경로는 **dist 기준이 아니라 config/env 의 rootDir 기준**으로 두는 것이 안전합니다.

---

## 5. 새 npm 의존성 추가 시

- **Node 내장 모듈만** 동적 `require()` 하는 패키지 (예: `events`, `http`, `crypto`): 현재 빌드에서 **external + createRequire** 로 처리되므로 **추가 설정 없이** 동작합니다.
- **그 외** npm 패키지: esbuild 가 **번들에 포함**합니다. 해당 패키지가 동적 `require(모듈명)` 를 쓰면, 그 모듈명이 Node 내장이면 위와 같이 동작하고, **내장이 아닌 모듈**이면 빌드·실행 시 에러가 날 수 있으므로 **external 에 추가**할 수 있습니다.
- **필수**: 새 의존성 추가 후 **반드시** `npm run build` → `NODE_ENV=production node dist/index.js` 로 기동·health·실제 기능까지 테스트하세요.

---

## 6. 빌드 스크립트 수정 시

- **reservedStrings**만 바꾸는 경우: `build/reservedStrings.json`에 추가 후 `npm run build` 로 재빌드하면 됩니다.
- **external** 수정: Node 내장 외에 번들에서 제외할 모듈을 넣을 때. 제거 시 해당 모듈이 번들에 포함되며, 동적 require 가 있으면 createRequire 로 해결되는지 확인이 필요합니다.
- **난독화 옵션** 변경: `transformObjectKeys`, `stringArray` 등 변경 시 **dist 기동·프로토콜 동작**을 반드시 다시 검증하세요.

---

## 7. 소스 수정 후 필수 절차

1. **reservedStrings** — 새 프로토콜 타입·JSON 키·.env 파일명·문자열 비교값·env 키 등을 추가했다면 `build/reservedStrings.json` 에 반영.
2. **빌드**: `npm run build`
3. **실행 검증**: `NODE_ENV=production node dist/index.js` (또는 `npm start`)
4. **동작 확인**: `curl http://127.0.0.1:8701/health` 및 클라이언트(안드로이드 등)로 동기화·메시지 송수신 확인.

---

## 8. 참고 문서

- [BUILD.md](BUILD.md) — 빌드 절차, reservedStrings 목록, 스모크 테스트
- [DEPLOY_ESSENTIALS.md](../deploy/DEPLOY_ESSENTIALS.md) — 배포 시 필수 항목
- [testing/LOCAL_TEST_DIST.md](../testing/LOCAL_TEST_DIST.md) — 로컬에서 dist 테스트
