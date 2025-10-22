import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserWithProfile, AuthTokens, LoginRequest, RegisterRequest } from '../../types';
import { authService } from '../../services';
import { StorageService } from '../../utils';

interface AuthState {
  user: UserWithProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const [user, tokens] = await Promise.all([
        StorageService.getUser(),
        StorageService.getAuthTokens(),
      ]);

      if (user && tokens) {
        return { user, tokens };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store in AsyncStorage
        await Promise.all([
          StorageService.setUser(user),
          StorageService.setAuthTokens(tokens),
        ]);

        return { user, tokens };
      } else {
        return rejectWithValue(response.error || 'Login failed');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store in AsyncStorage
        await Promise.all([
          StorageService.setUser(user),
          StorageService.setAuthTokens(tokens),
        ]);

        return { user, tokens };
      } else {
        return rejectWithValue(response.error || 'Registration failed');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API
      await authService.logout();
      
      // Clear storage
      await Promise.all([
        StorageService.removeUser(),
        StorageService.removeAuthTokens(),
      ]);

      return null;
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await Promise.all([
        StorageService.removeUser(),
        StorageService.removeAuthTokens(),
      ]);
      return null;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updates: Partial<UserWithProfile>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('No user logged in');
      }

      const updatedUser = { ...currentUser, ...updates };
      await StorageService.setUser(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshAuthTokens = createAsyncThunk(
  'auth/refreshAuthTokens',
  async (tokens: AuthTokens, { rejectWithValue }) => {
    try {
      await StorageService.setAuthTokens(tokens);
      return tokens;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<UserWithProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setTokens: (state, action: PayloadAction<AuthTokens | null>) => {
      state.tokens = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Still logout locally even if API fails
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Refresh tokens
      .addCase(refreshAuthTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      });
  },
});

export const { clearError, setUser, setTokens } = authSlice.actions;
export default authSlice.reducer;