import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

export default function Onboarding() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.welcome')}</Text>
      <Text style={styles.subtitle}>Phase 2 will implement full onboarding flow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CREAM_BG,
    padding: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
});
