import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Modal, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useRTL } from '../../../hooks/useRTL';
import { useUser } from '../../../contexts/UserContext';
import { apiClient } from '../../../services/apiClient';
import { styles } from './UserProfileScreen.styles';
import { COLORS, SIZES } from '../../../constants';

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
  const { user: profileUser } = route.params;
  const { user: currentUser } = useUser();
  const { isRTL: isRTLLayout, textAlign, flexDirection } = useRTL();
  
  // Determine if viewing own profile
  const isOwnProfile = currentUser?.id === profileUser.id;
  
  // Generate mock available time slots for the teacher
  const generateAvailableSlots = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    
    const slots: Array<{ id: string; day: string; time: string; available: boolean }> = [];
    
    // Generate slots for the next 7 days
    days.forEach((day, dayIndex) => {
      times.forEach((time, timeIndex) => {
        // Make some slots unavailable randomly
        const available = Math.random() > 0.3; // 70% available
        slots.push({
          id: `${dayIndex}-${timeIndex}`,
          day,
          time,
          available
        });
      });
    });
    
    return slots;
  };
  
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showManageAppointmentsModal, setShowManageAppointmentsModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [newAppointmentDay, setNewAppointmentDay] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [appointments, setAppointments] = useState<Array<{ id: string; day: string; time: string; available: boolean }>>(
    generateAvailableSlots()
  );

  const availableSlots = generateAvailableSlots();

  const handleSendMessage = async () => {
    try {
      console.log('Send Message button clicked for user:', profileUser.id);
      
      // Map mock user IDs to real database UUIDs
      // This is a temporary workaround until we load users from the backend
      const userIdMap: { [key: number]: string } = {
        1: 'daf9795a-d13a-4868-bf92-70dbb60b8acf', // Ahmed Ali (teacher)
        2: 'c03bebc7-cbe4-4f6f-983a-964c20d75883', // Sarah Johnson (teacher)
        3: 'd774ddab-851f-468b-bd1c-998f70521c47', // Maria Garcia (teacher)
        4: 'd7c2871b-e824-48ad-9c3b-ed2bb486423c', // Omar Al-Rashid (teacher)
        5: 'a58f4117-232b-411b-a7de-2e504e90b2c2', // Lisa Chen (teacher)
        6: '893a060b-7977-4c52-aa22-750679e095b4', // Dr. Ahmed Hassan (teacher)
        7: '0a707ace-c360-4c3f-bfbe-cb10791b8f4d', // Admin User (teacher)
      };
      
      const receiverId = userIdMap[profileUser.id] || profileUser.id;
      
      // Navigate to Messages tab and open conversation
      // First, send an initial message to create the conversation
      const response = await apiClient.post('/messages', {
        receiverId: receiverId,
        content: `Hi ${profileUser.name}! I'd like to connect with you.`,
        type: 'text'
      });

      console.log('API Response:', response);

      if (response.success && response.data) {
        // The backend returns {success: true, data: message}
        // The apiClient wraps it, so response.data contains the backend response
        const backendResponse = response.data as any;
        
        Alert.alert('Success', 'Message sent! Opening conversation...');
        
        // Navigate to the Messages screen
        // @ts-ignore - navigation type issue
        navigation.navigate('Messages', { 
          openConversation: {
            id: receiverId,
            otherUser: {
              id: receiverId,
              name: profileUser.name,
              avatar: profileUser.avatar,
              role: profileUser.role.toLowerCase()
            }
          }
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const handleRequestLecture = async () => {
    // Show the availability modal instead of sending message directly
    setShowAvailabilityModal(true);
  };

  const handleBookTimeSlot = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      setShowAvailabilityModal(false);
      
      const slot = availableSlots.find(s => s.id === selectedTimeSlot);
      if (!slot) return;

      console.log('Booking lecture for:', profileUser.id, 'at', slot.day, slot.time);
      
      // Map mock user IDs to real database UUIDs
      const userIdMap: { [key: number]: string } = {
        1: 'daf9795a-d13a-4868-bf92-70dbb60b8acf', // Ahmed Ali (teacher)
        2: 'c03bebc7-cbe4-4f6f-983a-964c20d75883', // Sarah Johnson (teacher)
        3: 'd774ddab-851f-468b-bd1c-998f70521c47', // Maria Garcia (teacher)
        4: 'd7c2871b-e824-48ad-9c3b-ed2bb486423c', // Omar Al-Rashid (teacher)
        5: 'a58f4117-232b-411b-a7de-2e504e90b2c2', // Lisa Chen (teacher)
        6: '893a060b-7977-4c52-aa22-750679e095b4', // Dr. Ahmed Hassan (teacher)
        7: '0a707ace-c360-4c3f-bfbe-cb10791b8f4d', // Admin User (teacher)
      };
      
      const receiverId = userIdMap[profileUser.id] || profileUser.id;
      
      // Send a lecture request message with the selected time
      const response = await apiClient.post('/messages', {
        receiverId: receiverId,
        content: `Hi ${profileUser.name}! I would like to book a lecture with you on ${slot.day} at ${slot.time}. I'm interested in learning about ${profileUser.subjects ? profileUser.subjects[0] : 'your subject'}. Please confirm if this time works for you.`,
        type: 'text'
      });

      console.log('Book Lecture API Response:', response);

      if (response.success && response.data) {
        Alert.alert(
          'Lecture Request Sent!',
          `Your lecture request for ${slot.day} at ${slot.time} has been sent to ${profileUser.name}. They will receive your message and confirm the booking.`,
          [
            {
              text: 'View Messages',
              onPress: () => {
                // @ts-ignore - navigation type issue
                navigation.navigate('Messages', { 
                  openConversation: {
                    id: receiverId,
                    otherUser: {
                      id: receiverId,
                      name: profileUser.name,
                      avatar: profileUser.avatar,
                      role: profileUser.role.toLowerCase()
                    }
                  }
                });
              }
            },
            { text: 'OK' }
          ]
        );
        setSelectedTimeSlot(null);
      } else {
        Alert.alert('Error', response.error || 'Failed to send lecture request');
      }
    } catch (error) {
      console.error('Failed to book lecture:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const handleAddAppointment = () => {
    if (!newAppointmentDay.trim() || !newAppointmentTime.trim()) {
      Alert.alert('Error', 'Please enter both day and time');
      return;
    }

    const newSlot = {
      id: `custom-${Date.now()}`,
      day: newAppointmentDay,
      time: newAppointmentTime,
      available: true
    };

    setAppointments([...appointments, newSlot]);
    setNewAppointmentDay('');
    setNewAppointmentTime('');
    Alert.alert('Success', 'New appointment slot added!');
  };

  const handleToggleSlotAvailability = (slotId: string) => {
    setAppointments(appointments.map(slot =>
      slot.id === slotId ? { ...slot, available: !slot.available } : slot
    ));
  };

  const handleDeleteAppointment = (slotId: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAppointments(appointments.filter(slot => slot.id !== slotId));
            Alert.alert('Success', 'Appointment slot deleted');
          }
        }
      ]
    );
  };

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
      {profileUser.subjects && profileUser.subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.subjects')}</Text>
          <View style={styles.tagsContainer}>
            {profileUser.subjects.map((subject, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profileUser.teachingStyle && profileUser.teachingStyle.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.teachingStyle')}</Text>
          <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
            {profileUser.teachingStyle.map((style, index) => (
              <View key={index} style={[styles.tag, styles.styleTag]}>
                <Text style={styles.tagText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profileUser.experience && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.experience')}</Text>
          <Text style={[styles.sectionContent, { textAlign }]}>{profileUser.experience}</Text>
        </View>
      )}

      {profileUser.education && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.education')}</Text>
          <Text style={[styles.sectionContent, { textAlign }]}>{profileUser.education}</Text>
        </View>
      )}

      {profileUser.hourlyRate && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.hourlyRate')}</Text>
          <Text style={styles.priceText}>${String(profileUser.hourlyRate)}/hour</Text>
        </View>
      )}

      {profileUser.availability && profileUser.availability.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.availability')}</Text>
          <View style={styles.tagsContainer}>
            {profileUser.availability.map((time, index) => (
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
      {profileUser.subjects && profileUser.subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.interestedSubjects')}</Text>
          <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
            {profileUser.subjects.map((subject, index) => (
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
      {/* Fixed Header */}
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

      {/* Scrollable Content Container */}
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: SIZES.md, paddingBottom: 24 }}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { flexDirection }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{profileUser.avatar}</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { textAlign }]}>{profileUser.name}</Text>
            <Text style={[styles.userRole, { textAlign }]}>
              {profileUser.role === 'TEACHER' ? t('profile.teacher') : t('profile.student')}
            </Text>
            
            <View style={[styles.locationContainer, { flexDirection, justifyContent: isRTLLayout ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.countryFlag}>{getCountryFlag(profileUser.country)}</Text>
              <Text style={[styles.locationText, { textAlign }]}>
                {profileUser.city ? `${profileUser.city}, ` : ''}{profileUser.country}
              </Text>
            </View>

            {profileUser.rating && (
              <View style={[styles.ratingContainer, { flexDirection, justifyContent: isRTLLayout ? 'flex-end' : 'flex-start' }]}>
                <View style={styles.starsContainer}>
                  {renderRatingStars(profileUser.rating)}
                </View>
                <Text style={styles.ratingText}>({String(profileUser.rating)})</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio Section */}
        {profileUser.bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.about')}</Text>
            <Text style={[styles.bioText, { textAlign }]}>{profileUser.bio}</Text>
          </View>
        )}

        {/* Languages */}
        {profileUser.languages && profileUser.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('profile.languages')}</Text>
            <View style={[styles.tagsContainer, { flexDirection: isRTLLayout ? 'row-reverse' : 'row' }]}>
              {profileUser.languages.map((language, index) => (
                <View key={index} style={[styles.tag, styles.languageTag]}>
                  <Text style={styles.tagText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Role-specific details */}
        {profileUser.role === 'TEACHER' ? renderTeacherDetails() : renderStudentDetails()}

        {/* Stats */}
        <View style={[styles.statsContainer, { flexDirection }]}>
          {profileUser.totalLessons && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{String(profileUser.totalLessons)}</Text>
              <Text style={[styles.statLabel, { textAlign: 'center' }]}>{t('profile.totalLessons')}</Text>
            </View>
          )}
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {String(new Date(profileUser.joinedDate).getFullYear())}
            </Text>
            <Text style={[styles.statLabel, { textAlign: 'center' }]}>{t('profile.memberSince')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isOwnProfile && profileUser.role === 'TEACHER' ? (
            // Show manage appointments button for teachers viewing their own profile
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setShowManageAppointmentsModal(true)}
            >
              <Text style={[styles.primaryButtonText, { textAlign: 'center' }]}>
                Manage Appointments
              </Text>
            </TouchableOpacity>
          ) : isOwnProfile ? (
            // Don't show buttons when viewing your own profile (students)
            null
          ) : profileUser.role === 'TEACHER' ? (
            // Show book lesson + send message for teachers
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleRequestLecture}
              >
                <Text style={[styles.primaryButtonText, { textAlign: 'center' }]}>{t('profile.bookLesson')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleSendMessage}
              >
                <Text style={[styles.secondaryButtonText, { textAlign: 'center' }]}>{t('profile.sendMessage')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Show only send message button for students
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleSendMessage}
            >
              <Text style={[styles.primaryButtonText, { textAlign: 'center' }]}>{t('profile.sendMessage')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      </View>

      {/* Availability Modal */}
      <Modal
        visible={showAvailabilityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAvailabilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Time Slots</Text>
              <TouchableOpacity onPress={() => setShowAvailabilityModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Time Slots List */}
            <FlatList
              data={availableSlots}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeSlotItem,
                    !item.available && styles.timeSlotDisabled,
                    selectedTimeSlot === item.id && styles.timeSlotSelected
                  ]}
                  onPress={() => item.available && setSelectedTimeSlot(item.id)}
                  disabled={!item.available}
                >
                  <View style={styles.timeSlotContent}>
                    <Text style={[
                      styles.timeSlotDay,
                      !item.available && styles.timeSlotTextDisabled,
                      selectedTimeSlot === item.id && styles.timeSlotTextSelected
                    ]}>
                      {item.day}
                    </Text>
                    <Text style={[
                      styles.timeSlotTime,
                      !item.available && styles.timeSlotTextDisabled,
                      selectedTimeSlot === item.id && styles.timeSlotTextSelected
                    ]}>
                      {item.time}
                    </Text>
                  </View>
                  {!item.available && (
                    <Text style={styles.timeSlotUnavailable}>Unavailable</Text>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.timeSlotsList}
            />

            {/* Book Button */}
            <TouchableOpacity
              style={[
                styles.modalBookButton,
                !selectedTimeSlot && styles.modalBookButtonDisabled
              ]}
              onPress={handleBookTimeSlot}
              disabled={!selectedTimeSlot}
            >
              <Text style={styles.modalBookButtonText}>
                {selectedTimeSlot ? 'Confirm Booking' : 'Select a Time Slot'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manage Appointments Modal (for teachers viewing their own profile) */}
      <Modal
        visible={showManageAppointmentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManageAppointmentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Appointments</Text>
              <TouchableOpacity onPress={() => setShowManageAppointmentsModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Add New Appointment Form */}
            <View style={styles.addAppointmentForm}>
              <Text style={styles.addAppointmentTitle}>Add New Time Slot</Text>
              <TextInput
                style={styles.appointmentInput}
                placeholder="Day (e.g., Monday, Tuesday)"
                value={newAppointmentDay}
                onChangeText={setNewAppointmentDay}
              />
              <TextInput
                style={styles.appointmentInput}
                placeholder="Time (e.g., 10:00 AM, 3:00 PM)"
                value={newAppointmentTime}
                onChangeText={setNewAppointmentTime}
              />
              <TouchableOpacity
                style={styles.addAppointmentButton}
                onPress={handleAddAppointment}
              >
                <Text style={styles.addAppointmentButtonText}>+ Add Slot</Text>
              </TouchableOpacity>
            </View>

            {/* Appointments List */}
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.manageSlotItem}>
                  <View style={styles.manageSlotContent}>
                    <Text style={styles.manageSlotDay}>{item.day}</Text>
                    <Text style={styles.manageSlotTime}>{item.time}</Text>
                  </View>
                  <View style={styles.manageSlotActions}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        item.available ? styles.toggleButtonAvailable : styles.toggleButtonUnavailable
                      ]}
                      onPress={() => handleToggleSlotAvailability(item.id)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAppointment(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.timeSlotsList}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalBookButton}
              onPress={() => setShowManageAppointmentsModal(false)}
            >
              <Text style={styles.modalBookButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserProfileScreen;