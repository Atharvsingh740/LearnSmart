import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/userStore';
import { useXPStore } from '@/store/xpStore';
import { useRankStore } from '@/store/rankStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useStreakStore } from '@/store/streakStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';
import { useAvatarStore } from '@/store/avatarStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/theme';
import AvatarPreview from '@/components/AvatarPreview';
import RankBadge from '@/components/RankBadge';
import XPDisplay from '@/components/XPDisplay';
import SmartCoinDisplay from '@/components/SmartCoinDisplay';

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();

  const name = useUserStore((s) => s.name);

  const totalXP = useXPStore((s) => s.totalXP);
  const rank = useRankStore((s) => s.currentRank);
  const badges = useBadgeStore((s) => s.unlockedBadges);
  const streak = useStreakStore((s) => s.streak);
  const coins = useSmartCoinStore((s) => s.balance);
  const avatar = useAvatarStore((s) => s.customization);

  const showcaseBadges = useMemo(() => badges.slice(0, 6), [badges]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{t('home.profile')}</Text>
        <Pressable style={styles.settingsButton} onPress={() => router.push('/(main)/settings')}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <Pressable onPress={() => router.push('/(main)/profile/avatar-shop')}>
            <AvatarPreview customization={avatar} size="medium" />
          </Pressable>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name || 'Guest User'}</Text>
            <RankBadge rank={rank} size="small" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('profile.xp')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {streak.current}</Text>
            <Text style={styles.statLabel}>{t('profile.streak')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🏅 {badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      <XPDisplay totalXP={totalXP} style={styles.block} />

      <View style={styles.rowBetween}>
        <SmartCoinDisplay balance={coins} style={styles.coinChip} />
        <Pressable style={styles.linkChip} onPress={() => router.push('/(main)/gamification/hub')}>
          <Text style={styles.linkChipText}>🎮 Open Hub</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Badge Showcase</Text>
          <Pressable onPress={() => router.push('/(main)/gamification/hub')}>
            <Text style={styles.linkText}>See all ›</Text>
          </Pressable>
        </View>

        {showcaseBadges.length === 0 ? (
          <Text style={styles.emptyText}>No badges unlocked yet.</Text>
        ) : (
          <View style={styles.badgeGrid}>
            {showcaseBadges.map((b) => (
              <View key={b.id} style={styles.badgeBubble}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
              </View>
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
    backgroundColor: COLORS.CREAM_BG,
  },
  content: {
    padding: SPACING.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
    marginTop: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: SPACING.LG,
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  profileInfo: {
    flex: 1,
    gap: SPACING.SM,
  },
  name: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.SAGE_PRIMARY,
  },
  statLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: 2,
  },
  block: {
    marginBottom: SPACING.LG,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  coinChip: {
    flex: 1,
  },
  linkChip: {
    flex: 1,
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  linkChipText: {
    ...TYPOGRAPHY.BODY,
    color: '#fff',
    fontWeight: '800',
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
  linkText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  badgeBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.SAND_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 24,
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
