import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants';
import { profileService, NotificationSettings as NotificationSettingsType } from '../../services/profileService';

interface NotificationSettingsProps {
  onSettingsChange?: (settings: NotificationSettingsType) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSettingsChange }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    reviewNotifications: true,
    systemNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await profileService.getNotificationSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        onSettingsChange?.(response.data);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      
      // For development: use default notification settings when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using default notification settings for development');
        const defaultSettings: NotificationSettingsType = {
          emailNotifications: true,
          pushNotifications: true,
          messageNotifications: true,
          reviewNotifications: true,
          systemNotifications: true,
        };
        setSettings(defaultSettings);
        onSettingsChange?.(defaultSettings);
      } else {
        Alert.alert(t('common.error'), t('profile.failedToLoadNotifications'));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettingsType, value: boolean) => {
    setUpdating(true);
    try {
      const updatedSettings = { ...settings, [key]: value };
      const response = await profileService.updateNotificationSettings({ [key]: value });
      
      if (response.success) {
        setSettings(updatedSettings);
        onSettingsChange?.(updatedSettings);
      } else {
        throw new Error(response.message || 'Failed to update notification setting');
      }
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      
      // For development: allow local updates when server is unavailable
      if (__DEV__) {
        console.log('🔄 Using local notification setting update for development');
        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);
        onSettingsChange?.(updatedSettings);
      } else {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('profile.failedToUpdateNotification')
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const renderNotificationItem = (
    title: string,
    description: string,
    key: keyof NotificationSettingsType,
    icon: string
  ) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        disabled={updating}
        trackColor={{ false: COLORS.lightGray, true: COLORS.linkedinBlue + '40' }}
        thumbColor={settings[key] ? COLORS.linkedinBlue : COLORS.white}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.notificationSettings')}</Text>
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
        <Text style={styles.headerTitle}>{t('profile.notificationSettings')}</Text>
        <Text style={styles.headerDescription}>{t('profile.notificationDescription')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderNotificationItem(
          t('profile.emailNotifications'),
          t('profile.emailNotificationsDesc'),
          'emailNotifications',
          '📧'
        )}

        {renderNotificationItem(
          t('profile.pushNotifications'),
          t('profile.pushNotificationsDesc'),
          'pushNotifications',
          '🔔'
        )}

        {renderNotificationItem(
          t('profile.messageNotifications'),
          t('profile.messageNotificationsDesc'),
          'messageNotifications',
          '💬'
        )}

        {renderNotificationItem(
          t('profile.reviewNotifications'),
          t('profile.reviewNotificationsDesc'),
          'reviewNotifications',
          '⭐'
        )}

        {renderNotificationItem(
          t('profile.systemNotifications'),
          t('profile.systemNotificationsDesc'),
          'systemNotifications',
          '⚙️'
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
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.linkedinBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationSettings;