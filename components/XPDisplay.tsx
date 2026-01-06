import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import ProgressBar from '@/components/ProgressBar';
import { useRankStore } from '@/store/rankStore';

interface XPDisplayProps {
  totalXP: number;
  style?: ViewStyle;
  showNext?: boolean;
}

export default function XPDisplay({ totalXP, style, showNext = true }: XPDisplayProps) {
  const { currentRank, nextRank, progressPercent } = useRankStore();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={styles.title}>XP</Text>
        <Text style={styles.value}>{totalXP.toLocaleString()} XP</Text>
      </View>

      <ProgressBar progress={progressPercent} height={10} showMilestones={false} showPercentage={false} />

      {showNext && (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {currentRank.icon} {currentRank.name}
          </Text>
          {nextRank ? (
            <Text style={styles.metaText}>
              Next: {nextRank.name} ({nextRank.minXP.toLocaleString()} XP)
            </Text>
          ) : (
            <Text style={styles.metaText}>Max rank reached</Text>
          )}
        </View>
      )}

      <Text style={styles.subText}>Progress: {Math.round(progressPercent)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '20',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  title: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '800',
  },
  value: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  metaText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.85,
  },
  subText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: SPACING.XS,
  },
});
