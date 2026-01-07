import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string; // '10:00'
  endTime: string; // '11:00'
  available: boolean;
  price?: number; // in rupees
}

export interface Tutor {
  id: string;
  name: string;
  qualifications: string;
  subjects: Array<string>;
  bio: string;
  profilePic: string;
  rating: number; // 1-5
  hourlyRate: number; // in rupees
  availability: Array<TimeSlot>;
  responseTime: number; // in minutes
  totalSessions: number;
  verified: boolean;
  experience: number; // years
  languages: Array<string>;
  specializedTopics: Array<string>;
}

export interface Session {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  topic: string;
  scheduledAt: Date;
  duration: number; // 30 or 60 minutes
  rate: number; // session cost
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink?: string; // Zoom/Google Meet
  notes?: string; // session notes
  feedback?: {
    rating: number;
    comment?: string;
  };
  recordingUrl?: string;
  createdAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledBy?: 'student' | 'tutor';
}

export interface BookingRequest {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  topic: string;
  requestTimeSlots: Array<TimeSlot>;
  duration: number;
  studentMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout';
  createdAt: Date;
  acceptedAt?: Date;
}

interface TutoringState {
  tutors: Tutor[];
  sessions: Session[];
  bookingRequests: BookingRequest[];
  
  // Actions
  getTutors: (filters?: { subject?: string; rating?: number; maxRate?: number; }) => Promise<Tutor[]>;
  getTutorById: (tutorId: string) => Promise<Tutor | null>;
  getTutorAvailability: (tutorId: string) => Promise<TimeSlot[]>;
  bookSession: (tutorId: string, studentId: string, subject: string, topic: string, dateTime: Date, duration: number) => Promise<Session>;
  getUpcomingSessions: (userId: string) => Promise<Session[]>;
  getSessionHistory: (userId: string) => Promise<Session[]>;
  cancelSession: (sessionId: string, reason: string, cancelledBy: 'student' | 'tutor') => Promise<void>;
  rateTutor: (sessionId: string, rating: number, comment?: string) => Promise<void>;
  getSessionRecording: (sessionId: string) => Promise<string | null>;
  findTutorsForTopic: (subject: string, topic: string) => Promise<Tutor[]>;
  getTopRatedTutors: (limit?: number) => Promise<Tutor[]>;
  updateSessionStatus: (sessionId: string, status: Session['status']) => Promise<void>;
  getStudentStats: (studentId: string) => Promise<{ totalSessions: number; averageRating: number; totalHours: number }>;
  getTutorStats: (tutorId: string) => Promise<{ totalSessions: number; averageRating: number; totalEarnings: number }>;
}

// Initial tutor data
const initialTutors: Tutor[] = [
  {
    id: 'tutor_001',
    name: 'Dr. Priya Sharma',
    qualifications: 'PhD Physics, IIT Bombay',
    subjects: ['Physics'],
    bio: '10+ years experience in teaching JEE Physics with 100% student success rate',
    profilePic: 'https://example.com/avatars/dr-sharma.jpg',
    rating: 4.9,
    hourlyRate: 250,
    availability: generateTimeSlots('tutor_001', 15),
    responseTime: 15,
    totalSessions: 450,
    verified: true,
    experience: 12,
    languages: ['English', 'Hindi'],
    specializedTopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
  },
  {
    id: 'tutor_002',
    name: 'Prof. Amit Singh',
    qualifications: 'MSc Mathematics, 15 years teaching',
    subjects: ['Mathematics'],
    bio: 'Expert in Calculus, Algebra and Quantitative Aptitude for competitive exams',
    profilePic: 'https://example.com/avatars/prof-singh.jpg',
    rating: 4.8,
    hourlyRate: 200,
    availability: generateTimeSlots('tutor_002', 20),
    responseTime: 10,
    totalSessions: 320,
    verified: true,
    experience: 15,
    languages: ['English', 'Hindi', 'Punjabi'],
    specializedTopics: ['Calculus', 'Algebra', 'Trigonometry'],
  },
  {
    id: 'tutor_003',
    name: 'Dr. Rahul Patel',
    qualifications: 'PhD Chemistry, Former JEE Examiner',
    subjects: ['Chemistry'],
    bio: 'Specializes in Organic Chemistry with innovative teaching methods',
    profilePic: 'https://example.com/avatars/dr-patel.jpg',
    rating: 4.7,
    hourlyRate: 275,
    availability: generateTimeSlots('tutor_003', 12),
    responseTime: 20,
    totalSessions: 380,
    verified: true,
    experience: 8,
    languages: ['English', 'Gujarati'],
    specializedTopics: ['Organic Chemistry', 'Physical Chemistry', 'Inorganic Chemistry'],
  },
  {
    id: 'tutor_004',
    name: 'Prof. Maria Rodriguez',
    qualifications: 'PhD Biology, Medical Background',
    subjects: ['Biology'],
    bio: 'Medical professional turned educator with focus on NEET preparation',
    profilePic: 'https://example.com/avatars/prof-rodriguez.jpg',
    rating: 4.9,
    hourlyRate: 300,
    availability: generateTimeSlots('tutor_004', 18),
    responseTime: 25,
    totalSessions: 520,
    verified: true,
    experience: 14,
    languages: ['English', 'Hindi'],
    specializedTopics: ['Cell Biology', 'Genetics', 'Human Physiology'],
  },
];

function generateTimeSlots(tutorId: string, daysAhead: number = 14): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends for demo (optional)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate time slots (9 AM to 6 PM)
    for (let hour = 9; hour < 18; hour++) {
      const slotId = `${tutorId}_${date.toISOString().split('T')[0]}_${hour}`;
      slots.push({
        id: slotId,
        date: new Date(date),
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% availability for demo
      });
    }
  }
  
  return slots;
}

function calculateSessionPrice(hourlyRate: number, duration: number): number {
  return Math.round((hourlyRate * duration) / 60);
}

export const useTutoringStore = create<TutoringState>()(
  persist(
    (set, get) => ({
      tutors: initialTutors,
      sessions: [],
      bookingRequests: [],
      
      getTutors: async (filters) => {
        const state = get();
        let filteredTutors = [...state.tutors];
        
        if (filters?.subject) {
          filteredTutors = filteredTutors.filter(tutor => 
            tutor.subjects.includes(filters.subject!)
          );
        }
        
        if (filters?.rating) {
          filteredTutors = filteredTutors.filter(tutor => 
            tutor.rating >= filters.rating!
          );
        }
        
        if (filters?.maxRate) {
          filteredTutors = filteredTutors.filter(tutor => 
            tutor.hourlyRate <= filters.maxRate!
          );
        }
        
        // Sort by rating and experience
        return filteredTutors.sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.totalSessions - a.totalSessions;
        });
      },
      
      getTutorById: async (tutorId: string) => {
        const state = get();
        return state.tutors.find(tutor => tutor.id === tutorId) || null;
      },
      
      getTutorAvailability: async (tutorId: string) => {
        const tutor = await get().getTutorById(tutorId);
        return tutor?.availability.filter(slot => slot.available) || [];
      },
      
      findTutorsForTopic: async (subject: string, topic: string) => {
        const state = get();
        return state.tutors.filter(tutor => {
          const subjectMatch = tutor.subjects.includes(subject);
          const topicMatch = tutor.specializedTopics.some(specialized => 
            specialized.toLowerCase().includes(topic.toLowerCase())
          );
          const verifiedMatch = tutor.verified;
          return subjectMatch && topicMatch && verifiedMatch;
        }).sort((a, b) => b.rating - a.rating);
      },
      
      getTopRatedTutors: async (limit: number = 5) => {
        const state = get();
        return [...state.tutors]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit);
      },
      
      bookSession: async (tutorId: string, studentId: string, subject: string, topic: string, dateTime: Date, duration: number) => {
        const tutor = await get().getTutorById(tutorId);
        if (!tutor) {
          throw new Error('Tutor not found');
        }
        
        const sessionPrice = calculateSessionPrice(tutor.hourlyRate, duration);
        const sessionId = `session_${Date.now()}`;
        
        const newSession: Session = {
          id: sessionId,
          tutorId,
          studentId,
          subject,
          topic,
          scheduledAt: dateTime,
          duration,
          rate: sessionPrice,
          status: 'scheduled',
          meetingLink: `https://meet.jit.si/learnsmart-${sessionId}`, // Using Jitsi for demo
          createdAt: new Date(),
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
        }));
        
        return newSession;
      },
      
      getUpcomingSessions: async (userId: string) => {
        const state = get();
        const now = new Date();
        
        return state.sessions
          .filter(session => 
            (session.tutorId === userId || session.studentId === userId) &&
            session.status === 'scheduled' &&
            session.scheduledAt > now
          )
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      },
      
      getSessionHistory: async (userId: string) => {
        const state = get();
        
        return state.sessions
          .filter(session => 
            (session.tutorId === userId || session.studentId === userId) &&
            ['completed', 'cancelled'].includes(session.status)
          )
          .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
      },
      
      cancelSession: async (sessionId: string, reason: string, cancelledBy: 'student' | 'tutor') => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  status: 'cancelled',
                  cancellationReason: reason,
                  cancelledAt: new Date(),
                  cancelledBy,
                }
              : session
          ),
        }));
      },
      
      rateTutor: async (sessionId: string, rating: number, comment?: string) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, feedback: { rating, comment } }
              : s
          ),
        }));
        
        // Update tutor rating
        await get().updateTutorRating(session.tutorId);
      },
      
      updateTutorRating: async (tutorId: string) => {
        const sessions = get().sessions.filter(s => s.tutorId === tutorId && s.feedback);
        if (sessions.length === 0) return;
        
        const averageRating = sessions.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / sessions.length;
        
        set(state => ({
          tutors: state.tutors.map(tutor =>
            tutor.id === tutorId
              ? { ...tutor, rating: Math.round(averageRating * 10) / 10 }
              : tutor
          ),
        }));
      },
      
      getSessionRecording: async (sessionId: string) => {
        const session = get().sessions.find(s => s.id === sessionId);
        return session?.recordingUrl || null;
      },
      
      updateSessionStatus: async (sessionId: string, status: Session['status']) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, status }
              : session
          ),
        }));
      },
      
      getStudentStats: async (studentId: string) => {
        const sessions = get().sessions.filter(s => s.studentId === studentId);
        const completedSessions = sessions.filter(s => s.status === 'completed');
        
        return {
          totalSessions: completedSessions.length,
          averageRating: completedSessions.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / Math.max(1, completedSessions.length),
          totalHours: completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60, // Convert minutes to hours
        };
      },
      
      getTutorStats: async (tutorId: string) => {
        const sessions = get().sessions.filter(s => s.tutorId === tutorId);
        const completedSessions = sessions.filter(s => s.status === 'completed');
        
        return {
          totalSessions: completedSessions.length,
          averageRating: completedSessions.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / Math.max(1, completedSessions.length),
          totalEarnings: completedSessions.reduce((sum, s) => sum + s.rate, 0),
        };
      },
      
    }),
    {
      name: 'learnsmart-tutoring',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tutors: state.tutors,
        sessions: state.sessions,
        bookingRequests: state.bookingRequests,
      }),
    }
  )
);

// Helper hook for booking management
export const useTutoringStats = (userId: string) => {
  const { sessions, tutors } = useTutoringStore();
  
  const upcomingSessions = sessions.filter(
    session => 
      session.status === 'scheduled' && 
      (session.tutorId === userId || session.studentId === userId)
  ).length;
  
  const completedSessions = sessions.filter(
    session => 
      session.status === 'completed' && 
      (session.tutorId === userId || session.studentId === userId)
  ).length;
  
  const nextSession = sessions
    .filter(session => 
      session.status === 'scheduled' && 
      (session.tutorId === userId || session.studentId === userId)
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
  
  return {
    upcomingSessions,
    completedSessions,
    nextSession,
  };
};

export { useTutoringStore };