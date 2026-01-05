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
import { useTestStore, Question } from '@/store/testStore';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useUserStore } from '@/store/userStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';

export default function QuickTestScreen() {
  const { chapterId } = useLocalSearchParams();
  const router = useRouter();
  const { startTest, answerQuestion, goToNextQuestion, goToPreviousQuestion, getCurrentQuestion, submitTest, cancelTest, generateQuickTestQuestions, currentSession } = useTestStore();
  const { getChapter, getTopic } = useCurriculumStore();
  const { class: userClass } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const chapter = getChapter(chapterId as string);

  // Get current topic (first topic for quick test)
  const topic = chapter && chapter.topics.length > 0 ? chapter.topics[0] : null;

  useEffect(() => {
    if (chapterId && topic) {
      // Generate questions and start test
      const classId = userClass || '6';
      
      const questions = generateQuickTestQuestions(
        topic.id,
        classId,
        topic.id, // Using topic id as subject for simplicity
        chapterId as string
      );
      
      if (questions.length > 0) {
        startTest({
          testType: 'quick',
          classId,
          subjectId: topic.id,
          chapterId: chapterId as string,
          topicId: topic.id,
          questions,
        });
      }
      setLoading(false);
    }
  }, [chapterId, topic]);
  
  useEffect(() => {
    if (currentSession) {
      setSelectedAnswer(currentSession.userAnswers[currentSession.currentQuestionIndex] ?? null);
    }
  }, [currentSession?.currentQuestionIndex, currentSession?.userAnswers]);
  
  const currentQuestion = getCurrentQuestion();
  
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    answerQuestion(answerIndex);
  };
  
  const handleNext = () => {
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      goToNextQuestion();
    } else {
      // Submit test
      const result = submitTest();
      if (result) {
        router.push(`/test/result?testId=${result.testId}`);
      }
    }
  };
  
  const handlePrevious = () => {
    goToPreviousQuestion();
  };
  
  const handleCancel = () => {
    cancelTest();
    router.back();
  };
  
  const progress = currentSession
    ? ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100
    : 0;
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.SAGE_PRIMARY} />
        <Text style={styles.loadingText}>Generating questions...</Text>
      </View>
    );
  }
  
  if (!currentQuestion || !currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load test</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Quick Test</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentSession.currentQuestionIndex + 1} / {currentSession.questions.length}
        </Text>
      </View>
      
      {/* Question */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{currentQuestion.difficulty}</Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.relatedConcept && (
            <Text style={styles.relatedConcept}>📚 {currentQuestion.relatedConcept}</Text>
          )}
        </View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            return (
              <Pressable
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <View style={styles.optionIndicator}>
                  <Text style={[
                    styles.optionIndex,
                    isSelected && styles.optionIndexSelected
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <Pressable
          style={[
            styles.navButton,
            currentSession.currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentSession.currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentSession.currentQuestionIndex < currentSession.questions.length - 1 ? 'Next' : 'Submit'}
          </Text>
        </Pressable>
      </View>
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
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  headerTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  headerSpacer: {
    width: 50,
  },
  progressContainer: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.SAGE_PRIMARY + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.LG,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.SMALL,
    marginBottom: SPACING.MD,
  },
  difficultyText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  questionText: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  relatedConcept: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.FOREST_ACCENT,
    fontStyle: 'italic',
  },
  optionsContainer: {
    paddingBottom: SPACING.LG,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.LIGHT,
  },
  optionButtonSelected: {
    borderColor: COLORS.SAGE_PRIMARY,
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.SAND_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  optionIndex: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
  },
  optionIndexSelected: {
    color: COLORS.SAGE_PRIMARY,
  },
  optionText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '20',
  },
  navButton: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  navButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
});
