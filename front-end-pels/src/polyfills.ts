/**
 * 오프라인 환경을 위한 폴리필 엔트리 파일
 *
 * 이 파일은 Babel의 useBuiltIns: 'entry' 설정과 함께 사용됩니다.
 * 모든 필요한 폴리필을 빌드 타임에 포함시켜 런타임에 외부 의존성을 제거합니다.
 *
 * 사용법:
 * - main.tsx에서 이 파일을 가장 먼저 import
 * - Babel이 이 파일을 분석하여 필요한 폴리필을 모두 포함
 *
 * @version 1.2.2
 * @author PDF Formatter Team
 */

// Core-js 폴리필 전체 포함 (오프라인 환경용)
import 'core-js/stable';

// Regenerator 런타임 (async/await 지원)
import 'regenerator-runtime/runtime';

import { devLog } from './utils/devConsole';

// 추가 폴리필 (필요시)
// import 'core-js/features/array/includes';
// import 'core-js/features/object/assign';
// import 'core-js/features/promise';

devLog('🔧 오프라인 폴리필 로드 완료');
