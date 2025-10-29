import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '../utils';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatarUrl?: string;
  phone?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage and API on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      
      // First, check if we have auth tokens
      const tokens = await StorageService.getAuthTokens();
      
      if (!tokens?.accessToken) {
        console.log('⚠️ No auth tokens found');
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to load user from storage first (for quick UI update)
      const storedUser = await StorageService.getUser();
      if (storedUser) {
        console.log('✅ Loaded user from storage:', storedUser.name);
        setUser(storedUser);
      }

      // Then fetch fresh user data from API
      const response = await apiClient.get('/users/me');
      
      if (response.success && response.data) {
        const userData = response.data as User;
        console.log('✅ Loaded user from API:', userData.name);
        
        // Update state and storage
        setUser(userData);
        await StorageService.setUser(userData);
      } else {
        console.log('⚠️ Failed to load user from API');
        // If API fails but we have stored user, keep using it
        if (!storedUser) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
      
      // Try to use stored user as fallback
      try {
        const storedUser = await StorageService.getUser();
        if (storedUser) {
          console.log('⚠️ Using stored user as fallback');
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (storageError) {
        console.error('❌ Error loading user from storage:', storageError);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const updateUser = async (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      await StorageService.setUser(newUser);
    } else {
      await StorageService.removeUser();
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: updateUser,
        isAuthenticated: !!user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
