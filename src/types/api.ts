import { LearningMode } from './user';

export interface SearchFilters {
  subject?: string;
  level?: string;
  city?: string;
  country?: string;
  learningMode?: LearningMode;
  language?: string;
  isVolunteer?: boolean;
  ratingMin?: number;
  availableAt?: string;
  priceMax?: number;
  gender?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  phone?: string;
  country?: string;
  city?: string;
  subjects?: string[];
  bio?: string;
  experience?: string;
  hourlyRate?: number;
}

export interface VerificationRequest {
  email?: string;
  phone?: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}