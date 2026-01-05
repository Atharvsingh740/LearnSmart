import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LessonProgress {
  lessonId: string;
  progress: number; // 0-100
  lastAccessedAt: string;
  timeSpent: number; // in seconds
}

interface CurriculumState {
  bookmarkedLessons: string[];
  favoriteLessons: string[];
  lessonProgress: LessonProgress[];
  currentLessonId: string | null;
  
  // Actions
  bookmarkLesson: (lessonId: string) => void;
  unbookmarkLesson: (lessonId: string) => void;
  favoriteLesson: (lessonId: string) => void;
  unfavoriteLesson: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, progress: number, timeSpent: number) => void;
  setCurrentLessonId: (lessonId: string | null) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isBookmarked: (lessonId: string) => boolean;
  isFavorite: (lessonId: string) => boolean;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      bookmarkedLessons: [],
      favoriteLessons: [],
      lessonProgress: [],
      currentLessonId: null,
      
      bookmarkLesson: (lessonId) => set((state) => ({
        bookmarkedLessons: [...state.bookmarkedLessons, lessonId],
      })),
      
      unbookmarkLesson: (lessonId) => set((state) => ({
        bookmarkedLessons: state.bookmarkedLessons.filter(id => id !== lessonId),
      })),
      
      favoriteLesson: (lessonId) => set((state) => ({
        favoriteLessons: [...state.favoriteLessons, lessonId],
      })),
      
      unfavoriteLesson: (lessonId) => set((state) => ({
        favoriteLessons: state.favoriteLessons.filter(id => id !== lessonId),
      })),
      
      updateLessonProgress: (lessonId, progress, timeSpent) => set((state) => {
        const existingProgress = state.lessonProgress.find(p => p.lessonId === lessonId);
        
        if (existingProgress) {
          return {
            lessonProgress: state.lessonProgress.map(p =>
              p.lessonId === lessonId
                ? {
                    ...p,
                    progress,
                    timeSpent: p.timeSpent + timeSpent,
                    lastAccessedAt: new Date().toISOString(),
                  }
                : p
            ),
          };
        } else {
          return {
            lessonProgress: [
              ...state.lessonProgress,
              {
                lessonId,
                progress,
                timeSpent,
                lastAccessedAt: new Date().toISOString(),
              },
            ],
          };
        }
      }),
      
      setCurrentLessonId: (lessonId) => set({ currentLessonId: lessonId }),
      
      getLessonProgress: (lessonId) => {
        return get().lessonProgress.find(p => p.lessonId === lessonId);
      },
      
      isBookmarked: (lessonId) => {
        return get().bookmarkedLessons.includes(lessonId);
      },
      
      isFavorite: (lessonId) => {
        return get().favoriteLessons.includes(lessonId);
      },
    }),
    {
      name: 'learnsmart-curriculum',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
