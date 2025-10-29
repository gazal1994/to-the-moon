import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Teacher } from '../../../types/user';
import { styles } from './TeacherProfileScreen.styles';

interface TeacherProfileDetailsProps {
  teacher: Teacher;
  onBookLesson: () => void;
  onSendMessage: () => void;
}

const formatRating = (rating: any): string => {
  const num = Number(rating);
  return Number.isNaN(num) ? '0.0' : num.toFixed(1);
};

export const TeacherProfileDetails: React.FC<TeacherProfileDetailsProps> = ({
  teacher,
  onBookLesson,
  onSendMessage,
}) => {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {teacher.avatar ? (
            <Image source={{ uri: teacher.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
            </View>
          )}
          {teacher.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{teacher.name}</Text>
        <Text style={styles.location}>{teacher.location}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {formatRating(teacher.rating)}</Text>
            <Text style={styles.statLabel}>{teacher.reviewCount || 0} reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{teacher.experience || 0} years</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {(teacher.pricePerHour || 0) === 0 ? 'Free' : `$${teacher.pricePerHour}/hr`}
            </Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      </View>

      {teacher.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{teacher.bio}</Text>
        </View>
      )}

      {teacher.subjects && teacher.subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.tagsContainer}>
            {teacher.subjects.map((subject, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {teacher.languages && teacher.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.tagsContainer}>
            {teacher.languages.map((language, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {teacher.availableModes && teacher.availableModes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Modes</Text>
          <View style={styles.tagsContainer}>
            {teacher.availableModes.map((mode, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{mode}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={onBookLesson}>
          <Text style={styles.primaryButtonText}>Book a Lesson</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onSendMessage}>
          <Text style={styles.secondaryButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TeacherProfileDetails;
