import { apiClient } from './apiClient';
import { UserWithProfile, SearchFilters, ApiResponse, Teacher } from '../types';

export interface SearchTeachersParams {
  query?: string;
  page?: number;
  limit?: number;
  subjects?: string[];
  languages?: string[];
  minPrice?: number;
  maxPrice?: number;
  isVolunteer?: boolean;
  city?: string;
  country?: string;
  rating?: number;
  learningModes?: string[];
}

export interface SearchTeachersResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class TeacherService {
  /**
   * Search for teachers with filters and pagination
   */
  async searchTeachers(params: SearchTeachersParams): Promise<ApiResponse<SearchTeachersResponse>> {
    try {
      console.log('🔍 Searching teachers with params:', params);

      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.subjects?.length) queryParams.append('subjects', params.subjects.join(','));
      if (params.languages?.length) queryParams.append('languages', params.languages.join(','));
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.isVolunteer !== undefined) queryParams.append('isVolunteer', params.isVolunteer.toString());
      if (params.city) queryParams.append('city', params.city);
      if (params.country) queryParams.append('country', params.country);
      if (params.rating) queryParams.append('rating', params.rating.toString());
      if (params.learningModes?.length) queryParams.append('learningModes', params.learningModes.join(','));

      const response = await apiClient.get<SearchTeachersResponse>(
        `/teachers/search?${queryParams.toString()}`
      );

      // console.log('✅ Teachers search successful:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to search teachers:', error);
      
      // Fallback to empty results in development
      if (__DEV__) {
        console.log('🔧 Using empty teachers list in development mode');
        return {
          success: true,
          data: {
            teachers: [],
            total: 0,
            page: params.page || 1,
            limit: params.limit || 20,
            hasMore: false,
          },
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search teachers',
      };
    }
  }

  /**
   * Get a specific teacher's profile by ID
   */
  async getTeacherById(teacherId: string): Promise<ApiResponse<UserWithProfile>> {
    try {
      console.log('🔍 Fetching teacher profile:', teacherId);

      const response = await apiClient.get<UserWithProfile>(`/teachers/${teacherId}`);

      console.log('✅ Teacher profile fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch teacher profile:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch teacher profile',
      };
    }
  }

  /**
   * Get featured/recommended teachers
   */
  async getFeaturedTeachers(limit: number = 10): Promise<ApiResponse<UserWithProfile[]>> {
    try {
      console.log('🔍 Fetching featured teachers');

      const response = await apiClient.get<UserWithProfile[]>(
        `/teachers/featured?limit=${limit}`
      );

      console.log('✅ Featured teachers fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch featured teachers:', error);

      if (__DEV__) {
        console.log('🔧 Using empty featured teachers list in development mode');
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch featured teachers',
      };
    }
  }

  /**
   * Get available subjects for filtering
   */
  async getAvailableSubjects(): Promise<ApiResponse<string[]>> {
    try {
      console.log('🔍 Fetching available subjects');

      const response = await apiClient.get<string[]>('/teachers/subjects');

      console.log('✅ Available subjects fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch available subjects:', error);

      if (__DEV__) {
        console.log('🔧 Using default subjects in development mode');
        return {
          success: true,
          data: [
            'Arabic',
            'English',
            'Mathematics',
            'Science',
            'Quran',
            'Islamic Studies',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
          ],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch available subjects',
      };
    }
  }

  /**
   * Get available locations (cities/countries) for filtering
   */
  async getAvailableLocations(): Promise<ApiResponse<{ cities: string[]; countries: string[] }>> {
    try {
      console.log('🔍 Fetching available locations');

      const response = await apiClient.get<{ cities: string[]; countries: string[] }>(
        '/teachers/locations'
      );

      console.log('✅ Available locations fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch available locations:', error);

      if (__DEV__) {
        console.log('🔧 Using default locations in development mode');
        return {
          success: true,
          data: {
            cities: ['Riyadh', 'Cairo', 'Dubai', 'Jeddah', 'Dammam', 'Mecca', 'Ramallah', 'Jerusalem'],
            countries: ['Saudi Arabia', 'Egypt', 'UAE', 'Palestine', 'Jordan', 'Lebanon'],
          },
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch available locations',
      };
    }
  }

  /**
   * Toggle favorite status for a teacher
   */
  async toggleFavorite(teacherId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    try {
      console.log('💝 Toggling favorite for teacher:', teacherId);

      const response = await apiClient.post<{ isFavorite: boolean }>(
        `/teachers/${teacherId}/favorite`
      );

      console.log('✅ Favorite toggled successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      };
    }
  }

  /**
   * Get user's favorite teachers
   */
  async getFavoriteTeachers(): Promise<ApiResponse<UserWithProfile[]>> {
    try {
      console.log('💝 Fetching favorite teachers');

      const response = await apiClient.get<UserWithProfile[]>('/teachers/favorites');

      console.log('✅ Favorite teachers fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch favorite teachers:', error);

      if (__DEV__) {
        console.log('🔧 Using empty favorites list in development mode');
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch favorite teachers',
      };
    }
  }
}

export const teacherService = new TeacherService();
