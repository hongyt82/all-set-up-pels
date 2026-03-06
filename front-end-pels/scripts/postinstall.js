/**
 * Post-install 스크립트 (크로스 플랫폼)
 * 
 * npm install 후 자동으로 실행되는 스크립트입니다.
 * Mac, Windows, Linux 환경에서 모두 호환되도록 작성되었습니다.
 * 
 * @version 1.2.2
 * @author PDF Formatter Team
 */

import { execSync } from 'child_process';
import { existsSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 재현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Post-install 설정 중...');

try {
  // 1. 실행 권한 설정 (Unix 계열 시스템에서만)
  if (process.platform !== 'win32') {
    const scriptsToChmod = [
      'offline-install.sh',
      'scripts/verify-offline.sh'
    ];

    for (const script of scriptsToChmod) {
      const scriptPath = join(rootDir, script);
      if (existsSync(scriptPath)) {
        try {
          chmodSync(scriptPath, '755');
          console.log(`✅ 실행 권한 설정: ${script}`);
        } catch (error) {
          console.log(`⚠️  실행 권한 설정 실패: ${script} - ${error.message}`);
        }
      }
    }
  }

  // 2. Git 설정 확인 및 안내
  try {
    const gitConfig = execSync('git config --list', { 
      encoding: 'utf-8',
      cwd: rootDir 
    });
    
    const hasAutoCrlf = gitConfig.includes('core.autocrlf');
    const hasEol = gitConfig.includes('core.eol');
    
    if (!hasAutoCrlf && !hasEol) {
      console.log('📝 Git 설정 안내:');
      console.log('   크로스 플랫폼 호환성을 위해 다음 Git 설정을 권장합니다:');
      console.log('   git config core.autocrlf input');
      console.log('   git config core.safecrlf true');
      console.log('');
    }
  } catch (error) {
    // Git이 설치되지 않은 경우 무시
  }

  // 3. 환경별 설정 확인
  const platform = process.platform;
  const nodeVersion = process.version;
  
  console.log(`✅ 플랫폼: ${platform}`);
  console.log(`✅ Node.js 버전: ${nodeVersion}`);
  
  // 4. 필수 디렉토리 확인
  const requiredDirs = ['src', 'public', 'scripts'];
  for (const dir of requiredDirs) {
    const dirPath = join(rootDir, dir);
    if (existsSync(dirPath)) {
      console.log(`✅ 디렉토리 확인: ${dir}`);
    } else {
      console.log(`❌ 필수 디렉토리 없음: ${dir}`);
    }
  }

  console.log('');
  console.log('🎉 Post-install 설정 완료!');
  console.log('');
  console.log('다음 명령어로 개발을 시작하세요:');
  console.log('  npm run dev     - 개발 서버 시작');
  console.log('  npm run build   - 프로덕션 빌드');
  console.log('  npm run preview - 빌드 결과 미리보기');
  console.log('');

} catch (error) {
  console.error('❌ Post-install 실행 중 오류:', error.message);
  process.exit(1);
}
