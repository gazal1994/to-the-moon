import { apiClient } from './apiClient';
import {
  UserWithProfile,
  TeacherProfile,
  StudentProfile,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const userService = {
  async getCurrentUser(): Promise<ApiResponse<UserWithProfile>> {
    return apiClient.get('/users/me');
  },

  async updateUser(updates: Partial<UserWithProfile>): Promise<ApiResponse<UserWithProfile>> {
    return apiClient.patch('/users/me', updates);
  },

  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateTeacherProfile(updates: Partial<TeacherProfile>): Promise<ApiResponse<TeacherProfile>> {
    return apiClient.patch('/teachers/me', updates);
  },

  async updateStudentProfile(updates: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    return apiClient.patch('/students/me', updates);
  },

  async searchTeachers(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<UserWithProfile>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = Array.isArray(value) ? value.join(',') : value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return apiClient.get(`/teachers?${params.toString()}`);
  },

  async getTeacherById(teacherId: string): Promise<ApiResponse<UserWithProfile>> {
    return apiClient.get(`/teachers/${teacherId}`);
  },

  async getTeacherReviews(
    teacherId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get(`/reviews?teacherId=${teacherId}&page=${page}&limit=${limit}`);
  },
};