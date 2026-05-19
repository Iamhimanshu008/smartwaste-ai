import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/collector/HomeScreen';
import MapScreen from '../screens/collector/MapScreen';
import BinDetailScreen from '../screens/collector/BinDetailScreen';
import HistoryScreen from '../screens/collector/HistoryScreen';
import StatsScreen from '../screens/collector/StatsScreen';
import SafetyChecklistScreen from '../screens/collector/SafetyChecklistScreen';
import NewsFeedScreen from '../screens/public/NewsFeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { COLORS } from '../config';

import { View } from 'react-native';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="HomeMain" component={HomeScreen} />
            <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
            <HomeStack.Screen name="SafetyChecklist" component={SafetyChecklistScreen} />
            <HomeStack.Screen name="NewsFeed" component={NewsFeedScreen} />
        </HomeStack.Navigator>
    );
}

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
                component={HomeStackNavigator}
                options={{ tabBarIcon: ({ focused, color }) => <Ionicons name="home-outline" size={22} color={color} />, tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Map"
                component={MapStackNavigator}
                options={{ tabBarIcon: ({ focused, color }) => <MaterialCommunityIcons name="map-marker-path" size={22} color={color} />, tabBarLabel: 'Map' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarIcon: ({ focused, color }) => <Ionicons name="time-outline" size={22} color={color} />, tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{ tabBarIcon: ({ focused, color }) => <Ionicons name="stats-chart-outline" size={22} color={color} />, tabBarLabel: 'Stats' }}
            />
        </Tab.Navigator>
    );
}
