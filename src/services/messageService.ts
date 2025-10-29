import { apiClient } from './apiClient';
import {
  Conversation,
  ConversationWithDetails,
  Message,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const messageService = {
  async getConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ConversationWithDetails>>> {
    return apiClient.get(`/conversations?page=${page}&limit=${limit}`);
  },

  async createConversation(userIds: string[]): Promise<ApiResponse<Conversation>> {
    return apiClient.post('/conversations', { userIds });
  },

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return apiClient.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  async sendMessage(
    conversationId: string,
    messageData: {
      receiverId: string;
      body: string;
      attachments?: string[];
    }
  ): Promise<ApiResponse<Message>> {
    return apiClient.post(`/conversations/${conversationId}/messages`, messageData);
  },

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`/messages/${messageId}/read`);
  },

  async markConversationAsRead(conversationId: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`/conversations/${conversationId}/read`);
  },

  async uploadAttachment(formData: FormData): Promise<ApiResponse<{ url: string }>> {
    return apiClient.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};