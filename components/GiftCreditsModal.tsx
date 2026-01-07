import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Share } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import { useGiftCreditsStore } from '@/store/giftCreditsStore';
import { useCreditsStore } from '@/store/creditsStore';

interface GiftCreditsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GiftCreditsModal({ visible, onClose }: GiftCreditsModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('5');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const { generateGiftCode, getAvailableCreditsForGift } = useGiftCreditsStore();
  const { credits } = useCreditsStore();

  const availableToGift = getAvailableCreditsForGift('current-user');

  const handleGenerate = async () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    const giftCode = await generateGiftCode('current-user', numAmount);
    if (giftCode) {
      setGeneratedCode(giftCode);
      setStep(3);
    }
  };

  const handleShare = async () => {
    if (!generatedCode) return;
    try {
      await Share.share({
        message: `Check this out! Use code ${generatedCode.code} to get ${generatedCode.creditsAmount} credits on LearnSmart!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>×</Text>
          </Pressable>

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Gift Credits</Text>
              <Text style={styles.subtitle}>Share your credits with friends!</Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Available to gift today:</Text>
                <Text style={styles.infoValue}>{availableToGift} / 30 Credits</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(availableToGift / 30) * 100}%` }]} />
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={() => setStep(2)}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Enter Amount</Text>
              <Text style={styles.subtitle}>How many credits would you like to gift?</Text>
              
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Amount (1-10)"
              />
              
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceText}>Your balance: {credits} credits</Text>
                <Text style={styles.balanceText}>You'll keep: {credits - (parseInt(amount) || 0)} credits</Text>
              </View>

              <Pressable 
                style={[styles.primaryBtn, (parseInt(amount) > availableToGift || parseInt(amount) > credits) && styles.disabledBtn]} 
                onPress={handleGenerate}
                disabled={parseInt(amount) > availableToGift || parseInt(amount) > credits}
              >
                <Text style={styles.primaryBtnText}>Generate Gift Code</Text>
              </Pressable>
            </View>
          )}

          {step === 3 && generatedCode && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Code Generated! 🎉</Text>
              <Text style={styles.subtitle}>Share this code with your friend</Text>
              
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{generatedCode.code}</Text>
              </View>
              
              <Text style={styles.expiryText}>Expires in 7 days</Text>

              <View style={styles.btnRow}>
                <Pressable style={[styles.primaryBtn, { flex: 1, marginRight: SPACING.SM }]} onPress={handleShare}>
                  <Text style={styles.primaryBtnText}>Share Code</Text>
                </Pressable>
                <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Done</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.LARGE,
    borderTopRightRadius: RADIUS.LARGE,
    padding: SPACING.XL,
    minHeight: 300,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    zIndex: 1,
  },
  closeBtnText: {
    fontSize: 32,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.5,
  },
  stepContainer: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.HEADER,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.XL,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: COLORS.SAND_BG,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.XL,
  },
  infoLabel: {
    ...TYPOGRAPHY.METADATA,
    marginBottom: 4,
  },
  infoValue: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.SM,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  primaryBtn: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    borderRadius: RADIUS.BUTTON,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  primaryBtnText: {
    color: '#fff',
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: COLORS.SAGE_PRIMARY + '80',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: SPACING.MD,
  },
  balanceInfo: {
    width: '100%',
    marginBottom: SPACING.XL,
  },
  balanceText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: COLORS.SAGE_PRIMARY + '10',
    padding: SPACING.LG,
    borderRadius: RADIUS.MEDIUM,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    borderStyle: 'dashed',
    marginBottom: SPACING.MD,
    width: '100%',
    alignItems: 'center',
  },
  codeText: {
    ...TYPOGRAPHY.HEADER,
    fontSize: 28,
    letterSpacing: 2,
    color: COLORS.SAGE_PRIMARY,
  },
  expiryText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.RED_ERROR,
    marginBottom: SPACING.XL,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    borderRadius: RADIUS.BUTTON,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.SAGE_PRIMARY,
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
  },
});
