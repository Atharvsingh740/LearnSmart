import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXPStore } from '@/store/xpStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AvatarCustomization {
  baseCharacter: 'boy' | 'girl';
  skinTone: 'light' | 'medium' | 'dark';
  outfit: string;
  accessories: string[];
  background: string;
  expression: 'happy' | 'neutral' | 'thinking';
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'outfit' | 'accessory' | 'background';
  cost: number;
  costType: 'xp' | 'coins';
  rarity: BadgeRarity;
  unlockedAt?: number;
  unlockNote?: string;
  purchaseable?: boolean;
}

export const COSMETICS_CATALOG: CosmeticItem[] = [
  // Outfits (XP)
  { id: 'outfit-uniform', name: 'School Uniform', type: 'outfit', cost: 50, costType: 'xp', rarity: 'common', purchaseable: true },
  { id: 'outfit-casual', name: 'Casual', type: 'outfit', cost: 75, costType: 'xp', rarity: 'common', purchaseable: true },
  { id: 'outfit-scientist', name: 'Scientist Coat', type: 'outfit', cost: 250, costType: 'xp', rarity: 'rare', purchaseable: true },
  { id: 'outfit-superhero', name: 'Superhero', type: 'outfit', cost: 500, costType: 'xp', rarity: 'epic', purchaseable: true },
  { id: 'outfit-knight', name: 'Knight', type: 'outfit', cost: 750, costType: 'xp', rarity: 'epic', purchaseable: true },
  { id: 'outfit-astronaut', name: 'Astronaut', type: 'outfit', cost: 1000, costType: 'xp', rarity: 'legendary', purchaseable: true },
  { id: 'outfit-wizard', name: 'Wizard', type: 'outfit', cost: 1500, costType: 'xp', rarity: 'legendary', purchaseable: true },
  { id: 'outfit-pirate', name: 'Pirate', type: 'outfit', cost: 800, costType: 'xp', rarity: 'rare', purchaseable: true },

  // Accessories (Coins)
  { id: 'acc-glasses', name: 'Reading Glasses', type: 'accessory', cost: 10, costType: 'coins', rarity: 'common', purchaseable: true },
  { id: 'acc-headphones', name: 'Headphones', type: 'accessory', cost: 20, costType: 'coins', rarity: 'rare', purchaseable: true },
  { id: 'acc-backpack', name: 'Backpack', type: 'accessory', cost: 15, costType: 'coins', rarity: 'common', purchaseable: true },
  { id: 'acc-crown', name: 'Crown', type: 'accessory', cost: 25, costType: 'coins', rarity: 'rare', purchaseable: true },
  { id: 'acc-gradcap', name: 'Graduation Cap', type: 'accessory', cost: 30, costType: 'coins', rarity: 'rare', purchaseable: true },
  { id: 'acc-medal', name: 'Medal', type: 'accessory', cost: 40, costType: 'coins', rarity: 'epic', purchaseable: true },
  { id: 'acc-halo', name: 'Halo', type: 'accessory', cost: 50, costType: 'coins', rarity: 'legendary', purchaseable: true },
  { id: 'acc-wings', name: 'Wings', type: 'accessory', cost: 75, costType: 'coins', rarity: 'legendary', purchaseable: true },

  // Backgrounds (Granted by badges/milestones)
  { id: 'bg-library', name: 'Library', type: 'background', cost: 0, costType: 'xp', rarity: 'rare', purchaseable: false, unlockNote: 'Unlocked by Quiz Master badge' },
  { id: 'bg-forest', name: 'Forest', type: 'background', cost: 0, costType: 'xp', rarity: 'rare', purchaseable: false, unlockNote: 'Unlocked at 7-day streak' },
  { id: 'bg-space', name: 'Space', type: 'background', cost: 0, costType: 'xp', rarity: 'epic', purchaseable: false, unlockNote: 'Unlocked by Speed Runner badge' },
  { id: 'bg-beach', name: 'Beach', type: 'background', cost: 0, costType: 'xp', rarity: 'epic', purchaseable: false, unlockNote: 'Unlocked by Community Star badge' },
  { id: 'bg-classroom', name: 'Classroom', type: 'background', cost: 0, costType: 'xp', rarity: 'common', purchaseable: false, unlockNote: 'Unlocked by Helper badge' },
  { id: 'bg-mountain', name: 'Mountain', type: 'background', cost: 0, costType: 'xp', rarity: 'rare', purchaseable: false, unlockNote: 'Unlocked at 30-day streak' },
  { id: 'bg-sunset', name: 'Sunset', type: 'background', cost: 0, costType: 'xp', rarity: 'rare', purchaseable: false, unlockNote: 'Unlocked by Expert badge' },
  { id: 'bg-aurora', name: 'Aurora', type: 'background', cost: 0, costType: 'xp', rarity: 'legendary', purchaseable: false, unlockNote: 'Unlocked at 100-day streak' },
];

export interface AvatarState {
  customization: AvatarCustomization;
  unlockedCosmetics: CosmeticItem[];
  equippedCosmetics: string[];

  updateCustomization: (updates: Partial<AvatarCustomization>) => void;
  unlockCosmetic: (cosmeticId: string) => Promise<boolean>;
  equipCosmetic: (cosmeticId: string) => void;
  removeCosmetic: (cosmeticId: string) => void;

  grantCosmetic: (cosmeticId: string) => void;
  isUnlocked: (cosmeticId: string) => boolean;

  resetAll: () => void;
}

const defaultCustomization: AvatarCustomization = {
  baseCharacter: 'boy',
  skinTone: 'medium',
  outfit: '',
  accessories: [],
  background: '',
  expression: 'happy',
};

const mergeUnique = (arr: string[], id: string): string[] => (arr.includes(id) ? arr : [...arr, id]);

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      customization: defaultCustomization,
      unlockedCosmetics: [],
      equippedCosmetics: [],

      updateCustomization: (updates) => {
        set((state) => ({ customization: { ...state.customization, ...updates } }));
      },

      isUnlocked: (cosmeticId) => {
        return get().unlockedCosmetics.some((c) => c.id === cosmeticId);
      },

      grantCosmetic: (cosmeticId) => {
        const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
        if (!item) return;
        if (get().isUnlocked(cosmeticId)) return;

        const unlocked: CosmeticItem = { ...item, unlockedAt: Date.now() };
        set((state) => ({
          unlockedCosmetics: [unlocked, ...state.unlockedCosmetics],
        }));
      },

      unlockCosmetic: async (cosmeticId) => {
        const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
        if (!item) return false;
        if (get().isUnlocked(cosmeticId)) return true;

        if (item.purchaseable === false) {
          return false;
        }

        if (item.costType === 'xp') {
          const totalXP = useXPStore.getState().totalXP;
          if (totalXP < item.cost) return false;
          get().grantCosmetic(cosmeticId);
          return true;
        }

        const ok = await useSmartCoinStore
          .getState()
          .subtractCoins(item.cost, `Purchased ${item.name}`);
        if (!ok) return false;

        get().grantCosmetic(cosmeticId);
        return true;
      },

      equipCosmetic: (cosmeticId) => {
        if (!get().isUnlocked(cosmeticId)) return;

        const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
        if (!item) return;

        set((state) => {
          const customization = { ...state.customization };

          if (item.type === 'outfit') {
            customization.outfit = cosmeticId;
          }

          if (item.type === 'background') {
            customization.background = cosmeticId;
          }

          if (item.type === 'accessory') {
            const current = customization.accessories || [];
            if (!current.includes(cosmeticId)) {
              if (current.length >= 3) {
                customization.accessories = [...current.slice(1), cosmeticId];
              } else {
                customization.accessories = [...current, cosmeticId];
              }
            }
          }

          return {
            customization,
            equippedCosmetics: mergeUnique(state.equippedCosmetics, cosmeticId),
          };
        });
      },

      removeCosmetic: (cosmeticId) => {
        set((state) => {
          const customization = { ...state.customization };

          if (customization.outfit === cosmeticId) customization.outfit = '';
          if (customization.background === cosmeticId) customization.background = '';
          if (customization.accessories?.includes(cosmeticId)) {
            customization.accessories = customization.accessories.filter((a) => a !== cosmeticId);
          }

          return {
            customization,
            equippedCosmetics: state.equippedCosmetics.filter((id) => id !== cosmeticId),
          };
        });
      },

      resetAll: () => {
        set({ customization: defaultCustomization, unlockedCosmetics: [], equippedCosmetics: [] });
      },
    }),
    {
      name: 'learnsmart-avatar',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
