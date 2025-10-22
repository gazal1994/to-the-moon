import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import {
  ProfileHeader,
  AccountSettings,
  PreferencesSection,
  NotificationSettings,
  DevModeIndicator,
} from '../../../components';
import { useRTL } from '../../../hooks/useRTL';
import { profileService } from '../../../services';
import { UserProfile, RootStackParamList } from '../../../types';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../../constants';
import { ScreenProps } from '../../../types';

interface ProfileScreenProps extends ScreenProps {
  // Add any specific props if needed
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'account' | 'preferences' | 'notifications'>('account');

  // Load profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 ProfileScreen loading profile data...');
      loadProfile();
    }, [])
  );

  const loadProfile = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log('🔍 Loading profile data...');
      const response = await profileService.getProfile();
      
      if (response.success && response.data) {
        console.log('✅ Profile loaded successfully');
        setProfile(response.data);
      } else {
        console.log('❌ Profile load failed:', response.error);
        if (!__DEV__) {
          Alert.alert(
            t('common.error'),
            response.error || t('profile.failedToLoadProfile')
          );
        }
      }
    } catch (error) {
      console.log('❌ Profile load error:', error);
      if (!__DEV__) {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('profile.failedToLoadProfile')
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProfile(true);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    navigation.navigate('EditProfile');
  };

  const handlePasswordChange = () => {
    Alert.alert(
      t('profile.changePassword'),
      t('profile.changePasswordDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.changePassword'), 
          onPress: () => showPasswordChangeDialog() 
        },
      ]
    );
  };

  const showPasswordChangeDialog = () => {
    // For simplicity, using Alert.prompt (iOS) or a simple implementation
    // In a real app, you'd create a proper modal/screen for this
    Alert.prompt(
      t('profile.currentPassword'),
      t('profile.enterCurrentPassword'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.next'),
          onPress: (currentPassword) => {
            if (currentPassword) {
              showNewPasswordDialog(currentPassword);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const showNewPasswordDialog = (currentPassword: string) => {
    Alert.prompt(
      t('profile.newPassword'),
      t('profile.enterNewPassword'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.changePassword'),
          onPress: async (newPassword) => {
            if (newPassword) {
              await changePassword(currentPassword, newPassword);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await profileService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        Alert.alert(t('common.success'), t('profile.passwordChanged'));
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('profile.passwordChangeFailed')
      );
    }
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={handlePasswordChange}>
        <Text style={styles.actionButtonIcon}>🔐</Text>
        <Text style={[styles.actionButtonText, { textAlign }]}>{t('profile.changePassword')}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => navigation.navigate('HelpSupport')}
      >
        <Text style={styles.actionButtonIcon}>🆘</Text>
        <Text style={[styles.actionButtonText, { textAlign }]}>{t('home.actions.helpSupport')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'account' && styles.activeTab]}
        onPress={() => setActiveSection('account')}
      >
        <Text style={[styles.tabText, activeSection === 'account' && styles.activeTabText]}>
          {t('profile.account')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'preferences' && styles.activeTab]}
        onPress={() => setActiveSection('preferences')}
      >
        <Text style={[styles.tabText, activeSection === 'preferences' && styles.activeTabText]}>
          {t('profile.preferences')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'notifications' && styles.activeTab]}
        onPress={() => setActiveSection('notifications')}
      >
        <Text style={[styles.tabText, activeSection === 'notifications' && styles.activeTabText]}>
          {t('profile.notifications')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'preferences':
        return <PreferencesSection />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <AccountSettings />;
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('profile.noProfileData')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProfile()}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DevModeIndicator />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
          onEditPress={handleEditProfile}
        />

        {renderActionButtons()}
        {renderSectionTabs()}
        {renderActiveSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.linkedinBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.linkedinBlue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
});

export default ProfileScreen;