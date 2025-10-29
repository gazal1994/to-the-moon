import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants';
import { profileService, UserPreferences } from '../../services/profileService';
import { LanguageSelector } from '../LanguageSelector';

interface PreferencesSectionProps {
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ onPreferencesChange }) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    autoPlayVideos: true,
    downloadQuality: 'medium',
    cellularDataUsage: false,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await profileService.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
        onPreferencesChange?.(response.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      
      // For development: use default preferences when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using default preferences for development');
        const defaultPreferences: UserPreferences = {
          theme: 'system',
          autoPlayVideos: true,
          downloadQuality: 'medium',
          cellularDataUsage: false,
        };
        setPreferences(defaultPreferences);
        onPreferencesChange?.(defaultPreferences);
      } else {
        Alert.alert(t('common.error'), t('profile.failedToLoadPreferences'));
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    setUpdating(true);
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      const response = await profileService.updatePreferences({ [key]: value });
      
      if (response.success) {
        setPreferences(updatedPreferences);
        onPreferencesChange?.(updatedPreferences);
      } else {
        throw new Error(response.message || 'Failed to update preference');
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      
      // For development: allow local updates when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using local preference update for development');
        const updatedPreferences = { ...preferences, [key]: value };
        setPreferences(updatedPreferences);
        onPreferencesChange?.(updatedPreferences);
      } else {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('profile.failedToUpdatePreference')
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const renderPreferenceItem = (
    title: string,
    description: string,
    key: keyof UserPreferences,
    type: 'switch' | 'select',
    options?: Array<{ label: string; value: any }>
  ) => {
    if (type === 'switch') {
      return (
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceDescription}>{description}</Text>
          </View>
          <Switch
            value={preferences[key] as boolean}
            onValueChange={(value) => updatePreference(key, value)}
            disabled={updating}
            trackColor={{ false: COLORS.lightGray, true: COLORS.linkedinBlue + '40' }}
            thumbColor={preferences[key] ? COLORS.linkedinBlue : COLORS.white}
          />
        </View>
      );
    }

    if (type === 'select' && options) {
      return (
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceDescription}>{description}</Text>
            <Text style={styles.preferenceValue}>
              {options.find(opt => opt.value === preferences[key])?.label || preferences[key]}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => showSelectOptions(title, key, options)}
            disabled={updating}
          >
            <Text style={styles.selectButtonText}>▼</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const showSelectOptions = (title: string, key: keyof UserPreferences, options: Array<{ label: string; value: any }>) => {
    Alert.alert(
      title,
      undefined,
      [
        ...options.map(option => ({
          text: option.label,
          onPress: () => updatePreference(key, option.value),
        })),
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleLanguageChange = (language: string) => {
    // Language change is handled by the LanguageSelector component
    // This callback can be used for additional actions if needed
    console.log('Language changed to:', language);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.preferences')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.preferences')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <Text style={styles.sectionDescription}>{t('profile.languageDescription')}</Text>
          <LanguageSelector 
            style={styles.languageSelector}
            updateProfile={true}
            onLanguageChange={handleLanguageChange}
          />
        </View>

        {/* Theme Selection */}
        {renderPreferenceItem(
          t('profile.theme'),
          t('profile.themeDescription'),
          'theme',
          'select',
          [
            { label: t('profile.lightTheme'), value: 'light' },
            { label: t('profile.darkTheme'), value: 'dark' },
            { label: t('profile.systemTheme'), value: 'system' },
          ]
        )}

        {/* Video Preferences */}
        {renderPreferenceItem(
          t('profile.autoPlayVideos'),
          t('profile.autoPlayDescription'),
          'autoPlayVideos',
          'switch'
        )}

        {renderPreferenceItem(
          t('profile.downloadQuality'),
          t('profile.downloadQualityDescription'),
          'downloadQuality',
          'select',
          [
            { label: t('profile.lowQuality'), value: 'low' },
            { label: t('profile.mediumQuality'), value: 'medium' },
            { label: t('profile.highQuality'), value: 'high' },
          ]
        )}

        {/* Data Usage */}
        {renderPreferenceItem(
          t('profile.cellularDataUsage'),
          t('profile.cellularDataDescription'),
          'cellularDataUsage',
          'switch'
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    margin: 16,
    ...SHADOWS.medium,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  languageSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  languageSelector: {
    alignSelf: 'flex-start',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    color: COLORS.linkedinBlue,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray + '40',
    marginTop: 8,
  },
  selectButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default PreferencesSection;