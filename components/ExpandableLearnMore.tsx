import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';

interface ExpandableLearnMoreProps {
  title: string;
  content: string;
  details?: string[];
  examples?: Array<{
    title: string;
    description: string;
  }>;
  resources?: string[];
}

export default function ExpandableLearnMore({
  title,
  content,
  details = [],
  examples = [],
  resources = [],
}: ExpandableLearnMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);
  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    height.value = withTiming(expanded ? 0 : 1, { duration: 300 });
    rotation.value = withSpring(expanded ? 0 : 180, {
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: height.value === 0 ? 0 : 2000,
    opacity: height.value,
    overflow: 'hidden',
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggleExpand}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>📚</Text>
          <Text style={styles.headerText}>{title}</Text>
        </View>
        <Animated.Text style={[styles.arrow, arrowStyle]}>↓</Animated.Text>
      </Pressable>

      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.contentText}>{content}</Text>

        {details.length > 0 && (
          <View style={styles.detailsContainer}>
            {details.map((detail, idx) => (
              <View key={idx} style={styles.detailItem}>
                <Text style={styles.detailBullet}>•</Text>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}

        {examples.length > 0 && (
          <View style={styles.examplesContainer}>
            <Text style={styles.sectionTitle}>💡 Examples in Real Life</Text>
            {examples.map((example, idx) => (
              <View key={idx} style={styles.exampleCard}>
                <Text style={styles.exampleTitle}>{example.title}</Text>
                <Text style={styles.exampleDescription}>
                  {example.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {resources.length > 0 && (
          <View style={styles.resourcesContainer}>
            <Text style={styles.sectionTitle}>📖 Related Resources</Text>
            {resources.map((resource, idx) => (
              <Text key={idx} style={styles.resourceItem}>
                • {resource}
              </Text>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    marginVertical: SPACING.SM,
    overflow: 'hidden',
    ...SHADOWS.LIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.SAND_BG,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: SPACING.SM,
  },
  headerText: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    flex: 1,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.SAGE_PRIMARY,
  },
  content: {
    padding: SPACING.MD,
  },
  contentText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  detailsContainer: {
    marginBottom: SPACING.MD,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
    alignItems: 'flex-start',
  },
  detailBullet: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    marginRight: SPACING.SM,
    fontWeight: 'bold',
  },
  detailText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
  },
  examplesContainer: {
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    ...TYPOGRAPHY.KEY_TAKEAWAY,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  exampleCard: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    padding: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  exampleTitle: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: '600',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.XS,
  },
  exampleDescription: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
  },
  resourcesContainer: {
    marginTop: SPACING.SM,
  },
  resourceItem: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
});
