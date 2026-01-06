import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';

interface PaymentInstructionsProps {
  upiId?: string;
  payeeName?: string;
  amount: number;
  variant?: 'compact' | 'full';
}

export const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  upiId = 'devyani0131@okaxis',
  payeeName = 'LearnSmart (Prachi Singh)',
  amount,
  variant = 'full',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 How to Pay:</Text>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Scan the QR code with your UPI app (Google Pay, PhonePe, etc.)
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            Confirm payment in your UPI app
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Amount: 
            <Text style={styles.amountText}>₹{amount}</Text>
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>
            Payee: <Text style={styles.highlight}>{payeeName}</Text>
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>5.</Text>
          <Text style={styles.stepText}>
            Enter Transaction ID below for manual verification
          </Text>
        </View>
      </View>

      {variant === 'full' && (
        <View style={styles.upiDetailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>UPI ID:</Text>
            <Text style={styles.detailValue}>{upiId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payee:</Text>
            <Text style={styles.detailValue}>{payeeName}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
  },
  stepsContainer: {
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
    lineHeight: 20,
  },
  amountText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
  },
  highlight: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.FOREST_ACCENT,
    fontWeight: '600',
  },
  upiDetailsContainer: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  detailValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '500',
  },
});