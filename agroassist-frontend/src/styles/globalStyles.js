import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

// Colores principales basados en el diseño
export const colors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  secondary: '#66BB6A',
  accent: '#8BC34A',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  success: '#4CAF50',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    onPrimary: '#FFFFFF',
  },
  border: '#E0E0E0',
  disabled: '#F5F5F5',
  shadow: '#000000',
};

// Dimensiones
export const dimensions = {
  width,
  height,
  isSmallDevice: width < 375,
  isTablet: width > 768,
};

// Espaciados
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente
export const typography = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body1: 16,
  body2: 14,
  button: 16,
  caption: 12,
  overline: 10,
};

// Estilos globales
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: colors.text.onPrimary,
    fontSize: typography.button,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: typography.button,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body1,
    backgroundColor: colors.surface,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  label: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  errorText: {
    fontSize: typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: typography.body1,
    color: colors.text.primary,
    lineHeight: 24,
  },
  captionText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body1,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.caption,
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
  marginVertical: {
    marginVertical: spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: spacing.md,
  },
  padding: {
    padding: spacing.md,
  },
  paddingVertical: {
    paddingVertical: spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
});

export default globalStyles;
