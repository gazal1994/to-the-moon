import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import he from './locales/he.json';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'selectedLanguage';

// RTL languages (Turkish is LTR)
const RTL_LANGUAGES = ['ar', 'he']; // Arabic, Hebrew

// Get device locale
const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode || 'en';
};

// Get stored language or device locale
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      return storedLanguage;
    }
    return getDeviceLocale();
  } catch (error) {
    console.error('Error getting stored language:', error);
    return 'en';
  }
};

// Save language preference
export const saveLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Check if language is RTL
export const isRTL = (language: string) => {
  return RTL_LANGUAGES.includes(language);
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ar: { translation: ar },
        he: { translation: he },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      debug: __DEV__,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

// Change language
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await saveLanguagePreference(language);
    
    // Note: RTL layout is handled by React Native I18nManager
    // which is managed in the useRTL hook
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Get available languages (only languages with translation files)
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
];

// Initialize i18n
initI18n();

export default i18n;