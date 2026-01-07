import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useGiftCreditsStore, GiftCode } from '@/store/giftCreditsStore';

export default function GiftHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const { giftCodes } = useGiftCreditsStore();

  const sentCodes = giftCodes.filter(g => g.senderUserId === 'current-user');
  const receivedCodes = giftCodes.filter(g => g.redeemedBy === 'current-user');

  const renderCodeItem = ({ item }: { item: GiftCode }) => (
    <View style={styles.codeItem}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeAmount}>{item.creditsAmount} Credits</Text>
        <Text style={[styles.statusBadge, item.isRedeemed ? styles.statusRedeemed : styles.statusPending]}>
          {item.isRedeemed ? 'Redeemed' : 'Pending'}
        </Text>
      </View>
      <Text style={styles.codeValue}>{item.code}</Text>
      <View style={styles.codeFooter}>
        <Text style={styles.codeDate}>Sent on: {new Date(item.generatedAt).toLocaleDateString()}</Text>
        <Text style={styles.expiryDate}>Expires: {new Date(item.expiresAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Gift History</Text>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>Sent</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>Received</Text>
        </Pressable>
      </View>

      <FlatList
        data={activeTab === 'sent' ? sentCodes : receivedCodes}
        keyExtractor={(item) => item.codeId}
        renderItem={renderCodeItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No gift codes found</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.SAGE_PRIMARY,
  },
  tabText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  tabTextActive: {
    color: COLORS.SAGE_PRIMARY,
    fontWeight: 'bold',
    opacity: 1,
  },
  listContent: {
    padding: SPACING.MD,
  },
  codeItem: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  codeAmount: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
  },
  statusBadge: {
    fontSize: 10,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusPending: {
    backgroundColor: COLORS.GOLD_STREAK + '20',
    color: COLORS.AMBER_GOLD,
  },
  statusRedeemed: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    color: COLORS.SAGE_PRIMARY,
  },
  codeValue: {
    ...TYPOGRAPHY.HEADER,
    fontSize: 20,
    color: COLORS.CHARCOAL_TEXT,
    letterSpacing: 1,
    marginBottom: SPACING.SM,
  },
  codeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeDate: {
    fontSize: 10,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
  expiryDate: {
    fontSize: 10,
    color: COLORS.RED_ERROR,
    opacity: 0.7,
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
