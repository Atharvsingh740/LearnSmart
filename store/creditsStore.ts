import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface CreditsState {
  credits: number;
  lastLoginDate: string | null;
  firstLoginCompleted: boolean;
  dailySessionMinutes: number;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate: string | null;
  sessionStartTime: string | null;

  // Actions
  getCredits: () => number;
  deductCredit: (amount: number) => Promise<boolean>;
  resetDailyCredits: () => Promise<void>;
  addDailyBonus: () => Promise<void>;
  addFirstLoginBonus: () => Promise<void>;
  getSessionTimeToday: () => number;
  addSessionTime: (minutes: number) => Promise<void>;
  canContinueSession: () => boolean;
  isSubscriptionActive: () => boolean;
  upgradeSubscription: (tier: SubscriptionTier, endDate: string) => Promise<void>;
  getDailyCreditLimit: () => number;
  getSessionTimeLimit: () => number;
  startSession: () => void;
  endSession: () => void;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
}

const DAILY_SESSION_LIMIT = 90; // 90 minutes for free tier
const DAILY_SESSION_LIMIT_PREMIUM = 24 * 60; // 24 hours for premium

const DAILY_CREDIT_BONUS = 30;
const DAILY_CREDIT_PREMIUM = 100;
const DAILY_CREDIT_YEARLY = 500;

const FIRST_LOGIN_BONUS = 50;

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      credits: 0,
      lastLoginDate: null,
      firstLoginCompleted: false,
      dailySessionMinutes: 0,
      subscriptionTier: 'free',
      subscriptionEndDate: null,
      sessionStartTime: null,

      getCredits: () => get().credits,

      deductCredit: async (amount: number) => {
        const state = get();
        if (state.credits >= amount) {
          set({ credits: state.credits - amount });
          return true;
        }
        return false;
      },

      resetDailyCredits: async () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const state = get();
        
        // Skip if already reset today
        if (state.lastLoginDate === today) return;

        const dailyLimit = get().getDailyCreditLimit();
        set({
          lastLoginDate: today,
          dailySessionMinutes: 0,
          credits: Math.min(state.credits, dailyLimit), // Keep premium excess credits
        });

        // Apply daily bonus
        await get().addDailyBonus();
      },

      addDailyBonus: async () => {
        const dailyLimit = get().getDailyCreditLimit();
        set((state) => ({
          credits: Math.min(state.credits + DAILY_CREDIT_BONUS, dailyLimit),
        }));
      },

      addFirstLoginBonus: async () => {
        const state = get();
        if (!state.firstLoginCompleted) {
          set({
            credits: state.credits + FIRST_LOGIN_BONUS,
            firstLoginCompleted: true,
          });
        }
      },

      getSessionTimeToday: () => {
        return get().dailySessionMinutes;
      },

      addSessionTime: async (minutes: number) => {
        set((state) => ({
          dailySessionMinutes: state.dailySessionMinutes + minutes,
        }));
      },

      canContinueSession: () => {
        const state = get();
        const limit = get().getSessionTimeLimit();
        return state.dailySessionMinutes < limit;
      },

      isSubscriptionActive: () => {
        const state = get();
        if (state.subscriptionTier === 'free') return false;
        
        if (!state.subscriptionEndDate) return false;
        
        const endDate = new Date(state.subscriptionEndDate);
        const now = new Date();
        return endDate > now;
      },

      upgradeSubscription: async (tier: SubscriptionTier, endDate: string) => {
        set({
          subscriptionTier: tier,
          subscriptionEndDate: endDate,
          credits: get().getDailyCreditLimit(), // Reset with new tier limit
        });
      },

      getDailyCreditLimit: () => {
        const tier = get().subscriptionTier;
        switch (tier) {
          case 'monthly': return DAILY_CREDIT_PREMIUM;
          case 'yearly': return DAILY_CREDIT_YEARLY;
          case 'free':
          default:
            return DAILY_CREDIT_BONUS;
        }
      },

      getSessionTimeLimit: () => {
        const state = get();
        if (state.subscriptionTier === 'free') return DAILY_SESSION_LIMIT;
        return DAILY_SESSION_LIMIT_PREMIUM;
      },

      startSession: () => {
        set({ sessionStartTime: new Date().toISOString() });
      },

      endSession: () => {
        const state = get();
        if (state.sessionStartTime) {
          const startTime = new Date(state.sessionStartTime);
          const endTime = new Date();
          const sessionDuration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
          
          if (sessionDuration > 0) {
            get().addSessionTime(sessionDuration);
          }
        }
        set({ sessionStartTime: null });
      },

      addCredits: (amount: number) => {
        set((state) => ({ credits: state.credits + amount }));
      },

      useCredits: (amount: number) => {
        const state = get();
        if (state.credits >= amount) {
          set({ credits: state.credits - amount });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'learnsmart-credits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize credits check on app load
export const initializeCredits = async () => {
  const store = useCreditsStore.getState();
  
  // Check if first login
  if (!store.firstLoginCompleted) {
    await store.addFirstLoginBonus();
  }
  
  // Check daily reset
  await store.resetDailyCredits();
};

// Auto-check daily reset every 10 minutes when app is in foreground
setInterval(() => {
  const store = useCreditsStore.getState();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  if (store.lastLoginDate !== today) {
    store.resetDailyCredits();
  }
}, 10 * 60 * 1000);