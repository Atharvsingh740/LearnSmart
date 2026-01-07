import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';
import { 
  useRecommendationsStore, 
  useCurrentLearningPath, 
  usePendingRecommendations 
} from '../../../store/recommendationsStore';
import { useUserStore } from '../../../store/userStore';
import RecommendationCard from '../../../components/RecommendationCard';
import ProgressBar from '../../../components/ProgressBar';

export default function RecommendationsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  const { 
    getSmartLearningPath, 
    getStrengthWeaknesses, 
    refreshRecommendations,
    getRecommendedLessons 
  } = useRecommendationsStore();
  
  const currentPath = useCurrentLearningPath(userId);
  const pendingRecommendations = usePendingRecommendations(userId);

  const loadRecommendations = async () => {
    try {
      const [path, analysis] = await Promise.all([
        getSmartLearningPath(userId),
        getStrengthWeaknesses(userId)
      ]);
      
      const lessons = await getRecommendedLessons(userId, 5);
      
      setLearningPath(path);
      setRecommendations(lessons);
      setStrengths(analysis.strengths);
      setWeaknesses(analysis.weaknesses);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRecommendations(userId);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleDismissRecommendation = (recommendationId) => {
    // Find the next best recommendation
    const remainingRecommendations = [...pendingRecommendations]
      .filter(rec => rec.id !== recommendationId)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });
    
    // Update the recommendations list
    setRecommendations(remainingRecommendations.slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Smart Recommendations</Text>
          <Text style={styles.subtitle}>Your AI-powered learning journey</Text>
        </View>

        {/* Progress Overview */}
        {learningPath && (
          <View style={styles.progressOverview}>
            <Text style={styles.sectionTitle}>Your Learning Path</Text>
            <ProgressBar
              progress={(learningPath.currentProgress || 0) * 100}
              height={8}
              showPercentage={true}
              style={styles.pathProgress}
            />
            <View style={styles.pathStats}>
              <Text style={styles.pathStat}>
                📊 {learningPath.estimatedCompletionTime}h estimated
              </Text>
              <Text style={styles.pathStat}>
                🎯 {(learningPath.currentProgress || 0) * 100}% complete
              </Text>
            </View>
          </View>
        )}

        {/* High Priority Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Priority Recommendations</Text>
            <Text style={styles.sectionSubtitle}>Focus on these first</Text>
            
            {recommendations
              .filter(rec => rec.priority === 'high')
              .map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onDismiss={handleDismissRecommendation}
                  showConfidence={true}
                />
              ))}
          </View>
        )}

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Performance Analysis</Text>
            
            {weaknesses.length > 0 && (
              <View style={styles.weaknessesList}>
                <Text style={styles.subSectionTitle}>Areas to Improve</Text>
                {weaknesses.map((weakness, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <View style={styles.analysisHeader}>
                      <Text style={styles.analysisSubject}>{weakness.subject}</Text>
                      <Text style={[styles.analysisScore, { color: COLORS.CORAL_ERROR }]}>
                        {weakness.score}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={weakness.score}
                      height={6}
                      progressColor={COLORS.CORAL_ERROR}
                      style={styles.analysisProgress}
                    />
                    <Text style={styles.analysisTopic}>{weakness.topic}: {weakness.mastery} mastery</Text>
                  </View>
                ))}
              </View>
            )}
            
            {strengths.length > 0 && (
              <View style={styles.strengthsList}>
                <Text style={styles.subSectionTitle}>Your Strengths</Text>
                {strengths.map((strength, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <View style={styles.analysisHeader}>
                      <Text style={styles.analysisSubject}>{strength.subject}</Text>
                      <Text style={[styles.analysisScore, { color: COLORS.SAGE_PRIMARY }]}>
                        {strength.score}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={strength.score}
                      height={6}
                      progressColor={COLORS.SAGE_PRIMARY}
                      style={styles.analysisProgress}
                    />
                    <Text style={styles.analysisTopic}>{strength.topic}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* All Recommendations */}
        {pendingRecommendations.length > 0 && (
          <View style={styles.allRecommendationsSection}>
            <Text style={styles.sectionTitle}>All Recommendations</Text>
            <Text style={styles.sectionSubtitle}>
              {pendingRecommendations.filter(r => r.priority === 'medium').length} medium • 
              {pendingRecommendations.filter(r => r.priority === 'low').length} low priority
            </Text>
            
            {pendingRecommendations
              .sort((a, b) => b.confidence - a.confidence)
              .map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  compact={true}
                  onDismiss={handleDismissRecommendation}
                />
              ))}
          </View>
        )}

        {/* Empty State */}
        {pendingRecommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              You've completed all current recommendations. Keep learning to get new ones!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  header: {
    padding: SPACING.LG,
    paddingTop: SPACING.XXL,
    alignItems: 'center',
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    marginTop: SPACING.MD,
    borderRadius: RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
  },
  title: {
    ...TYPOGRAPHY.PAGE_TITLE,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  progressOverview: {
    backgroundColor: COLORS.CREAM_BG,
    margin: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  pathProgress: {
    marginVertical: SPACING.MD,
  },
  pathStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.SM,
  },
  pathStat: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  recommendationsSection: {
    marginBottom: SPACING.LG,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    marginBottom: SPACING.MD,
    marginHorizontal: SPACING.MD,
  },
  analysisSection: {
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  subSectionTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
    marginTop: SPACING.LG,
  },
  weaknessesList: {
    marginBottom: SPACING.LG,
  },
  strengthsList: {
    marginTop: SPACING.LG,
  },
  analysisItem: {
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
    ...SHADOWS.LIGHT,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  analysisSubject: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    fontSize: 16,
  },
  analysisScore: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: 'bold',
  },
  analysisProgress: {
    marginVertical: SPACING.SM,
  },
  analysisTopic: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.XS,
  },
  allRecommendationsSection: {
    paddingHorizontal: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XXL,
    marginTop: SPACING.XL,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.MD,
  },
  emptyTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default RecommendationsScreen;