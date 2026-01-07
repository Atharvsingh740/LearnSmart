import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useSearchStore, SearchHistory } from '@/store/searchStore';

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { history, clearSearchHistory, deleteSearch } = useSearchStore();

  if (history.length === 0) return null;

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getIcon = (type: SearchHistory['type']) => {
    switch (type) {
      case 'concept': return '📖';
      case 'formula': return '📐';
      case 'homework': return '📝';
      case 'lesson': return '📚';
      default: return '🔍';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <Pressable onPress={clearSearchHistory}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {history.map((item) => (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => onSelect(item.query)}
          >
            <View style={styles.itemHeader}>
               <Text style={styles.icon}>{getIcon(item.type)}</Text>
               <Pressable onPress={() => deleteSearch(item.id)} style={styles.deleteBtn}>
                 <Text style={styles.deleteIcon}>×</Text>
               </Pressable>
            </View>
            <Text style={styles.query} numberOfLines={1}>{item.query}</Text>
            <Text style={styles.time}>{getTimeAgo(item.searchedAt)}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  title: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.CHARCOAL_TEXT,
  },
  clearText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.SAGE_PRIMARY,
  },
  scroll: {
    paddingHorizontal: SPACING.MD,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginRight: SPACING.MD,
    width: 120,
    ...SHADOWS.LIGHT,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '10',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  icon: {
    fontSize: 20,
  },
  deleteBtn: {
    padding: SPACING.XS,
  },
  deleteIcon: {
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.3,
  },
  query: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
    marginBottom: SPACING.XS,
  },
  badge: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
