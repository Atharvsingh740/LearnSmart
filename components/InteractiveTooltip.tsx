import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';

interface TooltipContent {
  title: string;
  description: string;
  icon: string;
  learnMoreTopic?: string;
  relatedTopics?: string[];
}

interface InteractiveTooltipProps {
  visible: boolean;
  content: TooltipContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  animated?: boolean;
  onClose: () => void;
  onLearnMore?: (topic: string) => void;
}

export default function InteractiveTooltip({
  visible,
  content,
  position = 'top',
  animated = true,
  onClose,
  onLearnMore,
}: InteractiveTooltipProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.tooltipContainer,
            animated && animatedStyle,
            styles[`position_${position}`],
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.icon}>{content.icon}</Text>
            <Text style={styles.title}>{content.title}</Text>
          </View>
          
          <Text style={styles.description}>{content.description}</Text>

          {content.learnMoreTopic && onLearnMore && (
            <Pressable
              style={styles.learnMoreButton}
              onPress={() => {
                onLearnMore(content.learnMoreTopic!);
                onClose();
              }}
            >
              <Text style={styles.learnMoreText}>Learn more →</Text>
            </Pressable>
          )}

          {content.relatedTopics && content.relatedTopics.length > 0 && (
            <View style={styles.relatedTopics}>
              <Text style={styles.relatedLabel}>Related:</Text>
              <View style={styles.topicsContainer}>
                {content.relatedTopics.map((topic, idx) => (
                  <View key={idx} style={styles.topicChip}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    maxWidth: '85%',
    ...SHADOWS.MEDIUM,
  },
  position_top: {
    marginBottom: 'auto',
    marginTop: SPACING.XXL,
  },
  position_bottom: {
    marginTop: 'auto',
    marginBottom: SPACING.XXL,
  },
  position_left: {
    marginRight: 'auto',
    marginLeft: SPACING.MD,
  },
  position_right: {
    marginLeft: 'auto',
    marginRight: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  icon: {
    fontSize: 28,
    marginRight: SPACING.SM,
  },
  title: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    flex: 1,
  },
  description: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  learnMoreButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.SMALL,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  learnMoreText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: '#fff',
    fontWeight: '600',
  },
  relatedTopics: {
    marginTop: SPACING.SM,
  },
  relatedLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicChip: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    marginRight: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  topicText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 1,
  },
});
