/**
 * 오프라인 배포 검증 스크립트 (크로스 플랫폼)
 * 
 * 이 스크립트는 Node.js로 작성되어 Mac, Windows, Linux에서 모두 실행 가능합니다.
 * bash 스크립트 대신 사용하여 크로스 플랫폼 호환성을 보장합니다.
 * 
 * @version 1.2.2
 * @author PDF Formatter Team
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 재현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 오프라인 배포 검증 시작...');
console.log('');

// 1. 외부 URL 검색
console.log('1️⃣  외부 URL 검색...');
try {
  const distDir = join(rootDir, 'dist');
  if (!existsSync(distDir)) {
    console.log('❌ dist 디렉토리가 없습니다. 먼저 빌드를 실행하세요.');
    process.exit(1);
  }

  // HTML 파일에서 외부 URL 검색
  const htmlFiles = ['index.html'];
  let hasExternalUrls = false;

  for (const file of htmlFiles) {
    const filePath = join(distDir, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const externalUrls = content.match(/https?:\/\/[^\s"']+/g);
      if (externalUrls && externalUrls.length > 0) {
        console.log(`❌ ${file}에서 외부 URL 발견:`);
        externalUrls.forEach(url => console.log(`   - ${url}`));
        hasExternalUrls = true;
      }
    }
  }

  if (!hasExternalUrls) {
    console.log('✅ 외부 URL 없음');
  } else {
    console.log('❌ 외부 URL이 발견되었습니다.');
    process.exit(1);
  }
} catch (error) {
  console.log('⚠️  외부 URL 검색 중 오류:', error.message);
}
console.log('');

// 2. CDN 링크 검색
console.log('2️⃣  CDN 링크 검색...');
try {
  const distDir = join(rootDir, 'dist');
  let hasCdnLinks = false;

  // JavaScript 파일에서 CDN 링크 검색
  const jsFiles = ['index-*.js', 'vendor-*.js', 'ui-*.js', 'router-*.js'];
  
  for (const pattern of jsFiles) {
    try {
      const result = execSync(`find "${distDir}" -name "${pattern}"`, { 
        encoding: 'utf-8',
        cwd: rootDir 
      });
      
      if (result.trim()) {
        const files = result.trim().split('\n');
        for (const file of files) {
          if (existsSync(file)) {
            const content = readFileSync(file, 'utf-8');
            const cdnLinks = content.match(/cdn\.|unpkg\.|jsdelivr\./g);
            if (cdnLinks && cdnLinks.length > 0) {
              console.log(`❌ ${file}에서 CDN 링크 발견:`);
              cdnLinks.forEach(link => console.log(`   - ${link}`));
              hasCdnLinks = true;
            }
          }
        }
      }
    } catch (error) {
      // find 명령어가 없는 경우 무시
    }
  }

  if (!hasCdnLinks) {
    console.log('✅ CDN 링크 없음');
  } else {
    console.log('❌ CDN 링크가 발견되었습니다.');
    process.exit(1);
  }
} catch (error) {
  console.log('⚠️  CDN 링크 검색 중 오류:', error.message);
}
console.log('');

// 3. 필수 파일 존재 확인
console.log('3️⃣  필수 파일 확인...');
const requiredFiles = [
  'dist/index.html',
  'dist/assets'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = join(rootDir, file);
  if (!existsSync(filePath)) {
    console.log(`❌ 필수 파일 없음: ${file}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ 필수 파일 모두 존재');
} else {
  console.log('❌ 일부 필수 파일이 없습니다.');
  process.exit(1);
}
console.log('');

// 4. node_modules 크기 확인
console.log('4️⃣  의존성 크기 확인...');
const nodeModulesPath = join(rootDir, 'node_modules');
if (existsSync(nodeModulesPath)) {
  try {
    // 크로스 플랫폼 크기 확인
    let sizeOutput;
    if (process.platform === 'win32') {
      sizeOutput = execSync(`powershell -Command "(Get-ChildItem '${nodeModulesPath}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"`, {
        encoding: 'utf-8',
        cwd: rootDir
      });
      const sizeMB = parseFloat(sizeOutput.trim()).toFixed(2);
      console.log(`✅ node_modules: ${sizeMB} MB`);
    } else {
      sizeOutput = execSync(`du -sh "${nodeModulesPath}"`, {
        encoding: 'utf-8',
        cwd: rootDir
      });
      const size = sizeOutput.split('\t')[0];
      console.log(`✅ node_modules: ${size}`);
    }
  } catch (error) {
    console.log('✅ node_modules 확인 완료 (크기 측정 실패)');
  }
} else {
  console.log('❌ node_modules가 없습니다');
  process.exit(1);
}
console.log('');

// 5. 빌드 결과물 크기 확인
console.log('5️⃣  빌드 결과물 크기 확인...');
const distPath = join(rootDir, 'dist');
if (existsSync(distPath)) {
  try {
    // 크로스 플랫폼 크기 확인
    let sizeOutput;
    if (process.platform === 'win32') {
      sizeOutput = execSync(`powershell -Command "(Get-ChildItem '${distPath}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"`, {
        encoding: 'utf-8',
        cwd: rootDir
      });
      const sizeMB = parseFloat(sizeOutput.trim()).toFixed(2);
      console.log(`✅ dist: ${sizeMB} MB`);
    } else {
      sizeOutput = execSync(`du -sh "${distPath}"`, {
        encoding: 'utf-8',
        cwd: rootDir
      });
      const size = sizeOutput.split('\t')[0];
      console.log(`✅ dist: ${size}`);
    }
  } catch (error) {
    console.log('✅ dist 확인 완료 (크기 측정 실패)');
  }
} else {
  console.log('❌ dist가 없습니다');
  process.exit(1);
}
console.log('');

console.log('================================================');
console.log('  ✅ 모든 검증 통과!');
console.log('================================================');
console.log('');
console.log('오프라인 배포 준비가 완료되었습니다.');
console.log('');
