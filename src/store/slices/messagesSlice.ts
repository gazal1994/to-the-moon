import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatRoom } from '../../types';
import { messageService } from '../../services';

interface MessagesState {
  chatRooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Record<string, Message[]>; // roomId -> messages
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  hasMoreMessages: Record<string, boolean>; // roomId -> hasMore
  isTyping: Record<string, boolean>; // roomId -> isTyping
}

const initialState: MessagesState = {
  chatRooms: [],
  activeRoom: null,
  messages: {},
  isLoading: false,
  error: null,
  unreadCount: 0,
  hasMoreMessages: {},
  isTyping: {},
};

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'messages/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getChatRooms();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch chat rooms');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (
    { roomId, page = 1, limit = 50 }: { roomId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageService.getMessages(roomId, page, limit);
      
      if (response.success && response.data) {
        return {
          roomId,
          messages: response.data.data,
          hasMore: response.data.hasMore,
          page,
        };
      } else {
        return rejectWithValue(response.error || 'Failed to fetch messages');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    { roomId, content, type = 'text' }: { roomId: string; content: string; type?: 'text' | 'image' | 'file' },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageService.sendMessage(roomId, content, type);
      
      if (response.success && response.data) {
        return {
          roomId,
          message: response.data,
        };
      } else {
        return rejectWithValue(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markMessagesAsRead',
  async ({ roomId }: { roomId: string }, { rejectWithValue }) => {
    try {
      const response = await messageService.markAsRead(roomId);
      
      if (response.success) {
        return { roomId };
      } else {
        return rejectWithValue(response.error || 'Failed to mark messages as read');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChatRoom = createAsyncThunk(
  'messages/createChatRoom',
  async (
    { participantId, requestId }: { participantId: string; requestId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageService.createChatRoom(participantId, requestId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to create chat room');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.activeRoom = action.payload;
      
      // Mark messages as read when room becomes active
      if (action.payload) {
        const roomId = action.payload.id;
        const roomIndex = state.chatRooms.findIndex(room => room.id === roomId);
        if (roomIndex >= 0) {
          state.chatRooms[roomIndex].unreadCount = 0;
        }
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    addMessage: (state, action: PayloadAction<{ roomId: string; message: Message }>) => {
      const { roomId, message } = action.payload;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      state.messages[roomId].push(message);
      
      // Update chat room with latest message
      const roomIndex = state.chatRooms.findIndex(room => room.id === roomId);
      if (roomIndex >= 0) {
        state.chatRooms[roomIndex].lastMessage = message;
        state.chatRooms[roomIndex].updatedAt = message.createdAt;
        
        // Increment unread count if room is not active
        if (!state.activeRoom || state.activeRoom.id !== roomId) {
          state.chatRooms[roomIndex].unreadCount += 1;
          state.unreadCount += 1;
        }
      }
    },
    
    updateMessage: (state, action: PayloadAction<{ roomId: string; messageId: string; updates: Partial<Message> }>) => {
      const { roomId, messageId, updates } = action.payload;
      
      if (state.messages[roomId]) {
        const messageIndex = state.messages[roomId].findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[roomId][messageIndex] = { ...state.messages[roomId][messageIndex], ...updates };
        }
      }
    },
    
    setTypingStatus: (state, action: PayloadAction<{ roomId: string; isTyping: boolean }>) => {
      const { roomId, isTyping } = action.payload;
      state.isTyping[roomId] = isTyping;
    },
    
    updateUnreadCount: (state) => {
      state.unreadCount = state.chatRooms.reduce((total, room) => total + room.unreadCount, 0);
    },
    
    removeChatRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      state.chatRooms = state.chatRooms.filter(room => room.id !== roomId);
      delete state.messages[roomId];
      delete state.hasMoreMessages[roomId];
      delete state.isTyping[roomId];
      
      if (state.activeRoom?.id === roomId) {
        state.activeRoom = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms = action.payload;
        state.unreadCount = action.payload.reduce((total, room) => total + room.unreadCount, 0);
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId, messages, hasMore, page } = action.payload;
        
        if (page === 1) {
          state.messages[roomId] = messages.reverse(); // Reverse to show newest at bottom
        } else {
          // Prepend older messages
          const existingMessages = state.messages[roomId] || [];
          state.messages[roomId] = [...messages.reverse(), ...existingMessages];
        }
        
        state.hasMoreMessages[roomId] = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { roomId, message } = action.payload;
        
        if (!state.messages[roomId]) {
          state.messages[roomId] = [];
        }
        
        state.messages[roomId].push(message);
        
        // Update chat room with latest message
        const roomIndex = state.chatRooms.findIndex(room => room.id === roomId);
        if (roomIndex >= 0) {
          state.chatRooms[roomIndex].lastMessage = message;
          state.chatRooms[roomIndex].updatedAt = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { roomId } = action.payload;
        const roomIndex = state.chatRooms.findIndex(room => room.id === roomId);
        if (roomIndex >= 0) {
          const oldUnreadCount = state.chatRooms[roomIndex].unreadCount;
          state.chatRooms[roomIndex].unreadCount = 0;
          state.unreadCount = Math.max(0, state.unreadCount - oldUnreadCount);
        }
      })
      
      // Create chat room
      .addCase(createChatRoom.fulfilled, (state, action) => {
        const newRoom = action.payload;
        const existingIndex = state.chatRooms.findIndex(room => room.id === newRoom.id);
        
        if (existingIndex >= 0) {
          state.chatRooms[existingIndex] = newRoom;
        } else {
          state.chatRooms.unshift(newRoom); // Add to beginning
        }
        
        state.activeRoom = newRoom;
      });
  },
});

export const {
  setActiveRoom,
  clearError,
  addMessage,
  updateMessage,
  setTypingStatus,
  updateUnreadCount,
  removeChatRoom,
} = messagesSlice.actions;

export default messagesSlice.reducer;