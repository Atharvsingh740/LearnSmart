import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useFormulaStore } from '@/store/formulaStore';
import FormulaCard from '@/components/FormulaCard';

export default function FormulaDetailScreen() {
  const { formulaId } = useLocalSearchParams();
  const router = useRouter();
  const { getFormula, toggleFavorite, isFavorite, formulas } = useFormulaStore();

  const formula = getFormula(formulaId as string);

  if (!formula) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Formula not found</Text>
      </View>
    );
  }

  const relatedFormulas = formula.relatedFormulas
    ? formula.relatedFormulas.map(id => formulas.find(f => f.id === id)).filter(Boolean)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{formula.formulaName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FormulaCard
          formula={formula}
          isBookmarked={isFavorite(formula.id)}
          onBookmark={() => toggleFavorite(formula.id)}
          onShare={() => {
            // Mock share action
            console.log('Share formula:', formula.formulaName);
          }}
        />

        {relatedFormulas.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Formulas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
              {relatedFormulas.map((f: any) => (
                <Pressable
                  key={f.id}
                  style={styles.relatedCard}
                  onPress={() => router.push(`/formulas/${f.id}`)}
                >
                  <Text style={styles.relatedCardName}>{f.formulaName}</Text>
                  <Text style={styles.relatedCardFormula}>{f.formula}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  backButton: {
    padding: SPACING.SM,
    marginRight: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
  },
  title: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.RED_ERROR,
    textAlign: 'center',
    marginTop: SPACING.XXL,
  },
  relatedSection: {
    marginTop: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  relatedTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.MD,
  },
  relatedScroll: {
    flexDirection: 'row',
  },
  relatedCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginRight: SPACING.MD,
    width: 160,
    ...SHADOWS.LIGHT,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '20',
  },
  relatedCardName: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  relatedCardFormula: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.SAGE_PRIMARY,
    fontFamily: 'monospace',
  },
});
