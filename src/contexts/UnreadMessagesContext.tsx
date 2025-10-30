import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';

interface UnreadMessagesContextType {
  unreadMessagesCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export const UnreadMessagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { socket, connected, onMessage, offMessage } = useSocket();
  const { user } = useUser();

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get<{ unreadCount: number }>('/messages/unread-count');
      if (response?.success && response?.data) {
        setUnreadMessagesCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread messages count:', error);
    }
  };

  // Refresh unread count (public method)
  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (data: any) => {
      // Only increment if the message is for the current user
      if (data.receiverId === user?.id) {
        setUnreadMessagesCount(prev => prev + 1);
      }
    };

    const handleMessageRead = () => {
      // Refresh count when messages are marked as read
      fetchUnreadCount();
    };

    // Subscribe to socket events
    onMessage('new_message', handleNewMessage);
    onMessage('messages_read', handleMessageRead);

    return () => {
      offMessage('new_message', handleNewMessage);
      offMessage('messages_read', handleMessageRead);
    };
  }, [socket, connected, user]);

  // Polling fallback when socket is not connected
  useEffect(() => {
    if (socket && connected) return; // Don't poll if socket is connected

    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [socket, connected, user]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadMessagesCount, refreshUnreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = (): UnreadMessagesContextType => {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error('useUnreadMessages must be used within a UnreadMessagesProvider');
  }
  return context;
};
