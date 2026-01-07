import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { useStreakStore } from '@/store/streakStore';
import { useCreditsStore } from '@/store/creditsStore';
import { useAchievementStore } from '@/store/achievementStore';

interface StreakWidgetProps {
  onPress?: () => void;
  showFreeze?: boolean;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  onPress,
  showFreeze = true,
}) => {
  const { colors } = useTheme();
  const streakStore = useStreakStore();
  const creditsStore = useCreditsStore();
  const achievementStore = useAchievementStore();
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [streakCount, setStreakCount] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);
  const [freezeAvailable, setFreezeAvailable] = useState(false);

  useEffect(() => {
    // Update streak info
    const currentStreak = streakStore.getCurrentStreak();
    const longestStreak = streakStore.getLongestStreak();
    setStreakCount(currentStreak);

    // Calculate streak bonus
    const bonus = Math.floor(currentStreak * 0.5); // +0.5 credits per day
    setStreakBonus(bonus);

    // Check freeze availability
    setFreezeAvailable(currentStreak >= 7);

    // Pulse animation for active streaks
    if (currentStreak > 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Check for streak achievements
    if (currentStreak > 0) {
      streakStore.checkStreakAchievements?.();
    }
  }, [streakStore.getCurrentStreak()]);

  const handleFreezeStreak = async () => {
    const success = await streakStore.activateStreakProtection();
    if (success) {
      // Deduct credits
      creditsStore.subtractCredits(50, 'Streak freeze');
      
      // Show confirmation
      alert('Streak frozen! Your streak is protected for 24 hours.');
    } else {
      alert('Unable to freeze streak. Minimum 7-day streak required or insufficient credits.');
    }
  };

  const getStreakIcon = () => {
    if (streakCount >= 100) return '🔥';
    if (streakCount >= 60) return '🏅';
    if (streakCount >= 30) return '⭐';
    if (streakCount >= 14) return '🚀';
    if (streakCount >= 7) return '🤝';
    return '✨';
  };

  const getStreakLevel = () => {
    if (streakCount >= 100) return 'Legendary';
    if (streakCount >= 60) return 'Epic';
    if (streakCount >= 30) return 'Rare';
    if (streakCount >= 14) return 'Uncommon';
    if (streakCount >= 7) return 'Common';
    return 'Beginner';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          streakCount >= 7 && styles.animatedCard,
          {
            shadowColor: colors.primary,
            shadowOpacity: streakCount >= 7 ? 0.3 : 0.1,
          },
        ]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        {streakCount >= 7 && (
          <LinearGradient
            colors={[colors.primary + '30', colors.accent + '30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        )}

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Streak
          </Text>
          <View style={[
            styles.badge,
            {
              backgroundColor:
                streakCount >= 30
                  ? colors.warning + '20'
                  : colors.primary + '20',
            },
          ]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {getStreakLevel()}
            </Text>
          </View>
        </View>

        <View style={styles.streakInfo}>
          <Text style={[styles.streakIcon, { color: colors.text }]}>
            {getStreakIcon()}
          </Text>
          <View style={styles.streakDetails}>
            <Text style={[styles.streakNumber, { color: colors.text }]}>
              {streakCount} Days
            </Text>
            <Text style={[styles.bonus, { color: colors.primary }]}>
              +{streakBonus} credits/day
            </Text>
          </View>
        </View>

        {streakCount > 0 && (
          <View style={styles.progress}>
            <View style={styles.progressBackground}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${Math.min(streakCount / 100, 1) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.secondaryText }]}>
              {streakCount}/100
            </Text>
          </View>
        )}

        {showFreeze && freezeAvailable && (
          <TouchableOpacity
            style={[
              styles.freezeButton,
              { backgroundColor: colors.primary + '20' },
            ]}
            onPress={handleFreezeStreak}
          >
            <Text style={[styles.freezeText, { color: colors.primary }]}>
              🤟 Freeze Streak (Free)
            </Text>
          </TouchableOpacity>
        )}

        {/* Milestone markers */}
        <View style={styles.milestones}>
          {[7, 30, 100].map((milestone, index) => (
            <View
              key={milestone}
              style={[
                styles.milestone,
                streakCount >= milestone && styles.milestoneAchieved,
                {
                  backgroundColor:
                    streakCount >= milestone
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text style={[
                styles.milestoneText,
                { color: streakCount >= milestone ? colors.white : colors.secondaryText },
              ]}>
                {milestone}
              </Text>
              {index < 2 && <Text style={[styles.milestoneSeparator, { color: colors.border }]}>•</Text>}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  animatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakDetails: {
    flex: 1,
  },
  streakNumber: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: 'bold',
  },
  bonus: {
    ...typography.caption,
    fontSize: 13,
  },
  progress: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLORS.MIST_GRAY,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    fontSize: 11,
    textAlign: 'right',
  },
  freezeButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  freezeText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '600',
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneAchieved: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  milestoneText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  milestoneSeparator: {
    marginHorizontal: 4,
  },
});

export default StreakWidget;