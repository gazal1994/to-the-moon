import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    padding: SIZES.xl,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
    marginTop: SIZES.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  roleSelection: {
    backgroundColor: COLORS.white,
    padding: SIZES.xl,
    borderRadius: 16,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  roleButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: COLORS.primary,
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: SIZES.xs,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  form: {
    backgroundColor: COLORS.white,
    padding: SIZES.xl,
    borderRadius: 16,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SIZES.md,
    marginTop: SIZES.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxUnchecked: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  checkboxText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: -SIZES.sm,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.sm,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signUpButton: {
    marginTop: SIZES.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  subjectsContainer: {
    marginBottom: SIZES.xl,
  },
  subjectsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    letterSpacing: 0.2,
  },
  subjectsHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  subjectChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: SIZES.xs,
  },
  subjectChipSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: COLORS.primary,
  },
  subjectChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  subjectChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  required: {
    color: COLORS.error,
  },
});