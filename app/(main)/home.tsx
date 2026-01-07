import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/userStore';
import { useXPStore } from '@/store/xpStore';
import { useRankStore } from '@/store/rankStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';
import { useStreakStore } from '@/store/streakStore';
import { useBadgeStore } from '@/store/badgeStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/theme';
import RankBadge from '@/components/RankBadge';
import XPDisplay from '@/components/XPDisplay';
import StreakDisplay from '@/components/StreakDisplay';
import SmartCoinDisplay from '@/components/SmartCoinDisplay';
import GiftCreditsModal from '@/components/GiftCreditsModal';
import RedeemGiftCode from '@/components/RedeemGiftCode';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [giftModalVisible, setGiftModalVisible] = useState(false);

  const name = useUserStore((state) => state.name);

  const totalXP = useXPStore((s) => s.totalXP);
  const rank = useRankStore((s) => s.currentRank);
  const streak = useStreakStore((s) => s.streak);
  const coins = useSmartCoinStore((s) => s.balance);
  const unlockedBadges = useBadgeStore((s) => s.unlockedBadges);

  const unlockedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return unlockedBadges
      .filter((b) => (b.unlockedAt || 0) >= weekAgo)
      .slice(0, 6);
  }, [unlockedBadges]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.welcome}>Welcome, {name || 'Learner'} 👋</Text>
      <Text style={styles.appTitle}>{t('app_name')}</Text>

      <View style={styles.topRow}>
        <RankBadge rank={rank} size="medium" style={styles.rankBadge} />
        <View style={styles.xpChip}>
          <Text style={styles.xpChipText}>{totalXP.toLocaleString()} XP</Text>
        </View>
      </View>

      <XPDisplay totalXP={totalXP} style={styles.block} />

      <View style={styles.rowBetween}>
        <View style={styles.flexBlock}>
          <StreakDisplay current={streak.current} longest={streak.longest} />
        </View>
        <SmartCoinDisplay balance={coins} style={styles.coinBlock} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Unlocked This Week</Text>
        {unlockedThisWeek.length === 0 ? (
          <Text style={styles.emptyText}>No new badges yet. Complete quizzes to unlock!</Text>
        ) : (
          <View style={styles.badgeRow}>
            {unlockedThisWeek.map((b) => (
              <View key={b.id} style={styles.badgePill}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={styles.badgeName} numberOfLines={1}>
                  {b.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.linksRow}>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/profile/trophy-room')}>
          <Text style={styles.linkButtonText}>🏆 Trophy Room</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/profile/avatar-shop')}>
          <Text style={styles.linkButtonText}>🧑 Avatar</Text>
        </Pressable>
      </View>

      <View style={styles.linksRow}>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/formulas')}>
          <Text style={styles.linkButtonText}>📐 Formulas</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/homework')}>
          <Text style={styles.linkButtonText}>📝 Homework</Text>
        </Pressable>
      </View>

      <View style={styles.linksRow}>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/gamification/hub')}>
          <Text style={styles.linkButtonText}>🎮 Hub</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => router.push('/(main)/profile/streak-calendar')}>
          <Text style={styles.linkButtonText}>📅 Calendar</Text>
        </Pressable>
      </View>

      <View style={styles.premiumSection}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.linksRow}>
          <Pressable style={[styles.linkButton, styles.giftButton]} onPress={() => setGiftModalVisible(true)}>
            <Text style={styles.linkButtonText}>🎁 Gift Credits</Text>
          </Pressable>
          <Pressable style={[styles.linkButton, styles.historyButton]} onPress={() => router.push('/(main)/gift-credits')}>
            <Text style={styles.linkButtonText}>📜 Gift History</Text>
          </Pressable>
        </View>
        <RedeemGiftCode />
      </View>

      <GiftCreditsModal visible={giftModalVisible} onClose={() => setGiftModalVisible(false)} />

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
    marginBottom: SPACING.SM,
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
  welcome: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.SM,
    opacity: 0.9,
  },
  appTitle: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.LG,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  rankBadge: {
    flex: 1,
  },
  xpChip: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.BUTTON,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '20',
    ...SHADOWS.LIGHT,
  },
  xpChipText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '800',
  },
  block: {
    marginBottom: SPACING.LG,
  },
  rowBetween: {
    flexDirection: 'row',
    gap: SPACING.SM,
    alignItems: 'flex-start',
  },
  flexBlock: {
    flex: 1,
  },
  coinBlock: {
    justifyContent: 'center',
    height: 62,
  },
  sectionCard: {
    marginTop: SPACING.LG,
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.75,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  badgePill: {
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  badgeIcon: {
    fontSize: 18,
    marginRight: SPACING.XS,
  },
  badgeName: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
    flexShrink: 1,
  },
  linksRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  linkButton: {
    flex: 1,
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  linkButtonText: {
    ...TYPOGRAPHY.BODY,
    color: '#fff',
    fontWeight: '800',
  },
  premiumSection: {
    marginTop: SPACING.LG,
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    ...SHADOWS.LIGHT,
    borderWidth: 2,
    borderColor: COLORS.GOLD_STREAK + '40',
  },
  giftButton: {
    backgroundColor: COLORS.GOLD_STREAK,
  },
  historyButton: {
    backgroundColor: COLORS.FOREST_ACCENT,
  },
});
