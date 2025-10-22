import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.xs,
  },
  inputWithRightIcon: {
    paddingRight: SIZES.xs,
  },
  leftIcon: {
    marginLeft: SIZES.md,
  },
  rightIcon: {
    padding: SIZES.sm,
    marginRight: SIZES.xs,
  },
  iconText: {
    fontSize: 16,
    marginLeft: SIZES.md,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
});