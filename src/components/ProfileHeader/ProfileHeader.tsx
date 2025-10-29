import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants';
import { UserProfile } from '../../types';
import { profileService } from '../../services';

interface ProfileHeaderProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
  onEditPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onProfileUpdate,
  onEditPress,
}) => {
  const { t } = useTranslation();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarPress = () => {
    Alert.alert(
      t('profile.changeAvatar'),
      t('profile.chooseAvatarSource'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.chooseFromLibrary'), onPress: selectImage },
      ]
    );
  };

  const selectImage = async () => {
    try {
      // Launch image picker
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(t('common.error'), t('profile.imageSelectionFailed'));
        return;
      }

      if (result.assets && result.assets[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert(t('common.error'), t('profile.imageSelectionFailed'));
    }
  };

  const uploadAvatar = async (asset: Asset) => {
    if (!asset.uri) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      } as any);

      const response = await profileService.uploadAvatar(formData);
      if (response.success && response.data) {
        const updatedProfile = { ...profile, avatarUrl: response.data.avatarUrl };
        onProfileUpdate(updatedProfile);
        Alert.alert(t('common.success'), t('profile.avatarUpdated'));
      } else {
        console.log('❌ Avatar upload failed:', response.error);
        if (!__DEV__) {
          Alert.alert(t('common.error'), response.error || t('profile.avatarUploadFailed'));
        }
      }
    } catch (error) {
      console.log('❌ Avatar upload error:', error);
      if (!__DEV__) {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('profile.avatarUploadFailed')
        );
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const renderStatsItem = (label: string, value: number | string) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          disabled={uploadingAvatar}
        >
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          {uploadingAvatar && (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>⟳</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {profile.location && (
            <Text style={styles.location}>
              📍 {profile.location.city}, {profile.location.country}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {renderStatsItem(t('profile.totalLessons'), profile.totalLessons || 0)}
        {renderStatsItem(t('profile.totalReviews'), profile.totalReviews || 0)}
        {renderStatsItem(t('profile.averageRating'), 
          profile.averageRating ? profile.averageRating.toFixed(1) : '0.0'
        )}
        {renderStatsItem(t('profile.completedCourses'), profile.completedCourses || 0)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
  },
  defaultAvatar: {
    backgroundColor: COLORS.linkedinBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.linkedinBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0a66c2',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#65676b',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default ProfileHeader;