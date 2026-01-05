import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userId: string | null;
  name: string | null;
  class: string | null;
  stream: string | null; // Science/Commerce/Arts
  avatar: string | null;
  xp: number;
  smartCoins: number;
  streak: number;
  lastActiveDate: string | null;
  completedLessons: string[];
  imageReadCount: number;
  imageReadResetTime: string;
  
  // Actions
  setUser: (data: Partial<UserState>) => void;
  addXP: (amount: number) => void;
  addSmartCoins: (amount: number) => void;
  incrementStreak: () => void;
  markLessonComplete: (lessonId: string) => void;
  trackImageRead: () => void;
  resetDailyLimits: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      name: null,
      class: null,
      stream: null,
      avatar: null,
      xp: 0,
      smartCoins: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      imageReadCount: 0,
      imageReadResetTime: new Date().toISOString(),
      
      setUser: (data) => set((state) => {
        const newState = { ...state, ...data };
        // Generate userId if first time
        if (!state.userId && data.name) {
          newState.userId = `user_${Date.now()}`;
        }
        return newState;
      }),
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      addSmartCoins: (amount) => set((state) => ({ smartCoins: state.smartCoins + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      markLessonComplete: (lessonId) => set((state) => ({
        completedLessons: [...state.completedLessons, lessonId],
      })),
      trackImageRead: () => set((state) => ({
        imageReadCount: state.imageReadCount + 1,
      })),
      resetDailyLimits: () => set({
        imageReadCount: 0,
        imageReadResetTime: new Date().toISOString(),
      }),
    }),
    {
      name: 'learnsmart-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
