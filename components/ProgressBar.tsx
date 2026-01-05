import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = COLORS.SAND_BG,
  progressColor = COLORS.SAGE_PRIMARY,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            height,
            backgroundColor: progressColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.SMALL,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: RADIUS.SMALL,
  },
});
