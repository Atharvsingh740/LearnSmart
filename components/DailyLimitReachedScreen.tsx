import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { useRouter } from 'expo-router';

interface DailyLimitReachedScreenProps {
  minutesUsed: number;
  onGoBack?: () => void;
  onUpgrade?: () => void;
}

export const DailyLimitReachedScreen: React.FC<DailyLimitReachedScreenProps> = ({
  minutesUsed = 90,
  onGoBack,
  onUpgrade,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/(main)/subscription');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏰</Text>
        </View>

        <Text style={styles.title}>Daily Usage Limit Reached</Text>
        
        <Text style={styles.message}>
          You've used <Text style={styles.highlight}>{minutesUsed} minutes</Text> today.
        </Text>
        <Text style={styles.message}>
          Come back tomorrow or upgrade for unlimited access.
        </Text>

        <View style={styles.limitsInfo}>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Free Tier Limit:</Text>
            <Text style={styles.limitValue}>90 minutes/day</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Your Usage Today:</Text>
            <Text style={[styles.limitValue, styles.usedValue]}>{minutesUsed} minutes</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Time Until Reset:</Text>
            <Text style={styles.limitValue}>Tomorrow at midnight</Text>
          </View>
        </View>

        <View style={styles.upgradeBenefits}>
          <Text style={styles.benefitsTitle}>🚀 Upgrade to Unlock:</Text>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Unlimited usage hours</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>100-500 credits/day</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Priority support</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUpgrade}
            style={styles.upgradeButton}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.CREAM_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: COLORS.CORAL_ERROR + '20',
    borderRadius: 60,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
    color: COLORS.CORAL_ERROR,
  },
  limitsInfo: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  limitRowLast: {
    marginBottom: 0,
  },
  limitLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  limitValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
  },
  usedValue: {
    color: COLORS.CORAL_ERROR,
  },
  upgradeBenefits: {
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.AMBER_GOLD,
  },
  benefitsTitle: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 12,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SAND_BG,
    textAlign: 'center',
  },
});