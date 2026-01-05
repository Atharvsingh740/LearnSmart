import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { name, class: userClass, stream, avatar, setUser } = useUserStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const contactEmail = 'learnsmartofficial24@gmail.com';

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${contactEmail}?subject=LearnSmart Support`);
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete all your progress, bookmarks, and learning history. This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            setUser({
              userId: null,
              name: null,
              class: null,
              stream: null,
              avatar: null,
              xp: 0,
              smartCoins: 0,
              streak: 0,
              completedLessons: [],
            });
            Alert.alert('Data Deleted', 'All your data has been cleared.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout?',
      'You will need to login again to access your account.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: () => {
            setUser({ userId: null, name: null });
            router.replace('/(auth)/onboarding');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Info */}
      <SettingSection title="👤 Profile">
        <SettingItem label="Name" value={name || 'Not set'} />
        <SettingItem label="Class" value={userClass || 'Not set'} />
        <SettingItem label="Stream" value={stream || 'Not set'} />
        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="⚙️ Preferences">
        <SettingToggle
          label="Push Notifications"
          value={notifications}
          onToggle={setNotifications}
        />
        <SettingToggle
          label="Dark Mode"
          value={darkMode}
          onToggle={setDarkMode}
        />
        <SettingToggle
          label="Auto Data Sync"
          value={dataSync}
          onToggle={setDataSync}
        />
      </SettingSection>

      {/* Privacy & Data */}
      <SettingSection title="🔐 Privacy & Data">
        <Pressable style={styles.settingItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable style={styles.settingItem} onPress={() => {}}>
          <Text style={styles.settingLabel}>Data Collection</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </SettingSection>

      {/* Contact & Support */}
      <SettingSection title="💬 Contact & Support">
        <Text style={styles.sectionDescription}>
          Email: {contactEmail}
        </Text>
        <Pressable style={styles.supportButton} onPress={handleContactSupport}>
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </Pressable>
        <Text style={styles.supportText}>
          Have questions or need help? Email us and we'll get back to you within 7 days.
        </Text>
      </SettingSection>

      {/* Data Management */}
      <SettingSection title="📊 Data Management">
        <Pressable style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </Pressable>
        <Text style={styles.warningText}>
          ⚠️ This will delete all your progress, quizzes, bookmarks, and achievements. This cannot be undone.
        </Text>
      </SettingSection>

      {/* Account */}
      <SettingSection title="👋 Account">
        <Pressable style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.dangerButtonText}>Logout</Text>
        </Pressable>
      </SettingSection>

      {/* App Info */}
      <SettingSection title="ℹ️ About">
        <SettingItem label="App Version" value="1.0.0" />
        <SettingItem label="Build Number" value="1" />
        <SettingItem label="Platform" value="React Native" />
      </SettingSection>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.settingSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const SettingItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

const SettingToggle = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: (value: boolean) => void }) => (
  <View style={styles.settingItemRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#ddd', true: COLORS.SAGE_PRIMARY }}
      thumbColor={value ? COLORS.FOREST_ACCENT : '#999'}
    />
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
    marginBottom: SPACING.LG,
  },
  settingSection: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    paddingVertical: SPACING.SM,
    ...SHADOWS.LIGHT,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  settingValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  arrow: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 20,
  },
  editButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    marginHorizontal: SPACING.MD,
    marginTop: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  editButtonText: {
    color: 'white',
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    marginHorizontal: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  supportButtonText: {
    color: 'white',
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  sectionDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
    fontWeight: '600',
  },
  supportText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.SM,
    opacity: 0.7,
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    marginHorizontal: SPACING.MD,
    marginTop: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  dangerButtonText: {
    color: 'white',
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  warningText: {
    ...TYPOGRAPHY.SMALL,
    color: '#DC143C',
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
    fontStyle: 'italic',
  },
  footer: {
    height: SPACING.XL,
  },
});
