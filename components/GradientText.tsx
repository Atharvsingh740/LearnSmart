import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS } from '@/theme';
import { TYPOGRAPHY } from '@/theme/typography';

interface GradientTextProps {
  text: string;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
  style?: TextStyle;
  glow?: boolean;
}

export default function GradientText({
  text,
  colors = [COLORS.SAGE_PRIMARY, COLORS.FOREST_ACCENT],
  size = 'medium',
  style,
  glow = false,
}: GradientTextProps) {
  const sizeStyles = {
    small: TYPOGRAPHY.BULLET_TEXT,
    medium: TYPOGRAPHY.CONCEPT_TITLE,
    large: TYPOGRAPHY.SECTION_HEADER,
  };

  return (
    <Text
      style={[
        styles.text,
        sizeStyles[size],
        { color: colors[0] },
        glow && styles.glow,
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
  },
  glow: {
    textShadowColor: COLORS.SAGE_PRIMARY,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
