import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using LearnSmart, you agree to be bound by these Terms 
          of Service. If you do not agree to these terms, please do not use our app.
        </Text>

        <Text style={styles.sectionTitle}>2. Subscription Service</Text>
        <Text style={styles.text}>
          LearnSmart offers both free and paid subscription plans. Paid subscriptions 
          are billed in advance on a monthly or yearly basis, as selected by you.
        </Text>
        <Text style={styles.text}>
          • Monthly Plan: ₹81/month (100 credits/day, unlimited hours)
          • Yearly Plan: ₹461/year (500 credits/day, unlimited hours)
          • Subscriptions auto-renew unless cancelled
        </Text>

        <Text style={styles.sectionTitle}>3. Payment Terms</Text>
        <Text style={styles.text}>
          All payments are processed via UPI (Unified Payments Interface). We use 
          manual verification for all transactions. Your subscription will only be 
          activated after successful payment verification by our admin team within 
          24 hours.
        </Text>
        <Text style={styles.text}>
          Refund Policy: No refunds for partially used subscription periods. 
          Refunds are only issued for failed verifications or technical issues at 
          our discretion.
        </Text>

        <Text style={styles.sectionTitle}>4. Usage Limits</Text>
        <Text style={styles.text}>
          Free tier users are limited to 30 credits per day and 90 minutes of usage.
          Premium subscribers receive daily credit allocations and unlimited usage 
          time based on their selected plan.
        </Text>

        <Text style={styles.sectionTitle}>5. Content Ownership</Text>
        <Text style={styles.text}>
          All educational content, including but not limited to lessons, practice 
          tests, and explanations, is the property of LearnSmart. Users are granted 
          a limited license to access this content for personal, educational purposes 
          only.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.text}>
          LearnSmart is provided "as is" without any warranties. We strive to provide 
          accurate educational content but do not guarantee completeness or accuracy. 
          Users should cross-reference with official sources when necessary.
        </Text>
        <Text style={styles.text}>
          We are not liable for any direct, indirect, incidental, or consequential 
          damages arising from the use or inability to use our service.
        </Text>

        <Text style={styles.sectionTitle}>7. Privacy Policy</Text>
        <Text style={styles.text}>
          Your privacy is important to us. Please review our Privacy Policy to understand 
          how we collect, use, and protect your personal information.
        </Text>

        <Text style={styles.sectionTitle}>8. Termination</Text>
        <Text style={styles.text}>
          We reserve the right to terminate or suspend your account at our sole discretion, 
          without notice, for conduct that we believe violates these Terms or is harmful 
          to other users or our business interests.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these Terms from time to time. We will notify users of any material 
          changes via in-app notification or email. Continued use of the app after changes 
          constitutes acceptance of the new Terms.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.text}>
          For questions about these Terms or our services, please contact:
          • Email: learnsmart@example.com
          • UPI: devyani0131@okaxis
          • Admin: Prachi Singh
        </Text>

        <Text style={styles.copyright}>
          © 2024 LearnSmart. All rights reserved.
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
    backgroundColor: COLORS.SAND_BG,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '40',
  },
  title: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 8,
  },
  lastUpdated: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 22,
    marginBottom: 12,
  },
  copyright: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    marginTop: 32,
    textAlign: 'center',
  },
});

export default TermsOfServiceScreen;