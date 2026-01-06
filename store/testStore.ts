import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurriculumStore } from './curriculumStore';
import { useXPStore } from '@/store/xpStore';
import { useStreakStore } from '@/store/streakStore';
import { useBadgeStore } from '@/store/badgeStore';

export interface Question {
  id: string;
  topicId: string;
  chapterId: string;
  subjectId: string;
  classId: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: number;
  relatedConcept?: string;
}

export interface TestResult {
  testId: string;
  testType: 'quick' | 'specific';
  classId: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
  questions: Question[];
  userAnswers: number[];
  scoreBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

interface TestSession {
  testId: string;
  currentQuestionIndex: number;
  questions: Question[];
  userAnswers: number[];
  startTime: number;
  testType: 'quick' | 'specific';
  classId: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
}

interface TestState {
  testHistory: TestResult[];
  currentSession: TestSession | null;
  recentlyAskedQuestionIds: string[];
  
  // Session Management
  startTest: (session: Omit<TestSession, 'testId' | 'startTime' | 'currentQuestionIndex' | 'userAnswers'>) => string;
  answerQuestion: (answerIndex: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  getCurrentQuestion: () => Question | null;
  submitTest: () => TestResult | null;
  cancelTest: () => void;
  
  // Question Generation
  generateQuickTestQuestions: (topicId: string, classId: string, subjectId: string, chapterId: string) => Question[];
  generateSpecificTestQuestions: (classId: string, subjectId: string, chapterId: string) => Question[];
  
  // History
  getTestHistory: () => TestResult[];
  getTestHistoryForChapter: (chapterId: string) => TestResult[];
  getTestHistoryForTopic: (topicId: string) => TestResult[];
  
  // Question Pool Management
  markQuestionAsAsked: (questionId: string) => void;
  isQuestionRecentlyAsked: (questionId: string) => boolean;
  clearRecentlyAsked: () => void;
  
  // Analytics
  getAverageScore: () => number;
  getTotalTestsTaken: () => number;
}

const generateQuestionId = (): string => {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateTestId = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to generate multiple choice questions from concept content
const generateQuestionFromConcept = (
  concept: any,
  topicId: string,
  chapterId: string,
  subjectId: string,
  classId: string,
  allTopicConcepts?: any[]
): Question => {
  const questionType: 'multiple-choice' | 'true-false' = Math.random() > 0.3 ? 'multiple-choice' : 'true-false';
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

  let question: string;
  let options: string[];
  let correctAnswer: number;
  let explanation: string;

  if (questionType === 'true-false') {
    // Generate true/false questions from key takeaways or content
    const isTrue = Math.random() > 0.5;
    const statement = concept.keyTakeaway || concept.content;

    if (isTrue) {
      question = `True or False: ${statement}`;
      options = ['True', 'False'];
      correctAnswer = 0;
      explanation = `This statement is correct. ${statement}`;
    } else {
      // Create a slightly modified false statement
      const falseStatement = statement.replace(/is/g, 'is not').replace(/are/g, 'are not').replace(/help/g, 'hinder');
      question = `True or False: ${falseStatement}`;
      options = ['True', 'False'];
      correctAnswer = 1;
      explanation = `This statement is incorrect. The correct statement is: ${statement}`;
    }
  } else {
    // Generate multiple choice questions from content or bullets
    if (concept.bullets && concept.bullets.length > 0) {
      const correctBullet = concept.bullets[Math.floor(Math.random() * concept.bullets.length)];
      const [correctPrefix, ...correctParts] = correctBullet.split(' - ');
      const correctAnswerText = correctParts.join(' - ') || correctPrefix;

      // Create the question
      question = `Based on the concept "${concept.title}", which of the following is correct?`;

      // Generate options from all concepts in the topic
      const allBullets = (allTopicConcepts || [])
        .flatMap(c => c.bullets)
        .filter(b => b !== correctBullet);

      options = [correctAnswerText];

      // Add 3 wrong options
      for (let i = 0; i < 3 && i < allBullets.length; i++) {
        const randomIndex = Math.floor(Math.random() * allBullets.length);
        const [_, ...parts] = allBullets[randomIndex].split(' - ');
        const wrongAnswer = parts.join(' - ') || allBullets[randomIndex];
        if (!options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
        allBullets.splice(randomIndex, 1);
      }

      // Fill with generic options if needed
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`);
      }

      // Shuffle options
      correctAnswer = 0;
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
        if (i === 0 && options[0] === correctAnswerText) {
          correctAnswer = 0;
        } else if (options[i] === correctAnswerText) {
          correctAnswer = i;
        }
      }

      explanation = `The correct answer is "${correctAnswerText}". ${concept.keyTakeaway}`;
    } else {
      // Generate from content
      question = `What is the main idea of "${concept.title}"?`;
      options = [
        concept.keyTakeaway,
        concept.content.substring(0, 50) + '...',
        'None of the above',
        'All of the above'
      ];
      correctAnswer = 0;
      explanation = `${concept.keyTakeaway}`;
    }
  }

  return {
    id: generateQuestionId(),
    topicId,
    chapterId,
    subjectId,
    classId,
    type: questionType,
    question,
    options,
    correctAnswer,
    explanation,
    difficulty,
    timestamp: Date.now(),
    relatedConcept: concept.title,
  };
};

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      testHistory: [],
      currentSession: null,
      recentlyAskedQuestionIds: [],
      
      startTest: (sessionData) => {
        const testId = generateTestId();
        const session: TestSession = {
          ...sessionData,
          testId,
          currentQuestionIndex: 0,
          userAnswers: new Array(sessionData.questions.length).fill(-1),
          startTime: Date.now(),
        };
        set({ currentSession: session });
        return testId;
      },
      
      answerQuestion: (answerIndex: number) => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const updatedAnswers = [...state.currentSession.userAnswers];
          updatedAnswers[state.currentSession.currentQuestionIndex] = answerIndex;
          
          return {
            currentSession: {
              ...state.currentSession,
              userAnswers: updatedAnswers,
            },
          };
        });
      },
      
      goToNextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;
          if (state.currentSession.currentQuestionIndex < state.currentSession.questions.length - 1) {
            return {
              currentSession: {
                ...state.currentSession,
                currentQuestionIndex: state.currentSession.currentQuestionIndex + 1,
              },
            };
          }
          return state;
        });
      },
      
      goToPreviousQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;
          if (state.currentSession.currentQuestionIndex > 0) {
            return {
              currentSession: {
                ...state.currentSession,
                currentQuestionIndex: state.currentSession.currentQuestionIndex - 1,
              },
            };
          }
          return state;
        });
      },
      
      getCurrentQuestion: () => {
        const session = get().currentSession;
        if (!session) return null;
        return session.questions[session.currentQuestionIndex];
      },
      
      submitTest: () => {
        const session = get().currentSession;
        if (!session) return null;
        
        const endTime = Date.now();
        const timeTaken = endTime - session.startTime;
        
        let correctAnswers = 0;
        let easyScore = { correct: 0, total: 0 };
        let mediumScore = { correct: 0, total: 0 };
        let hardScore = { correct: 0, total: 0 };
        
        session.questions.forEach((question, index) => {
          const userAnswer = session.userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          
          if (isCorrect) correctAnswers++;
          
          if (question.difficulty === 'easy') {
            easyScore.total++;
            if (isCorrect) easyScore.correct++;
          } else if (question.difficulty === 'medium') {
            mediumScore.total++;
            if (isCorrect) mediumScore.correct++;
          } else {
            hardScore.total++;
            if (isCorrect) hardScore.correct++;
          }
        });
        
        const result: TestResult = {
          testId: session.testId,
          testType: session.testType,
          classId: session.classId,
          subjectId: session.subjectId,
          chapterId: session.chapterId,
          topicId: session.topicId,
          score: Math.round((correctAnswers / session.questions.length) * 100),
          totalQuestions: session.questions.length,
          correctAnswers,
          timeTaken,
          completedAt: new Date().toISOString(),
          questions: session.questions,
          userAnswers: session.userAnswers,
          scoreBreakdown: {
            easy: easyScore,
            medium: mediumScore,
            hard: hardScore,
          },
        };
        
        // Mark questions as asked
        const newAskedIds = session.questions.map(q => q.id);
        set((state) => ({
          testHistory: [result, ...state.testHistory],
          currentSession: null,
          recentlyAskedQuestionIds: [...state.recentlyAskedQuestionIds, ...newAskedIds].slice(-200), // Keep last 200
        }));

        applyGamificationForTestResult(result);

        return result;
      },
      
      cancelTest: () => {
        set({ currentSession: null });
      },
      
      generateQuickTestQuestions: (topicId, classId, subjectId, chapterId) => {
        const topic = useCurriculumStore.getState().getTopic(topicId);
        if (!topic || topic.concepts.length === 0) return [];

        // Generate 3-5 questions from concepts
        const numQuestions = Math.min(3 + Math.floor(Math.random() * 3), topic.concepts.length);
        const questions: Question[] = [];

        for (let i = 0; i < numQuestions; i++) {
          const concept = topic.concepts[i % topic.concepts.length];
          const question = generateQuestionFromConcept(
            concept,
            topicId,
            chapterId,
            subjectId,
            classId,
            topic.concepts // Pass all topic concepts for generating diverse options
          );
          questions.push(question);
        }

        return questions;
      },
      
      generateSpecificTestQuestions: (classId, subjectId, chapterId) => {
        const chapter = useCurriculumStore.getState().getChapter(chapterId);
        if (!chapter || chapter.topics.length === 0) return [];

        // Generate 10+ questions from all topics in the chapter
        const questions: Question[] = [];
        let conceptIndex = 0;

        for (const topic of chapter.topics) {
          for (const concept of topic.concepts) {
            if (questions.length >= 15) break; // Max 15 questions

            const question = generateQuestionFromConcept(
              concept,
              topic.id,
              chapterId,
              subjectId,
              classId,
              topic.concepts // Pass all topic concepts for generating diverse options
            );
            questions.push(question);
            conceptIndex++;
          }
          if (questions.length >= 15) break;
        }

        // Ensure minimum 10 questions
        while (questions.length < 10 && chapter.topics.length > 0) {
          const randomTopic = chapter.topics[Math.floor(Math.random() * chapter.topics.length)];
          if (randomTopic.concepts.length > 0) {
            const randomConcept = randomTopic.concepts[Math.floor(Math.random() * randomTopic.concepts.length)];
            const question = generateQuestionFromConcept(
              randomConcept,
              randomTopic.id,
              chapterId,
              subjectId,
              classId,
              randomTopic.concepts // Pass all topic concepts for generating diverse options
            );
            questions.push(question);
          }
        }

        return questions;
      },
      
      getTestHistory: () => {
        return get().testHistory;
      },
      
      getTestHistoryForChapter: (chapterId) => {
        return get().testHistory.filter(t => t.chapterId === chapterId);
      },
      
      getTestHistoryForTopic: (topicId) => {
        return get().testHistory.filter(t => t.topicId === topicId);
      },
      
      markQuestionAsAsked: (questionId) => {
        set((state) => ({
          recentlyAskedQuestionIds: [...state.recentlyAskedQuestionIds, questionId].slice(-200),
        }));
      },
      
      isQuestionRecentlyAsked: (questionId) => {
        return get().recentlyAskedQuestionIds.includes(questionId);
      },
      
      clearRecentlyAsked: () => {
        set({ recentlyAskedQuestionIds: [] });
      },
      
      getAverageScore: () => {
        const history = get().testHistory;
        if (history.length === 0) return 0;
        const sum = history.reduce((acc, result) => acc + result.score, 0);
        return Math.round(sum / history.length);
      },
      
      getTotalTestsTaken: () => {
        return get().testHistory.length;
      },
    }),
    {
      name: 'learnsmart-tests',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function applyGamificationForTestResult(result: TestResult) {
  try {
    const xpItems: Array<{ amount: number; type: 'quiz-correct' | 'quiz-streak' | 'difficulty-multiplier'; description: string }> = [];

    let consecutiveCorrect = 0;

    result.questions.forEach((q, idx) => {
      const userAnswer = result.userAnswers[idx];
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        consecutiveCorrect += 1;

        if (q.difficulty === 'hard') {
          xpItems.push({
            amount: 100,
            type: 'difficulty-multiplier',
            description: 'Hard question correct',
          });
        } else {
          xpItems.push({
            amount: 50,
            type: 'quiz-correct',
            description: 'Correct answer',
          });
        }

        if (consecutiveCorrect % 3 === 0) {
          xpItems.push({
            amount: 20,
            type: 'quiz-streak',
            description: '3 correct answers streak bonus',
          });
        }
      } else {
        consecutiveCorrect = 0;
      }
    });

    if (result.score === 100) {
      xpItems.push({
        amount: 150,
        type: 'quiz-streak',
        description: 'Perfect score bonus',
      });
    }

    void useXPStore.getState().addXPBatch(xpItems);

    useStreakStore.getState().updateStreak();

    const badgeStore = useBadgeStore.getState();

    const totalQuizzes = useTestStore.getState().testHistory.length;
    void badgeStore.checkAndUnlockBadges('quizzes_completed', totalQuizzes);

    if (result.timeTaken > 0 && result.timeTaken < 2 * 60 * 1000) {
      void badgeStore.checkAndUnlockBadges('speed_runner', 1);
    }

    const perfectStreak = (() => {
      const history = useTestStore.getState().testHistory;
      let count = 0;
      for (const r of history) {
        if (r.score === 100) count += 1;
        else break;
      }
      return count;
    })();

    void badgeStore.checkAndUnlockBadges('perfect_scores_streak', perfectStreak);

    const conceptIds = result.questions
      .map((q) => q.relatedConcept)
      .filter((c): c is string => Boolean(c));

    badgeStore.addLearnedConcepts(conceptIds);
    const learnedCount = badgeStore.getLearnedConceptCount();
    void badgeStore.checkAndUnlockBadges('concepts_learned', learnedCount);
  } catch (e) {
    console.warn('Gamification apply failed', e);
  }
}
