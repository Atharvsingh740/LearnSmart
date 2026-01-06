import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSmartCoinStore } from '@/store/smartCoinStore';
import { useXPStore } from '@/store/xpStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useAvatarStore } from '@/store/avatarStore';

export interface StreakData {
  current: number;
  longest: number;
  lastActivityDate: number;
  streakProtectionActive: boolean;
  streakProtectionExpiresAt?: number;
  calendar: Record<string, boolean>; // YYYY-MM-DD
}

interface StreakState {
  streak: StreakData;

  updateStreak: () => void;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getStreakCalendar: () => Record<string, boolean>;

  activateStreakProtection: () => Promise<boolean>;
  checkStreakProtection: () => boolean;

  resetAll: () => void;
}

const formatDateKey = (time: number): string => {
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const startOfDay = (time: number): number => {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const diffDays = (a: number, b: number): number => {
  const da = startOfDay(a);
  const db = startOfDay(b);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      streak: {
        current: 0,
        longest: 0,
        lastActivityDate: 0,
        streakProtectionActive: false,
        streakProtectionExpiresAt: undefined,
        calendar: {},
      },

      updateStreak: () => {
        const now = Date.now();
        const todayKey = formatDateKey(now);
        const state = get().streak;

        const last = state.lastActivityDate;
        const alreadyToday = last > 0 && formatDateKey(last) === todayKey;

        set((s) => ({
          streak: {
            ...s.streak,
            calendar: { ...s.streak.calendar, [todayKey]: true },
          },
        }));

        if (alreadyToday) return;

        let nextCurrent = 1;
        let usedProtection = false;

        if (last > 0) {
          const d = diffDays(last, now);

          if (d === 1) {
            nextCurrent = Math.max(1, state.current + 1);
          } else if (d === 2 && get().checkStreakProtection()) {
            nextCurrent = Math.max(1, state.current + 1);
            usedProtection = true;
          } else {
            nextCurrent = 1;
          }
        }

        const nextLongest = Math.max(state.longest, nextCurrent);

        set((s) => ({
          streak: {
            ...s.streak,
            current: nextCurrent,
            longest: nextLongest,
            lastActivityDate: now,
            streakProtectionActive: usedProtection ? false : s.streak.streakProtectionActive,
            streakProtectionExpiresAt: usedProtection ? undefined : s.streak.streakProtectionExpiresAt,
          },
        }));

        if (last > 0) {
          const d = diffDays(last, now);
          if (d === 1 || (d === 2 && usedProtection)) {
            void useXPStore
              .getState()
              .addXP(25, 'daily-streak', `Daily streak maintained (${nextCurrent} days)`);
            useSmartCoinStore
              .getState()
              .addCoins(2, 'daily-bonus', `Daily streak bonus (${nextCurrent} days)`);
          }
        }

        void useBadgeStore.getState().checkAndUnlockBadges('streak_days', nextCurrent);

        if (nextCurrent === 7) {
          useAvatarStore.getState().grantCosmetic('bg-forest');
        }
        if (nextCurrent === 30) {
          useAvatarStore.getState().grantCosmetic('bg-mountain');
        }
        if (nextCurrent === 100) {
          useAvatarStore.getState().grantCosmetic('bg-aurora');
        }
      },

      getCurrentStreak: () => get().streak.current,
      getLongestStreak: () => get().streak.longest,
      getStreakCalendar: () => get().streak.calendar,

      activateStreakProtection: async () => {
        const { streak } = get();
        if (streak.current < 7) return false;
        if (get().checkStreakProtection()) return false;

        const ok = await useSmartCoinStore.getState().subtractCoins(50, 'Streak protection purchase');
        if (!ok) return false;

        set((state) => ({
          streak: {
            ...state.streak,
            streakProtectionActive: true,
            streakProtectionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        }));

        return true;
      },

      checkStreakProtection: () => {
        const { streak } = get();
        if (!streak.streakProtectionActive || !streak.streakProtectionExpiresAt) return false;
        return streak.streakProtectionExpiresAt > Date.now();
      },

      resetAll: () => {
        set({
          streak: {
            current: 0,
            longest: 0,
            lastActivityDate: 0,
            streakProtectionActive: false,
            streakProtectionExpiresAt: undefined,
            calendar: {},
          },
        });
      },
    }),
    {
      name: 'learnsmart-streak',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
