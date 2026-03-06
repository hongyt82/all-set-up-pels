/**
 * Loads environment variables from .env files.
 * NODE_ENV에 따라 .env.production, .env.dev, 또는 .env를 로드하고,
 * 공통 설정을 위해 .env를 override: false로 추가 로드.
 * config.js에서 import되므로 config 사용 전에 반드시 먼저 실행됨.
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// NODE_ENV에 따라 로드할 .env 파일 선택 (config.js에서 env/envFile 표시용으로도 사용)
const env = process.env.NODE_ENV || 'development';
let envFile = '.env';
if (env === 'production') {
  envFile = '.env.production';
} else if (env === 'development' || env === 'dev') {
  envFile = '.env.dev';
}

// 1) 환경별 파일 먼저 로드
dotenv.config({ path: join(rootDir, envFile) });
// 2) 공통 .env 추가 로드 (이미 설정된 키는 덮어쓰지 않음)
dotenv.config({ path: join(rootDir, '.env'), override: false });
