import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '../../theme';
import SmartFAB from '../../components/SmartFAB';
import ChatModal from '../../components/ChatModal';
import { useSmartyStore } from '../../store/smartyStore';

export default function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const smartyStore = useSmartyStore();

  useEffect(() => {
    smartyStore.checkAndResetDailyLimit();
    const interval = setInterval(() => {
      smartyStore.checkAndResetDailyLimit();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.SAGE_PRIMARY,
          tabBarInactiveTintColor: COLORS.CHARCOAL_TEXT,
          tabBarStyle: {
            backgroundColor: COLORS.CREAM_BG,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="search/index"
          options={{
            title: 'Search',
          }}
        />
        <Tabs.Screen
          name="lessons"
          options={{
            title: 'Lessons',
          }}
        />
        <Tabs.Screen
          name="quiz"
          options={{
            title: 'Quiz',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '⚙️ Settings',
          }}
        />
        <Tabs.Screen
          name="gamification/hub"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="analytics/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="achievements/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="leaderboards/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="notes/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="bookmarks/index"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <SmartFAB onPress={() => setChatOpen(true)} animated={true} />

      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
