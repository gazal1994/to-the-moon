import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Teacher } from '../../types/user';
import { apiClient } from '../../services/apiClient';
import { StorageService } from '../../utils';
import { styles } from './BookingModal.styles';

interface BookingModalProps {
  visible: boolean;
  teacher: Teacher;
  onClose: () => void;
  onBookingConfirmed: () => void;
}

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  available: boolean;
  hasRequest?: boolean; // Whether this slot already has a pending request
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const orderDays = (days: string[]): string[] => {
  return [...days].sort((a, b) => {
    const indexA = DAY_ORDER.indexOf(a);
    const indexB = DAY_ORDER.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  teacher,
  onClose,
  onBookingConfirmed,
}) => {
  const navigation = useNavigation();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);

  // Load teacher's actual availability when modal opens
  useEffect(() => {
    if (visible && teacher.id) {
      setSelectedSlot(null);
      loadDataSequentially();
    }
  }, [visible, teacher.id]);

  const loadDataSequentially = async () => {
    // First load existing requests, then load availability
    // This ensures we can mark slots with requests properly
    setLoadingSlots(true);
    
    try {
      // Load requests first
      const response = await apiClient.get(`/requests?teacherId=${teacher.id}&status=pending`);
      const requests = response.success && response.requests ? response.requests : [];
      setExistingRequests(requests);
      console.log('✅ Loaded existing requests:', requests.length);
      
      // Then load availability with the requests data
      await loadTeacherAvailabilityWithRequests(requests);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoadingSlots(false);
    }
  };

  const loadExistingRequests = async () => {
    try {
      // Fetch lesson requests for this teacher
      const response = await apiClient.get(`/requests?teacherId=${teacher.id}&status=pending`);
      
      if (response.success && response.requests) {
        setExistingRequests(response.requests);
        console.log('✅ Loaded existing requests:', response.requests.length);
      }
    } catch (error) {
      console.error('Failed to load existing requests:', error);
      setExistingRequests([]);
    }
  };

  const loadTeacherAvailabilityWithRequests = async (requests: any[]) => {
    try {
      // Fetch actual availability from backend
      const response = await apiClient.get(`/teachers/${teacher.id}/availability`);
      
      if (response.success && response.data?.availability && response.data.availability.length > 0) {
        // Format backend availability data with request information
        const formattedSlots = formatAvailabilityDataWithRequests(response.data.availability, requests);
        setTimeSlots(formattedSlots);
        console.log('✅ Loaded availability from backend:', formattedSlots.length, 'slots');
      } else {
        // No availability set by teacher yet
        console.log('⚠️ Teacher has no availability set');
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Failed to load teacher availability:', error);
      // On error, show empty state
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatAvailabilityDataWithRequests = (availability: any[], requests: any[]): TimeSlot[] => {
    // Convert backend availability format to TimeSlot format
    // Expected backend format: [{ day: "Monday", time: "9:00 AM - 10:00 AM", available: true }, ...]
    return availability.map((slot: any, index: number) => {
      const day = slot.day || slot.dayOfWeek;
      const time = slot.time || `${slot.startTime} - ${slot.endTime}`;
      
      // Check if this day/time has an existing request
      const hasRequest = checkIfSlotHasRequestDirect(day, time, requests);
      
      return {
        id: `${day}-${time}-${index}`,
        day,
        time,
        available: slot.available !== false,
        hasRequest,
      };
    });
  };

  const checkIfSlotHasRequestDirect = (day: string, time: string, requests: any[]): boolean => {
    // Check if any existing request matches this day and time
    return requests.some(request => {
      // Get the preferred time from request (should be an ISO date string)
      const preferredTime = request.preferredTime || request.preferred_time;
      if (!preferredTime) return false;
      
      try {
        // Parse the date
        const requestDate = new Date(preferredTime);
        
        // Get day name from the date
        const requestDay = requestDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Get time from the date
        const hours = requestDate.getHours();
        const minutes = requestDate.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        const requestTime = `${displayHours}:${displayMinutes} ${period}`;
        
        // Extract start time from slot time (e.g., "9:00 AM - 10:00 AM" -> "9:00 AM")
        const slotStartTime = time.includes('-') ? time.split('-')[0].trim() : time.trim();
        
        // Match if same day and time
        const dayMatch = requestDay.toLowerCase() === day.toLowerCase();
        const timeMatch = slotStartTime === requestTime;
        
        if (dayMatch && timeMatch) {
          console.log('📍 Found matching request:', { requestDay, requestTime, day, slotStartTime });
        }
        
        return dayMatch && timeMatch;
      } catch (error) {
        console.error('Error parsing request date:', error);
        return false;
      }
    });
  };

  const formatAvailabilityData = (availability: any[]): TimeSlot[] => {
    // Legacy function - use formatAvailabilityDataWithRequests instead
    return formatAvailabilityDataWithRequests(availability, existingRequests);
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      
      // Convert day and time to a future date
      const getNextDate = (dayName: string, time: string): string => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const targetDay = days.indexOf(dayName);
        const currentDay = today.getDay();
        
        // Calculate days until target day
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) {
          daysUntil += 7; // Next week
        }
        
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntil);
        
        return targetDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      };
      
      const preferredDate = getNextDate(selectedSlot.day, selectedSlot.time);
      
      // Extract time from the time slot (e.g., "9:00 AM - 10:00 AM" -> "9:00 AM")
      const timeStr = selectedSlot.time.includes('-') 
        ? selectedSlot.time.split('-')[0].trim() 
        : selectedSlot.time;
      
      const requestData = {
        teacherId: teacher.id,
        subject: teacher.subjects?.[0] || 'General Lesson',
        message: `Booking request for ${selectedSlot.day} at ${selectedSlot.time}`,
        preferredDate,
        preferredTime: timeStr,
        preferredMode: 'online',
        duration: 60,
      };
      
      console.log('📤 Sending booking request:', requestData);
      
      // Send booking request to backend
      const response = await apiClient.post('/requests', requestData);
      
      if (response.success) {
        Alert.alert(
          'Request Sent!',
          `Your booking request has been sent to ${teacher.name} for ${selectedSlot.day} at ${selectedSlot.time}. You will be notified once the teacher responds.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onBookingConfirmed();
                onClose();
                setSelectedSlot(null);
              },
            },
          ]
        );
      } else {
        const errorMsg = response.error || 'Failed to send booking request';
        
        // Check if it's an auth error
        if (errorMsg.toLowerCase().includes('token') || 
            errorMsg.toLowerCase().includes('unauthorized') ||
            errorMsg.toLowerCase().includes('expired') ||
            errorMsg.toLowerCase().includes('session')) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [
              { 
                text: 'OK',
                onPress: async () => {
                  // Clear stored auth data
                  await StorageService.removeUser();
                  await StorageService.removeAuthTokens();
                  onClose();
                  // Navigate to login screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' as never }],
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error: any) {
      console.error('Booking request error:', error);
      
      // Check for specific error types
      const isAuthError = 
        error?.response?.status === 401 ||
        error?.message?.toLowerCase().includes('token') ||
        error?.message?.toLowerCase().includes('unauthorized');
      
      if (isAuthError) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Clear stored auth data
                await StorageService.removeUser();
                await StorageService.removeAuthTokens();
                onClose();
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' as never }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to send booking request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDay = () => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.day]) {
        grouped[slot.day] = [];
      }
      grouped[slot.day].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDay();
  const orderedDays = orderDays(Object.keys(groupedSlots));

  console.log('📅 Booking Modal Debug:', {
    timeSlots: timeSlots.length,
    groupedSlots: Object.keys(groupedSlots),
    orderedDays,
    loadingSlots,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Book a Lesson</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Teacher Info */}
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherRate}>
              {teacher.pricePerHour === 0 ? 'Free' : `$${teacher.pricePerHour}/hour`}
            </Text>
          </View>

          {/* Time Slots */}
          <ScrollView
            style={styles.slotsContainer}
            contentContainerStyle={styles.slotsContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingSlots ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a66c2" />
                <Text style={styles.loadingText}>Loading available times...</Text>
              </View>
            ) : timeSlots.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyTitle}>No Availability Set</Text>
                <Text style={styles.emptyText}>
                  This teacher hasn't set their availability yet. Please try again later or contact them directly.
                </Text>
              </View>
            ) : (
              orderedDays.map(day => (
                <View key={day} style={styles.daySection}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <View style={styles.timeSlotsRow}>
                    {groupedSlots[day].map(slot => (
                      <View key={slot.id} style={styles.timeSlotWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.timeSlot,
                            !slot.available && styles.timeSlotUnavailable,
                            slot.hasRequest && styles.timeSlotWithRequest,
                            selectedSlot?.id === slot.id && styles.timeSlotSelected,
                          ]}
                          onPress={() => slot.available && setSelectedSlot(slot)}
                          disabled={!slot.available}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              !slot.available && styles.timeSlotTextUnavailable,
                              slot.hasRequest && styles.timeSlotTextWithRequest,
                              selectedSlot?.id === slot.id && styles.timeSlotTextSelected,
                            ]}
                          >
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Selected Slot Info */}
          {selectedSlot && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedText}>
                Selected: {selectedSlot.day} at {selectedSlot.time}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (loading || loadingSlots || !selectedSlot) && styles.confirmButtonDisabled,
              ]}
              onPress={handleBooking}
              disabled={loading || loadingSlots || !selectedSlot}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    (loadingSlots || !selectedSlot) && styles.confirmButtonTextDisabled,
                  ]}
                >
                  Send Request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingModal;
