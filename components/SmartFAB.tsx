import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '@/theme';

interface SmartyFABProps {
  onPress: () => void;
  unreadCount?: number;
  animated?: boolean;
}

export default function SmartyFAB({ onPress, unreadCount, animated = true }: SmartyFABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (animated) {
      scale.value = withSpring(0.85, {}, () => {
        scale.value = withSpring(1);
      });
    }
    onPress();
  };

  return (
    <Animated.View style={[styles.fabContainer, animated && animatedStyle]}>
      <TouchableOpacity style={styles.fab} onPress={handlePress} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>🤖</Text>
        {unreadCount && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.SAGE_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.MEDIUM,
  },
  fabIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: COLORS.CORAL_ERROR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.CREAM_BG,
  },
  badgeText: {
    color: COLORS.CREAM_BG,
    fontSize: 11,
    fontWeight: '700',
  },
});
