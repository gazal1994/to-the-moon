export interface Conversation {
  id: string;
  userIds: string[];
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  attachments?: string[];
  createdAt: string;
  isRead: boolean;
}

export interface ConversationWithDetails extends Conversation {
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    body: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}