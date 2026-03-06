# Tailwind v4 / Oxide — "Cannot find native binding" 해결

## 원인

- **Tailwind CSS v4**는 `@tailwindcss/oxide`(Rust 기반 네이티브 바이너리)를 사용합니다.
- **@tailwindcss/oxide**는 **Node.js 20 이상**을 요구합니다. Node 18에서는 네이티브 바이너리가 로드되지 않아 아래 에러가 납니다.

```
Error: Cannot find native binding. npm has a bug related to optional dependencies
(https://github.com/npm/cli/issues/4828).
```

- npm의 optional dependency 처리 버그(#4828)와 겹치면, 같은 현상이 Node 20 미만 환경에서도 발생할 수 있습니다.

## 해결 방법 (권장 순서)

### 1. Node 20 이상 사용 (권장)

프로젝트는 **Node >= 20**을 요구하도록 `package.json`의 `engines`에 명시되어 있습니다.

- **nvm** 사용 시:
  ```bash
  nvm install 20
  nvm use 20
  ```
- **fnm** 사용 시:
  ```bash
  fnm install 20
  fnm use 20
  ```
- 그 다음 의존성 재설치 후 dev 서버 실행:
  ```bash
  rm -rf node_modules
  npm install
  npm run dev
  ```

### 2. 재설치로 npm 케이스 해결

Node 20 이상인데도 같은 에러가 나면, npm optional dependency 이슈일 수 있습니다.

```bash
rm -rf node_modules
npm install
npm run dev
```

### 3. Tailwind v3로 다운그레이드 (Node 18 유지 시)

Node 18을 유지해야 한다면, Tailwind를 v3로 낮추면 Oxide를 쓰지 않아 해당 에러가 사라집니다.  
대신 `@tailwindcss/vite` 제거, `tailwindcss@3` + PostCSS 설정, CSS를 `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` 방식으로 바꾸는 작업이 필요합니다.

## 요약

| 환경        | 조치 |
|------------|------|
| Node 18    | **Node 20+** 로 올리거나, Tailwind v3로 다운그레이드. |
| Node 20+   | `rm -rf node_modules && npm install` 후 `npm run dev`. |
