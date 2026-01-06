import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SmartySetting {
  tone: 'warm' | 'formal' | 'casual' | 'motivational';
  emojiUsage: 'high' | 'medium' | 'low' | 'none';
  formality: 'very-formal' | 'formal' | 'casual' | 'very-casual';
  responseLength: 'short' | 'medium' | 'long';
  namePreference: string;
}

export interface SmartyPersonality {
  warmGreetings: string[];
  encouragingPhrases: string[];
  emojiMap: Record<string, string>;
  responseTemplates: Record<string, string[]>;
}

export type SmartyPreset =
  | 'warm-mentor'
  | 'formal-guide'
  | 'casual-friend'
  | 'motivational-coach'
  | 'custom';

interface SmartyPersonalityState {
  preset: SmartyPreset;
  settings: SmartySetting;

  loadPreset: (presetName: SmartyPreset) => void;
  updateSettings: (updates: Partial<SmartySetting>) => void;

  getGreeting: () => string;
  getEncouragingPhrase: () => string;
  getPersonalityEmoji: () => string;
}

export const PRESETS: Record<Exclude<SmartyPreset, 'custom'>, SmartySetting> = {
  'warm-mentor': {
    tone: 'warm',
    emojiUsage: 'high',
    formality: 'casual',
    responseLength: 'medium',
    namePreference: 'friend',
  },
  'formal-guide': {
    tone: 'formal',
    emojiUsage: 'low',
    formality: 'formal',
    responseLength: 'long',
    namePreference: 'student',
  },
  'casual-friend': {
    tone: 'casual',
    emojiUsage: 'high',
    formality: 'very-casual',
    responseLength: 'short',
    namePreference: 'buddy',
  },
  'motivational-coach': {
    tone: 'motivational',
    emojiUsage: 'medium',
    formality: 'casual',
    responseLength: 'medium',
    namePreference: 'champion',
  },
};

export const PERSONALITY_DATA: Record<SmartySetting['tone'], SmartyPersonality> = {
  warm: {
    warmGreetings: [
      "Hi there! 👋 How can I help you learn today?",
      "Hey! What's on your mind? I'm here to help! 💡",
      "Welcome back! Ready to explore something new? 🌟",
      "Hello! Let's learn something amazing together! ✨",
    ],
    encouragingPhrases: [
      "That's a great question! 🎯",
      "You're thinking like a true scholar! 📚",
      "I love your curiosity! ✨",
      'Keep up that amazing learning energy! 🔥',
      'Excellent thinking! 🌟',
    ],
    emojiMap: {
      excited: '🎉',
      thinking: '🤔',
      success: '✅',
      learning: '📚',
      star: '⭐',
    },
    responseTemplates: {
      explanation: [
        'Let me explain that for you! {content} {emoji}',
        "Great question! Here's what I know: {content} {emoji}",
      ],
    },
  },
  formal: {
    warmGreetings: [
      'Good day. How may I assist you with your studies?',
      'Welcome. What topic would you like to explore?',
      'Greetings. I am ready to help with your learning journey.',
    ],
    encouragingPhrases: [
      'That is an excellent inquiry.',
      'Your understanding is progressing well.',
      'A thoughtful question indeed.',
      'Your academic pursuit is commendable.',
    ],
    emojiMap: {
      excited: '✓',
      thinking: '...',
      success: '✓',
      learning: '',
      star: '•',
    },
    responseTemplates: {
      explanation: ['Allow me to elucidate: {content}', 'The answer to your inquiry is as follows: {content}'],
    },
  },
  casual: {
    warmGreetings: ['Yo! What\'s good? 🤙', "Sup! Let's learn something cool 🚀", "Hey hey! What's up? 😎", "What's happening! Ready to dive in? 🏄"],
    encouragingPhrases: ['Yo, that\'s fire! 🔥', 'You got this! 💪', "That's so cool! 😎", 'Awesome sauce! 🎉', 'Legend status! 🌟'],
    emojiMap: {
      excited: '🔥',
      thinking: '🤔',
      success: '💯',
      learning: '🚀',
      star: '⭐',
    },
    responseTemplates: {
      explanation: ['Yo, check this out: {content} {emoji}', 'So basically: {content} {emoji}'],
    },
  },
  motivational: {
    warmGreetings: [
      "Let's crush this learning goal together! 💪",
      "You're doing amazing! What should we tackle next? 🎯",
      "Ready to level up your knowledge? Let's go! 🚀",
      'Your potential is limitless! What can I help with? ⭐',
    ],
    encouragingPhrases: [
      "You're unstoppable! 🚀",
      'That effort is incredible! 🏆',
      "You're on fire today! 🔥",
      "Keep pushing! You're making great progress! 💪",
      "Believe in yourself - you've got this! ⭐",
    ],
    emojiMap: {
      excited: '🎯',
      thinking: '💭',
      success: '🏆',
      learning: '📈',
      star: '⭐',
    },
    responseTemplates: {
      explanation: ["You're about to master this! {content} {emoji}", "Here's your path to success: {content} {emoji}"],
    },
  },
};

const pickRandom = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

const addNamePreference = (text: string, namePreference: string): string => {
  const name = namePreference?.trim();
  if (!name) return text;
  if (text.toLowerCase().startsWith('hi') || text.toLowerCase().startsWith('hey') || text.toLowerCase().startsWith('yo')) {
    return text;
  }
  return `Hey ${name}! ${text}`;
};

const presetFromTone = (tone: SmartySetting['tone']): SmartyPreset => {
  if (tone === 'formal') return 'formal-guide';
  if (tone === 'casual') return 'casual-friend';
  if (tone === 'motivational') return 'motivational-coach';
  return 'warm-mentor';
};

export const useSmartyPersonalityStore = create<SmartyPersonalityState>()(
  persist(
    (set, get) => ({
      preset: 'warm-mentor',
      settings: PRESETS['warm-mentor'],

      loadPreset: (presetName) => {
        if (presetName === 'custom') return;
        set({ preset: presetName, settings: PRESETS[presetName] });
      },

      updateSettings: (updates) => {
        set((state) => ({
          preset: 'custom',
          settings: { ...state.settings, ...updates },
        }));
      },

      getGreeting: () => {
        const { settings } = get();
        const data = PERSONALITY_DATA[settings.tone];
        return addNamePreference(pickRandom(data.warmGreetings), settings.namePreference);
      },

      getEncouragingPhrase: () => {
        const { settings } = get();
        const data = PERSONALITY_DATA[settings.tone];
        return addNamePreference(pickRandom(data.encouragingPhrases), settings.namePreference);
      },

      getPersonalityEmoji: () => {
        const { settings } = get();
        const data = PERSONALITY_DATA[settings.tone];
        const emojis = Object.values(data.emojiMap).filter(Boolean);
        return pickRandom(emojis.length ? emojis : ['✨']);
      },
    }),
    {
      name: 'learnsmart-smarty-personality',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (!persistedState) {
          return { preset: 'warm-mentor', settings: PRESETS['warm-mentor'] };
        }

        if (version < 2 && persistedState.currentSettings) {
          const settings = persistedState.currentSettings as SmartySetting;
          return {
            preset: presetFromTone(settings.tone),
            settings,
          };
        }

        if (persistedState.settings) {
          return persistedState;
        }

        return { preset: 'warm-mentor', settings: PRESETS['warm-mentor'] };
      },
    }
  )
);
