import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { profileService } from '../services';
import { changeLanguage, isRTL, getAvailableLanguages } from '../i18n';
import { Language } from '../types';

interface LanguageContextType {
  currentLanguage: string;
  isCurrentRTL: boolean;
  availableLanguages: Language[];
  changeLanguage: (language: string, updateProfile?: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  
  // Initialize with fallback languages to prevent empty array
  const fallbackLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  ];
  
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(fallbackLanguages);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableLanguages();
    loadUserLanguage();
  }, []);

  useEffect(() => {
    // Listen for language changes in i18n
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const loadAvailableLanguages = async () => {
    try {
      const response = await profileService.getAvailableLanguages();
      if (response.success && response.data) {
        setAvailableLanguages(response.data);
      }
    } catch (error) {
      console.error('Failed to load available languages:', error);
      // Ensure we always have fallback languages (Arabic and English only)
      const fallbackLanguages: Language[] = [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      ];
      setAvailableLanguages(fallbackLanguages);
      if (__DEV__) {
        console.log('🔄 Using fallback languages for development:', fallbackLanguages);
      }
    }
  };

  const loadUserLanguage = async () => {
    try {
      const response = await profileService.getCurrentLanguage();
      if (response.success && response.data?.language) {
        const userLanguage = response.data.language;
        if (userLanguage !== currentLanguage) {
          await changeLanguage(userLanguage, false);
        }
      }
    } catch (error) {
      console.error('Failed to load user language:', error);
      // Continue with current language - this is acceptable behavior
      if (__DEV__) {
        console.log('🔄 Using current language for development');
      }
    }
  };

  const handleLanguageChange = async (language: string, updateProfile = true) => {
    setLoading(true);
    setError(null);

    try {
      // Update local i18n
      await changeLanguage(language);
      setCurrentLanguage(language);

      // Update user profile if requested
      if (updateProfile) {
        const response = await profileService.updateLanguage(language);
        if (!response.success) {
          // In development, allow local language change even if server update fails
          if (__DEV__) {
            console.log('🔄 Language changed locally for development, server update failed');
          } else {
            throw new Error(response.message || 'Failed to update language preference');
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change language';
      
      // In development, don't show error for server unavailability
      if (__DEV__) {
        console.log('🔄 Language changed locally for development');
      } else {
        setError(errorMessage);
        console.error('Language change error:', err);
        throw err; // Re-throw so components can handle it
      }
    } finally {
      setLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    isCurrentRTL: isRTL(currentLanguage),
    availableLanguages,
    changeLanguage: handleLanguageChange,
    loading,
    error,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;