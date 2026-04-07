import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getEffectiveApiBaseUrl, IS_DEV } from '../constants/config';
import { devWarn } from '../utils/devConsole';

let cached: AxiosInstance | null = null;

export function getHttpClient(): AxiosInstance {
  if (cached) return cached;
  const baseURL = getEffectiveApiBaseUrl();
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: false,
    timeout: 3000, // Reduced timeout for faster mock response
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(config => {
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  });

  instance.interceptors.response.use(
    res => res,
    error => {
      // In development mode, provide fallback for connection errors
      if (IS_DEV && error.code === 'ECONNREFUSED') {
        devWarn(
          '[HTTP] Connection refused, using mock response for development'
        );
        // Return a mock response instead of rejecting
        return Promise.resolve({
          data: {
            error: 'API server not available',
            message: 'Mock response for development',
            data: [],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
      return Promise.reject(error);
    }
  );

  cached = instance;
  return instance;
}

/**
 * Create a multipart form data instance for file uploads
 */
export function createMultipartClient(): AxiosInstance {
  const baseURL = getEffectiveApiBaseUrl();
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: false,
    timeout: 60000, // Longer timeout for file uploads
    headers: {
      // Don't set Content-Type - let browser set it with boundary
    },
  });

  instance.interceptors.request.use(config => {
    // Ensure FormData is properly handled
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  });

  instance.interceptors.response.use(
    res => res,
    error => {
      // In development mode, provide fallback for connection errors
      if (IS_DEV && error.code === 'ECONNREFUSED') {
        devWarn(
          '[HTTP] Multipart connection refused, using mock response for development'
        );
        return Promise.resolve({
          data: {
            error: 'API server not available',
            message: 'Mock response for development',
            success: false,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
