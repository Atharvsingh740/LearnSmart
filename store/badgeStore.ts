import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXPStore } from '@/store/xpStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';
import { useAvatarStore } from '@/store/avatarStore';
import { useSmartyStore } from '@/store/smartyStore';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'learning' | 'community' | 'streak' | 'achievement';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criterion: string;
  requirement: number;
  xpReward: number;
  smartCoinReward: number;
  unlockedAt?: number;
}

const BADGES: Badge[] = [
  // Learning
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    icon: '🎓',
    description: 'Complete 5 quizzes',
    category: 'learning',
    rarity: 'common',
    criterion: 'quizzes_completed',
    requirement: 5,
    xpReward: 50,
    smartCoinReward: 5,
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    description: 'Complete 25 quizzes',
    category: 'learning',
    rarity: 'rare',
    criterion: 'quizzes_completed',
    requirement: 25,
    xpReward: 100,
    smartCoinReward: 15,
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    icon: '🏆',
    description: 'Complete 100 quizzes',
    category: 'learning',
    rarity: 'epic',
    criterion: 'quizzes_completed',
    requirement: 100,
    xpReward: 200,
    smartCoinReward: 30,
  },
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    icon: '🚀',
    description: 'Complete a quiz in under 2 minutes',
    category: 'learning',
    rarity: 'common',
    criterion: 'speed_runner',
    requirement: 1,
    xpReward: 75,
    smartCoinReward: 10,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    icon: '💯',
    description: 'Get 3 consecutive 100% scores',
    category: 'learning',
    rarity: 'rare',
    criterion: 'perfect_scores_streak',
    requirement: 3,
    xpReward: 150,
    smartCoinReward: 20,
  },
  {
    id: 'concept-explorer',
    name: 'Concept Explorer',
    icon: '📖',
    description: 'Learn 50 different concepts',
    category: 'learning',
    rarity: 'epic',
    criterion: 'concepts_learned',
    requirement: 50,
    xpReward: 150,
    smartCoinReward: 25,
  },

  // Community
  {
    id: 'helper',
    name: 'Helper',
    icon: '💬',
    description: 'Post 10 helpful forum answers',
    category: 'community',
    rarity: 'common',
    criterion: 'helpful_answers',
    requirement: 10,
    xpReward: 50,
    smartCoinReward: 5,
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: '⭐',
    description: 'Receive 50 helpful marks',
    category: 'community',
    rarity: 'rare',
    criterion: 'helpful_marks',
    requirement: 50,
    xpReward: 100,
    smartCoinReward: 20,
  },
  {
    id: 'community-star',
    name: 'Community Star',
    icon: '🌟',
    description: 'Reach 200 reputation',
    category: 'community',
    rarity: 'epic',
    criterion: 'reputation',
    requirement: 200,
    xpReward: 200,
    smartCoinReward: 40,
  },
  {
    id: 'team-player',
    name: 'Team Player',
    icon: '👥',
    description: 'Join a study group',
    category: 'community',
    rarity: 'common',
    criterion: 'study_group_joined',
    requirement: 1,
    xpReward: 25,
    smartCoinReward: 5,
  },
  {
    id: 'contributor',
    name: 'Contributor',
    icon: '📝',
    description: 'Ask 10 forum questions',
    category: 'community',
    rarity: 'common',
    criterion: 'questions_asked',
    requirement: 10,
    xpReward: 40,
    smartCoinReward: 8,
  },
  {
    id: 'voiceful',
    name: 'Voiceful',
    icon: '🗣️',
    description: 'Get 10 upvotes on your answers',
    category: 'community',
    rarity: 'rare',
    criterion: 'answer_upvotes',
    requirement: 10,
    xpReward: 100,
    smartCoinReward: 15,
  },

  // Streak
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    icon: '🔥',
    description: 'Maintain a 7-day learning streak',
    category: 'streak',
    rarity: 'common',
    criterion: 'streak_days',
    requirement: 7,
    xpReward: 50,
    smartCoinReward: 10,
  },
  {
    id: 'month-maverick',
    name: 'Month Maverick',
    icon: '🌊',
    description: 'Maintain a 30-day learning streak',
    category: 'streak',
    rarity: 'rare',
    criterion: 'streak_days',
    requirement: 30,
    xpReward: 150,
    smartCoinReward: 30,
  },
  {
    id: 'century-champion',
    name: 'Century Champion',
    icon: '🎯',
    description: 'Maintain a 100-day learning streak',
    category: 'streak',
    rarity: 'legendary',
    criterion: 'streak_days',
    requirement: 100,
    xpReward: 300,
    smartCoinReward: 100,
  },
];

const BACKGROUND_UNLOCKS: Record<string, string> = {
  'quiz-master': 'bg-library',
  'speed-runner': 'bg-space',
  'community-star': 'bg-beach',
  helper: 'bg-classroom',
  expert: 'bg-sunset',
};

interface BadgeState {
  badges: Badge[];
  unlockedBadges: Badge[];

  progress: Record<string, number>;
  learnedConceptIds: Record<string, true>;

  lastUnlockedBadgeId: string | null;

  unlockBadge: (badgeId: string) => Promise<void>;
  getUnlockedBadges: () => Badge[];
  checkBadgeProgress: (criterion: string, value: number) => Badge | null;
  checkAndUnlockBadges: (criterion: string, value: number) => Promise<Badge[]>;
  getBadgesByCategory: (category: BadgeCategory) => Badge[];

  addLearnedConcepts: (conceptIds: string[]) => void;
  getLearnedConceptCount: () => number;
  incrementProgress: (criterion: string, delta?: number) => Promise<Badge[]>;

  consumeLastUnlockedBadge: () => Badge | null;
  resetAll: () => void;
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: BADGES,
      unlockedBadges: [],
      progress: {},
      learnedConceptIds: {},
      lastUnlockedBadgeId: null,

      unlockBadge: async (badgeId) => {
        const already = get().unlockedBadges.find((b) => b.id === badgeId);
        if (already) return;

        const base = get().badges.find((b) => b.id === badgeId);
        if (!base) return;

        const unlocked: Badge = { ...base, unlockedAt: Date.now() };

        set((state) => ({
          badges: state.badges.map((b) => (b.id === badgeId ? unlocked : b)),
          unlockedBadges: [unlocked, ...state.unlockedBadges],
          lastUnlockedBadgeId: badgeId,
        }));

        const xpStore = useXPStore.getState();
        const coinStore = useSmartCoinStore.getState();

        await xpStore.addXP(unlocked.xpReward, 'badge-unlock', `${unlocked.icon} ${unlocked.name} badge unlocked`);
        coinStore.addCoins(unlocked.smartCoinReward, 'badge-unlock', `${unlocked.icon} ${unlocked.name} badge reward`);

        useSmartyStore.getState().addMessage({
          role: 'smarty',
          content: `🎖️ Badge unlocked: ${unlocked.name} ${unlocked.icon}\n\nRewards: +${unlocked.xpReward} XP and +${unlocked.smartCoinReward} SmartCoins!`,
        });

        const backgroundId = BACKGROUND_UNLOCKS[badgeId];
        if (backgroundId) {
          useAvatarStore.getState().grantCosmetic(backgroundId);
        }
      },

      getUnlockedBadges: () => get().unlockedBadges,

      checkBadgeProgress: (criterion, value) => {
        const val = Math.max(0, value);
        return (
          get().badges
            .filter((b) => b.criterion === criterion)
            .filter((b) => !b.unlockedAt)
            .sort((a, b) => a.requirement - b.requirement)
            .find((b) => val >= b.requirement) ||
          null
        );
      },

      checkAndUnlockBadges: async (criterion, value) => {
        const unlocked: Badge[] = [];
        let next = get().checkBadgeProgress(criterion, value);
        while (next) {
          await get().unlockBadge(next.id);
          unlocked.push({ ...next, unlockedAt: Date.now() });
          next = get().checkBadgeProgress(criterion, value);
        }
        return unlocked;
      },

      getBadgesByCategory: (category) => {
        return get().badges.filter((b) => b.category === category);
      },

      addLearnedConcepts: (conceptIds) => {
        if (!conceptIds || conceptIds.length === 0) return;
        set((state) => {
          const updated = { ...state.learnedConceptIds };
          for (const id of conceptIds) {
            if (!id) continue;
            updated[id] = true;
          }
          return { learnedConceptIds: updated };
        });
      },

      getLearnedConceptCount: () => Object.keys(get().learnedConceptIds).length,

      incrementProgress: async (criterion, delta = 1) => {
        const nextValue = (get().progress[criterion] || 0) + delta;
        set((state) => ({
          progress: {
            ...state.progress,
            [criterion]: nextValue,
          },
        }));
        return get().checkAndUnlockBadges(criterion, nextValue);
      },

      consumeLastUnlockedBadge: () => {
        const id = get().lastUnlockedBadgeId;
        if (!id) return null;
        const badge = get().badges.find((b) => b.id === id) || null;
        set({ lastUnlockedBadgeId: null });
        return badge;
      },

      resetAll: () => {
        set({
          badges: BADGES,
          unlockedBadges: [],
          progress: {},
          learnedConceptIds: {},
          lastUnlockedBadgeId: null,
        });
      },
    }),
    {
      name: 'learnsmart-badges',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
