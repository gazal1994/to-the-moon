import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { isRTL } from '../i18n';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTLLayout = isRTL(currentLanguage);

  // Note: I18nManager.forceRTL() requires app restart in React Native
  // For now, we'll handle RTL layout manually in components
  I18nManager.allowRTL(true);

  return {
    isRTL: isRTLLayout,
    textAlign: (isRTLLayout ? 'right' : 'left') as 'left' | 'right',
    flexDirection: (isRTLLayout ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    writingDirection: isRTLLayout ? 'rtl' : 'ltr',
  };
};