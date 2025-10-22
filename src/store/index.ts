import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import teachersReducer from './slices/teachersSlice';
import requestsReducer from './slices/requestsSlice';
import messagesReducer from './slices/messagesSlice';

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'], // Only persist auth and app state
  blacklist: ['teachers', 'requests', 'messages'], // Don't persist these (they'll be fetched fresh)
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'tokens', 'isAuthenticated'], // Only persist essential auth data
};

const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  whitelist: ['theme', 'language', 'isOnboardingCompleted'], // Only persist app preferences
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedAppReducer = persistReducer(appPersistConfig, appReducer);

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  app: persistedAppReducer,
  teachers: teachersReducer,
  requests: requestsReducer,
  messages: messagesReducer,
});

// Create the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Create the persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export { useAppDispatch, useAppSelector } from './hooks';