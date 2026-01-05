import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { COLORS, SPACING } from '../theme';

export default function Index() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    // Simple navigation logic - can be enhanced later
    const timeout = setTimeout(() => {
      if (userId) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LearnSmart</Text>
      <ActivityIndicator size="large" color={COLORS.SAGE_PRIMARY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CREAM_BG,
    gap: SPACING.LG,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
});
