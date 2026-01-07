import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PracticeTest {
  id: string;
  subject: string;
  chapter: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questionIds: string[];
  createdAt: Date;
  attempts: number;
  averageScore: number; // Average across all attempts
  createdBy?: string;
  isMockExam?: boolean;
  negativeMarking?: boolean;
  maxMarks: number;
}

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  answers: Record<number, string>; // questionIndex -> answer
  markedForReview: number[];
  submitted: boolean;
  score?: number;
  percentage?: number;
  passed?: boolean;
  timeSpent?: number; // in minutes
  flaggedQuestions: number[];
}

export interface MockExamConfig {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
  includeNegativeMarking: boolean;
  createdAt: Date;
}

interface PracticeTestState {
  tests: PracticeTest[];
  testSessions: TestSession[];
  questions: Map<string, any>; // Question pool
  
  // Actions
  getPracticeTests: (filters?: { subject?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => Promise<PracticeTest[]>;
  getPracticeTest: (testId: string) => Promise<PracticeTest | null>;
  startPracticeTest: (testId: string, userId: string) => Promise<TestSession>;
  submitPracticeTest: (testSessionId: string, answers: Record<number, string>) => Promise<TestSession>;
  getPracticeTestHistory: (userId: string) => Promise<TestSession[]>;
  generateMockExam: (subject: string, chapters: string[], difficulty: 'easy' | 'medium' | 'hard', questionCount?: number) => Promise<PracticeTest>;
  getTestResults: (sessionId: string) => Promise<TestSession | null>;
  getAverageScoreBySubject: (userId: string) => Promise<Record<string, number>>;
  getPerformanceTrend: (userId: string) => Promise<{date: Date; score: number}[]>;
  retryTest: (testId: string, userId: string) => Promise<TestSession>;
  getTopTestsBySubject: (subject: string, limit?: number) => Promise<PracticeTest[]>;
}

// Initial test data
const initialTests: PracticeTest[] = [
  {
    id: 'test_physics_ch1',
    subject: 'Physics',
    chapter: 'Laws of Motion',
    title: 'Chapter 1: Forces and Motion Review',
    description: 'Test your understanding of Newton\'s Laws and basic kinematics',
    difficulty: 'easy',
    totalQuestions: 10,
    timeLimit: 15,
    passingScore: 70,
    questionIds: ['q1_force', 'q2_motion', 'q3_newton', 'q4_friction', 'q5_momentum', 'q6_acceleration', 'q7_velocity', 'q8_mass', 'q9_inertia', 'q10_circular'],
    createdAt: new Date('2024-01-01'),
    attempts: 156,
    averageScore: 78,
    maxMarks: 100,
    negativeMarking: false,
  },
  {
    id: 'test_physics_ch2',
    subject: 'Physics',
    chapter: 'Work, Energy and Power',
    title: 'Chapter 2: Work and Energy Fundamentals',
    description: 'Comprehensive test on work, energy and power concepts',
    difficulty: 'medium',
    totalQuestions: 15,
    timeLimit: 25,
    passingScore: 75,
    questionIds: ['w1_work', 'w2_kinetic', 'w3_potential', 'w4_spring', 'w5_power', 'w6_conservation', 'w7_collisions', 'w8_efficiency', 'w9_simple_machines', 'w10_forms', 'w11_thermal', 'w12_electrical', 'w13_renewable', 'w14_non_renewable', 'w15_energy_transfer'],
    createdAt: new Date('2024-01-05'),
    attempts: 98,
    averageScore: 72,
    maxMarks: 150,
    negativeMarking: true,
  },
  {
    id: 'test_chemistry_ch4',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry Basics',
    title: 'Organic Chemistry Fundamentals',
    description: 'Identify functional groups and basic organic reactions',
    difficulty: 'hard',
    totalQuestions: 20,
    timeLimit: 45,
    passingScore: 65,
    questionIds: ['c1_functional', 'c2_isomers', 'c3_hybridization', 'c4_bonding', 'c5_reactions', 'c6_mechanism', 'c7_substitution', 'c8_addition', 'c9_elimination', 'c10_rearrangement', 'c11_aromatic', 'c12_petroleum', 'c13_polymers', 'c14_biomolecules', 'c15_purification', 'c16_separation', 'c17_detection', 'c18_quantitative', 'c19_qualitative', 'c20_environmental'],
    createdAt: new Date('2024-01-10'),
    attempts: 67,
    averageScore: 68,
    maxMarks: 200,
    negativeMarking: true,
  },
  {
    id: 'test_mathematics_ch5',
    subject: 'Mathematics',
    chapter: 'Calculus',
    title: 'Differential Calculus Assessment',
    description: 'Test your calculus skills with application-based problems',
    difficulty: 'medium',
    totalQuestions: 12,
    timeLimit: 35,
    passingScore: 70,
    questionIds: ['m1_limits', 'm2_derivatives', 'm3_chain_rule', 'm4_implicit', 'm5_related_rates', 'm6_optimization', 'm7_tangent_line', 'm8_max_min', 'm9_curve_sketching', 'm10_continuity', 'm11_differentiability', 'm12_mean_value'],
    createdAt: new Date('2024-01-08'),
    attempts: 234,
    averageScore: 65,
    maxMarks: 120,
    negativeMarking: false,
  },
];

// Mock question pool
const questionPool = new Map<string, any>([
  ['q1_force', { question: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correct: 0 }],
  ['q2_motion', { question: 'Which law states F=ma?', options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Gravitation'], correct: 1 }],
]);

export const usePracticeTestStore = create<PracticeTestState>()(
  persist(
    (set, get) => ({
      tests: initialTests,
      testSessions: [],
      questions: questionPool,
      
      getPracticeTests: async (filters) => {
        const state = get();
        let filteredTests = [...state.tests];
        
        if (filters?.subject) {
          filteredTests = filteredTests.filter(test => test.subject === filters.subject);
        }
        
        if (filters?.difficulty) {
          filteredTests = filteredTests.filter(test => test.difficulty === filters.difficulty);
        }
        
        // Sort by attempts (popularity) and average score (quality)
        return filteredTests.sort((a, b) => {
          if (b.attempts !== a.attempts) return b.attempts - a.attempts;
          return b.averageScore - a.averageScore;
        });
      },
      
      getTopTestsBySubject: async (subject: string, limit: number = 3) => {
        const tests = await get().getPracticeTests({ subject });
        return tests.slice(0, limit);
      },
      
      getPracticeTest: async (testId: string) => {
        const state = get();
        return state.tests.find(test => test.id === testId) || null;
      },
      
      startPracticeTest: async (testId: string, userId: string) => {
        const test = await get().getPracticeTest(testId);
        if (!test) {
          throw new Error('Test not found');
        }
        
        // Check if there's already an active session
        const existingSession = get().testSessions.find(
          session => session.testId === testId && session.userId === userId && !session.submitted
        );
        
        if (existingSession) {
          return existingSession;
        }
        
        const sessionId = `session_${Date.now()}`;
        const session: TestSession = {
          id: sessionId,
          testId,
          userId,
          startTime: new Date(),
          endTime: new Date(Date.now() + test.timeLimit * 60 * 1000), // Add time limit
          answers: {},
          markedForReview: [],
          submitted: false,
          flaggedQuestions: [],
        };
        
        set(state => ({
          testSessions: [...state.testSessions, session],
        }));
        
        return session;
      },
      
      retryTest: async (testId: string, userId: string) => {
        // Find previous completed session
        const previousSessions = get().testSessions.filter(
          session => session.testId === testId && session.userId === userId && session.submitted
        );
        
        // Start a new session
        return get().startPracticeTest(testId, userId);
      },
      
      submitPracticeTest: async (testSessionId: string, answers: Record<number, string>) => {
        const state = get();
        const session = state.testSessions.find(s => s.id === testSessionId);
        
        if (!session) {
          throw new Error('Test session not found');
        }
        
        if (session.submitted) {
          throw new Error('Test already submitted');
        }
        
        const test = state.tests.find(t => t.id === session.testId);
        if (!test) {
          throw new Error('Test not found');
        }
        
        // Calculate score
        let correctAnswers = 0;
        const answerEntries = Object.entries(answers);
        
        // Compare answers with correct answers from question pool
        answerEntries.forEach(([questionIndex, answer]) => {
          const questionId = test.questionIds[parseInt(questionIndex)];
          const question = state.questions.get(questionId);
          
          if (question && question.correct === parseInt(answer)) {
            correctAnswers++;
          }
        });
        
        const incorrectAnswers = answerEntries.length - correctAnswers;
        const penalty = incorrectAnswers * (test.negativeMarking ? 0.25 : 0);
        
        const score = Math.max(0, (correctAnswers * (test.maxMarks / test.totalQuestions)) - penalty);
        const percentage = Math.round((score / test.maxMarks) * 100);
        const passed = percentage >= test.passingScore;
        const timeSpent = Math.floor((Date.now() - session.startTime.getTime()) / (60 * 1000)); // minutes
        
        const updatedSession: TestSession = {
          ...session,
          answers,
          submitted: true,
          score,
          percentage,
          passed,
          timeSpent,
        };
        
        set(state => ({
          testSessions: state.testSessions.map(s => 
            s.id === testSessionId ? updatedSession : s
          ),
        }));
        
        // Update test stats
        set(state => ({
          tests: state.tests.map(t => 
            t.id === test.id 
              ? {
                  ...t,
                  attempts: t.attempts + 1,
                  averageScore: Math.round(((t.averageScore * (t.attempts - 1)) + percentage) / t.attempts),
                }
              : t
          ),
        }));
        
        return updatedSession;
      },
      
      getPracticeTestHistory: async (userId: string) => {
        const state = get();
        return state.testSessions
          .filter(session => session.userId === userId && session.submitted)
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      },
      
      getTestResults: async (sessionId: string) => {
        const state = get();
        return state.testSessions.find(session => session.id === sessionId) || null;
      },
      
      generateMockExam: async (subject: string, chapters: string[], difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 20) => {
        const sessionId = `mock_${Date.now()}`;
        
        // Calculate parameters based on difficulty
        const difficultyConfig = {
          easy: { passingScore: 75, timeLimit: 30, negativeMarking: false },
          medium: { passingScore: 70, timeLimit: 45, negativeMarking: true },
          hard: { passingScore: 65, timeLimit: 60, negativeMarking: true },
        };
        
        const config = difficultyConfig[difficulty];
        
        const mockTest: PracticeTest = {
          id: sessionId,
          subject,
          chapter: chapters.join(', '),
          title: `Mock Exam: ${subject} - ${chapters.join(', ')}`,
          description: `Custom mock exam covering ${chapters.length} chapters`,
          difficulty,
          totalQuestions: questionCount,
          timeLimit: config.timeLimit,
          passingScore: config.passingScore,
          questionIds: Array.from({ length: questionCount }, (_, i) => `mock_q${i + 1}`),
          createdAt: new Date(),
          attempts: 0,
          averageScore: 0,
          maxMarks: questionCount * 4, // 4 marks per question
          isMockExam: true,
          negativeMarking: config.negativeMarking,
        };
        
        set(state => ({
          tests: [...state.tests, mockTest],
        }));
        
        return mockTest;
      },
      
      getAverageScoreBySubject: async (userId: string) => {
        const state = get();
        const sessions = state.testSessions.filter(
          session => session.userId === userId && session.submitted
        );
        
        const subjectScores: Record<string, number[]> = {};
        
        sessions.forEach(session => {
          const test = state.tests.find(t => t.id === session.testId);
          if (test && session.percentage !== undefined) {
            if (!subjectScores[test.subject]) {
              subjectScores[test.subject] = [];
            }
            subjectScores[test.subject].push(session.percentage);
          }
        });
        
        const averages: Record<string, number> = {};
        Object.entries(subjectScores).forEach(([subject, scores]) => {
          averages[subject] = Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          );
        });
        
        return averages;
      },
      
      getPerformanceTrend: async (userId: string) => {
        const state = get();
        const sessions = state.testSessions
          .filter(session => session.userId === userId && session.submitted)
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .slice(-10); // Last 10 sessions
        
        return sessions.map(session => ({
          date: session.startTime,
          score: session.percentage || 0,
        }));
      },
      
    }),
    {
      name: 'learnsmart-practice-tests',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tests: state.tests,
        testSessions: state.testSessions,
      }),
    }
  )
);

// Helper hook to get best test performance
export const useBestTestPerformance = (userId: string, testId?: string) => {
  const { testSessions } = usePracticeTestStore();
  
  const userSessions = testSessions.filter(
    session => session.userId === userId && session.submitted
  );
  
  if (testId) {
    const testSessions = userSessions.filter(session => session.testId === testId);
    return testSessions.reduce((best, session) => 
      (session.percentage || 0) > (best?.percentage || 0) ? session : best
    , null as TestSession | null);
  }
  
  return userSessions.reduce((best, session) => 
    (session.percentage || 0) > (best?.percentage || 0) ? session : best
  , null as TestSession | null);
};

// Helper hook to get recent test activity
export const useRecentTestActivity = (userId: string, limit: number = 5) => {
  const { testSessions } = usePracticeTestStore();
  
  return testSessions
    .filter(session => session.userId === userId && session.submitted)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit);
};

export { usePracticeTestStore };