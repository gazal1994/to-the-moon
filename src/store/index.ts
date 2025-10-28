import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import teachersReducer from './slices/teachersSlice';
import requestsReducer from './slices/requestsSlice';
import messagesReducer from './slices/messagesSlice';

// Combine all reducers - persistence disabled to avoid global property conflicts
const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  teachers: teachersReducer,
  requests: requestsReducer,
  messages: messagesReducer,
});

// Create the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: __DEV__,
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export { useAppDispatch, useAppSelector } from './hooks';