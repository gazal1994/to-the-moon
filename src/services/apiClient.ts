import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StorageService } from '../utils';
import { ApiResponse, AuthTokens } from '../types';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator and web, use localhost
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  return 'https://api.aqra.app';
};

const BASE_URL = getBaseUrl();

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
              
              // Backend returns { success: true, data: { tokens: { accessToken, refreshToken } } }
              if (response.data?.success && response.data?.data?.tokens) {
                const newTokens = response.data.data.tokens;
                
                await StorageService.setAuthTokens(newTokens);
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
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
    // Use axios directly to avoid interceptor loop
    return axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      const backendResponse = response.data;
      
      // Backend returns the full response object, just pass it through
      // Don't nest it in a data property
      if (backendResponse.success) {
        return backendResponse; // Return the full backend response as-is
      } else {
        return {
          success: false,
          error: backendResponse.error || backendResponse.message || 'Request failed',
        };
      }
    } catch (error: any) {
      let errorMessage = 'Network request failed';
      
      if (error.response) {
        errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('🌐 API POST:', BASE_URL + url, data);
      const response = await this.client.post(url, data, config);
      console.log('✅ API Response:', response.data);
      
      // Backend returns the full response object, just pass it through
      const backendResponse = response.data;
      
      if (backendResponse.success) {
        return backendResponse; // Return the full backend response as-is
      } else {
        return {
          success: false,
          error: backendResponse.error || backendResponse.message || 'Request failed',
        };
      }
    } catch (error: any) {
      console.error('❌ API Error:', {
        url: BASE_URL + url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      let errorMessage = 'Network request failed';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response?.data?.error || error.response?.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
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
      const backendResponse = response.data;
      
      // Return the full backend response as-is
      if (backendResponse.success) {
        return backendResponse;
      } else {
        return {
          success: false,
          error: backendResponse.error || backendResponse.message || 'Request failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message,
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