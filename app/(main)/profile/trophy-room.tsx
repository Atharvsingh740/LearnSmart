import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import { useXPStore } from '@/store/xpStore';
import { RANKS, useRankStore } from '@/store/rankStore';
import ProgressBar from '@/components/ProgressBar';

export default function TrophyRoomScreen() {
  const router = useRouter();
  const totalXP = useXPStore((s) => s.totalXP);
  const xpHistory = useXPStore((s) => s.xpHistory);

  const { currentRank, nextRank, progressPercent, rankHistory } = useRankStore();

  const stats = useMemo(() => {
    if (xpHistory.length === 0) {
      return { dailyAverage: 0 };
    }

    const byDay = new Map<string, number>();
    for (const entry of xpHistory) {
      const d = new Date(entry.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      byDay.set(key, (byDay.get(key) || 0) + entry.amount);
    }

    const sum = Array.from(byDay.values()).reduce((acc, v) => acc + v, 0);
    const dailyAverage = Math.round(sum / Math.max(1, byDay.size));

    return { dailyAverage };
  }, [xpHistory]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Trophy Room</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.currentRankCard}>
        <Text style={styles.currentRankTitle}>Current Rank</Text>
        <Text style={styles.rankLine}>
          {currentRank.name} {currentRank.icon}  {totalXP.toLocaleString()} XP
        </Text>

        <View style={styles.progressBox}>
          <ProgressBar progress={progressPercent} height={12} />
          <Text style={styles.progressText}>Progress: {Math.round(progressPercent)}%</Text>
        </View>

        <Text style={styles.nextText}>
          {nextRank
            ? `Next: ${nextRank.name} (${nextRank.minXP.toLocaleString()} XP)`
            : 'You reached the highest rank!'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>All Ranks</Text>
        <View style={styles.rankGrid}>
          {RANKS.map((rank) => {
            const achieved = totalXP >= rank.minXP;
            const isCurrent = rank.id === currentRank.id;

            return (
              <View
                key={rank.id}
                style={[
                  styles.rankTile,
                  achieved ? styles.rankTileAchieved : styles.rankTileLocked,
                  isCurrent && { borderColor: rank.color },
                ]}
              >
                <Text style={styles.rankTileIcon}>{rank.icon}</Text>
                <Text style={styles.rankTileName}>{rank.name}</Text>
                <Text style={styles.rankTileMeta}>
                  {achieved ? (isCurrent ? 'Current' : 'Achieved') : `${rank.minXP.toLocaleString()} XP`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Rank-up History</Text>
        {rankHistory.length === 0 ? (
          <Text style={styles.emptyText}>No rank-ups yet. Complete a quiz to start earning XP!</Text>
        ) : (
          rankHistory.map((h) => (
            <View key={h.id} style={styles.historyRow}>
              <Text style={styles.historyText}>
                {new Date(h.timestamp).toLocaleDateString()} • {h.fromRankId} → {h.toRankId}
              </Text>
              <Text style={styles.historySubText}>{h.totalXP.toLocaleString()} XP</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>XP Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Lifetime XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.dailyAverage.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Daily Avg</Text>
          </View>
        </View>
      </View>

      <View style={{ height: SPACING.XXL }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  content: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 50,
  },
  title: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  currentRankCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  currentRankTitle: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: SPACING.XS,
  },
  rankLine: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '800',
    marginBottom: SPACING.MD,
  },
  progressBox: {
    marginBottom: SPACING.SM,
  },
  progressText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
    marginTop: SPACING.XS,
  },
  nextText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.FOREST_ACCENT,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  rankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  rankTile: {
    width: '48%',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    borderWidth: 2,
  },
  rankTileAchieved: {
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    borderColor: COLORS.SAGE_PRIMARY + '30',
  },
  rankTileLocked: {
    backgroundColor: '#f6f6f6',
    borderColor: '#e6e6e6',
  },
  rankTileIcon: {
    fontSize: 26,
    marginBottom: SPACING.XS,
  },
  rankTileName: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '800',
  },
  rankTileMeta: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
    marginTop: 2,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
  },
  historyRow: {
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '10',
  },
  historyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  historySubText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.65,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
  },
  statValue: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '800',
  },
  statLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
});
