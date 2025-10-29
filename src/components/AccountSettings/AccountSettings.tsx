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
import { profileService, AccountSettings as AccountSettingsType } from '../../services/profileService';

interface AccountSettingsProps {
  onSettingsChange?: (settings: AccountSettingsType) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onSettingsChange }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AccountSettingsType>({
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public',
    showOnlineStatus: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await profileService.getAccountSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        onSettingsChange?.(response.data);
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
      
      // For development: use default settings when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using default account settings for development');
        const defaultSettings: AccountSettingsType = {
          emailNotifications: true,
          pushNotifications: true,
          profileVisibility: 'public',
          showOnlineStatus: true,
        };
        setSettings(defaultSettings);
        onSettingsChange?.(defaultSettings);
      } else {
        Alert.alert(t('common.error'), t('profile.failedToLoadSettings'));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AccountSettingsType, value: any) => {
    setUpdating(true);
    try {
      const updatedSettings = { ...settings, [key]: value };
      const response = await profileService.updateAccountSettings({ [key]: value });
      
      if (response.success) {
        setSettings(updatedSettings);
        onSettingsChange?.(updatedSettings);
      } else {
        throw new Error(response.message || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      
      // For development: allow local updates when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using local setting update for development');
        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);
        onSettingsChange?.(updatedSettings);
      } else {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('profile.failedToUpdateSetting')
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const renderSettingItem = (
    title: string,
    key: keyof AccountSettingsType,
    type: 'switch' | 'select',
    options?: Array<{ label: string; value: any }>
  ) => {
    if (type === 'switch') {
      return (
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
          </View>
          <Switch
            value={settings[key] as boolean}
            onValueChange={(value) => updateSetting(key, value)}
            disabled={updating}
            trackColor={{ false: COLORS.lightGray, true: COLORS.linkedinBlue + '40' }}
            thumbColor={settings[key] ? COLORS.linkedinBlue : COLORS.white}
          />
        </View>
      );
    }

    if (type === 'select' && options) {
      return (
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingValue}>
              {options.find(opt => opt.value === settings[key])?.label || settings[key]}
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

  const showSelectOptions = (title: string, key: keyof AccountSettingsType, options: Array<{ label: string; value: any }>) => {
    Alert.alert(
      title,
      undefined,
      [
        ...options.map(option => ({
          text: option.label,
          onPress: () => updateSetting(key, option.value),
        })),
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.accountSettings')}</Text>
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
        <Text style={styles.headerTitle}>{t('profile.accountSettings')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderSettingItem(
          t('profile.emailNotifications'),
          'emailNotifications',
          'switch'
        )}

        {renderSettingItem(
          t('profile.pushNotifications'),
          'pushNotifications',
          'switch'
        )}

        {renderSettingItem(
          t('profile.profileVisibility'),
          'profileVisibility',
          'select',
          [
            { label: t('profile.public'), value: 'public' },
            { label: t('profile.private'), value: 'private' },
            { label: t('profile.friendsOnly'), value: 'friends' },
          ]
        )}

        {renderSettingItem(
          t('profile.showOnlineStatus'),
          'showOnlineStatus',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray + '40',
  },
  selectButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default AccountSettings;