import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageCacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

const CACHE_PREFIX = 'image_cache_';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const optimizeImage = async (
  imageUri: string,
  targetWidth: number = 400,
  quality: number = 0.8
): Promise<string> => {
  return imageUri;
};

export const cacheImage = async (
  imageUri: string,
  cacheKey: string
): Promise<void> => {
  try {
    const cacheEntry: ImageCacheEntry = {
      uri: imageUri,
      timestamp: Date.now(),
      size: 0,
    };
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${cacheKey}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.error('Failed to cache image:', error);
  }
};

export const getCachedImage = async (
  cacheKey: string
): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!cached) return null;

    const entry: ImageCacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    if (age > MAX_CACHE_AGE) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
      return null;
    }

    return entry.uri;
  } catch (error) {
    console.error('Failed to get cached image:', error);
    return null;
  }
};

export const clearImageCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

export const cleanupOldCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    for (const key of cacheKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const entry: ImageCacheEntry = JSON.parse(cached);
        const age = Date.now() - entry.timestamp;

        if (age > MAX_CACHE_AGE) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old cache:', error);
  }
};
