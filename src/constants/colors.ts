export const COLORS = {
  // LinkedIn-inspired primary colors
  primary: '#0A66C2', // LinkedIn blue
  primaryLight: '#378FE9',
  primaryDark: '#004182',
  secondary: '#057642', // LinkedIn green for success
  success: '#057642',
  warning: '#F5B800',
  error: '#CC1016',
  
  // Neutral colors - LinkedIn style
  black: '#000000',
  white: '#FFFFFF',
  background: '#F4F2EE', // LinkedIn's warm background
  surface: '#FFFFFF',
  
  // Text colors - LinkedIn hierarchy
  text: '#000000E6', // 90% black for primary text
  textSecondary: '#00000099', // 60% black for secondary text
  textTertiary: '#00000066', // 40% black for tertiary text
  textMuted: '#666666',
  
  // Gray scale - LinkedIn's professional grays
  gray50: '#FAFAFA',
  gray100: '#F3F2F0',
  gray200: '#E9E5DF',
  gray300: '#D4CCBA',
  gray400: '#A0A0A0',
  gray500: '#666666',
  gray600: '#434649',
  gray700: '#313336',
  gray800: '#1D2226',
  gray900: '#000000',
  
  // Border and divider - LinkedIn style
  border: '#D4CCBA',
  divider: '#E9E5DF',
  
  // LinkedIn-specific UI colors
  linkedinBlue: '#0A66C2',
  linkedinLightBlue: '#EDF3F8',
  linkedinGreen: '#057642',
  linkedinLightGreen: '#EDF9F0',
  linkedinOrange: '#F8B42E',
  linkedinLightOrange: '#FDF4E7',
  linkedinRed: '#CC1016',
  linkedinLightRed: '#FCE8E8',
  
  // Light colors for tags and badges
  lightGray: '#F3F2F0',
  lightBlue: '#EDF3F8',
  lightGreen: '#EDF9F0',
  lightPurple: '#F0EDF8',
  lightOrange: '#FDF4E7',
  
  // Card and component colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E9E5DF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  // Action colors
  like: '#CC1016',
  comment: '#666666',
  share: '#666666',
  
  // Shadow color
  shadow: '#000000',
};

export const FONT_SIZES = {
  // LinkedIn-inspired font hierarchy
  xs: 11,      // Small captions, metadata
  sm: 12,      // Secondary text, timestamps
  md: 14,      // Body text, descriptions
  lg: 16,      // Primary text, titles
  xl: 20,      // Section headers
  xxl: 24,     // Page titles
  xxxl: 32,    // Hero text
  heading1: 28,
  heading2: 24,
  heading3: 20,
  body: 14,
  caption: 12,
  overline: 11,
};

export const SIZES = {
  // LinkedIn-inspired spacing system
  xs: 4,       // Tiny gaps
  sm: 8,       // Small spacing
  md: 12,      // Medium spacing
  lg: 16,      // Standard spacing
  xl: 20,      // Large spacing
  xxl: 24,     // Extra large spacing
  xxxl: 32,    // Section spacing
  section: 24, // Between major sections
  card: 16,    // Card padding
  cardGap: 8,  // Gap between cards
};

export const BORDER_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,       // LinkedIn standard radius
  lg: 12,
  xl: 16,
  round: 999,  // Fully rounded
};

export const SHADOWS = {
  // LinkedIn-style subtle shadows
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};