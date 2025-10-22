import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { styles } from './TeacherAvailability.styles';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TeacherAvailabilityProps {
  onSave?: (availability: TimeSlot[]) => void;
}

const daysOfWeek = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
];

export const TeacherAvailability: React.FC<TeacherAvailabilityProps> = ({ onSave }) => {
  const [availability, setAvailability] = useState<TimeSlot[]>(() => {
    // Initialize with default availability
    const slots: TimeSlot[] = [];
    daysOfWeek.forEach((day, dayIndex) => {
      timeSlots.forEach((time, timeIndex) => {
        slots.push({
          id: `${dayIndex}-${timeIndex}`,
          day,
          startTime: time,
          endTime: timeSlots[timeIndex + 1] || '21:00',
          isAvailable: false,
        });
      });
    });
    return slots;
  });

  const toggleTimeSlot = (slotId: string) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleSave = () => {
    const availableSlots = availability.filter(slot => slot.isAvailable);
    Alert.alert(
      'Availability Updated',
      `You have ${availableSlots.length} time slots available`,
      [{ text: 'OK' }]
    );
    onSave?.(availability);
  };

  const renderDaySchedule = (day: string) => {
    const daySlots = availability.filter(slot => slot.day === day);
    
    return (
      <View key={day} style={styles.dayContainer}>
        <Text style={styles.dayTitle}>{day}</Text>
        <View style={styles.timeSlotsContainer}>
          {daySlots.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                slot.isAvailable && styles.timeSlotSelected
              ]}
              onPress={() => toggleTimeSlot(slot.id)}
            >
              <Text style={[
                styles.timeSlotText,
                slot.isAvailable && styles.timeSlotTextSelected
              ]}>
                {slot.startTime}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Set Your Availability 📅</Text>
        <Text style={styles.subtitle}>
          Select the time slots when you're available to teach
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {daysOfWeek.map(renderDaySchedule)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TeacherAvailability;