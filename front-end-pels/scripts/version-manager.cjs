#!/usr/bin/env node

/**
 * 버전 관리 스크립트
 * 폐쇄적 환경에서 수동 배포 시 버전을 관리하는 도구
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

/**
 * package.json에서 현재 버전을 가져옵니다
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  return packageJson.version;
}

/**
 * package.json의 버전을 업데이트합니다
 */
function updateVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ 버전이 ${newVersion}으로 업데이트되었습니다.`);
}

/**
 * 버전을 증가시킵니다
 */
function incrementVersion(type = 'patch') {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  updateVersion(newVersion);
  return newVersion;
}

/**
 * Git 커밋 해시를 가져옵니다
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/**
 * 현재 상태를 출력합니다
 */
function showStatus() {
  const currentVersion = getCurrentVersion();
  const gitCommit = getGitCommit();
  const buildTime = new Date().toISOString();
  
  console.log('📋 현재 상태:');
  console.log(`   버전: ${currentVersion}`);
  console.log(`   빌드 시간: ${buildTime}`);
  if (gitCommit) {
    console.log(`   Git 커밋: ${gitCommit.substring(0, 8)}`);
  }
  console.log('');
}

/**
 * 도움말을 출력합니다
 */
function showHelp() {
  console.log(`
🚀 버전 관리 도구

사용법:
  node scripts/version-manager.js <명령어> [옵션]

명령어:
  status                    현재 상태 출력
  patch                     패치 버전 증가 (1.2.1 → 1.2.2)
  minor                     마이너 버전 증가 (1.2.1 → 1.3.0)
  major                     메이저 버전 증가 (1.2.1 → 2.0.0)
  set <version>             특정 버전으로 설정
  build                     버전 정보와 함께 빌드 실행
  help                      이 도움말 출력

예제:
  node scripts/version-manager.js patch
  node scripts/version-manager.js set 1.3.0
  node scripts/version-manager.js build
`);
}

/**
 * 빌드를 실행합니다
 */
function build() {
  const currentVersion = getCurrentVersion();
  console.log(`🔨 버전 ${currentVersion}으로 빌드를 시작합니다...`);
  
  try {
    execSync('npm run build:prod', { stdio: 'inherit' });
    console.log('✅ 빌드가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 빌드 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

/**
 * 메인 함수
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'status':
      showStatus();
      break;
      
    case 'patch':
      const patchVersion = incrementVersion('patch');
      console.log(`📦 패치 버전이 ${patchVersion}으로 증가했습니다.`);
      break;
      
    case 'minor':
      const minorVersion = incrementVersion('minor');
      console.log(`📦 마이너 버전이 ${minorVersion}으로 증가했습니다.`);
      break;
      
    case 'major':
      const majorVersion = incrementVersion('major');
      console.log(`📦 메이저 버전이 ${majorVersion}으로 증가했습니다.`);
      break;
      
    case 'set':
      const newVersion = args[1];
      if (!newVersion) {
        console.error('❌ 버전을 지정해주세요. 예: node scripts/version-manager.js set 1.3.0');
        process.exit(1);
      }
      updateVersion(newVersion);
      break;
      
    case 'build':
      build();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.error(`❌ 알 수 없는 명령어: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  updateVersion,
  incrementVersion,
  showStatus,
  build
};
