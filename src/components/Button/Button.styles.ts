import { ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../constants';

export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'text',
  size: 'small' | 'medium' | 'large',
  disabled: boolean,
  loading: boolean,
  fullWidth: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  // Size styles
  switch (size) {
    case 'small':
      baseStyle.paddingVertical = SIZES.xs;
      baseStyle.paddingHorizontal = SIZES.md;
      baseStyle.minHeight = 36;
      break;
    case 'large':
      baseStyle.paddingVertical = SIZES.md;
      baseStyle.paddingHorizontal = SIZES.xl;
      baseStyle.minHeight = 56;
      break;
    default: // medium
      baseStyle.paddingVertical = SIZES.sm + 2;
      baseStyle.paddingHorizontal = SIZES.lg;
      baseStyle.minHeight = 48;
  }

  // Variant styles
  switch (variant) {
    case 'secondary':
      baseStyle.backgroundColor = COLORS.secondary;
      break;
    case 'outline':
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = COLORS.primary;
      break;
    case 'text':
      baseStyle.backgroundColor = 'transparent';
      break;
    default: // primary
      baseStyle.backgroundColor = COLORS.primary;
  }

  // Disabled state
  if (disabled || loading) {
    baseStyle.opacity = 0.6;
  }

  // Full width
  if (fullWidth) {
    baseStyle.width = '100%';
  }

  return baseStyle;
};

export const getTextStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'text',
  size: 'small' | 'medium' | 'large'
): TextStyle => {
  const baseStyle: TextStyle = {
    fontWeight: '600',
  };

  // Size styles
  switch (size) {
    case 'small':
      baseStyle.fontSize = FONT_SIZES.sm;
      break;
    case 'large':
      baseStyle.fontSize = FONT_SIZES.lg;
      break;
    default: // medium
      baseStyle.fontSize = FONT_SIZES.md;
  }

  // Variant styles
  switch (variant) {
    case 'outline':
    case 'text':
      baseStyle.color = COLORS.primary;
      break;
    default:
      baseStyle.color = COLORS.white;
  }

  return baseStyle;
};