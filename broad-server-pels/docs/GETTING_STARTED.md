# sync-server 최초 설치 및 할 일

**소스를 처음 받은 사람**이 설치부터 첫 실행·확인까지 할 일과 유의사항을 정리한 문서입니다.

---

## 1. 사전 요구사항

| 항목 | 요구 내용 |
|------|------------|
| **Node.js** | **18 이상** (권장: 20 LTS). [nodejs.org](https://nodejs.org) 또는 nvm 등으로 설치 |
| **npm** | Node 설치 시 포함 (8.x 이상) |

확인:

```bash
node -v   # v18.x.x 이상
npm -v
```

---

## 2. 설치 절차

### 2.1 소스 위치로 이동

프로젝트 루트에서 **sync-server** 폴더로 이동합니다. (모노레포면 `sync-server` 디렉터리가 있는 경로)

```bash
cd sync-server
```

- **중요**: 이후 모든 명령은 **sync-server** 디렉터리(즉 `package.json`이 있는 곳)에서 실행합니다.

### 2.2 의존성 설치

```bash
npm install
```

- `node_modules`와 `package-lock.json`이 생성/갱신됩니다.
- **npm audit** 시 ESLint 관련 5 moderate가 나올 수 있습니다. (dev 전용, 수용 가능 — 아래 [유의사항](#5-유의사항) 참고)

### 2.3 환경 설정 파일 확인

서버는 **dotenv**로 환경별 설정 파일을 로드합니다. **파일 이름을 반드시 아래와 같이** 둡니다.

| 파일 | 용도 | 비고 |
|------|------|------|
| **`.env`** | 공통 기본값 | 환경별 파일에 없는 키만 보충 |
| **`.env.dev`** | 개발 환경 | `npm run dev` 시 사용 |
| **`.env.production`** | 프로덕션 환경 | `npm start` / PM2 배포 시 사용 |

- **없으면**: 팀에서 공유하는 예시(예: `.env.example`)를 복사해 `.env`, `.env.dev`, `.env.production`을 만들고, 포트·IP 등만 로컬/서버에 맞게 수정합니다.
- **있으면**: 포트(PORT, INTERNAL_PORT), IP, 로그(LOG_LEVEL) 등 필요 시만 수정합니다.
- **주의**: 프로덕션 파일명은 **`.env.production`** 만 사용합니다. `.env.prod`는 사용하지 않습니다.

자세한 설정 항목은 [OVERVIEW.md](OVERVIEW.md), [ENV_WAS_SETTINGS.md](deploy/ENV_WAS_SETTINGS.md)를 참고하세요.

---

## 3. 최초 할 일 (체크리스트)

아래 순서대로 진행하면 됩니다.

1. **의존성 설치**  
   ```bash
   npm install
   ```

2. **환경 파일 확인**  
   - `.env`, `.env.dev`(개발용), `.env.production`(배포용) 존재 여부 확인.  
   - 없으면 예시를 복사해 생성 후 포트·IP 등만 수정.

3. **개발 모드 실행 확인**  
   ```bash
   npm run dev
   ```  
   - 터미널에 `[sync-server] WebSocket server listening on ws://...` 가 보이면 성공.  
   - 기본 개발 포트: **8600**(WS), **8601**(Health).  
   - 종료: `Ctrl+C`.

4. **빌드 실행**  
   ```bash
   npm run build
   ```  
   - `dist/index.js`가 생성되는지 확인. (배포 시 이 파일을 사용합니다.)

5. **린트/포맷 확인**  
   ```bash
   npm run lint
   npm run format:check
   ```  
   - 문제가 있으면 `npm run lint:fix`, `npm run format`으로 수정 가능.

6. **(선택) 프로덕션 로컬 실행**  
   ```bash
   npm start
   ```  
   - `dist/index.js` + `.env.production`으로 동작합니다.  
   - 포트는 `.env.production`의 PORT/INTERNAL_PORT(기본 8700/8701)를 따릅니다.

---

## 4. 실행 방법 요약

| 목적 | 명령 | 사용 env |
|------|------|----------|
| **개발(소스 직접, 자동 재시작)** | `npm run dev` | .env.dev → .env |
| **프로덕션(빌드 결과물)** | `npm run build` 후 `npm start` | .env.production → .env |
| **PM2로 배포** | `npm run build` 후 `npm run pm2:start` | .env.production |
| **로그 보기(PM2)** | `npm run pm2:logs` 또는 `pm2 logs sync-server` | — |

자세한 스크립트 설명은 [SCRIPTS.md](SCRIPTS.md), 로컬 실행은 [LOCAL_SETUP.md](local_setup/LOCAL_SETUP.md)를 참고하세요.

---

## 5. 유의사항

### 5.1 환경 파일

- **파일명 고정**: `.env`, `.env.dev`, `.env.production` 만 사용합니다.  
  코드에서 이 이름으로 로드하므로, 이름을 바꾸면 적용되지 않습니다.
- **민감 정보**: `.env*`에는 포트·IP·WAS 설정 등이 들어갈 수 있으므로, 공개 저장소에 올리지 않도록 합니다. (일반적으로 `.gitignore`에 포함됨)

### 5.2 빌드와 실행

- **배포 전**: 반드시 `npm run build`로 `dist/index.js`를 생성한 뒤, `npm start` 또는 PM2로 **dist/index.js**를 실행합니다.  
  `src/`만 복사하고 빌드하지 않으면 서버가 동작하지 않습니다.
- **실행 위치**: `npm start`, `npm run dev` 등은 **sync-server** 디렉터리에서 실행해야 합니다.  
  상위 디렉터리에서 실행하면 `.env` 파일을 찾지 못합니다.

### 5.3 포트

- **개발**: 기본 8600(WebSocket), 8601(Health).  
  `.env.dev`의 `PORT` 또는 `INTERNAL_PORT`로 변경 가능.
- **프로덕션**: 기본 8700(WebSocket), 8701(Health).  
  Nginx 등에서 Health를 프록시할 때 **8701**로 연결해야 합니다. (8700이 아님)

### 5.4 PM2

- **앱 이름**: `ecosystem.config.js`의 `name`은 **`sync-server`** 입니다.  
  로그 확인: `pm2 logs sync-server` 또는 `npm run pm2:logs`.

### 5.5 npm audit

- **5 moderate** (ajv 관련, ESLint dev 의존성)가 나올 수 있습니다.  
  개발/린트 전용이며, 서버 런타임에는 영향이 없어 수용 가능합니다.  
  자세한 이유는 프로젝트 내 안내를 참고하세요.

### 5.6 Node 버전

- **engines**: `package.json`에 `"node": ">=18"` 로 명시되어 있습니다.  
  Node 18 이상(권장 20 LTS)을 사용하세요.

---

## 6. 다음에 읽을 문서

| 문서 | 내용 |
|------|------|
| [README.md](README.md) | 기능, 스크립트, 프로젝트 구조 개요 |
| [OVERVIEW.md](OVERVIEW.md) | 포트, .env, 빌드/실행 한눈에 |
| [LOCAL_SETUP.md](local_setup/LOCAL_SETUP.md) | IntelliJ 기준 로컬 실행 |
| [DEPLOY_CHECKLIST.md](deploy/DEPLOY_CHECKLIST.md) | 배포 시 할 일 체크리스트 |
| [PM2_GUIDE.md](PM2_GUIDE.md) | PM2 전략·사용법 (Docker 없이 PM2만 배포 시) |
| [DEPLOY_ESSENTIALS.md](deploy/DEPLOY_ESSENTIALS.md) | 배포 시 가져가야 할 파일 |

---

이 문서는 **sync-server**를 처음 받은 후 설치·환경 설정·최초 실행·유의사항을 한 곳에서 따라 할 수 있도록 정리한 것입니다. 배포나 WAS 연동은 위 "다음에 읽을 문서"를 이어서 참고하시면 됩니다.
