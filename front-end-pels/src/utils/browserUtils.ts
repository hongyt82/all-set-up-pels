/**
 * 브라우저 정보 유틸리티
 * 현재 실행 중인 브라우저의 상세 정보를 수집하고 관리
 */

import { devLog } from './devConsole';

/**
 * 브라우저 정보 인터페이스
 */
export interface BrowserInfo {
  /** 브라우저 이름 */
  name: string;
  /** 브라우저 버전 */
  version: string;
  /** 브라우저 엔진 */
  engine: string;
  /** 운영체제 */
  os: string;
  /** 운영체제 버전 */
  osVersion: string;
  /** 디바이스 타입 */
  deviceType: 'desktop' | 'mobile' | 'tablet';
  /** 화면 해상도 */
  screenResolution: string;
  /** 뷰포트 크기 */
  viewportSize: string;
  /** 색상 깊이 */
  colorDepth: number;
  /** 픽셀 비율 */
  pixelRatio: number;
  /** 언어 설정 */
  language: string;
  /** 시간대 */
  timezone: string;
  /** 쿠키 지원 여부 */
  cookieEnabled: boolean;
  /** 로컬 스토리지 지원 여부 */
  localStorageSupported: boolean;
  /** 세션 스토리지 지원 여부 */
  sessionStorageSupported: boolean;
  /** 지오로케이션 지원 여부 */
  geolocationSupported: boolean;
  /** 웹 워커 지원 여부 */
  webWorkerSupported: boolean;
  /** 서비스 워커 지원 여부 */
  serviceWorkerSupported: boolean;
  /** 터치 지원 여부 */
  touchSupported: boolean;
  /** 온라인 상태 */
  isOnline: boolean;
  /** 사용자 에이전트 */
  userAgent: string;
  /** 플랫폼 */
  platform: string;
  /** CPU 코어 수 */
  cpuCores: number;
  /** 메모리 정보 (가능한 경우) */
  memoryInfo?: {
    deviceMemory?: number;
    jsHeapSizeLimit?: number;
  };
  /** 웹GL 지원 여부 */
  webglSupported: boolean;
  /** WebRTC 지원 여부 */
  webrtcSupported: boolean;
  /** WebSocket 지원 여부 */
  websocketSupported: boolean;
  /** IndexedDB 지원 여부 */
  indexedDBSupported: boolean;
  /** Canvas 지원 여부 */
  canvasSupported: boolean;
  /** SVG 지원 여부 */
  svgSupported: boolean;
  /** CSS Grid 지원 여부 */
  cssGridSupported: boolean;
  /** Flexbox 지원 여부 */
  flexboxSupported: boolean;
  /** CSS Variables 지원 여부 */
  cssVariablesSupported: boolean;
  /** ES6 지원 여부 */
  es6Supported: boolean;
  /** Fetch API 지원 여부 */
  fetchSupported: boolean;
  /** Promise 지원 여부 */
  promiseSupported: boolean;
  /** Async/Await 지원 여부 */
  asyncAwaitSupported: boolean;
  /** 모듈 지원 여부 */
  moduleSupported: boolean;
  /** WebAssembly 지원 여부 */
  webAssemblySupported: boolean;
}

/**
 * 브라우저 감지 함수
 */
function detectBrowser(): { name: string; version: string; engine: string } {
  const userAgent = navigator.userAgent;

  // Chrome
  if (
    userAgent.includes('Chrome') &&
    !userAgent.includes('Edge') &&
    !userAgent.includes('OPR')
  ) {
    const version = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Chrome', version, engine: 'Blink' };
  }

  // Firefox
  if (userAgent.includes('Firefox')) {
    const version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Firefox', version, engine: 'Gecko' };
  }

  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Safari', version, engine: 'WebKit' };
  }

  // Edge
  if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
    const version = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Edge', version, engine: 'EdgeHTML' };
  }

  // Internet Explorer
  if (userAgent.includes('Trident')) {
    const version = userAgent.match(/rv:(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Internet Explorer', version, engine: 'Trident' };
  }

  // Opera
  if (userAgent.includes('OPR')) {
    const version = userAgent.match(/OPR\/(\d+\.\d+)/)?.[1] || 'Unknown';
    return { name: 'Opera', version, engine: 'Blink' };
  }

  return { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };
}

/**
 * 운영체제 감지 함수
 */
function detectOS(): { os: string; osVersion: string } {
  const userAgent = navigator.userAgent;

  // Windows
  if (userAgent.includes('Windows')) {
    if (userAgent.includes('Windows NT 10.0'))
      return { os: 'Windows', osVersion: '10' };
    if (userAgent.includes('Windows NT 6.3'))
      return { os: 'Windows', osVersion: '8.1' };
    if (userAgent.includes('Windows NT 6.2'))
      return { os: 'Windows', osVersion: '8' };
    if (userAgent.includes('Windows NT 6.1'))
      return { os: 'Windows', osVersion: '7' };
    return { os: 'Windows', osVersion: 'Unknown' };
  }

  // macOS
  if (userAgent.includes('Mac OS X')) {
    const version =
      userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') ||
      'Unknown';
    return { os: 'macOS', osVersion: version };
  }

  // Linux
  if (userAgent.includes('Linux')) {
    return { os: 'Linux', osVersion: 'Unknown' };
  }

  // iOS
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const version =
      userAgent.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    return { os: 'iOS', osVersion: version };
  }

  // Android
  if (userAgent.includes('Android')) {
    const version = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
    return { os: 'Android', osVersion: version };
  }

  return { os: 'Unknown', osVersion: 'Unknown' };
}

/**
 * 디바이스 타입 감지 함수
 */
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;

  // iPad는 모바일이 아닌 태블릿으로 분류
  if (
    userAgent.includes('iPad') ||
    (userAgent.includes('Mac') && 'ontouchend' in document)
  ) {
    return 'tablet';
  }

  // 모바일 감지
  if (
    userAgent.includes('Mobile') ||
    userAgent.includes('Android') ||
    userAgent.includes('iPhone')
  ) {
    return 'mobile';
  }

  // 화면 크기 기반 감지
  if (screenWidth <= 768) {
    return 'mobile';
  } else if (screenWidth <= 1024) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * 기능 지원 여부 감지 함수
 */
function detectFeatureSupport() {
  return {
    cookieEnabled: navigator.cookieEnabled,
    localStorageSupported:
      typeof Storage !== 'undefined' && !!window.localStorage,
    sessionStorageSupported:
      typeof Storage !== 'undefined' && !!window.sessionStorage,
    geolocationSupported: 'geolocation' in navigator,
    webWorkerSupported: typeof Worker !== 'undefined',
    serviceWorkerSupported: 'serviceWorker' in navigator,
    touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isOnline: navigator.onLine,
    webglSupported: !!document.createElement('canvas').getContext('webgl'),
    webrtcSupported: !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ),
    websocketSupported: typeof WebSocket !== 'undefined',
    indexedDBSupported: 'indexedDB' in window,
    canvasSupported: !!document.createElement('canvas').getContext('2d'),
    svgSupported: !!document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    ),
    cssGridSupported: CSS.supports('display', 'grid'),
    flexboxSupported: CSS.supports('display', 'flex'),
    cssVariablesSupported: CSS.supports('--custom-property', 'value'),
    es6Supported: typeof Symbol !== 'undefined',
    fetchSupported: typeof fetch !== 'undefined',
    promiseSupported: typeof Promise !== 'undefined',
    asyncAwaitSupported: (async () => {}).constructor.name === 'AsyncFunction',
    moduleSupported: 'noModule' in HTMLScriptElement.prototype,
    webAssemblySupported: typeof WebAssembly !== 'undefined',
  };
}

/**
 * 메모리 정보 가져오기 (가능한 경우)
 */
function getMemoryInfo() {
  const memoryInfo: any = {};

  // Device Memory API (실험적)
  if ('deviceMemory' in navigator) {
    memoryInfo.deviceMemory = (navigator as any).deviceMemory;
  }

  // Performance Memory API (Chrome)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    memoryInfo.jsHeapSizeLimit = memory.jsHeapSizeLimit;
  }

  return Object.keys(memoryInfo).length > 0 ? memoryInfo : undefined;
}

/**
 * 현재 브라우저 정보를 가져옵니다
 */
export const getBrowserInfo = (): BrowserInfo => {
  const browser = detectBrowser();
  const os = detectOS();
  const deviceType = detectDeviceType();
  const features = detectFeatureSupport();
  const memoryInfo = getMemoryInfo();

  return {
    ...browser,
    ...os,
    deviceType,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    cpuCores: navigator.hardwareConcurrency || 1,
    memoryInfo,
    ...features,
  };
};

/**
 * 브라우저 정보를 포맷팅합니다
 */
export const formatBrowserInfo = (
  info: BrowserInfo,
  format: 'short' | 'detailed' | 'minimal' = 'short'
): string => {
  switch (format) {
    case 'minimal':
      return `${info.name} ${info.version}`;
    case 'short':
      return `${info.name} ${info.version} on ${info.os} ${info.osVersion}`;
    case 'detailed':
      return `${info.name} ${info.version} (${info.engine}) on ${info.os} ${info.osVersion} - ${info.screenResolution}`;
    default:
      return `${info.name} ${info.version}`;
  }
};

/**
 * 브라우저 호환성 점수 계산
 */
export const calculateCompatibilityScore = (info: BrowserInfo): number => {
  let score = 0;
  const maxScore = 20; // 총 20개 기능

  const features = [
    info.localStorageSupported,
    info.sessionStorageSupported,
    info.webWorkerSupported,
    info.serviceWorkerSupported,
    info.webglSupported,
    info.webrtcSupported,
    info.websocketSupported,
    info.indexedDBSupported,
    info.canvasSupported,
    info.svgSupported,
    info.cssGridSupported,
    info.flexboxSupported,
    info.cssVariablesSupported,
    info.es6Supported,
    info.fetchSupported,
    info.promiseSupported,
    info.asyncAwaitSupported,
    info.moduleSupported,
    info.webAssemblySupported,
    info.touchSupported,
  ];

  features.forEach(feature => {
    if (feature) score++;
  });

  return Math.round((score / maxScore) * 100);
};

/**
 * 브라우저 정보를 JSON으로 반환합니다
 */
export const getBrowserInfoAsJson = (): string => {
  const info = getBrowserInfo();
  return JSON.stringify(info, null, 2);
};

/**
 * 브라우저 정보를 콘솔에 출력합니다 (개발용)
 */
export const logBrowserInfo = (): void => {
  const info = getBrowserInfo();
  const score = calculateCompatibilityScore(info);

  devLog('🌐 Browser Information:');
  devLog(`   Browser: ${info.name} ${info.version}`);
  devLog(`   Engine: ${info.engine}`);
  devLog(`   OS: ${info.os} ${info.osVersion}`);
  devLog(`   Device: ${info.deviceType}`);
  devLog(`   Screen: ${info.screenResolution}`);
  devLog(`   Viewport: ${info.viewportSize}`);
  devLog(`   Language: ${info.language}`);
  devLog(`   Timezone: ${info.timezone}`);
  devLog(`   Online: ${info.isOnline ? 'Yes' : 'No'}`);
  devLog(`   Compatibility Score: ${score}%`);
};

/**
 * 브라우저 정보 변경 감지 (화면 크기, 온라인 상태 등)
 */
export const watchBrowserChanges = (callback: (info: BrowserInfo) => void) => {
  const updateInfo = () => callback(getBrowserInfo());

  // 화면 크기 변경 감지
  window.addEventListener('resize', updateInfo);

  // 온라인 상태 변경 감지
  window.addEventListener('online', updateInfo);
  window.addEventListener('offline', updateInfo);

  // 방향 변경 감지 (모바일)
  window.addEventListener('orientationchange', updateInfo);

  return () => {
    window.removeEventListener('resize', updateInfo);
    window.removeEventListener('online', updateInfo);
    window.removeEventListener('offline', updateInfo);
    window.removeEventListener('orientationchange', updateInfo);
  };
};

/**
 * 브라우저 정보 비교
 */
export const compareBrowserInfo = (info1: BrowserInfo, info2: BrowserInfo) => {
  return {
    sameBrowser: info1.name === info2.name && info1.version === info2.version,
    sameOS: info1.os === info2.os && info1.osVersion === info2.osVersion,
    sameDeviceType: info1.deviceType === info2.deviceType,
    sameScreenResolution: info1.screenResolution === info2.screenResolution,
  };
};

/**
 * 브라우저 정보 필터링
 */
export const filterBrowserInfo = (
  info: BrowserInfo,
  includeFeatures: boolean = true
) => {
  if (!includeFeatures) {
    const {
      cookieEnabled,
      localStorageSupported,
      sessionStorageSupported,
      geolocationSupported,
      webWorkerSupported,
      serviceWorkerSupported,
      touchSupported,
      isOnline,
      webglSupported,
      webrtcSupported,
      websocketSupported,
      indexedDBSupported,
      canvasSupported,
      svgSupported,
      cssGridSupported,
      flexboxSupported,
      cssVariablesSupported,
      es6Supported,
      fetchSupported,
      promiseSupported,
      asyncAwaitSupported,
      moduleSupported,
      webAssemblySupported,
      ...basicInfo
    } = info;
    return basicInfo;
  }
  return info;
};

/**
 * 기본 내보내기 - 가장 자주 사용되는 함수들
 */
export default {
  getBrowserInfo,
  formatBrowserInfo,
  calculateCompatibilityScore,
  logBrowserInfo,
  watchBrowserChanges,
};
