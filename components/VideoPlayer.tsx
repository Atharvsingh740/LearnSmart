import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';
import { TYPOGRAPHY } from '../theme/typography';
import ProgressBar from './ProgressBar';
import { useVideoStore } from '../store/videoStore';
import { Video } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  duration?: number;
  currentTime?: number;
  showControls?: boolean;
  autoplay?: boolean;
  onProgress?: (time: number) => void;
  onComplete?: () => void;
  style?: any;
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  description,
  duration = 0,
  currentTime = 0,
  showControls = true,
  autoplay = false,
  onProgress,
  onComplete,
  style,
}: VideoPlayerProps) {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [currentVideoTime, setCurrentVideoTime] = useState(currentTime);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThumbnail, setShowThumbnail] = !isPlaying && currentVideoTime === 0;

  // Animation values
  const playButtonScale = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);

  useEffect(() => {
    // Load video on mount
    loadVideo();
    
    return () => {
      // Cleanup: Pause video when component unmounts
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, []);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      // In real implementation, you'd load the video here
      // For now, simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load video');
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
        setShowThumbnail(false);
        
        // Animate play button
        playButtonScale.value = withTiming(1.2, { duration: 200, easing: Easing.ease });
        setTimeout(() => {
          playButtonScale.value = withTiming(1, { duration: 200, easing: Easing.ease });
        }, 200);
      }
    } catch (err) {
      setError('Failed to control playback');
      Alert.alert('Playback Error', 'Unable to play video. Please try again.');
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(time);
      setCurrentVideoTime(time);
    }
  };

  const handleProgress = (progress: { currentTime: number }) => {
    const { currentTime } = progress;
    setCurrentVideoTime(currentTime);
    onProgress?.(currentTime);

    // Update resume position in store
    // useVideoStore.getState().updateResumePosition(userId, videoId, currentTime);
  };

  const handleLoad = (status: any) => {
    setVideoDuration(status.durationMillis || duration);
    setIsLoading(false);
    
    // If there's a resume position, seek to it
    // const resumePosition = useVideoStore.getState().getWatchHistory(userId).then(...)
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentVideoTime(status.positionMillis);
      
      if (status.didJustFinish) {
        onComplete?.();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = videoDuration > 0 ? (currentVideoTime / videoDuration) * 100 : 0;

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>Unable to load video</Text>
        <Text style={styles.errorDescription}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideo}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        {showThumbnail && thumbnailUrl && (
          <Image 
            source={{ uri: thumbnailUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          useNativeControls={false}
          resizeMode="contain"
          isLooping={false}
          shouldPlay={autoplay}
          onLoad={handleLoad}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onReadyForDisplay={() => setIsLoading(false)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Play/Pause Overlay */}
        {showControls && !isLoading && (
          <Animated.View style={[styles.playOverlay, controlsStyle]}>
            <TouchableOpacity 
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.playButton, playButtonStyle]}>
                <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
        
        <View style={styles.metaContainer}>
          <Text style={styles.duration}>
            {formatTime(currentVideoTime / 1000)} / {formatTime(videoDuration / 1000)}
          </Text>
          
          {showControls && (
            <TouchableOpacity onPress={handlePlayPause}>
              <Text style={styles.controlText}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        {showControls && videoDuration > 0 && (
          <ProgressBar
            progress={progressPercentage}
            height={4}
            showPercentage={false}
            animated={true}
            style={styles.progressBar}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    overflow: 'hidden',
    ...SHADOWS.MEDIUM,
  },
  videoContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.56, // 16:9 aspect ratio
    backgroundColor: COLORS.CHARCOAL_TEXT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.SAND_BG,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.MEDIUM,
  },
  playIcon: {
    fontSize: 24,
    color: COLORS.SAGE_PRIMARY,
    marginLeft: 2,
  },
  infoContainer: {
    padding: SPACING.MD,
    backgroundColor: COLORS.SAND_BG,
  },
  title: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  description: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    marginBottom: SPACING.SM,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  duration: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  controlText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  progressBar: {
    marginTop: SPACING.XS,
  },
  errorContainer: {
    padding: SPACING.MD,
    backgroundColor: COLORS.CORAL_ERROR,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CREAM_BG,
  },
  errorDescription: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CREAM_BG,
    opacity: 0.8,
    textAlign: 'center',
    marginVertical: SPACING.SM,
  },
  retryButton: {
    backgroundColor: COLORS.CREAM_BG,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: RADIUS.SMALL,
  },
  retryText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.FOREST_ACCENT,
    fontWeight: '600',
  },
});

export default VideoPlayer;