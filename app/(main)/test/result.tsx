import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTestStore } from '@/store/testStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';

export default function TestResultScreen() {
  const { testId } = useLocalSearchParams();
  const router = useRouter();
  const { getTestHistory } = useTestStore();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ReturnType<typeof useTestStore.getState>['testHistory'][number] | null>(null);
  
  useEffect(() => {
    if (testId) {
      const history = getTestHistory();
      const testResult = history.find(t => t.testId === testId);
      setResult(testResult || null);
      setLoading(false);
    }
  }, [testId]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleReviewAnswers = () => {
    // Navigate to answer review (could be implemented as a modal or separate screen)
    router.back();
  };
  
  const handleRetakeTest = () => {
    if (result) {
      if (result.testType === 'quick') {
        router.push(`/lessons/${result.chapterId}/quick-test`);
      } else {
        router.push(`/test/${result.classId}/${result.subjectId}/${result.chapterId}`);
      }
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.SAGE_PRIMARY;
    if (score >= 60) return COLORS.AMBER_GOLD;
    return COLORS.CORAL_ERROR;
  };
  
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return '🌟 Excellent! You\'re a star!';
    if (score >= 80) return '👏 Great job! Keep it up!';
    if (score >= 70) return '👍 Good work! Room for improvement.';
    if (score >= 60) return '💪 Nice effort! Review the concepts.';
    return '📚 Keep practicing! You\'ll get better.';
  };
  
  const getTimeString = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.SAGE_PRIMARY} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }
  
  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Result not found</Text>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    );
  }
  
  const scoreColor = getScoreColor(result.score);
  const performanceMessage = getPerformanceMessage(result.score);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Test Results</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <View style={[styles.scoreCard, { borderColor: scoreColor }]}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{result.score}%</Text>
          </View>
          <Text style={styles.performanceMessage}>{performanceMessage}</Text>
          <View style={styles.scoreDetails}>
            <View style={styles.scoreDetailItem}>
              <Text style={styles.scoreDetailLabel}>Correct</Text>
              <Text style={[styles.scoreDetailValue, { color: COLORS.SAGE_PRIMARY }]}>
                {result.correctAnswers}
              </Text>
            </View>
            <View style={styles.scoreDetailDivider} />
            <View style={styles.scoreDetailItem}>
              <Text style={styles.scoreDetailLabel}>Total</Text>
              <Text style={styles.scoreDetailValue}>{result.totalQuestions}</Text>
            </View>
            <View style={styles.scoreDetailDivider} />
            <View style={styles.scoreDetailItem}>
              <Text style={styles.scoreDetailLabel}>Time</Text>
              <Text style={styles.scoreDetailValue}>{getTimeString(result.timeTaken)}</Text>
            </View>
          </View>
        </View>
        
        {/* Score Breakdown by Difficulty */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📊 Score Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Easy</Text>
              <Text style={styles.breakdownValue}>
                {result.scoreBreakdown.easy.correct}/{result.scoreBreakdown.easy.total}
              </Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${result.scoreBreakdown.easy.total > 0 ? (result.scoreBreakdown.easy.correct / result.scoreBreakdown.easy.total) * 100 : 0}%`,
                      backgroundColor: COLORS.SAGE_PRIMARY,
                    },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Medium</Text>
              <Text style={styles.breakdownValue}>
                {result.scoreBreakdown.medium.correct}/{result.scoreBreakdown.medium.total}
              </Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${result.scoreBreakdown.medium.total > 0 ? (result.scoreBreakdown.medium.correct / result.scoreBreakdown.medium.total) * 100 : 0}%`,
                      backgroundColor: COLORS.AMBER_GOLD,
                    },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Hard</Text>
              <Text style={styles.breakdownValue}>
                {result.scoreBreakdown.hard.correct}/{result.scoreBreakdown.hard.total}
              </Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${result.scoreBreakdown.hard.total > 0 ? (result.scoreBreakdown.hard.correct / result.scoreBreakdown.hard.total) * 100 : 0}%`,
                      backgroundColor: COLORS.CORAL_ERROR,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Answer Review */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📝 Answer Review</Text>
          
          {result.questions.map((question, index) => {
            const userAnswer = result.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnanswered = userAnswer === -1;
            
            return (
              <View key={question.id} style={styles.questionReview}>
                <View style={styles.questionReviewHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <View
                    style={[
                      styles.answerBadge,
                      isUnanswered && styles.answerBadgeUnanswered,
                      !isUnanswered && (isCorrect ? styles.answerBadgeCorrect : styles.answerBadgeIncorrect),
                    ]}
                  >
                    <Text style={[
                      styles.answerBadgeText,
                      isUnanswered && styles.answerBadgeTextUnanswered,
                      !isUnanswered && (isCorrect ? styles.answerBadgeTextCorrect : styles.answerBadgeTextIncorrect),
                    ]}>
                      {isUnanswered ? 'Skipped' : (isCorrect ? 'Correct' : 'Incorrect')}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.reviewQuestionText}>{question.question}</Text>
                
                <View style={styles.reviewAnswerSection}>
                  <Text style={styles.reviewAnswerLabel}>Your Answer:</Text>
                  <Text style={[
                    styles.reviewAnswerText,
                    isCorrect ? styles.reviewAnswerTextCorrect : styles.reviewAnswerTextIncorrect,
                  ]}>
                    {isUnanswered ? 'Not answered' : question.options[userAnswer]}
                  </Text>
                </View>
                
                {!isCorrect && !isUnanswered && (
                  <View style={styles.reviewCorrectAnswerSection}>
                    <Text style={styles.reviewCorrectAnswerLabel}>Correct Answer:</Text>
                    <Text style={styles.reviewCorrectAnswerText}>
                      {question.options[question.correctAnswer]}
                    </Text>
                  </View>
                )}
                
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>💡 Explanation:</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
                
                {question.relatedConcept && (
                  <Text style={styles.relatedConcept}>📚 Related: {question.relatedConcept}</Text>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Suggestions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 Suggestions for Further Learning</Text>
          
          {result.score < 70 ? (
            <View style={styles.suggestion}>
              <Text style={styles.suggestionText}>
                • Review the concepts where you got incorrect answers
              </Text>
              <Text style={styles.suggestionText}>
                • Try the quick test again after studying
              </Text>
              <Text style={styles.suggestionText}>
                • Focus on {result.scoreBreakdown.medium.correct < result.scoreBreakdown.medium.total ? 'medium' : 'hard'} difficulty questions
              </Text>
            </View>
          ) : result.score < 90 ? (
            <View style={styles.suggestion}>
              <Text style={styles.suggestionText}>
                • Great progress! Try tackling harder questions
              </Text>
              <Text style={styles.suggestionText}>
                • Review the explanations for better understanding
              </Text>
              <Text style={styles.suggestionText}>
                • Practice more to improve your speed
              </Text>
            </View>
          ) : (
            <View style={styles.suggestion}>
              <Text style={styles.suggestionText}>
                • Excellent! You've mastered this topic
              </Text>
              <Text style={styles.suggestionText}>
                • Try a chapter test to test comprehensive knowledge
              </Text>
              <Text style={styles.suggestionText}>
                • Help others by explaining concepts to them
              </Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleReviewAnswers}>
            <Text style={styles.actionButtonText}>Review Lessons</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.primaryActionButton]} onPress={handleRetakeTest}>
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
              Retake Test
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.MD,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CORAL_ERROR,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  headerTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.LG,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.XL,
    marginBottom: SPACING.LG,
    alignItems: 'center',
    borderWidth: 3,
    ...SHADOWS.MEDIUM,
  },
  scoreBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  scoreValue: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
  },
  performanceMessage: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  scoreDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  scoreDetailItem: {
    alignItems: 'center',
  },
  scoreDetailLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  scoreDetailValue: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.CHARCOAL_TEXT,
  },
  scoreDetailDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.SAGE_PRIMARY + '30',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  breakdownValue: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  breakdownBar: {
    width: '80%',
    height: 8,
    backgroundColor: COLORS.SAGE_PRIMARY + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionReview: {
    marginBottom: SPACING.LG,
    paddingBottom: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  questionReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  questionNumber: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
  },
  answerBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.SMALL,
  },
  answerBadgeCorrect: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
  },
  answerBadgeIncorrect: {
    backgroundColor: COLORS.CORAL_ERROR + '20',
  },
  answerBadgeUnanswered: {
    backgroundColor: COLORS.CHARCOAL_TEXT + '20',
  },
  answerBadgeText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '600',
  },
  answerBadgeTextCorrect: {
    color: COLORS.SAGE_PRIMARY,
  },
  answerBadgeTextIncorrect: {
    color: COLORS.CORAL_ERROR,
  },
  answerBadgeTextUnanswered: {
    color: COLORS.CHARCOAL_TEXT,
  },
  reviewQuestionText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  reviewAnswerSection: {
    marginBottom: SPACING.SM,
  },
  reviewAnswerLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  reviewAnswerText: {
    ...TYPOGRAPHY.BODY,
    marginTop: SPACING.XS,
  },
  reviewAnswerTextCorrect: {
    color: COLORS.SAGE_PRIMARY,
  },
  reviewAnswerTextIncorrect: {
    color: COLORS.CORAL_ERROR,
  },
  reviewCorrectAnswerSection: {
    marginBottom: SPACING.SM,
  },
  reviewCorrectAnswerLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  reviewCorrectAnswerText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    marginTop: SPACING.XS,
  },
  explanationBox: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.SM,
    marginTop: SPACING.SM,
  },
  explanationLabel: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  explanationText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 20,
  },
  relatedConcept: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.FOREST_ACCENT,
    fontStyle: 'italic',
    marginTop: SPACING.SM,
  },
  suggestion: {
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
  },
  suggestionText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  primaryActionButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  actionButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  primaryActionButtonText: {
    color: '#fff',
  },
  bottomSpacing: {
    height: SPACING.XL,
  },
});
