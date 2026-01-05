import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';
import DiagramViewer from './DiagramViewer';
import RealWorldExample from './RealWorldExample';
import MisconceptionCard from './MisconceptionCard';
import RelatedConceptsLinks from './RelatedConceptsLinks';
import ExpandableLearnMore from './ExpandableLearnMore';

interface ConceptCardProps {
  concept: {
    id: string;
    title: string;
    content: string;
    bullets: string[];
    keyTakeaway: string;
    diagram?: any;
    realWorldExamples?: Array<{
      title: string;
      description: string;
      icon: string;
      image?: string;
    }>;
    misconceptions?: Array<{
      wrong: string;
      correct: string;
      explanation: string;
    }>;
    deepDive?: {
      title: string;
      content: string;
      details?: string[];
      resources?: string[];
    };
    relatedConcepts?: Array<{
      id: string;
      title: string;
      icon: string;
    }>;
  };
  onRelatedConceptPress?: (conceptId: string) => void;
  animated?: boolean;
}

export default function ConceptCard({
  concept,
  onRelatedConceptPress,
  animated = true,
}: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View
      style={styles.container}
      entering={animated ? FadeInDown.duration(400) : undefined}
    >
      {/* Title */}
      <Text style={styles.title}>{concept.title}</Text>

      {/* Content Body */}
      <Text style={styles.body}>{concept.content}</Text>

      {/* Bullet Points with staggered animation */}
      {concept.bullets && concept.bullets.length > 0 && (
        <View style={styles.bulletsContainer}>
          {concept.bullets.map((bullet, idx) => (
            <Animated.View
              key={idx}
              style={styles.bulletPoint}
              entering={animated ? FadeInRight.delay(idx * 100) : undefined}
            >
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Diagram */}
      {concept.diagram && (
        <DiagramViewer
          diagram={concept.diagram}
          animated={animated}
          zoom={true}
        />
      )}

      {/* Key Takeaway Box with slide-in animation */}
      <Animated.View
        style={styles.keyTakeawayBox}
        entering={
          animated
            ? FadeInDown.delay(concept.bullets?.length * 100 || 200)
            : undefined
        }
      >
        <View style={styles.keyTakeawayHeader}>
          <Text style={styles.keyTakeawayLabel}>🎯 Key Takeaway</Text>
        </View>
        <Text style={styles.keyTakeawayText}>{concept.keyTakeaway}</Text>
      </Animated.View>

      {/* Real-World Examples */}
      {concept.realWorldExamples && concept.realWorldExamples.length > 0 && (
        <RealWorldExample examples={concept.realWorldExamples} />
      )}

      {/* Common Misconceptions */}
      {concept.misconceptions && concept.misconceptions.length > 0 && (
        <MisconceptionCard misconceptions={concept.misconceptions} />
      )}

      {/* Deep Dive / Learn More */}
      {concept.deepDive && (
        <ExpandableLearnMore
          title={concept.deepDive.title}
          content={concept.deepDive.content}
          details={concept.deepDive.details}
          resources={concept.deepDive.resources}
        />
      )}

      {/* Related Concepts */}
      {concept.relatedConcepts &&
        concept.relatedConcepts.length > 0 &&
        onRelatedConceptPress && (
          <RelatedConceptsLinks
            relatedConcepts={concept.relatedConcepts}
            onConceptPress={onRelatedConceptPress}
          />
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  title: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  body: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  bulletsContainer: {
    marginBottom: SPACING.MD,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
    alignItems: 'flex-start',
  },
  bullet: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.FOREST_ACCENT,
    marginRight: SPACING.SM,
    fontWeight: 'bold',
  },
  bulletText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
  },
  keyTakeawayBox: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginTop: SPACING.MD,
  },
  keyTakeawayHeader: {
    marginBottom: SPACING.SM,
  },
  keyTakeawayLabel: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: '#fff',
  },
  keyTakeawayText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: '#fff',
    fontWeight: '500',
  },
});
