import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import BinsScreen from '../screens/shg/BinsScreen';
import ReportScreen from '../screens/shg/ReportScreen';
import HistoryScreen from '../screens/shg/HistoryScreen';
import ScheduleScreen from '../screens/shg/ScheduleScreen';
import { COLORS } from '../config';

const TabIcon = ({ emoji, focused }) => (
    <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
);

const Tab = createBottomTabNavigator();

export default function SHGNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.dark,
                    borderTopColor: 'transparent',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarActiveTintColor: COLORS.light,
                tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
            }}
        >
            <Tab.Screen
                name="MyBins"
                component={BinsScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, tabBarLabel: 'My Bins' }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📝" focused={focused} />, tabBarLabel: 'Report' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🕐" focused={focused} />, tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />, tabBarLabel: 'Schedule' }}
            />
        </Tab.Navigator>
    );
}
