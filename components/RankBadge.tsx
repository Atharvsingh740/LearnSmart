import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import type { Rank } from '@/store/rankStore';

interface RankBadgeProps {
  rank: Rank;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function RankBadge({ rank, size = 'medium', style }: RankBadgeProps) {
  const containerStyle = [
    styles.container,
    size === 'small' && styles.containerSmall,
    size === 'large' && styles.containerLarge,
    { borderColor: rank.color },
    style,
  ];

  const iconStyle = [
    styles.icon,
    size === 'small' && styles.iconSmall,
    size === 'large' && styles.iconLarge,
  ];

  const titleStyle = [
    styles.title,
    size === 'small' && styles.titleSmall,
    size === 'large' && styles.titleLarge,
  ];

  return (
    <View style={containerStyle}>
      <Text style={iconStyle}>{rank.icon}</Text>
      <View style={styles.textCol}>
        <Text style={titleStyle}>{rank.name}</Text>
        <Text style={styles.subtitle}>{rank.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.CARD,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  containerSmall: {
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    borderRadius: RADIUS.MEDIUM,
  },
  containerLarge: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
  },
  icon: {
    fontSize: 22,
    marginRight: SPACING.SM,
  },
  iconSmall: {
    fontSize: 16,
  },
  iconLarge: {
    fontSize: 28,
  },
  textCol: {
    flexDirection: 'column',
  },
  title: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
  },
  titleSmall: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
  },
  titleLarge: {
    ...TYPOGRAPHY.HEADER,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
});
