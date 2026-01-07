import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAchievementStore } from '@/store/achievementStore';

export type LeaderboardType = 'weekly' | 'monthly' | 'allTime';

export interface UserScore {
  userId: string;
  username: string;
  avatar?: string;
  currentRank: number;
  totalPoints: number;
  streakPoints: number;
  achievementPoints: number;
  creditsUsed: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  lastActive: string;
}

export interface UserRank {
  userId: string;
  rank: number;
  totalPoints: number;
  pointsToNextRank?: number;
  isInTopX?: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  rank: number;
  points: number;
  streakDays: number;
  badgesCount: number;
  lastActive: string;
}

interface LeaderboardState {
  weeklyLeaderboard: Record<string, UserScore>;
  monthlyLeaderboard: Record<string, UserScore>;
  allTimeLeaderboard: Record<string, UserScore>;
  
  // Current user rankings
  userWeeklyRank: UserRank | null;
  userMonthlyRank: UserRank | null;
  userAllTimeRank: UserRank | null;
  
  // Methods
  updateUserScore: (userId: string, data: Partial<UserScore>) => Promise<void>;
  getLeaderboard: (type: LeaderboardType, limit?: number) => LeaderboardEntry[];
  getUserRank: (userId: string, type: LeaderboardType) => UserRank | null;
  isUserInTopX: (userId: string, type: LeaderboardType, X: number) => boolean;
  recalculateAllRanks: () => void;
  getLeaderboardStats: (userId: string) => {
    weeklyRank: UserRank | null;
    monthlyRank: UserRank | null;
    allTimeRank: UserRank | null;
  };
  resetLeaderboards: () => void;
}

// Scoring system configuration
const SCORING_CONFIG = {
  perLessonCompleted: 10,
  perQuizPassed: 20,
  perTest90Plus: 50,
  perAchievement: 30, // Average per achievement
  perStreakDay: 5, // Per day of current streak
  perGiftSent: 5,
  streakBonus: {
    7: 10,
    30: 50,
    100: 150,
  },
};

// Reset schedule
const RESET_SCHEDULE = {
  weekly: {
    getResetTime: () => {
      const now = new Date();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - now.getDay() + 7);
      sunday.setHours(0, 0, 0, 0);
      return sunday.getTime();
    },
    shouldReset: (lastReset: number) => {
      const now = new Date().getTime();
      const resetTime = RESET_SCHEDULE.weekly.getResetTime();
      return now >= resetTime && lastReset < resetTime;
    },
  },
  monthly: {
    getResetTime: () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.getTime();
    },
    shouldReset: (lastReset: number) => {
      const now = new Date().getTime();
      const resetTime = RESET_SCHEDULE.monthly.getResetTime();
      return now >= resetTime && lastReset < resetTime;
    },
  },
};

const calculatePoints = (
  lessonsCompleted: number = 0,
  quizzesPassed: number = 0,
  creditsUsed: number = 0,
  streakDays: number = 0,
  badgesCount: number = 0,
  achievementsCount: number = 0
): number => {
  let points = 0;

  // Base points
  points += lessonsCompleted * SCORING_CONFIG.perLessonCompleted;
  points += quizzesPassed * SCORING_CONFIG.perQuizPassed;
  points += Math.floor(creditsUsed / 10) * 5;

  // Streak bonus
  if (streakDays >= 7) points += SCORING_CONFIG.streakBonus[7];
  if (streakDays >= 30) points += SCORING_CONFIG.streakBonus[30];
  if (streakDays >= 100) points += SCORING_CONFIG.streakBonus[100];

  // Points for streak days
  points += streakDays * SCORING_CONFIG.perStreakDay;

  // Achievement and badge points
  points += badgesCount * SCORING_CONFIG.perAchievement;
  points += achievementsCount * SCORING_CONFIG.perAchievement;

  return points;
};

function sortAndRank(leaderboard: Record<string, UserScore>): LeaderboardEntry[] {
  const entries = Object.entries(leaderboard)
    .map(([userId, data]) => ({
      userId,
      username: data.username,
      avatar: data.avatar,
      rank: 0, // Will be set by sorting
      points: data.totalPoints,
      streakDays: data.streakPoints / SCORING_CONFIG.perStreakDay,
      badgesCount: data.achievements?.length || 0,
      lastActive: data.lastActive,
    }))
    .sort((a, b) => b.points - a.points);

  // Assign ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      weeklyLeaderboard: {},
      monthlyLeaderboard: {},
      allTimeLeaderboard: {},
      userWeeklyRank: null,
      userMonthlyRank: null,
      userAllTimeRank: null,

      updateUserScore: async (userId, data) => {
        const now = new Date().toISOString();
        const { weeklyLeaderboard, monthlyLeaderboard, allTimeLeaderboard } = get();

        // Update weekly leaderboard
        const weeklyEntry = weeklyLeaderboard[userId] || {
          userId,
          username: data.username || 'User',
          totalPoints: 0,
          streakPoints: 0,
          achievementPoints: 0,
          creditsUsed: 0,
          lessonsCompleted: 0,
          quizzesPassed: 0,
          lastActive: now,
        };

        const updatedWeeklyEntry = { ...weeklyEntry, ...data, lastActive: now };
        updatedWeeklyEntry.totalPoints = calculatePoints(
          updatedWeeklyEntry.lessonsCompleted,
          updatedWeeklyEntry.quizzesPassed,
          updatedWeeklyEntry.creditsUsed,
          updatedWeeklyEntry.streakPoints / SCORING_CONFIG.perStreakDay,
          updatedWeeklyEntry.badgesCount || 0,
          updatedWeeklyEntry.achievementsCount || 0
        );

        // Update monthly leaderboard
        const monthlyEntry = monthlyLeaderboard[userId] || {
          userId,
          username: data.username || 'User',
          totalPoints: 0,
          streakPoints: 0,
          achievementPoints: 0,
          creditsUsed: 0,
          lessonsCompleted: 0,
          quizzesPassed: 0,
          lastActive: now,
        };

        const updatedMonthlyEntry = { ...monthlyEntry, ...data, lastActive: now };
        updatedMonthlyEntry.totalPoints = calculatePoints(
          updatedMonthlyEntry.lessonsCompleted,
          updatedMonthlyEntry.quizzesPassed,
          updatedMonthlyEntry.creditsUsed,
          updatedMonthlyEntry.streakPoints / SCORING_CONFIG.perStreakDay,
          updatedMonthlyEntry.badgesCount || 0,
          updatedMonthlyEntry.achievementsCount || 0
        );

        // Update all-time leaderboard
        const allTimeEntry = allTimeLeaderboard[userId] || {
          userId,
          username: data.username || 'User',
          totalPoints: 0,
          streakPoints: 0,
          achievementPoints: 0,
          creditsUsed: 0,
          lessonsCompleted: 0,
          quizzesPassed: 0,
          lastActive: now,
        };

        const updatedAllTimeEntry = { ...allTimeEntry, ...data, lastActive: now };
        updatedAllTimeEntry.totalPoints = calculatePoints(
          updatedAllTimeEntry.lessonsCompleted,
          updatedAllTimeEntry.quizzesPassed,
          updatedAllTimeEntry.creditsUsed,
          updatedAllTimeEntry.streakPoints / SCORING_CONFIG.perStreakDay,
          updatedAllTimeEntry.badgesCount || 0,
          updatedAllTimeEntry.achievementsCount || 0
        );

        // Re-rank all leaderboards
        const newWeekly = { ...weeklyLeaderboard, [userId]: updatedWeeklyEntry };
        const newMonthly = { ...monthlyLeaderboard, [userId]: updatedMonthlyEntry };
        const newAllTime = { ...allTimeLeaderboard, [userId]: updatedAllTimeEntry };

        // Update user ranks
        const weeklyRank = get().getUserRank(userId, 'weekly');
        const monthlyRank = get().getUserRank(userId, 'monthly');
        const allTimeRank = get().getUserRank(userId, 'allTime');

        set({
          weeklyLeaderboard: newWeekly,
          monthlyLeaderboard: newMonthly,
          allTimeLeaderboard: newAllTime,
          userWeeklyRank: weeklyRank,
          userMonthlyRank: monthlyRank,
          userAllTimeRank: allTimeRank,
        });

        // Check for leaderboard achievements
        if (weeklyRank && weeklyRank.rank <= 10) {
          await useAchievementStore.getState().unlockAchievement(userId, 'top_performer');
        }
      },

      getLeaderboard: (type, limit = 100) => {
        let data: Record<string, UserScore>;
        
        switch (type) {
          case 'weekly':
            data = get().weeklyLeaderboard;
            break;
          case 'monthly':
            data = get().monthlyLeaderboard;
            break;
          case 'allTime':
            data = get().allTimeLeaderboard;
            break;
          default:
            data = get().weeklyLeaderboard;
        }

        return sortAndRank(data).slice(0, limit);
      },

      getUserRank: (userId, type) => {
        const leaderboard = get().getLeaderboard(type);
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        
        if (!userEntry) return null;

        const rank = userEntry.rank;
        const pointsToNextRank = rank > 1 
          ? leaderboard[rank - 2].points - userEntry.points
          : undefined;

        return {
          userId,
          rank,
          totalPoints: userEntry.points,
          pointsToNextRank,
          isInTopX: rank <= 100,
        };
      },

      isUserInTopX: (userId, type, X) => {
        const rank = get().getUserRank(userId, type);
        return rank !== null && rank.rank <= X;
      },

      recalculateAllRanks: () => {
        // Force recalculation by calling set with current state
        const { weeklyLeaderboard, monthlyLeaderboard, allTimeLeaderboard } = get();
        
        // Recalculate ranks
        const recalculatedWeekly = { ...weeklyLeaderboard };
        const recalculatedMonthly = { ...monthlyLeaderboard };
        const recalculatedAllTime = { ...allTimeLeaderboard };

        set({
          weeklyLeaderboard: recalculatedWeekly,
          monthlyLeaderboard: recalculatedMonthly,
          allTimeLeaderboard: recalculatedAllTime,
        });
      },

      getLeaderboardStats: (userId) => {
        return {
          weeklyRank: get().getUserRank(userId, 'weekly'),
          monthlyRank: get().getUserRank(userId, 'monthly'),
          allTimeRank: get().getUserRank(userId, 'allTime'),
        };
      },

      resetLeaderboards: () => {
        set({
          weeklyLeaderboard: {},
          monthlyLeaderboard: {},
          allTimeLeaderboard: {},
          userWeeklyRank: null,
          userMonthlyRank: null,
          userAllTimeRank: null,
        });
      },
    }),
    {
      name: 'learnsmart-leaderboard',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

// Helper function to update leaderboard scores from other stores
export function updateLeaderboardFromActivity(
  userId: string,
  username: string,
  data: {
    lessonsCompleted?: number;
    quizzesPassed?: number;
    creditsUsed?: number;
    streakDays?: number;
    badgesCount?: number;
    achievementsCount?: number;
  }
) {
  return useLeaderboardStore.getState().updateUserScore(userId, {
    username,
    lessonsCompleted: data.lessonsCompleted,
    quizzesPassed: data.quizzesPassed,
    creditsUsed: data.creditsUsed,
    streakPoints: (data.streakDays || 0) * 5,
    badgesCount: data.badgesCount,
    achievementsCount: data.achievementsCount,
  });
}

// Auto-participation in weekly/monthly leaderboards
export function participateInLeaderboard(userId: string, username: string) {
  return useLeaderboardStore.getState().updateUserScore(userId, {
    username,
  });
}