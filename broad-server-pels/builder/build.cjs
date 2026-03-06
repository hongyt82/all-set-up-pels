/**
 * 빌드 스크립트: 번들(esbuild) + 난독화(javascript-obfuscator)
 * 산출물: dist/index.js (실행 시 .env는 프로젝트 루트(server/)에서 로드됨)
 */
const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outFile = path.join(rootDir, 'dist', 'index.js');
const debugOutFile = path.join(rootDir, 'dist', 'index.debug.js');
const releaseBundleFile = path.join(rootDir, 'dist', 'index.bundle.js');

// Node 내장 모듈 + ws 선택 의존성: 번들 제외 → ESM에서 require()가 import로 치환됨
const { builtinModules } = require('module');
const external = [
  ...builtinModules,
  'bufferutil',
  'utf-8-validate',
];

// 프로토콜·env 경로 등 런타임에서 변경되면 안 되는 문자열 (난독화 제외)
// source of truth: build/reservedStrings.json
const reservedStrings = require('./reservedStrings.json');
const { checkReservedStrings } = require('./check_reserved_strings.cjs');

const requireBanner =
  "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\n";

async function main() {
  if (!fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(path.join(rootDir, 'dist'), { recursive: true });
  }

  // reservedStrings 누락 방지: 빌드 전에 검증 (누락 시 빌드 실패)
  const { missing } = checkReservedStrings({ serverRoot: rootDir, reservedStrings });
  if (missing.length) {
    throw new Error(
      [
        '[build] Missing reservedStrings entries:',
        ...missing.map((s) => `- ${s}`),
        '',
        'Add them to: build/reservedStrings.json',
      ].join('\n')
    );
  }

  console.log('[build] Bundling (release) with esbuild...');
  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src', 'index.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile: releaseBundleFile,
    packages: 'bundle',
    external,
    sourcemap: false,
    minify: false,
    keepNames: false,
    banner: {
      js: '/* sync-server bundle - do not edit */',
    },
  });

  console.log('[build] Bundling (debug) with esbuild...');
  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src', 'index.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile: debugOutFile,
    packages: 'bundle',
    external,
    sourcemap: true,
    minify: false,
    keepNames: true,
    banner: {
      js: requireBanner + '/* sync-server debug bundle */\n',
    },
  });

  console.log('[build] Obfuscating...');
  const code = fs.readFileSync(releaseBundleFile, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: false,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 0,
    stringArrayWrappersChainedCalls: false,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 1,
    reservedStrings,
    reservedStringsThreshold: 1,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  });

  let obfuscatedCode = obfuscated.getObfuscatedCode();
  fs.writeFileSync(outFile, requireBanner + obfuscatedCode, 'utf8');

  // 중간 산출물 정리 (최종 배포물은 dist/index.js)
  try {
    fs.unlinkSync(releaseBundleFile);
  } catch {}

  console.log('[build] Done: dist/index.js');
  console.log('[build] Debug artifact: dist/index.debug.js (+ .map)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
