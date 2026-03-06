# 서버 로컬 실행 가이드 (IntelliJ 기준)

로컬 PC에서 **sync-server**를 띄울 때 필요한 사항을 IntelliJ(또는 WebStorm) 기준으로 정리한 문서입니다.

---

## 1. 필요 사항

| 항목 | 내용 |
|------|------|
| **Node.js** | **18 이상** (설치: [nodejs.org](https://nodejs.org) 또는 SDKMAN/nvm) |
| **npm** | Node 설치 시 함께 포함됨 |
| **IDE** | IntelliJ IDEA 또는 WebStorm (Node.js 플러그인 사용) |

터미널에서 버전 확인:

```bash
node -v   # v18.x.x 이상
npm -v
```

---

## 2. 프로젝트 열기

- **모노레포 전체**를 연 경우: 왼쪽 프로젝트 트리에서 `server` 폴더가 보이면 그 안에서 작업합니다.
- **서버만** 따로 연 경우: `sync-server-mono/server` 폴더를 **Open** 하면 됩니다.

진입 경로는 반드시 **server** 디렉터리( `package.json` 이 있는 곳)입니다.

---

## 3. 환경 설정 파일 확인

로컬 개발 시 사용하는 env 파일은 아래 두 개입니다. **이미 있다면 수정만 필요 시 하고, 없으면 복사해서 만듭니다.**

| 파일 | 역할 |
|------|------|
| **`.env`** | 공통 기본값 (환경별에 없는 키만 보충) |
| **`.env.dev`** | **로컬 개발용** — 포트·로그 등 (이 파일이 개발 시 우선 적용됨) |

- **중요**: `npm run dev` / IntelliJ에서 개발 모드로 실행하면 **NODE_ENV=development** 로 동작하며, 이때 **.env.dev** 가 로드됩니다.
- `.env.dev` 에서 로컬 포트 확인:  
  `PORT=8600` (또는 `INTERNAL_PORT=8600`) 이면 **WebSocket 8600**, **Health 8601** 사용입니다.

---

## 4. 의존성 설치

**server** 디렉터리에서 한 번만 실행:

```bash
cd server
npm install
```

IntelliJ 하단 **Terminal** 탭에서 실행하거나, 우클릭 → **Run 'npm install'** 로 실행해도 됩니다.

---

## 5. 실행 방법

### 방법 A: 터미널에서 실행 (가장 간단)

**server** 디렉터리에서:

```bash
npm run dev
```

- **NODE_ENV=development** 로 동작, **src/index.js** 직접 실행 (빌드 불필요)
- **.env.dev** → **.env** 순으로 로드
- 소스 변경 시 **자동 재시작** (--watch)

**배포용(번들+난독화)으로 로컬에서 실행**하려면: `npm run build` 후 `npm start` (dist/index.js 실행).

성공 시 예시:

```
[sync-server] WebSocket server listening on ws://0.0.0.0:8600
[sync-server] Environment: development (using .env.dev)
```

### 방법 B: IntelliJ Run Configuration으로 실행

1. **Run** → **Edit Configurations…**
2. **+** → **Node.js** 선택
3. 설정:
   - **Name**: `Sync Room Relay (dev)` 등 원하는 이름
   - **Node interpreter**: 사용 중인 Node 18+
   - **Working directory**: `$PROJECT_DIR$` 가 **server** 폴더를 가리키도록 (모노레포면 `server` 로 지정)
   - **JavaScript file**: `src/index.js`
   - **Environment variables**:  
     `NODE_ENV=development`  
     (필요 시 `PORT=8600` 등 추가)
4. **Apply** → **OK** 후 Run(▶)으로 실행

개발 시에는 **방법 A** (`npm run dev`)를 쓰면 watch까지 적용되어 편합니다.

---

## 6. 로컬에서 사용하는 포트 (개발용)

| 용도 | 포트 | 비고 |
|------|------|------|
| **WebSocket** | **8600** | 클라이언트 연결 주소 (ws://localhost:8600) |
| **Health Check** | **8601** | 서버 상태 확인용 HTTP (WS 포트 + 1) |

`.env.dev` 의 `PORT`(또는 `INTERNAL_PORT`)를 바꾸면 위 포트가 함께 바뀝니다. Health는 항상 **WS 포트 + 1** 입니다.

---

## 7. 동작 확인

서버가 떴다면:

1. **Health 확인** (브라우저 또는 터미널):
   ```bash
   curl http://localhost:8601/health
   ```
   JSON으로 `status`, `connections`, `memory` 등이 나오면 정상입니다.

2. **클라이언트 연결**:
   - 같은 PC: `ws://localhost:8600`
   - Android 에뮬레이터: `ws://10.0.2.2:8600` (호스트 PC = 10.0.2.2)
   - 실제 기기: `ws://<PC의 IP>:8600`

---

## 8. 자주 쓰는 npm 스크립트

| 명령어 | 용도 |
|--------|------|
| `npm run dev` | 로컬 개발 (watch, .env.dev) |
| `npm run prod` | 프로덕션 모드로 실행 (.env.production) |
| `npm start` | 프로덕션 모드로 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷 적용 |

---

## 9. 문제 해결

| 현상 | 확인할 것 |
|------|------------|
| 포트 사용 중 (EADDRINUSE) | 8600/8601을 쓰는 다른 프로세스 종료 후 재실행 |
| `.env.dev` 가 적용 안 됨 | Run Configuration에 `NODE_ENV=development` 설정 여부, 실행 경로가 **server** 인지 확인 |
| Health 404 | Health는 **8601** 로 요청 (8600 아님) |
| Android에서 연결 안 됨 | 방화벽에서 8600 허용, 같은 Wi‑Fi·네트워크인지 확인 |

---

## 10. 참고 문서

- **한눈에 보기**: [OVERVIEW.md](../OVERVIEW.md) — 포트·env·실행 요약
- **아키텍처**: [ARCHITECTURE.md](../structure/ARCHITECTURE.md) — 실행 흐름, 메시지 프로토콜
- **문서 목록**: [README.md](../README.md) — 전체 문서 인덱스
