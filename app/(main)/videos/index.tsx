import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';
import { useVideoStore, useVideoRecommendations } from '../../../store/videoStore';
import { useUserStore } from '../../../store/userStore';
import VideoPlayer from '../../../components/VideoPlayer';

export default function VideoLessonsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [videos, setVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  
  const { getVideosByLesson, watchVideo, getVideosToContinue } = useVideoStore();
  const recommended = useVideoRecommendations(userId);

  const loadVideoContent = async () => {
    try {
      const [continueWatching, recommendations] = await Promise.all([
        getVideosToContinue(userId, 3),
        Promise.resolve(recommended)
      ]);
      
      setVideos(continueWatching);
      setRecommendedVideos(recommendations);
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  useEffect(() => {
    loadVideoContent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideoContent();
    setRefreshing(false);
  };

  const playVideo = async (video) => {
    await watchVideo(userId, video.id);
    navigation.navigate('/video-player', { videoId: video.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Video Lessons</Text>
        </View>

        {videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() => playVideo(video)}
                style={styles.videoCard}
              >
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoMeta}>
                  {video.duration}s • {video.uploader}
                </Text>
                <ProgressBar
                  progress={Math.random() * 100}
                  height={3}
                  showPercentage={false}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recommendedVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => playVideo(video)}
                  style={styles.recommendedCard}
                >
                  <Text style={styles.recommendedEmoji}>🎥</Text>
                  <Text style={styles.recommendedTitle}>{video.title}</Text>
                  <Text style={styles.recommendedMeta}>{video.duration}s</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.PAGE_TITLE,
    color: COLORS.FOREST_ACCENT,
  },
  section: {
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    marginBottom: SPACING.MD,
  },
  videoCard: {
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
    ...SHADOWS.LIGHT,
  },
  videoTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    marginBottom: SPACING.XS,
  },
  videoMeta: {
    ...TYPOGRAPHY.METADATA,
    opacity: 0.7,
    marginBottom: SPACING.SM,
  },
  recommendedCard: {
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginRight: SPACING.SM,
    width: SCREEN_WIDTH / 2.5,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  recommendedEmoji: {
    fontSize: 32,
    marginBottom: SPACING.SM,
  },
  recommendedTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  recommendedMeta: {
    ...TYPOGRAPHY.METADATA,
    opacity: 0.7,
  },
});
