import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAchievementStore } from '@/store/achievementStore';

export interface Note {
  id: string;
  userId: string;
  lessonId: string;
  lessonTitle?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  highlights?: Array<{text: string; position: number; color: string}>;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'lesson' | 'formula' | 'homework' | 'concept' | 'test' | 'quiz';
  title: string;
  description?: string;
  addedAt: number;
  notes?: string;
  tags?: string[];
  isArchived: boolean;
}

export interface Highlight {
  id: string;
  userId: string;
  lessonId: string;
  text: string;
  position: number;
  color: string;
  noteId?: string;
  createdAt: number;
}

interface NotesState {
  notes: Record<string, Note>;
  bookmarks: Record<string, Bookmark>;
  highlights: Record<string, Highlight>;
  
  // Actions
  createNote: (userId: string, lessonId: string, title: string, content: string, tags?: string[]) => Promise<string>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  getNotes: (userId: string, filters?: {lessonId?: string; isPinned?: boolean; isArchived?: boolean}) => Note[];
  searchNotes: (userId: string, query: string) => Note[];
  getNotesByLesson: (lessonId: string) => Note[];
  getPinnedNotes: (userId: string) => Note[];
  
  // Bookmark actions
  addBookmark: (userId: string, itemId: string, itemType: Bookmark['itemType'], title: string, description?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  getBookmarks: (userId: string, itemType?: Bookmark['itemType']) => Bookmark[];
  getBookmarkedItems: (userId: string) => {lessons: string[]; formulas: string[]; homework: string[]};
  archiveBookmark: (bookmarkId: string) => Promise<void>;
  isBookmarked: (userId: string, itemId: string, itemType: Bookmark['itemType']) => boolean;
  
  // Highlight actions
  addHighlight: (userId: string, lessonId: string, text: string, position: number, color: string, noteId?: string) => void;
  removeHighlight: (highlightId: string) => void;
  getHighlights: (lessonId: string) => Highlight[];
  getHighlightsByUser: (userId: string) => Highlight[];
  updateHighlightColor: (highlightId: string, color: string) => void;
  
  // Search
  searchAll: (userId: string, query: string) => {
    notes: Note[];
    bookmarks: Bookmark[];
    highlights: Highlight[];
  };
  
  // Utilities
  exportNotes: (userId: string, format: 'json' | 'pdf' | 'txt') => Promise<string>;
  getStats: (userId: string) => {
    totalNotes: number;
    totalBookmarks: number;
    totalHighlights: number;
    notesBySubject: Record<string, number>;
    bookmarksByType: Record<string, number>;
  };
  
  resetNotes: () => void;
}

// Utility function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Available note colors
export const NOTE_COLORS = [
  '#FFF9C4', // Yellow (default)
  '#E3F2FD', // Blue (important)
  '#E8F5E9', // Green (mastered)
  '#FFEBEE', // Red (needs review)
  '#F3E5F5', // Purple (question/doubt)
  '#FFF3E0', // Orange (urgent)
  '#E0F7FA', // Cyan (reference)
  '#FAFAFA', // Gray (neutral)
];

// Available highlight colors
export const HIGHLIGHT_COLORS = [
  '#FFEB3B', // Yellow (default) - attention
  '#2196F3', // Blue (important) - key concepts
  '#4CAF50', // Green (mastered) - understood
  '#F44336', // Red (needs review) - needs work
  '#9C27B0', // Purple (question) - doubts
  '#FF9800', // Orange (urgent) - urgent review
];

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      bookmarks: {},
      highlights: {},

      createNote: async (userId, lessonId, title, content, tags = []) => {
        const noteId = generateId();
        const now = Date.now();
        
        const note: Note = {
          id: noteId,
          userId,
          lessonId,
          title,
          content,
          tags,
          createdAt: now,
          updatedAt: now,
          color: NOTE_COLORS[0], // Default yellow
          isPinned: false,
          isArchived: false,
          highlights: [],
        };

        set((state) => ({
          notes: { ...state.notes, [noteId]: note },
        }));

        // Check for achievements
        const notes = get().getNotes(userId);
        if (notes.length >= 5) {
          void useAchievementStore.getState().unlockAchievement(userId, 'note_taker');
        }

        return noteId;
      },

      updateNote: async (noteId, updates) => {
        const note = get().notes[noteId];
        if (!note) return;

        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: Date.now(),
        };

        set((state) => ({
          notes: { ...state.notes, [noteId]: updatedNote },
        }));
      },

      deleteNote: async (noteId) => {
        set((state) => {
          const notes = { ...state.notes };
          delete notes[noteId];
          return { notes };
        });
      },

      getNotes: (userId, filters = {}) => {
        const allNotes = Object.values(get().notes).filter((note) => note.userId === userId);
        
        return allNotes.filter((note) => {
          if (filters.lessonId && note.lessonId !== filters.lessonId) return false;
          if (filters.isPinned !== undefined && note.isPinned !== filters.isPinned) return false;
          if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) return false;
          return true;
        }).sort((a, b) => b.updatedAt - a.updatedAt);
      },

      searchNotes: (userId, query) => {
        const userNotes = Object.values(get().notes).filter(note => note.userId === userId);
        const lowerQuery = query.toLowerCase();

        return userNotes.filter((note) => {
          return (
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        }).sort((a, b) => b.updatedAt - a.updatedAt);
      },

      getNotesByLesson: (lessonId) => {
        return Object.values(get().notes)
          .filter(note => note.lessonId === lessonId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      getPinnedNotes: (userId) => {
        return Object.values(get().notes)
          .filter(note => note.userId === userId && note.isPinned)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // Bookmark Methods
      addBookmark: async (userId, itemId, itemType, title, description) => {
        const bookmarkId = generateId();
        const now = Date.now();
        
        // Check if already bookmarked
        const existingBookmark = Object.values(get().bookmarks).find(
          bm => bm.userId === userId && bm.itemId === itemId && bm.itemType === itemType
        );
        
        if (existingBookmark) return;

        const bookmark: Bookmark = {
          id: bookmarkId,
          userId,
          itemId,
          itemType,
          title,
          description,
          addedAt: now,
          isArchived: false,
        };

        set((state) => ({
          bookmarks: { ...state.bookmarks, [bookmarkId]: bookmark },
        }));

        // Check for achievements
        const bookmarks = get().getBookmarks(userId);
        if (bookmarks.length >= 20) {
          void useAchievementStore.getState().unlockAchievement(userId, 'bookmark_hoarder');
        }
      },

      removeBookmark: async (bookmarkId) => {
        set((state) => {
          const bookmarks = { ...state.bookmarks };
          delete bookmarks[bookmarkId];
          return { bookmarks };
        });
      },

      getBookmarks: (userId, itemType) => {
        const allBookmarks = Object.values(get().bookmarks).filter(bm => bm.userId === userId);
        
        if (itemType) {
          return allBookmarks.filter(bm => bm.itemType === itemType && !bm.isArchived);
        }
        
        return allBookmarks.filter(bm => !bm.isArchived).sort((a, b) => b.addedAt - a.addedAt);
      },

      getBookmarkedItems: (userId) => {
        const bookmarks = get().getBookmarks(userId);
        return {
          lessons: bookmarks.filter(bm => bm.itemType === 'lesson').map(bm => bm.itemId),
          formulas: bookmarks.filter(bm => bm.itemType === 'formula').map(bm => bm.itemId),
          homework: bookmarks.filter(bm => bm.itemType === 'homework').map(bm => bm.itemId),
        };
      },

      archiveBookmark: async (bookmarkId) => {
        const bookmark = get().bookmarks[bookmarkId];
        if (!bookmark) return;

        const updatedBookmark = {
          ...bookmark,
          isArchived: true,
        };

        set((state) => ({
          bookmarks: { ...state.bookmarks, [bookmarkId]: updatedBookmark },
        }));
      },

      isBookmarked: (userId, itemId, itemType) => {
        return Object.values(get().bookmarks).some(
          bm => bm.userId === userId && bm.itemId === itemId && bm.itemType === itemType
        );
      },

      // Highlight Methods
      addHighlight: (userId, lessonId, text, position, color, noteId) => {
        const highlightId = generateId();
        const now = Date.now();
        
        const highlight: Highlight = {
          id: highlightId,
          userId,
          lessonId,
          text,
          position,
          color,
          noteId,
          createdAt: now,
        };

        set((state) => ({
          highlights: { ...state.highlights, [highlightId]: highlight },
        }));

        // Check for achievements
        const userHighlights = Object.values(get().highlights).filter(h => h.userId === userId);
        if (userHighlights.length >= 50) {
          void useAchievementStore.getState().unlockAchievement(userId, 'highlighter');
        }
      },

      removeHighlight: (highlightId) => {
        set((state) => {
          const highlights = { ...state.highlights };
          delete highlights[highlightId];
          return { highlights };
        });
      },

      getHighlights: (lessonId) => {
        return Object.values(get().highlights)
          .filter(h => h.lessonId === lessonId)
          .sort((a, b) => a.position - b.position);
      },

      getHighlightsByUser: (userId) => {
        return Object.values(get().highlights)
          .filter(h => h.userId === userId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      updateHighlightColor: (highlightId, color) => {
        const highlight = get().highlights[highlightId];
        if (!highlight) return;

        const updatedHighlight = {
          ...highlight,
          color,
        };

        set((state) => ({
          highlights: { ...state.highlights, [highlightId]: updatedHighlight },
        }));
      },

      // Search across all content
      searchAll: (userId, query) => {
        const lowerQuery = query.toLowerCase();
        
        const notes = Object.values(get().notes)
          .filter(note => note.userId === userId)
          .filter(note => 
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );

        const bookmarks = Object.values(get().bookmarks)
          .filter(bm => bm.userId === userId)
          .filter(bm => 
            bm.title.toLowerCase().includes(lowerQuery) ||
            bm.description?.toLowerCase().includes(lowerQuery)
          );

        const highlights = Object.values(get().highlights)
          .filter(h => h.userId === userId)
          .filter(h => h.text.toLowerCase().includes(lowerQuery));

        return { notes, bookmarks, highlights };
      },

      // Basic export functionality
      exportNotes: async (userId, format = 'json') => {
        const notes = get().getNotes(userId);
        
        switch (format) {
          case 'json':
            return JSON.stringify(notes, null, 2);
          case 'txt':
            return notes.map(note => `# ${note.title}\n\n${note.content}\n\n---\n\n`).join('\n');
          case 'pdf':
            // TODO: Implement PDF export with react-native-pdf-lib
            throw new Error('PDF export not yet implemented');
          default:
            return JSON.stringify(notes, null, 2);
        }
      },

      getStats: (userId) => {
        const notes = Object.values(get().notes).filter(n => n.userId === userId);
        const bookmarks = Object.values(get().bookmarks).filter(bm => bm.userId === userId);
        const highlights = Object.values(get().highlights).filter(h => h.userId === userId);

        const notesBySubject = notes.reduce((acc, note) => {
          const subject = note.lessonId;
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const bookmarksByType = bookmarks.reduce((acc, bm) => {
          acc[bm.itemType] = (acc[bm.itemType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          totalNotes: notes.length,
          totalBookmarks: bookmarks.length,
          totalHighlights: highlights.length,
          notesBySubject,
          bookmarksByType,
        };
      },

      resetNotes: () => {
        set({
          notes: {},
          bookmarks: {},
          highlights: {},
        });
      },
    }),
    {
      name: 'learnsmart-notes',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

// Helper functions for easy access
export function useNotes(userId: string) {
  const store = useNotesStore();
  return {
    notes: store.getNotes(userId),
    pinnedNotes: store.getPinnedNotes(userId),
    createNote: store.createNote,
    updateNote: store.updateNote,
    deleteNote: store.deleteNote,
  };
}

export function useBookmarks(userId: string) {
  const store = useNotesStore();
  return {
    bookmarks: store.getBookmarks(userId),
    addBookmark: store.addBookmark,
    removeBookmark: store.removeBookmark,
    isBookmarked: store.isBookmarked,
  };
}

export function getNoteStats(userId: string) {
  return useNotesStore.getState().getStats(userId);
}