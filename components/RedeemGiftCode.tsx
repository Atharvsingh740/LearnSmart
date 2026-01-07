import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useGiftCreditsStore } from '@/store/giftCreditsStore';

export default function RedeemGiftCode() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { redeemGiftCode } = useGiftCreditsStore();

  const handleRedeem = async () => {
    if (!code.trim()) return;

    setStatus('loading');
    const result = await redeemGiftCode('current-user', code);

    if (result.success) {
      setStatus('success');
      setMessage(`Success! You received ${result.amount} credits.`);
      setCode('');
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to redeem code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redeem Gift Code</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter code (e.g. GFT_ABC12345)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Pressable 
          style={[styles.redeemBtn, (status === 'loading' || !code) && styles.disabledBtn]} 
          onPress={handleRedeem}
          disabled={status === 'loading' || !code}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.redeemBtnText}>Claim</Text>
          )}
        </Pressable>
      </View>

      {status === 'success' && <Text style={styles.successText}>{message}</Text>}
      {status === 'error' && <Text style={styles.errorText}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginVertical: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  title: {
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.SMALL,
    padding: SPACING.MD,
    marginRight: SPACING.SM,
    ...TYPOGRAPHY.BODY,
  },
  redeemBtn: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    paddingHorizontal: SPACING.LG,
    borderRadius: RADIUS.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  successText: {
    marginTop: SPACING.SM,
    color: COLORS.SAGE_PRIMARY,
    ...TYPOGRAPHY.METADATA,
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: SPACING.SM,
    color: COLORS.RED_ERROR,
    ...TYPOGRAPHY.METADATA,
  },
});
