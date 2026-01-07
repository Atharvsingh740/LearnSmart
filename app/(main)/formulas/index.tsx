import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useFormulaStore, Formula } from '@/store/formulaStore';
import { useSearchStore } from '@/store/searchStore';

const CATEGORIES = ['All', 'Physics', 'Chemistry', 'Biology', 'Math'];

export default function FormulaBrowserScreen() {
  const router = useRouter();
  const { formulas, searchFormulas } = useFormulaStore();
  const { addSearch } = useSearchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFormulas = searchQuery 
    ? searchFormulas(searchQuery).filter(f => selectedCategory === 'All' || f.subject === selectedCategory)
    : formulas.filter(f => selectedCategory === 'All' || f.subject === selectedCategory);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      addSearch(text, 'formula');
    }
  };

  const renderFormulaItem = ({ item }: { item: Formula }) => (
    <Pressable
      style={styles.formulaItem}
      onPress={() => router.push(`/formulas/${item.id}`)}
    >
      <View style={styles.formulaInfo}>
        <Text style={styles.formulaItemName}>{item.formulaName}</Text>
        <Text style={styles.formulaItemSubject}>{item.subject} • {item.topic}</Text>
      </View>
      <View style={styles.formulaPreview}>
        <Text style={styles.formulaPreviewText}>{item.formula}</Text>
      </View>
      {item.hasDerivation && (
        <View style={styles.derivationBadge}>
          <Text style={styles.derivationBadgeText}>✓ Derivation</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Formulas</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search formulas..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryTab,
                selectedCategory === item && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === item && styles.categoryTabTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredFormulas}
        renderItem={renderFormulaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No formulas found</Text>
          </View>
        }
      />
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
  },
  backButton: {
    padding: SPACING.SM,
    marginRight: SPACING.SM,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.SAGE_PRIMARY,
  },
  title: {
    ...TYPOGRAPHY.PAGE_TITLE,
    fontSize: 24,
    color: COLORS.CHARCOAL_TEXT,
  },
  searchContainer: {
    padding: SPACING.MD,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    ...TYPOGRAPHY.BODY,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingBottom: SPACING.SM,
  },
  categoriesList: {
    paddingHorizontal: SPACING.MD,
  },
  categoryTab: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: RADIUS.BUTTON,
    marginRight: SPACING.SM,
    backgroundColor: COLORS.SAND_BG,
  },
  categoryTabActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  categoryTabText: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.CHARCOAL_TEXT,
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: SPACING.MD,
  },
  formulaItem: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.LIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formulaInfo: {
    flex: 2,
  },
  formulaItemName: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.CHARCOAL_TEXT,
  },
  formulaItemSubject: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  formulaPreview: {
    flex: 1,
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    borderRadius: RADIUS.SMALL,
    padding: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaPreviewText: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
  },
  derivationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.AMBER_GOLD,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  derivationBadgeText: {
    fontSize: 10,
    color: '#fff',
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
