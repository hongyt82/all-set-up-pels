/**
 * 버전 관리 유틸리티
 * package.json의 version을 기반으로 앱 버전 정보를 관리
 */

// package.json에서 버전 정보를 가져오기 위한 import
// 빌드 시점에 Vite가 이 값을 주입합니다
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
declare const __GIT_COMMIT__: string;

/**
 * 앱 버전 정보 인터페이스
 */
export interface AppVersionInfo {
  /** 메이저 버전 (1) */
  major: number;
  /** 마이너 버전 (2) */
  minor: number;
  /** 패치 버전 (1) */
  patch: number;
  /** 전체 버전 문자열 (1.2.1) */
  full: string;
  /** 빌드 시간 */
  buildTime: string;
  /** Git 커밋 해시 (선택적) */
  gitCommit?: string;
  /** 환경 정보 */
  environment: 'development' | 'production' | 'localdev';
  /** 배포 날짜 (빌드 시간에서 추출) */
  deployDate: string;
  /** 버전 타입 (stable, beta, alpha 등) */
  versionType: 'stable' | 'beta' | 'alpha' | 'dev';
}

/**
 * package.json에서 버전 정보를 가져옵니다
 * 빌드 시점에 Vite가 __APP_VERSION__을 주입합니다
 */
const getVersionFromPackage = (): string => {
  // 빌드 시점에 주입된 버전 정보 사용
  if (typeof __APP_VERSION__ !== 'undefined') {
    return __APP_VERSION__;
  }

  // 개발 환경에서는 기본값 사용
  return '1.2.1';
};

/**
 * 빌드 시간을 가져옵니다
 */
const getBuildTime = (): string => {
  if (typeof __BUILD_TIME__ !== 'undefined') {
    return __BUILD_TIME__;
  }

  // 개발 환경에서는 현재 시간 사용
  return new Date().toISOString();
};

/**
 * Git 커밋 해시를 가져옵니다
 */
const getGitCommit = (): string | undefined => {
  if (typeof __GIT_COMMIT__ !== 'undefined') {
    return __GIT_COMMIT__;
  }

  return undefined;
};

/**
 * 현재 환경을 감지합니다
 */
const getCurrentEnvironment = (): 'development' | 'production' | 'localdev' => {
  if (import.meta.env.MODE === 'production') {
    return 'production';
  } else if (import.meta.env.MODE === 'localdev') {
    return 'localdev';
  } else {
    return 'development';
  }
};

/**
 * 버전 문자열을 파싱합니다
 * @param versionString - 파싱할 버전 문자열 (예: "1.2.1", "1.2.1-beta.1")
 * @returns 파싱된 버전 정보
 */
export const parseVersion = (
  versionString: string
): { major: number; minor: number; patch: number; prerelease?: string } => {
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
  const match = versionString.match(versionRegex);

  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
};

/**
 * 버전 타입을 결정합니다
 * @param versionString - 버전 문자열
 * @returns 버전 타입
 */
export const getVersionType = (
  versionString: string
): 'stable' | 'beta' | 'alpha' | 'dev' => {
  if (versionString.includes('alpha')) return 'alpha';
  if (versionString.includes('beta')) return 'beta';
  if (versionString.includes('dev')) return 'dev';
  return 'stable';
};

/**
 * 현재 앱 버전 정보를 가져옵니다
 * @returns 앱 버전 정보
 */
export const getAppVersion = (): AppVersionInfo => {
  const versionString = getVersionFromPackage();
  const buildTime = getBuildTime();
  const gitCommit = getGitCommit();
  const environment = getCurrentEnvironment();

  const parsedVersion = parseVersion(versionString);
  const versionType = getVersionType(versionString);

  // 빌드 시간에서 날짜 추출
  const deployDate = new Date(buildTime).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    major: parsedVersion.major,
    minor: parsedVersion.minor,
    patch: parsedVersion.patch,
    full: versionString,
    buildTime: buildTime,
    gitCommit: gitCommit,
    environment: environment,
    deployDate: deployDate,
    versionType: versionType,
  };
};

/**
 * 버전 비교 함수
 * @param version1 - 비교할 버전 1
 * @param version2 - 비교할 버전 2
 * @returns -1 (version1 < version2), 0 (version1 === version2), 1 (version1 > version2)
 */
export const compareVersions = (version1: string, version2: string): number => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  // 메이저 버전 비교
  if (v1.major !== v2.major) {
    return v1.major - v2.major;
  }

  // 마이너 버전 비교
  if (v1.minor !== v2.minor) {
    return v1.minor - v2.minor;
  }

  // 패치 버전 비교
  if (v1.patch !== v2.patch) {
    return v1.patch - v2.patch;
  }

  // 프리릴리즈 버전 비교
  if (v1.prerelease && !v2.prerelease) return -1;
  if (!v1.prerelease && v2.prerelease) return 1;
  if (v1.prerelease && v2.prerelease) {
    return v1.prerelease.localeCompare(v2.prerelease);
  }

  return 0;
};

/**
 * 버전이 특정 버전보다 높은지 확인
 * @param currentVersion - 현재 버전
 * @param targetVersion - 비교할 버전
 * @returns true if currentVersion > targetVersion
 */
export const isVersionGreater = (
  currentVersion: string,
  targetVersion: string
): boolean => {
  return compareVersions(currentVersion, targetVersion) > 0;
};

/**
 * 버전이 특정 버전보다 낮은지 확인
 * @param currentVersion - 현재 버전
 * @param targetVersion - 비교할 버전
 * @returns true if currentVersion < targetVersion
 */
export const isVersionLower = (
  currentVersion: string,
  targetVersion: string
): boolean => {
  return compareVersions(currentVersion, targetVersion) < 0;
};

/**
 * 버전이 특정 범위에 있는지 확인
 * @param currentVersion - 현재 버전
 * @param minVersion - 최소 버전
 * @param maxVersion - 최대 버전
 * @returns true if minVersion <= currentVersion <= maxVersion
 */
export const isVersionInRange = (
  currentVersion: string,
  minVersion: string,
  maxVersion: string
): boolean => {
  return (
    compareVersions(currentVersion, minVersion) >= 0 &&
    compareVersions(currentVersion, maxVersion) <= 0
  );
};

/**
 * 버전 정보를 포맷팅합니다
 * @param versionInfo - 버전 정보
 * @param format - 포맷 타입
 * @returns 포맷된 버전 문자열
 */
export const formatVersion = (
  versionInfo: AppVersionInfo,
  format: 'short' | 'full' | 'detailed' = 'short'
): string => {
  switch (format) {
    case 'short':
      return versionInfo.full;
    case 'full':
      return `${versionInfo.full} (${versionInfo.environment})`;
    case 'detailed':
      return `${versionInfo.full} - ${versionInfo.deployDate} (${versionInfo.environment})`;
    default:
      return versionInfo.full;
  }
};

/**
 * 버전 배지 색상을 결정합니다
 * @param versionInfo - 버전 정보
 * @returns CSS 클래스명
 */
export const getVersionBadgeColor = (versionInfo: AppVersionInfo): string => {
  switch (versionInfo.versionType) {
    case 'stable':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'beta':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'alpha':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dev':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * 버전 정보를 콘솔에 출력합니다 (개발용)
 */
export const logVersionInfo = (): void => {
  const versionInfo = getAppVersion();

  console.log('🚀 App Version Info:');
  console.log(`   Version: ${versionInfo.full}`);
  console.log(`   Type: ${versionInfo.versionType}`);
  console.log(`   Environment: ${versionInfo.environment}`);
  console.log(`   Build Time: ${versionInfo.buildTime}`);
  console.log(`   Deploy Date: ${versionInfo.deployDate}`);
  if (versionInfo.gitCommit) {
    console.log(`   Git Commit: ${versionInfo.gitCommit}`);
  }
};

/**
 * 버전 정보를 JSON으로 반환합니다
 */
export const getVersionAsJson = (): string => {
  const versionInfo = getAppVersion();
  return JSON.stringify(versionInfo, null, 2);
};

/**
 * React 컴포넌트에서 사용할 수 있는 버전 훅
 */
export const useAppVersion = () => {
  return getAppVersion();
};

/**
 * 버전 업데이트 체크 (미래 확장용)
 * @param currentVersion - 현재 버전
 * @param latestVersion - 최신 버전
 * @returns 업데이트 필요 여부
 */
export const checkForUpdates = (
  currentVersion: string,
  latestVersion: string
): {
  hasUpdate: boolean;
  isMajorUpdate: boolean;
  isMinorUpdate: boolean;
  isPatchUpdate: boolean;
} => {
  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);

  const hasUpdate = isVersionGreater(latestVersion, currentVersion);
  const isMajorUpdate = hasUpdate && current.major < latest.major;
  const isMinorUpdate =
    hasUpdate && !isMajorUpdate && current.minor < latest.minor;
  const isPatchUpdate = hasUpdate && !isMajorUpdate && !isMinorUpdate;

  return {
    hasUpdate,
    isMajorUpdate,
    isMinorUpdate,
    isPatchUpdate,
  };
};

/**
 * 기본 내보내기 - 가장 자주 사용되는 함수들
 */
export default {
  getAppVersion,
  parseVersion,
  compareVersions,
  formatVersion,
  logVersionInfo,
};
