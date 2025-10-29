import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants';
import { useLanguage } from '../../contexts';
import { isRTL } from '../../i18n';

interface LanguageSelectorProps {
  style?: any;
  updateProfile?: boolean; // Whether to update user profile when language changes
  onLanguageChange?: (language: string) => void; // Callback for language change
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  style, 
  updateProfile = false,
  onLanguageChange 
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const {
    currentLanguage,
    isCurrentRTL,
    availableLanguages,
    changeLanguage: changeAppLanguage,
    loading
  } = useLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      console.log('🔄 Language change requested:', languageCode);
      console.log('📋 Available languages:', availableLanguages);
      
      await changeAppLanguage(languageCode, updateProfile);
      
      // Call callback if provided
      if (onLanguageChange) {
        onLanguageChange(languageCode);
      }
      
      setModalVisible(false);
      console.log('✅ Language changed successfully to:', languageCode);
      
    } catch (error) {
      console.error('❌ Language change error:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('profile.languageUpdateFailed')
      );
    }
  };

  // Safety check: ensure availableLanguages is an array
  const safeAvailableLanguages = Array.isArray(availableLanguages) && availableLanguages.length > 0 
    ? availableLanguages 
    : [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      ];
  
  // Debug logging
  console.log('🔍 LanguageSelector Debug:', {
    availableLanguages,
    safeAvailableLanguages,
    length: safeAvailableLanguages.length,
    currentLanguage
  });
  
  const currentLanguageName = safeAvailableLanguages.find(lang => lang.code === currentLanguage)?.nativeName || 'English';

  const renderLanguageItem = ({ item }: { item: any }) => {
    console.log('📝 Rendering language item:', item);
    if (!item || !item.code) {
      console.warn('LanguageSelector: Invalid language item:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          item.code === currentLanguage && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageChange(item.code)}
      >
        <Text style={[
          styles.languageText,
          item.code === currentLanguage && styles.selectedLanguageText,
          isRTL(item.code) && styles.rtlText,
          { textAlign: isRTL(item.code) ? 'right' : 'left' },
        ]}>
          {item.nativeName || item.name}
        </Text>
        <Text style={[
          styles.languageSubtext,
          item.code === currentLanguage && styles.selectedLanguageSubtext,
          { textAlign: isRTL(item.code) ? 'right' : 'left' },
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector, 
          { flexDirection: isCurrentRTL ? 'row-reverse' : 'row' },
          loading && styles.selectorDisabled
        ]}
        onPress={() => !loading && setModalVisible(true)}
        disabled={loading}
      >
        <Text style={[styles.selectorText, { textAlign: isCurrentRTL ? 'right' : 'left' }]}>
          {loading ? t('common.loading') : currentLanguageName}
        </Text>
        <Text style={styles.arrow}>{loading ? '⟳' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { direction: isCurrentRTL ? 'rtl' : 'ltr' }]}>
            <View style={[styles.modalHeader, { flexDirection: isCurrentRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.modalTitle, { textAlign: isCurrentRTL ? 'right' : 'left' }]}>{t('profile.language')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={safeAvailableLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    No languages available
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                    Available: {JSON.stringify(availableLanguages)}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
    ...SHADOWS.small,
  },
  selectorDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.lightGray + '20',
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    maxHeight: '70%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.lightGray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  languageList: {
    maxHeight: 240,
  },
  languageItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLanguageItem: {
    backgroundColor: COLORS.linkedinBlue + '15',
    borderWidth: 1,
    borderColor: COLORS.linkedinBlue + '30',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedLanguageText: {
    color: COLORS.linkedinBlue,
    fontWeight: '700',
  },
  languageSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  selectedLanguageSubtext: {
    color: COLORS.linkedinBlue,
    fontWeight: '500',
  },
  rtlText: {
    textAlign: 'right',
  },
});

export default LanguageSelector;