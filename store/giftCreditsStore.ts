import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCreditsStore } from './creditsStore';

export interface GiftCode {
  codeId: string;
  senderUserId: string;
  creditsAmount: number;
  generatedAt: string;
  expiresAt: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  code: string;
}

interface GiftCreditsState {
  giftCodes: GiftCode[];
  
  generateGiftCode: (userId: string, creditsAmount: number) => Promise<GiftCode | null>;
  redeemGiftCode: (userId: string, code: string) => Promise<{ success: boolean; amount?: number; error?: string }>;
  getMyGiftCodes: (userId: string) => GiftCode[];
  getAvailableCreditsForGift: (userId: string) => number;
  validateGiftCode: (code: string) => GiftCode | null;
}

const GIFT_LIMIT_PER_DAY = 30;

export const useGiftCreditsStore = create<GiftCreditsState>()(
  persist(
    (set, get) => ({
      giftCodes: [],
      
      generateGiftCode: async (userId, creditsAmount) => {
        const available = get().getAvailableCreditsForGift(userId);
        if (creditsAmount > available) {
          return null;
        }

        const creditsStore = useCreditsStore.getState();
        if (creditsStore.credits < creditsAmount) {
          return null;
        }

        // Deduct credits from sender
        creditsStore.useCredits(creditsAmount);

        const code = `GFT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const newGiftCode: GiftCode = {
          codeId: Math.random().toString(36).substring(7),
          senderUserId: userId,
          creditsAmount,
          generatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isRedeemed: false,
          code,
        };

        set((state) => ({
          giftCodes: [newGiftCode, ...state.giftCodes],
        }));

        return newGiftCode;
      },
      
      redeemGiftCode: async (userId, code) => {
        const giftCode = get().giftCodes.find(g => g.code.toUpperCase() === code.toUpperCase());
        
        if (!giftCode) {
          return { success: false, error: 'Invalid gift code' };
        }
        
        if (giftCode.isRedeemed) {
          return { success: false, error: 'Code already redeemed' };
        }
        
        if (new Date(giftCode.expiresAt) < new Date()) {
          return { success: false, error: 'Code expired' };
        }

        if (giftCode.senderUserId === userId) {
          return { success: false, error: 'You cannot redeem your own gift code' };
        }

        // Add credits to redeemer
        const creditsStore = useCreditsStore.getState();
        creditsStore.addCredits(giftCode.creditsAmount);

        set((state) => ({
          giftCodes: state.giftCodes.map(g => 
            g.codeId === giftCode.codeId 
              ? { ...g, isRedeemed: true, redeemedBy: userId, redeemedAt: new Date().toISOString() }
              : g
          ),
        }));

        return { success: true, amount: giftCode.creditsAmount };
      },
      
      getMyGiftCodes: (userId) => {
        return get().giftCodes.filter(g => g.senderUserId === userId);
      },
      
      getAvailableCreditsForGift: (userId) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        
        const usedToday = get().giftCodes
          .filter(g => g.senderUserId === userId && g.generatedAt >= today)
          .reduce((acc, curr) => acc + curr.creditsAmount, 0);
          
        return Math.max(0, GIFT_LIMIT_PER_DAY - usedToday);
      },
      
      validateGiftCode: (code) => {
        return get().giftCodes.find(g => g.code.toUpperCase() === code.toUpperCase()) || null;
      },
    }),
    {
      name: 'learnsmart-gift-credits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
