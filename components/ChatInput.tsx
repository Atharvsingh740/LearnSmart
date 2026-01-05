import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onAttachImage: () => void;
  imageCountRemaining: number;
  isLoading: boolean;
}

export default function ChatInput({
  onSendMessage,
  onAttachImage,
  imageCountRemaining,
  isLoading,
}: ChatInputProps) {
  const [text, setText] = useState('');

  const trimmed = useMemo(() => text.trim(), [text]);

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        onPress={onAttachImage}
        disabled={imageCountRemaining === 0 || isLoading}
        style={[styles.attachButton, (imageCountRemaining === 0 || isLoading) && styles.disabledButton]}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>📎</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{imageCountRemaining}</Text>
        </View>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Ask Smarty anything..."
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
        editable={!isLoading}
        multiline
      />

      <TouchableOpacity
        onPress={() => {
          if (!trimmed || isLoading) return;
          onSendMessage(trimmed);
          setText('');
          Keyboard.dismiss();
        }}
        disabled={!trimmed || isLoading}
        style={[styles.sendButton, (!trimmed || isLoading) && styles.disabledButton]}
        activeOpacity={0.7}
      >
        <Text style={styles.sendIcon}>📤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.SAND_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  icon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: COLORS.SAGE_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.CREAM_BG,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: RADIUS.INPUT,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.SAGE_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.SM,
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.CREAM_BG,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
