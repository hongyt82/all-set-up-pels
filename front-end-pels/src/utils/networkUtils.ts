/**
 * 네트워크 상태 모니터링 유틸리티
 * react-use를 활용한 실시간 네트워크 연결 상태 감지 및 관리
 */

import { useNetworkState } from 'react-use';

/**
 * 네트워크 상태 정보 인터페이스
 */
export interface NetworkState {
  /** 온라인 상태 */
  isOnline: boolean;
  /** 네트워크 연결 상태 */
  isConnected: boolean;
  /** 연결 타입 (wifi, cellular, ethernet 등) */
  connectionType: string;
  /** 다운로드 속도 (Mbps) */
  downlink: number;
  /** 업로드 속도 (Mbps) */
  uplink: number;
  /** RTT (Round Trip Time) */
  rtt: number;
  /** 효과적인 연결 타입 */
  effectiveType: string;
  /** 네트워크 상태 변경 시간 */
  lastChanged: Date;
  /** 연결 상태 변경 횟수 */
  changeCount: number;
}

/**
 * 네트워크 연결 품질 등급
 */
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

/**
 * 네트워크 상태 변경 이벤트 타입
 */
export type NetworkChangeEvent = {
  type: 'online' | 'offline' | 'quality_change';
  timestamp: Date;
  previousState?: NetworkState;
  currentState: NetworkState;
};

/**
 * 네트워크 상태 변경 콜백 함수 타입
 */
export type NetworkChangeCallback = (event: NetworkChangeEvent) => void;

/**
 * 네트워크 품질 평가 함수
 */
export const getNetworkQuality = (state: NetworkState): NetworkQuality => {
  if (!state.isOnline || !state.isConnected) {
    return 'offline';
  }

  const { downlink, rtt, effectiveType } = state;

  // RTT 기반 평가
  if (rtt > 200) return 'poor';
  if (rtt > 100) return 'fair';

  // 다운로드 속도 기반 평가
  if (downlink < 1) return 'poor';
  if (downlink < 5) return 'fair';
  if (downlink < 10) return 'good';

  // 효과적인 연결 타입 기반 평가
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'poor';
  if (effectiveType === '3g') return 'fair';
  if (effectiveType === '4g') return 'good';

  return 'excellent';
};

/**
 * 네트워크 품질에 따른 색상 반환
 */
export const getNetworkQualityColor = (quality: NetworkQuality): string => {
  switch (quality) {
    case 'excellent':
      return 'text-green-600';
    case 'good':
      return 'text-blue-600';
    case 'fair':
      return 'text-yellow-600';
    case 'poor':
      return 'text-orange-600';
    case 'offline':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * 네트워크 품질에 따른 배지 색상 반환
 */
export const getNetworkQualityBadgeColor = (
  quality: NetworkQuality
): string => {
  switch (quality) {
    case 'excellent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'poor':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'offline':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * 네트워크 상태를 포맷팅하는 함수
 */
export const formatNetworkState = (state: NetworkState): string => {
  if (!state.isOnline) {
    return '오프라인';
  }

  const quality = getNetworkQuality(state);
  const qualityText = {
    excellent: '우수',
    good: '양호',
    fair: '보통',
    poor: '불량',
    offline: '오프라인',
  }[quality];

  return `${qualityText} (${state.downlink}Mbps, ${state.rtt}ms)`;
};

/**
 * 네트워크 상태 변경 감지 훅
 */
export const useNetworkMonitoring = () => {
  const networkState = useNetworkState();
  const isOnline = networkState.online ?? false;

  return {
    isOnline,
    networkState,
    quality: getNetworkQuality({
      isOnline,
      isConnected: networkState.online ?? false,
      connectionType: networkState.type || 'unknown',
      downlink: networkState.downlink || 0,
      uplink: 0, // react-use의 useNetworkState에는 uplink 속성이 없음
      rtt: networkState.rtt || 0,
      effectiveType: networkState.effectiveType || 'unknown',
      lastChanged: new Date(),
      changeCount: 0,
    }),
  };
};

/**
 * 네트워크 연결 상태 확인 함수
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // 간단한 ping 테스트 (HEAD 요청)
    const response = await fetch(window.location.origin, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });
    return response.ok;
  } catch (error) {
    console.warn('네트워크 연결 확인 실패:', error);
    return false;
  }
};

/**
 * 네트워크 품질 테스트 함수
 */
export const testNetworkQuality = async (): Promise<{
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  success: boolean;
}> => {
  const startTime = performance.now();

  try {
    // 작은 이미지 다운로드 테스트
    const testImageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;

    const response = await fetch(testImageUrl, {
      cache: 'no-cache',
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    const endTime = performance.now();
    const latency = endTime - startTime;

    if (response.ok) {
      const blob = await response.blob();
      const downloadSpeed = (blob.size * 8) / (latency / 1000) / 1000000; // Mbps

      return {
        latency: Math.round(latency),
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        uploadSpeed: 0, // 업로드 테스트는 별도 구현 필요
        success: true,
      };
    }

    return {
      latency: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      success: false,
    };
  } catch (error) {
    console.warn('네트워크 품질 테스트 실패:', error);
    return {
      latency: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      success: false,
    };
  }
};

/**
 * 데이터 전송 전 네트워크 상태 검증 함수
 */
export const validateNetworkBeforeSend = async (): Promise<{
  canSend: boolean;
  reason?: string;
  quality: NetworkQuality;
  recommendation?: string;
}> => {
  const isOnline = navigator.onLine;

  if (!isOnline) {
    return {
      canSend: false,
      reason: '네트워크 연결이 끊어졌습니다.',
      quality: 'offline',
      recommendation: '네트워크 연결을 확인하고 다시 시도해주세요.',
    };
  }

  // 네트워크 품질 테스트
  const qualityTest = await testNetworkQuality();

  if (!qualityTest.success) {
    return {
      canSend: false,
      reason: '네트워크 품질 테스트에 실패했습니다.',
      quality: 'poor',
      recommendation: '네트워크 연결을 확인하고 잠시 후 다시 시도해주세요.',
    };
  }

  const { latency, downloadSpeed } = qualityTest;

  // 품질 기준 평가
  if (latency > 1000) {
    return {
      canSend: false,
      reason: `네트워크 지연이 너무 큽니다 (${latency}ms).`,
      quality: 'poor',
      recommendation: '네트워크 상태가 개선될 때까지 기다려주세요.',
    };
  }

  if (downloadSpeed < 0.5) {
    return {
      canSend: false,
      reason: `다운로드 속도가 너무 느립니다 (${downloadSpeed}Mbps).`,
      quality: 'poor',
      recommendation: '더 나은 네트워크 환경에서 다시 시도해주세요.',
    };
  }

  if (latency > 500) {
    return {
      canSend: true,
      quality: 'fair',
      recommendation:
        '네트워크 상태가 불안정할 수 있습니다. 전송 중 오류가 발생하면 다시 시도해주세요.',
    };
  }

  return {
    canSend: true,
    quality: latency < 200 && downloadSpeed > 5 ? 'excellent' : 'good',
    recommendation: '안정적인 네트워크 상태입니다.',
  };
};

/**
 * 네트워크 상태 로깅 함수
 */
export const logNetworkState = (
  state: NetworkState,
  context?: string
): void => {
  const quality = getNetworkQuality(state);
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] 네트워크 상태${context ? ` (${context})` : ''}:`,
    {
      온라인: state.isOnline ? '✅' : '❌',
      연결상태: state.isConnected ? '✅' : '❌',
      품질: quality,
      다운로드: `${state.downlink}Mbps`,
      지연시간: `${state.rtt}ms`,
      연결타입: state.effectiveType,
    }
  );
};

/**
 * 네트워크 상태 변경 감지 및 알림 함수
 */
export const createNetworkWatcher = (callback: NetworkChangeCallback) => {
  let previousState: NetworkState | null = null;
  let changeCount = 0;

  const updateState = () => {
    const currentState: NetworkState = {
      isOnline: navigator.onLine,
      isConnected: navigator.onLine,
      connectionType: (navigator as any).connection?.type || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      uplink: (navigator as any).connection?.uplink || 0,
      rtt: (navigator as any).connection?.rtt || 0,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      lastChanged: new Date(),
      changeCount: changeCount++,
    };

    if (previousState) {
      const currentQuality = getNetworkQuality(currentState);
      const previousQuality = getNetworkQuality(previousState);

      // 온라인/오프라인 상태 변경
      if (currentState.isOnline !== previousState.isOnline) {
        callback({
          type: currentState.isOnline ? 'online' : 'offline',
          timestamp: new Date(),
          previousState,
          currentState,
        });
      }
      // 네트워크 품질 변경
      else if (currentQuality !== previousQuality) {
        callback({
          type: 'quality_change',
          timestamp: new Date(),
          previousState,
          currentState,
        });
      }
    }

    previousState = currentState;
  };

  // 초기 상태 설정
  updateState();

  // 이벤트 리스너 등록
  window.addEventListener('online', updateState);
  window.addEventListener('offline', updateState);

  // Connection API 이벤트 (지원하는 브라우저에서)
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    connection.addEventListener('change', updateState);
  }

  // 정리 함수 반환
  return () => {
    window.removeEventListener('online', updateState);
    window.removeEventListener('offline', updateState);

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.removeEventListener('change', updateState);
    }
  };
};

/**
 * 네트워크 상태를 JSON으로 반환
 */
export const getNetworkStateAsJson = (): string => {
  const state: NetworkState = {
    isOnline: navigator.onLine,
    isConnected: navigator.onLine,
    connectionType: (navigator as any).connection?.type || 'unknown',
    downlink: (navigator as any).connection?.downlink || 0,
    uplink: (navigator as any).connection?.uplink || 0,
    rtt: (navigator as any).connection?.rtt || 0,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    lastChanged: new Date(),
    changeCount: 0,
  };

  return JSON.stringify(
    {
      ...state,
      quality: getNetworkQuality(state),
      formatted: formatNetworkState(state),
    },
    null,
    2
  );
};

/**
 * 기본 내보내기
 */
export default {
  getNetworkQuality,
  getNetworkQualityColor,
  getNetworkQualityBadgeColor,
  formatNetworkState,
  useNetworkMonitoring,
  checkNetworkConnection,
  testNetworkQuality,
  validateNetworkBeforeSend,
  logNetworkState,
  createNetworkWatcher,
  getNetworkStateAsJson,
};
