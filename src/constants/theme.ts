import { COLORS, FONT_SIZES } from './colors';

// React Native Elements theme configuration
export const theme = {
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    text: COLORS.text,
    disabled: COLORS.gray400,
    divider: COLORS.divider,
    platform: {
      ios: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
      },
      android: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
      },
    },
  },
  Button: {
    titleStyle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
  Text: {
    style: {
      fontSize: FONT_SIZES.md,
      color: COLORS.text,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 12,
      elevation: 2,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  },
  Header: {
    backgroundColor: COLORS.primary,
    centerComponent: {
      style: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
      },
    },
  },
};