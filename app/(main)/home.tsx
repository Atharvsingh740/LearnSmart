import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const name = useUserStore((state) => state.name);
  const xp = useUserStore((state) => state.xp);
  const smartCoins = useUserStore((state) => state.smartCoins);
  const streak = useUserStore((state) => state.streak);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.title}>{t('app_name')}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>{t('profile.xp')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{smartCoins}</Text>
          <Text style={styles.statLabel}>{t('profile.smart_coins')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>{t('profile.streak')}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Phase 2 will implement full home screen</Text>
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
    marginBottom: SPACING.SM,
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
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.LG,
    marginTop: SPACING.MD,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.XL,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.SAND_BG,
    padding: SPACING.MD,
    borderRadius: 16,
    minWidth: 80,
  },
  statValue: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  statLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
});
