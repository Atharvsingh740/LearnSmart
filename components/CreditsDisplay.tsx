import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { useCreditsStore } from '@/store/creditsStore';

interface CreditsDisplayProps {
  onPress?: () => void;
  showSubscriptionBadge?: boolean;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  onPress,
  showSubscriptionBadge = true,
}) => {
  const credits = useCreditsStore((state) => state.credits);
  const subscriptionTier = useCreditsStore((state) => state.subscriptionTier);
  const isSubscriptionActive = useCreditsStore((state) => state.isSubscriptionActive());

  const isLowCredits = credits < 10;
  const isPremium = subscriptionTier !== 'free' && isSubscriptionActive;

  const getCreditColor = () => {
    if (isLowCredits) return COLORS.CORAL_ERROR;
    if (isPremium) return COLORS.GOLD_STREAK;
    return COLORS.SAGE_PRIMARY;
  };

  const getCreditText = () => {
    if (isPremium && subscriptionTier === 'monthly') {
      return '⭐ Monthly';
    }
    if (isPremium && subscriptionTier === 'yearly') {
      return '👑 Yearly';
    }
    if (isLowCredits) {
      return `💳 ${credits} (Low!)`;
    }
    return `💳 ${credits} credits`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: COLORS.SAND_BG }]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={[styles.creditsText, { color: getCreditColor() }]}>
          {getCreditText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});