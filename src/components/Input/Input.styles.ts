import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    letterSpacing: 0.2,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    minHeight: 54,
    paddingHorizontal: SIZES.md,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.md,
    fontWeight: '500',
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.xs,
  },
  inputWithRightIcon: {
    paddingRight: SIZES.xs,
  },
  leftIcon: {
    marginLeft: SIZES.sm,
  },
  rightIcon: {
    padding: SIZES.sm,
    marginRight: SIZES.xs,
  },
  iconText: {
    fontSize: 18,
    marginRight: SIZES.xs,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SIZES.xs,
    fontWeight: '500',
  },
});