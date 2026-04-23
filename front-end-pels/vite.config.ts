import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // package.json에서 버전 정보 읽기
  const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'))
  const appVersion = packageJson.version
  const buildTime = new Date().toISOString()

  // Git 커밋 해시 가져오기 (선택적)
  let gitCommit: string | undefined
  try {
    const { execSync } = require('child_process')
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch {
    // Git이 없거나 .git 폴더가 없는 경우 무시
  }

  // Debug: show resolved port from env
  // This runs in Node at config time
  // eslint-disable-next-line no-console
  console.log(`[vite] mode=${mode} VITE_PORT=${env.VITE_PORT ?? 'undefined'} VERSION=${appVersion}`)

  // Derive host/port from VITE_MAIN_URL if provided (e.g., http://localhost:4000)
  let host: string | undefined
  let port: number | undefined
  if (env.VITE_OUT_MAIN_URL) {
    try {
      const u = new URL(env.VITE_OUT_MAIN_URL)
      host = u.hostname
      port = u.port ? Number(u.port) : undefined
    } catch {
      // ignore parse error; fallback to VITE_PORT
    }
  }
  if (!port && env.VITE_PORT) port = Number(env.VITE_PORT)

  // Bind host rule: if MAIN_URL host is public/non-local, do not bind to it (will cause EADDRNOTAVAIL)
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === undefined
  const bindHost = env.VITE_HOST || (isLocalHost ? (host || 'localhost') : '0.0.0.0')

  // Dev-only: log if VITE_API_URL / VITE_API_LEGACY_URL (per VITE_PROXY_DOT_DO) is not a valid URL.
  // Actual proxy mounts are fixed under server.proxy below. (실제 Proxy Mount 처리 하단의 사항으로 처리하며)
  // 기존 apiPath 부분 리턴하는 부분 없고 사용하지 않아 apiUrl 구문 하나로 정리함 그리고 warn try catch
  if (mode === 'dev' || mode === 'localdev') {
    const isProxyDotDoEnabled = String(env.VITE_PROXY_DOT_DO).toLowerCase() === 'true'
    const apiUrl = isProxyDotDoEnabled ? env.VITE_API_LEGACY_URL : env.VITE_API_URL
    if (apiUrl) {
      try {
        new URL(apiUrl)
      } catch (error) {
        console.warn(`[vite] Invalid API URL configuration:`, error)
      }
    }
  }
  return {
    base: '/pels/',
    plugins: [react(), tailwindcss()],
    // 전역 상수 정의 (빌드 시점에 주입)
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __BUILD_TIME__: JSON.stringify(buildTime),
      __GIT_COMMIT__: JSON.stringify(gitCommit || ''),
    },
    // Edge 브라우저 호환성을 위한 빌드 설정
    build: {
      // 빌드 경로
      outDir: "../PELS/src/main/webapp/static/e-link-v2",
      emptyOutDir: true,
      // Edge 79+ (Chromium 기반) 지원을 위한 타겟 설정
      target: ['edge79', 'chrome79', 'firefox72', 'safari13'],
      // 소스맵 생성 (개발 시 디버깅용)
      sourcemap: mode === 'development',
      // 청크 크기 경고 임계값
      chunkSizeWarningLimit: 1000,
      // 롤업 옵션
      rollupOptions: {
        output: {
          // 청크 분할 최적화
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            pdf: ['pdf-lib', 'pdfjs-dist'],
            moment: ['moment']
          },
          // Hash로 이름 변경 안됨
          // entryFileNames: 'assets/[name].js',
          // chunkFileNames: 'assets/[name].js',
          // assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    server: {
      host: bindHost,
      port: port || 4008,
      strictPort: true,
      proxy: {
        '/pels/api': {
          target: 'http://localhost:8484',
          changeOrigin: true,
        },
        '/pels/proxy': {
          target: 'http://localhost:8484',
          changeOrigin: true,
        },
      },
    },

    preview: {
      host: bindHost,
      port: port || 5173,
      strictPort: true,
    },
  }
})
