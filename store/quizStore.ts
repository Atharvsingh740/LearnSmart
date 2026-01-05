import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeTaken: number; // in seconds
}

interface GeneratedQuiz {
  quizId: string;
  lessonId: string;
  questions: any[];
  createdAt: string;
}

interface QuizState {
  generatedQuizzes: GeneratedQuiz[];
  quizHistory: QuizResult[];
  currentQuizId: string | null;
  
  // Actions
  addGeneratedQuiz: (quiz: GeneratedQuiz) => void;
  addQuizResult: (result: QuizResult) => void;
  setCurrentQuizId: (quizId: string | null) => void;
  getQuizById: (quizId: string) => GeneratedQuiz | undefined;
  getQuizHistoryForLesson: (lessonId: string) => QuizResult[];
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      generatedQuizzes: [],
      quizHistory: [],
      currentQuizId: null,
      
      addGeneratedQuiz: (quiz) => set((state) => ({
        generatedQuizzes: [...state.generatedQuizzes, quiz],
      })),
      
      addQuizResult: (result) => set((state) => ({
        quizHistory: [...state.quizHistory, result],
      })),
      
      setCurrentQuizId: (quizId) => set({ currentQuizId: quizId }),
      
      getQuizById: (quizId) => {
        return get().generatedQuizzes.find(q => q.quizId === quizId);
      },
      
      getQuizHistoryForLesson: (lessonId) => {
        const quizzes = get().generatedQuizzes.filter(q => q.lessonId === lessonId);
        const quizIds = quizzes.map(q => q.quizId);
        return get().quizHistory.filter(h => quizIds.includes(h.quizId));
      },
    }),
    {
      name: 'learnsmart-quiz',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
