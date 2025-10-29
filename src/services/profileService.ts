import { apiClient } from './apiClient';
import { ApiResponse, UserProfile, Language } from '../types';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface AccountSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoPlayVideos: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  cellularDataUsage: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  reviewNotifications: boolean;
  systemNotifications: boolean;
}

export interface ActivityData {
  totalLessons: number;
  totalReviews: number;
  averageRating: number;
  joinDate: string;
  lastActive: string;
  completedCourses: number;
}

// Mock data for development mode
const mockProfile: UserProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  bio: 'Software developer and learner',
  location: {
    city: 'Ramallah',
    country: 'Palestine'
  },
  avatarUrl: 'https://via.placeholder.com/150',
  language: 'en',
  totalLessons: 0,
  totalReviews: 0,
  averageRating: 0,
  completedCourses: 0,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const mockLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '�' },
];

const mockAccountSettings: AccountSettings = {
  emailNotifications: true,
  pushNotifications: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
};

const mockPreferences: UserPreferences = {
  theme: 'system',
  autoPlayVideos: true,
  downloadQuality: 'high',
  cellularDataUsage: false,
};

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  messageNotifications: true,
  reviewNotifications: false,
  systemNotifications: true,
};

const mockActivity: ActivityData = {
  totalLessons: 0,
  totalReviews: 0,
  averageRating: 0,
  joinDate: '2024-01-15',
  lastActive: new Date().toISOString().split('T')[0],
  completedCourses: 0,
};

export const profileService = {
  // Profile Management
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const result = await apiClient.get('/profile');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock profile data in development mode');
      return {
        success: true,
        data: mockProfile,
      };
    }
    
    return result;
  },

  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<UserProfile>> {
    const result = await apiClient.put('/profile', data);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock profile update in development mode');
      return {
        success: true,
        data: { ...mockProfile, ...data },
      };
    }
    
    return result;
  },

  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    const result = await apiClient.put('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock avatar upload in development mode');
      return {
        success: true,
        data: { avatarUrl: 'https://via.placeholder.com/150' },
      };
    }
    
    return result;
  },

  // Language Management
  async getAvailableLanguages(): Promise<ApiResponse<Language[]>> {
    const result = await apiClient.get('/actions/languages');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock languages in development mode');
      return {
        success: true,
        data: mockLanguages,
      };
    }
    
    return result;
  },

  async updateLanguage(language: string): Promise<ApiResponse<{ language: string }>> {
    const result = await apiClient.put('/profile/language', { language });
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock language update in development mode');
      return {
        success: true,
        data: { language },
      };
    }
    
    return result;
  },

  async getCurrentLanguage(): Promise<ApiResponse<{ language: string }>> {
    const result = await apiClient.get('/profile/language');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock current language in development mode');
      return {
        success: true,
        data: { language: mockProfile.language },
      };
    }
    
    return result;
  },

  // Password Management
  async changePassword(data: PasswordChangeData): Promise<ApiResponse<{ message: string }>> {
    const result = await apiClient.put('/profile/password', data);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock password change in development mode');
      return {
        success: true,
        data: { message: 'Password changed successfully (mock)' },
      };
    }
    
    return result;
  },

  // Account Settings
  async getAccountSettings(): Promise<ApiResponse<AccountSettings>> {
    const result = await apiClient.get('/profile/settings');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock account settings in development mode');
      return {
        success: true,
        data: mockAccountSettings,
      };
    }
    
    return result;
  },

  async updateAccountSettings(settings: Partial<AccountSettings>): Promise<ApiResponse<AccountSettings>> {
    const result = await apiClient.put('/profile/settings', settings);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock account settings update in development mode');
      return {
        success: true,
        data: { ...mockAccountSettings, ...settings },
      };
    }
    
    return result;
  },

  // User Preferences
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    const result = await apiClient.get('/actions/preferences');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock preferences in development mode');
      return {
        success: true,
        data: mockPreferences,
      };
    }
    
    return result;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    const result = await apiClient.put('/actions/preferences', preferences);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock preferences update in development mode');
      return {
        success: true,
        data: { ...mockPreferences, ...preferences },
      };
    }
    
    return result;
  },

  // Notification Settings
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const result = await apiClient.get('/actions/notifications');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock notification settings in development mode');
      return {
        success: true,
        data: mockNotificationSettings,
      };
    }
    
    return result;
  },

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const result = await apiClient.put('/actions/notifications', settings);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock notification settings update in development mode');
      return {
        success: true,
        data: { ...mockNotificationSettings, ...settings },
      };
    }
    
    return result;
  },

  // Activity & Statistics
  async getActivity(): Promise<ApiResponse<ActivityData>> {
    const result = await apiClient.get('/profile/activity');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock activity data in development mode');
      return {
        success: true,
        data: mockActivity,
      };
    }
    
    return result;
  },

  // Account Status
  async getAccountStatus(): Promise<ApiResponse<{ status: string; isActive: boolean }>> {
    const result = await apiClient.get('/profile/status');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock account status in development mode');
      return {
        success: true,
        data: { status: 'active', isActive: true },
      };
    }
    
    return result;
  },

  async deactivateAccount(): Promise<ApiResponse<{ message: string }>> {
    const result = await apiClient.put('/profile/status', { action: 'deactivate' });
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock account deactivation in development mode');
      return {
        success: true,
        data: { message: 'Account deactivated successfully (mock)' },
      };
    }
    
    return result;
  },

  async reactivateAccount(): Promise<ApiResponse<{ message: string }>> {
    const result = await apiClient.put('/profile/status', { action: 'activate' });
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock account reactivation in development mode');
      return {
        success: true,
        data: { message: 'Account reactivated successfully (mock)' },
      };
    }
    
    return result;
  },

  // User Search
  async searchUsers(query: string): Promise<ApiResponse<UserProfile[]>> {
    const result = await apiClient.get(`/actions/search?q=${encodeURIComponent(query)}`);
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock user search in development mode');
      return {
        success: true,
        data: [mockProfile], // Return mock user as search result
      };
    }
    
    return result;
  },

  // App Information
  async getAppInfo(): Promise<ApiResponse<{ version: string; buildNumber: string; releaseDate: string }>> {
    const result = await apiClient.get('/actions/info');
    
    if (!result.success && __DEV__) {
      console.log('🔧 Using mock app info in development mode');
      return {
        success: true,
        data: {
          version: '1.0.0',
          buildNumber: '100',
          releaseDate: '2024-01-15',
        },
      };
    }
    
    return result;
  },
};