import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useFormulaStore } from '@/store/formulaStore';
import { useSearchStore } from '@/store/searchStore';
import { useHomeworkStore } from '@/store/homeworkStore';
import RecentSearches from '@/components/RecentSearches';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { searchContent } = useCurriculumStore();
  const { searchFormulas } = useFormulaStore();
  const { history: homeworkHistory } = useHomeworkStore();
  const { addSearch } = useSearchStore();

  const curriculumResults = query.length > 2 ? searchContent(query) : [];
  const formulaResults = query.length > 2 ? searchFormulas(query) : [];
  const homeworkResults = query.length > 2 ? homeworkHistory.filter(h => 
    h.topic.toLowerCase().includes(query.toLowerCase()) || 
    h.subject.toLowerCase().includes(query.toLowerCase())
  ) : [];
  
  const allResults = [
    ...curriculumResults.map(r => ({ ...r, category: 'Curriculum' })),
    ...formulaResults.map(f => ({ 
      id: f.id, 
      title: f.formulaName, 
      type: 'formula', 
      path: `${f.subject} > ${f.chapter}`, 
      category: 'Formulas' 
    })),
    ...homeworkResults.map(h => ({
      id: h.id,
      title: h.topic,
      type: 'homework',
      path: `${h.subject} • Generated ${new Date(h.generatedAt).toLocaleDateString()}`,
      category: 'Homework'
    })),
  ];

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleSelect = (item: any) => {
    addSearch(item.title || item.query, item.type as any || 'concept');
    if (item.type === 'formula') {
      router.push(`/formulas/${item.id}`);
    } else if (item.type === 'homework') {
      router.push('/(main)/homework/history');
    } else if (item.type === 'concept') {
      // Assuming concepts have a path or we need to find their lesson
      console.log('Navigate to concept:', item.id);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'formula': return '📐';
      case 'homework': return '📝';
      default: return '📖';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for concepts, formulas..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {query.length <= 2 ? (
        <RecentSearches onSelect={setQuery} />
      ) : (
        <FlatList
          data={allResults}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          renderItem={({ item }) => (
            <Pressable style={styles.resultItem} onPress={() => handleSelect(item)}>
              <View style={styles.resultIconContainer}>
                <Text style={styles.resultIcon}>
                  {getResultIcon(item.type)}
                </Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultPath}>{item.path}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found for "{query}"</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: '#fff',
    ...SHADOWS.LIGHT,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    ...TYPOGRAPHY.BODY,
  },
  cancelBtn: {
    marginLeft: SPACING.MD,
  },
  cancelText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '10',
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SAND_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.MD,
  },
  resultIcon: {
    fontSize: 20,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
    color: COLORS.CHARCOAL_TEXT,
  },
  resultPath: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
  categoryBadge: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: SPACING.XXL,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
});
