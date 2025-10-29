// API Configuration for Aqra App
// This file contains all API endpoints and configuration

export const API_CONFIG = {
  // Development API URL (your local server)
  DEV_API_URL: 'http://localhost:3000/api',
  
  // For Android Emulator, use: 'http://10.0.2.2:3000/api'
  // For iOS Simulator, use: 'http://localhost:3000/api'
  // For Physical Device, use your computer's IP: 'http://192.168.1.X:3000/api'
  
  // Production API URL (when deployed)
  PROD_API_URL: 'https://api.aqra.app',
  
  // Timeout for API requests (milliseconds)
  TIMEOUT: 10000,
  
  // Enable/disable API mocking for development
  USE_MOCK_DATA: false,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
  },
  
  // Teachers
  TEACHERS: {
    SEARCH: '/teachers/search',
    GET_BY_ID: (id: string) => `/teachers/${id}`,
    GET_AVAILABILITY: (id: string) => `/teachers/${id}/availability`,
    GET_REVIEWS: (id: string) => `/teachers/${id}/reviews`,
    UPDATE_PROFILE: '/teachers/profile',
    UPDATE_AVAILABILITY: '/teachers/availability',
  },
  
  // Students
  STUDENTS: {
    GET_PROFILE: '/students/profile',
    UPDATE_PROFILE: '/students/profile',
    GET_BOOKINGS: '/students/bookings',
  },
  
  // Lesson Requests
  REQUESTS: {
    CREATE: '/requests',
    GET_ALL: '/requests',
    GET_BY_ID: (id: string) => `/requests/${id}`,
    UPDATE_STATUS: (id: string) => `/requests/${id}/status`,
    ACCEPT: (id: string) => `/requests/${id}/accept`,
    REJECT: (id: string) => `/requests/${id}/reject`,
    CANCEL: (id: string) => `/requests/${id}/cancel`,
  },
  
  // Messages
  MESSAGES: {
    GET_CONVERSATIONS: '/messages/conversations',
    GET_CONVERSATION: (userId: string) => `/messages/${userId}`,
    SEND: '/messages',
    MARK_READ: (messageId: string) => `/messages/${messageId}/read`,
  },
  
  // Posts (Community Feed)
  POSTS: {
    GET_ALL: '/posts',
    CREATE: '/posts',
    GET_BY_ID: (id: string) => `/posts/${id}`,
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    UNLIKE: (id: string) => `/posts/${id}/unlike`,
    GET_COMMENTS: (id: string) => `/posts/${id}/comments`,
    ADD_COMMENT: (id: string) => `/posts/${id}/comments`,
  },
  
  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    GET_BY_TEACHER: (teacherId: string) => `/reviews/teacher/${teacherId}`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  
  // User Actions
  ACTIONS: {
    FOLLOW: (userId: string) => `/actions/follow/${userId}`,
    UNFOLLOW: (userId: string) => `/actions/unfollow/${userId}`,
    BLOCK: (userId: string) => `/actions/block/${userId}`,
    UNBLOCK: (userId: string) => `/actions/unblock/${userId}`,
    REPORT: '/actions/report',
  },
};

// Helper function to get the correct API URL based on environment
export const getApiUrl = (): string => {
  return __DEV__ ? API_CONFIG.DEV_API_URL : API_CONFIG.PROD_API_URL;
};

// Helper function to build full API endpoint
export const buildApiUrl = (endpoint: string): string => {
  return `${getApiUrl()}${endpoint}`;
};
