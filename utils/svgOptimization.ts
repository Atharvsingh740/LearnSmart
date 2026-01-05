import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGRAM_PREFIX = 'diagram_svg_';

export interface DiagramCacheEntry {
  svgString: string;
  timestamp: number;
}

export const cacheDiagramSVG = async (
  diagramId: string,
  svgString: string
): Promise<void> => {
  try {
    const cacheEntry: DiagramCacheEntry = {
      svgString,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${DIAGRAM_PREFIX}${diagramId}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.error('Failed to cache diagram:', error);
  }
};

export const getCachedDiagramSVG = async (
  diagramId: string
): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${DIAGRAM_PREFIX}${diagramId}`);
    if (!cached) return null;

    const entry: DiagramCacheEntry = JSON.parse(cached);
    return entry.svgString;
  } catch (error) {
    console.error('Failed to get cached diagram:', error);
    return null;
  }
};

export const clearDiagramCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const diagramKeys = keys.filter((key) => key.startsWith(DIAGRAM_PREFIX));
    await AsyncStorage.multiRemove(diagramKeys);
  } catch (error) {
    console.error('Failed to clear diagram cache:', error);
  }
};

export const optimizeSVGString = (svgString: string): string => {
  return svgString
    .replace(/\s+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .trim();
};

export const generateDiagramId = (
  chapterId: string,
  conceptId: string
): string => {
  return `${chapterId}_${conceptId}`;
};
