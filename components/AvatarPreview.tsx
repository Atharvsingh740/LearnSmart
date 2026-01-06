import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import type { AvatarCustomization } from '@/store/avatarStore';

interface AvatarPreviewProps {
  customization: AvatarCustomization;
  size: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onPress?: () => void;
}

const sizePx = (size: AvatarPreviewProps['size']) => {
  if (size === 'small') return 56;
  if (size === 'large') return 140;
  return 92;
};

const skinColor = (tone: AvatarCustomization['skinTone']) => {
  if (tone === 'light') return '#F7D7C4';
  if (tone === 'dark') return '#8D5524';
  return '#E0AC69';
};

const getBaseEmoji = (base: AvatarCustomization['baseCharacter']) => (base === 'girl' ? '👧' : '👦');

const cosmeticsEmoji: Record<string, string> = {
  'outfit-uniform': '🎒',
  'outfit-casual': '👕',
  'outfit-scientist': '🥼',
  'outfit-superhero': '🦸',
  'outfit-knight': '🛡️',
  'outfit-astronaut': '👨‍🚀',
  'outfit-wizard': '🧙',
  'outfit-pirate': '🏴‍☠️',

  'acc-glasses': '👓',
  'acc-headphones': '🎧',
  'acc-backpack': '🎒',
  'acc-crown': '👑',
  'acc-gradcap': '🎓',
  'acc-medal': '🏅',
  'acc-halo': '😇',
  'acc-wings': '🪽',

  'bg-library': '📚',
  'bg-forest': '🌲',
  'bg-space': '🌌',
  'bg-beach': '🏖️',
  'bg-classroom': '🏫',
  'bg-mountain': '⛰️',
  'bg-sunset': '🌇',
  'bg-aurora': '🌌',
};

export default function AvatarPreview({ customization, size, interactive = false, onPress }: AvatarPreviewProps) {
  const px = sizePx(size);
  const base = getBaseEmoji(customization.baseCharacter);

  const outfit = customization.outfit ? cosmeticsEmoji[customization.outfit] : '';
  const accessories = (customization.accessories || [])
    .slice(0, 3)
    .map((id) => cosmeticsEmoji[id])
    .filter(Boolean)
    .join(' ');

  const bg = customization.background ? cosmeticsEmoji[customization.background] : '';

  const content = (
    <View style={[styles.avatar, { width: px, height: px, borderRadius: px / 2, backgroundColor: skinColor(customization.skinTone) }]}>
      <Text style={[styles.baseEmoji, size === 'small' && styles.baseEmojiSmall, size === 'large' && styles.baseEmojiLarge]}>
        {base}
      </Text>

      {(outfit || accessories || bg) && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(180)} style={styles.overlay}>
          {bg ? <Text style={styles.overlayText}>{bg}</Text> : null}
          {outfit ? <Text style={styles.overlayText}>{outfit}</Text> : null}
          {accessories ? <Text style={styles.overlayText}>{accessories}</Text> : null}
        </Animated.View>
      )}
    </View>
  );

  if (!interactive) return content;

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {content}
      <Text style={styles.tapHint}>Tap to customize</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.SAGE_PRIMARY + '30',
    overflow: 'hidden',
  },
  baseEmoji: {
    fontSize: 44,
  },
  baseEmojiSmall: {
    fontSize: 26,
  },
  baseEmojiLarge: {
    fontSize: 64,
  },
  overlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: RADIUS.MEDIUM,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.XS,
  },
  overlayText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
  },
  tapHint: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.65,
    marginTop: SPACING.XS,
  },
});
