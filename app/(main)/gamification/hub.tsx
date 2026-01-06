import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import { useXPStore } from '@/store/xpStore';
import { useRankStore } from '@/store/rankStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useStreakStore } from '@/store/streakStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';
import { useAvatarStore } from '@/store/avatarStore';
import RankBadge from '@/components/RankBadge';
import XPDisplay from '@/components/XPDisplay';
import StreakDisplay from '@/components/StreakDisplay';
import SmartCoinDisplay from '@/components/SmartCoinDisplay';
import BadgeCard from '@/components/BadgeCard';
import AvatarPreview from '@/components/AvatarPreview';

export default function GamificationHubScreen() {
  const router = useRouter();

  const totalXP = useXPStore((s) => s.totalXP);
  const rank = useRankStore((s) => s.currentRank);
  const unlockedBadges = useBadgeStore((s) => s.unlockedBadges);
  const streak = useStreakStore((s) => s.streak);
  const coins = useSmartCoinStore((s) => s.balance);
  const avatar = useAvatarStore((s) => s.customization);

  const recentBadges = useMemo(() => unlockedBadges.slice(0, 3), [unlockedBadges]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Gamification Hub</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.topRow}>
        <RankBadge rank={rank} size="medium" style={styles.rankBadge} />
        <SmartCoinDisplay balance={coins} style={styles.coinBadge} />
      </View>

      <XPDisplay totalXP={totalXP} style={styles.block} />

      <StreakDisplay
        current={streak.current}
        longest={streak.longest}
        showProtectionButton={true}
      />

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Avatar</Text>
          <Pressable onPress={() => router.push('/(main)/profile/avatar-shop')}>
            <Text style={styles.link}>Customize ›</Text>
          </Pressable>
        </View>
        <View style={styles.avatarRow}>
          <AvatarPreview customization={avatar} size="medium" />
          <Text style={styles.avatarHint}>Unlock outfits with XP and accessories with SmartCoins.</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <Text style={styles.meta}>{unlockedBadges.length} unlocked</Text>
        </View>

        {recentBadges.length === 0 ? (
          <Text style={styles.emptyText}>No badges yet. Complete quizzes and maintain streaks to unlock!</Text>
        ) : (
          <View style={styles.badgeList}>
            {recentBadges.map((b) => (
              <BadgeCard key={b.id} badge={b} unlocked={true} showDetails={true} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.linksRow}>
        <Pressable style={styles.navButton} onPress={() => router.push('/(main)/profile/trophy-room')}>
          <Text style={styles.navButtonText}>🏆 Trophy Room</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => router.push('/(main)/profile/streak-calendar')}>
          <Text style={styles.navButtonText}>📅 Streak Calendar</Text>
        </Pressable>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  rankBadge: {
    flex: 1,
  },
  coinBadge: {
    alignSelf: 'stretch',
  },
  block: {
    marginBottom: SPACING.LG,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginTop: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  link: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
  },
  meta: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  avatarHint: {
    flex: 1,
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.85,
  },
  badgeList: {
    gap: SPACING.SM,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
  },
  linksRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.LG,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  navButtonText: {
    ...TYPOGRAPHY.BODY,
    color: '#fff',
    fontWeight: '800',
  },
});
