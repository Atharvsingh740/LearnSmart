import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { useAnalyticsStore, StudentStats, LearningInsights } from '@/store/analyticsStore';
import { useAchievementStore } from '@/store/achievementStore';
import ProgressBar from '@/components/ProgressBar';

const AnalyticsScreen = () => {
  const { colors } = useTheme();
  const analyticsStore = useAnalyticsStore();
  const achievementStore = useAchievementStore();
  
  const userId = 'current-user';
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [activeTab]);

  const loadAnalytics = async () => {
    const userStats = analyticsStore.getStats(userId);
    const learningInsights = analyticsStore.calculateLearningInsights(userId);
    setStats(userStats);
    setInsights(learningInsights);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (!stats || !insights) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading analytics...</Text>
      </View>
    );
  }

  // Sample chart data
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [2, 3, 1, 4, 2, 5, 3],
      color: () => colors.primary,
      strokeWidth: 2,
    }],
  };

  const subjectData = [
    { name: 'Physics', population: 40, color: '#FF6384' },
    { name: 'Chemistry', population: 35, color: '#36A2EB' },
    { name: 'Biology', population: 25, color: '#FFCE56' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Track your learning progress and insights
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['week', 'month', 'all'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? colors.white : colors.secondaryText },
            ]}>
              {tab === 'week' ? 'This Week' : tab === 'month' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics Cards */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.metricNumber, { color: colors.primary }]}>{stats.totalLessonsCompleted}</Text>
          <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Lessons</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.metricNumber, { color: colors.accent }]}>{stats.totalQuizzesTaken}</Text>
          <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Quizzes</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.metricNumber, { color: colors.warning }]}>{stats.totalTestsTaken}</Text>
          <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Tests</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.metricNumber, { color: colors.info }]}>{Math.round(stats.learningTime / 60)}h</Text>
          <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Study Time</Text>
        </View>
      </View>

      {/* Learning Activity Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Learning Activity (Minutes)</Text>
        <BarChart
          data={weeklyActivityData}
          width={350}
          height={200}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.secondaryText,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
          fromZero
        />
      </View>

      {/* Performance Trend */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Quiz Performance Trend</Text>
        <LineChart
          data={{
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
              data: [65, 72, 78, 85, 82, 90, 87],
              color: () => colors.primary,
              strokeWidth: 2,
            }],
          }}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.secondaryText,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Subject Breakdown */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Subject Breakdown</Text>
        <PieChart
          data={subjectData}
          width={350}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      {/* Insights Section */}
      <View style={[styles.insightsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.insightsTitle, { color: colors.text }]}>AI Insights</Text>
        {insights.recommendedFocus.map((focus, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={[styles.insightIcon, { color: colors.primary }]}>•</Text>
            <Text style={[styles.insightText, { color: colors.secondaryText }]}>
              {focus}
            </Text>
          </View>
        ))}
      </View>

      {/* Streak Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Current Streak: {stats.currentStreak} days</Text>
        <Text style={[styles.statsSubtitle, { color: colors.secondaryText }]}>
          Longest Streak: {stats.longestStreak} days
        </Text>
        <ProgressBar
          progress={(stats.currentStreak / 100) * 100}
          color={colors.primary}
          backgroundColor={colors.border}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    ...typography.heading,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    overflow: 'scroll',
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: 80,
  },
  metricNumber: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chartTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  insightsTitle: {
    ...typography.bodyBold,
    fontSize: 18,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  insightText: {
    ...typography.body,
    fontSize: 14,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statsTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    marginBottom: 8,
  },
  statsSubtitle: {
    ...typography.body,
    fontSize: 14,
    marginBottom: 16,
  },
});

export default AnalyticsScreen;