import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import AvatarPreview from '@/components/AvatarPreview';
import { COSMETICS_CATALOG, useAvatarStore } from '@/store/avatarStore';
import { useXPStore } from '@/store/xpStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';

type Tab = 'character' | 'outfits' | 'accessories' | 'backgrounds';

export default function AvatarShopScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('outfits');

  const avatarStore = useAvatarStore();
  const totalXP = useXPStore((s) => s.totalXP);
  const coins = useSmartCoinStore((s) => s.balance);

  const items = useMemo(() => {
    if (tab === 'outfits') return COSMETICS_CATALOG.filter((c) => c.type === 'outfit');
    if (tab === 'accessories') return COSMETICS_CATALOG.filter((c) => c.type === 'accessory');
    if (tab === 'backgrounds') return COSMETICS_CATALOG.filter((c) => c.type === 'background');
    return [];
  }, [tab]);

  const handleItemPress = async (cosmeticId: string) => {
    const unlocked = avatarStore.isUnlocked(cosmeticId);
    if (unlocked) {
      avatarStore.equipCosmetic(cosmeticId);
      return;
    }

    const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
    if (!item) return;

    if (item.purchaseable === false) {
      Alert.alert('Locked', item.unlockNote || 'Unlock this by earning milestones.');
      return;
    }

    const label = item.costType === 'xp' ? `${item.cost} XP` : `${item.cost} coins`;

    Alert.alert('Unlock Cosmetic', `Unlock ${item.name} for ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlock',
        onPress: async () => {
          const ok = await avatarStore.unlockCosmetic(cosmeticId);
          if (!ok) {
            Alert.alert('Not enough', item.costType === 'xp' ? 'Earn more XP to unlock this.' : 'You need more SmartCoins.');
            return;
          }
          avatarStore.equipCosmetic(cosmeticId);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Avatar Shop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.previewCard}>
        <AvatarPreview customization={avatarStore.customization} size="large" />
        <View style={styles.balanceRow}>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>XP: {totalXP.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>💰 {coins.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(
          [
            { id: 'character', label: 'Character' },
            { id: 'outfits', label: 'Outfits' },
            { id: 'accessories', label: 'Accessories' },
            { id: 'backgrounds', label: 'Backgrounds' },
          ] as const
        ).map((t) => {
          const selected = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tabChip, selected && styles.tabChipSelected]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'character' ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Choose Character</Text>
          <View style={styles.row}>
            {(['boy', 'girl'] as const).map((c) => {
              const selected = avatarStore.customization.baseCharacter === c;
              return (
                <Pressable
                  key={c}
                  style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                  onPress={() => avatarStore.updateCustomization({ baseCharacter: c })}
                >
                  <Text style={styles.choiceIcon}>{c === 'boy' ? '👦' : '👧'}</Text>
                  <Text style={styles.choiceText}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: SPACING.LG }]}>Skin Tone</Text>
          <View style={styles.row}>
            {(['light', 'medium', 'dark'] as const).map((tone) => {
              const selected = avatarStore.customization.skinTone === tone;
              return (
                <Pressable
                  key={tone}
                  style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                  onPress={() => avatarStore.updateCustomization({ skinTone: tone })}
                >
                  <Text style={styles.choiceText}>{tone}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => {
            const unlocked = avatarStore.isUnlocked(item.id);
            const canUnlockXP = item.costType === 'xp' && totalXP >= item.cost;
            const canUnlockCoins = item.costType === 'coins' && coins >= item.cost;

            const equipped =
              avatarStore.customization.outfit === item.id ||
              avatarStore.customization.background === item.id ||
              avatarStore.customization.accessories.includes(item.id);

            return (
              <Pressable
                key={item.id}
                style={[styles.itemCard, unlocked ? styles.itemCardUnlocked : styles.itemCardLocked]}
                onPress={() => void handleItemPress(item.id)}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.type === 'background'
                    ? item.unlockNote || 'Milestone'
                    : item.costType === 'xp'
                      ? `${item.cost} XP`
                      : `${item.cost} coins`}
                </Text>

                <View style={styles.itemFooter}>
                  {equipped ? (
                    <Text style={styles.equippedText}>Equipped</Text>
                  ) : unlocked ? (
                    <Text style={styles.unlockText}>Tap to equip</Text>
                  ) : item.purchaseable === false ? (
                    <Text style={styles.lockText}>Locked</Text>
                  ) : canUnlockXP || canUnlockCoins ? (
                    <Text style={styles.unlockText}>Tap to unlock</Text>
                  ) : (
                    <Text style={styles.lockText}>Not enough</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

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
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  balanceChip: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.BUTTON,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  balanceText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  tabChip: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.BUTTON,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  tabChipSelected: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  tabText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
  },
  tabTextSelected: {
    color: '#fff',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  sectionTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.SM,
    flexWrap: 'wrap',
  },
  choiceCard: {
    width: '31%',
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceCardSelected: {
    borderColor: COLORS.SAGE_PRIMARY,
  },
  choiceIcon: {
    fontSize: 28,
    marginBottom: SPACING.XS,
  },
  choiceText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  itemCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.SM,
    borderWidth: 2,
    ...SHADOWS.LIGHT,
    minHeight: 110,
  },
  itemCardUnlocked: {
    borderColor: COLORS.SAGE_PRIMARY + '30',
  },
  itemCardLocked: {
    borderColor: '#e6e6e6',
    opacity: 0.7,
  },
  itemName: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '800',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 4,
  },
  itemMeta: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  itemFooter: {
    marginTop: 'auto',
    paddingTop: SPACING.SM,
  },
  equippedText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '800',
    color: COLORS.FOREST_ACCENT,
  },
  unlockText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  lockText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
    color: COLORS.CORAL_ERROR,
  },
});
