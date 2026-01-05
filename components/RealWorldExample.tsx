import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';
import LazyImage from './LazyImage';

interface Example {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface RealWorldExampleProps {
  examples: Example[];
}

export default function RealWorldExample({ examples }: RealWorldExampleProps) {
  if (!examples || examples.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💡</Text>
        <Text style={styles.headerText}>Real-World Examples</Text>
      </View>

      {examples.map((example, idx) => (
        <View key={idx} style={styles.exampleCard}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleIcon}>{example.icon}</Text>
            <Text style={styles.exampleTitle}>{example.title}</Text>
          </View>

          {example.image && (
            <View style={styles.imageContainer}>
              <LazyImage
                source={{ uri: example.image }}
                style={styles.image}
                cacheKey={`example_${idx}`}
              />
            </View>
          )}

          <Text style={styles.exampleDescription}>{example.description}</Text>
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
    color: COLORS.SAGE_PRIMARY,
  },
  exampleCard: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  exampleIcon: {
    fontSize: 20,
    marginRight: SPACING.SM,
  },
  exampleTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 16,
    color: COLORS.FOREST_ACCENT,
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    borderRadius: RADIUS.SMALL,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  exampleDescription: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
});
