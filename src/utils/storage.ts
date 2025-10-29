import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@aqra_user',
  AUTH_TOKENS: '@aqra_auth_tokens',
  ONBOARDING_COMPLETED: '@aqra_onboarding_completed',
  LANGUAGE: '@aqra_language',
};

export const StorageService = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Specific methods for common operations
  async setUser(user: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER, user);
  },

  async getUser(): Promise<any> {
    return this.getItem(STORAGE_KEYS.USER);
  },

  async removeUser(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER);
  },

  async setAuthTokens(tokens: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKENS, tokens);
  },

  async getAuthTokens(): Promise<any> {
    return this.getItem(STORAGE_KEYS.AUTH_TOKENS);
  },

  async removeAuthTokens(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKENS);
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    return this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },

  async getOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed ?? false;
  },

  async setLanguage(language: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  async getLanguage(): Promise<string> {
    const language = await this.getItem<string>(STORAGE_KEYS.LANGUAGE);
    return language ?? 'en';
  },
};