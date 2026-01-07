import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAchievementStore } from '@/store/achievementStore';

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  quizzesTaken: number;
  quizzesPassed: number;
  averageQuizScore: number;
  minutesSpent: number;
  creditsEarnd: number;
  creditsUsed: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: number;
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageQuizScore: number;
  totalTestsTaken: number;
  averageTestScore: number;
  totalCreditsUsed: number;
  totalCreditsEarned: number;
  learningTime: number; // in minutes
  streakDays: number;
  topSubject: string | null;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  lessonsCompleted: number;
  quizzesCompleted: number;
  testsCompleted: number;
  averageScore: number;
  learningTime: number; // in minutes
  streakDays: number;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalLessons: number;
  completedLessons: number;
  averageQuizScore: number;
  studyTime: number; // in minutes
  lastStudied: string;
  isActive: boolean;
}

export interface StudentStats {
  userId: string;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalTestsTaken: number;
  averageTestScore: number;
  totalCreditsUsed: number;
  totalCreditsEarned: number;
  learningTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  topSubject: string | null;
  lastActivityDate: string;
  weeklyActivity: DailyActivity[];
  monthlyProgress: MonthlyStats[];
  subjectBreakdown: SubjectProgress[];
  insights: string[];
}

export interface LearningInsights {
  strongestSubject: string | null;
  weakestSubject: string | null;
  bestStudyTime: string | null; // 'morning', 'afternoon', 'evening', 'night'
  productivityTrend: 'improving' | 'stable' | 'declining' | null;
  streakConsistency: string;
  recommendedFocus: string[];
  achievementsThisWeek: number;
  creditsEarnedThisWeek: number;
}

interface AnalyticsState {
  // Activity data
  dailyActivity: Record<string, DailyActivity>;
  weeklyStats: Record<string, WeeklyStats>;
  monthlyStats: Record<string, MonthlyStats>;
  subjectStats: Record<string, SubjectProgress>;
  
  // Computed stats
  totalStats: StudentStats | null;
  
  // Insights
  insights: LearningInsights | null;
  
  // Actions
  trackLessonCompleted: (userId: string, lessonId: string, subjectId: string, subjectName: string, duration: number) => Promise<void>;
  trackQuizCompleted: (userId: string, score: number, passed: boolean, duration: number) => Promise<void>;
  trackTestCompleted: (userId: string, score: number, duration: number) => Promise<void>;
  trackCreditsUsed: (userId: string, amount: number, actionType: string) => Promise<void>;
  trackCreditsEarned: (userId: string, amount: number, source: string) => Promise<void>;
  trackTimeSpent: (userId: string, minutes: number, category?: string) => Promise<void>;
  
  // Getters
  getDailyActivity: (date: string) => DailyActivity | null;
  getWeeklyStats: (weekStart: string) => WeeklyStats | null;
  getMonthlyStats: (month: string) => MonthlyStats | null;
  getStats: (userId: string) => StudentStats;
  getLearningInsights: (userId: string) => LearningInsights;
  calculateLearningInsights: (userId: string) => LearningInsights;
  
  // Analytics helpers
  getStreakConsistency: (userId: string) => number; // percentage
  getBestStudyTime: (userId: string) => string;
  getWeeklyProgress: (userId: string, weeks: number) => Array<{week: string, progress: number}>;
  getSubjectBreakdown: (userId: string) => SubjectProgress[];
  
  // Reset
  resetAnalytics: () => void;
}

// Utility functions
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday
  d.setDate(diff);
  return formatDate(d);
};

const getStudyTimeCategory = (hour: number): string => {
  if (hour < 7) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
};

// Generate insights based on data
const generateInsights = (
  stats: StudentStats,
  weeklyStats: Record<string, WeeklyStats>,
  subjectStats: Record<string, SubjectProgress>
): LearningInsights => {
  const recentWeeks = Object.values(weeklyStats)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-4); // Last 4 weeks

  // Strongest and weakest subjects
  const subjects = Object.values(subjectStats);
  const subjectScores = subjects
    .map(s => ({
      name: s.subjectName,
      score: s.averageQuizScore,
    }))
    .filter(s => s.score > 0);

  const strongestSubject = subjectScores.reduce((a, b) => (a.score > b.score ? a : b), { name: null, score: 0 }).name;
  const weakestSubject = subjectScores.reduce((a, b) => (a.score < b.score ? a : b), { name: null, score: 100 }).name;
  
  let productivityTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentWeeks.length >= 3) {
    const scores = recentWeeks.map(w => w.averageQuizScore).filter(s => s > 0);
    if (scores.length >= 3) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) productivityTrend = 'improving';
      else if (secondAvg < firstAvg - 5) productivityTrend = 'declining';
    }
  }

  // Best study time based on activity
  const timeDistribution: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  stats.weeklyActivity.forEach(day => {
    const hour = new Date(day.date).getHours();
    const category = getStudyTimeCategory(hour);
    timeDistribution[category] += day.minutesSpent;
  });

  const bestStudyTime = Object.entries(timeDistribution)
    .sort(([,a], [,b]) => b - a)[0][0];

  const streakConsistency = stats.currentStreak > 0 ? 'consistent' : 'inconsistent';

  const recommendedFocus: string[] = [];
  if (weakestSubject) {
    recommendedFocus.push(`Focus on ${weakestSubject} - it's your weakest subject`);
  }
  if (stats.currentStreak < 7) {
    recommendedFocus.push('Try to maintain a daily learning streak');
  }
  if (stats.averageQuizScore < 80) {
    recommendedFocus.push('Practice more quizzes to improve your average score');
  }

  const achievementsThisWeek = stats.weeklyActivity
    .filter(a => a.quizzesPassed > 0).length;

  const creditsEarnedThisWeek = stats.weeklyActivity
    .reduce((sum, day) => sum + day.creditsEarnd, 0);

  return {
    strongestSubject,
    weakestSubject,
    bestStudyTime,
    productivityTrend,
    streakConsistency,
    recommendedFocus,
    achievementsThisWeek,
    creditsEarnedThisWeek,
  };
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      dailyActivity: {},
      weeklyStats: {},
      monthlyStats: {},
      subjectStats: {},
      totalStats: null,
      insights: null,

      trackLessonCompleted: async (userId, lessonId, subjectId, subjectName, duration) => {
        const now = new Date();
        const dateKey = formatDate(now);
        const weekStart = getWeekStart(now);
        const monthKey = formatMonth(now);

        set((state) => {
          // Update daily activity
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }
          daily[dateKey].lessonsCompleted += 1;
          daily[dateKey].minutesSpent += duration;

          // Update subject stats
          const subjects = { ...state.subjectStats };
          if (!subjects[subjectId]) {
            subjects[subjectId] = {
              subjectId,
              subjectName,
              totalLessons: 0,
              completedLessons: 0,
              averageQuizScore: 0,
              studyTime: 0,
              lastStudied: dateKey,
              isActive: true,
            };
          }
          subjects[subjectId].completedLessons += 1;
          subjects[subjectId].studyTime += duration;
          subjects[subjectId].lastStudied = dateKey;

          return { dailyActivity: daily, subjectStats: subjects };
        });

        // Update weekly and monthly stats
        await get().trackTimeSpent(userId, duration);
        
        // Check for achievements
        void useAchievementStore.getState().updateAchievementProgress(userId, 'first_lesson', 1);
      },

      trackQuizCompleted: async (userId, score, passed, duration) => {
        const now = new Date();
        const dateKey = formatDate(now);

        set((state) => {
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }

          daily[dateKey].quizzesTaken += 1;
          if (passed) {
            daily[dateKey].quizzesPassed += 1;
          }
          
          // Calculate running average
          const oldTotal = daily[dateKey].quizzesTaken - 1;
          const oldScore = daily[dateKey].averageQuizScore * oldTotal;
          daily[dateKey].averageQuizScore = (oldScore + score) / daily[dateKey].quizzesTaken;

          daily[dateKey].minutesSpent += duration;

          return { dailyActivity: daily };
        });

        // Check for achievements
        if (score >= 90) {
          await useAchievementStore.getState().unlockAchievement(userId, 'quiz_champion');
        }
        if (score >= 100) {
          await useAchievementStore.getState().unlockAchievement(userId, 'perfect_score');
        }

        if (passed) {
          await get().trackCreditsEarned(userId, 5, 'quiz-passed');
        }

        await get().trackTimeSpent(userId, duration);
      },

      trackTestCompleted: async (userId, score, duration) => {
        const now = new Date();
        const dateKey = formatDate(now);

        set((state) => {
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }
          
          if (duration < 5) {
            // Speed demon achievement
            void useAchievementStore.getState().unlockAchievement(userId, 'speed_demon');
          }

          daily[dateKey].minutesSpent += duration;

          return { dailyActivity: daily };
        });

        // Update weekly stats
        const weekStart = getWeekStart(now);
        set((state) => {
          const weekly = { ...state.weeklyStats };
          if (!weekly[weekStart]) {
            weekly[weekStart] = {
              weekStart,
              weekEnd: formatDate(new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)),
              lessonsCompleted: 0,
              totalQuizzesTaken: 0,
              totalQuizzesPassed: 0,
              averageQuizScore: 0,
              totalTestsTaken: 0,
              averageTestScore: 0,
              totalCreditsUsed: 0,
              totalCreditsEarned: 0,
              learningTime: 0,
              streakDays: 0,
              topSubject: null,
            };
          }
          weekly[weekStart].totalTestsTaken += 1;
          weekly[weekStart].averageTestScore = score;

          return { weeklyStats: weekly };
        });

        await get().trackTimeSpent(userId, duration);
        
        if (score >= 100) {
          await useAchievementStore.getState().unlockAchievement(userId, 'perfect_score');
        }
      },

      trackCreditsUsed: async (userId, amount, actionType) => {
        const now = new Date();
        const dateKey = formatDate(now);

        set((state) => {
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }
          daily[dateKey].creditsUsed += amount;
          return { dailyActivity: daily };
        });

        set((state) => {
          const weekly = { ...state.weeklyStats };
          const weekStart = getWeekStart(now);
          if (weekly[weekStart]) {
            weekly[weekStart].totalCreditsUsed += amount;
          }
          return { weeklyStats: weekly };
        });

        if (actionType === 'gift') {
          await useAchievementStore.getState().updateAchievementProgress(userId, 'generous_soul', amount);
          await useAchievementStore.getState().updateAchievementProgress(userId, 'gift_giver', amount / 10);
        }
      },

      trackCreditsEarned: async (userId, amount, source) => {
        const now = new Date();
        const dateKey = formatDate(now);

        set((state) => {
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }
          daily[dateKey].creditsEarnd += amount;
          return { dailyActivity: daily };
        });

        // Update weekly stats
        set((state) => {
          const weekly = { ...state.weeklyStats };
          const weekStart = getWeekStart(now);
          if (weekly[weekStart]) {
            weekly[weekStart].totalCreditsEarned += amount;
          }
          return { weeklyStats: weekly };
        });
      },

      trackTimeSpent: async (userId, minutes, category) => {
        const now = new Date();
        const dateKey = formatDate(now);
        const weekStart = getWeekStart(now);

        set((state) => {
          const daily = { ...state.dailyActivity };
          if (!daily[dateKey]) {
            daily[dateKey] = {
              date: dateKey,
              lessonsCompleted: 0,
              quizzesTaken: 0,
              quizzesPassed: 0,
              averageQuizScore: 0,
              minutesSpent: 0,
              creditsEarnd: 0,
              creditsUsed: 0,
            };
          }
          daily[dateKey].minutesSpent += minutes;

          const weekly = { ...state.weeklyStats };
          if (!weekly[weekStart]) {
            weekly[weekStart] = {
              weekStart,
              weekEnd: formatDate(new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)),
              lessonsCompleted: 0,
              totalQuizzesTaken: 0,
              totalQuizzesPassed: 0,
              averageQuizScore: 0,
              totalTestsTaken: 0,
              averageTestScore: 0,
              totalCreditsUsed: 0,
              totalCreditsEarned: 0,
              learningTime: 0,
              streakDays: 0,
              topSubject: null,
            };
          }
          weekly[weekStart].learningTime += minutes;

          return { dailyActivity: daily, weeklyStats: weekly };
        });

        // Check late night achievements
        const hour = now.getHours();
        if (hour >= 23) {
          void useAchievementStore.getState().updateAchievementProgress(userId, 'late_night', 1);
        }
        if (hour <= 7) {
          void useAchievementStore.getState().updateAchievementProgress(userId, 'early_bird', 1);
        }
      },

      getDailyActivity: (date) => {
        return get().dailyActivity[date] || null;
      },

      getWeeklyStats: (weekStart) => {
        return get().weeklyStats[weekStart] || null;
      },

      getMonthlyStats: (month) => {
        return get().monthlyStats[month] || null;
      },

      getStats: (userId) => {
        const allDaily = Object.values(get().dailyActivity);
        const allWeekly = Object.values(get().weeklyStats);
        const allSubjects = Object.values(get().subjectStats);

        const totalLessonsCompleted = allDaily.reduce((sum, day) => sum + day.lessonsCompleted, 0);
        const totalQuizzesTaken = allDaily.reduce((sum, day) => sum + day.quizzesTaken, 0);
        const totalCreditsUsed = allDaily.reduce((sum, day) => sum + day.creditsUsed, 0);
        const totalCreditsEarned = allDaily.reduce((sum, day) => sum + day.creditsEarnd, 0);
        const learningTime = allDaily.reduce((sum, day) => sum + day.minutesSpent, 0);
        const currentStreak = Math.max(...allDaily.map(d => d.quizzesPassed).filter(Boolean));
        const averageQuizScore = allDaily.reduce((sum, day) => sum + day.averageQuizScore, 0) / allDaily.length || 0;

        const stats: StudentStats = {
          userId,
          totalLessonsCompleted,
          totalQuizzesTaken,
          averageQuizScore,
          totalTestsTaken: allWeekly.reduce((sum, w) => sum + w.totalTestsTaken, 0),
          averageTestScore: allWeekly.reduce((sum, w) => sum + w.averageTestScore, 0) / allWeekly.length || 0,
          totalCreditsUsed,
          totalCreditsEarned,
          learningTime,
          currentStreak: 0, // Would need to integrate with streakStore
          longestStreak: 0,
          topSubject: null,
          lastActivityDate: allDaily.sort((a, b) => b.date.localeCompare(a.date))[0]?.date || '',
          weeklyActivity: allDaily.slice(-30),
          monthlyProgress: [],
          subjectBreakdown: allSubjects,
          insights: [],
        };

        return stats;
      },

      getLearningInsights: (userId) => {
        const stats = get().getStats(userId);
        const insights = generateInsights(stats, get().weeklyStats, get().subjectStats);
        set({ insights });
        return insights;
      },

      calculateLearningInsights: (userId) => {
        return get().getLearningInsights(userId);
      },

      getStreakConsistency: (userId) => {
        const dailyActivity = Object.values(get().dailyActivity);
        const recent = dailyActivity.slice(-30);
        const activeDays = recent.filter(d => d.minutesSpent > 0).length;
        return (activeDays / 30) * 100;
      },

      getBestStudyTime: (userId) => {
        const timeDistribution: Record<string, number> = {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0,
        };

        Object.values(get().dailyActivity).forEach(day => {
          const hour = new Date(day.date).getHours();
          const category = getStudyTimeCategory(hour);
          timeDistribution[category] += day.minutesSpent;
        });

        return Object.entries(timeDistribution)
          .sort(([,a], [,b]) => b - a)[0][0];
      },

      getWeeklyProgress: (userId, weeks) => {
        const allWeekly = Object.values(get().weeklyStats)
          .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
        
        const recentWeeks = allWeekly.slice(-weeks);
        
        return recentWeeks.map(week => ({
          week: week.weekStart,
          progress: week.averageQuizScore,
        }));
      },

      getSubjectBreakdown: (userId) => {
        return Object.values(get().subjectStats);
      },

      resetAnalytics: () => {
        set({
          dailyActivity: {},
          weeklyStats: {},
          monthlyStats: {},
          subjectStats: {},
          totalStats: null,
          insights: null,
        });
      },
    }),
    {
      name: 'learnsmart-analytics',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

// Helper hooks for commonly used analytics data
export function useTotalLearningTime(userId: string): number {
  const analytics = useAnalyticsStore();
  return analytics.getStats(userId).learningTime;
}

export function useWeeklyProgress(userId: string): number {
  const analytics = useAnalyticsStore();
  const weeklyStats = Object.values(analytics.getStats(userId).weeklyActivity).slice(-7);
  return weeklyStats.reduce((sum, day) => sum + day.lessonsCompleted, 0);
}

export function useSubjectProgress(userId: string, subjectId: string): SubjectProgress | null {
  const analytics = useAnalyticsStore();
  return analytics.getStats(userId).subjectBreakdown.find(s => s.subjectId === subjectId) || null;
}