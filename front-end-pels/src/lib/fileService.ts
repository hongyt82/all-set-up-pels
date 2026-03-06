import { createMultipartClient } from './http';
import { IS_DEV } from '../constants/config';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url?: string;
  };
  error?: string;
}

export interface FileDownloadResponse {
  success: boolean;
  message: string;
  data?: Blob;
  fileName?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * File service for handling PDF uploads and downloads
 * Can be used from any component
 */
export class FileService {
  private multipartClient = createMultipartClient();

  /**
   * Upload a PDF file
   * @param file - The file to upload
   * @param onProgress - Optional progress callback
   * @param additionalData - Additional form data to send
   * @returns Promise with upload response
   */
  async uploadPdf(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    additionalData?: Record<string, string | number>
  ): Promise<FileUploadResponse> {
    if (IS_DEV && !this.multipartClient.defaults.baseURL) {
      // Mock response for development
      return {
        success: true,
        message: 'Mock upload successful',
        data: {
          fileId: 'mock-' + Date.now(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          url: URL.createObjectURL(file),
        },
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      const response = await this.multipartClient.post(
        '/upload/pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (onProgress && progressEvent.total) {
              const progress: UploadProgress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                ),
              };
              onProgress(progress);
            }
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Upload failed',
        error: error.message,
      };
    }
  }

  /**
   * Download a PDF file
   * @param fileId - The ID of the file to download
   * @param fileName - Optional custom filename
   * @returns Promise with download response
   */
  async downloadPdf(
    fileId: string,
    fileName?: string
  ): Promise<FileDownloadResponse> {
    if (IS_DEV && !this.multipartClient.defaults.baseURL) {
      // Mock response for development
      const mockBlob = new Blob(['Mock PDF content'], {
        type: 'application/pdf',
      });
      return {
        success: true,
        message: 'Mock download successful',
        data: mockBlob,
        fileName: fileName || 'mock-document.pdf',
      };
    }

    try {
      const response = await this.multipartClient.get(
        `/download/pdf/${fileId}`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadFileName =
        fileName || this.getFileNameFromResponse(response) || 'document.pdf';

      return {
        success: true,
        message: 'Download successful',
        data: blob,
        fileName: downloadFileName,
      };
    } catch (error: any) {
      console.error('File download error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Download failed',
        error: error.message,
      };
    }
  }

  /**
   * Download PDF with direct blob response
   * @param fileId - The ID of the file to download
   * @param fileName - Optional custom filename
   * @returns Promise with blob data
   */
  async downloadPdfBlob(
    fileId: string,
    fileName?: string
  ): Promise<Blob | null> {
    const result = await this.downloadPdf(fileId, fileName);
    return result.success ? result.data || null : null;
  }

  /**
   * Trigger file download in browser
   * @param blob - The blob data to download
   * @param fileName - The filename for download
   */
  triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Upload and download PDF in one operation
   * @param file - The file to upload
   * @param onProgress - Optional progress callback
   * @param additionalData - Additional form data to send
   * @returns Promise with processed file blob
   */
  async processPdf(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    additionalData?: Record<string, string | number>
  ): Promise<Blob | null> {
    const uploadResult = await this.uploadPdf(file, onProgress, additionalData);

    if (!uploadResult.success || !uploadResult.data?.fileId) {
      console.error('Upload failed:', uploadResult.message);
      return null;
    }

    const downloadResult = await this.downloadPdf(uploadResult.data.fileId);

    if (!downloadResult.success || !downloadResult.data) {
      console.error('Download failed:', downloadResult.message);
      return null;
    }

    return downloadResult.data;
  }

  /**
   * Get file name from response headers
   * @param response - Axios response object
   * @returns File name or null
   */
  private getFileNameFromResponse(response: any): string | null {
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (fileNameMatch && fileNameMatch[1]) {
        return fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    return null;
  }

  /**
   * Validate file type
   * @param file - The file to validate
   * @param allowedTypes - Array of allowed MIME types
   * @returns True if file type is valid
   */
  validateFileType(
    file: File,
    allowedTypes: string[] = ['application/pdf']
  ): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param file - The file to validate
   * @param maxSizeInMB - Maximum file size in MB
   * @returns True if file size is valid
   */
  validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Get file size in human readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileService = new FileService();
