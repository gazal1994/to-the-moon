import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StorageService } from '../utils';
import { ApiResponse, AuthTokens } from '../types';

const BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.aqra.app';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const tokens = await StorageService.getAuthTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = await StorageService.getAuthTokens();
            if (tokens?.refreshToken) {
              const response = await this.refreshToken(tokens.refreshToken);
              const newTokens = response.data;
              
              await StorageService.setAuthTokens(newTokens);
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await StorageService.removeUser();
            await StorageService.removeAuthTokens();
            // You might want to navigate to login screen here
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string): Promise<AxiosResponse<AuthTokens>> {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

export const apiClient = new ApiClient();