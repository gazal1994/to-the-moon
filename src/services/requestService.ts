import { apiClient } from './apiClient';
import {
  Request,
  RequestWithDetails,
  RequestStatus,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const requestService = {
  async createRequest(requestData: {
    teacherId: string;
    subject: string;
    preferredMode: 'online' | 'in_person';
    preferredTime: string;
    message?: string;
  }): Promise<ApiResponse<Request>> {
    return apiClient.post('/requests', requestData);
  },

  async getRequests(
    as: 'student' | 'teacher',
    status?: RequestStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<RequestWithDetails>>> {
    const params = new URLSearchParams({
      as,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return apiClient.get(`/requests?${params.toString()}`);
  },

  async getRequestById(requestId: string): Promise<ApiResponse<RequestWithDetails>> {
    return apiClient.get(`/requests/${requestId}`);
  },

  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    message?: string
  ): Promise<ApiResponse<Request>> {
    return apiClient.patch(`/requests/${requestId}`, { status, message });
  },

  async acceptRequest(requestId: string, message?: string): Promise<ApiResponse<Request>> {
    return this.updateRequestStatus(requestId, RequestStatus.ACCEPTED, message);
  },

  async rejectRequest(requestId: string, message?: string): Promise<ApiResponse<Request>> {
    return this.updateRequestStatus(requestId, RequestStatus.REJECTED, message);
  },

  async cancelRequest(requestId: string, message?: string): Promise<ApiResponse<Request>> {
    return this.updateRequestStatus(requestId, RequestStatus.CANCELED, message);
  },

  async completeRequest(requestId: string): Promise<ApiResponse<Request>> {
    return this.updateRequestStatus(requestId, RequestStatus.COMPLETED);
  },
};