import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SmartCoinType = 'badge-unlock' | 'forum-helpful' | 'achievement' | 'daily-bonus';

export interface SmartCoinEntry {
  id: string;
  type: SmartCoinType;
  amount: number;
  timestamp: number;
  description: string;
}

interface SmartCoinState {
  balance: number;
  history: SmartCoinEntry[];

  addCoins: (amount: number, type: SmartCoinType, description: string) => void;
  subtractCoins: (amount: number, reason: string) => Promise<boolean>;
  getBalance: () => number;
  getHistory: (limit?: number) => SmartCoinEntry[];

  resetAll: () => void;
}

const generateId = (): string => `coin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useSmartCoinStore = create<SmartCoinState>()(
  persist(
    (set, get) => ({
      balance: 0,
      history: [],

      addCoins: (amount, type, description) => {
        const value = Math.round(amount);
        if (!Number.isFinite(value) || value === 0) return;

        const entry: SmartCoinEntry = {
          id: generateId(),
          type,
          amount: value,
          timestamp: Date.now(),
          description,
        };

        set((state) => ({
          balance: Math.max(0, state.balance + value),
          history: [entry, ...state.history].slice(0, 800),
        }));
      },

      subtractCoins: async (amount, reason) => {
        const value = Math.round(amount);
        if (!Number.isFinite(value) || value <= 0) return false;

        const current = get().balance;
        if (current < value) return false;

        const entry: SmartCoinEntry = {
          id: generateId(),
          type: 'achievement',
          amount: -value,
          timestamp: Date.now(),
          description: reason,
        };

        set((state) => ({
          balance: Math.max(0, state.balance - value),
          history: [entry, ...state.history].slice(0, 800),
        }));

        return true;
      },

      getBalance: () => get().balance,
      getHistory: (limit) => {
        const history = get().history;
        if (!limit) return history;
        return history.slice(0, limit);
      },

      resetAll: () => {
        set({ balance: 0, history: [] });
      },
    }),
    {
      name: 'learnsmart-smartcoins',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
