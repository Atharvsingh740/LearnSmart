import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSmartyStore } from '@/store/smartyStore';

export interface Rank {
  id: 'novice' | 'seeker' | 'scholar' | 'sage' | 'emerald-sage';
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  description: string;
}

export const RANKS: Rank[] = [
  {
    id: 'novice',
    name: 'Novice',
    minXP: 0,
    maxXP: 500,
    icon: '🪵',
    color: '#8B7355',
    description: 'Beginner',
  },
  {
    id: 'seeker',
    name: 'Seeker',
    minXP: 500,
    maxXP: 2000,
    icon: '🥉',
    color: '#CD7F32',
    description: 'Curious',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    minXP: 2000,
    maxXP: 5000,
    icon: '🥈',
    color: '#C0C0C0',
    description: 'Learned',
  },
  {
    id: 'sage',
    name: 'Sage',
    minXP: 5000,
    maxXP: 10000,
    icon: '👑',
    color: '#FFD700',
    description: 'Wise',
  },
  {
    id: 'emerald-sage',
    name: 'Emerald Sage',
    minXP: 10000,
    maxXP: Number.POSITIVE_INFINITY,
    icon: '💚',
    color: '#50C878',
    description: 'Master',
  },
];

export interface RankUpEntry {
  id: string;
  fromRankId: Rank['id'];
  toRankId: Rank['id'];
  timestamp: number;
  totalXP: number;
}

export interface RankUpEvent {
  from: Rank;
  to: Rank;
  timestamp: number;
}

interface RankState {
  currentRank: Rank;
  previousRank?: Rank;
  nextRank?: Rank;
  progressPercent: number;
  lastKnownXP: number;

  rankHistory: RankUpEntry[];
  lastRankUpEvent: RankUpEvent | null;

  getRank: (xp: number) => Rank;
  getProgressToNext: () => { current: number; needed: number; percent: number };
  checkRankUp: (newXP: number) => { rankedUp: boolean; rank: Rank };
  updateFromXP: (xp: number) => void;

  consumeLastRankUpEvent: () => RankUpEvent | null;
  resetAll: () => void;
}

const generateId = (): string => `rank-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getRankForXP = (xp: number): Rank => {
  const normalized = Math.max(0, xp);
  for (const rank of RANKS) {
    if (normalized >= rank.minXP && normalized < rank.maxXP) return rank;
  }
  return RANKS[RANKS.length - 1];
};

const getNextRank = (rank: Rank): Rank | undefined => {
  const idx = RANKS.findIndex((r) => r.id === rank.id);
  if (idx < 0) return undefined;
  return RANKS[idx + 1];
};

export const useRankStore = create<RankState>()(
  persist(
    (set, get) => ({
      currentRank: RANKS[0],
      previousRank: undefined,
      nextRank: RANKS[1],
      progressPercent: 0,
      lastKnownXP: 0,
      rankHistory: [],
      lastRankUpEvent: null,

      getRank: (xp) => getRankForXP(xp),

      getProgressToNext: () => {
        const { currentRank, nextRank, lastKnownXP } = get();

        if (!nextRank || !Number.isFinite(nextRank.minXP)) {
          return { current: 0, needed: 0, percent: 100 };
        }

        const current = Math.max(0, lastKnownXP - currentRank.minXP);
        const needed = Math.max(1, nextRank.minXP - currentRank.minXP);
        const percent = Math.max(0, Math.min(100, (current / needed) * 100));

        return { current, needed, percent };
      },

      updateFromXP: (xp) => {
        const next = getRankForXP(xp);
        const prev = get().currentRank;
        const nextRank = getNextRank(next);

        const currentProgress = Math.max(0, xp - next.minXP);
        const span = nextRank ? nextRank.minXP - next.minXP : 0;
        const percent = span > 0 ? Math.max(0, Math.min(100, (currentProgress / span) * 100)) : 100;

        if (next.id !== prev.id) {
          const timestamp = Date.now();
          const entry: RankUpEntry = {
            id: generateId(),
            fromRankId: prev.id,
            toRankId: next.id,
            timestamp,
            totalXP: xp,
          };

          useSmartyStore.getState().addMessage({
            role: 'smarty',
            content: `🎉 Rank up! You're now ${next.name} ${next.icon}. Keep going!`,
          });

          set((state) => ({
            currentRank: next,
            previousRank: prev,
            nextRank,
            progressPercent: percent,
            lastKnownXP: xp,
            rankHistory: [entry, ...state.rankHistory].slice(0, 50),
            lastRankUpEvent: { from: prev, to: next, timestamp },
          }));
          return;
        }

        set({ currentRank: next, nextRank, progressPercent: percent, lastKnownXP: xp });
      },

      checkRankUp: (newXP) => {
        const before = get().currentRank;
        const after = getRankForXP(newXP);
        get().updateFromXP(newXP);
        return { rankedUp: after.id !== before.id, rank: after };
      },

      consumeLastRankUpEvent: () => {
        const event = get().lastRankUpEvent;
        if (!event) return null;
        set({ lastRankUpEvent: null });
        return event;
      },

      resetAll: () => {
        set({
          currentRank: RANKS[0],
          previousRank: undefined,
          nextRank: RANKS[1],
          progressPercent: 0,
          lastKnownXP: 0,
          rankHistory: [],
          lastRankUpEvent: null,
        });
      },
    }),
    {
      name: 'learnsmart-rank',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
