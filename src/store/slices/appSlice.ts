import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilters } from '../../types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface AppState {
  searchFilters: SearchFilters;
  isOffline: boolean;
  language: string;
  notifications: Notification[];
  unreadMessagesCount: number;
  unreadRequestsCount: number;
  isOnboardingCompleted: boolean;
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  searchFilters: {},
  isOffline: false,
  language: 'en',
  notifications: [],
  unreadMessagesCount: 0,
  unreadRequestsCount: 0,
  isOnboardingCompleted: false,
  theme: 'light',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.searchFilters = action.payload;
    },
    
    clearSearchFilters: (state) => {
      state.searchFilters = {};
    },
    
    updateSearchFilter: (state, action: PayloadAction<{ key: keyof SearchFilters; value: any }>) => {
      const { key, value } = action.payload;
      if (value === undefined || value === null || value === '') {
        delete state.searchFilters[key];
      } else {
        state.searchFilters[key] = value;
      }
    },
    
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.read);
    },
    
    setUnreadMessagesCount: (state, action: PayloadAction<number>) => {
      state.unreadMessagesCount = Math.max(0, action.payload);
    },
    
    incrementUnreadMessagesCount: (state) => {
      state.unreadMessagesCount += 1;
    },
    
    decrementUnreadMessagesCount: (state) => {
      state.unreadMessagesCount = Math.max(0, state.unreadMessagesCount - 1);
    },
    
    setUnreadRequestsCount: (state, action: PayloadAction<number>) => {
      state.unreadRequestsCount = Math.max(0, action.payload);
    },
    
    incrementUnreadRequestsCount: (state) => {
      state.unreadRequestsCount += 1;
    },
    
    decrementUnreadRequestsCount: (state) => {
      state.unreadRequestsCount = Math.max(0, state.unreadRequestsCount - 1);
    },
    
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingCompleted = action.payload;
    },
    
    completeOnboarding: (state) => {
      state.isOnboardingCompleted = true;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setSearchFilters,
  clearSearchFilters,
  updateSearchFilter,
  setOfflineStatus,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  clearReadNotifications,
  setUnreadMessagesCount,
  incrementUnreadMessagesCount,
  decrementUnreadMessagesCount,
  setUnreadRequestsCount,
  incrementUnreadRequestsCount,
  decrementUnreadRequestsCount,
  setOnboardingCompleted,
  completeOnboarding,
  setTheme,
  toggleTheme,
} = appSlice.actions;

export default appSlice.reducer;