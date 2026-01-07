import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';
import { TYPOGRAPHY } from '../theme/typography';
import { PracticeTest } from '../store/practiceTestStore';
import ProgressBar from './ProgressBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PracticeTestCardProps {
  test: PracticeTest;
  userId?: string;
  onPress?: () => void;
  showStats?: boolean;
  showDifficulty?: boolean;
  resultMode?: boolean;
  userScore?: number;
  compact?: boolean;
}

export default function PracticeTestCard({
  test,
  userId,
  onPress,
  showStats = true,
  showDifficulty = true,
  resultMode = false,
  userScore,
  compact = false,
}: PracticeTestCardProps) {
  const getDifficultyColor = (difficulty: PracticeTest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return COLORS.GOLD_STREAK;
      case 'medium': return COLORS.AMBER_GOLD;
      case 'hard': return COLORS.CORAL_ERROR;
      default: return COLORS.SAGE_PRIMARY;
    }
  };

  const getDifficultyEmoji = (difficulty: PracticeTest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '🎯';
      case 'medium': return '🏃‍♂️';
      case 'hard': return '💥';
      default: return '📖';
    }
  };

  const renderCompactCard = () => (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.compactHeader}>
        <View style={styles.compactTitleSection}>
          <Text style={styles.compactSubject} numberOfLines={1}>
            {test.subject}
          </Text>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {test.title}
          </Text>
        </View>

        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(test.difficulty).alpha(0.1) || COLORS.SAND_BG }]}>
          <Text style={[styles.difficultyEmoji, { color: getDifficultyColor(test.difficulty) }]}>
            {getDifficultyEmoji(test.difficulty)}
          </Text>
        </View>
      </View>

      {showDifficulty && (
        <Text style={[styles.difficultyLabel, { color: getDifficultyColor(test.difficulty) }]}>
          {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)} Level
        </Text>
      )}

      {showStats && (
        <View style={styles.compactStats}>
          <Text style={styles.statItem}>
            📅 {test.totalQuestions} Questions
          </Text>
          <Text style={styles.statItem}>
            ⏰ {test.timeLimit} min
          </Text>
          <Text style={styles.statItem}>
            📊 {test.attempts} attempts
          </Text>
        </View>
      )}

      {resultMode && userScore !== undefined && (
        <View style={styles.resultSection}>
          <ProgressBar
            progress={userScore}
            height={4}
            progressColor={userScore >= test.passingScore ? COLORS.SAGE_PRIMARY : COLORS.CORAL_ERROR}
            showPercentage={true}
            style={styles.resultBar}
          />
          <Text style={[styles.scoreText, { color: userScore >= test.passingScore ? COLORS.SAGE_PRIMARY : COLORS.CORAL_ERROR }]}>
            {userScore}% {userScore >= test.passingScore ? 'PASSED' : 'FAILED'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (compact) {
    return renderCompactCard();
  }

  return (
    <View style={styles.container}>
      {/* Header with Difficulty */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getDifficultyColor(test.difficulty) }]}>
          <Text style={styles.badgeText}>
            {getDifficultyEmoji(test.difficulty)} {test.difficulty.toUpperCase()}
          </Text>
        </View>
        
        {showStats && (
          <View style={styles.attemptsBadge}>
            <Text style={styles.attemptsText}>{test.attempts} attempts</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.subject} numberOfLines={1}>{test.subject}</Text>
          <Text style={styles.chapter} numberOfLines={1}>Chapter: {test.chapter}</Text>
          <Text style={styles.title} numberOfLines={2}>{test.title}</Text>
          
          {test.description && (
            <Text style={styles.description} numberOfLines={2}>
              {test.description}
            </Text>
          )}
        </View>

        {/* Stats Grid */}
        {showStats && (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{test.totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{test.timeLimit}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{test.passingScore}%</Text>
              <Text style={styles.statLabel}>Passing</Text>
            </View>
            {test.averageScore > 0 && (
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{test.averageScore}%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
            )}
          </View>
        )}

        {/* Mock Exam Badge */}
        {test.isMockExam && (
          <View style={styles.mockExamBadge}>
            <Text style={styles.mockExamText}>✨ MOCK EXAM - Custom Generated
            </Text>
          </View>
        )}

        {/* Negative Marking Warning */}
        {test.negativeMarking && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>
              ⚠️ Negative marking applies - Wrong answers deduct 0.25 marks
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: getDifficultyColor(test.difficulty) }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {resultMode ? 'Review Test' : test.attempts > 0 ? 'Retake Test' : 'Start Test'}
        </Text>
        <Text style={styles.buttonIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.LARGE,
    marginHorizontal: SPACING.SM,
    marginVertical: SPACING.XS,
    overflow: 'hidden',
    ...SHADOWS.MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    paddingBottom: 0,
  },
  badge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS / 2,
    borderRadius: RADIUS.SMALL,
  },
  badgeText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  attemptsBadge: {
    backgroundColor: COLORS.CREAM_BG,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS / 2,
    borderRadius: RADIUS.SMALL,
  },
  attemptsText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  content: {
    padding: SPACING.MD,
  },
  titleSection: {
    marginBottom: SPACING.MD,
  },
  subject: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.FOREST_ACCENT,
    fontSize: 12,
    marginBottom: SPACING.XS / 2,
  },
  chapter: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
    opacity: 0.8,
  },
  title: {
    ...TYPOGRAPHY.SECTION_HEADER,
    marginBottom: SPACING.SM,
  },
  description: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.MD,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 20,
  },
  statLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.XS / 2,
  },
  mockExamBadge: {
    backgroundColor: COLORS.GOLD_STREAK,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    marginTop: SPACING.SM,
    alignSelf: 'flex-start',
  },
  mockExamText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CREAM_BG,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: COLORS.CORAL_ERROR,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    marginTop: SPACING.SM,
    alignSelf: 'flex-start',
  },
  warningText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CREAM_BG,
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    borderBottomLeftRadius: RADIUS.LARGE,
    borderBottomRightRadius: RADIUS.LARGE,
  },
  buttonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 20,
    color: COLORS.SAND_BG,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginHorizontal: SPACING.SM,
    marginVertical: SPACING.XS,
    ...SHADOWS.LIGHT,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  compactTitleSection: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  compactSubject: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS / 2,
  },
  compactTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 14,
    lineHeight: 18,
  },
  difficultyBadge: {
    padding: SPACING.XS,
    borderRadius: RADIUS.SMALL,
  },
  difficultyEmoji: {
    fontSize: 16,
  },
  difficultyLabel: {
    ...TYPOGRAPHY.BULLET_TEXT,
    alignSelf: 'flex-start',
    marginTop: SPACING.XS,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  statItem: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  resultSection: {
    marginTop: SPACING.MD,
  },
  resultBar: {
    marginTop: SPACING.SM,
  },
  scoreText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    textAlign: 'center',
    marginTop: SPACING.SM,
    fontWeight: '600',
  },
});

export default PracticeTestCard;