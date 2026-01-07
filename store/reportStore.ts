import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pdfService } from '../utils/pdfService';

export interface SubjectPerformance {
  subject: string;
  score: number; // 0-100
  improvement?: number; // percentage change from previous period
  topicsMastered: number;
  topicsTotal: number;
  lessonsCompleted: number;
  hoursStudied: number;
}

export interface ReportData {
  lessonsCompleted: number;
  chaptersCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  testsTaken: number;
  averageTestScore: number;
  totalLearningTime: number; // in hours
  achievementsUnlocked: number;
  certificatesEarned: number;
  improvementPercentage: number;
  subjectWisePerformance: SubjectPerformance[];
  topicsMastered: string[];
  topicsToFocus: string[];
  strongestSubject: string;
  weakestSubject: string;
  studyStreak: number;
  longestStreak: number;
  totalXP: number;
  rank?: string;
  leaderboardPosition?: number;
}

export interface Report {
  id: string;
  userId: string;
  type: 'weekly' | 'monthly' | 'semester';
  generatedAt: Date;
  startDate: Date;
  endDate: Date;
  data: ReportData;
  pdfUrl?: string;
  shared: boolean;
  sharedWith: string[]; // list of user IDs
}

interface ReportState {
  reports: Report[];
  
  // Actions
  generateWeeklyReport: (userId: string) => Promise<Report>;
  generateMonthlyReport: (userId: string) => Promise<Report>;
  generateSemesterReport: (userId: string, semester: number) => Promise<Report>;
  generateCustomReport: (userId: string, startDate: Date, endDate: Date) => Promise<Report>;
  getReportHistory: (userId: string) => Promise<Report[]>;
  downloadReport: (reportId: string) => Promise<void>;
  shareReport: (reportId: string, recipients: string[], message?: string) => Promise<void>;
  getTopPerformingSubjects: (userId: string, reportId?: string) => Promise<SubjectPerformance[]>;
  getImprovementTrend: (userId: string, months?: number) => Promise<{ month: string; improvement: number }[]>;
  scheduleAutomaticReports: (userId: string, schedule: { weekly?: boolean; monthly?: boolean }) => Promise<void>;
  getReportStats: (userId: string) => Promise<{ totalReports: number; averageScore: number; improvements: number }>;
}

// Mock data generator
function generateMockReportData(userId: string, days: number = 7): ReportData {
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const performance: ReportData = {
    lessonsCompleted: Math.floor(Math.random() * 20) + 5,
    chaptersCompleted: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
    quizzesTaken: Math.floor(Math.random() * 15) + 3,
    averageQuizScore: Math.floor(Math.random() * 30) + 65,
    testsTaken: Math.floor(Math.random() * 5) + 1,
    averageTestScore: Math.floor(Math.random() * 25) + 60,
    totalLearningTime: Math.random() * 10 + 2, // 2-12 hours
    achievementsUnlocked: Math.floor(Math.random() * 3) + 1,
    certificatesEarned: 0,
    improvementPercentage: Math.random() * 20 + 5, // 5-25%
    subjectWisePerformance: subjects.map(subject => ({
      subject,
      score: Math.floor(Math.random() * 40) + 60,
      improvement: Math.random() * 15 - 5, // -5 to +10%
      topicsMastered: Math.floor(Math.random() * 8) + 2,
      topicsTotal: Math.floor(Math.random() * 5) + 10,
      lessonsCompleted: Math.floor(Math.random() * 8) + 2,
      hoursStudied: Math.random() * 5 + 0.5
    })).sort((a, b) => b.score - a.score),
    topicsMastered: ['Newton\'s Laws', 'Chemical Bonding', 'Quadratic Equations', 'Cell Structure'],
    topicsToFocus: ['Organic Chemistry', 'Integration Techniques', 'Electromagnetism'],
    strongestSubject: 'Mathematics',
    weakestSubject: 'Chemistry',
    studyStreak: Math.floor(Math.random() * 50) + 1,
    longestStreak: Math.floor(Math.random() * 100) + 20,
    totalXP: Math.floor(Math.random() * 1000) + 5000,
    rank: 'Bronze',
    leaderboardPosition: Math.floor(Math.random() * 100) + 50
  };
  
  // Determine strongest and weakest subjects
  const sortedByScore = [...performance.subjectWisePerformance].sort((a, b) => a.score - b.score);
  performance.strongestSubject = sortedByScore[sortedByScore.length - 1].subject;
  performance.weakestSubject = sortedByScore[0].subject;
  
  return performance;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      
      generateWeeklyReport: async (userId: string) => {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        
        const reportData = generateMockReportData(userId, 7);
        const pdfResult = await pdfService.exportProgressReport(userId, { start: startDate, end: endDate }, { quality: 'high' });
        
        const report: Report = {
          id: `report_weekly_${Date.now()}`,
          userId,
          type: 'weekly',
          generatedAt: new Date(),
          startDate,
          endDate,
          data: reportData,
          pdfUrl: pdfResult.url,
          shared: false,
          sharedWith: []
        };
        
        set(state => ({
          reports: [...state.reports, report]
        }));
        
        return report;
      },
      
      generateMonthlyReport: async (userId: string) => {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);
        
        const reportData = generateMockReportData(userId, 30);
        const pdfResult = await pdfService.exportProgressReport(userId, { start: startDate, end: endDate }, { quality: 'high' });
        
        const report: Report = {
          id: `report_monthly_${Date.now()}`,
          userId,
          type: 'monthly',
          generatedAt: new Date(),
          startDate,
          endDate,
          data: reportData,
          pdfUrl: pdfResult.url,
          shared: false,
          sharedWith: []
        };
        
        set(state => ({
          reports: [...state.reports, report]
        }));
        
        return report;
      },
      
      generateSemesterReport: async (userId: string, semester: number) => {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 120); // Approx 4 months
        
        const reportData = generateMockReportData(userId, 120);
        const pdfResult = await pdfService.exportProgressReport(userId, { start: startDate, end: endDate }, { quality: 'high' });
        
        const report: Report = {
          id: `report_semester_${Date.now()}`,
          userId,
          type: 'semester',
          generatedAt: new Date(),
          startDate,
          endDate,
          data: reportData,
          pdfUrl: pdfResult.url,
          shared: false,
          sharedWith: []
        };
        
        set(state => ({
          reports: [...state.reports, report]
        }));
        
        return report;
      },
      
      generateCustomReport: async (userId: string, startDate: Date, endDate: Date) => {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const reportData = generateMockReportData(userId, days);
        const pdfResult = await pdfService.exportProgressReport(userId, { start: startDate, end: endDate }, { quality: 'high' });
        
        const report: Report = {
          id: `report_custom_${Date.now()}`,
          userId,
          type: 'weekly', // Default to weekly for custom
          generatedAt: new Date(),
          startDate,
          endDate,
          data: reportData,
          pdfUrl: pdfResult.url,
          shared: false,
          sharedWith: []
        };
        
        set(state => ({
          reports: [...state.reports, report]
        }));
        
        return report;
      },
      
      getReportHistory: async (userId: string) => {
        const state = get();
        return state.reports
          .filter(report => report.userId === userId)
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
      },
      
      downloadReport: async (reportId: string) => {
        const state = get();
        const report = state.reports.find(r => r.id === reportId);
        
        if (!report || !report.pdfUrl) {
          throw new Error('Report or PDF not found');
        }
        
        // Download the PDF
        await pdfService.downloadPDF(report.pdfUrl, `LearnSmart_${report.type}_report.pdf`);
      },
      
      shareReport: async (reportId: string, recipients: string[], message?: string) => {
        const state = get();
        const report = state.reports.find(r => r.id === reportId);
        
        if (!report || !report.pdfUrl) {
          throw new Error('Report or PDF not found');
        }
        
        // Share the PDF
        await pdfService.sharePDF(
          report.pdfUrl, 
          message || `Here's my LearnSmart progress report for ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`
        );
        
        // Update report state
        set(state => ({
          reports: state.reports.map(r => 
            r.id === reportId 
              ? { ...r, shared: true, sharedWith: [...r.sharedWith, ...recipients] }
              : r
          )
        }));
      },
      
      getTopPerformingSubjects: async (userId: string, reportId?: string) => {
        const state = get();
        
        if (reportId) {
          const report = state.reports.find(r => r.id === reportId);
          return report?.data.subjectWisePerformance || [];
        }
        
        // Return latest report data
        const latestReport = state.reports
          .filter(r => r.userId === userId)
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0];
        
        return latestReport?.data.subjectWisePerformance || [];
      },
      
      getImprovementTrend: async (userId: string, months: number = 6) => {
        const state = get();
        const reports = state.reports
          .filter(r => r.userId === userId && r.type === 'monthly')
          .sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime())
          .slice(-months);
        
        return reports.map(report => ({
          month: report.generatedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          improvement: report.data.improvementPercentage
        }));
      },
      
      scheduleAutomaticReports: async (userId: string, schedule: { weekly?: boolean; monthly?: boolean; }) => {
        // In real implementation, would set up recurring report generation
        // For now, just create immediate reports as scheduled
        if (schedule.weekly) {
          await get().generateWeeklyReport(userId);
        }
        if (schedule.monthly) {
          await get().generateMonthlyReport(userId);
        }
      },
      
      getReportStats: async (userId: string) => {
        const state = get();
        const reports = state.reports.filter(r => r.userId === userId);
        
        return {
          totalReports: reports.length,
          averageScore: Math.round(
            reports.reduce((sum, r) => sum + r.data.averageQuizScore, 0) / Math.max(1, reports.length)
          ),
          improvements: reports.filter(r => r.data.improvementPercentage > 10).length
        };
      },
      
    }),
    {
      name: 'learnsmart-reports',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reports: state.reports,
      }),
    }
  )
);

// Helper hook to get latest report
export const useLatestReport = (userId: string) => {
  const { reports } = useReportStore();
  return reports
    .filter(r => r.userId === userId)
    .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0];
};

// Helper to get report by type
export const useReportsByType = (userId: string, type: 'weekly' | 'monthly' | 'semester') => {
  const { reports } = useReportStore();
  return reports
    .filter(r => r.userId === userId && r.type === type)
    .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
};

// Helper to get average improvement
export const useAverageImprovement = (userId: string) => {
  const { reports } = useReportStore();
  const userReports = reports.filter(r => r.userId === userId);
  
  if (userReports.length === 0) return 0;
  
  return userReports.reduce((sum, report) => sum + report.data.improvementPercentage, 0) / userReports.length;
};

export { useReportStore };