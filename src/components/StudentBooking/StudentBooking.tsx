import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { UserWithProfile, LearningMode } from '../../types';
import { styles } from './StudentBooking.styles';

interface StudentBookingProps {
  teacher: UserWithProfile;
  onBookingRequest?: (bookingData: BookingRequest) => void;
}

interface BookingRequest {
  teacherId: string;
  subject: string;
  preferredTime: string;
  learningMode: LearningMode;
  message: string;
  sessionDuration: number;
}

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Arabic', 'History', 'Geography',
  'Computer Science', 'Economics', 'Philosophy',
];

const sessionDurations = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

export const StudentBooking: React.FC<StudentBookingProps> = ({ 
  teacher, 
  onBookingRequest 
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [learningMode, setLearningMode] = useState<LearningMode>(LearningMode.ONLINE);
  const [message, setMessage] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(60);

  const handleSubmitRequest = () => {
    if (!selectedSubject || !preferredTime) {
      Alert.alert('Missing Information', 'Please select a subject and preferred time');
      return;
    }

    const bookingData: BookingRequest = {
      teacherId: teacher.id,
      subject: selectedSubject,
      preferredTime,
      learningMode,
      message,
      sessionDuration,
    };

    Alert.alert(
      'Booking Request Sent! 📚',
      `Your lesson request has been sent to ${teacher.name}. They will respond within 24 hours.`,
      [{ text: 'OK' }]
    );

    onBookingRequest?.(bookingData);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Lesson 📖</Text>
        <Text style={styles.teacherName}>with {teacher.name}</Text>
        <Text style={styles.teacherSubjects}>
          Teaches: {teacher.teacherProfile?.subjects.join(', ') || 'Various subjects'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Subject</Text>
        <View style={styles.subjectGrid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.subjectChip,
                selectedSubject === subject && styles.subjectChipSelected
              ]}
              onPress={() => setSelectedSubject(subject)}
            >
              <Text style={[
                styles.subjectChipText,
                selectedSubject === subject && styles.subjectChipTextSelected
              ]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Duration</Text>
        <View style={styles.durationContainer}>
          {sessionDurations.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={[
                styles.durationButton,
                sessionDuration === duration.value && styles.durationButtonSelected
              ]}
              onPress={() => setSessionDuration(duration.value)}
            >
              <Text style={[
                styles.durationButtonText,
                sessionDuration === duration.value && styles.durationButtonTextSelected
              ]}>
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Mode</Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              learningMode === LearningMode.ONLINE && styles.modeButtonSelected
            ]}
            onPress={() => setLearningMode(LearningMode.ONLINE)}
          >
            <Text style={styles.modeEmoji}>📹</Text>
            <Text style={[
              styles.modeButtonText,
              learningMode === LearningMode.ONLINE && styles.modeButtonTextSelected
            ]}>
              Online
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              learningMode === LearningMode.IN_PERSON && styles.modeButtonSelected
            ]}
            onPress={() => setLearningMode(LearningMode.IN_PERSON)}
          >
            <Text style={styles.modeEmoji}>👤</Text>
            <Text style={[
              styles.modeButtonText,
              learningMode === LearningMode.IN_PERSON && styles.modeButtonTextSelected
            ]}>
              In-Person
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Time</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Monday 3:00 PM, Tuesday evening..."
          value={preferredTime}
          onChangeText={setPreferredTime}
          multiline={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.messageInput]}
          placeholder="Tell the teacher about your learning goals, current level, or any specific topics you'd like to focus on..."
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitRequest}>
          <Text style={styles.submitButtonText}>Send Booking Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default StudentBooking;