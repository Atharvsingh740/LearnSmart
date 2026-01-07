import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { Achievement } from '@/store/achievementStore';
import { useTheme } from '@/theme/useTheme';

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
  onShare?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  visible,
  onDismiss,
  onShare,
}) => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && achievement) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnim.setValue(0);
      rotateAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset when hidden
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, achievement]);

  if (!visible || !achievement) return null;

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiParticles = Array.from({ length: 8 }, (_, i) => i);

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        
        {/* Confetti Effect */}
        {confettiParticles.map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                opacity: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateY: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -SCREEN_HEIGHT],
                    }),
                  },
                ],
                left: `${(index * 12.5)}%`,
                backgroundColor: index % 2 === 0 ? COLORS.SAGE_PRIMARY : COLORS.FOREST_ACCENT,
              },
            ]}
          />
        ))}

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.white }]}>
            🎉 Achievement Unlocked! 🎉
          </Text>
        </View>

        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: rotateInterpolation }],
            },
          ]}
        >
          <Text style={styles.icon}>{achievement.icon}</Text>
        </Animated.View>

        <View style={styles.details}>
          <Text style={[styles.achievementTitle, { color: colors.white }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDescription, { color: colors.white + 'DD' }]}>
            {achievement.description}
          </Text>
          
          <View style={styles.rewardContainer}>
            <Text style={[styles.rewardLabel, { color: colors.white + 'CC' }]}>
              Reward Earned:
            </Text>
            <Text style={[styles.rewardAmount, { color: colors.accentLight }]}>
              +{achievement.reward} Credits
            </Text>
          </View>

          {achievement.unlockedAt && (
            <Text style={[styles.unlockDate, { color: colors.white + '99' }]}>
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {onShare && (
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.white + '20' }]}
              onPress={onShare}
            >
              <Text style={[styles.shareButtonText, { color: colors.white }]}>
                📤 Share Achievement
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.white }]}
            onPress={onDismiss}
          >
            <Text style={[styles.dismissButtonText, { color: colors.primary }]}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  content: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    right: '5%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.WHITE + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  details: {
    alignItems: 'center',
    marginBottom: 32,
  },
  achievementTitle: {
    ...typography.heading,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementDescription: {
    ...typography.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    ...typography.caption,
    fontSize: 14,
    marginRight: 8,
  },
  rewardAmount: {
    ...typography.bodyBold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  unlockDate: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  shareButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.WHITE + '40',
  },
  shareButtonText: {
    ...typography.button,
    fontSize: 14,
  },
  dismissButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  dismissButtonText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AchievementUnlockModal;