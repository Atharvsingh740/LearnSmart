import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

export default function Profile() {
  const { t } = useTranslation();
  const { name, xp, smartCoins, streak, completedLessons } = useUserStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.profile')}</Text>
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
      <Text style={styles.subtitle}>Phase 2 will implement full profile screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.LG,
    backgroundColor: COLORS.CREAM_BG,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.LG,
    marginTop: SPACING.XL,
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
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
});
