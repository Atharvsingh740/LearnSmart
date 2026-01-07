import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistory {
  id: string;
  query: string;
  type: 'concept' | 'formula' | 'homework' | 'lesson';
  searchedAt: string;
  metadata?: {
    subject?: string;
    chapter?: string;
    topic?: string;
  };
}

interface SearchState {
  history: SearchHistory[];
  
  addSearch: (query: string, type: SearchHistory['type'], metadata?: SearchHistory['metadata']) => void;
  getRecentSearches: (limit?: number) => SearchHistory[];
  clearSearchHistory: () => void;
  deleteSearch: (searchId: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      history: [],
      
      addSearch: (query, type, metadata) => set((state) => {
        const newSearch: SearchHistory = {
          id: Math.random().toString(36).substring(7),
          query,
          type,
          searchedAt: new Date().toISOString(),
          metadata,
        };
        
        // Remove existing identical query of same type to move to top
        const filteredHistory = state.history.filter(
          h => !(h.query.toLowerCase() === query.toLowerCase() && h.type === type)
        );
        
        return {
          history: [newSearch, ...filteredHistory].slice(0, 20), // Keep last 20
        };
      }),
      
      getRecentSearches: (limit = 10) => {
        return get().history.slice(0, limit);
      },
      
      clearSearchHistory: () => set({ history: [] }),
      
      deleteSearch: (searchId) => set((state) => ({
        history: state.history.filter(h => h.id !== searchId),
      })),
    }),
    {
      name: 'learnsmart-search',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
