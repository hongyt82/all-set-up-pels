import {
  requestBuilder,
  type RequestOptions,
  type RequestResponse,
} from './requestBuilder';
import { getEffectiveApiBaseUrl } from '../constants/config';

/**
 * API Client with predefined endpoints and methods
 * Provides a clean interface for common API operations
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getEffectiveApiBaseUrl() || '';
  }

  /**
   * Set base URL for all requests
   */
  setBaseUrl(url: string): ApiClient {
    this.baseUrl = url;
    return this;
  }

  /**
   * Build full URL with base URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  /**
   * Generic request method
   */
  async request<T = any>(options: RequestOptions): Promise<RequestResponse<T>> {
    const fullOptions = {
      ...options,
      url: this.buildUrl(options.url),
    };
    return requestBuilder.execute<T>(fullOptions);
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url: endpoint,
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url: endpoint,
      data,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url: endpoint,
      data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url: endpoint,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url: endpoint,
      data,
      ...options,
    });
  }

  /**
   * Upload file
   */
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url: endpoint,
      data: this.createFormData(file, additionalData),
      useMultipart: true,
      ...options,
    });
  }

  /**
   * Download file
   */
  async downloadFile(
    endpoint: string,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<Blob>> {
    return this.request<Blob>({
      method: 'GET',
      url: endpoint,
      responseType: 'blob',
      ...options,
    });
  }

  /**
   * Send JSON data
   */
  async sendJson<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data: any,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method,
      url: endpoint,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Send form data
   */
  async sendForm<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data: Record<string, any>,
    options?: Partial<RequestOptions>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({
      method,
      url: endpoint,
      data: this.createFormData(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Create FormData from object or file
   */
  private createFormData(
    data: File | Record<string, any>,
    additionalData?: Record<string, any>
  ): FormData {
    const formData = new FormData();

    if (data instanceof File) {
      formData.append('file', data);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return formData;
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): ApiClient {
    requestBuilder.setHeaders(headers);
    return this;
  }

  /**
   * Set default timeout for all requests
   */
  setTimeout(timeout: number): ApiClient {
    requestBuilder.setTimeout(timeout);
    return this;
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(retryCount: number, retryDelay: number = 1000): ApiClient {
    requestBuilder.setRetryConfig(retryCount, retryDelay);
    return this;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions with base URL
export const api = {
  get: <T = any>(endpoint: string, options?: Partial<RequestOptions>) =>
    apiClient.get<T>(endpoint, options),
  post: <T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ) => apiClient.post<T>(endpoint, data, options),
  put: <T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ) => apiClient.put<T>(endpoint, data, options),
  delete: <T = any>(endpoint: string, options?: Partial<RequestOptions>) =>
    apiClient.delete<T>(endpoint, options),
  patch: <T = any>(
    endpoint: string,
    data?: any,
    options?: Partial<RequestOptions>
  ) => apiClient.patch<T>(endpoint, data, options),
  uploadFile: <T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: Partial<RequestOptions>
  ) => apiClient.uploadFile<T>(endpoint, file, additionalData, options),
  downloadFile: (endpoint: string, options?: Partial<RequestOptions>) =>
    apiClient.downloadFile(endpoint, options),
  sendJson: <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data: any,
    options?: Partial<RequestOptions>
  ) => apiClient.sendJson<T>(method, endpoint, data, options),
  sendForm: <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data: Record<string, any>,
    options?: Partial<RequestOptions>
  ) => apiClient.sendForm<T>(method, endpoint, data, options),
};

// Export factory function
export const createApiClient = (baseUrl?: string) => new ApiClient(baseUrl);
