import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserWithProfile, SearchFilters, PaginatedResponse } from '../../types';
import { userService } from '../../services';

interface TeachersState {
  teachers: UserWithProfile[];
  favorites: string[]; // teacher IDs
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchQuery: string;
  filters: SearchFilters;
}

const initialState: TeachersState = {
  teachers: [],
  favorites: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  searchQuery: '',
  filters: {},
};

// Async thunks
export const searchTeachers = createAsyncThunk(
  'teachers/searchTeachers',
  async (
    { 
      filters, 
      page = 1, 
      refresh = false, 
      mockResults 
    }: { 
      filters: SearchFilters; 
      page?: number; 
      refresh?: boolean; 
      mockResults?: UserWithProfile[] 
    },
    { rejectWithValue }
  ) => {
    try {
      // If mock results are provided (development mode), use them directly
      if (mockResults) {
        return {
          data: {
            data: mockResults,
            hasMore: false,
            total: mockResults.length,
            page: 1,
            limit: mockResults.length
          },
          page: 1,
          refresh: true,
        };
      }

      // Real API call
      const response = await userService.searchTeachers(filters, page, 20);
      
      if (response.success && response.data) {
        return {
          data: response.data,
          page,
          refresh,
        };
      } else {
        return rejectWithValue(response.error || 'Failed to search teachers');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTeacherDetails = createAsyncThunk(
  'teachers/getTeacherDetails',
  async (teacherId: string, { rejectWithValue }) => {
    try {
      const response = await userService.getTeacherById(teacherId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to get teacher details');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    
    updateFilter: (state, action: PayloadAction<{ key: keyof SearchFilters; value: any }>) => {
      const { key, value } = action.payload;
      if (value === undefined || value === null || value === '') {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const teacherId = action.payload;
      const index = state.favorites.indexOf(teacherId);
      
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(teacherId);
      }
    },
    
    addToFavorites: (state, action: PayloadAction<string>) => {
      const teacherId = action.payload;
      if (!state.favorites.includes(teacherId)) {
        state.favorites.push(teacherId);
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const teacherId = action.payload;
      state.favorites = state.favorites.filter(id => id !== teacherId);
    },
    
    updateTeacherInList: (state, action: PayloadAction<UserWithProfile>) => {
      const updatedTeacher = action.payload;
      const index = state.teachers.findIndex(teacher => teacher.id === updatedTeacher.id);
      
      if (index >= 0) {
        state.teachers[index] = updatedTeacher;
      }
    },
    
    resetSearch: (state) => {
      state.teachers = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search teachers
      .addCase(searchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page, refresh } = action.payload;
        
        if (refresh || page === 1) {
          state.teachers = data.data;
        } else {
          state.teachers.push(...data.data);
        }
        
        state.currentPage = page;
        state.hasMore = data.hasMore;
      })
      .addCase(searchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get teacher details
      .addCase(getTeacherDetails.fulfilled, (state, action) => {
        const teacher = action.payload;
        const index = state.teachers.findIndex(t => t.id === teacher.id);
        
        if (index >= 0) {
          state.teachers[index] = teacher;
        } else {
          state.teachers.unshift(teacher);
        }
      });
  },
});

export const {
  clearError,
  setSearchQuery,
  setFilters,
  updateFilter,
  clearFilters,
  toggleFavorite,
  addToFavorites,
  removeFromFavorites,
  updateTeacherInList,
  resetSearch,
} = teachersSlice.actions;

export default teachersSlice.reducer;