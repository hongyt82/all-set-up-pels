/**
 * reservedStrings 누락 방지 체크.
 *
 * - build/reservedStrings.json (source of truth) 기준으로,
 * - src/ 및 config/에서 "프로토콜/환경"에 직접 영향을 주는 문자열을 추출해
 *   reservedStrings에 포함되어 있는지 검증한다.
 *
 * 목적: 기능 추가/수정 시 reservedStrings 누락으로 난독화 런타임이 깨지는 사고 방지.
 */
const fs = require('fs');
const path = require('path');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function extractWithRegex(text, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/**
 * 프로토콜/환경에 직접 영향을 주는 문자열만 추출:
 * - handlers.js switch(type) case '...'
 * - type 비교: data?.type === '...'
 * - broadcast event 비교: value.event === '...'
 * - env 파일명: '.env...', env 값: 'production'/'development'/'dev'
 */
function collectRequiredStrings({ repoRoot }) {
  const required = [];

  const handlersPath = path.join(repoRoot, 'src', 'handlers.js');
  const roomStatePath = path.join(repoRoot, 'src', 'roomState.js');
  const indexPath = path.join(repoRoot, 'src', 'index.js');
  const envPath = path.join(repoRoot, '..', 'config', 'env.js'); // repoRoot is server/build, caller passes server/build? guard below

  // Normalize if called with serverRoot instead of buildRoot
  const serverRoot =
    path.basename(repoRoot) === 'build' ? path.join(repoRoot, '..') : repoRoot;

  const safeRead = (p) => {
    try {
      return readText(p);
    } catch {
      return '';
    }
  };

  const handlers = safeRead(path.join(serverRoot, 'src', 'handlers.js'));
  const roomState = safeRead(path.join(serverRoot, 'src', 'roomState.js'));
  const index = safeRead(path.join(serverRoot, 'src', 'index.js'));
  const env = safeRead(path.join(serverRoot, 'config', 'env.js'));
  const config = safeRead(path.join(serverRoot, 'config', 'config.js'));

  // switch (type) { case 'xxx': ... }
  required.push(...extractWithRegex(handlers, /\bcase\s+['"]([^'"]+)['"]\s*:/g));

  // data?.type === 'xxx' or data.type === 'xxx'
  required.push(
    ...extractWithRegex(
      handlers + '\n' + index,
      /\bdata(?:\?\.)?\.type\s*===\s*['"]([^'"]+)['"]/g
    )
  );

  // value.event === 'xxx' (broadcast events)
  required.push(
    ...extractWithRegex(
      handlers + '\n' + roomState,
      /\bvalue(?:\?\.)?\.event\s*===\s*['"]([^'"]+)['"]/g
    )
  );

  // env file names ('.env', '.env.production', '.env.dev')
  required.push(
    ...extractWithRegex(env, /['"](\.env(?:\.[a-zA-Z0-9_-]+)?)['"]/g)
  );

  // NODE_ENV values used in code paths
  required.push(
    ...extractWithRegex(
      env + '\n' + config,
      /['"](production|development|dev)['"]/g
    )
  );

  // Protocol key names that must be stable (manual anchors)
  required.push('type', 'roomId', 'value', 'event', 'user', 'targetClientId');

  return uniq(required).filter(Boolean);
}

function checkReservedStrings({ serverRoot, reservedStrings }) {
  const required = collectRequiredStrings({ repoRoot: serverRoot });
  const reservedSet = new Set(reservedStrings);
  const missing = required.filter((s) => !reservedSet.has(s));
  return { required, missing };
}

function runCli() {
  const serverRoot = path.join(__dirname, '..');
  const reservedPath = path.join(__dirname, 'reservedStrings.json');
  const reservedStrings = JSON.parse(readText(reservedPath));
  const { missing } = checkReservedStrings({ serverRoot, reservedStrings });

  if (missing.length) {
    console.error(
      [
        '[check:reservedStrings] Missing reservedStrings entries:',
        ...missing.map((s) => `- ${s}`),
        '',
        `Add them to: ${reservedPath}`,
      ].join('\n')
    );
    process.exit(1);
  }

  console.log('[check:reservedStrings] OK');
}

module.exports = { checkReservedStrings };

if (require.main === module) {
  runCli();
}

