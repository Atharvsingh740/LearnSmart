import { Tabs } from 'expo-router';
import { COLORS } from '../../theme';

export default function MainLayout() {
  return (
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
    </Tabs>
  );
}
