export interface Review {
  id: string;
  requestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface ReviewWithDetails extends Review {
  reviewer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  reviewee: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}