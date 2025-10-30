import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { apiClient } from '../services/apiClient';
import { useUser } from './UserContext';

interface Notification {
  id: string;
  userId: string;
  type: 'new_request' | 'request_update';
  title: string;
  body: string;
  data: any;
  timestamp: number;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Fetch notifications from server
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) {
      console.log('⚠️ Cannot fetch notifications - not authenticated or no user');
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      // Add cache-busting header to prevent 304 responses
      const response = await apiClient.get('/notifications', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📬 Notification API response:', {
        success: response?.success,
        notificationCount: response?.notifications?.length || 0,
        currentUserId: user.id,
        firstNotification: response?.notifications?.[0]
      });
      
      // apiClient.get returns the response data directly
      if (response && response.success) {
        const allNotifications = response.notifications || [];
        
        // Deduplicate notifications by ID (in case Redis has duplicates)
        const uniqueNotifications = allNotifications.reduce((acc: Notification[], curr: Notification) => {
          if (!acc.some(n => n.id === curr.id)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        setNotifications(uniqueNotifications);
        console.log(`✅ Loaded ${uniqueNotifications.length} unique notifications for user ${user.id}`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for notifications every 10 seconds when app is active
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling interval
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 10000); // Poll every 10 seconds

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchNotifications();
      }
    });

    return () => {
      clearInterval(pollInterval);
      subscription.remove();
    };
  }, [isAuthenticated, user?.id]);

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      // Persist to backend
      await apiClient.patch(`/notifications/${notificationId}/read`);
      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Revert on error
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // Persist to backend
      await apiClient.patch('/notifications/read-all');
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
