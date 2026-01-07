import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/theme';
import { DerivationStep } from '@/store/formulaStore';

interface DerivationStepsProps {
  steps: DerivationStep[];
}

export default function DerivationSteps({ steps }: DerivationStepsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Derivation</Text>
      {steps.map((step, index) => (
        <Animated.View
          key={index}
          entering={FadeInLeft.delay(index * 300).duration(500)}
          style={styles.stepContainer}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </View>
          <Text style={styles.stepContent}>{step.content}</Text>
          {step.mathExpression && (
            <View style={styles.mathBox}>
              <Text style={styles.mathText}>{step.mathExpression}</Text>
            </View>
          )}
          <Text style={styles.stepExplanation}>{step.explanation}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.LG,
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '20',
  },
  title: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.MD,
  },
  stepContainer: {
    marginBottom: SPACING.LG,
    paddingLeft: SPACING.SM,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.SAGE_PRIMARY + '40',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  stepNumber: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTitle: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: COLORS.FOREST_ACCENT,
  },
  stepContent: {
    ...TYPOGRAPHY.DERIVATION_STEP,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  mathBox: {
    backgroundColor: '#f0f0f0',
    padding: SPACING.MD,
    borderRadius: RADIUS.SMALL,
    marginVertical: SPACING.SM,
    alignItems: 'center',
  },
  mathText: {
    ...TYPOGRAPHY.DERIVATION_STEP,
    fontFamily: 'monospace',
    fontSize: 16,
    color: COLORS.FOREST_ACCENT,
  },
  stepExplanation: {
    ...TYPOGRAPHY.METADATA,
    fontStyle: 'italic',
  },
});
