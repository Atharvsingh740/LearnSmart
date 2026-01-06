import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { usePaymentStore } from '@/store/paymentStore';
import { useUserStore } from '@/store/userStore';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { PaymentInstructions } from '@/components/PaymentInstructions';
import { TransactionVerificationForm } from '@/components/TransactionVerificationForm';
import { PaymentPendingStatus } from '@/components/PaymentPendingStatus';
import { generateUPIQRData } from '@/store/paymentStore';
import { ActivityIndicator } from 'react-native';

type PaymentStep = 'form' | 'submitting' | 'success';

const PaymentUPIScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tier = params.tier as 'monthly' | 'yearly';

  const [step, setStep] = useState<PaymentStep>('form');
  const [referenceId, setReferenceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitPayment = usePaymentStore((state) => state.submitPaymentVerification);
  const userId = useUserStore((state) => state.userId || 'anonymous');

  const plan = tier === 'monthly' 
    ? { name: 'Monthly Plan', amount: 81, credits: 100 }
    : { name: 'Yearly Plan', amount: 461, credits: 500 };

  const transactionIdPrefix = tier.toUpperCase();
  const transactionSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  const transactionId = `${transactionIdPrefix}_${Date.now()}_${transactionSuffix}`;

  const handleSubmit = async (txnId: string, phone: string) => {
    try {
      setSubmitting(true);
      setStep('submitting');
      setError(null);

      // Simulate 1-2 second delay for verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      const referenceId = await submitPayment(
        userId,
        tier,
        txnId,
        phone,
        plan.amount
      );

      setReferenceId(referenceId);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment verification');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'submitting') return;
    router.back();
  };

  const renderFormStep = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Payment</Text>
        <Text style={styles.subtitle}>Secure UPI payment with manual verification</Text>
      </View>

      <View style={styles.planBanner}>
        <Text style={styles.planBannerName}>{plan.name}</Text>
        <Text style={styles.planBannerAmount}>₹{plan.amount}</Text>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>✨ What You'll Get:</Text>
        <View style={styles.benefitRow}>
          <Text style={styles.benefitIcon}>💳</Text>
          <Text style={styles.benefitText}>{plan.credits} credits per day</Text>
        </View>
        <View style={styles.benefitRow}>
          <Text style={styles.benefitIcon}>⏰</Text>
          <Text style={styles.benefitText}>Unlimited usage hours</Text>
        </View>
        <View style={styles.benefitRow}>
          <Text style={styles.benefitIcon}>🎯</Text>
          <Text style={styles.benefitText}>Priority support</Text>
        </View>
      </View>

      <View style={styles.qrSection}>
        <QRCodeDisplay
          amount={plan.amount}
          transactionId={transactionId}
          upiId="devyani0131@okaxis"
          payeeName="LearnSmart (Prachi Singh)"
          size="large"
        />
      </View>

      <PaymentInstructions
        amount={plan.amount}
        upiId="devyani0131@okaxis"
        payeeName="LearnSmart (Prachi Singh)"
      />

      <TransactionVerificationForm
        onSubmit={handleSubmit}
        onCancel={handleBack}
        loading={submitting}
        error={error}
      />
    </ScrollView>
  );

  const renderSubmittingStep = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.SAGE_PRIMARY} />
      <Text style={styles.loadingText}>Verifying your transaction...</Text>
    </View>
  );

  const renderSuccessStep = () => (
    <PaymentPendingStatus
      referenceId={referenceId}
      amount={plan.amount}
      subscriptionTier={tier}
      onBackToHome={() => router.push('/(main)/home')}
    />
  );

  return (
    <View style={styles.screenContainer}>
      {step === 'form' && renderFormStep()}
      {step === 'submitting' && renderSubmittingStep()}
      {step === 'success' && renderSuccessStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.CREAM_BG,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: COLORS.SAND_BG,
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  planBanner: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    padding: 16,
    alignItems: 'center',
  },
  planBannerName: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.SAND_BG,
  },
  planBannerAmount: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.GOLD_STREAK,
    marginTop: 4,
  },
  benefitsSection: {
    backgroundColor: COLORS.SAND_BG,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  benefitsTitle: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
  },
  qrSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CREAM_BG,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: 16,
  },
});

export default PaymentUPIScreen;