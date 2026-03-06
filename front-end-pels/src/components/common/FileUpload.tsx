import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { fileService, type UploadProgress } from '../../lib/fileService';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export interface FileUploadProps {
  onUploadComplete?: (fileId: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
  accept?: string;
  maxSizeInMB?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  onProgress,
  accept = '.pdf',
  maxSizeInMB = 10,
  multiple = false,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (!fileService.validateFileType(file, ['application/pdf'])) {
        errors.push(`${file.name}: PDF 파일만 업로드 가능합니다.`);
        return;
      }

      if (!fileService.validateFileSize(file, maxSizeInMB)) {
        errors.push(
          `${file.name}: 파일 크기는 ${maxSizeInMB}MB를 초과할 수 없습니다.`
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join('\n'));
      setUploadStatus('error');
      onUploadError?.(errors.join('\n'));
      return;
    }

    setSelectedFiles(validFiles);
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      for (const file of selectedFiles) {
        const result = await fileService.uploadPdf(file, progress => {
          setUploadProgress(progress.percentage);
          onProgress?.(progress);
        });

        if (result.success && result.data) {
          onUploadComplete?.(result.data.fileId, result.data.fileName);
          setUploadStatus('success');
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrorMessage(error.message || '업로드 중 오류가 발생했습니다.');
      setUploadStatus('error');
      onUploadError?.(error.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        // Create a new FileList-like object
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${disabled ? 'border-gray-300 bg-gray-50' : 'border-gray-400 hover:border-blue-500'}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="text-sm text-gray-600">
            PDF 파일을 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="text-xs text-gray-500">
            최대 {maxSizeInMB}MB, PDF 파일만 가능
          </p>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          variant="outline"
          className="mt-2"
        >
          파일 선택
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">선택된 파일:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({fileService.formatFileSize(file.size)})
                </span>
              </div>
              <Button
                onClick={() => {
                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                  setSelectedFiles(newFiles);
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>업로드 중...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">업로드가 완료되었습니다.</span>
        </div>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-start space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">업로드 실패</p>
            <p className="text-xs whitespace-pre-line">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFiles.length > 0 && uploadStatus !== 'uploading' && (
        <div className="flex space-x-2">
          <Button onClick={handleUpload} disabled={disabled} className="flex-1">
            업로드 시작
          </Button>
          <Button onClick={handleClear} variant="outline" disabled={disabled}>
            초기화
          </Button>
        </div>
      )}
    </div>
  );
}
