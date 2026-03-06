import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  getBrowserInfo,
  formatBrowserInfo,
  calculateCompatibilityScore,
  watchBrowserChanges,
  type BrowserInfo,
} from '../../utils/browserUtils';

/**
 * 브라우저 정보 표시 컴포넌트
 */
interface BrowserDisplayProps {
  /** 표시할 포맷 타입 */
  format?: 'short' | 'detailed' | 'minimal';
  /** 배지 스타일 사용 여부 */
  showBadge?: boolean;
  /** 클릭 가능 여부 */
  clickable?: boolean;
  /** 클릭 시 실행할 함수 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 실시간 업데이트 여부 */
  liveUpdate?: boolean;
}

export const BrowserDisplay: React.FC<BrowserDisplayProps> = ({
  format = 'short',
  showBadge = false,
  clickable = false,
  onClick,
  className = '',
  liveUpdate = false,
}) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);

  useEffect(() => {
    const updateInfo = () => {
      const info = getBrowserInfo();
      setBrowserInfo(info);
      setCompatibilityScore(calculateCompatibilityScore(info));
    };

    updateInfo();

    if (liveUpdate) {
      const unwatch = watchBrowserChanges(updateInfo);
      return unwatch;
    }
  }, [liveUpdate]);

  if (!browserInfo) {
    return <span className="text-gray-500">Loading...</span>;
  }

  const browserText = formatBrowserInfo(browserInfo, format);
  const scoreColor =
    compatibilityScore >= 80
      ? 'bg-green-100 text-green-800'
      : compatibilityScore >= 60
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const baseClasses = `inline-flex items-center ${clickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`;

  if (showBadge) {
    return (
      <div className={baseClasses}>
        <Badge
          variant="outline"
          className={`${scoreColor} mr-2`}
          onClick={handleClick}
        >
          {browserText}
        </Badge>
        <span className="text-sm text-gray-600">
          {compatibilityScore}% compatible
        </span>
      </div>
    );
  }

  return (
    <span
      className={baseClasses}
      onClick={handleClick}
      title={`Compatibility: ${compatibilityScore}%`}
    >
      {browserText}
    </span>
  );
};

/**
 * 브라우저 정보 모달 컴포넌트
 */
interface BrowserModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 함수 */
  onClose: () => void;
}

export const BrowserModal: React.FC<BrowserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const info = getBrowserInfo();
      setBrowserInfo(info);
      setCompatibilityScore(calculateCompatibilityScore(info));
    }
  }, [isOpen]);

  if (!isOpen || !browserInfo) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeatureIcon = (supported: boolean) => {
    return supported ? '✅' : '❌';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">브라우저 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">브라우저:</span>
                <span>
                  {browserInfo.name} {browserInfo.version}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">엔진:</span>
                <span>{browserInfo.engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">운영체제:</span>
                <span>
                  {browserInfo.os} {browserInfo.osVersion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">디바이스:</span>
                <span className="capitalize">{browserInfo.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">화면 해상도:</span>
                <span>{browserInfo.screenResolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">뷰포트:</span>
                <span>{browserInfo.viewportSize}</span>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>시스템 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">언어:</span>
                <span>{browserInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">시간대:</span>
                <span>{browserInfo.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">색상 깊이:</span>
                <span>{browserInfo.colorDepth}bit</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">픽셀 비율:</span>
                <span>{browserInfo.pixelRatio}x</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">CPU 코어:</span>
                <span>{browserInfo.cpuCores}개</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">온라인:</span>
                <span
                  className={
                    browserInfo.isOnline ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {browserInfo.isOnline ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 호환성 점수 */}
          <Card>
            <CardHeader>
              <CardTitle>호환성 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(compatibilityScore)}`}
                >
                  {compatibilityScore}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {compatibilityScore >= 80
                    ? '우수'
                    : compatibilityScore >= 60
                      ? '양호'
                      : '개선 필요'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full ${
                      compatibilityScore >= 80
                        ? 'bg-green-500'
                        : compatibilityScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${compatibilityScore}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 기능 지원 */}
          <Card>
            <CardHeader>
              <CardTitle>기능 지원</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>
                    {getFeatureIcon(browserInfo.localStorageSupported)}
                  </span>
                  <span>LocalStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {getFeatureIcon(browserInfo.sessionStorageSupported)}
                  </span>
                  <span>SessionStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.webWorkerSupported)}</span>
                  <span>Web Worker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {getFeatureIcon(browserInfo.serviceWorkerSupported)}
                  </span>
                  <span>Service Worker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.webglSupported)}</span>
                  <span>WebGL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.webrtcSupported)}</span>
                  <span>WebRTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.websocketSupported)}</span>
                  <span>WebSocket</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.indexedDBSupported)}</span>
                  <span>IndexedDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.canvasSupported)}</span>
                  <span>Canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.svgSupported)}</span>
                  <span>SVG</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.cssGridSupported)}</span>
                  <span>CSS Grid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.flexboxSupported)}</span>
                  <span>Flexbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.es6Supported)}</span>
                  <span>ES6</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.fetchSupported)}</span>
                  <span>Fetch API</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getFeatureIcon(browserInfo.promiseSupported)}</span>
                  <span>Promise</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {getFeatureIcon(browserInfo.webAssemblySupported)}
                  </span>
                  <span>WebAssembly</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 간단한 브라우저 표시 (푸터용)
 */
export const SimpleBrowserDisplay: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    const info = getBrowserInfo();
    setBrowserInfo(info);
  }, []);

  if (!browserInfo) {
    return (
      <span className={`text-xs text-gray-500 ${className}`}>Loading...</span>
    );
  }

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {browserInfo.name} {browserInfo.version}
    </span>
  );
};

export default BrowserDisplay;
