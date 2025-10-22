import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES, BORDER_RADIUS, SHADOWS } from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    marginBottom: SIZES.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#e1dfdd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  appIcon: {
    fontSize: 40,
    marginRight: SIZES.md,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  appDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  developerInfo: {
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: '#e1dfdd',
  },
  developerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  developerName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: SIZES.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  contactArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  topicIcon: {
    fontSize: 24,
    marginRight: SIZES.md,
    marginTop: 2,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  faqText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: SIZES.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});