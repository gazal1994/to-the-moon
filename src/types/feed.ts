export interface Comment {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface FeedItem {
  id: number;
  type: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  commentsList?: Comment[];
}