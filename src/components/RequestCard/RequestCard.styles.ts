import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  userDetails: {
    marginLeft: SIZES.sm,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  subject: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: SIZES.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  messageContainer: {
    backgroundColor: COLORS.gray50,
    padding: SIZES.sm,
    borderRadius: 8,
    marginBottom: SIZES.sm,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emojiIcon: {
    textAlign: 'center',
  },
});

// Helper function to get emoji icons
export const getEmojiIcon = (iconName: string) => {
  switch (iconName) {
    case 'time-outline':
      return '⏰';
    case 'checkmark-circle':
      return '✅';
    case 'checkmark-circle-outline':
      return '✅';
    case 'close-circle':
      return '❌';
    case 'close-circle-outline':
      return '❌';
    case 'trophy-outline':
      return '🏆';
    case 'ban-outline':
      return '🚫';
    case 'help-outline':
      return '❓';
    case 'bookmark':
      return '📖';
    case 'close':
      return 'X';
    case 'location-outline':
      return '📍';
    case 'chevron-forward':
      return '▶️';
    case 'videocam-outline':
      return '📹';
    case 'person-outline':
      return '👤';
    default:
      return '●';
  }
};