import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';
import InteractiveTooltip from './InteractiveTooltip';

interface DiagramElement {
  id: string;
  label: string;
  icon: string;
  x?: number;
  y?: number;
  type?: 'component' | 'connector' | 'annotation';
  description?: string;
  relatedConcepts?: string[];
}

interface DiagramConfig {
  id?: string;
  title?: string;
  type: 'flow' | 'hierarchy' | 'cycle' | 'anatomy' | 'process' | 'svg';
  elements: DiagramElement[];
  connections?: Array<{ from: string; to: string; label?: string }>;
  interactiveMode?: boolean;
}

interface DiagramViewerProps {
  diagram: DiagramConfig;
  onElementPress?: (element: DiagramElement) => void;
  animated?: boolean;
  zoom?: boolean;
}

export default function DiagramViewer({
  diagram,
  onElementPress,
  animated = true,
  zoom = false,
}: DiagramViewerProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const scale = useSharedValue(1);

  const handleElementPress = (element: DiagramElement) => {
    if (selectedElement === element.id) {
      setSelectedElement(null);
      setTooltipVisible(false);
    } else {
      setSelectedElement(element.id);
      setTooltipContent({
        title: element.label,
        description: element.description || element.label,
        icon: element.icon,
        relatedTopics: element.relatedConcepts,
      });
      setTooltipVisible(true);
      onElementPress?.(element);
    }
  };

  const handleTooltipClose = () => {
    setTooltipVisible(false);
    setSelectedElement(null);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const renderElement = (element: DiagramElement, index: number) => {
    const isSelected = selectedElement === element.id;
    const isConnected =
      selectedElement &&
      diagram.connections?.some(
        (conn) =>
          (conn.from === selectedElement && conn.to === element.id) ||
          (conn.to === selectedElement && conn.from === element.id)
      );

    return (
      <Animated.View
        key={element.id}
        entering={animated ? FadeIn.delay(index * 100) : undefined}
      >
        <Pressable
          style={[
            styles.diagramElement,
            isSelected && styles.elementSelected,
            isConnected && styles.elementConnected,
          ]}
          onPress={() => handleElementPress(element)}
        >
          <View
            style={[
              styles.elementIcon,
              isSelected && styles.iconSelected,
              isConnected && styles.iconConnected,
            ]}
          >
            <Text style={styles.icon}>{element.icon}</Text>
          </View>
          <Text
            style={[
              styles.elementLabel,
              isSelected && styles.labelSelected,
              isConnected && styles.labelConnected,
            ]}
          >
            {element.label}
          </Text>
          {element.type === 'annotation' && (
            <Text style={styles.annotationBadge}>ℹ️</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const renderConnections = () => {
    if (!diagram.connections || !diagram.interactiveMode) return null;

    return (
      <View style={styles.connectionsInfo}>
        <Text style={styles.connectionsLabel}>📊 Connections</Text>
        {diagram.connections.map((conn, idx) => {
          const fromElement = diagram.elements.find((el) => el.id === conn.from);
          const toElement = diagram.elements.find((el) => el.id === conn.to);
          const isHighlighted =
            selectedElement === conn.from || selectedElement === conn.to;

          return (
            <View
              key={idx}
              style={[
                styles.connectionItem,
                isHighlighted && styles.connectionHighlighted,
              ]}
            >
              <Text style={styles.connectionText}>
                {fromElement?.icon} {fromElement?.label} →{' '}
                {toElement?.icon} {toElement?.label}
              </Text>
              {conn.label && (
                <Text style={styles.connectionLabel}>({conn.label})</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderLegend = () => {
    if (!diagram.elements || diagram.elements.length === 0) return null;

    const uniqueTypes = Array.from(new Set(diagram.elements.map(el => el.type || 'component')));

    return (
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          {uniqueTypes.map((type, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getCategoryColor(type as any) }]} />
              <Text style={styles.legendText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getCategoryColor = (type: DiagramElement['type']) => {
    switch (type) {
      case 'component': return COLORS.SAGE_PRIMARY;
      case 'connector': return COLORS.GOLD_STREAK;
      case 'annotation': return COLORS.AMBER_GOLD;
      default: return COLORS.SAGE_PRIMARY;
    }
  };

  return (
    <View style={styles.container}>
      {diagram.title && (
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={styles.headerText}>{diagram.title}</Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.diagramContainer, containerStyle]}>
          <View style={styles.elementsGrid}>
            {diagram.elements.map((element, index) =>
              renderElement(element, index)
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {renderLegend()}
      {renderConnections()}

      <InteractiveTooltip
        visible={tooltipVisible}
        content={tooltipContent}
        position="top"
        animated={animated}
        onClose={handleTooltipClose}
      />

      {diagram.interactiveMode && (
        <Text style={styles.helpText}>
          💡 Tap elements to explore connections
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginVertical: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '30',
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
  scrollContent: {
    paddingVertical: SPACING.SM,
  },
  diagramContainer: {
    minWidth: '100%',
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  diagramElement: {
    alignItems: 'center',
    margin: SPACING.SM,
    minWidth: 80,
    maxWidth: 100,
  },
  elementIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY + '30',
    ...SHADOWS.LIGHT,
  },
  icon: {
    fontSize: 32,
  },
  elementLabel: {
    ...TYPOGRAPHY.DIAGRAM_LABEL,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
  elementSelected: {
    transform: [{ scale: 1.05 }],
  },
  iconSelected: {
    borderColor: COLORS.SAGE_PRIMARY,
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    ...SHADOWS.MEDIUM,
  },
  labelSelected: {
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
  },
  elementConnected: {
    opacity: 1,
  },
  iconConnected: {
    borderColor: COLORS.GOLD_STREAK,
    backgroundColor: COLORS.GOLD_STREAK + '20',
  },
  labelConnected: {
    color: COLORS.FOREST_ACCENT,
  },
  annotationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
  },
  connectionsInfo: {
    marginTop: SPACING.MD,
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '30',
  },
  connectionsLabel: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  connectionItem: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.SMALL,
    padding: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  connectionHighlighted: {
    backgroundColor: COLORS.GOLD_STREAK + '20',
    borderWidth: 1,
    borderColor: COLORS.GOLD_STREAK,
  },
  connectionText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  connectionLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginTop: SPACING.XS,
  },
  helpText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  legendContainer: {
    marginTop: SPACING.MD,
    padding: SPACING.SM,
    backgroundColor: '#fff',
    borderRadius: RADIUS.SMALL,
  },
  legendTitle: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.MD,
    marginBottom: SPACING.XS,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.XS,
  },
  legendText: {
    ...TYPOGRAPHY.METADATA,
    fontSize: 10,
  },
});
