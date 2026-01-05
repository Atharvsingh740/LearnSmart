import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const contactEmail = 'learnsmartofficial24@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactEmail}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

      {/* Data Safety */}
      <Section title="🔒 Your Data is Safe">
        <Text style={styles.text}>
          LearnSmart takes your privacy seriously. All your personal data, progress, and learning history is stored securely on your device using encrypted storage.
        </Text>
        <BulletPoint text="No data is uploaded to any external server without your consent" />
        <BulletPoint text="All student information is encrypted at rest" />
        <BulletPoint text="Your device data is never sold or shared with third parties" />
      </Section>

      {/* No Third Party Sharing */}
      <Section title="🛡️ No Third Party Sharing">
        <Text style={styles.text}>
          We do NOT share your data with:
        </Text>
        <BulletPoint text="Advertisers or marketing companies" />
        <BulletPoint text="Data brokers or analytics firms" />
        <BulletPoint text="Social media platforms" />
        <BulletPoint text="Any external third parties without explicit permission" />
        <Text style={styles.text}>
          The only exception: We use AdMob for ads, which follows Google's privacy standards.
        </Text>
      </Section>

      {/* Why We Need Data */}
      <Section title="📊 Why We Collect Data">
        <Text style={styles.text}>
          LearnSmart collects minimal personal data only to:
        </Text>
        <BulletPoint text="Personalize your learning experience" />
        <BulletPoint text="Track your progress and achievements" />
        <BulletPoint text="Remember your class, stream, and preferences" />
        <BulletPoint text="Generate AI-powered study recommendations" />
        <BulletPoint text="Maintain your study streak and XP progress" />
        <BulletPoint text="Enable features like study groups and Q&A" />

        <Text style={[styles.text, styles.marginTop]}>
          We only collect:
        </Text>
        <BulletPoint text="Name (for profile personalization)" />
        <BulletPoint text="Class & Stream (for curriculum selection)" />
        <BulletPoint text="Avatar & Profile Picture (for identification)" />
        <BulletPoint text="Learning Progress (lessons, quizzes, XP)" />
        <BulletPoint text="Study Statistics (for analytics on your device)" />
      </Section>

      {/* What We Do With Data */}
      <Section title="⚙️ What LearnSmart Does With Your Data">
        <BulletPoint text="Generates personalized quiz questions via AI" />
        <BulletPoint text="Analyzes your learning patterns to suggest optimal study times" />
        <BulletPoint text="Creates custom study plans based on your progress" />
        <BulletPoint text="Powers Smarty AI chatbot to give you better learning support" />
        <BulletPoint text="Tracks daily streaks and achievements for gamification" />
        <BulletPoint text="Maintains your community contributions (Q&A, study groups)" />
        <Text style={styles.text}>
          All processing happens locally on your device. No data leaves your phone unless you explicitly share it (like uploading to study groups).
        </Text>
      </Section>

      {/* Image Reading Limit */}
      <Section title="📸 Image & File Reading (8 Daily Limit)">
        <Text style={styles.text}>
          Smarty can read up to 8 images/files per day (resets at 1 AM) to help you with:
        </Text>
        <BulletPoint text="Solving handwritten math problems" />
        <BulletPoint text="Explaining diagrams and charts" />
        <BulletPoint text="Translating and solving questions from photos" />
        <Text style={styles.text}>
          These files are processed locally and NOT stored on any server.
        </Text>
      </Section>

      {/* Ads & Analytics */}
      <Section title="📱 Ads & Analytics">
        <Text style={styles.text}>
          LearnSmart uses Google AdMob for ads. Google collects limited data:
        </Text>
        <BulletPoint text="Device type, OS version (for ad targeting)" />
        <BulletPoint text="Ad interaction data (views, clicks)" />
        <BulletPoint text="Approximate location (country/region only)" />
        <Text style={styles.text}>
          You can opt-out of personalized ads in device settings. Your LearnSmart data is NEVER shared with Google for profiling.
        </Text>
      </Section>

      {/* Data Deletion */}
      <Section title="🗑️ Delete Your Data">
        <Text style={styles.text}>
          You can delete all your LearnSmart data anytime:
        </Text>
        <BulletPoint text="Uninstall the app to remove all local data" />
        <BulletPoint text="Use Settings → App Data → Clear All to wipe progress" />
        <BulletPoint text="Email us to request complete data removal" />
      </Section>

      {/* Data Retention */}
      <Section title="⏰ Data Retention">
        <Text style={styles.text}>
          Data stored on your device is yours. We don't retain copies. When you delete the app, all data is permanently removed.
        </Text>
      </Section>

      {/* Security */}
      <Section title="🔐 Security Measures">
        <BulletPoint text="AsyncStorage uses encrypted containers on iOS & Android" />
        <BulletPoint text="No sensitive data is transmitted over unencrypted connections" />
        <BulletPoint text="Regular security updates via app updates" />
      </Section>

      {/* Children's Privacy */}
      <Section title="👨‍👩‍👧 Children's Privacy">
        <Text style={styles.text}>
          LearnSmart is designed for students aged 6-18+. We don't collect data from children under 6 without parental consent. Parents can request data deletion for their children at any time.
        </Text>
      </Section>

      {/* Your Rights */}
      <Section title="⚖️ Your Rights">
        <Text style={styles.text}>
          You have the right to:
        </Text>
        <BulletPoint text="Access all your data stored in LearnSmart" />
        <BulletPoint text="Delete your data at any time" />
        <BulletPoint text="Export your learning progress" />
        <BulletPoint text="Opt-out of analytics and ads" />
        <BulletPoint text="Contact us with privacy concerns" />
      </Section>

      {/* Contact & Support */}
      <Section title="📧 Contact & Support">
        <Text style={styles.text}>
          Have questions about your privacy? Contact us:
        </Text>
        <Pressable style={styles.emailButton} onPress={handleEmailPress}>
          <Text style={styles.emailText}>{contactEmail}</Text>
        </Pressable>
        <Text style={styles.text}>
          We'll respond to your privacy requests within 7 days.
        </Text>
      </Section>

      {/* Policy Changes */}
      <Section title="📝 Changes to This Policy">
        <Text style={styles.text}>
          We may update this privacy policy occasionally. You'll be notified of major changes via app notification. Your continued use of LearnSmart means you accept the updated policy.
        </Text>
      </Section>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletContainer}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 50,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
  },
  lastUpdated: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    marginBottom: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  text: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 24,
    marginBottom: SPACING.MD,
  },
  marginTop: {
    marginTop: SPACING.MD,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
    paddingLeft: SPACING.MD,
  },
  bullet: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.FOREST_ACCENT,
    marginRight: SPACING.SM,
    fontWeight: 'bold',
  },
  bulletText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    flex: 1,
    lineHeight: 22,
  },
  emailButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    marginVertical: SPACING.MD,
    ...SHADOWS.LIGHT,
  },
  emailText: {
    color: '#fff',
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  footer: {
    height: SPACING.XL,
  },
});
