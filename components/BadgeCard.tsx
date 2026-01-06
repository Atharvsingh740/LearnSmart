import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import type { Badge, BadgeRarity } from '@/store/badgeStore';
import ProgressBar from '@/components/ProgressBar';

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
  progress?: { current: number; required: number };
  showDetails?: boolean;
  onPress?: () => void;
}

const rarityColor = (rarity: BadgeRarity): string => {
  switch (rarity) {
    case 'common':
      return '#A0A0A0';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return COLORS.SAGE_PRIMARY;
  }
};

export default function BadgeCard({ badge, unlocked, progress, showDetails = false, onPress }: BadgeCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColor = rarityColor(badge.rarity);

  const pct = progress ? Math.min(100, (progress.current / Math.max(1, progress.required)) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 12, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
    >
      <Animated.View
        style={[
          styles.card,
          { borderColor, opacity: unlocked ? 1 : 0.55 },
          animatedStyle,
        ]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.icon, !unlocked && styles.lockedText]}>{badge.icon}</Text>
          <View style={styles.titleCol}>
            <Text style={[styles.name, !unlocked && styles.lockedText]}>{badge.name}</Text>
            <Text style={[styles.category, !unlocked && styles.lockedText]}>{badge.category}</Text>
          </View>
        </View>

        {showDetails && (
          <Text style={[styles.description, !unlocked && styles.lockedText]}>{badge.description}</Text>
        )}

        {!unlocked && progress && (
          <View style={styles.progressBox}>
            <ProgressBar progress={pct} height={8} shimmer={false} />
            <Text style={styles.progressText}>
              {progress.current}/{progress.required}
            </Text>
          </View>
        )}

        {unlocked && badge.unlockedAt && (
          <Text style={styles.unlockedAt}>
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    borderWidth: 2,
    ...SHADOWS.LIGHT,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: SPACING.MD,
  },
  titleCol: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.CHARCOAL_TEXT,
  },
  category: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  description: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    marginTop: SPACING.SM,
  },
  progressBox: {
    marginTop: SPACING.SM,
  },
  progressText: {
    ...TYPOGRAPHY.SMALL,
    textAlign: 'right',
    marginTop: SPACING.XS,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  unlockedAt: {
    ...TYPOGRAPHY.SMALL,
    marginTop: SPACING.SM,
    color: COLORS.FOREST_ACCENT,
    fontWeight: '600',
  },
  lockedText: {
    color: COLORS.CHARCOAL_TEXT,
  },
});
