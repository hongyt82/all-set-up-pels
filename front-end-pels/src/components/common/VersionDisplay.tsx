import React from 'react';
import { Badge } from '../ui/badge';
import {
  getAppVersion,
  formatVersion,
  getVersionBadgeColor,
} from '../../utils';

/**
 * 버전 정보 표시 컴포넌트
 */
interface VersionDisplayProps {
  /** 표시할 포맷 타입 */
  format?: 'short' | 'full' | 'detailed';
  /** 배지 스타일 사용 여부 */
  showBadge?: boolean;
  /** 클릭 가능 여부 */
  clickable?: boolean;
  /** 클릭 시 실행할 함수 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  format = 'short',
  showBadge = false,
  clickable = false,
  onClick,
  className = '',
}) => {
  const versionInfo = getAppVersion();
  const versionText = formatVersion(versionInfo, format);
  const badgeColor = getVersionBadgeColor(versionInfo);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const baseClasses = `inline-flex items-center ${clickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`;

  if (showBadge) {
    return (
      <Badge
        variant="outline"
        className={`${badgeColor} ${baseClasses}`}
        onClick={handleClick}
      >
        {versionText}
      </Badge>
    );
  }

  return (
    <span
      className={baseClasses}
      onClick={handleClick}
      title={`Build: ${versionInfo.buildTime}${versionInfo.gitCommit ? ` | Commit: ${versionInfo.gitCommit}` : ''}`}
    >
      {versionText}
    </span>
  );
};

/**
 * 버전 정보 모달 컴포넌트
 */
interface VersionModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 함수 */
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const versionInfo = getAppVersion();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">앱 버전 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">버전:</span>
            <span className="font-mono">{versionInfo.full}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">타입:</span>
            <Badge
              variant="outline"
              className={getVersionBadgeColor(versionInfo)}
            >
              {versionInfo.versionType}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">환경:</span>
            <span className="capitalize">{versionInfo.environment}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">배포일:</span>
            <span>{versionInfo.deployDate}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">빌드 시간:</span>
            <span className="text-sm text-gray-600">
              {versionInfo.buildTime}
            </span>
          </div>

          {versionInfo.gitCommit && (
            <div className="flex justify-between">
              <span className="font-medium">Git 커밋:</span>
              <span className="font-mono text-sm text-gray-600">
                {versionInfo.gitCommit.substring(0, 8)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 간단한 버전 표시 (푸터용)
 */
export const SimpleVersionDisplay: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const versionInfo = getAppVersion();

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      v{versionInfo.full}
    </span>
  );
};

export default VersionDisplay;
