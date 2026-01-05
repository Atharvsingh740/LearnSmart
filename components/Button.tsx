import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.CREAM_BG : COLORS.SAGE_PRIMARY} />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: RADIUS.BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    ...SHADOWS.LIGHT,
  },
  primaryButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SAND_BG,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.CREAM_BG,
  },
  secondaryText: {
    color: COLORS.SAGE_PRIMARY,
  },
  outlineText: {
    color: COLORS.SAGE_PRIMARY,
  },
});
