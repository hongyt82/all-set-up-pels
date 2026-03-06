/**
 * PDF Formatter - 오프라인 배포용 패키지 생성 스크립트
 *
 * 이 스크립트는 외부 네트워크 없이 배포 가능한 완전한 패키지를 생성합니다.
 *
 * 포함 내용:
 * - 전체 소스 코드
 * - node_modules (완전 설치됨)
 * - 빌드 결과물 (dist/)
 * - 설치 스크립트 (Linux/Windows)
 * - 문서 및 가이드
 *
 * 사용법:
 *   node scripts/package-offline.js
 *
 * 또는:
 *   npm run package:offline
 *
 * @version 1.2.2
 * @author PDF Formatter Team
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 재현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// package.json 읽기
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;
const packageName = `pdf-formatter-offline-v${version}`;
const outputDir = join(rootDir, 'dist-offline');

console.log('╔═════════════════════════════════════���══════════════════╗');
console.log('║   PDF Formatter - 오프라인 패키지 생성                 ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📦 패키지명: ${packageName}`);
console.log(`📋 버전: ${version}`);
console.log(`📁 출력 경로: ${outputDir}`);
console.log('');

// 출력 디렉토리 생성
if (!existsSync(outputDir)) {
  console.log('📂 출력 디렉토리 생성...');
  mkdirSync(outputDir, { recursive: true });
  console.log('✅ 완료\n');
}

// 1. 클린 빌드
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1️⃣  프로덕션 빌드');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
try {
  console.log('🏗️  npm run build 실행 중...');
  execSync('npm run build', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log('✅ 빌드 완료\n');
} catch (error) {
  console.error('❌ 빌드 실패:', error.message);
  process.exit(1);
}

// 2. node_modules 설치 확인
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2️⃣  의존성 확인');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const nodeModulesPath = join(rootDir, 'node_modules');
if (!existsSync(nodeModulesPath)) {
  console.log('📦 node_modules가 없습니다. 설치 중...');
  try {
    execSync('npm install', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ 설치 완료\n');
  } catch (error) {
    console.error('❌ 설치 실패:', error.message);
    process.exit(1);
  }
} else {
  // node_modules 크기 확인
  try {
    const sizeOutput = execSync(`du -sh "${nodeModulesPath}"`, {
      cwd: rootDir,
      encoding: 'utf-8',
    });
    const size = sizeOutput.split('\t')[0];
    console.log(`✅ node_modules 확인 완료 (크기: ${size})\n`);
  } catch (error) {
    console.log('✅ node_modules 확인 완료\n');
  }
}

// 3. 오프라인 설치 스크립트 생성
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('3️⃣  설치 스크립트 생성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Linux/Mac 스크립트
const linuxScript = `#!/bin/bash
# PDF Formatter - 오프라인 설치 스크립트 (Linux/Mac)
# 버전: ${version}
# 생성일: ${new Date().toISOString().split('T')[0]}

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   PDF Formatter v${version} - 오프라인 설치            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Node.js 버전 확인
echo "🔍 Node.js 버전 확인..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "   Node.js 20 이상이 필요합니다."
    echo "   설치: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "   현재 버전: v$(node --version | cut -d'v' -f2)"

if [ "\$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 이상이 필요합니다. (현재: v\$NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js 버전 확인 완료"
echo ""

# 의존성 확인
echo "📦 의존성 확인..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules가 이미 포함되어 있습니다."
  
  # 크기 확인
  SIZE=\$(du -sh node_modules | cut -f1)
  echo "   크기: \$SIZE"
else
  echo "❌ node_modules가 없습니다."
  echo "   온라인 환경에서 다시 패키징하세요."
  exit 1
fi
echo ""

# 빌드 결과물 확인
echo "🏗️  빌드 결과물 확인..."
if [ -d "dist" ]; then
  echo "✅ 빌드 결과물이 이미 포함되어 있습니다."
  
  # 크기 확인
  SIZE=\$(du -sh dist | cut -f1)
  echo "   크기: \$SIZE"
else
  echo "⚠️  빌드 결과물이 없습니다."
  echo "   로컬 빌드를 실행합니다..."
  
  if npm run build; then
    echo "✅ 빌드 완료"
  else
    echo "❌ 빌드 실패"
    exit 1
  fi
fi
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ 설치 완료!                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "다음 명령어로 서비스를 시작하세요:"
echo ""
echo "  📋 개발 서버 실행:"
echo "     npm run dev"
echo ""
echo "  📋 프로덕션 미리보기:"
echo "     npm run preview"
echo ""
echo "  📋 웹 서버 배포:"
echo "     dist/ 디렉토리를 Nginx/Apache 루트로 복사"
echo ""
echo "자세한 내용은 docs/OFFLINE_DEPLOYMENT.md를 참고하세요."
echo ""
`;

writeFileSync(join(rootDir, 'offline-install.sh'), linuxScript);
console.log('✅ offline-install.sh 생성');

// Windows 스크립트
const windowsScript = `@echo off
REM PDF Formatter - 오프라인 설치 스크립트 (Windows)
REM 버전: ${version}
REM 생성일: ${new Date().toISOString().split('T')[0]}

echo ╔════════════════════════════════════════════════════════╗
echo ║   PDF Formatter v${version} - 오프라인 설치            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Node.js 버전 확인
echo 🔍 Node.js 버전 확인...
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js가 설치되지 않았습니다.
  echo    Node.js 20 이상이 필요합니다.
  echo    설치: https://nodejs.org/
  exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 20 (
  echo ❌ Node.js 20 이상이 필요합니다.
  exit /b 1
)

node --version
echo ✅ Node.js 버전 확인 완료
echo.

REM 의존성 확인
echo 📦 의존성 확인...
if exist "node_modules" (
  echo ✅ node_modules가 이미 포함되어 있습니다.
) else (
  echo ❌ node_modules가 없습니다.
  echo    온라인 환경에서 다시 패키징하세요.
  exit /b 1
)
echo.

REM 빌드 결과물 확인
echo 🏗️ 빌드 결과물 확인...
if exist "dist" (
  echo ✅ 빌드 결과물이 이미 포함되어 있습니다.
) else (
  echo ⚠️ 빌드 결과물이 없습니다.
  echo    로컬 빌드를 실행합니다...
  
  call npm run build
  if errorlevel 1 (
    echo ❌ 빌드 실패
    exit /b 1
  )
  echo ✅ 빌드 완료
)
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║   ✅ 설치 완료!                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 다음 명령어로 서비스를 시작하세요:
echo.
echo   📋 개발 서버 실행:
echo      npm run dev
echo.
echo   📋 프로덕션 미리보기:
echo      npm run preview
echo.
echo   📋 웹 서버 배포:
echo      dist\\ 디렉토리를 Nginx/Apache 루트로 복사
echo.
echo 자세한 내용은 docs\\OFFLINE_DEPLOYMENT.md를 참고하세요.
echo.
pause
`;

writeFileSync(join(rootDir, 'offline-install.bat'), windowsScript);
console.log('✅ offline-install.bat 생성');

// 실행 권한 부여 (Linux/Mac)
try {
  execSync('chmod +x offline-install.sh', { cwd: rootDir });
  console.log('✅ 실행 권한 부여\n');
} catch (error) {
  // Windows 환경에서는 무시
  console.log('⚠️  실행 권한 설정 생략 (Windows 환경)\n');
}

// 4. 패키징할 파일 목록
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('4️⃣  패키지 압축');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const filesToInclude = [
  // 소스 코드
  'src',
  'public',
  'scripts',

  // 설정 파일
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  '.prettierrc',
  'eslint.config.js',

  // 진입점
  'index.html',

  // 의존성 (핵심!)
  'node_modules',

  // 빌드 결과물
  'dist',

  // 문서
  'README.md',

  // 오프라인 설치 스크립트
  'offline-install.sh',
  'offline-install.bat',
];

// tar.gz 생성
const tarballName = `${packageName}.tar.gz`;
const tarballPath = join(outputDir, tarballName);

console.log(`📦 압축 파일 생성 중: ${tarballName}`);
console.log(`   포함 항목: ${filesToInclude.length}개`);

// 제외할 파일 패턴
const excludePatterns = [
  '--exclude=.git',
  '--exclude=.vscode',
  '--exclude=.idea',
  '--exclude=dist-offline',
  '--exclude=*.log',
  '--exclude=.DS_Store',
  '--exclude=Thumbs.db',
];

const tarCommand = `tar ${excludePatterns.join(' ')} -czf "${tarballPath}" ${filesToInclude.join(' ')}`;

try {
  execSync(tarCommand, {
    cwd: rootDir,
    stdio: 'pipe',
    maxBuffer: 1024 * 1024 * 100, // 100MB 버퍼
  });
  console.log('✅ 압축 완료\n');
} catch (error) {
  console.error('❌ 압축 실패:', error.message);
  console.error('\n대안: 수동으로 압축하세요.');
  console.error(`   Windows: 7-Zip, WinRAR 등 사용`);
  console.error(
    `   Linux/Mac: tar -czf ${tarballName} ${filesToInclude.join(' ')}`
  );
  process.exit(1);
}

// 5. 체크섬 생성 (무결성 검증용)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('5️⃣  체크섬 생성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const checksumPath = `${tarballPath}.sha256`;

try {
  // Linux/Mac
  const checksumCommand = `sha256sum "${tarballPath}" > "${checksumPath}"`;
  execSync(checksumCommand, { cwd: rootDir });
  console.log('✅ SHA256 체크섬 생성 (Linux/Mac)\n');
} catch (error) {
  try {
    // Windows (PowerShell)
    const checksumCommand = `powershell -Command "Get-FileHash '${tarballPath}' -Algorithm SHA256 | Select-Object -ExpandProperty Hash > '${checksumPath}'"`;
    execSync(checksumCommand, { cwd: rootDir });
    console.log('✅ SHA256 체크섬 생성 (Windows)\n');
  } catch (error2) {
    console.log('⚠️  체크섬 생성 실패 (선택사항)\n');
  }
}

// 6. 크기 확인
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('6️⃣  결과 확인');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  const sizeOutput = execSync(`du -sh "${tarballPath}"`, {
    cwd: rootDir,
    encoding: 'utf-8',
  });
  const size = sizeOutput.split('\t')[0];
  console.log(`📊 패키지 크기: ${size}`);
} catch (error) {
  try {
    // Windows
    const stats = execSync(
      `powershell -Command "(Get-Item '${tarballPath}').Length / 1MB"`,
      {
        cwd: rootDir,
        encoding: 'utf-8',
      }
    );
    const sizeMB = parseFloat(stats).toFixed(2);
    console.log(`📊 패키지 크기: ${sizeMB} MB`);
  } catch (error2) {
    console.log('📊 패키지 크기: (확인 불가)');
  }
}

console.log('');

// 7. 완료 메시지
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   ✅ 오프라인 패키지 생성 완료!                       ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📁 출력 경로: ${outputDir}`);
console.log(`📦 패키지: ${tarballName}`);
console.log(`🔐 체크섬: ${tarballName}.sha256`);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 다음 단계');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('1️⃣  패키지 전송:');
console.log('   - USB/DVD/내부망으로 패키지 전송');
console.log(`   - 파일: ${tarballPath}`);
console.log('');
console.log('2️⃣  오프라인 환경 설치:');
console.log('   - tar -xzf ' + tarballName);
console.log('   - cd ' + packageName);
console.log('   - ./offline-install.sh (Linux/Mac)');
console.log('   - offline-install.bat (Windows)');
console.log('');
console.log('3️⃣  서비스 시작:');
console.log('   - npm run dev (개발 서버)');
console.log('   - npm run preview (프로덕션 미리보기)');
console.log('   - dist/를 웹 서버에 배포');
console.log('');
console.log('📖 자세한 내용: docs/OFFLINE_DEPLOYMENT.md');
console.log('');
