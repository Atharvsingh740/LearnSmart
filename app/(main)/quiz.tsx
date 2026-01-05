import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

export default function Quiz() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.quizzes')}</Text>
      <Text style={styles.subtitle}>Phase 2+ will implement quiz screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.LG,
    backgroundColor: COLORS.CREAM_BG,
    justifyContent: 'center',
    alignItems: 'center',
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
