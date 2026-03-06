import { useState } from 'react';
import { Button } from '../ui/button';
import { fileService } from '../../lib/fileService';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export interface FileDownloadProps {
  fileId: string;
  fileName?: string;
  onDownloadComplete?: (fileName: string) => void;
  onDownloadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function FileDownload({
  fileId,
  fileName,
  onDownloadComplete,
  onDownloadError,
  className = '',
  disabled = false,
  variant = 'default',
  size = 'default',
}: FileDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    'idle' | 'downloading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownload = async () => {
    if (!fileId) return;

    setIsDownloading(true);
    setDownloadStatus('downloading');
    setErrorMessage('');

    try {
      const result = await fileService.downloadPdf(fileId, fileName);

      if (result.success && result.data) {
        fileService.triggerDownload(
          result.data,
          result.fileName || 'document.pdf'
        );
        setDownloadStatus('success');
        onDownloadComplete?.(result.fileName || 'document.pdf');
      } else {
        throw new Error(result.message || 'Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      setErrorMessage(error.message || '다운로드 중 오류가 발생했습니다.');
      setDownloadStatus('error');
      onDownloadError?.(error.message || '다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonContent = () => {
    if (isDownloading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          다운로드 중...
        </>
      );
    }

    if (downloadStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4" />
          다운로드 완료
        </>
      );
    }

    return (
      <>
        <Download className="h-4 w-4" />
        다운로드
      </>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        variant={variant}
        size={size}
        className="w-full"
      >
        {getButtonContent()}
      </Button>

      {downloadStatus === 'error' && errorMessage && (
        <div className="flex items-start space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">다운로드 실패</p>
            <p className="text-xs">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
