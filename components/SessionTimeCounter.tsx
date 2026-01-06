import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { useCreditsStore } from '@/store/creditsStore';
import { Animated } from 'react-native';

interface SessionTimeCounterProps {
  showProgressBar?: boolean;
  showAlerts?: boolean;
  style?: any;
}

export const SessionTimeCounter: React.FC<SessionTimeCounterProps> = ({
  showProgressBar = true,
  showAlerts = true,
  style,
}) => {
  const sessionTime = useCreditsStore((state) => state.dailySessionMinutes);
  const subscriptionTier = useCreditsStore((state) => state.subscriptionTier);
  const isSubscriptionActive = useCreditsStore((state) => state.isSubscriptionActive());
  
  const [animatedValue] = useState(new Animated.Value(0));
  const [alertShown, setAlertShown] = useState<{ [key: number]: boolean }>({});

  const isFreeTier = subscriptionTier === 'free' || (subscriptionTier !== 'free' && !isSubscriptionActive);
  const limit = isFreeTier ? 90 : 24 * 60; // 90 minutes for free, 24 hours for premium
  const percentage = Math.min((sessionTime / limit) * 100, 100);

  const getProgressColor = () => {
    if (percentage <= 60) return COLORS.SAGE_PRIMARY;
    if (percentage <= 85) return COLORS.AMBER_GOLD;
    return COLORS.CORAL_ERROR;
  };

  const getDisplayText = () => {
    if (isPremiumTier()) {
      return `Session: Unlimited`;
    }
    return `Session: ${sessionTime} / ${limit} minutes`;
  };

  const isPremiumTier = () => {
    return subscriptionTier !== 'free' && isSubscriptionActive;
  };

  // Animate progress bar
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [sessionTime]);

  // Show alerts at thresholds
  useEffect(() => {
    const thresholds = [80, 85];
    
    if (!showAlerts || isPremiumTier()) return;

    thresholds.forEach((threshold) => {
      if (sessionTime >= threshold && !alertShown[threshold]) {
        // Show alert - simplified text output for testing
        console.log(`⏰ ${limit - sessionTime} minutes remaining today`);
        setAlertShown(prev => ({ ...prev, [threshold]: true }));
      }
    });

    // Reset alerts when session time is below thresholds
    if (sessionTime < 80) {
      setAlertShown({});
    }
  }, [sessionTime, limit, showAlerts, alertShown, isPremiumTier]);

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>Session Time</Text>
        <Text style={[styles.value, getValueStyle(sessionTime)]}>
          {getDisplayText()}
        </Text>
      </View>
      
      {showProgressBar && !isPremiumTier() && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const getValueStyle = (sessionTime: number) => {
  if (!useCreditsStore.getState().canContinueSession()) {
    return { color: COLORS.RED_ERROR, fontWeight: '700' };
  }
  return {};
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 13,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  value: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});