import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../theme';

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { name, xp, smartCoins, streak, completedLessons } = useUserStore();

  const handleSettingsPress = () => {
    router.push('/(main)/settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{t('home.profile')}</Text>
        <Pressable style={styles.settingsButton} onPress={handleSettingsPress}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </Pressable>
      </View>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{name || 'Guest User'}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            {t('profile.xp')}: {xp}
          </Text>
          <Text style={styles.stat}>
            {t('profile.smart_coins')}: {smartCoins}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            {t('profile.streak')}: {streak}
          </Text>
          <Text style={styles.stat}>
            {t('profile.completed_lessons')}: {completedLessons.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.LG,
    backgroundColor: COLORS.CREAM_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
    marginTop: SPACING.XL,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  profileCard: {
    backgroundColor: COLORS.SAND_BG,
    padding: SPACING.LG,
    borderRadius: 24,
    marginBottom: SPACING.XL,
  },
  name: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  stat: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
});
