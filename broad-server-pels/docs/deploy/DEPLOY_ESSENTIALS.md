# 배포 시 가져가야 할 필수 항목

배포 서버로 **반드시 복사해야 하는 파일·디렉터리**만 정리한 문서입니다.

---

## 1. 한눈에 보기

| 구분 | 항목 | 설명 |
|------|------|------|
| **필수** | `dist/index.js` | 빌드 결과물. **없으면 서버 기동 불가.** |
| **필수** | `.env.production` | 프로덕션 설정 (포트, IP, WAS, 로그 등). |
| **선택** | `.env` | 공통 기본값. 없으면 .env.production 값만 사용. |
| **선택** | `ecosystem.config.js` | PM2로 실행할 때만 필요. |
| **선택** | `package.json` | `npm start` 등 스크립트 쓸 때만 있으면 됨. |
| **불필요** | `node_modules` | **가져가지 않음.** dist에 번들 포함됨. |
| **불필요** | `src/`, `build/` | 배포 환경에서는 실행에 사용하지 않음. |

---

## 2. 필수 (반드시 가져가기)

### 2.1 `dist/index.js`

- **역할**: 서버 실행 파일 (번들+난독화된 단일 진입점).
- **생성**: 개발/빌드 환경에서 `npm run build` 실행 후 생성.
- **위치**: 배포 시에도 **동일한 상대 경로** 유지 (아래 디렉터리 구조 참고).

### 2.2 `.env.production`

- **역할**: 프로덕션용 환경 변수 (IP, PORT, WAS_TYPE, HEALTH_CHECK_PATH 등).
- **필수 설정 예**: `PORT=8700`, `IP=127.0.0.1`(WAS와 같은 서버일 때), `NODE_ENV=production`.
- **위치**: **dist/index.js와 같은 루트**에 두기 (실행 시 현재 작업 디렉터리 기준으로 로드).

---

## 3. 선택 (상황에 따라)

| 항목 | 언제 가져가나 |
|------|----------------|
| **.env** | 공통 기본값을 쓰거나, .env.production에 없는 키를 보충할 때. |
| **ecosystem.config.js** | PM2로 `pm2 start ecosystem.config.js` 할 때. (script: `./dist/index.js` 기준) |
| **package.json** | `npm start`, `npm run pm2:start` 등 스크립트를 쓰고 싶을 때. |
| **logs/** | PM2 로그를 같은 경로에 두려면 빈 디렉터리 또는 기존 로그 디렉터리. |

---

## 4. 가져가지 않는 것

- **node_modules** — dist에 의존성이 번들되어 있어 불필요.
- **src/**, **build/**, **config/** — 배포 서버에서는 실행에 사용하지 않음 (관리용으로만 보관 가능).

---

## 5. 배포 후 디렉터리 구조 예시

```
배포_서버_경로/
├── dist/
│   └── index.js          ← 필수
├── .env.production       ← 필수
├── .env                  ← 선택
├── ecosystem.config.js   ← PM2 사용 시
├── package.json          ← npm 스크립트 사용 시
└── logs/                 ← PM2 로그 경로 사용 시
```

- **실행**: 위 디렉터리를 **작업 디렉터리**로 두고 `node dist/index.js` 또는 `npm start` 실행.
- **주의**: `.env.production`은 **dist의 부모(루트)** 에 있어야 함 (config가 `join(rootDir, '.env.production')` 로 로드).

---

## 6. 대상 서버 요구사항

| 항목 | 내용 |
|------|------|
| **Node.js** | 18 이상 (설치 필수). |
| **npm** | 실행만 할 경우 불필요. `npm start` 쓰려면 npm 필요. |
| **PM2** | PM2로 기동할 때만 해당 서버에 PM2 설치 필요. |

---

## 7. 참고 문서

- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) — Nginx/Windows 배포 절차
- [DEPLOYMENT.md](DEPLOYMENT.md) — 배포 프로세스 상세
- [BUILD.md](../build/BUILD.md) — dist 생성 방법
