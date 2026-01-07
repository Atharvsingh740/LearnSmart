import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoStore } from '../../../store/videoStore';
import { useUserStore } from '../../../store/userStore';
import VideoPlayer from '../../../components/VideoPlayer';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../theme';
import { TYPOGRAPHY } from '../../../theme/typography';

export default function VideoPlayerScreen({ route, navigation }) {
  const [video, setVideo] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { getVideoById } = useVideoStore();
  const userId = useUserStore(state => state.currentUserId) || 'user_test_001';
  
  const videoId = route.params?.videoId;

  const loadVideo = async () => {
    if (!videoId) return;
    
    try {
      const videoData = await getVideoById(videoId);
      setVideo(videoData);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load video:', error);
    }
  };

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Video Player */}
        <VideoPlayer
          videoUrl={video.videoUrl}
          thumbnailUrl={video.thumbnail}
          title={video.title}
          description={video.description}
          duration={video.duration * 1000} // Convert to milliseconds
          currentTime={0}
          showControls={true}
          autoplay={false}
          style={styles.videoPlayer}
        />

        {/* Video Info */}
        <View style={styles.infoSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoMeta}>By {video.uploader} • {new Date(video.uploadedAt).toLocaleDateString()}</Text>
          <Text style={styles.videoDescription}>{video.description}</Text>
          
          <View style={styles.statsRow}>
            <Text style={styles.stat}>{video.views.toLocaleString()} views</Text>
            <Text style={styles.stat}>★ {video.rating}/5</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>⭐ Rate Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>💾 Save Offline</Text>
          </TouchableOpacity>
        </View>

        {/* Related Videos */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Videos</Text>
          <View style={styles.relatedPlaceholder}>
            <Text style={styles.placeholderText}>Related videos would appear here</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  videoPlayer: {
    marginBottom: SPACING.MD,
  },
  infoSection: {
    backgroundColor: COLORS.CREAM_BG,
    marginHorizontal: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
    marginBottom: SPACING.MD,
  },
  videoTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  videoMeta: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: SPACING.MD,
  },
  videoDescription: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 22,
    marginBottom: SPACING.MD,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: 'rgba(135, 169, 107, 0.2)',
  },
  stat: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.FOREST_ACCENT,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.LG,
    gap: SPACING.SM,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.SAGE_PRIMARY,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
  relatedSection: {
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.XXL,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.MD,
  },
  relatedPlaceholder: {
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.XL,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
  },
  placeholderText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
});

export default VideoPlayerScreen;