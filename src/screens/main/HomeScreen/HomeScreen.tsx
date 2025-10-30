import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useUserRole } from '../../../hooks/useUserRole';
import { useUser } from '../../../contexts/UserContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { RootStackParamList } from '../../../types';
import { apiClient } from '../../../services/apiClient';
import { styles } from './HomeScreen.styles';

interface TeacherStats {
  activeStudents: number;
  lessonRequests: number;
  totalRequests: number;
  acceptedRequests: number;
  completedLessons: number;
}

const HomeScreen: React.FC = () => {
  const { user } = useUser();
  const { isStudent, isTeacher } = useUserRole();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { unreadCount } = useNotifications();
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    activeStudents: 0,
    lessonRequests: 0,
    totalRequests: 0,
    acceptedRequests: 0,
    completedLessons: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load teacher stats
  const loadTeacherStats = async () => {
    if (!isTeacher) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get<TeacherStats>('/teachers/dashboard/stats');
      console.log('📊 Teacher Stats Response:', response);
      
      if (response?.success && response?.data) {
        setTeacherStats(response.data);
      } else {
        console.error('❌ Invalid response format:', response);
      }
    } catch (error: any) {
      console.error('❌ Failed to load teacher stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load stats on mount and when role changes
  useEffect(() => {
    if (isTeacher) {
      loadTeacherStats();
    }
  }, [isTeacher]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeacherStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Small Header with Hello Greeting */}
      <View style={styles.smallHeader}>
        <Text style={styles.helloText}>
          {t('common.hello', { defaultValue: 'Hello' })}, {user?.name?.split(' ')[0] || 'User'} 👋
        </Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications' as never)}
          activeOpacity={0.7}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Student Dashboard */}
        {isStudent && (
          <>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Search' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickActionIcon}>🔍</Text>
                  <Text style={styles.quickActionText}>Find Teachers</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Requests' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickActionIcon}>📚</Text>
                  <Text style={styles.quickActionText}>My Lessons</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Messages' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickActionIcon}>💬</Text>
                  <Text style={styles.quickActionText}>Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Profile' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickActionIcon}>�</Text>
                  <Text style={styles.quickActionText}>My Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome Card */}
            <View style={styles.section}>
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome to Aqra! 🎓</Text>
                <Text style={styles.welcomeText}>
                  Start your learning journey by finding the perfect teacher for you.
                  Browse through our qualified instructors and book your first lesson today!
                </Text>
                <TouchableOpacity
                  style={styles.welcomeButton}
                  onPress={() => navigation.navigate('Search' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.welcomeButtonText}>Explore Teachers</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Popular Subjects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Subjects</Text>
              <View style={styles.subjectsGrid}>
                <TouchableOpacity style={styles.subjectCard} activeOpacity={0.8}>
                  <Text style={styles.subjectEmoji}>📖</Text>
                  <Text style={styles.subjectText}>Arabic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subjectCard} activeOpacity={0.8}>
                  <Text style={styles.subjectEmoji}>🕌</Text>
                  <Text style={styles.subjectText}>Quran</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subjectCard} activeOpacity={0.8}>
                  <Text style={styles.subjectEmoji}>☪️</Text>
                  <Text style={styles.subjectText}>Islamic Studies</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subjectCard} activeOpacity={0.8}>
                  <Text style={styles.subjectEmoji}>📿</Text>
                  <Text style={styles.subjectText}>Tajweed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Teacher Dashboard */}
        {isTeacher && (
          <>
            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {loading ? '...' : teacherStats.activeStudents}
                  </Text>
                  <Text style={styles.statLabel}>Active Students</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {loading ? '...' : teacherStats.lessonRequests}
                  </Text>
                  <Text style={styles.statLabel}>Lesson Requests</Text>
                </View>
              </View>
            </View>

            {/* Welcome Card */}
            <View style={styles.section}>
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome, Teacher! 👨‍🏫</Text>
                <Text style={styles.welcomeText}>
                  Manage your lessons, respond to student requests, and track your teaching progress.
                </Text>
                <TouchableOpacity
                  style={styles.welcomeButton}
                  onPress={() => navigation.navigate('Requests' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.welcomeButtonText}>View Requests</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;