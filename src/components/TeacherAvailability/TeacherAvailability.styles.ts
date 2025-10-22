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
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.md,
  },
  dayContainer: {
    marginBottom: SIZES.lg,
  },
  dayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  timeSlot: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 60,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: COLORS.white,
  },
  footer: {
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});