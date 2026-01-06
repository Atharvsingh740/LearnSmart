import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

interface SmartCoinDisplayProps {
  balance: number;
  style?: ViewStyle;
  size?: 'small' | 'medium';
}

export default function SmartCoinDisplay({ balance, style, size = 'medium' }: SmartCoinDisplayProps) {
  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall, style]}>
      <Text style={[styles.icon, size === 'small' && styles.iconSmall]}>💰</Text>
      <Text style={[styles.text, size === 'small' && styles.textSmall]}>{balance.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.BUTTON,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '20',
  },
  containerSmall: {
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.XS,
  },
  iconSmall: {
    fontSize: 14,
  },
  text: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
  },
  textSmall: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
  },
});
