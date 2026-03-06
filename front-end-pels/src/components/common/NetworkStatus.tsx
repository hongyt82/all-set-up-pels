import React from 'react';
import type { NetworkState } from '../../utils/networkUtils';
import {
  formatNetworkState,
  getNetworkQualityBadgeColor,
  getNetworkQualityColor,
  useNetworkMonitoring,
} from '../../utils';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface NetworkStatusProps {
  /** 표시 형식 */
  format?: 'minimal' | 'compact' | 'detailed';
  /** 배지 표시 여부 */
  showBadge?: boolean;
  /** 툴팁 표시 여부 */
  showTooltip?: boolean;
  /** 클릭 가능 여부 */
  clickable?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 네트워크 상태 표시 컴포넌트
 * 실시간 네트워크 연결 상태를 UI로 표시
 */
const NetworkStatus: React.FC<NetworkStatusProps> = ({
  format = 'compact',
  showBadge = true,
  showTooltip = true,
  clickable = false,
  onClick,
  className = '',
}) => {
  const { isOnline, networkState, quality } = useNetworkMonitoring();

  // 네트워크 상태 정보 생성
  const currentState: NetworkState = {
    isOnline,
    isConnected: networkState.online ?? false,
    connectionType: networkState.type || 'unknown',
    downlink: networkState.downlink || 0,
    uplink: 0, // react-use의 useNetworkState에는 uplink 속성이 없음
    rtt: networkState.rtt || 0,
    effectiveType: networkState.effectiveType || 'unknown',
    lastChanged: new Date(),
    changeCount: 0,
  };

  const formattedState = formatNetworkState(currentState);
  const qualityText = {
    excellent: '우수',
    good: '양호',
    fair: '보통',
    poor: '불량',
    offline: '오프라인',
  }[quality];

  // 최소 형식
  if (format === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-1 ${className}`}
              onClick={clickable ? onClick : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  quality === 'offline'
                    ? 'bg-red-500'
                    : quality === 'poor'
                      ? 'bg-orange-500'
                      : quality === 'fair'
                        ? 'bg-yellow-500'
                        : quality === 'good'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                }`}
              />
              {showBadge && (
                <span className="text-xs text-muted-foreground">
                  {quality === 'offline' ? '오프라인' : '온라인'}
                </span>
              )}
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <div className="text-sm">
                <div>
                  <strong>상태:</strong> {formattedState}
                </div>
                <div>
                  <strong>품질:</strong> {qualityText}
                </div>
                {currentState.downlink > 0 && (
                  <div>
                    <strong>속도:</strong> {currentState.downlink}Mbps
                  </div>
                )}
                {currentState.rtt > 0 && (
                  <div>
                    <strong>지연:</strong> {currentState.rtt}ms
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 컴팩트 형식
  if (format === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-2 ${className}`}
              onClick={clickable ? onClick : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  quality === 'offline'
                    ? 'bg-red-500'
                    : quality === 'poor'
                      ? 'bg-orange-500'
                      : quality === 'fair'
                        ? 'bg-yellow-500'
                        : quality === 'good'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                }`}
              />
              <span
                className={`text-sm font-medium ${getNetworkQualityColor(quality)}`}
              >
                {quality === 'offline' ? '오프라인' : '온라인'}
              </span>
              {showBadge && (
                <Badge
                  variant="outline"
                  className={`text-xs ${getNetworkQualityBadgeColor(quality)}`}
                >
                  {qualityText}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <div className="text-sm space-y-1">
                <div>
                  <strong>연결 상태:</strong> {formattedState}
                </div>
                <div>
                  <strong>품질 등급:</strong> {qualityText}
                </div>
                {currentState.connectionType !== 'unknown' && (
                  <div>
                    <strong>연결 타입:</strong> {currentState.connectionType}
                  </div>
                )}
                {currentState.downlink > 0 && (
                  <div>
                    <strong>다운로드:</strong> {currentState.downlink}Mbps
                  </div>
                )}
                {currentState.rtt > 0 && (
                  <div>
                    <strong>지연 시간:</strong> {currentState.rtt}ms
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 상세 형식
  return (
    <Card
      className={`${className} ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <CardHeader className="pb-2" onClick={clickable ? onClick : undefined}>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>네트워크 상태</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                quality === 'offline'
                  ? 'bg-red-500'
                  : quality === 'poor'
                    ? 'bg-orange-500'
                    : quality === 'fair'
                      ? 'bg-yellow-500'
                      : quality === 'good'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
              }`}
            />
            <Badge
              variant="outline"
              className={getNetworkQualityBadgeColor(quality)}
            >
              {quality === 'offline' ? '❌ 오프라인' : '✅ 온라인'}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>실시간 네트워크 연결 상태 모니터링</CardDescription>
      </CardHeader>
      <CardContent className="pt-0" onClick={clickable ? onClick : undefined}>
        <div className="space-y-3">
          {/* 기본 상태 */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">연결 상태</span>
            <span className={`text-sm ${getNetworkQualityColor(quality)}`}>
              {isOnline ? '온라인' : '오프라인'}
            </span>
          </div>

          {/* 품질 등급 */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">품질 등급</span>
            <Badge
              variant="outline"
              className={`text-xs ${getNetworkQualityBadgeColor(quality)}`}
            >
              {qualityText}
            </Badge>
          </div>

          {/* 연결 타입 */}
          {currentState.connectionType !== 'unknown' && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">연결 타입</span>
              <span className="text-sm text-muted-foreground">
                {currentState.connectionType}
              </span>
            </div>
          )}

          {/* 다운로드 속도 */}
          {currentState.downlink > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">다운로드</span>
              <span className="text-sm text-muted-foreground">
                {currentState.downlink} Mbps
              </span>
            </div>
          )}

          {/* 업로드 속도 */}
          {currentState.uplink > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">업로드</span>
              <span className="text-sm text-muted-foreground">
                {currentState.uplink} Mbps
              </span>
            </div>
          )}

          {/* 지연 시간 */}
          {currentState.rtt > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">지연 시간</span>
              <span className="text-sm text-muted-foreground">
                {currentState.rtt} ms
              </span>
            </div>
          )}

          {/* 효과적 타입 */}
          {currentState.effectiveType !== 'unknown' && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">효과적 타입</span>
              <span className="text-sm text-muted-foreground">
                {currentState.effectiveType}
              </span>
            </div>
          )}

          {/* 상태 요약 */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {formattedState}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 네트워크 상태 인디케이터 (간단한 점 표시)
 */
export const NetworkIndicator: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}> = ({ size = 'md', showLabel = false, className = '' }) => {
  const { quality } = useNetworkMonitoring();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-orange-500',
    offline: 'bg-red-500',
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full ${colorClasses[quality]} animate-pulse`}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {quality === 'offline' ? '오프라인' : '온라인'}
        </span>
      )}
    </div>
  );
};

/**
 * 네트워크 상태 배지
 */
export const NetworkBadge: React.FC<{
  variant?: 'default' | 'outline' | 'destructive';
  className?: string;
}> = ({ variant = 'outline', className = '' }) => {
  const { isOnline, quality } = useNetworkMonitoring();

  const qualityText = {
    excellent: '우수',
    good: '양호',
    fair: '보통',
    poor: '불량',
    offline: '오프라인',
  }[quality];

  return (
    <Badge
      variant={variant}
      className={`${getNetworkQualityBadgeColor(quality)} ${className}`}
    >
      {isOnline ? '✅' : '❌'} {qualityText}
    </Badge>
  );
};

export default NetworkStatus;
