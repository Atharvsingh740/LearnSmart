import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';

interface RelatedConceptsLinksProps {
  relatedConcepts: Array<{
    id: string;
    title: string;
    icon: string;
  }>;
  onConceptPress: (conceptId: string) => void;
}

export default function RelatedConceptsLinks({
  relatedConcepts,
  onConceptPress,
}: RelatedConceptsLinksProps) {
  if (!relatedConcepts || relatedConcepts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔗 Related Concepts</Text>
      <View style={styles.conceptsContainer}>
        {relatedConcepts.map((concept) => (
          <Pressable
            key={concept.id}
            style={styles.conceptChip}
            onPress={() => onConceptPress(concept.id)}
          >
            <Text style={styles.conceptIcon}>{concept.icon}</Text>
            <Text style={styles.conceptTitle}>{concept.title}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.MD,
  },
  header: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  conceptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conceptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.SMALL,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    ...SHADOWS.LIGHT,
  },
  conceptIcon: {
    fontSize: 16,
    marginRight: SPACING.XS,
  },
  conceptTitle: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  arrow: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    marginLeft: SPACING.XS,
  },
});
