import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { useCreditsStore } from '@/store/creditsStore';

interface CreditsInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreditsInfoModal: React.FC<CreditsInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const credits = useCreditsStore((state) => state.credits);
  const dailySessionMinutes = useCreditsStore((state) => state.dailySessionMinutes);
  const subscriptionTier = useCreditsStore((state) => state.subscriptionTier);
  const isSubscriptionActive = useCreditsStore((state) => state.isSubscriptionActive());
  const isPremium = subscriptionTier !== 'free' && isSubscriptionActive;

  const getDailyCreditLimit = () => {
    switch (subscriptionTier) {
      case 'monthly': return 100;
      case 'yearly': return 500;
      default: return 30;
    }
  };

  const getSessionTimeLimit = () => {
    return isPremium ? 24 * 60 : 90;
  };

  const sessionLimit = getSessionTimeLimit();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <Text style={styles.title}>💳 Credit Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.creditSummary}>
              <Text style={styles.creditLabel}>Available Credits</Text>
              <Text style={styles.creditValue}>{credits}</Text>
            </View>

            <View style={styles.sectionsContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Today's Usage</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Earned Today:</Text>
                  <Text style={styles.detailValue}>+{Math.min(credits, getDailyCreditLimit())}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Used Today:</Text>
                  <Text style={[styles.detailValue, styles.usedValue]}>-{getDailyCreditLimit() - credits}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Balance:</Text>
                  <Text style={styles.balanceValue}>{credits} credits</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏰ Session Time</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time Used Today:</Text>
                  <Text style={styles.detailValue}>{dailySessionMinutes} minutes</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Limit:</Text>
                  <Text style={styles.detailValue}>{sessionLimit} minutes</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Remaining:</Text>
                  <Text style={[styles.detailValue, styles.remainingValue]}>
                    {Math.max(0, sessionLimit - dailySessionMinutes)} minutes
                  </Text>
                </View>
              </View>

              {isPremium && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⭐ Premium Benefits</Text>
                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>Unlimited session time</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>{getDailyCreditLimit()} credits/day</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>Priority support</Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ How Credits Work</Text>
                <Text style={styles.infoText}>• 1 credit = 1 action/task in the app</Text>
                <Text style={styles.infoText}>• Free tier: 30 credits/day + 90 min limit</Text>
                <Text style={styles.infoText}>• Monthly: 100 credits/day + unlimited time</Text>
                <Text style={styles.infoText}>• Yearly: 500 credits/day + unlimited time</Text>
                <Text style={styles.infoText}>• Credits reset daily at midnight IST</Text>
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '40',
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.CORAL_ERROR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.SAND_BG,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  creditSummary: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    alignItems: 'center',
  },
  creditLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    marginBottom: 8,
  },
  creditValue: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  sectionsContainer: {
    gap: 16,
  },
  section: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '40',
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  detailValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
  },
  usedValue: {
    color: COLORS.CORAL_ERROR,
  },
  remainingValue: {
    color: COLORS.SAGE_PRIMARY,
  },
  balanceValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.SAGE_PRIMARY + '40',
    marginVertical: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: COLORS.SAGE_PRIMARY,
    marginRight: 8,
  },
  benefitText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
  },
  infoText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 13,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 20,
    marginBottom: 4,
  },
});