import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button } from '../../../components';
import { useAppDispatch } from '../../../store/hooks';
import { updateUserProfile } from '../../../store/slices/authSlice';
import { ScreenProps, UserRole } from '../../../types';
import { COLORS } from '../../../constants';
import { StorageService } from '../../../utils';
import { styles, getEmojiIcon } from './RoleSelectionScreen.styles';

const roles = [
  {
    role: UserRole.STUDENT,
    title: 'Student',
    description: 'I want to learn from qualified teachers',
    icon: 'school-outline',
    color: COLORS.primary,
  },
  {
    role: UserRole.TEACHER,
    title: 'Teacher',
    description: 'I want to teach and help students learn',
    icon: 'person-outline',
    color: COLORS.secondary,
  },
];

const RoleSelectionScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Role Required', 'Please select your role to continue');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with selected role
      await dispatch(updateUserProfile({ role: selectedRole })).unwrap();
      
      // Mark onboarding as completed
      await StorageService.setOnboardingCompleted(true);
      
      // Navigate to main app
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', 'Failed to save role selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'd like to use Aqra
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((roleItem) => (
            <TouchableOpacity
              key={roleItem.role}
              style={[
                styles.roleCard,
                selectedRole === roleItem.role && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelection(roleItem.role)}
            >
              <View style={styles.roleHeader}>
                <View style={[styles.roleIcon, { backgroundColor: roleItem.color + '20' }]}>
                  <Text style={[styles.iconEmoji, { color: roleItem.color }]}>
                    {getEmojiIcon(roleItem.icon)}
                  </Text>
                </View>
                {selectedRole === roleItem.role && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkEmoji}>
                      {getEmojiIcon('checkmark')}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.roleTitle}>{roleItem.title}</Text>
              <Text style={styles.roleDescription}>{roleItem.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!selectedRole}
            fullWidth
            size="large"
          />
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.skipText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;