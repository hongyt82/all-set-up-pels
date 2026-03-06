# PM2 가이드 (sync-server)

배포 환경이 **Docker 등을 쓰지 않고 PM2만 사용**할 때의 전략과 사용 방법을 정리한 문서입니다.

---

## 1. 한눈에 보기

| 구분 | 내용 |
|------|------|
| **배포 방식** | Docker 미지원 → **PM2로 프로세스 관리** |
| **PM2 설치 위치** | **배포 서버: 전역 설치** (`npm install -g pm2`) |
| **프로젝트** | PM2를 dependency로 두지 않음. **ecosystem.config.js**와 npm 스크립트만 제공 |
| **앱 이름** | `sync-server` (로그/명령 시 사용) |

---

## 2. 왜 이 전략인가

- **재부팅 후 자동 기동** (`pm2 startup`, `pm2 save`)은 전역 PM2 기준으로 동작합니다. 프로젝트 안에만 두면 경로 문제가 생기기 쉽습니다.
- **배포 시** `npm install --production` 을 쓰면 devDependencies는 설치되지 않습니다. PM2를 프로젝트에 넣어 두면 서버에서 설치가 빠져 명령을 찾지 못할 수 있습니다.
- **한 서버에 앱이 여러 개**일 때, 전역 PM2 하나로 모두 관리하는 편이 단순합니다.

→ **배포 서버에서 PM2는 전역 설치**, 프로젝트는 설정 파일과 실행 방법만 제공하는 방식이 안정적입니다.

---

## 3. 배포 서버에서 할 일

### 3.1 PM2 설치 (최초 1회)

```bash
npm install -g pm2
```

- 해당 서버에서 PM2로 띄울 앱이 있으면 **한 번만** 실행하면 됩니다.

### 3.2 sync-server 배포 후 실행

배포한 **sync-server 디렉터리**에서:

```bash
npm install --production   # 필요 시
npm run build             # dist/index.js 생성
pm2 start ecosystem.config.js
```

- 또는 프로젝트 스크립트: `npm run pm2:start` (내부적으로 `pm2 start ecosystem.config.js` 실행, 전역 PM2 필요).

### 3.3 재부팅 후에도 유지하려면 (선택)

```bash
pm2 startup    # 생성된 명령을 그대로 한 번 실행
pm2 save       # 현재 프로세스 목록 저장
```

- 이후 서버가 재부팅되어도 PM2가 기동되고, 저장해 둔 앱이 다시 올라갑니다.

---

## 4. 로컬/개발 PC에서 PM2 쓰기

- **전역 설치**한 경우: 터미널에서 `pm2 start ecosystem.config.js`, `pm2 logs sync-server` 등 그대로 사용.
- **전역 설치 없이** 쓰려면: 프로젝트에 PM2를 **devDependencies**로 넣고 `npx pm2 ...` 로 실행.  
  (배포 서버와는 별개이므로, 로컬만 이렇게 해도 됩니다.)

---

## 5. 자주 쓰는 명령어

| 목적 | 명령 |
|------|------|
| **시작** | `pm2 start ecosystem.config.js` 또는 `npm run pm2:start` |
| **중지** | `pm2 stop sync-server` 또는 `npm run pm2:stop` |
| **재시작** | `pm2 restart sync-server` 또는 `npm run pm2:restart` |
| **삭제** | `pm2 delete sync-server` 또는 `npm run pm2:delete` |
| **목록/상태** | `pm2 status` 또는 `pm2 list` 또는 `npm run pm2:status` |
| **로그 보기** | `pm2 logs sync-server` 또는 `npm run pm2:logs` |
| **모니터** | `pm2 monit` 또는 `npm run pm2:monit` |
| **상세 정보** | `pm2 show sync-server` |

- **실행 위치**: 위 명령은 모두 **sync-server 디렉터리**(또는 ecosystem.config.js·dist가 있는 경로)에서 실행합니다.  
  `script: './dist/index.js'` 는 현재 작업 디렉터리 기준이므로, 다른 경로에서 실행하면 실패할 수 있습니다.

---

## 6. 정상 동작 확인

| 확인 항목 | 방법 |
|-----------|------|
| **앱이 떠 있는지** | `pm2 status` → `sync-server` 가 **online** |
| **실행 경로/설정** | `pm2 show sync-server` |
| **기동 로그** | `pm2 logs sync-server` → `[sync-server] WebSocket server listening on ...` 등 출력 |
| **HTTP Health** | `curl -s http://127.0.0.1:8701/health` (프로덕션 기본 포트 8701) |

- `command not found: pm2` 가 나오면 해당 환경에 PM2가 설치되지 않은 것입니다. 배포 서버에서는 위처럼 **전역 설치** 후 사용하세요.

---

## 7. 유의사항

- **빌드 후 실행**: PM2는 `./dist/index.js` 를 실행합니다. `npm run build` 로 **dist를 만든 뒤**에 `pm2 start` 해야 합니다.
- **환경 변수**: 실행 시 작업 디렉터리는 **sync-server 루트**로 두어야 `.env.production` 이 로드됩니다. ecosystem.config.js의 `script`는 상대 경로이므로, 반드시 sync-server 디렉터리에서 `pm2 start` 를 실행하세요.
- **로그 파일**: 기본값으로 `./logs/pm2-out.log`, `./logs/pm2-error.log` 에 쌓입니다. 디렉터리가 없으면 PM2가 생성할 수 있으나, 권한 문제가 있으면 미리 `logs/` 를 만들어 두는 것이 좋습니다.

---

## 8. 관련 문서

| 문서 | 내용 |
|------|------|
| [GETTING_STARTED.md](../GETTING_STARTED.md) | 최초 설치·할 일·유의사항 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 배포 절차 (PM2 포함) |
| [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) | 배포 시 체크리스트 |

---

이 문서는 **Docker 없이 PM2만으로 배포·설치**하는 환경을 전제로, 전략과 사용 방법을 직관적으로 정리한 것입니다.
