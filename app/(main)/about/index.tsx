import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { StatusBar } from 'expo-status-bar';

const AboutScreen: React.FC = () => {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>About LearnSmart</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 100)</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          LearnSmart is an innovative educational platform designed to make learning 
          engaging, interactive, and accessible for students across India. Our mission 
          is to democratize quality education through technology.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
          <Text style={styles.sectionText}>
            To provide every student with a personalized, AI-powered learning assistant 
            that adapts to their learning style and helps them achieve academic excellence.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Key Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>📚 Curriculum-aligned content (NCERT)</Text>
            <Text style={styles.feature}>🤖 AI-powered chatbot (Smarty)</Text>
            <Text style={styles.feature}>🎯 Interactive practice tests</Text>
            <Text style={styles.feature}>📊 Progress tracking & analytics</Text>
            <Text style={styles.feature}>🌟 Gamification with rewards</Text>
            <Text style={styles.feature}>⏰ Smart session management</Text>
            <Text style={styles.feature}>💳 Flexible subscription plans</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Technology Credits</Text>
          <View style={styles.creditsList}>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>cto.new</Text>
              <Text style={styles.creditDesc}>AI-powered code generation platform</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>ChatGPT</Text>
              <Text style={styles.creditDesc}>AI planning, prompts, and error analysis</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>Gemini API</Text>
              <Text style={styles.creditDesc}>Advanced AI for natural language understanding</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>React Native / Expo</Text>
              <Text style={styles.creditDesc}>Cross-platform mobile framework</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>Zustand</Text>
              <Text style={styles.creditDesc}>State management solution</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>FlashList</Text>
              <Text style={styles.creditDesc}>High-performance list rendering</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>React Native Reanimated</Text>
              <Text style={styles.creditDesc}>60 FPS animations</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditName}>i18next</Text>
              <Text style={styles.creditDesc}>Internationalization framework</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Our Team</Text>
          <Text style={styles.sectionText}>
            LearnSmart is brought to you by Prachi Singh, dedicated to transforming 
            education through technology and making learning accessible to everyone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact & Support</Text>
          <View style={styles.contactList}>
            <Text style={styles.contact}>📧 Email: learnsmart@example.com</Text>
            <Text style={styles.contact}>📱 UPI: devyani0131@okaxis</Text>
            <Text style={styles.contact}>🏢 Payee: LearnSmart (Prachi Singh)</Text>
          </View>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity 
            onPress={() => router.push('/terms')}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkButtonText}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/privacy-policy')}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => openLink('https://github.com/learsmart')}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkButtonText}>GitHub Repository</Text>
          </TouchableOpacity>
        </View>

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
  version: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  content: {
    padding: 20,
  },
  description: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 12,
  },
  sectionText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    lineHeight: 20,
  },
  featuresList: {
    marginTop: 8,
  },
  feature: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 8,
  },
  creditsList: {
    marginTop: 8,
  },
  creditItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  creditName: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SAGE_PRIMARY,
    marginBottom: 2,
  },
  creditDesc: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
  },
  contactList: {
    marginTop: 8,
  },
  contact: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 8,
  },
  linksSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SAND_BG,
  },
  copyright: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AboutScreen;