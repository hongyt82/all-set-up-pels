# package.json scripts 사용법

`server/package.json` 에 정의된 npm 스크립트의 용도와 사용 방법을 정리한 문서입니다.  
**실행 위치**: 모든 명령은 `server/` 디렉터리에서 실행합니다 (`cd server` 후 `npm run <스크립트>`).

---

## 1. 빌드

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **build** | `npm run build` | `build/build.cjs` 실행. **reservedStrings 검증** → esbuild 번들 + 난독화 후 **dist/index.js**(배포용) + `dist/index.debug.js`(디버그용) 생성. 배포 전 필수. |
| **check:reserved** | `npm run check:reserved` | `build/check_reserved_strings.cjs` 실행. **reservedStrings 누락 여부만 단독 검사**(빌드는 수행하지 않음). |

```bash
cd server
npm run build
```

- 산출물:
  - `dist/index.js` — **배포용** (번들 + 난독화 + `createRequire` 주입)
  - `dist/index.debug.js` / `dist/index.debug.js.map` — **디버그용** (난독화 없이 sourcemap 포함)
- reservedStrings 상세 및 디버그 아티팩트 설명:
  - [build/BUILD.md](build/BUILD.md)
  - [build/DEBUG_ARTIFACTS_AND_RESERVED_RULE.md](build/DEBUG_ARTIFACTS_AND_RESERVED_RULE.md)

---

## 2. 실행 (Production / 배포용)

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **start** | `npm start` | **dist/index.js** 를 production 모드로 실행. 배포·운영 시 사용. |
| **prod** | `npm run prod` | start 와 동일. dist 기반 production 실행의 별칭. |

```bash
cd server
npm start
# 또는
npm run prod
```

- 환경: `NODE_ENV=production` → `.env.production` 로드
- 반드시 **server 루트**에서 실행 (`.env` 경로 기준)

---

## 3. 실행 (소스 직접 / 디버깅)

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **start:src** | `npm run start:src` | **src/index.js** 를 빌드 없이 직접 실행. production env 로 소스 동작 확인 시 사용. |

```bash
cd server
npm run start:src
```

- 빌드 불필요. `dist/` 가 없어도 동작.

---

## 4. 개발 (Development)

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **dev** | `npm run dev` | **src/index.js** 를 development 모드로 실행. 파일 변경 시 자동 재시작 (--watch). |
| **dev:watch** | `npm run dev:watch` | dev 와 동일. |

```bash
cd server
npm run dev
```

- 환경: `NODE_ENV=development` → `.env.dev` 로드
- 코드 수정 시 프로세스가 자동으로 재시작됨

---

## 5. PM2 (프로세스 관리)

배포 환경에서 **dist/index.js** 를 PM2로 기동·관리할 때 사용합니다.  
PM2 사전 설치: `npm install -g pm2`

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **pm2:start** | `npm run pm2:start` | `ecosystem.config.js` 기준으로 앱 시작 (dist/index.js) |
| **pm2:stop** | `npm run pm2:stop` | 앱 중지 |
| **pm2:restart** | `npm run pm2:restart` | 앱 재시작 |
| **pm2:delete** | `npm run pm2:delete` | PM2 목록에서 앱 삭제 |
| **pm2:logs** | `npm run pm2:logs` | sync-server 로그 스트리밍 |
| **pm2:monit** | `npm run pm2:monit` | PM2 모니터 대시보드 |
| **pm2:status** | `npm run pm2:status` | PM2 프로세스 목록/상태 |
| **pm2:save** | `npm run pm2:save` | 현재 PM2 프로세스 목록 저장 |

```bash
cd server
npm run pm2:start
npm run pm2:status
npm run pm2:logs
```

- 설정 파일: `server/ecosystem.config.js` (진입점 `./dist/index.js`)

---

## 6. 코드 품질 / 포맷

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| **lint** | `npm run lint` | ESLint 로 `src/` 하위 .js 검사 |
| **lint:fix** | `npm run lint:fix` | ESLint 검사 후 자동 수정 가능 항목 적용 |
| **format** | `npm run format` | Prettier 로 `src/**/*.js` 포맷 적용 |
| **format:check** | `npm run format:check` | Prettier 기준으로 포맷 검사만 (수정 없음) |

```bash
cd server
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

---

## 7. 요약 표

| 용도 | 스크립트 |
|------|----------|
| 배포용 빌드 + reservedStrings 검증 | `npm run build` |
| reservedStrings만 사전 점검 | `npm run check:reserved` |
| 배포용 실행 (dist) | `npm start` / `npm run prod` |
| 소스만 실행 (빌드 없이) | `npm run start:src` |
| 개발 모드 (watch) | `npm run dev` |
| PM2 시작 | `npm run pm2:start` |
| PM2 로그 보기 | `npm run pm2:logs` |
| 린트 / 포맷 | `npm run lint`, `npm run format` |

---

## 8. 참고 문서

- [BUILD.md](build/BUILD.md) — 빌드 상세 및 스모크 테스트
- [DEBUG_ARTIFACTS_AND_RESERVED_RULE.md](build/DEBUG_ARTIFACTS_AND_RESERVED_RULE.md) — 디버그 아티팩트 + reservedStrings 검증 룰
- [LOCAL_TEST_DIST.md](dist_test/LOCAL_TEST_DIST.md) — 로컬에서 dist 테스트
- [DEPLOYED_DIST_TEST.md](dist_test/DEPLOYED_DIST_TEST.md) — 배포 후 dist 테스트
- [DEPLOYMENT.md](deploy/DEPLOYMENT.md) — 배포 절차
