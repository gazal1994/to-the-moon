import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
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
import { useUser } from '../../../contexts/UserContext';
import { useAppDispatch } from '../../../store/hooks';
import { logoutUser } from '../../../store/slices/authSlice';
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
  const { user, setUser, refreshUser } = useUser();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'account' | 'preferences' | 'notifications'>('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 ProfileScreen loading profile data...');
      loadProfile();
    }, [])
  );

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      updateProfileFromUser();
    }
  }, [user]);

  const updateProfileFromUser = () => {
    if (!user) return;
    
    const userProfile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      bio: '', 
      location: {
        city: 'Ramallah',
        country: 'Palestine'
      },
      language: 'en',
      totalLessons: 0,
      totalReviews: 0,
      averageRating: 0.0,
      completedCourses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('✅ Profile updated from user context:', user.name);
    setProfile(userProfile);
  };

  const loadProfile = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log('🔍 Loading profile data...');
      
      // Only refresh user data if explicitly refreshing
      if (showRefresh) {
        await refreshUser();
      } else if (user) {
        // Use existing user data
        updateProfileFromUser();
      }
    } catch (error) {
      console.log('❌ Profile load error:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('profile.failedToLoadProfile')
      );
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
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const changePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), 'New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await profileService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        Alert.alert(t('common.success'), 'Password changed successfully');
        closePasswordModal();
      } else {
        Alert.alert(t('common.error'), response.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : 'Failed to change password'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              // Dispatch Redux logout action
              await dispatch(logoutUser()).unwrap();
              // Clear user context
              setUser(null);
              // Navigation will automatically redirect to Auth screen
              // because isAuthenticated will be false in Redux
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={closePasswordModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔐 {t('profile.changePassword')}</Text>
            <TouchableOpacity onPress={closePasswordModal}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePasswordModal}
                disabled={changingPassword}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={changePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      <TouchableOpacity 
        style={[styles.actionButton, styles.logoutButton]} 
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <>
            <ActivityIndicator size="small" color="#ff4444" style={{ marginRight: 12 }} />
            <Text style={[styles.actionButtonText, styles.logoutText, { textAlign }]}>Logging out...</Text>
          </>
        ) : (
          <>
            <Text style={styles.actionButtonIcon}>🚪</Text>
            <Text style={[styles.actionButtonText, styles.logoutText, { textAlign }]}>Logout</Text>
          </>
        )}
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

      {renderPasswordModal()}
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
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalCloseButton: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.textSecondary,
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.linkedinBlue,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProfileScreen;