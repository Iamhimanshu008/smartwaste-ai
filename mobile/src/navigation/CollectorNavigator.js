import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/collector/HomeScreen';
import MapScreen from '../screens/collector/MapScreen';
import BinDetailScreen from '../screens/collector/BinDetailScreen';
import HistoryScreen from '../screens/collector/HistoryScreen';
import StatsScreen from '../screens/collector/StatsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationBell from '../components/NotificationBell';
import { COLORS } from '../config';

// Inline SVG-style icon component using unicode
import { Text, View } from 'react-native';
const TabIcon = ({ emoji, focused }) => (
    <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
);

const Tab = createBottomTabNavigator();
const MapStack = createNativeStackNavigator();
const AlertsStack = createNativeStackNavigator();

function MapStackNavigator() {
    return (
        <MapStack.Navigator>
            <MapStack.Screen name="MapMain" component={MapScreen} options={{ headerShown: false }} />
            <MapStack.Screen
                name="BinDetail"
                component={BinDetailScreen}
                options={{
                    title: 'Bin Details',
                    headerStyle: { backgroundColor: COLORS.dark },
                    headerTintColor: COLORS.white,
                    headerTitleStyle: { fontWeight: '700' },
                }}
            />
            <MapStack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
        </MapStack.Navigator>
    );
}

function AlertsStackNavigator() {
    return (
        <AlertsStack.Navigator screenOptions={{ headerShown: false }}>
            <AlertsStack.Screen name="Notifications" component={NotificationsScreen} />
        </AlertsStack.Navigator>
    );
}

export default function CollectorNavigator() {
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
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Map"
                component={MapStackNavigator}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />, tabBarLabel: 'Map' }}
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
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🕐" focused={focused} />, tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Stats' }}
            />
        </Tab.Navigator>
    );
}

