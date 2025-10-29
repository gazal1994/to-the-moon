import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import he from './locales/he.json';

// RTL languages (Turkish is LTR)
const RTL_LANGUAGES = ['ar', 'he']; // Arabic, Hebrew

// Check if language is RTL
export const isRTL = (language: string) => {
  return RTL_LANGUAGES.includes(language);
};

// Initialize i18n synchronously with minimal config
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      he: { translation: he },
    },
    lng: 'en',
    fallbackLng: 'en',
    debug: false, // Disable debug to avoid potential issues
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Change language - simplified without AsyncStorage persistence
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
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

export default i18n;