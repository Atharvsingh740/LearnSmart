import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReportStore } from '../../../store/reportStore';
import { useUserStore } from '../../../store/userStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';
import ProgressBar from '../../../components/ProgressBar';

export default function ReportsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  
  const { 
    getReportHistory,
    generateWeeklyReport,
    generateMonthlyReport,
    generateSemesterReport,
    downloadReport,
    shareReport
  } = useReportStore();

  const loadReports = async () => {
    try {
      const reportHistory = await getReportHistory(userId);
      setReports(reportHistory);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleGenerateReport = async (type: 'weekly' | 'monthly' | 'semester') => {
    try {
      switch(type) {
        case 'weekly':
          await generateWeeklyReport(userId);
          break;
        case 'monthly':
          await generateMonthlyReport(userId);
          break;
        case 'semester':
          await generateSemesterReport(userId, 1);
          break;
      }
      await loadReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      await downloadReport(reportId);
      navigation.navigate('downloads', { reportId });
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleShare = async (reportId: string) => {
    try {
      await shareReport(reportId, [], 'Check out my progress report!');
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress Reports</Text>
          <Text style={styles.subtitle}>Track your learning journey</Text>
        </View>

        {/* Quick Generate Section */}
        <View style={styles.generateSection}>
          <Text style={styles.sectionTitle}>Quick Generate</Text>
          <View style={styles.generateButtons}>
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: COLORS.SAGE_PRIMARY }]}
              onPress={() => handleGenerateReport('weekly')}
            >
              <Text style={styles.buttonText}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: COLORS.FOREST_ACCENT }]}
              onPress={() => handleGenerateReport('monthly')}
            >
              <Text style={styles.buttonText}>This Month</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: COLORS.AMBER_GOLD }]}
              onPress={() => handleGenerateReport('semester')}
            >
              <Text style={styles.buttonText}>Semester</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reports generated yet</Text>
              <Text style={styles.emptySubtext}>Use the buttons above to create your first report</Text>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportType}>
                    {report.type.toUpperCase()} REPORT
                  </Text>
                  <Text style={styles.reportDate}>
                    {report.generatedAt.toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.reportStats}>
                  <Text style={styles.statItem}>
                    {report.data.lessonsCompleted} lessons
                  </Text>
                  <Text style={styles.statItem}>
                    {Math.round(report.data.averageQuizScore)}% average
                  </Text>
                  <Text style={styles.statItem}>
                    {Math.round(report.data.improvementPercentage)}% improved
                  </Text>
                </View>

                <View style={styles.reportProgress}>
                  <ProgressBar
                    progress={report.data.averageQuizScore || 0}
                    height={4}
                    showPercentage={false}
                  />
                </View>

                <View style={styles.reportActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownload(report.id)}
                  >
                    <Text style={styles.actionText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(report.id)}
                  >
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('reports', { reportId: report.id })}
                  >
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  header: {
    padding: SPACING.LG,
    paddingTop: SPACING.XXL,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.PAGE_TITLE,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  generateSection: {
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  generateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.XS,
  },
  generateButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  historySection: {
    paddingHorizontal: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XXL,
  },
  emptyText: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  emptySubtext: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.MEDIUM,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  reportType: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.FOREST_ACCENT,
    fontSize: 12,
  },
  reportDate: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  statItem: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  reportProgress: {
    marginBottom: SPACING.MD,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.XS,
  },
  actionButton: {
    flex: 1,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    backgroundColor: COLORS.SAGE_PRIMARY,
    alignItems: 'center',
  },
  actionText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
});

export default ReportsScreen;