import { apiClient } from './apiClient';
import {
  LoginRequest,
  RegisterRequest,
  VerificationRequest,
  ResetPasswordRequest,
  AuthTokens,
  UserWithProfile,
  ApiResponse,
} from '../types';

/**
 * Auth Service
 * 
 * Backend integration is now ENABLED!
 * - Backend API endpoint: http://10.0.2.2:3000/api (for Android emulator)
 * - Server is running on localhost:3000
 * - PostgreSQL database connected
 * 
 * Registration endpoint: POST /api/auth/register
 * Login endpoint: POST /api/auth/login
 */
const service = {
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: UserWithProfile; tokens: AuthTokens }>> {
    return apiClient.post('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: UserWithProfile; tokens: AuthTokens }>> {
    return apiClient.post('/auth/register', userData);
  },

  async verifyEmail(data: VerificationRequest): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/verify-email', data);
  },

  async verifyPhone(data: VerificationRequest): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/verify-phone', data);
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/reset-password', data);
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/logout');
  },

  async resendEmailVerification(email: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/resend-email-verification', { email });
  },

  async resendPhoneVerification(phone: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/resend-phone-verification', { phone });
  },
};

export const authService = service;