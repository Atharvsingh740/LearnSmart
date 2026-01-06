import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayAt1AM } from '@/utils/dailyLimitChecker';
import { useRankStore } from '@/store/rankStore';

export type XPType =
  | 'quiz-correct'
  | 'quiz-streak'
  | 'difficulty-multiplier'
  | 'forum-helpful'
  | 'badge-unlock'
  | 'daily-streak';

export interface XPEntry {
  id: string;
  type: XPType;
  amount: number;
  timestamp: number;
  description: string;
}

export interface XPGainBatch {
  amount: number;
  entries: XPEntry[];
  timestamp: number;
}

interface XPState {
  totalXP: number;
  dailyXP: number;
  lastDailyReset: number;
  xpHistory: XPEntry[];

  lastGainBatch: XPGainBatch | null;

  addXP: (amount: number, type: XPType, description: string) => Promise<void>;
  addXPBatch: (items: Array<{ amount: number; type: XPType; description: string }>) => Promise<void>;

  getTotalXP: () => number;
  getDailyXP: () => number;
  getXPHistory: (limit?: number) => XPEntry[];

  resetDailyXP: () => void;
  consumeLastGainBatch: () => XPGainBatch | null;

  resetAll: () => void;
}

const generateId = (): string => `xp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ensureDailyReset = (state: Pick<XPState, 'dailyXP' | 'lastDailyReset'>) => {
  const now = Date.now();
  const today1AM = getTodayAt1AM(now);
  if (now > today1AM && state.lastDailyReset < today1AM) {
    return {
      dailyXP: 0,
      lastDailyReset: today1AM,
    };
  }
  return null;
};

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      dailyXP: 0,
      lastDailyReset: getTodayAt1AM(Date.now()),
      xpHistory: [],
      lastGainBatch: null,

      addXP: async (amount, type, description) => {
        await get().addXPBatch([{ amount, type, description }]);
      },

      addXPBatch: async (items) => {
        const sanitized = items.filter((i) => Number.isFinite(i.amount) && i.amount !== 0);
        if (sanitized.length === 0) return;

        const reset = ensureDailyReset(get());

        const timestamp = Date.now();
        const entries: XPEntry[] = sanitized.map((item) => ({
          id: generateId(),
          type: item.type,
          amount: Math.round(item.amount),
          timestamp,
          description: item.description,
        }));

        const amount = entries.reduce((sum, e) => sum + e.amount, 0);

        set((state) => {
          const nextTotalXP = state.totalXP + amount;
          const dailyBase = reset ? reset.dailyXP : state.dailyXP;
          const lastDailyReset = reset ? reset.lastDailyReset : state.lastDailyReset;

          const prev = state.lastGainBatch;
          const merged: XPGainBatch =
            prev && timestamp - prev.timestamp < 800
              ? {
                  amount: prev.amount + amount,
                  entries: [...prev.entries, ...entries],
                  timestamp,
                }
              : { amount, entries, timestamp };

          return {
            totalXP: nextTotalXP,
            dailyXP: dailyBase + amount,
            lastDailyReset,
            xpHistory: [...entries, ...state.xpHistory].slice(0, 800),
            lastGainBatch: merged,
          };
        });

        const totalXP = get().totalXP;
        useRankStore.getState().updateFromXP(totalXP);
      },

      getTotalXP: () => get().totalXP,

      getDailyXP: () => {
        const reset = ensureDailyReset(get());
        if (reset) {
          set(reset);
          return 0;
        }
        return get().dailyXP;
      },

      getXPHistory: (limit) => {
        const history = get().xpHistory;
        if (!limit) return history;
        return history.slice(0, limit);
      },

      resetDailyXP: () => {
        set({ dailyXP: 0, lastDailyReset: getTodayAt1AM(Date.now()) });
      },

      consumeLastGainBatch: () => {
        const batch = get().lastGainBatch;
        if (!batch) return null;
        set({ lastGainBatch: null });
        return batch;
      },

      resetAll: () => {
        set({
          totalXP: 0,
          dailyXP: 0,
          lastDailyReset: getTodayAt1AM(Date.now()),
          xpHistory: [],
          lastGainBatch: null,
        });
        useRankStore.getState().resetAll();
      },
    }),
    {
      name: 'learnsmart-xp',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
