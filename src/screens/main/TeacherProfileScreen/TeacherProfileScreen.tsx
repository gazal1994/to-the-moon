import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Teacher } from '../../../types/user';
import { apiClient } from '../../../services/apiClient';
import BookingModal from '../../../components/BookingModal/BookingModal';
import TeacherProfileDetails from './TeacherProfileDetails';
import { styles } from './TeacherProfileScreen.styles';

interface RouteParams {
  teacherId: string;
}

const TeacherProfileScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { teacherId } = route.params as RouteParams;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  useEffect(() => {
    fetchTeacherProfile();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Teacher>(`/teachers/${teacherId}`);
      
      if (response.success && response.data) {
        console.log('📊 Teacher data received:', JSON.stringify(response.data, null, 2));
        setTeacher(response.data);
      } else {
        Alert.alert('Error', 'Failed to load teacher profile');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to fetch teacher profile:', error);
      Alert.alert('Error', 'Failed to load teacher profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookLesson = () => {
    setBookingModalVisible(true);
  };

  const handleBookingConfirmed = () => {
    // You can add logic here to refresh data or navigate somewhere
    Alert.alert('Success', 'Your lesson has been booked!');
  };

  const handleSendMessage = () => {
    if (!teacher) return;
    
    // Navigate to chat screen with teacher info
    navigation.navigate('Chat' as never, {
      userId: teacher.id,
      userName: teacher.name,
      userAvatar: teacher.avatar,
    } as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
          <Text style={styles.loadingText}>Loading teacher profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!teacher) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Teacher not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TeacherProfileDetails
        teacher={teacher}
        onBookLesson={handleBookLesson}
        onSendMessage={handleSendMessage}
      />

      {/* Booking Modal */}
      {teacher && (
        <BookingModal
          visible={bookingModalVisible}
          teacher={teacher}
          onClose={() => setBookingModalVisible(false)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}
    </SafeAreaView>
  );
};

export default TeacherProfileScreen;