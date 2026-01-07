import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useHomeworkStore } from '@/store/homeworkStore';
import { useCreditsStore } from '@/store/creditsStore';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'History', 'Geography'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function HomeworkAssistant({ onGenerated }: { onGenerated?: (id: string) => void }) {
  const { generateHomework, isGenerating } = useHomeworkStore();
  const { credits, deductCredit } = useCreditsStore();
  
  const [topic, setTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [problemCount, setProblemCount] = useState(3);
  const [classLevel, setClassLevel] = useState('Class 10');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please describe your homework topic');
      return;
    }

    if (credits < 2) {
      setError('Insufficient credits. You need 2 credits to generate homework.');
      return;
    }

    setError('');
    
    // Deduct credits first
    const success = await deductCredit(2);
    if (!success) {
      setError('Failed to deduct credits. Please try again.');
      return;
    }

    const homeworkId = await generateHomework(
      selectedSubject,
      topic,
      selectedDifficulty,
      problemCount,
      classLevel
    );

    if (homeworkId) {
      onGenerated?.(homeworkId);
    } else {
      setError('Failed to generate homework. Please try again later.');
      // Refund credits if generation failed? Not implemented in basic flow but good practice
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>AI Homework Assistant</Text>
      <Text style={styles.subtitle}>Get personalized homework problems with detailed solutions</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Describe Topic / Assignment</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. Laws of Motion, Quadratic Equations, photosynthesis..."
          value={topic}
          onChangeText={setTopic}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.SM }]}>
          <Text style={styles.label}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {SUBJECTS.map(s => (
              <Pressable
                key={s}
                style={[styles.pill, selectedSubject === s && styles.pillActive]}
                onPress={() => setSelectedSubject(s)}
              >
                <Text style={[styles.pillText, selectedSubject === s && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.SM }]}>
          <Text style={styles.label}>Class Level</Text>
          <TextInput
            style={styles.input}
            value={classLevel}
            onChangeText={setClassLevel}
            placeholder="Class 10"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map(d => (
              <Pressable
                key={d}
                style={[styles.difficultyBtn, selectedDifficulty === d && styles.difficultyBtnActive]}
                onPress={() => setSelectedDifficulty(d)}
              >
                <Text style={[styles.difficultyText, selectedDifficulty === d && styles.difficultyTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Number of Problems: {problemCount}</Text>
        <View style={styles.problemCountRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <Pressable
              key={n}
              style={[styles.countBtn, problemCount === n && styles.countBtnActive]}
              onPress={() => setProblemCount(n)}
            >
              <Text style={[styles.countText, problemCount === n && styles.countTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.generateBtnText}>Crafting your homework...</Text>
          </View>
        ) : (
          <View style={styles.btnContent}>
            <Text style={styles.generateBtnText}>Generate Homework</Text>
            <View style={styles.costBadge}>
              <Text style={styles.costText}>2 Credits</Text>
            </View>
          </View>
        )}
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 AI will generate high-quality problems with step-by-step solutions that look like a human tutor wrote them.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.MD,
  },
  title: {
    ...TYPOGRAPHY.PAGE_TITLE,
    fontSize: 24,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.LG,
  },
  formGroup: {
    marginBottom: SPACING.MD,
  },
  label: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
    color: COLORS.CHARCOAL_TEXT,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
    ...TYPOGRAPHY.BODY,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
    ...TYPOGRAPHY.BODY,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  pillScroll: {
    marginTop: SPACING.XS,
  },
  pill: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.BUTTON,
    backgroundColor: '#fff',
    marginRight: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '20',
  },
  pillActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  pillText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  difficultyRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
  },
  difficultyBtn: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
  },
  difficultyBtnActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  difficultyText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  difficultyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  problemCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
  },
  countBtnActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  countText: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
    color: COLORS.CHARCOAL_TEXT,
  },
  countTextActive: {
    color: '#fff',
  },
  errorText: {
    color: COLORS.RED_ERROR,
    ...TYPOGRAPHY.METADATA,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  generateBtn: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.MEDIUM,
    marginTop: SPACING.MD,
  },
  generateBtnDisabled: {
    backgroundColor: COLORS.SAGE_PRIMARY + '80',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
    marginRight: SPACING.MD,
  },
  costBadge: {
    backgroundColor: COLORS.GOLD_STREAK,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
  },
  costText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.FOREST_ACCENT,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBox: {
    marginTop: SPACING.XL,
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '30',
  },
  infoText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    fontStyle: 'italic',
  },
});
