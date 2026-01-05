import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ImageStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/theme';

interface LazyImageProps {
  source: { uri: string } | number;
  placeholder?: string;
  style?: ImageStyle;
  cacheKey?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export default function LazyImage({
  source,
  placeholder,
  style,
  cacheKey,
  onLoad,
  onError,
}: LazyImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    loadImage();
  }, [source]);

  const loadImage = async () => {
    try {
      setLoading(true);
      setError(false);

      if (typeof source === 'number') {
        setImageUri(null);
        setLoading(false);
        opacity.value = withTiming(1, { duration: 300 });
        return;
      }

      setImageUri(source.uri);
    } catch (err) {
      console.error('Image load error:', err);
      setError(true);
      onError?.(err);
    }
  };

  const handleLoadEnd = () => {
    setLoading(false);
    opacity.value = withTiming(1, { duration: 300 });
    onLoad?.();
  };

  const handleError = (e: any) => {
    setError(true);
    setLoading(false);
    onError?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (error && placeholder) {
    return (
      <Image
        source={{ uri: placeholder }}
        style={[styles.image, style]}
        resizeMode="cover"
      />
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <View style={styles.errorIcon}>
          <Animated.Text style={styles.errorText}>🖼️</Animated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={style}>
      {loading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color={COLORS.SAGE_PRIMARY} />
        </View>
      )}
      <Animated.Image
        source={typeof source === 'number' ? source : { uri: imageUri || undefined }}
        style={[styles.image, style, animatedStyle]}
        resizeMode="cover"
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SAND_BG,
  },
  errorContainer: {
    backgroundColor: COLORS.SAND_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    opacity: 0.3,
  },
  errorText: {
    fontSize: 40,
  },
});
