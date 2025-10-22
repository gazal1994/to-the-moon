import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teacherName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  teacherSubjects: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  subjectChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subjectChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  subjectChipTextSelected: {
    color: COLORS.white,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  durationButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  durationButtonTextSelected: {
    color: COLORS.white,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  modeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeEmoji: {
    fontSize: 24,
    marginBottom: SIZES.xs,
  },
  modeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  modeButtonTextSelected: {
    color: COLORS.white,
  },
  textInput: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: SIZES.lg,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});