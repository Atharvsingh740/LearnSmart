import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../theme';
import { TYPOGRAPHY } from '../theme/typography';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  showPercentage?: boolean;
  showMilestones?: boolean;
  shimmer?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = COLORS.SAND_BG,
  progressColor = COLORS.SAGE_PRIMARY,
  style,
  animated = true,
  showPercentage = false,
  showMilestones = false,
  shimmer = true,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressAnimation = useSharedValue(0);
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressAnimation.value = withTiming(clampedProgress, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      progressAnimation.value = clampedProgress;
    }
  }, [clampedProgress, animated]);

  useEffect(() => {
    if (shimmer) {
      shimmerAnimation.value = withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      });
    }
  }, [shimmer]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-100, 400]);
    return {
      transform: [{ translateX }],
    };
  });

  const milestones = [25, 50, 75, 100];

  return (
    <View>
      <View style={[styles.container, { height, backgroundColor }, style]}>
        <Animated.View
          style={[
            styles.progress,
            {
              height,
              backgroundColor: progressColor,
            },
            progressStyle,
          ]}
        >
          {shimmer && (
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          )}
        </Animated.View>

        {showMilestones &&
          milestones.map((milestone) => (
            <View
              key={milestone}
              style={[
                styles.milestone,
                { left: `${milestone}%`, height: height + 4 },
              ]}
            />
          ))}
      </View>

      {showPercentage && (
        <Text style={styles.percentageText}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.SMALL,
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    borderRadius: RADIUS.SMALL,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  milestone: {
    position: 'absolute',
    width: 2,
    backgroundColor: COLORS.GOLD_STREAK,
    top: -2,
    opacity: 0.5,
  },
  percentageText: {
    ...TYPOGRAPHY.METADATA,
    textAlign: 'center',
    marginTop: SPACING.XS,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 1,
  },
});
