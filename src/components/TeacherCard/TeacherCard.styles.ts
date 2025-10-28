import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0a66c2',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a66c2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a66c2',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  volunteerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#e63946',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600', 
    color: '#000000', 
    flex: 1,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a66c2',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#65676b',
    marginLeft: 4,
  },
  volunteerTag: {
    backgroundColor: '#e63946' + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  volunteerText: {
    fontSize: 11,
    color: '#e63946',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  experience: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
    color: '#65676b',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 6,
  },
  subjectTag: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  subjectText: {
    fontSize: 12,
    color: '#0a66c2',
    fontWeight: '500',
  },
  modes: {
    flexDirection: 'row',
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  modeText: {
    fontSize: 12,
    color: '#0a66c2',
    fontWeight: '500',
    marginLeft: 4,
  },
  emojiIcon: {
    textAlign: 'center',
  },
});

// Helper function to get emoji icons
export const getEmojiIcon = (iconName: string) => {
  switch (iconName) {
    case 'heart':
      return '❤️';
    case 'star':
      return '⭐';
    case 'videocam-outline':
      return '📹';
    case 'person-outline':
      return '👤';
    case 'chevron-forward':
      return '▶️';
    case 'location-outline':
      return '📍';
    case 'time-outline':
      return '⏰';
    default:
      return '●';
  }
};