import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useHomeworkStore } from '@/store/homeworkStore';

export default function HomeworkHistoryScreen() {
  const router = useRouter();
  const { history, deleteHomework } = useHomeworkStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Homework History</Text>
      </View>

      <ScrollView style={styles.historyContainer} contentContainerStyle={styles.historyContent}>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No homework history yet</Text>
            <Pressable style={styles.generateBtn} onPress={() => router.push('/(main)/homework')}>
              <Text style={styles.generateBtnText}>Generate Your First Homework</Text>
            </Pressable>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardSubject}>{item.subject}</Text>
                <Text style={styles.cardDate}>{new Date(item.generatedAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.cardTopic} numberOfLines={1}>{item.topic}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{item.difficulty}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => {
                      console.log('View homework:', item.id);
                    }}
                  >
                    <Text style={styles.actionBtnText}>View</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => deleteHomework(item.id)}
                  >
                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    fontSize: 20,
    color: COLORS.CHARCOAL_TEXT,
  },
  historyContainer: {
    flex: 1,
  },
  historyContent: {
    padding: SPACING.MD,
  },
  emptyContainer: {
    padding: SPACING.XXL,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
    marginBottom: SPACING.LG,
  },
  generateBtn: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: RADIUS.BUTTON,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  cardSubject: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
  },
  cardDate: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
  cardTopic: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    marginBottom: SPACING.SM,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: COLORS.SAND_BG,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
  },
  difficultyText: {
    fontSize: 10,
    color: COLORS.FOREST_ACCENT,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginLeft: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.SMALL,
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
  },
  actionBtnText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: COLORS.RED_ERROR + '20',
  },
  deleteBtnText: {
    color: COLORS.RED_ERROR,
  },
});
