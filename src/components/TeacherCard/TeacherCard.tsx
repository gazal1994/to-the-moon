import React from 'react';
import { TouchableOpacity, View, Text, Alert, Image } from 'react-native';
import { FONT_SIZES } from '../../constants';
import { Teacher } from '../../types';
import { styles, getEmojiIcon } from './TeacherCard.styles';

interface TeacherCardProps {
  teacher: Teacher;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  accentColor?: string; // Udemy-style dynamic color
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  isFavorite = false,
  onPress,
  onFavoritePress,
  accentColor = '#0a66c2', // LinkedIn professional blue
}) => {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Text key={index} style={styles.emojiIcon}>
          {index < Math.floor(rating) ? getEmojiIcon('star') : '☆'}
        </Text>
      ));
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Volunteer' : `$${price}/hr`;
  };

  const handleViewProfile = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert('View Profile', `Viewing ${teacher.name}'s profile`);
    }
  };

  const handleBookLesson = () => {
    Alert.alert('Book Lesson', `Booking a lesson with ${teacher.name}`);
  };

  const handleFavoritePress = () => {
    if (onFavoritePress) {
      onFavoritePress();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: accentColor }]}
      activeOpacity={0.96} // Subtle feedback when pressed
      onPress={handleViewProfile}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {teacher.avatar ? (
            <Image source={{ uri: teacher.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { 
              backgroundColor: accentColor,
              borderColor: accentColor 
            }]}>
              <Text style={styles.avatarText}>
                {teacher.name.charAt(0)}
              </Text>
            </View>
          )}
          {teacher.pricePerHour === 0 && (
            <View style={styles.volunteerBadge}>
              <Text style={styles.emojiIcon}>
                {getEmojiIcon('heart')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{teacher.name}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
              <Text style={styles.emojiIcon}>
                {isFavorite ? getEmojiIcon('heart') : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              {renderStars(teacher.rating)}
              <Text style={styles.ratingText}>{teacher.rating}</Text>
              <Text style={styles.reviewCount}>({teacher.reviewCount})</Text>
            </View>
            {teacher.pricePerHour === 0 && (
              <View style={styles.volunteerTag}>
                <Text style={styles.volunteerText}>Volunteer</Text>
              </View>
            )}
          </View>

          {/* Role Badge */}
          {teacher.role && (
            <View style={[
              styles.roleBadge,
              { backgroundColor: teacher.role === 'TEACHER' ? '#e8f4f8' : '#fff4e6' }
            ]}>
              <Text style={[
                styles.roleText,
                { color: teacher.role === 'TEACHER' ? '#0a66c2' : '#f59e0b' }
              ]}>
                {teacher.role === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
              </Text>
            </View>
          )}

          <Text style={styles.experience}>
            {teacher.experience} years experience
          </Text>
          <Text style={styles.location}>
            {getEmojiIcon('location-outline')} {teacher.location}
          </Text>
        </View>
      </View>

      <View style={styles.subjects}>
        {teacher.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectTag}>
            <Text style={styles.subjectText}>{subject}</Text>
          </View>
        ))}
      </View>

      <View style={styles.modes}>
        {teacher.availableModes.map((mode, index) => (
          <View key={index} style={styles.modeTag}>
            <Text style={styles.emojiIcon}>
              {mode === 'online' 
                ? getEmojiIcon('videocam-outline') 
                : getEmojiIcon('person-outline')
              }
            </Text>
            <Text style={styles.modeText}>
              {mode === 'online' ? 'Online' : 'In-person'}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              paddingVertical: 10, // Reduced from 14 to 10
              borderRadius: 18, // More rounded for smoother look
              alignItems: 'center',
              marginRight: 6, // Reduced margin
              borderWidth: 1.5, // Thinner border
              borderColor: accentColor, // Dynamic color
              // Softer, smoother shadow
              shadowColor: 'rgba(139, 92, 246, 0.08)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={handleViewProfile}
          >
            <Text style={{
              color: accentColor, // Dynamic color
              fontSize: 13, // Reduced from 15 to 13
              fontWeight: '600', // Lighter weight for smoother look
            }}>
              View Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: accentColor, // Dynamic color
              paddingVertical: 10, // Reduced from 14 to 10
              borderRadius: 18, // More rounded for smoother look
              alignItems: 'center',
              marginLeft: 6, // Reduced margin
              // Softer shadow for smoother appearance
              shadowColor: 'rgba(139, 92, 246, 0.2)',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={handleBookLesson}
          >
            <Text style={{
              color: 'white',
              fontSize: 13, // Reduced from 15 to 13
              fontWeight: '600', // Lighter weight for smoother look
            }}>
              {formatPrice(teacher.pricePerHour)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TeacherCard;