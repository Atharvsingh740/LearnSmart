import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { Formula } from '@/store/formulaStore';
import DerivationSteps from './DerivationSteps';

interface FormulaCardProps {
  formula: Formula;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function FormulaCard({ formula, onShare, onBookmark, isBookmarked }: FormulaCardProps) {
  const [showDerivation, setShowDerivation] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.formulaName}>{formula.formulaName}</Text>
          <Text style={styles.metadata}>{formula.subject} • {formula.chapter}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onBookmark} style={styles.actionButton}>
            <Text style={styles.actionIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
          </Pressable>
          <Pressable onPress={onShare} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔗</Text>
          </Pressable>
        </View>
      </View>

      {/* Formula Box */}
      <View style={styles.formulaBox}>
        <Text style={styles.formulaText}>{formula.formula}</Text>
      </View>

      {/* Uses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎯</Text>
          <Text style={styles.sectionTitle}>Uses</Text>
        </View>
        <Text style={styles.sectionContent}>{formula.uses}</Text>
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📏</Text>
          <Text style={styles.sectionTitle}>Variables & Units</Text>
        </View>
        {formula.variables.map((v, index) => (
          <View key={index} style={styles.variableRow}>
            <Text style={styles.variableSymbol}>{v.symbol}</Text>
            <Text style={styles.variableInfo}>{v.name} ({v.unit})</Text>
          </View>
        ))}
      </View>

      {/* Examples */}
      {formula.examples && formula.examples.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💡</Text>
            <Text style={styles.sectionTitle}>Example</Text>
          </View>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleProblem}>{formula.examples[0].problem}</Text>
            <View style={styles.givenContainer}>
               <Text style={styles.givenTitle}>Given:</Text>
               {formula.examples[0].given.map((g, i) => (
                 <Text key={i} style={styles.givenItem}>• {g}</Text>
               ))}
            </View>
            <Text style={styles.solutionTitle}>Solution:</Text>
            <Text style={styles.exampleSolution}>{formula.examples[0].solution}</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>Answer: {formula.examples[0].answer}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Expand Button for Derivation */}
      {formula.hasDerivation && (
        <Pressable
          style={styles.expandButton}
          onPress={() => setShowDerivation(!showDerivation)}
        >
          <Text style={styles.expandButtonText}>
            {showDerivation ? 'Hide Derivation' : 'Show Derivation'}
          </Text>
          <Text style={styles.expandButtonIcon}>{showDerivation ? '▲' : '▼'}</Text>
        </Pressable>
      )}

      {showDerivation && formula.derivation && (
        <DerivationSteps steps={formula.derivation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  formulaName: {
    ...TYPOGRAPHY.FORMULA_TITLE,
    color: COLORS.CHARCOAL_TEXT,
  },
  metadata: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: SPACING.SM,
    padding: SPACING.XS,
  },
  actionIcon: {
    fontSize: 20,
  },
  formulaBox: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
  },
  formulaText: {
    ...TYPOGRAPHY.FORMULA_TITLE,
    fontSize: 36,
    color: COLORS.FOREST_ACCENT,
    textAlign: 'center',
  },
  section: {
    marginTop: SPACING.MD,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: SPACING.XS,
  },
  sectionTitle: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: COLORS.FOREST_ACCENT,
  },
  sectionContent: {
    ...TYPOGRAPHY.FORMULA_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  variableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
    paddingLeft: SPACING.MD,
  },
  variableSymbol: {
    ...TYPOGRAPHY.DERIVATION_STEP,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
    width: 30,
  },
  variableInfo: {
    ...TYPOGRAPHY.FORMULA_BODY,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
  },
  exampleBox: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginTop: SPACING.XS,
  },
  exampleProblem: {
    ...TYPOGRAPHY.FORMULA_BODY,
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
  },
  givenContainer: {
    marginBottom: SPACING.SM,
  },
  givenTitle: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
  },
  givenItem: {
    ...TYPOGRAPHY.METADATA,
    marginLeft: SPACING.SM,
  },
  solutionTitle: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
  },
  exampleSolution: {
    ...TYPOGRAPHY.METADATA,
    marginBottom: SPACING.SM,
  },
  answerBox: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    padding: SPACING.XS,
    borderRadius: RADIUS.SMALL,
    alignSelf: 'flex-start',
  },
  answerText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    fontWeight: 'bold',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.SM,
    marginTop: SPACING.LG,
  },
  expandButtonText: {
    ...TYPOGRAPHY.BODY,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: SPACING.SM,
  },
  expandButtonIcon: {
    color: '#fff',
    fontSize: 12,
  },
});
