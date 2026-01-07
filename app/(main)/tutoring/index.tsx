import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';
import { useTutoringStore, useTutoringStats } from '../../../store/tutoringStore';
import { useUserStore } from '../../../store/userStore';
import TutorCard from '../../../components/TutorCard';
import SessionTimeCounter from '../../../components/SessionTimeCounter';

interface TutoringHubProps {
  navigation: any;
}

export default function TutoringHub({ navigation }: TutoringHubProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'find'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  
  const { getUpcomingSessions, getSessionHistory, getTopRatedTutors } = useTutoringStore();
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  const stats = useTutoringStats(userId);

  const loadData = async () => {
    try {
      const [upcoming, history, topRated] = await Promise.all([
        getUpcomingSessions(userId),
        getSessionHistory(userId),
        getTopRatedTutors(5)
      ]);
      
      setUpcomingSessions(upcoming);
      setSessionHistory(history);
      setTopTutors(topRated);
    } catch (error) {
      console.error('Failed to load tutoring data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToFindTutor = () => {
    navigation.navigate('tutoring/find-tutor');
  };

  const navigateToSession = (sessionId: string) => {
    navigation.navigate('tutoring/active-session', { sessionId });
  };

  const navigateToTutorProfile = (tutorId: string) => {
    navigation.navigate('tutoring/tutor-profile', { tutorId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Tutoring</Text>
          <Text style={styles.subtitle}>Connect with expert tutors for personalized learning</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.upcomingSessions}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedSessions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>

        {/* Next Session Widget */}
        {stats.nextSession && (
          <View style={styles.nextSessionWidget}>
            <Text style={styles.widgetTitle}>Next Session</Text>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionSubject}>{stats.nextSession.subject}</Text>
              <Text style={styles.sessionTime}>
                {stats.nextSession.scheduledAt.toLocaleString()}
              </Text>
            </View>
            <SessionTimeCounter targetTime={stats.nextSession.scheduledAt} />
            <TouchableOpacity style={styles.joinButton} onPress={() => navigateToSession(stats.nextSession!.id)}>
              <Text style={styles.joinButtonText}>Join Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'find' && styles.activeTab]}
            onPress={() => setActiveTab('find')}
          >
            <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>
              Find Tutors
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <View style={styles.tabContent}>
            {upcomingSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No upcoming sessions</Text>
                <TouchableOpacity onPress={() => setActiveTab('find')}>
                  <Text style={styles.emptyStateAction}>Find a tutor</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingSessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <Text style={styles.sessionTitle}>{session.subject} - {session.topic}</Text>
                  <Text style={styles.sessionDetails}>
                    {session.scheduledAt.toLocaleDateString()} • {session.duration} minutes
                  </Text>
                  <View style={styles.sessionActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => navigateToSession(session.id)}
                    >
                      <Text style={styles.actionText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.cancelButton]}
                    >
                      <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {sessionHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No past sessions</Text>
                <Text>Start learning with a tutor to see your history</Text>
              </View>
            ) : (
              sessionHistory.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <Text style={styles.completedSessionTitle}>{session.subject}</Text>
                  <Text style={styles.sessionDetails}>
                    Completed on {session.scheduledAt.toLocaleDateString()}
                  </Text>
                  {session.feedback && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingStars}>
                        {'⭐'.repeat(Math.round(session.feedback.rating))}
                      </Text>
                      <Text style={styles.ratingNumber}> ({session.feedback.rating}/5)</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'find' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended Tutors</Text>
              <TouchableOpacity onPress={navigateToFindTutor}>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {topTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                variant="compact"
                onPress={() => navigateToTutorProfile(tutor.id)}
                showAvailability={true}
              />
            ))}

            <TouchableOpacity style={styles.exploreButton} onPress={navigateToFindTutor}>
              <Text style={styles.exploreText}>Explore All Tutors</Text>
            </TouchableOpacity>
          </View>
        )}
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
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  statCard: {
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 18,
  },
  statLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.XS / 2,
  },
  nextSessionWidget: {
    backgroundColor: COLORS.CREAM_BG,
    margin: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
  },
  widgetTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  sessionInfo: {
    marginBottom: SPACING.SM,
  },
  sessionSubject: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
  },
  sessionTime: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  joinButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginTop: SPACING.SM,
    alignItems: 'center',
  },
  joinButtonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.XS,
    marginBottom: SPACING.MD,
  },
  tab: {
    flex: 1,
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  tabText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CHARCOAL_TEXT,
  },
  activeTabText: {
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyStateText: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  emptyStateAction: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  sessionTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  completedSessionTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.XS,
  },
  sessionDetails: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: SPACING.XS,
  },
  actionButton: {
    padding: SPACING.SM,
    borderRadius: RADIUS.SMALL,
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  actionText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.CORAL_ERROR,
  },
  cancelText: {
    color: COLORS.SAND_BG,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  ratingStars: {
    fontSize: 14,
  },
  ratingNumber: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginLeft: SPACING.XS / 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    marginTop: SPACING.SM,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
  },
  sectionAction: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: COLORS.FOREST_ACCENT,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  exploreText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
});

export default TutoringHub;