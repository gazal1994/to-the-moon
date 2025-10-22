import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RequestWithDetails, RequestStatus } from '../../types';
import { requestService } from '../../services';

interface RequestsState {
  receivedRequests: RequestWithDetails[];
  sentRequests: RequestWithDetails[];
  isLoading: boolean;
  error: string | null;
  receivedHasMore: boolean;
  sentHasMore: boolean;
  receivedPage: number;
  sentPage: number;
}

const initialState: RequestsState = {
  receivedRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,
  receivedHasMore: true,
  sentHasMore: true,
  receivedPage: 1,
  sentPage: 1,
};

// Async thunks
export const createLessonRequest = createAsyncThunk(
  'requests/createLessonRequest',
  async (
    requestData: {
      teacherId: string;
      subject: string;
      preferredMode: 'online' | 'in_person';
      preferredTime: string;
      message?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await requestService.createRequest(requestData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to create request');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReceivedRequests = createAsyncThunk(
  'requests/fetchReceivedRequests',
  async (
    { page = 1, status, refresh = false }: { page?: number; status?: RequestStatus; refresh?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await requestService.getRequests('teacher', status, page, 20);
      
      if (response.success && response.data) {
        return {
          data: response.data,
          page,
          refresh,
        };
      } else {
        return rejectWithValue(response.error || 'Failed to fetch received requests');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  'requests/fetchSentRequests',
  async (
    { page = 1, status, refresh = false }: { page?: number; status?: RequestStatus; refresh?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await requestService.getRequests('student', status, page, 20);
      
      if (response.success && response.data) {
        return {
          data: response.data,
          page,
          refresh,
        };
      } else {
        return rejectWithValue(response.error || 'Failed to fetch sent requests');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateRequestStatus',
  async (
    { requestId, status, message }: { requestId: string; status: RequestStatus; message?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await requestService.updateRequestStatus(requestId, status, message);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to update request status');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  'requests/acceptRequest',
  async ({ requestId, message }: { requestId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await requestService.acceptRequest(requestId, message);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to accept request');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'requests/rejectRequest',
  async ({ requestId, message }: { requestId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await requestService.rejectRequest(requestId, message);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to reject request');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    updateRequestInList: (state, action: PayloadAction<{ requestId: string; updates: Partial<RequestWithDetails> }>) => {
      const { requestId, updates } = action.payload;
      
      // Update in received requests
      const receivedIndex = state.receivedRequests.findIndex(req => req.id === requestId);
      if (receivedIndex >= 0) {
        state.receivedRequests[receivedIndex] = { ...state.receivedRequests[receivedIndex], ...updates };
      }
      
      // Update in sent requests
      const sentIndex = state.sentRequests.findIndex(req => req.id === requestId);
      if (sentIndex >= 0) {
        state.sentRequests[sentIndex] = { ...state.sentRequests[sentIndex], ...updates };
      }
    },
    
    removeRequestFromList: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.receivedRequests = state.receivedRequests.filter(req => req.id !== requestId);
      state.sentRequests = state.sentRequests.filter(req => req.id !== requestId);
    },
    
    resetReceivedRequests: (state) => {
      state.receivedRequests = [];
      state.receivedPage = 1;
      state.receivedHasMore = true;
    },
    
    resetSentRequests: (state) => {
      state.sentRequests = [];
      state.sentPage = 1;
      state.sentHasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create request
      .addCase(createLessonRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLessonRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // The request will be fetched in the sent requests list
      })
      .addCase(createLessonRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch received requests
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page, refresh } = action.payload;
        
        if (refresh || page === 1) {
          state.receivedRequests = data.data;
        } else {
          state.receivedRequests.push(...data.data);
        }
        
        state.receivedPage = page;
        state.receivedHasMore = data.hasMore;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch sent requests
      .addCase(fetchSentRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page, refresh } = action.payload;
        
        if (refresh || page === 1) {
          state.sentRequests = data.data;
        } else {
          state.sentRequests.push(...data.data);
        }
        
        state.sentPage = page;
        state.sentHasMore = data.hasMore;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update request status (accept/reject)
      .addCase(acceptRequest.fulfilled, (state, action) => {
        const updatedRequest = action.payload;
        const index = state.receivedRequests.findIndex(req => req.id === updatedRequest.id);
        if (index >= 0) {
          state.receivedRequests[index].status = updatedRequest.status;
          state.receivedRequests[index].updatedAt = updatedRequest.updatedAt;
        }
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const updatedRequest = action.payload;
        const index = state.receivedRequests.findIndex(req => req.id === updatedRequest.id);
        if (index >= 0) {
          state.receivedRequests[index].status = updatedRequest.status;
          state.receivedRequests[index].updatedAt = updatedRequest.updatedAt;
        }
      });
  },
});

export const {
  clearError,
  updateRequestInList,
  removeRequestFromList,
  resetReceivedRequests,
  resetSentRequests,
} = requestsSlice.actions;

export default requestsSlice.reducer;