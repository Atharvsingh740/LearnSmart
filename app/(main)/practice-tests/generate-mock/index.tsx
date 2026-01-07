import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePracticeTestStore } from '../../../../store/practiceTestStore';
import { useUserStore } from '../../../../store/userStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../../theme';
import { TYPOGRAPHY } from '../../../../theme/typography';

interface GenerateMockScreenProps {
  navigation: any;
  route: any;
}

export default function GenerateMockScreen({ navigation, route }: GenerateMockScreenProps) {
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateMockExam } = usePracticeTestStore();
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  
  const chapters = [
    'Motion in a Straight Line',
    'Force and Laws of Motion',
    'Work, Energy and Power',
    'System of Particles and Rotational Motion',
    'Gravitation',
    'Properties of Bulk Matter',
    'Thermodynamics',
    'Kinetic Theory',
    'Oscillations and Waves'
  ];

  const toggleChapter = (chapter: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleGenerateMock = async () => {
    if (selectedChapters.length === 0) {
      Alert.alert('No Chapters Selected', 'Please select at least one chapter to generate a mock exam.');
      return;
    }

    setIsGenerating(true);
    try {
      const mockExam = await generateMockExam(
        'Physics',
        selectedChapters,
        difficulty,
        questionCount
      );
      
      Alert.alert(
        'Mock Exam Generated!',
        `Your custom mock exam on ${selectedChapters.join(', ')} has been created with ${questionCount} questions.`,
        [
          {
            text: 'Take Test Now',
            onPress: () => navigation.navigate('practice-tests/take-test', { testId: mockExam.id })
          },
          {
            text: 'View Details',
            onPress: () => navigation.navigate('practice-tests', { test: mockExam })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Generation Failed', 'Unable to generate mock exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Generate Mock Exam</Text>
          <Text style={styles.subtitle}>Create a custom test based on your needs</Text>
        </View>

        {/* Chapter Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Chapters</Text>
          <Text style={styles.sectionSubtitle}>
            Choose {selectedChapters.length > 0 ? `(${selectedChapters.length} selected)` : ''}
          </Text>
          
          <View style={styles.chaptersGrid}>
            {chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter}
                style={[
                  styles.chapterChip,
                  selectedChapters.includes(chapter) && styles.selectedChapter
                ]}
                onPress={() => toggleChapter(chapter)}
              >
                <Text style={[
                  styles.chapterText,
                  selectedChapters.includes(chapter) && styles.selectedChapterText
                ]}>
                  {chapter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyOption,
                  difficulty === level && styles.selectedDifficulty
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[
                  styles.difficultyEmoji,
                  difficulty === level && styles.selectedDifficultyEmoji
                ]}>
                  {level === 'easy' ? '' : level === 'medium' ? '' : ''}
                </Text>
                <Text style={[
                  styles.difficultyLabel,
                  difficulty === level && styles.selectedDifficultyLabel
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Question Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.questionCountRow}>
              <Text style={styles.questionCountLabel}>10</Text>
              <Text style={styles.questionCountLabel}>{questionCount}</Text>
              <Text style={styles.questionCountLabel}>100</Text>
            </View>
            
            <View style={styles.sliderDots}>
              {Array.from({ length: 10 }).map((_, index) => {
                const value = (index + 1) * 10;
                const isActive = questionCount >= value;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sliderDot,
                      isActive && styles.sliderDotActive
                    ]}
                    onPress={() => setQuestionCount(value)}
                  >
                    {isActive && <View style={styles.sliderDotFill} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <Text style={styles.questionCountDisplay}>{questionCount} questions</Text>
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateMock}
            disabled={isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Mock Exam'}
            </Text>
            <Text style={styles.generateButtonEmoji}>
              {isGenerating ? '' : '✨'}
            </Text>
          </TouchableOpacity>
          
          {isGenerating && (
            <Text style={styles.generatingText}>Creating your custom test...</Text>
          )}
        </View>
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
    margin: SPACING.MD,
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
  section: {
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
    padding: SPACING.MD,
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    marginBottom: SPACING.XS,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: SPACING.MD,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  chapterChip: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    marginBottom: SPACING.XS,
  },
  selectedChapter: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  chapterText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  selectedChapterText: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.MD,
  },
  difficultyOption: {
    flex: 1,
    padding: SPACING.MD,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDifficulty: {
    borderColor: COLORS.SAGE_PRIMARY,
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
  },
  difficultyEmoji: {
    fontSize: 24,
    marginBottom: SPACING.XS,
  },
  difficultyLabel: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '500',
  },
  selectedDifficultyEmoji: {
    color: COLORS.SAND_BG,
  },
  selectedDifficultyLabel: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  sliderContainer: {
    paddingHorizontal: SPACING.SM,
  },
  questionCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  questionCountLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  sliderDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  sliderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.SAND_BG,
    borderWidth: 2,
    borderColor: COLORS.FOREST_ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDotActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  sliderDotFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.SAND_BG,
  },
  questionCountDisplay: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.FOREST_ACCENT,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  generateSection: {
    paddingHorizontal: SPACING.MD,
    marginTop: SPACING.XXL,
  },
  generateButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...SHADOWS.MEDIUM,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
  generateButtonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
    marginRight: SPACING.SM,
  },
  generateButtonEmoji: {
    fontSize: 20,
  },
  generatingText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    marginTop: SPACING.MD,
  },
});

export default GenerateMockScreen;