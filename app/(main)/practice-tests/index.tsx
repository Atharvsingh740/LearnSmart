import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePracticeTestStore } from '../../../store/practiceTestStore';
import { useUserStore } from '../../../store/userStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';
import PracticeTestCard from '../../../components/PracticeTestCard';

export default function PracticeTestsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState([]);
  const [mockConfig, setMockConfig] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  
  const { 
    getPracticeTests, 
    generateMockExam,
    getPracticeTestHistory 
  } = usePracticeTestStore();
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';

  const loadTests = async () => {
    try {
      const loadedTests = await getPracticeTests({ subject: selectedSubject, difficulty: selectedDifficulty });
      setTests(loadedTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  useEffect(() => {
    loadTests();
  }, [selectedSubject, selectedDifficulty]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  const handleGenerateMock = async () => {
    const chapters = ['Motion', 'Forces', 'Energy'];
    const mockExam = await generateMockExam(selectedSubject, chapters, selectedDifficulty, 20);
    navigation.navigate('practice-tests/generate-mock', { testConfig: mockExam });
  };

  const startTest = async (test) => {
    const session = await startTest(test.id, userId);
    navigation.navigate('practice-tests/take-test', { sessionId: session.id });
  };

  return (
    <SafeAreaView style={styles.container">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice Tests & Mock Exams</Text>
          <Text style={styles.subtitle}>Sharpen your skills with practice</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.SAGE_PRIMARY }]}
            onPress={handleGenerateMock}
          >
            <Text style={styles.actionEmoji}>✨</Text>
            <Text style={styles.actionText}>Create Mock Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.FOREST_ACCENT }]}
            onPress={() => navigation.navigate('practice-tests/result')}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>View History</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter Tests</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={[styles.filterChip, selectedSubject === 'Physics' && styles.activeFilter]}
              onPress={() => setSelectedSubject('Physics')}
            >
              <Text style={[styles.filterText, selectedSubject === 'Physics' && styles.activeFilterText]}>
                Physics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedSubject === 'Chemistry' && styles.activeFilter]}
              onPress={() => setSelectedSubject('Chemistry')}
            >
              <Text style={[styles.filterText, selectedSubject === 'Chemistry' && styles.activeFilterText]}>
                Chemistry
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedSubject === 'Mathematics' && styles.activeFilter]}
              onPress={() => setSelectedSubject('Mathematics')}
            >
              <Text style={[styles.filterText, selectedSubject === 'Mathematics' && styles.activeFilterText]}>
                Math
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.difficultyRow}>
            <Text style={styles.difficultyLabel}>Difficulty:</Text>
            {['easy', 'medium', 'hard'].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[styles.difficultyChip, selectedDifficulty === difficulty && styles.activeDifficulty]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[styles.difficultyText, selectedDifficulty === difficulty && styles.activeDifficultyText]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tests List */}
        <View style={styles.testsSection}>
          <Text style={styles.testsTitle}>Available Tests ({tests.length})</Text>
          
          {tests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {selectedDifficulty} tests found for {selectedSubject}</Text>
              <Text style={styles.emptySubtext}>Try changing your filters or create a mock exam</Text>
            </View>
          ) : (
            tests.map((test) => (
              <PracticeTestCard
                key={test.id}
                test={test}
                userId={userId}
                onPress={() => startTest(test)}
                showStats={true}
              />
            ))
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  actionButton: {
    flex: 1,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    marginHorizontal: SPACING.XS,
    ...SHADOWS.LIGHT,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: SPACING.XS,
  },
  actionText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  filterTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    marginBottom: SPACING.MD,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
    gap: SPACING.XS,
  },
  filterChip: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
  },
  activeFilter: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  filterText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  activeFilterText: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  difficultyLabel: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  difficultyChip: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
  },
  activeDifficulty: {
    backgroundColor: COLORS.FOREST_ACCENT,
  },
  difficultyText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  activeDifficultyText: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  testsSection: {
    paddingHorizontal: SPACING.MD,
  },
  testsTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    marginBottom: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XXL,
  },
  emptyText: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default PracticeTestsScreen;