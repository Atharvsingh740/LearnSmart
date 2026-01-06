import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import { useStreakStore } from '@/store/streakStore';
import { useSmartCoinStore } from '@/store/smartCoinStore';

interface StreakDisplayProps {
  current: number;
  longest: number;
  showCalendar?: boolean;
  showProtectionButton?: boolean;
}

export default function StreakDisplay({
  current,
  longest,
  showCalendar = false,
  showProtectionButton = false,
}: StreakDisplayProps) {
  const streakStore = useStreakStore();
  const coinBalance = useSmartCoinStore((s) => s.balance);

  const canProtect = current >= 7;
  const protectionActive = streakStore.checkStreakProtection();

  const handleProtection = async () => {
    if (!canProtect) return;

    Alert.alert(
      'Streak Protection',
      'Spend 50 SmartCoins to protect your streak for 1 day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Protect',
          onPress: async () => {
            const ok = await streakStore.activateStreakProtection();
            if (!ok) {
              Alert.alert('Not enough coins', 'You need 50 SmartCoins to activate protection.');
            } else {
              Alert.alert('Protected', 'Your streak is protected for 1 day.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>🔥 {current}-day streak</Text>
        <Text style={styles.subtitle}>Longest: {longest}</Text>
      </View>

      {showProtectionButton && (
        <Pressable
          style={[
            styles.protectButton,
            (!canProtect || protectionActive) && styles.protectButtonDisabled,
          ]}
          onPress={handleProtection}
          disabled={!canProtect || protectionActive}
        >
          <Text style={styles.protectText}>
            {protectionActive ? 'Protection Active' : 'Protect (50 coins)'}
          </Text>
        </Pressable>
      )}

      {showCalendar && (
        <Text style={styles.calendarHint}>Calendar view available in Profile → Streak Calendar</Text>
      )}

      {canProtect && (
        <Text style={styles.meta}>
          Balance: {coinBalance.toLocaleString()} coins{protectionActive ? ' • protected' : ''}
        </Text>
      )}
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
    ...SHADOWS.LIGHT,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.CHARCOAL_TEXT,
  },
  subtitle: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  protectButton: {
    marginTop: SPACING.MD,
    backgroundColor: COLORS.GOLD_STREAK,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
  },
  protectButtonDisabled: {
    opacity: 0.55,
  },
  protectText: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
  },
  calendarHint: {
    ...TYPOGRAPHY.SMALL,
    marginTop: SPACING.SM,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  meta: {
    ...TYPOGRAPHY.SMALL,
    marginTop: SPACING.SM,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
});
