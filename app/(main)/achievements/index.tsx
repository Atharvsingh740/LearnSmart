import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { SPACING } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';
import {
  useAchievementStore,
  Achievement,
  AchievementCategory,
} from '@/store/achievementStore';
import AchievementCard from '@/components/AchievementCard';
import AchievementUnlockModal from '@/components/AchievementUnlockModal';
import ProgressBar from '@/components/ProgressBar';

const CATEGORIES: { key: 'all' | AchievementCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'learning', label: 'Learning' },
  { key: 'streak', label: 'Streak' },
  { key: 'social', label: 'Social' },
  { key: 'milestone', label: 'Milestone' },
];

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const achievementStore = useAchievementStore();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize achievements for current user
  useEffect(() => {
    // This would normally get the real user ID from authStore
    const userId = 'current-user';
    achievementStore.initializeAchievements(userId);
  }, []);

  const userId = 'current-user'; // Placeholder
  
  const achievements = achievementStore.getAchievements(userId);
  const unlockedAchievements = achievementStore.getUnlockedAchievements(userId);
  const progressAchievements = achievementStore.getProgressAchievements(userId);

  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowUnlockModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh achievement data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const totalAchievements = achievements.length;
  const unlockedCount = unlockedAchievements.length;
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.reward, 0);
  const completionRate = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary + '10', colors.accent + '10']}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Achievements
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
          Unlock achievements and earn rewards
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {unlockedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Unlocked
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>
              {completionRate}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Complete
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {totalPoints}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Credits Earned
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={completionRate}
            color={colors.primary}
            backgroundColor={colors.border}
            height={8}
          />
          <Text style={[styles.progressText, { color: colors.secondaryText }]}>
            {unlockedCount}/{totalAchievements} achievements unlocked
          </Text>
        </View>
      </LinearGradient>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.tab,
              selectedCategory === category.key && styles.tabActive,
              {
                backgroundColor:
                  selectedCategory === category.key
                    ? colors.primary
                    : colors.card,
              },
            ]}
            onPress={() => setSelectedCategory(category.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    selectedCategory === category.key
                      ? colors.white
                      : colors.text,
                },
              ]}
            >
              {category.label}
            </Text>
            {selectedCategory === category.key && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.white }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.grid}>
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              size="small"
              mode="grid"
              onPress={() => handleAchievementPress(achievement)}
              showProgress={true}
            />
          ))}
        </View>

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No achievements found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Unlock Modal */}
      <AchievementUnlockModal
        achievement={selectedAchievement}
        visible={showUnlockModal}
        onDismiss={() => setShowUnlockModal(false)}
        onShare={() => {
          // Handle sharing achievement
          alert('Achievement shared!');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  tabsContainer: {
    maxHeight: 60,
    backgroundColor: 'white',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabActive: {
    borderColor: 'transparent',
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.body,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AchievementsScreen;