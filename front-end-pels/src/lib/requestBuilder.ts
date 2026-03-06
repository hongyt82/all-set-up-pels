import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios';
import { getHttpClient, createMultipartClient } from './http';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

export interface RequestOptions {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  useMultipart?: boolean;
  responseType?:
    | 'json'
    | 'blob'
    | 'text'
    | 'arraybuffer'
    | 'document'
    | 'stream';
  onUploadProgress?: (progress: {
    loaded: number;
    total: number;
    percentage: number;
  }) => void;
  onDownloadProgress?: (progress: {
    loaded: number;
    total: number;
    percentage: number;
  }) => void;
  validateStatus?: (status: number) => boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface RequestResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

export class RequestBuilder {
  private baseConfig: Partial<RequestOptions> = {};

  constructor(baseConfig?: Partial<RequestOptions>) {
    this.baseConfig = {
      timeout: 3000, // Reduced timeout for faster mock response
      retryCount: 0,
      retryDelay: 1000,
      ...baseConfig,
    };
  }

  /**
   * Set base configuration for all requests
   */
  setBaseConfig(config: Partial<RequestOptions>): RequestBuilder {
    this.baseConfig = { ...this.baseConfig, ...config };
    return this;
  }

  /**
   * Add default headers
   */
  setHeaders(headers: Record<string, string>): RequestBuilder {
    this.baseConfig.headers = { ...this.baseConfig.headers, ...headers };
    return this;
  }

  /**
   * Set default timeout
   */
  setTimeout(timeout: number): RequestBuilder {
    this.baseConfig.timeout = timeout;
    return this;
  }

  /**
   * Set default retry configuration
   */
  setRetryConfig(
    retryCount: number,
    retryDelay: number = 1000
  ): RequestBuilder {
    this.baseConfig.retryCount = retryCount;
    this.baseConfig.retryDelay = retryDelay;
    return this;
  }

  /**
   * Execute the request
   */
  async execute<T = any>(options: RequestOptions): Promise<RequestResponse<T>> {
    const config = this.mergeConfig(options);
    const client = options.useMultipart
      ? createMultipartClient()
      : getHttpClient();

    // Progress handlers are now handled in mergeConfig

    // Retry logic
    const retryCount = options.retryCount || 0;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await client.request<T>(config);
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config,
        };
      } catch (error: any) {
        if (attempt === retryCount) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }

    throw new Error('Request failed after all retries');
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'GET',
      url,
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'PATCH',
      url,
      data,
      ...options,
    });
  }

  /**
   * HEAD request
   */
  async head<T = any>(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'HEAD',
      url,
      ...options,
    });
  }

  /**
   * OPTIONS request
   */
  async options<T = any>(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method: 'OPTIONS',
      url,
      ...options,
    });
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.execute<T>({
      method: 'POST',
      url,
      data: formData,
      useMultipart: true,
      ...options,
    });
  }

  /**
   * Download file as blob
   */
  async downloadFile(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<Blob>> {
    return this.execute<Blob>({
      method: 'GET',
      url,
      responseType: 'blob',
      ...options,
    });
  }

  /**
   * Send JSON data
   */
  async sendJson<T = any>(
    method: HttpMethod,
    url: string,
    data: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.execute<T>({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Send form data (application/x-www-form-urlencoded)
   */
  async sendForm<T = any>(
    method: HttpMethod,
    url: string,
    data: Record<string, any>,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    return this.execute<T>({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Merge configuration with base config
   */
  private mergeConfig(options: RequestOptions): AxiosRequestConfig {
    const merged = { ...this.baseConfig, ...options };

    return {
      method: merged.method.toLowerCase() as any,
      url: merged.url,
      data: merged.data,
      params: merged.params,
      headers: merged.headers,
      timeout: merged.timeout,
      responseType: merged.responseType,
      onUploadProgress: merged.onUploadProgress
        ? (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const progress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                ),
              };
              merged.onUploadProgress?.(progress);
            }
          }
        : undefined,
      onDownloadProgress: merged.onDownloadProgress
        ? (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const progress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                ),
              };
              merged.onDownloadProgress?.(progress);
            }
          }
        : undefined,
      validateStatus:
        merged.validateStatus || (status => status >= 200 && status < 300),
    };
  }
}

// Export singleton instance
export const requestBuilder = new RequestBuilder();

// Export convenience functions
export const http = {
  get: <T = any>(url: string, options?: Partial<RequestOptions>) =>
    requestBuilder.get<T>(url, options),
  post: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    requestBuilder.post<T>(url, data, options),
  put: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    requestBuilder.put<T>(url, data, options),
  delete: <T = any>(url: string, options?: Partial<RequestOptions>) =>
    requestBuilder.delete<T>(url, options),
  patch: <T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
  ) => requestBuilder.patch<T>(url, data, options),
  head: <T = any>(url: string, options?: Partial<RequestOptions>) =>
    requestBuilder.head<T>(url, options),
  options: <T = any>(url: string, options?: Partial<RequestOptions>) =>
    requestBuilder.options<T>(url, options),
  uploadFile: <T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: Partial<RequestOptions>
  ) => requestBuilder.uploadFile<T>(url, file, additionalData, options),
  downloadFile: (url: string, options?: Partial<RequestOptions>) =>
    requestBuilder.downloadFile(url, options),
  sendJson: <T = any>(
    method: HttpMethod,
    url: string,
    data: any,
    options?: Partial<RequestOptions>
  ) => requestBuilder.sendJson<T>(method, url, data, options),
  sendForm: <T = any>(
    method: HttpMethod,
    url: string,
    data: Record<string, any>,
    options?: Partial<RequestOptions>
  ) => requestBuilder.sendForm<T>(method, url, data, options),
};

// Export api convenience functions (same as http for backward compatibility)
export const api = http;

// Export builder factory
export const createRequestBuilder = (baseConfig?: Partial<RequestOptions>) =>
  new RequestBuilder(baseConfig);
