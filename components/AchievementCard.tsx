import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { Achievement } from '@/store/achievementStore';
import ProgressBar from './ProgressBar';
import { useTheme } from '@/theme/useTheme';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  mode?: 'grid' | 'list';
  onPress?: () => void;
  showProgress?: boolean;
  unlocked?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  size = 'medium',
  mode = 'list',
  onPress,
  showProgress = true,
  unlocked,
}) => {
  const { colors } = useTheme();
  const isUnlocked = unlocked ?? achievement.unlockedAt !== null;
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  // Determine style based on unlock status
  const cardStyle = [
    styles.card,
    styles[`${size}Card`],
    isUnlocked ? styles.unlockedCard : styles.lockedCard,
    { backgroundColor: isUnlocked ? colors.card : colors.border },
    mode === 'grid' && styles.gridCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {isUnlocked && (
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          style={styles.gradientOverlay}
        />
      )}
      
      <View style={styles.content}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          isUnlocked ? styles.unlockedIcon : styles.lockedIcon,
          { backgroundColor: isUnlocked ? colors.primary + '30' : colors.border },
        ]}>
          <Text style={[
            styles.icon,
            isUnlocked ? styles.unlockedIconText : styles.lockedIconText,
            size === 'large' && styles.largeIcon,
          ]}>
            {achievement.icon}
          </Text>
        </View>

        {/* Title and Description */}
        {mode === 'list' && (
          <View style={styles.textContent}>
            <Text style={[
              styles.title,
              isUnlocked ? styles.unlockedTitle : styles.lockedTitle,
              { color: isUnlocked ? colors.text : colors.secondaryText },
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.description,
              isUnlocked ? styles.unlockedDescription : styles.lockedDescription,
              { color: colors.secondaryText },
            ]} numberOfLines={2}>
              {achievement.description}
            </Text>
          </View>
        )}

        {/* Progress */}
        {showProgress && !isUnlocked && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress}
              color={colors.primary}
              backgroundColor={colors.border}
              height={4}
            />
            <Text style={[
              styles.progressText,
              { color: colors.secondaryText },
            ]}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
          </View>
        )}

        {/* Status */}
        {isUnlocked && (
          <View style={styles.statusContainer}>
            <Text style={[
              styles.unlockedBadge,
              { color: colors.success },
            ]}>
              ✓ Unlocked
            </Text>
            <Text style={[
              styles.reward,
              { color: colors.accent },
            ]}>
              +{achievement.reward} credits
            </Text>
          </View>
        )}
      </View>

      {/* Locked Indicator */}
      {!isUnlocked && mode === 'grid' && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  smallCard: {
    padding: 12,
    margin: 4,
  },
  mediumCard: {
    padding: 16,
    margin: 8,
  },
  largeCard: {
    padding: 20,
    margin: 12,
  },
  gridCard: {
    flex: 1,
    margin: 8,
    minWidth: 140,
    maxWidth: 180,
  },
  unlockedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.7,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  unlockedIcon: {
    backgroundColor: COLORS.SAGE_PRIMARY + '40',
  },
  lockedIcon: {
    backgroundColor: COLORS.MOUNTAIN_SHADOW + '40',
  },
  icon: {
    fontSize: 24,
  },
  largeIcon: {
    fontSize: 36,
  },
  unlockedIconText: {
    color: COLORS.SAGE_PRIMARY,
  },
  lockedIconText: {
    color: COLORS.MOUNTAIN_SHADOW,
  },
  textContent: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 16,
    marginBottom: 4,
  },
  unlockedTitle: {
    color: COLORS.SAGE_DARK,
  },
  lockedTitle: {
    color: COLORS.MOUNTAIN_SHADOW,
  },
  description: {
    ...typography.caption,
    fontSize: 13,
  },
  unlockedDescription: {
    color: COLORS.FOREST_ACCENT,
  },
  lockedDescription: {
    color: COLORS.MOUNTAIN_SHADOW,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    ...typography.caption,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  unlockedBadge: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  reward: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  lockIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
});

export default AchievementCard;