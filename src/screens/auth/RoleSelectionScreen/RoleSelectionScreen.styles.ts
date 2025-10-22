import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxl,
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: SIZES.lg,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  checkmarkEmoji: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  roleTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  roleDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: SIZES.xl,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: SIZES.lg,
    padding: SIZES.sm,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

// Helper function to get emoji icons
export const getEmojiIcon = (iconName: string) => {
  switch (iconName) {
    case 'school-outline':
      return '🎓';
    case 'person-outline':
      return '👨‍🏫';
    case 'checkmark':
      return '✓';
    default:
      return '●';
  }
};