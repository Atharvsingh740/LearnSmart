import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';

interface Misconception {
  wrong: string;
  correct: string;
  explanation: string;
}

interface MisconceptionCardProps {
  misconceptions: Misconception[];
}

export default function MisconceptionCard({
  misconceptions,
}: MisconceptionCardProps) {
  if (!misconceptions || misconceptions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <Text style={styles.headerText}>Common Misconceptions</Text>
      </View>

      {misconceptions.map((misconception, idx) => (
        <View key={idx} style={styles.misconceptionCard}>
          <View style={styles.wrongSection}>
            <Text style={styles.label}>❌ Misconception</Text>
            <Text style={styles.wrongText}>{misconception.wrong}</Text>
          </View>

          <View style={styles.correctSection}>
            <Text style={styles.label}>✅ Correct Understanding</Text>
            <Text style={styles.correctText}>{misconception.correct}</Text>
          </View>

          <View style={styles.explanationSection}>
            <Text style={styles.explanationLabel}>Why?</Text>
            <Text style={styles.explanationText}>
              {misconception.explanation}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginVertical: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: SPACING.SM,
  },
  headerText: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: COLORS.CORAL_ERROR,
  },
  misconceptionCard: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  wrongSection: {
    backgroundColor: COLORS.CORAL_ERROR + '15',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.CORAL_ERROR,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    marginBottom: SPACING.SM,
  },
  correctSection: {
    backgroundColor: COLORS.SAGE_PRIMARY + '15',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.SAGE_PRIMARY,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    marginBottom: SPACING.SM,
  },
  explanationSection: {
    padding: SPACING.SM,
  },
  label: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  wrongText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  correctText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  explanationLabel: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  explanationText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontStyle: 'italic',
  },
});
