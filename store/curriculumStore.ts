import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ncertData from '@/assets/data/ncert.json';

interface LessonProgress {
  lessonId: string;
  progress: number;
  lastAccessedAt: string;
  timeSpent: number;
}

interface Concept {
  id: string;
  title: string;
  content: string;
  bullets: string[];
  keyTakeaway: string;
  diagram?: {
    type: string;
    elements: Array<{
      label: string;
      icon?: string;
      x?: number;
      y?: number;
      type?: string;
    }>;
  };
}

interface Topic {
  id: string;
  title: string;
  icon: string;
  concepts: Concept[];
}

interface Chapter {
  id: string;
  title: string;
  icon: string;
  topics: Topic[];
  subCategory?: string;
}

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  subCategories?: Array<{
    id: string;
    name: string;
  }>;
}

interface ClassData {
  id: string;
  name: string;
  subjects: Subject[];
}

interface NCERTData {
  classes: ClassData[];
}

interface CurriculumState {
  ncertData: NCERTData;
  bookmarkedLessons: string[];
  favoriteLessons: string[];
  completedTopics: string[];
  lessonProgress: LessonProgress[];
  currentLessonId: string | null;
  
  // Actions for progress tracking
  bookmarkLesson: (lessonId: string) => void;
  unbookmarkLesson: (lessonId: string) => void;
  favoriteLesson: (lessonId: string) => void;
  unfavoriteLesson: (lessonId: string) => void;
  completeTopic: (topicId: string) => void;
  updateLessonProgress: (lessonId: string, progress: number, timeSpent: number) => void;
  setCurrentLessonId: (lessonId: string | null) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isBookmarked: (lessonId: string) => boolean;
  isFavorite: (lessonId: string) => boolean;
  isTopicCompleted: (topicId: string) => boolean;
  
  // NCERT Data methods
  getAllClasses: () => ClassData[];
  getClass: (classId: string) => ClassData | undefined;
  getClassSubjects: (classId: string) => Subject[];
  getSubject: (subjectId: string, classId: string) => Subject | undefined;
  getChapters: (subjectId: string, classId: string) => Chapter[];
  getChapter: (chapterId: string) => Chapter | undefined;
  getTopics: (chapterId: string) => Topic[];
  getTopic: (topicId: string) => Topic | undefined;
  getConcepts: (topicId: string) => Concept[];
  getConcept: (conceptId: string) => Concept | undefined;
  searchContent: (query: string) => Array<{
    type: 'concept' | 'topic' | 'chapter' | 'subject';
    id: string;
    title: string;
    path: string;
    match: string;
  }>;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      ncertData,
      bookmarkedLessons: [],
      favoriteLessons: [],
      completedTopics: [],
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
      
      completeTopic: (topicId) => set((state) => ({
        completedTopics: state.completedTopics.includes(topicId)
          ? state.completedTopics
          : [...state.completedTopics, topicId],
      })),
      
      isTopicCompleted: (topicId) => {
        return get().completedTopics.includes(topicId);
      },
      
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
      
      // NCERT Data Methods
      getAllClasses: () => {
        return get().ncertData.classes;
      },
      
      getClass: (classId) => {
        return get().ncertData.classes.find(c => c.id === classId);
      },
      
      getClassSubjects: (classId) => {
        const klass = get().ncertData.classes.find(c => c.id === classId);
        return klass?.subjects || [];
      },
      
      getSubject: (subjectId, classId) => {
        const klass = get().ncertData.classes.find(c => c.id === classId);
        return klass?.subjects.find(s => s.id === subjectId);
      },
      
      getChapters: (subjectId, classId) => {
        const klass = get().ncertData.classes.find(c => c.id === classId);
        const subject = klass?.subjects.find(s => s.id === subjectId);
        return subject?.chapters || [];
      },
      
      getChapter: (chapterId) => {
        for (const klass of get().ncertData.classes) {
          for (const subject of klass.subjects) {
            const chapter = subject.chapters.find(c => c.id === chapterId);
            if (chapter) return chapter;
          }
        }
        return undefined;
      },
      
      getTopics: (chapterId) => {
        const chapter = get().getChapter(chapterId);
        return chapter?.topics || [];
      },
      
      getTopic: (topicId) => {
        for (const klass of get().ncertData.classes) {
          for (const subject of klass.subjects) {
            for (const chapter of subject.chapters) {
              const topic = chapter.topics.find(t => t.id === topicId);
              if (topic) return topic;
            }
          }
        }
        return undefined;
      },
      
      getConcepts: (topicId) => {
        const topic = get().getTopic(topicId);
        return topic?.concepts || [];
      },
      
      getConcept: (conceptId) => {
        for (const klass of get().ncertData.classes) {
          for (const subject of klass.subjects) {
            for (const chapter of subject.chapters) {
              for (const topic of chapter.topics) {
                const concept = topic.concepts.find(c => c.id === conceptId);
                if (concept) return concept;
              }
            }
          }
        }
        return undefined;
      },
      
      searchContent: (query) => {
        const results: Array<{
          type: 'concept' | 'topic' | 'chapter' | 'subject';
          id: string;
          title: string;
          path: string;
          match: string;
        }> = [];
        const lowerQuery = query.toLowerCase();
        
        for (const klass of get().ncertData.classes) {
          for (const subject of klass.subjects) {
            for (const chapter of subject.chapters) {
              for (const topic of chapter.topics) {
                for (const concept of topic.concepts) {
                  // Search in concept content and title
                  if (concept.title.toLowerCase().includes(lowerQuery) ||
                      concept.content.toLowerCase().includes(lowerQuery) ||
                      concept.bullets.some(b => b.toLowerCase().includes(lowerQuery))) {
                    results.push({
                      type: 'concept',
                      id: concept.id,
                      title: concept.title,
                      path: `${klass.name} > ${subject.name} > ${chapter.title} > ${topic.title}`,
                      match: 'Concept',
                    });
                  }
                }
                
                // Search in topic
                if (topic.title.toLowerCase().includes(lowerQuery)) {
                  results.push({
                    type: 'topic',
                    id: topic.id,
                    title: topic.title,
                    path: `${klass.name} > ${subject.name} > ${chapter.title}`,
                    match: 'Topic',
                  });
                }
              }
              
              // Search in chapter
              if (chapter.title.toLowerCase().includes(lowerQuery)) {
                results.push({
                  type: 'chapter',
                  id: chapter.id,
                  title: chapter.title,
                  path: `${klass.name} > ${subject.name}`,
                  match: 'Chapter',
                });
              }
            }
            
            // Search in subject
            if (subject.name.toLowerCase().includes(lowerQuery)) {
              results.push({
                type: 'subject',
                id: subject.id,
                title: subject.name,
                path: `${klass.name}`,
                match: 'Subject',
              });
            }
          }
        }
        
        return results;
      },
    }),
    {
      name: 'learnsmart-curriculum',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
