import { apiClient } from './apiClient';
import {
  Review,
  ReviewWithDetails,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const reviewService = {
  async createReview(reviewData: {
    requestId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<Review>> {
    return apiClient.post('/reviews', reviewData);
  },

  async getReviews(
    teacherId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ReviewWithDetails>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (teacherId) {
      params.append('teacherId', teacherId);
    }

    return apiClient.get(`/reviews?${params.toString()}`);
  },

  async getReviewById(reviewId: string): Promise<ApiResponse<ReviewWithDetails>> {
    return apiClient.get(`/reviews/${reviewId}`);
  },

  async updateReview(
    reviewId: string,
    updates: {
      rating?: number;
      comment?: string;
    }
  ): Promise<ApiResponse<Review>> {
    return apiClient.patch(`/reviews/${reviewId}`, updates);
  },

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};