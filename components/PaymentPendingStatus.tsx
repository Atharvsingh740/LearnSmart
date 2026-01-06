import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';

interface PaymentPendingStatusProps {
  referenceId: string;
  amount: number;
  subscriptionTier: 'monthly' | 'yearly';
  onBackToHome: () => void;
}

export const PaymentPendingStatus: React.FC<PaymentPendingStatusProps> = ({
  referenceId,
  amount,
  subscriptionTier,
  onBackToHome,
}) => {
  const getTierDisplay = () => {
    return subscriptionTier === 'monthly' ? 'Monthly' : 'Yearly';
  };

  return (
    <View style={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✅</Text>
      </View>

      <Text style={styles.title}>Payment Verification Submitted</Text>

      <View style={styles.detailCard}>
        <Text style={styles.referenceLabel}>Reference ID:</Text>
        <Text style={styles.referenceValue}>{referenceId}</Text>
        <View style={styles.separator} />
        
        <Text style={styles.detailText}>
          Your payment is being verified.
        </Text>
        <Text style={styles.detailText}>
          Admin will confirm within <Text style={styles.highlight}>24 hours</Text>.
        </Text>

        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoValue}>₹{amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan:</Text>
            <Text style={styles.infoValue}>{getTierDisplay()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, styles.statusValue]}>⏳ Pending Verification</Text>
          </View>
        </View>
      </View>

      <Text style={styles.notificationText}>
        You'll receive a notification when verified.
      </Text>

      <TouchableOpacity
        onPress={onBackToHome}
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.CREAM_BG,
  },
  successIcon: {
    backgroundColor: COLORS.SAGE_PRIMARY + '20',
    borderRadius: 60,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 24,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  referenceLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  referenceValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.SAGE_PRIMARY + '40',
    marginVertical: 12,
  },
  detailText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 20,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  paymentInfo: {
    marginTop: 16,
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
  },
  statusValue: {
    color: COLORS.AMBER_GOLD,
  },
  notificationText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SAND_BG,
  },
});