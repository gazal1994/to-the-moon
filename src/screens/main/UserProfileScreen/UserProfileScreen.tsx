import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useRTL } from '../../../hooks/useRTL';
import { styles } from './UserProfileScreen.styles';
import { COLORS } from '../../../constants';

// Define the user profile data structure
export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER';
  avatar: string;
  country: string;
  city?: string;
  subjects?: string[];
  teachingStyle?: string[];
  experience?: string;
  education?: string;
  languages?: string[];
  rating?: number;
  totalLessons?: number;
  bio?: string;
  availability?: string[];
  hourlyRate?: number;
  joinedDate: string;
}

type UserProfileScreenRouteProp = RouteProp<
  { UserProfile: { user: UserProfileData } },
  'UserProfile'
>;

const UserProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<UserProfileScreenRouteProp>();
  const { user } = route.params;
  const { isRTL: isRTLLayout, textAlign, flexDirection } = useRTL();

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Palestine': '🇵🇸',
      'Jordan': '🇯🇴',
      'Lebanon': '🇱🇧',
      'Syria': '🇸🇾',
      'Egypt': '🇪🇬',
      'Saudi Arabia': '🇸🇦',
      'UAE': '🇦🇪',
      'Kuwait': '🇰🇼',
      'Qatar': '🇶🇦',
      'Bahrain': '🇧🇭',
      'Oman': '🇴🇲',
      'Iraq': '🇮🇶',
      'Yemen': '🇾🇪',
      'Israel': '🇮🇱',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Turkey': '🇹🇷',
      'Morocco': '🇲🇦',
      'Tunisia': '🇹🇳',
      'Algeria': '🇩🇿'
    };
    return countryFlags[country] || '🌍';
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const renderTeacherDetails = () => (
    <>
      {user.subjects && user.subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.subjects')}</Text>
          <View style={styles.tagsContainer}>
            {user.subjects.map((subject, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {user.teachingStyle && user.teachingStyle.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.teachingStyle')}</Text>
          <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
            {user.teachingStyle.map((style, index) => (
              <View key={index} style={[styles.tag, styles.styleTag]}>
                <Text style={styles.tagText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {user.experience && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.experience')}</Text>
          <Text style={[styles.sectionContent, { textAlign }]}>{user.experience}</Text>
        </View>
      )}

      {user.education && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.education')}</Text>
          <Text style={[styles.sectionContent, { textAlign }]}>{user.education}</Text>
        </View>
      )}

      {user.hourlyRate && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.hourlyRate')}</Text>
          <Text style={styles.priceText}>${user.hourlyRate}/hour</Text>
        </View>
      )}

      {user.availability && user.availability.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.availability')}</Text>
          <View style={styles.tagsContainer}>
            {user.availability.map((time, index) => (
              <View key={index} style={[styles.tag, styles.timeTag]}>
                <Text style={styles.tagText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  const renderStudentDetails = () => (
    <>
      {user.subjects && user.subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.interestedSubjects')}</Text>
          <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
            {user.subjects.map((subject, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{isRTLLayout ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: 'center' }]}>{t('profile.userProfile')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { flexDirection }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { textAlign }]}>{user.name}</Text>
            <Text style={[styles.userRole, { textAlign }]}>
              {user.role === 'TEACHER' ? t('profile.teacher') : t('profile.student')}
            </Text>
            
            <View style={[styles.locationContainer, { flexDirection, justifyContent: isRTLLayout ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.countryFlag}>{getCountryFlag(user.country)}</Text>
              <Text style={[styles.locationText, { textAlign }]}>
                {user.city ? `${user.city}, ` : ''}{user.country}
              </Text>
            </View>

            {user.rating && (
              <View style={[styles.ratingContainer, { flexDirection, justifyContent: isRTLLayout ? 'flex-end' : 'flex-start' }]}>
                <View style={styles.starsContainer}>
                  {renderRatingStars(user.rating)}
                </View>
                <Text style={styles.ratingText}>({user.rating})</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio Section */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.about')}</Text>
            <Text style={[styles.bioText, { textAlign }]}>{user.bio}</Text>
          </View>
        )}

        {/* Languages */}
        {user.languages && user.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.languages')}</Text>
            <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
              {user.languages.map((language, index) => (
                <View key={index} style={[styles.tag, styles.languageTag]}>
                  <Text style={styles.tagText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Role-specific details */}
        {user.role === 'TEACHER' ? renderTeacherDetails() : renderStudentDetails()}

        {/* Stats */}
        <View style={[styles.statsContainer, { flexDirection }]}>
          {user.totalLessons && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.totalLessons}</Text>
              <Text style={[styles.statLabel, { textAlign: 'center' }]}>{t('profile.totalLessons')}</Text>
            </View>
          )}
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Date(user.joinedDate).getFullYear()}
            </Text>
            <Text style={[styles.statLabel, { textAlign: 'center' }]}>{t('profile.memberSince')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {user.role === 'TEACHER' && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={[styles.primaryButtonText, { textAlign: 'center' }]}>{t('profile.bookLesson')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={[styles.secondaryButtonText, { textAlign: 'center' }]}>{t('profile.sendMessage')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;