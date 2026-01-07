import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecommendationType = 'lesson' | 'topic' | 'practice' | 'tutor' | 'video' | 'test' | 'quiz';

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  itemId: string;
  title: string;
  reason: string;
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  expiresAt: Date;
  action?: {
    label: string;
    screen: string;
    params?: Record<string, any>;
  };
}

export interface LearningPath {
  userId: string;
  recommendations: Recommendation[];
  estimatedCompletionTime: number; // hours
  currentProgress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface StrengthWeakness {
  subject: string;
  score: number; // 0-100
  topic: string;
  mastery: 'strong' | 'moderate' | 'weak';
}

interface RecommendationsState {
  recommendations: Recommendation[];
  learningPaths: LearningPath[];
  
  // Core recommendation actions
  getRecommendedLessons: (userId: string, limit?: number) => Promise<Recommendation[]>;
  getSmartLearningPath: (userId: string) => Promise<LearningPath>;
  getLessonsToContinue: (userId: string) => Promise<any[]>;
  getStrengthWeaknesses: (userId: string) => Promise<{ strengths: StrengthWeakness[]; weaknesses: StrengthWeakness[] }>;
  
  // Specific recommendation types
  recommendPracticeProblem: (userId: string, topic?: string) => Promise<Recommendation | null>;
  recommendTutor: (userId: string, topic: string) => Promise<Recommendation | null>;
  recommendVideo: (userId: string, lessonId: string) => Promise<Recommendation | null>;
  recommendPracticeTest: (userId: string, subject?: string) => Promise<Recommendation | null>;
  recommendReview: (userId: string, topic: string, daysInactive: number) => Promise<Recommendation | null>;
  
  // Management
  markRecommendationAsSeen: (recommendationId: string) => Promise<void>;
  removeRecommendation: (recommendationId: string, userId: string) => Promise<void>;
  refreshRecommendations: (userId: string) => Promise<void>;
  
  // Analytics
  getRecommendationAccuracy: (userId: string) => Promise<{ accepted: number; total: number; percentage: number }>;
  getTopPerformingRecommendations: (limit?: number) => Promise<Recommendation[]>;
}

// Mock analytics data for recommendations
const mockUserPerformance = {
  'user_test_001': {
    Physics: { topic: 'Thermodynamics', score: 65, attempts: 3 },
    Chemistry: { topic: 'Organic Chemistry', score: 78, attempts: 2 },
    Mathematics: { topic: 'Calculus', score: 42, attempts: 4 },
    Biology: { topic: 'Cell Biology', score: 89, attempts: 1 },
  }
};

function generateLearningPath(userId: string): LearningPath {
  const now = new Date();
  const path: LearningPath = {
    userId,
    recommendations: [],
    estimatedCompletionTime: 0,
    currentProgress: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Get user performance data (would normally come from analytics)
  const performance = mockUserPerformance[userId] || {};
  const weaknesses: Array<{subject: string; topic: string; score: number}> = [];
  const strengths: Array<{subject: string; topic: string; score: number}> = [];

  Object.entries(mockUserPerformance['user_test_001'] || {}).forEach(([subject, data]) => {
    if (data.score < 70) {
      weaknesses.push({ subject, topic: data.topic, score: data.score });
    } else {
      strengths.push({ subject, topic: data.topic, score: data.score });
    }
  });

  // Sort by score to identify worst and best areas
  weaknesses.sort((a, b) => a.score - b.score);
  strengths.sort((a, b) => b.score - a.score);

  // Generate recommendations based on weaknesses (priority: high)
  weaknesses.slice(0, 3).forEach((weakness, index) => {
    if (weakness.subject === 'Mathematics' && weakness.topic === 'Calculus') {
      path.recommendations.push({
        id: `rec_${Date.now()}_${index}`,
        userId,
        type: 'lesson',
        itemId: 'lesson_diff_calc',
        title: 'Differential Calculus Basics',
        reason: `You scored ${weakness.score}% in Calculus. Strengthen your foundation to improve performance.`,
        confidence: 95,
        priority: 'high',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        action: {
          label: 'Start Lesson',
          screen: '/lessons/[lessonId]',
          params: { lessonId: 'lesson_diff_calc' },
        },
      });
      
      // Also recommend practice problems
      path.recommendations.push({
        id: `rec_${Date.now()}_${index}_practice`,
        userId,
        type: 'practice',
        itemId: 'practice_calc_001',
        title: 'Calculus Practice Problems',
        reason: 'Practice 3 problems on Calculus to strengthen your skills.',
        confidence: 90,
        priority: 'high',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        action: {
          label: 'Practice Now',
          screen: '/practice',
          params: { topic: 'calculus', difficulty: 'medium' },
        },
      });
      
      // Recommend tutor for this topic
      path.recommendations.push({
        id: `rec_${Date.now()}_${index}_tutor`,
        userId,
        type: 'tutor',
        itemId: 'tutor_002',
        title: 'Prof. Amit Singh',
        reason: `Book a session with Prof. Singh to master ${weakness.topic}.`,
        confidence: 85,
        priority: 'medium',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        action: {
          label: 'Book Session',
          screen: '/tutoring/book-session/[tutorId]',
          params: { tutorId: 'tutor_002' },
        },
      });
    }
  });

  // Review recommendations for strong subjects (priority: low)
  strengths.slice(0, 2).forEach((strength, index) => {
    path.recommendations.push({
      id: `rec_${Date.now()}_review_${index}`,
      userId,
      type: 'topic',
      itemId: `review_${strength.subject.toLowerCase()}`,
      title: `Review ${strength.subject}`,
      reason: `Maintain your mastery in ${strength.subject} (${strength.score}% avg). Review key concepts every week.`,
      confidence: 80,
      priority: 'low',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      action: {
        label: 'Review Now',
        screen: '/revision',
        params: { subject: strength.subject.toLowerCase() },
      },
    });
  });

  // Estimate completion time (based on recommendation types)
  path.estimatedCompletionTime = path.recommendations.reduce((total, rec) => {
    switch (rec.type) {
      case 'lesson': return total + 2; // 2 hours per lesson
      case 'practice': return total + 0.5; // 30 min per practice
      case 'tutor': return total + 1; // 1 hour for tutor session
      case 'video': return total + 0.25; // 15 min per video
      default: return total + 0.5;
    }
  }, 0);

  // Prioritize and sort
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  path.recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return path;
}

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      recommendations: [],
      learningPaths: [],
      
      getRecommendedLessons: async (userId: string, limit: number = 5) => {
        const learningPath = await get().getSmartLearningPath(userId);
        return learningPath.recommendations.filter(r => r.type === 'lesson').slice(0, limit);
      },
      
      getSmartLearningPath: async (userId: string) => {
        let learningPath = get().learningPaths.find(lp => lp.userId === userId);
        
        if (!learningPath) {
          learningPath = generateLearningPath(userId);
          set(state => ({
            learningPaths: [...state.learningPaths, learningPath!],
          }));
        } else {
          // Update existing path
          learningPath.updatedAt = new Date();
          set(state => ({
            learningPaths: state.learningPaths.map(lp => 
              lp.userId === userId ? learningPath! : lp
            ),
          }));
        }
        
        return learningPath;
      },
      
      getLessonsToContinue: async (userId: string) => {
        // Would normally check progress data
        return [
          { lessonId: 'lesson_thermal001', title: 'Heat Transfer', progress: 65, lastStudied: '2 days ago' },
          { lessonId: 'lesson_force001', title: 'Forces and Motion', progress: 42, lastStudied: '1 week ago' },
        ];
      },
      
      getStrengthWeaknesses: async (userId: string) => {
        const performance = mockUserPerformance['user_test_001'] || {};
        const strengths: StrengthWeakness[] = [];
        const weaknesses: StrengthWeakness[] = [];
        
        Object.entries(performance).forEach(([subject, data]) => {
          if (data.score >= 70) {
            strengths.push({
              subject,
              topic: data.topic,
              score: data.score,
              mastery: 'strong' as const,
            });
          } else {
            weaknesses.push({
              subject,
              topic: data.topic,
              score: data.score,
              mastery: 'weak' as const,
            });
          }
        });
        
        return { strengths, weaknesses };
      },
      
      recommendPracticeProblem: async (userId: string, topic?: string) => {
        const problems = [
          { id: 'prob_001', title: 'Differential Calculus - Level 1', difficulty: 'medium' as const, topic: 'Calculus' },
          { id: 'prob_002', title: 'Kinematics - Motion Problems', difficulty: 'easy' as const, topic: 'Physics' },
          { id: 'prob_003', title: 'Organic Chemistry Reactions', difficulty: 'hard' as const, topic: 'Chemistry' },
        ];
        
        const selectedProblem = problems.find(p => !topic || p.topic === topic) || problems[0];
        
        return {
          id: `rec_practice_${Date.now()}`,
          userId,
          type: 'practice' as const,
          itemId: selectedProblem.id,
          title: `Practice: ${selectedProblem.title}`,
          reason: 'Strengthen your understanding with targeted practice problems.',
          confidence: 85,
          priority: 'medium' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
      },
      
      recommendTutor: async (userId: string, topic: string) => {
        return {
          id: `rec_tutor_${Date.now()}`,
          userId,
          type: 'tutor' as const,
          itemId: 'tutor_002',
          title: 'Prof. Amit Singh - Math Expert',
          reason: `Based on your struggle with ${topic}, book a 1-on-1 session for personalized guidance.`,
          confidence: 90,
          priority: 'high' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          action: {
            label: 'Book Session',
            screen: '/tutoring/book-session/[tutorId]',
            params: { tutorId: 'tutor_002' },
          },
        };
      },
      
      recommendVideo: async (userId: string, lessonId: string) => {
        return {
          id: `rec_video_${Date.now()}`,
          userId,
          type: 'video' as const,
          itemId: 'vid_001',
          title: 'Heat Transfer Concepts - Video Lesson',
          reason: 'Visual learners retain 65% more information. Watch this video to understand the topic better.',
          confidence: 75,
          priority: 'medium' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          action: {
            label: 'Watch Video',
            screen: '/video-player/[videoId]',
            params: { videoId: 'vid_001' },
          },
        };
      },
      
      recommendPracticeTest: async (userId: string, subject?: string) => {
        return {
          id: `rec_test_${Date.now()}`,
          userId,
          type: 'test' as const,
          itemId: 'test_physics_ch5',
          title: `Physics Chapter 5: Mock Exam`,
          reason: 'Test your understanding with a timed practice test with detailed feedback.',
          confidence: 88,
          priority: 'medium' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          action: {
            label: 'Take Test',
            screen: '/practice-tests',
            params: { testId: 'test_physics_ch5' },
          },
        };
      },
      
      recommendReview: async (userId: string, topic: string, daysInactive: number) => {
        return {
          id: `rec_review_${Date.now()}`,
          userId,
          type: 'topic' as const,
          itemId: topic.toLowerCase(),
          title: `Review: ${topic}`,
          reason: `You haven't studied ${topic} for ${daysInactive} days. Review to maintain your mastery.`,
          confidence: 70,
          priority: 'low' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          action: {
            label: 'Review Topics',
            screen: '/revision',
            params: { topic },
          },
        };
      },
      
      markRecommendationAsSeen: async (recommendationId: string) => {
        set(state => ({
          recommendations: state.recommendations.filter(
            rec => rec.id !== recommendationId
          ),
        }));
      },
      
      removeRecommendation: async (recommendationId: string, userId: string) => {
        set(state => ({
          recommendations: state.recommendations.filter(
            rec => rec.id !== recommendationId
          ),
        }));
        
        // Also update learning path
        set(state => ({
          learningPaths: state.learningPaths.map(lp => 
            lp.userId === userId 
              ? {
                  ...lp,
                  recommendations: lp.recommendations.filter(r => r.id !== recommendationId),
                }
              : lp
          ),
        }));
      },
      
      refreshRecommendations: async (userId: string) => {
        // Remove old recommendations (older than 30 days)
        const now = new Date();
        
        set(state => ({
          recommendations: state.recommendations.filter(
            rec => rec.expiresAt > now
          ),
          learningPaths: state.learningPaths.map(lp => 
            lp.userId === userId 
              ? {
                  ...lp,
                  recommendations: lp.recommendations.filter(r => r.expiresAt > now),
                }
              : lp
          ),
        }));
        
        // Generate new recommendations
        await get().getSmartLearningPath(userId);
      },
      
      getRecommendationAccuracy: async (userId: string) => {
        // Placeholder - in real implementation would track accepted vs shown recommendations
        return {
          accepted: 15,
          total: 20,
          percentage: 75,
        };
      },
      
      getTopPerformingRecommendations: async (limit: number = 5) => {
        const state = get();
        return [...state.recommendations]
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, limit);
      },
      
    }),
    {
      name: 'learnsmart-recommendations',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recommendations: state.recommendations,
        learningPaths: state.learningPaths,
      }),
    }
  )
);

// Helper hook to get current learning path
export const useCurrentLearningPath = (userId: string) => {
  const { learningPaths } = useRecommendationsStore();
  return learningPaths.find(lp => lp.userId === userId);
};

// Helper hook to get pending recommendations
export const usePendingRecommendations = (userId: string) => {
  const { recommendations } = useRecommendationsStore();
  const now = new Date();
  
  return recommendations.filter(
    rec => rec.userId === userId && rec.expiresAt > now
  ).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
};

export { useRecommendationsStore };