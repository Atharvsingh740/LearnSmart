import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import type { Message } from '@/store/smartyStore';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.smartyBubbleContainer,
      ]}
      entering={FadeInUp.springify()}
    >
      {!isUser && <Text style={styles.smartyAvatar}>🤖</Text>}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.smartyBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.smartyText]}>
          {message.content}
        </Text>

        {message.mediaAttachment && (
          <Image
            source={{ uri: message.mediaAttachment.uri }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        )}

        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>

      {isUser && <Text style={styles.userAvatar}>👤</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    alignItems: 'flex-end',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  smartyBubbleContainer: {
    justifyContent: 'flex-start',
  },
  smartyAvatar: {
    fontSize: 30,
    marginRight: SPACING.SM,
  },
  userAvatar: {
    fontSize: 30,
    marginLeft: SPACING.SM,
  },
  bubble: {
    maxWidth: '70%',
    borderRadius: RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  smartyBubble: {
    backgroundColor: COLORS.SAND_BG,
  },
  bubbleText: {
    ...TYPOGRAPHY.BODY,
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.CREAM_BG,
  },
  smartyText: {
    color: COLORS.CHARCOAL_TEXT,
  },
  attachmentImage: {
    width: '100%',
    height: 150,
    borderRadius: RADIUS.SMALL,
    marginTop: SPACING.SM,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginTop: SPACING.XS,
    textAlign: 'right',
  },
});
