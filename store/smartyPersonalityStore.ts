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

interface PersonalityState {
  currentSettings: SmartySetting;
  
  setPersonality: (settings: Partial<SmartySetting>) => void;
  loadPreset: (preset: 'warm' | 'formal' | 'casual' | 'motivational') => void;
  getGreeting: () => string;
  getEncouragingPhrase: () => string;
  getPersonalityEmoji: () => string;
}

const PRESETS: Record<string, SmartySetting> = {
  warm: {
    tone: 'warm',
    emojiUsage: 'high',
    formality: 'casual',
    responseLength: 'medium',
    namePreference: 'friend',
  },
  formal: {
    tone: 'formal',
    emojiUsage: 'low',
    formality: 'formal',
    responseLength: 'long',
    namePreference: 'student',
  },
  casual: {
    tone: 'casual',
    emojiUsage: 'high',
    formality: 'very-casual',
    responseLength: 'short',
    namePreference: 'buddy',
  },
  motivational: {
    tone: 'motivational',
    emojiUsage: 'medium',
    formality: 'casual',
    responseLength: 'medium',
    namePreference: 'champion',
  },
};

const PERSONALITY_DATA: Record<string, SmartyPersonality> = {
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
      "Keep up that amazing learning energy! 🔥",
      "Excellent thinking! 🌟",
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
        "Let me explain that for you! {content} {emoji}",
        "Great question! Here's what I know: {content} {emoji}",
      ],
    },
  },
  formal: {
    warmGreetings: [
      "Good day. How may I assist you with your studies?",
      "Welcome. What topic would you like to explore?",
      "Greetings. I am ready to help with your learning journey.",
    ],
    encouragingPhrases: [
      "That is an excellent inquiry.",
      "Your understanding is progressing well.",
      "A thoughtful question indeed.",
      "Your academic pursuit is commendable.",
    ],
    emojiMap: {
      excited: '✓',
      thinking: '...',
      success: '✓',
      learning: '',
      star: '•',
    },
    responseTemplates: {
      explanation: [
        "Allow me to elucidate: {content}",
        "The answer to your inquiry is as follows: {content}",
      ],
    },
  },
  casual: {
    warmGreetings: [
      "Yo! What's good? 🤙",
      "Sup! Let's learn something cool 🚀",
      "Hey hey! What's up? 😎",
      "What's happening! Ready to dive in? 🏄",
    ],
    encouragingPhrases: [
      "Yo, that's fire! 🔥",
      "You got this! 💪",
      "That's so cool! 😎",
      "Awesome sauce! 🎉",
      "Legend status! 🌟",
    ],
    emojiMap: {
      excited: '🔥',
      thinking: '🤔',
      success: '💯',
      learning: '🚀',
      star: '⭐',
    },
    responseTemplates: {
      explanation: [
        "Yo, check this out: {content} {emoji}",
        "So basically: {content} {emoji}",
      ],
    },
  },
  motivational: {
    warmGreetings: [
      "Let's crush this learning goal together! 💪",
      "You're doing amazing! What should we tackle next? 🎯",
      "Ready to level up your knowledge? Let's go! 🚀",
      "Your potential is limitless! What can I help with? ⭐",
    ],
    encouragingPhrases: [
      "You're unstoppable! 🚀",
      "That effort is incredible! 🏆",
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
      explanation: [
        "You're about to master this! {content} {emoji}",
        "Here's your path to success: {content} {emoji}",
      ],
    },
  },
};

export const useSmartyPersonalityStore = create<PersonalityState>()(
  persist(
    (set, get) => ({
      currentSettings: PRESETS.warm,
      
      setPersonality: (settings) => {
        set((state) => ({
          currentSettings: { ...state.currentSettings, ...settings },
        }));
      },
      
      loadPreset: (preset) => {
        set({ currentSettings: PRESETS[preset] });
      },
      
      getGreeting: () => {
        const { currentSettings } = get();
        const data = PERSONALITY_DATA[currentSettings.tone];
        const greetings = data.warmGreetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
      },
      
      getEncouragingPhrase: () => {
        const { currentSettings } = get();
        const data = PERSONALITY_DATA[currentSettings.tone];
        const phrases = data.encouragingPhrases;
        return phrases[Math.floor(Math.random() * phrases.length)];
      },
      
      getPersonalityEmoji: () => {
        const { currentSettings } = get();
        const data = PERSONALITY_DATA[currentSettings.tone];
        const emojis = Object.values(data.emojiMap);
        return emojis[Math.floor(Math.random() * emojis.length)];
      },
    }),
    {
      name: 'learnsmart-smarty-personality',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { PRESETS, PERSONALITY_DATA };
