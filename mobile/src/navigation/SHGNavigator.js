import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BinsScreen from '../screens/shg/BinsScreen';
import ReportScreen from '../screens/shg/ReportScreen';
import HistoryScreen from '../screens/shg/HistoryScreen';
import ScheduleScreen from '../screens/shg/ScheduleScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationBell from '../components/NotificationBell';
import { COLORS } from '../config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const AlertsStack = createNativeStackNavigator();

function AlertsStackNavigator() {
    return (
        <AlertsStack.Navigator screenOptions={{ headerShown: false }}>
            <AlertsStack.Screen name="Notifications" component={NotificationsScreen} />
        </AlertsStack.Navigator>
    );
}

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
                options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="trash-can-outline" size={22} color={color} />, tabBarLabel: 'My Bins' }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-edit-outline" size={22} color={color} />, tabBarLabel: 'Report' }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsStackNavigator}
                options={{
                    tabBarIcon: () => <NotificationBell />,
                    tabBarLabel: 'Alerts',
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />, tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />, tabBarLabel: 'Schedule' }}
            />
        </Tab.Navigator>
    );
}
