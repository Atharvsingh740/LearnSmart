import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { useCreditsStore } from '@/store/creditsStore';

interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'yearly';
  name: string;
  price: number;
  creditsPerDay: number;
  sessionLimit: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

const SubscriptionScreen: React.FC = () => {
  const router = useRouter();
  const subscriptionTier = useCreditsStore((state) => state.subscriptionTier);
  const isSubscriptionActive = useCreditsStore((state) => state.isSubscriptionActive());

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Trial (21 days)',
      price: 0,
      creditsPerDay: 30,
      sessionLimit: '90 minutes/day',
      features: [
        '✓ Access to all subjects',
        '✓ Basic practice tests',
        '✓ Community support',
        '✓ Daily credit bonus',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 81,
      creditsPerDay: 100,
      sessionLimit: 'Unlimited hours',
      features: [
        '✓ 100 credits per day',
        '✓ Unlimited usage hours',
        '✓ Auto-renews monthly',
        '✓ Cancel anytime',
        '✓ Priority support',
      ],
      badge: '⭐',
      popular: true,
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: 461,
      creditsPerDay: 500,
      sessionLimit: 'Unlimited hours',
      features: [
        '✓ 500 credits per day (SAVE 84%!)',
        '✓ Unlimited usage hours',
        '✓ Auto-renews yearly',
        '✓ Cancel anytime',
        '✓ Priority support',
        '✓ Exclusive content access',
      ],
      badge: '👑',
    },
  ];

  const handleSelectPlan = (planId: 'free' | 'monthly' | 'yearly') => {
    if (planId === 'free') {
      // Show free trial info or just go back
      router.back();
      return;
    }

    // Navigate to payment screen for premium plans
    router.push({
      pathname: '/subscription/payment-upi',
      params: { tier: planId },
    });
  };

  const getCurrentPlanStatus = (planId: 'free' | 'monthly' | 'yearly') => {
    if (planId === subscriptionTier && isSubscriptionActive) {
      return '✓ Current Plan';
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Unlock unlimited learning with premium features</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan, index) => {
          const isCurrent = getCurrentPlanStatus(plan.id) !== null;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.popular && styles.planCardPopular,
                isCurrent && styles.planCardCurrent,
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                {plan.badge && (
                  <Text style={styles.planBadge}>{plan.badge}</Text>
                )}
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </Text>
                {plan.price > 0 && (
                  <Text style={styles.planPriceUnit}>
                    {plan.id === 'monthly' ? '/month' : '/year'}
                  </Text>
                )}
              </View>

              <View style={styles.planFeatures}>
                <Text style={styles.planFeatureTitle}>What's Included:</Text>
                {plan.features.map((feature, idx) => (
                  <Text key={idx} style={styles.planFeature}>
                    {feature}
                  </Text>
                ))}

                <View style={styles.planLimits}>
                  <Text style={styles.planLimitLabel}>Daily Credits:</Text>
                  <Text style={styles.planLimitValue}>{plan.creditsPerDay}</Text>
                </View>

                <View style={styles.planLimits}>
                  <Text style={styles.planLimitLabel}>Session Limit:</Text>
                  <Text style={styles.planLimitValue}>{plan.sessionLimit}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
                style={[
                  styles.selectButton,
                  plan.popular && styles.selectButtonPopular,
                  isCurrent && styles.selectButtonCurrent,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.selectButtonText}>
                  {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Continue with Free' : 'Upgrade Now'}
                </Text>
              </TouchableOpacity>

              {isCurrent && (
                <Text style={styles.currentPlanBadge}>
                  {getCurrentPlanStatus(plan.id)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>All prices in INR (₹)</Text>
        <Text style={styles.footerText}>
          Need help? Contact support at learnsmart@example.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.CREAM_BG,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.SAND_BG,
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    textAlign: 'center',
  },
  plansContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  planCard: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  planCardPopular: {
    borderColor: COLORS.AMBER_GOLD,
    borderWidth: 3,
    shadowColor: COLORS.AMBER_GOLD,
    shadowOpacity: 0.2,
  },
  planCardCurrent: {
    borderColor: COLORS.GOLD_STREAK,
    borderWidth: 3,
    shadowColor: COLORS.GOLD_STREAK,
    shadowOpacity: 0.2,
  },
  popularBadge: {
    backgroundColor: COLORS.AMBER_GOLD,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  popularBadgeText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.SAND_BG,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '40',
    paddingBottom: 16,
  },
  planBadge: {
    fontSize: 32,
    marginBottom: 8,
  },
  planName: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  planPriceUnit: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeatureTitle: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 12,
  },
  planFeature: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 20,
    marginBottom: 8,
  },
  planLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    backgroundColor: COLORS.CREAM_BG,
    borderRadius: 8,
    padding: 12,
  },
  planLimitLabel: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  planLimitValue: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SAGE_PRIMARY,
  },
  selectButton: {
    backgroundColor: COLORS.FOREST_ACCENT,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectButtonPopular: {
    backgroundColor: COLORS.AMBER_GOLD,
  },
  selectButtonCurrent: {
    backgroundColor: COLORS.GOLD_STREAK,
  },
  selectButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SAND_BG,
  },
  currentPlanBadge: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.GOLD_STREAK,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '30',
    marginTop: 16,
  },
  footerText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SubscriptionScreen;