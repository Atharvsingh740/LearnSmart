import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import HomeworkAssistant from '@/components/HomeworkAssistant';

export default function HomeworkScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Homework Assistant</Text>
        <Pressable onPress={() => router.push('/(main)/homework/history')} style={styles.historyBtn}>
          <Text style={styles.historyBtnText}>History</Text>
        </Pressable>
      </View>

      <HomeworkAssistant onGenerated={(id) => router.push('/(main)/homework/history')} />
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
    flex: 1,
  },
  historyBtn: {
    padding: SPACING.SM,
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    borderRadius: RADIUS.SMALL,
  },
  historyBtnText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: 'bold',
  },
});
