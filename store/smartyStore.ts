import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  role: 'user' | 'smarty';
  content: string;
  timestamp: number;
  mediaAttachment?: {
    type: 'image' | 'pdf' | 'drawing';
    uri: string;
    fileName: string;
  };
  contextConcepts?: string[];
}

export interface DailyImageLimit {
  used: number;
  limit: number;
  lastReset: number;
}

interface SmartyState {
  messages: Message[];
  isLoading: boolean;
  dailyImageLimit: DailyImageLimit;
  totalImagesReadToday: number;

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getMessages: () => Message[];
  clearChat: () => void;
  canReadImage: () => boolean;
  incrementImageCount: () => void;
  checkAndResetDailyLimit: () => void;
  setLoading: (loading: boolean) => void;
  getLastThreeConcepts: () => string[];
  resetDailyLimit: () => void;
}

const getTodayAt1AM = (): number => {
  const today = new Date();
  today.setHours(1, 0, 0, 0);
  return today.getTime();
};

export const useSmartyStore = create<SmartyState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      dailyImageLimit: {
        used: 0,
        limit: 8,
        lastReset: Date.now(),
      },
      totalImagesReadToday: 0,
      
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      
      getMessages: () => {
        return get().messages;
      },
      
      clearChat: () => {
        set({ messages: [] });
      },
      
      canReadImage: () => {
        const { dailyImageLimit } = get();
        return dailyImageLimit.used < dailyImageLimit.limit;
      },
      
      incrementImageCount: () => {
        set((state) => ({
          dailyImageLimit: {
            ...state.dailyImageLimit,
            used: state.dailyImageLimit.used + 1,
          },
          totalImagesReadToday: state.totalImagesReadToday + 1,
        }));
      },
      
      checkAndResetDailyLimit: () => {
        const now = Date.now();
        const { dailyImageLimit } = get();
        const today1AM = getTodayAt1AM();
        
        if (now > today1AM && dailyImageLimit.lastReset < today1AM) {
          get().resetDailyLimit();
        }
      },
      
      resetDailyLimit: () => {
        set((state) => ({
          dailyImageLimit: {
            ...state.dailyImageLimit,
            used: 0,
            lastReset: getTodayAt1AM(),
          },
          totalImagesReadToday: 0,
        }));
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      getLastThreeConcepts: () => {
        const messages = get().messages;
        const conceptIds: string[] = [];
        
        for (let i = messages.length - 1; i >= 0 && conceptIds.length < 3; i--) {
          const msg = messages[i];
          if (msg.contextConcepts && msg.contextConcepts.length > 0) {
            msg.contextConcepts.forEach((id) => {
              if (!conceptIds.includes(id) && conceptIds.length < 3) {
                conceptIds.push(id);
              }
            });
          }
        }
        
        return conceptIds;
      },
    }),
    {
      name: 'learnsmart-smarty',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
