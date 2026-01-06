import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import { useStreakStore } from '@/store/streakStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const formatKey = (year: number, month: number, day: number) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const getMonthMatrix = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const firstDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, key: formatKey(year, month, day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: null });
  }

  return cells;
};

export default function StreakCalendarScreen() {
  const router = useRouter();
  const streak = useStreakStore((s) => s.streak);

  const year = useMemo(() => new Date().getFullYear(), []);

  const totalActiveDays = useMemo(() => Object.keys(streak.calendar || {}).length, [streak.calendar]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Streak Calendar</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {streak.current}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🏆 {streak.longest}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>✅ {totalActiveDays}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
        </View>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekdayText}>
            {d}
          </Text>
        ))}
      </View>

      {MONTHS.map((name, month) => {
        const cells = getMonthMatrix(year, month);
        const isCurrentMonth = new Date().getMonth() === month;

        return (
          <View key={name} style={[styles.monthCard, isCurrentMonth && styles.monthCardCurrent]}>
            <Text style={styles.monthTitle}>
              {name} {year}
            </Text>

            <View style={styles.grid}>
              {cells.map((c, idx) => {
                const active = c.key ? Boolean(streak.calendar[c.key]) : false;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.cell,
                      active ? styles.cellActive : styles.cellInactive,
                      c.day === null && styles.cellEmpty,
                    ]}
                  />
                );
              })}
            </View>
          </View>
        );
      })}

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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.CHARCOAL_TEXT,
  },
  statLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: 2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: SPACING.SM,
  },
  weekdayText: {
    width: 14,
    textAlign: 'center',
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  monthCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  monthCardCurrent: {
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  monthTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.SM,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  cellActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  cellInactive: {
    backgroundColor: '#E5E5E5',
  },
  cellEmpty: {
    backgroundColor: 'transparent',
  },
});
