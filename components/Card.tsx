import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevatedCard,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.CARD,
    padding: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  elevatedCard: {
    ...SHADOWS.MEDIUM,
  },
});
