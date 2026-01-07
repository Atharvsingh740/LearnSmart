import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';
import { TYPOGRAPHY } from '../theme/typography';
import { Recommendation } from '../store/recommendationsStore';
import ProgressBar from './ProgressBar';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss?: (recommendationId: string) => void;
  compact?: boolean;
  showConfidence?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onDismiss,
  compact = false,
  showConfidence = true,
}: RecommendationCardProps) {
  const navigation = useNavigation();
  
  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'lesson': return COLORS.SAGE_PRIMARY;
      case 'topic': return COLORS.FOREST_ACCENT;
      case 'practice': return COLORS.GOLD_STREAK;
      case 'tutor': return COLORS.AMBER_GOLD;
      case 'video': return COLORS.CORAL_ERROR;
      case 'test': return COLORS.CHARCOAL_TEXT;
      case 'quiz': return COLORS.FOREST_ACCENT;
      default: return COLORS.SAGE_PRIMARY;
    }
  };

  const getTypeEmoji = (type: Recommendation['type']) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'topic': return '🧪';
      case 'practice': return '✏️';
      case 'tutor': return '📖';
      case 'video': return '🎥';
      case 'test': return '📊';
      case 'quiz': return '🎲';
      default: return '💡';
    }
  };

  const handleAction = () => {
    if (recommendation.action) {
      // @ts-ignore - navigation params
      navigation.navigate(recommendation.action.screen, recommendation.action.params);
    }
    
    // Mark as seen after action
    if (onDismiss) {
      onDismiss(recommendation.id);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(recommendation.id);
    }
  };

  const getPriorityIcon = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return 'Highly recommended';
    if (confidence >= 80) return 'Recommended';
    if (confidence >= 70) return 'Suggested';
    return 'Consider';
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handleAction}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactEmoji}>{getTypeEmoji(recommendation.type)}</Text>
          
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={2}>
              {recommendation.title}
            </Text>
            <Text style={styles.compactReason} numberOfLines={2}>
              {recommendation.reason}
            </Text>
          </View>

          {showConfidence && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{recommendation.confidence}%</Text>
            </View>
          )}
        </View>

        <ProgressBar
          progress={recommendation.confidence}
          height={2}
          progressColor={getTypeColor(recommendation.type)}
          showPercentage={false}
          style={styles.confidenceBar}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Priority Indicator */}
      <View style={styles.priorityHeader}>
        <Text style={styles.priorityIcon}>{getPriorityIcon(recommendation.priority)}</Text>
        <Text style={styles.priorityText}>
          {recommendation.priority.toUpperCase()} PRIORITY
        </Text>
        
        {onDismiss && (
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Type Icon and Title */}
        <View style={styles.typeSection}>
          <View style={[styles.typeIconContainer, { backgroundColor: getTypeColor(recommendation.type).alpha(0.1) || COLORS.SAND_BG }]}>
            <Text style={[styles.typeIcon, { color: getTypeColor(recommendation.type) }]}>
              {getTypeEmoji(recommendation.type)}
            </Text>
          </View>
          
          <View style={styles.typeInfo}>
            <Text style={styles.typeLabel}>
              {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)} Recommendation
            </Text>
            <Text style={styles.title}>{recommendation.title}</Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.reasonSection}>
          <Text style={styles.reasonTitle}>Why this is recommended:</Text>
          <Text style={styles.reasonText}>{recommendation.reason}</Text>
        </View>

        {/* Confidence Meter */}
        {showConfidence && (
          <View style={styles.confidenceSection}>
            <Text style={styles.confidenceTitle}>
              {getConfidenceText(recommendation.confidence)} ({recommendation.confidence}%)
            </Text>
            <ProgressBar
              progress={recommendation.confidence}
              height={8}
              progressColor={getTypeColor(recommendation.type)}
              showPercentage={true}
              style={styles.confidenceBar}
            />
          </View>
        )}

        {/* Action Section */}
        {recommendation.action && (
          <TouchableOpacity onPress={handleAction}>
            <View style={styles.actionSection}>
              <Text style={styles.actionText}>{recommendation.action.label}</Text>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact Style
  compactContainer: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginVertical: SPACING.XS,
    marginHorizontal: SPACING.SM,
    ...SHADOWS.LIGHT,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compactEmoji: {
    fontSize: 24,
    marginRight: SPACING.SM,
    marginTop: SPACING.XS / 2,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 14,
    marginBottom: SPACING.XS / 2,
  },
  compactReason: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    fontSize: 12,
    opacity: 0.8,
  },
  confidenceBadge: {
    backgroundColor: COLORS.FOREST_ACCENT,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
    alignSelf: 'flex-start',
    marginLeft: SPACING.SM,
  },
  confidenceText: {
    color: COLORS.SAND_BG,
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceBar: {
    marginTop: SPACING.SM,
  },

  // Full Card Style
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.LARGE,
    overflow: 'hidden',
    marginVertical: SPACING.SM,
    marginHorizontal: SPACING.SM,
    ...SHADOWS.MEDIUM,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.SAGE_PRIMARY,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.FOREST_ACCENT,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  priorityIcon: {
    fontSize: 12,
    marginRight: SPACING.XS,
  },
  priorityText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    flex: 1,
    fontWeight: '600',
  },
  dismissButton: {
    padding: SPACING.XS,
  },
  dismissIcon: {
    fontSize: 16,
    color: COLORS.SAND_BG,
  },
  content: {
    padding: SPACING.LG,
    paddingTop: SPACING.MD,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  title: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  reasonSection: {
    marginBottom: SPACING.MD,
    padding: SPACING.MD,
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: RADIUS.MEDIUM,
  },
  reasonTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 14,
    marginBottom: SPACING.XS,
    color: COLORS.FOREST_ACCENT,
  },
  reasonText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    lineHeight: 20,
  },
  confidenceSection: {
    marginBottom: SPACING.MD,
  },
  confidenceTitle: {
    ...TYPOGRAPHY.BULLET_TEXT,
    marginBottom: SPACING.SM,
    color: COLORS.CHARCOAL_TEXT,
  },
  confidenceBar: {
    marginTop: SPACING.SM,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.MEDIUM,
    marginTop: SPACING.MD,
  },
  actionText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.SAND_BG,
  },
});

export default RecommendationCard;