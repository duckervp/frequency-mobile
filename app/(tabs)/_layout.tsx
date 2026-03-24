import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#2bee79';
const MUTED = '#64748b'; // slate-500
const BG = '#102217';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: BG,
                    borderTopColor: `${PRIMARY}1a`, // primary/10
                    borderTopWidth: 1,
                    paddingBottom: 28,
                    paddingTop: 8,
                    height: 80,
                },
                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: MUTED,
                tabBarLabelStyle: {
                    fontSize: 9,
                    fontFamily: 'Lexend_700Bold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: 'Log',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="list-alt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="calendar-month" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
