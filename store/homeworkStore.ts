import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateHomeworkWithGemini } from '@/utils/geminiService';

export interface Homework {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: string;
  problemCount: number;
  content: string;
  generatedAt: string;
  isSaved: boolean;
  lastViewed: string;
}

interface HomeworkState {
  history: Homework[];
  isGenerating: boolean;
  
  generateHomework: (subject: string, topic: string, difficulty: string, count: number, classLevel: string) => Promise<string | null>;
  getHomeworkHistory: () => Homework[];
  saveHomework: (homeworkId: string) => void;
  deleteHomework: (homeworkId: string) => void;
}

export const useHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      history: [],
      isGenerating: false,
      
      generateHomework: async (subject, topic, difficulty, count, classLevel) => {
        set({ isGenerating: true });
        try {
          const content = await generateHomeworkWithGemini(subject, topic, difficulty, count, classLevel);
          if (!content) throw new Error('Failed to generate homework');
          
          const newHomework: Homework = {
            id: Math.random().toString(36).substring(7),
            userId: 'current-user', // Should get from userStore
            subject,
            topic,
            difficulty,
            problemCount: count,
            content,
            generatedAt: new Date().toISOString(),
            isSaved: false,
            lastViewed: new Date().toISOString(),
          };
          
          set((state) => ({
            history: [newHomework, ...state.history],
            isGenerating: false,
          }));
          
          return newHomework.id;
        } catch (error) {
          console.error('Error generating homework:', error);
          set({ isGenerating: false });
          return null;
        }
      },
      
      getHomeworkHistory: () => get().history,
      
      saveHomework: (homeworkId) => set((state) => ({
        history: state.history.map(h => 
          h.id === homeworkId ? { ...h, isSaved: true } : h
        ),
      })),
      
      deleteHomework: (homeworkId) => set((state) => ({
        history: state.history.filter(h => h.id !== homeworkId),
      })),
    }),
    {
      name: 'learnsmart-homework',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
