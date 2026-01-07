import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Video {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  duration: number; // in seconds
  videoUrl: string; // YouTube/Vimeo embed URL
  thumbnail: string;
  uploader: string;
  uploadedAt: Date;
  views: number;
  rating: number; // 1-5
  isActive: boolean;
}

export interface WatchHistoryEntry {
  userId: string;
  videoId: string;
  watchedAt: Date;
  watchedDuration: number; // seconds watched
  completed: boolean;
  resumePosition: number; // last watched position in seconds
}

export interface VideoRating {
  userId: string;
  videoId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

interface VideoState {
  videos: Video[];
  watchHistory: WatchHistoryEntry[];
  ratings: VideoRating[];
  
  // Actions
  getVideosByLesson: (lessonId: string) => Promise<Video[]>;
  getVideoById: (videoId: string) => Promise<Video | null>;
  watchVideo: (userId: string, videoId: string) => Promise<void>;
  rateVideo: (userId: string, videoId: string, rating: number, review?: string) => Promise<void>;
  getWatchHistory: (userId: string) => Promise<WatchHistoryEntry[]>;
  searchVideos: (query: string) => Promise<Video[]>;
  incrementVideoViews: (videoId: string) => Promise<void>;
  updateResumePosition: (userId: string, videoId: string, position: number) => Promise<void>;
  markVideoCompleted: (userId: string, videoId: string) => Promise<void>;
  getVideosToContinue: (userId: string, limit?: number) => Promise<Video[]>;
  getSavedForOffline: (userId: string) => Promise<Video[]>;
  saveVideoOffline: (userId: string, videoId: string) => Promise<void>;
  removeVideoOffline: (userId: string, videoId: string) => Promise<void>;
}

// Initial video data - can be expanded
const initialVideos: Video[] = [
  {
    id: 'vid_001',
    lessonId: 'lesson_thermal001',
    title: 'Heat Transfer Concepts',
    description: 'Understanding conduction, convection and radiation with real-world examples',
    duration: 480, // 8 minutes
    videoUrl: 'https://www.youtube.com/embed/example-heat-transfer',
    thumbnail: 'https://example.com/thumbnails/heat-transfer.jpg',
    uploader: 'Prof. Sharma',
    uploadedAt: new Date('2024-01-15'),
    views: 1250,
    rating: 4.5,
    isActive: true,
  },
  {
    id: 'vid_002',
    lessonId: 'lesson_force001',
    title: 'Newton\'s Laws of Motion',
    description: 'Detailed explanation of first, second and third laws with demonstrations',
    duration: 720, // 12 minutes
    videoUrl: 'https://www.youtube.com/embed/example-newton-laws',
    thumbnail: 'https://example.com/thumbnails/newton-laws.jpg',
    uploader: 'Dr. Patel',
    uploadedAt: new Date('2024-01-10'),
    views: 2100,
    rating: 4.8,
    isActive: true,
  },
  {
    id: 'vid_003',
    lessonId: 'lesson_chem001',
    title: 'Chemical Bonding Basics',
    description: 'Ionic and covalent bonds explained with animations',
    duration: 600, // 10 minutes
    videoUrl: 'https://vimeo.com/example-chemical-bonding',
    thumbnail: 'https://example.com/thumbnails/chemical-bonding.jpg',
    uploader: 'Prof. Singh',
    uploadedAt: new Date('2024-01-20'),
    views: 980,
    rating: 4.3,
    isActive: true,
  },
  {
    id: 'vid_004',
    lessonId: 'lesson_bio001',
    title: 'Cell Structure and Function',
    description: 'Detailed tour of cell organelles and their functions',
    duration: 900, // 15 minutes
    videoUrl: 'https://www.youtube.com/embed/example-cell-structure',
    thumbnail: 'https://example.com/thumbnails/cell-structure.jpg',
    uploader: 'Dr. Reddy',
    uploadedAt: new Date('2024-01-12'),
    views: 1850,
    rating: 4.7,
    isActive: true,
  },
];

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: initialVideos,
      watchHistory: [],
      ratings: [],
      
      getVideosByLesson: async (lessonId: string) => {
        const state = get();
        return state.videos
          .filter(video => video.lessonId === lessonId && video.isActive)
          .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      },
      
      getVideoById: async (videoId: string) => {
        const state = get();
        return state.videos.find(video => video.id === videoId) || null;
      },
      
      incrementVideoViews: async (videoId: string) => {
        set(state => ({
          videos: state.videos.map(video =>
            video.id === videoId
              ? { ...video, views: video.views + 1 }
              : video
          ),
        }));
      },
      
      watchVideo: async (userId: string, videoId: string) => {
        const now = new Date();
        const existingEntry = get().watchHistory.find(
          entry => entry.userId === userId && entry.videoId === videoId
        );
        
        if (existingEntry) {
          set(state => ({
            watchHistory: state.watchHistory.map(entry =>
              entry.userId === userId && entry.videoId === videoId
                ? { ...entry, watchedAt: now, completed: false }
                : entry
            ),
          }));
        } else {
          set(state => ({
            watchHistory: [
              ...state.watchHistory,
              {
                userId,
                videoId,
                watchedAt: now,
                watchedDuration: 0,
                completed: false,
                resumePosition: 0,
              },
            ],
          }));
        }
        
        // Increment views
        await get().incrementVideoViews(videoId);
      },
      
      updateResumePosition: async (userId: string, videoId: string, position: number) => {
        set(state => ({
          watchHistory: state.watchHistory.map(entry =>
            entry.userId === userId && entry.videoId === videoId
              ? {
                  ...entry,
                  resumePosition: position,
                  watchedDuration: Math.max(entry.watchedDuration, position),
                }
              : entry
          ),
        }));
      },
      
      markVideoCompleted: async (userId: string, videoId: string) => {
        set(state => ({
          watchHistory: state.watchHistory.map(entry =>
            entry.userId === userId && entry.videoId === videoId
              ? { ...entry, completed: true }
              : entry
          ),
        }));
      },
      
      rateVideo: async (userId: string, videoId: string, rating: number, review?: string) => {
        set(state => ({
          ratings: [
            ...state.ratings.filter(r => !(r.userId === userId && r.videoId === videoId)),
            {
              userId,
              videoId,
              rating,
              review,
              createdAt: new Date(),
            },
          ],
        }));
        
        // Recalculate average rating
        await get().recalculateVideoRating(videoId);
      },
      
      recalculateVideoRating: async (videoId: string) => {
        const state = get();
        const videoRatings = state.ratings.filter(r => r.videoId === videoId);
        
        if (videoRatings.length > 0) {
          const averageRating = videoRatings.reduce((sum, r) => sum + r.rating, 0) / videoRatings.length;
          
          set(state => ({
            videos: state.videos.map(video =>
              video.id === videoId
                ? { ...video, rating: Math.round(averageRating * 10) / 10 }
                : video
            ),
          }));
        }
      },
      
      getWatchHistory: async (userId: string) => {
        const state = get();
        return state.watchHistory
          .filter(entry => entry.userId === userId)
          .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
      },
      
      getVideosToContinue: async (userId: string, limit: number = 3) => {
        const state = get();
        const recentHistory = state.watchHistory
          .filter(entry => entry.userId === userId && !entry.completed)
          .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime())
          .slice(0, limit);
        
        return recentHistory
          .map(entry => state.videos.find(v => v.id === entry.videoId))
          .filter((video): video is Video => Boolean(video && video.isActive));
      },
      
      searchVideos: async (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        
        return state.videos
          .filter(video => 
            video.isActive && (
              video.title.toLowerCase().includes(lowerQuery) ||
              video.description.toLowerCase().includes(lowerQuery) ||
              video.uploader.toLowerCase().includes(lowerQuery)
            )
          )
          .sort((a, b) => b.views - a.views);
      },
      
      saveVideoOffline: async (userId: string, videoId: string) => {
        // For now, just return - offline functionality would require
        // actual video file downloads which are not implemented yet
        return Promise.resolve();
      },
      
      removeVideoOffline: async (userId: string, videoId: string) => {
        // Placeholder for offline removal
        return Promise.resolve();
      },
      
      getSavedForOffline: async (userId: string) => {
        // Placeholder - would normally return offline saved videos
        return [];
      },
      
    }),
    {
      name: 'learnsmart-video',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        videos: state.videos,
        watchHistory: state.watchHistory,
        ratings: state.ratings,
      }),
    }
  )
);

// Helper hook to get video recommendations
export const useVideoRecommendations = (userId: string, limit: number = 3) => {
  const { videos, watchHistory } = useVideoStore();
  
  // Get user's watched video IDs
  const watchedVideoIds = watchHistory
    .filter(entry => entry.userId === userId)
    .map(entry => entry.videoId);
  
  // Get unwatched videos, sorted by rating and views
  const recommendedVideos = videos
    .filter(video => video.isActive && !watchedVideoIds.includes(video.id))
    .sort((a, b) => (b.rating * b.views) - (a.rating * a.views))
    .slice(0, limit);
  
  return recommendedVideos;
};

export default useVideoStore;