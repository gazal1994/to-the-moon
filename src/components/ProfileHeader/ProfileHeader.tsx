import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
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
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          t('common.error'),
          t('profile.permissionRequired')
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert(t('common.error'), t('profile.imageSelectionFailed'));
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
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
    margin: 16,
    padding: 20,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.linkedinBlue,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileHeader;