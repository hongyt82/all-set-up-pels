# 빌드 가이드 (번들 + 난독화)

배포 시 사용하는 **단일 파일** `dist/index.js`는 **esbuild**(번들) + **javascript-obfuscator**(난독화)로 생성됩니다.

---

## 1. 빌드 실행

```bash
cd server
npm run build
```

- **입력**: `src/`, `config/` (entry: `src/index.js`)
- **산출물**: `dist/index.js` (단일 ESM 파일, 의존성 포함·난독화 적용)
- **실행**: 반드시 **server 루트**에서 `node dist/index.js` 실행. `.env` / `.env.production`은 server 루트에서 로드됨.

---

## 2. 스크립트 위치 및 동작

| 파일 | 역할 |
|------|------|
| **build/build.cjs** | Node로 실행하는 빌드 스크립트 (CommonJS) |
| 1) esbuild | `src/index.js` 기준 번들, platform: node, format: esm, packages: bundle, Node 내장 모듈은 external |
| 2) javascript-obfuscator | 번들 결과에 난독화 적용, `reservedStrings`로 프로토콜·env 문자열 보존 |
| 3) createRequire 주입 | 난독화 후 `dist` 최상단에 `createRequire(import.meta.url)` 추가 → 번들 내 동적 `require()`(ws 등) 동작 |
| 4) 디버그 아티팩트 | `dist/index.debug.js` (+ sourcemap) 생성 → 운영 장애 분석/로컬 재현용 |

---

## 3. 보존 문자열 (reservedStrings)

난독화 시 **변경하면 런타임 오동작**이 나는 문자열은 `build/reservedStrings.json`에 넣어 두었고, `npm run build` 시 **누락을 자동 검증**합니다.  \n자세한 사용법: [DEBUG_ARTIFACTS_AND_RESERVED_RULE.md](DEBUG_ARTIFACTS_AND_RESERVED_RULE.md)

- **.env 경로**: `.env`, `.env.dev`, `.env.production`
- **프로토콜 타입/이벤트**: `newClient`, `chat`, `broadcast`, `broadcastAll`, `request`, `response`, `clientList`, `movePage`, `setForm`, `clientLeft`, `roomState`
- **키/환경**: `roomId`, `type`, `value`, `event`, `user`, `targetClientId`, `development`, `production`, `dev`

새 프로토콜 타입이나 .env 파일명을 추가할 때는 이 배열에 함께 추가해야 합니다.  
**소스 수정·추가 구현 시 난독화/번들 유의사항 전반** → [OBFUSCATION_BUNDLE_NOTES.md](OBFUSCATION_BUNDLE_NOTES.md)

---

## 4. 스모크 테스트 (선택)

배포 전에 **빌드·실행·health**가 정상인지 확인하려면:

```bash
cd server
npm run build
NODE_ENV=production node dist/index.js &
sleep 3
curl -s http://127.0.0.1:8701/health
# → {"status":"ok", ...} 이면 정상. 이후 프로세스 종료: kill %1
```

- 반드시 **server** 루트에서 실행 (`.env.production` 로드 경로).
- health 포트는 `.env.production`의 `PORT+1` (기본 8701).

---

## 5. 배포 흐름 요약

1. `npm install` → 의존성 설치 (esbuild, javascript-obfuscator는 devDependencies)
2. `npm run build` → `dist/index.js` 생성
3. **server** 루트에 `.env`, `.env.production` 배치
4. `npm start` 또는 `pm2 start ecosystem.config.js` → `dist/index.js` 실행

---

## 6. 참고 문서

- [OVERVIEW.md](../OVERVIEW.md) — 빌드/실행 방법 요약
- [DEPLOYMENT.md](../deploy/DEPLOYMENT.md) — 배포 절차 전체
- [LOCAL_TEST_DIST.md](../dist_test/LOCAL_TEST_DIST.md) — 로컬에서 production dist 테스트 시나리오
- [DEPLOYED_DIST_TEST.md](../dist_test/DEPLOYED_DIST_TEST.md) — 배포 후 생성된 dist 테스트 시나리오
