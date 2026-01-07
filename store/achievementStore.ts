import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXPStore } from '@/store/xpStore';
import { useCreditsStore } from '@/store/creditsStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useStreakStore } from '@/store/streakStore';

export type AchievementCategory = 'learning' | 'streak' | 'social' | 'milestone';

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt: number | null;
  progress: number;
  maxProgress: number;
  reward: number;
  isHidden?: boolean;
}

// Initial achievements list (50+ total)
const BASE_ACHIEVEMENTS: Omit<Achievement, 'userId' | 'unlockedAt' | 'progress'>[] = [
  // Learning Achievements (10)
  {
    id: 'first_lesson',
    title: 'First Lesson',
    description: 'Complete your first lesson',
    icon: '📚',
    category: 'learning',
    maxProgress: 1,
    reward: 10,
  },
  {
    id: 'concept_crusher',
    title: 'Concept Crusher',
    description: 'Learn 5 concepts',
    icon: '🧠',
    category: 'learning',
    maxProgress: 5,
    reward: 25,
  },
  {
    id: 'quiz_champion',
    title: 'Quiz Champion',
    description: 'Score 90%+ on a quiz',
    icon: '🏆',
    category: 'learning',
    maxProgress: 1,
    reward: 30,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a test',
    icon: '💯',
    category: 'learning',
    maxProgress: 1,
    reward: 50,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete test in under 5 minutes',
    icon: '⚡',
    category: 'learning',
    maxProgress: 1,
    reward: 40,
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Learn 25 concepts',
    icon: '📖',
    category: 'learning',
    maxProgress: 25,
    reward: 75,
  },
  {
    id: 'chapter_master',
    title: 'Chapter Master',
    description: 'Complete a full chapter',
    icon: '📘',
    category: 'learning',
    maxProgress: 1,
    reward: 35,
  },
  {
    id: 'expert_level',
    title: 'Expert Level',
    description: 'Complete 10 chapters',
    icon: '🎓',
    category: 'learning',
    maxProgress: 10,
    reward: 100,
  },
  {
    id: 'subject_specialist',
    title: 'Subject Specialist',
    description: 'Master all concepts in one subject',
    icon: '🎯',
    category: 'learning',
    maxProgress: 100,
    reward: 150,
  },
  {
    id: 'study_streak',
    title: 'Consistent Learner',
    description: 'Study 7 days in a row',
    icon: '📅',
    category: 'learning',
    maxProgress: 7,
    reward: 60,
  },

  // Streak Achievements (12)
  {
    id: 'day_1_streak',
    title: 'Getting Started',
    description: 'Login for 1 day',
    icon: '✨',
    category: 'streak',
    maxProgress: 1,
    reward: 5,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    maxProgress: 7,
    reward: 25,
  },
  {
    id: 'two_week_titan',
    title: 'Two-Week Titan',
    description: 'Maintain a 14-day streak',
    icon: '🔥🔥',
    category: 'streak',
    maxProgress: 14,
    reward: 50,
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥🔥🔥',
    category: 'streak',
    maxProgress: 30,
    reward: 100,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 60-day streak',
    icon: '🚀',
    category: 'streak',
    maxProgress: 60,
    reward: 200,
  },
  {
    id: 'legendary',
    title: 'Legendary',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    category: 'streak',
    maxProgress: 100,
    reward: 500,
  },
  {
    id: 'streak_saver',
    title: 'Streak Saver',
    description: 'Use streak freeze 1 time',
    icon: '🛡️',
    category: 'streak',
    maxProgress: 1,
    reward: 15,
  },
  {
    id: 'weekend_warriors',
    title: 'Weekend Warrior',
    description: 'Study on 10 weekends',
    icon: '📚',
    category: 'streak',
    maxProgress: 10,
    reward: 75,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Study after 10 PM 7 days',
    icon: '🦉',
    category: 'streak',
    maxProgress: 7,
    reward: 40,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Study before 7 AM 7 days',
    icon: '🌅',
    category: 'streak',
    maxProgress: 7,
    reward: 40,
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Reach 50 days streak',
    icon: '⭐',
    category: 'streak',
    maxProgress: 50,
    reward: 150,
  },
  {
    id: 'never_give_up',
    title: 'Never Give Up',
    description: 'Recover from a broken streak',
    icon: '💪',
    category: 'streak',
    maxProgress: 1,
    reward: 20,
  },

  // Social & Gift Achievements (12)
  {
    id: 'generous_soul',
    title: 'Generous Soul',
    description: 'Gift 100 credits to friends',
    icon: '🎁',
    category: 'social',
    maxProgress: 100,
    reward: 80,
  },
  {
    id: 'friend_maker',
    title: 'Friend Maker',
    description: 'Gift to 5 different friends',
    icon: '👥',
    category: 'social',
    maxProgress: 5,
    reward: 50,
  },
  {
    id: 'community_champion',
    title: 'Community Champion',
    description: 'Receive gifts from 10 people',
    icon: '🏅',
    category: 'social',
    maxProgress: 10,
    reward: 60,
  },
  {
    id: 'gift_giver',
    title: 'Gift Giver',
    description: 'Send 10 gifts',
    icon: '🎊',
    category: 'social',
    maxProgress: 10,
    reward: 100,
  },
  {
    id: 'sharing_is_caring',
    title: 'Sharing is Caring',
    description: 'Share 5 achievements',
    icon: '📤',
    category: 'social',
    maxProgress: 5,
    reward: 30,
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Have 5 friends using the app',
    icon: '🦋',
    category: 'social',
    maxProgress: 5,
    reward: 70,
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'Help 3 friends complete lessons',
    icon: '🧑‍🏫',
    category: 'social',
    maxProgress: 3,
    reward: 120,
  },
  {
    id: 'supporter',
    title: 'Supporter',
    description: 'Gift premium features to friends',
    icon: '💎',
    category: 'social',
    maxProgress: 3,
    reward: 200,
  },
  {
    id: 'gift_legendary',
    title: 'Gift Legendary',
    description: 'Gift 1000 credits in total',
    icon: '🌟',
    category: 'social',
    maxProgress: 1000,
    reward: 300,
  },
  {
    id: 'networker',
    title: 'Networker',
    description: 'Connect with 20 other learners',
    icon: '🕸️',
    category: 'social',
    maxProgress: 20,
    reward: 80,
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    description: 'Say thank you to 50 messages',
    icon: '🙏',
    category: 'social',
    maxProgress: 50,
    reward: 40,
  },
  {
    id: 'influencer',
    title: 'Influencer',
    description: 'Get 100 likes on shared content',
    icon: '❤️',
    category: 'social',
    maxProgress: 100,
    reward: 150,
  },

  // Homework Achievements (10)
  {
    id: 'homework_hero',
    title: 'Homework Hero',
    description: 'Generate 5 homework problems',
    icon: '📝',
    category: 'milestone',
    maxProgress: 5,
    reward: 30,
  },
  {
    id: 'ai_master',
    title: 'AI Master',
    description: 'Use homework assistant 20 times',
    icon: '🤖',
    category: 'milestone',
    maxProgress: 20,
    reward: 100,
  },
  {
    id: 'problem_solver',
    title: 'Problem Solver',
    description: 'Solve 50 homework problems',
    icon: '🔬',
    category: 'milestone',
    maxProgress: 50,
    reward: 120,
  },
  {
    id: 'homework_perfectionist',
    title: 'Perfectionist',
    description: 'Get perfect score on 10 homework',
    icon: '✨',
    category: 'milestone',
    maxProgress: 10,
    reward: 200,
  },
  {
    id: 'rapid_fire',
    title: 'Rapid Fire',
    description: 'Complete 10 homework in one day',
    icon: '⚡',
    category: 'milestone',
    maxProgress: 10,
    reward: 250,
  },
  {
    id: 'assistant_loyal',
    title: 'AI Assistant Loyalty',
    description: 'Use AI for 30 consecutive days',
    icon: '🤝',
    category: 'milestone',
    maxProgress: 30,
    reward: 300,
  },
  {
    id: 'late_night',
    title: 'Late Night Study',
    description: 'Use homework after 11 PM 10 times',
    icon: '🌙',
    category: 'milestone',
    maxProgress: 10,
    reward: 50,
  },
  {
    id: 'accuracy_king',
    title: 'Accuracy King',
    description: '90% accuracy on 20 homework',
    icon: '🎯',
    category: 'milestone',
    maxProgress: 20,
    reward: 180,
  },
  {
    id: 'homework_marathon',
    title: 'Homework Marathon',
    description: 'Complete 100 homework in a month',
    icon: '🏃',
    category: 'milestone',
    maxProgress: 100,
    reward: 500,
  },
  {
    id: 'ai_skilled',
    title: 'AI-Skilled',
    description: 'Use all AI features at least once',
    icon: '🛠️',
    category: 'milestone',
    maxProgress: 5,
    reward: 150,
  },

  // Additional Milestone Achievements (6)
  {
    id: 'note_taker',
    title: 'Note Taker',
    description: 'Create 5 notes',
    icon: '🗒️',
    category: 'milestone',
    maxProgress: 5,
    reward: 20,
  },
  {
    id: 'bookmark_hoarder',
    title: 'Bookmark Hoarder',
    description: 'Bookmark 20 items',
    icon: '📌',
    category: 'milestone',
    maxProgress: 20,
    reward: 40,
  },
  {
    id: 'highlighter',
    title: 'Highlighter',
    description: 'Highlight 50 text sections',
    icon: '🖍️',
    category: 'milestone',
    maxProgress: 50,
    reward: 60,
  },
  {
    id: 'voice_power',
    title: 'Voice Power',
    description: 'Use voice input 10 times',
    icon: '🎤',
    category: 'milestone',
    maxProgress: 10,
    reward: 45,
  },
  {
    id: 'analyst_pro',
    title: 'Analytics Pro',
    description: 'View analytics dashboard 20 times',
    icon: '📊',
    category: 'milestone',
    maxProgress: 20,
    reward: 55,
  },
  {
    id: 'top_performer',
    title: 'Top Performer',
    description: 'Reach top 10 in leaderboard',
    icon: '🚀',
    category: 'milestone',
    maxProgress: 1,
    reward: 250,
  },
];

interface AchievementState {
  achievements: Achievement[];
  initialized: boolean;
  
  // Actions
  initializeAchievements: (userId: string) => void;
  getAchievements: (userId: string) => Achievement[];
  getUnlockedAchievements: (userId: string) => Achievement[];
  getProgressAchievements: (userId: string) => Achievement[];
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  unlockAchievement: (userId: string, achievementId: string) => Promise<void>;
  updateAchievementProgress: (userId: string, achievementId: string, progress: number) => Promise<void>;
  claimAchievementReward: (userId: string, achievementId: string) => Promise<number>;
  resetAchievements: () => void;
}

function initializeForUser(baseAchievements: typeof BASE_ACHIEVEMENTS, userId: string): Achievement[] {
  return baseAchievements.map(base => ({
    ...base,
    userId,
    unlockedAt: null,
    progress: 0,
  }));
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],
      initialized: false,

      initializeAchievements: (userId) => {
        if (get().initialized) return;
        
        const initializedAchievements = initializeForUser(BASE_ACHIEVEMENTS, userId);
        set({ 
          achievements: initializedAchievements,
          initialized: true 
        });
      },

      getAchievements: (userId) => {
        if (!get().initialized) {
          get().initializeAchievements(userId);
        }
        return get().achievements;
      },

      getUnlockedAchievements: (userId) => {
        if (!get().initialized) {
          get().initializeAchievements(userId);
        }
        return get().achievements.filter(a => a.unlockedAt !== null);
      },

      getProgressAchievements: (userId) => {
        if (!get().initialized) {
          get().initializeAchievements(userId);
        }
        return get().achievements.filter(a => a.progress > 0 && a.unlockedAt === null);
      },

      getAchievementsByCategory: (category) => {
        return get().achievements.filter(a => a.category === category);
      },

      unlockAchievement: async (userId, achievementId) => {
        const achievements = get().achievements;
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) return;
        
        const achievement = achievements[achievementIndex];
        if (achievement.unlockedAt !== null) return;

        const updatedAchievements = [...achievements];
        const unlockedAt = Date.now();
        
        updatedAchievements[achievementIndex] = {
          ...achievement,
          unlockedAt,
          progress: achievement.maxProgress,
        };

        set({ achievements: updatedAchievements });

        // Handle XP and credit rewards
        const xpStore = useXPStore.getState();
        const creditStore = useCreditsStore.getState();

        if (achievement.xpReward && achievement.xpReward > 0) {
          // Badge system handles XP - integrate or create helper
        }

        // Also give credits
        await creditStore.addCredits(achievement.reward, 'achievement-unlock', `${achievement.icon} ${achievement.title}`);
        
        // Check for related badges
        void useBadgeStore.getState().incrementProgress('achievement_unlock', 1);
        
        // Special streak-related achievements
        if (achievement.category === 'streak') {
          void useBadgeStore.getState().incrementProgress('streak_days', achievement.maxProgress);
        }
      },

      updateAchievementProgress: async (userId, achievementId, progress) => {
        const achievements = get().achievements;
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) return;
        
        const achievement = achievements[achievementIndex];
        if (achievement.unlockedAt !== null) return;

        const newProgress = Math.min(Math.max(0, progress), achievement.maxProgress);
        
        const updatedAchievements = [...achievements];
        updatedAchievements[achievementIndex] = {
          ...achievement,
          progress: newProgress,
        };

        set({ achievements: updatedAchievements });

        // Auto-unlock if progress is complete
        if (newProgress >= achievement.maxProgress) {
          await get().unlockAchievement(userId, achievementId);
        }
      },

      claimAchievementReward: async (userId, achievementId) => {
        const achievements = get().achievements;
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (!achievement || !achievement.unlockedAt) {
          throw new Error('Achievement not unlocked');
        }

        // Check if reward already claimed (could add a claimed flag if needed)
        // For now, always return the reward value
        return achievement.reward;
      },

      resetAchievements: () => {
        set({ 
          achievements: [],
          initialized: false 
        });
      },
    }),
    {
      name: 'learnsmart-achievements',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

// Export all achievements for easy reference
export const ALL_ACHIEVEMENT_IDS = BASE_ACHIEVEMENTS.map(a => a.id);

// Utility functions for common achievement triggers
export function checkLessonCompletedAchievement(userId: string, completedLessons: number) {
  const store = useAchievementStore.getState();
  
  // First lesson
  if (completedLessons === 1) {
    void store.unlockAchievement(userId, 'first_lesson');
  }

  // Chapter progress tracking could be added
}

export async function checkQuizScoreAchievement(userId: string, score: number, achieved: boolean) {
  const store = useAchievementStore.getState();
  
  if (achieved) {
    // Quiz champion (90%+)
    if (score >= 90) {
      void store.unlockAchievement(userId, 'quiz_champion');
    }
    
    // Perfect score
    if (score >= 100) {
      void store.unlockAchievement(userId, 'perfect_score');
    }
  }
}

export async function checkStreakAchievements(userId: string, streakDays: number) {
  const store = useAchievementStore.getState();
  
  // Update progress for streak-related achievements
  const streakAchievements = ['week_warrior', 'two_week_titan', 'month_master', 'unstoppable', 'legendary', 'streak_master'];
  
  for (const achievementId of streakAchievements) {
    void store.updateAchievementProgress(userId, achievementId, streakDays);
  }
  
  // Specific streak milestones
  if (streakDays >= 7) {
    void store.unlockAchievement(userId, 'week_warrior');
  }
  if (streakDays >= 14) {
    void store.unlockAchievement(userId, 'two_week_titan');
  }
  if (streakDays >= 30) {
    void store.unlockAchievement(userId, 'month_master');
  }
  if (streakDays >= 60) {
    void store.unlockAchievement(userId, 'unstoppable');
  }
  if (streakDays >= 100) {
    void store.unlockAchievement(userId, 'legendary');
  }
}

export async function checkHomeworkAchievement(userId: string, generatedCount: number) {
  const store = useAchievementStore.getState();
  
  // Homework hero
  if (generatedCount >= 5) {
    void store.unlockAchievement(userId, 'homework_hero');
  }
  
  // AI master (20 uses)
  if (generatedCount >= 20) {
    void store.unlockAchievement(userId, 'ai_master');
  }
  
  // Update progress
  const progressAchievements = ['concept_crusher', 'knowledge_seeker', 'problem_solver', 'homework_perfectionist'];
  
  for (const achievementId of progressAchievements) {
    void store.updateAchievementProgress(userId, achievementId, generatedCount);
  }
}

// Auto-check achievements on store initialization
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  // Initialize achievements when store is first used
  // This can be enhanced to auto-check based on existing progress
}