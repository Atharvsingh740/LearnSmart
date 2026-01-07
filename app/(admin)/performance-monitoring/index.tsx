import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';

export default function PerformanceMonitoringScreen() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  
  const performanceMetrics = {
    appHealth: 94,
    startupTime: 1.2,
    memoryUsage: 45,
    networkSpeed: 2.4,
    crashRate: 0.2,
    errorCount: 3
  };

  const performanceIssues = [
    { id: 1, type: 'warning', title: 'Slow animation on home screen', status: 'fixed', version: '1.2.3' },
    { id: 2, type: 'bug', title: 'Crash on video player rotation', status: 'investigating', version: null },
    { id: 3, type: 'warning', title: 'Long API response time (>2s)', status: 'optimized', version: null },
    { id: 4, type: 'info', title: 'High memory usage in certain screens', status: 'monitoring', version: null }
  ];

  const appSizeHistory = [
    { date: '2024-01-01', size: 52.3 },
    { date: '2024-01-05', size: 49.8 },
    { date: '2024-01-10', size: 48.2 },
    { date: '2024-01-15', size: 47.5 }
  ];

  const getAppHealthColor = (score: number) => {
    if (score >= 90) return COLORS.SAGE_PRIMARY;
    if (score >= 70) return COLORS.AMBER_GOLD;
    return COLORS.CORAL_ERROR;
  };

  const renderHealthBar = () => {
    const healthBarWidth = `${performanceMetrics.appHealth}%`;
    const healthBarColor = getAppHealthColor(performanceMetrics.appHealth);
    
    return (
      <View style={styles.healthBarContainer}>
        <View style={[styles.healthBar, { width: healthBarWidth, backgroundColor: healthBarColor }]} />
        <Text style={styles.healthScore}>{performanceMetrics.appHealth}/100</Text>
      </View>
    );
  };

  const renderMetricCard = (title: string, value: string, unit: string, status: 'good' | 'warning' | 'error') => {
    const statusColors = {
      good: COLORS.SAGE_PRIMARY,
      warning: COLORS.AMBER_GOLD,
      error: COLORS.CORAL_ERROR
    };
    
    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={styles.metricValueContainer}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: statusColors[status] }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Monitoring</Text>
          <Text style={styles.subtitle}>App health and performance metrics</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['24h', '7d', '30d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Health Score */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>App Health Score</Text>
          {renderHealthBar()}
          <Text style={styles.healthDescription}>
            Overall app performance rating based on key metrics
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {renderMetricCard('Startup Time', performanceMetrics.startupTime.toString(), 'seconds', 'good')}
          {renderMetricCard('Memory Usage', performanceMetrics.memoryUsage.toString(), 'MB', performanceMetrics.memoryUsage < 50 ? 'good' : 'warning')}
          {renderMetricCard('Network Speed', performanceMetrics.networkSpeed.toString(), 'Mbps', 'good')}
          {renderMetricCard('Crash Rate', performanceMetrics.crashRate.toString(), '%', performanceMetrics.crashRate < 1 ? 'good' : 'warning')}
        </View>

        {/* Performance Issues */}
        <View style={styles.issuesSection}>
          <Text style={styles.sectionTitle}>Recent Issues</Text>
          {performanceIssues.map((issue) => (
            <View key={issue.id} style={styles.issueRow}>
              <Text style={styles.issueEmoji}>
                {issue.type === 'warning' ? '⚠️' : issue.type === 'bug' ? '🐛' : 'ℹ️'}
              </Text>
              <View style={styles.issueDetails}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueStatus}>
                  Status: {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  {issue.version && ` • Fixed in: v${issue.version}`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* App Size Tracking */}
        <View style={styles.sizeSection}>
          <Text style={styles.sectionTitle}>App Size Timeline</Text>
          <Text style={styles.targetSize}>
            Target: < 50MB • Current: {appSizeHistory[appSizeHistory.length - 1].size}MB
          </Text>
          
          <View style={styles.sizeHistory}>
            {appSizeHistory.map((entry, index) => (
              <View key={index} style={styles.sizeEntry}>
                <Text style={styles.sizeDate}>{entry.date}</Text>
                <Text style={styles.sizeValue}>{entry.size}MB</Text>
                {index > 0 && (
                  <Text style={[styles.sizeTrend, { color: entry.size < appSizeHistory[index - 1].size ? COLORS.SAGE_PRIMARY : COLORS.CORAL_ERROR }]}>
                    {entry.size < appSizeHistory[index - 1].size ? '↓' : '↑'}
                  </Text>
                )}
              </View>
            ))}
          </View>
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
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  timeRangeButton: {
    flex: 1,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  activeTimeRange: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  timeRangeText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  activeTimeRangeText: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  healthSection: {
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
  healthBarContainer: {
    height: 20,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    overflow: 'hidden',
    marginBottom: SPACING.XS,
  },
  healthBar: {
    height: '100%',
    borderRadius: RADIUS.SMALL,
  },
  healthScore: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  healthDescription: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  metricCard: {
    backgroundColor: COLORS.CREAM_BG,
    width: '48%',
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
    ...SHADOWS.LIGHT,
  },
  metricTitle: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.XS,
  },
  metricValue: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 18,
  },
  metricUnit: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginLeft: SPACING.XS / 2,
  },
  statusIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS / 2,
    borderRadius: RADIUS.SMALL,
  },
  issuesSection: {
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 169, 107, 0.2)',
  },
  issueEmoji: {
    fontSize: 20,
    marginRight: SPACING.SM,
  },
  issueDetails: {
    flex: 1,
  },
  issueTitle: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS / 2,
    lineHeight: 20,
  },
  issueStatus: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  sizeSection: {
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  targetSize: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  sizeHistory: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.FOREST_ACCENT,
    paddingLeft: SPACING.MD,
  },
  sizeEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  sizeDate: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  sizeValue: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  sizeTrend: {
    ...TYPOGRAPHY.BULLET_TEXT,
    fontWeight: '600',
  },
});

export default PerformanceMonitoringScreen;