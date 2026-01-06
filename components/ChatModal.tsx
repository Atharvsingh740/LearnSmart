import { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useSmartyStore, type Message } from '@/store/smartyStore';
import { useSmartyPersonalityStore } from '@/store/smartyPersonalityStore';
import { useCurriculumStore } from '@/store/curriculumStore';
import { generateSmartyResponse } from '@/utils/smartyResponseGenerator';
import { getRecentConceptsFromStore } from '@/utils/contextAwareness';
import { isSafeQuery, generateSafeResponse } from '@/utils/safetyGuards';
import { validateSmartyResponse } from '@/utils/responseValidator';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

interface ChatModalProps {
  onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const smartyStore = useSmartyStore();
  const personalityStore = useSmartyPersonalityStore();

  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          return Math.abs(gesture.dy) > 8 && Math.abs(gesture.dx) < 20;
        },
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            translateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 140) {
            Animated.timing(translateY, {
              toValue: 600,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              onClose();
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [onClose, translateY]
  );

  useEffect(() => {
    smartyStore.checkAndResetDailyLimit();

    if (smartyStore.messages.length === 0) {
      smartyStore.addMessage({
        role: 'smarty',
        content: personalityStore.getGreeting(),
      });
    }
  }, []);

  const displayMessages = useMemo(() => {
    const base = [...smartyStore.messages].reverse();
    if (smartyStore.isLoading) {
      const typing: Message = {
        id: 'typing',
        role: 'smarty',
        content: 'Typing…',
        timestamp: Date.now(),
      };
      return [typing, ...base];
    }
    return base;
  }, [smartyStore.messages, smartyStore.isLoading]);

  const getContextConceptIds = (userQuery: string): string[] => {
    const curriculum = useCurriculumStore.getState();

    const fromLessons = getRecentConceptsFromStore();
    const fromChat = smartyStore.getLastThreeConcepts();
    const fromSearch = curriculum
      .searchContent(userQuery)
      .filter((r) => r.type === 'concept')
      .slice(0, 3)
      .map((r) => r.id);

    return Array.from(new Set([...fromSearch, ...fromLessons, ...fromChat])).slice(0, 3);
  };

  const handleSendMessage = async (text: string) => {
    const safe = isSafeQuery(text);
    if (!safe) {
      smartyStore.addMessage({
        role: 'smarty',
        content: generateSafeResponse(text, false),
      });
      return;
    }

    smartyStore.addMessage({
      role: 'user',
      content: text,
    });

    smartyStore.setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 350));

      const concepts = getContextConceptIds(text);
      const personality = personalityStore.settings;
      const { response } = generateSmartyResponse(text, personality, concepts);

      if (!validateSmartyResponse(response)) {
        throw new Error('Invalid response');
      }

      smartyStore.addMessage({
        role: 'smarty',
        content: response,
        contextConcepts: concepts,
      });
    } catch (error) {
      console.error('Chat error:', error);
      smartyStore.addMessage({
        role: 'smarty',
        content: "I'm having trouble responding right now. Please try again.",
      });
    } finally {
      smartyStore.setLoading(false);
    }
  };

  const handleAttachImage = () => {
    smartyStore.checkAndResetDailyLimit();

    if (!smartyStore.canReadImage()) {
      Alert.alert(
        'Daily Limit Reached',
        `You've used all ${smartyStore.dailyImageLimit.limit} image reads for today. Resets at 1 AM.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert('Attach Image', 'Select an option:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Attach Sample Image',
        onPress: async () => {
          const resolved = Image.resolveAssetSource(require('../assets/icon.png'));
          const uri = resolved?.uri || '';

          smartyStore.incrementImageCount();
          smartyStore.addMessage({
            role: 'user',
            content: 'Can you read this image and help me understand it?',
            mediaAttachment: {
              type: 'image',
              uri,
              fileName: 'sample.png',
            },
          });

          smartyStore.setLoading(true);
          await new Promise((r) => setTimeout(r, 350));
          smartyStore.addMessage({
            role: 'smarty',
            content:
              "I received your image. OCR for printed text/handwriting is coming soon. For now, please type the question or the text you want help with.",
          });
          smartyStore.setLoading(false);
        },
      },
    ]);
  };

  const remainingImages = Math.max(
    0,
    smartyStore.dailyImageLimit.limit - smartyStore.dailyImageLimit.used
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
      transparent
      presentationStyle="overFullScreen"
    >
      <BlurView intensity={90} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <Animated.View
            style={[styles.chatContainer, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <View style={styles.headerRow}>
                <Text style={styles.title}>Smarty 🤖</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={displayMessages}
              renderItem={({ item }) => (
                <MessageBubble message={item} isUser={item.role === 'user'} />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContainer}
              inverted
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            />

            <ChatInput
              onSendMessage={handleSendMessage}
              onAttachImage={handleAttachImage}
              imageCountRemaining={remainingImages}
              isLoading={smartyStore.isLoading}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    marginTop: 50,
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
    borderRadius: RADIUS.LARGE,
    backgroundColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.SM,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.HEADER,
    fontSize: 20,
    color: COLORS.CREAM_BG,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeIcon: {
    fontSize: 20,
    color: COLORS.CREAM_BG,
    fontWeight: '600',
  },
  messagesContainer: {
    paddingVertical: SPACING.MD,
  },
});
