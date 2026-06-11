import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/collector/HomeScreen';
import MapScreen from '../screens/public/MapScreen';
import HistoryScreen from '../screens/collector/HistoryScreen';
import StatsScreen from '../screens/collector/StatsScreen';
import SafetyChecklistScreen from '../screens/collector/SafetyChecklistScreen';
import NewsFeedScreen from '../screens/public/NewsFeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MorningSyncScreen from '../screens/collector/MorningSyncScreen';
import CollectionScreen from '../screens/collector/CollectionScreen';
import AfternoonSyncScreen from '../screens/collector/AfternoonSyncScreen';
import BleWeightScreen from '../screens/collector/BleWeightScreen';
import CaptureImageScreen from '../screens/collector/CaptureImageScreen';
import { COLORS } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

const TabIcon = ({ name, focused }) => (
    <View style={{ alignItems: 'center', opacity: focused ? 1 : 0.5 }}>
        <Ionicons name={name} size={24} color={focused ? COLORS.light : 'rgba(255,255,255,0.4)'} />
    </View>
);

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
            <HomeStack.Screen name="MorningSync" component={MorningSyncScreen} options={{ title: 'Morning Sync', headerShown: true }} />
            <HomeStack.Screen name="Collection" component={CollectionScreen} options={{ title: 'Record Collection', headerShown: true }} />
            <HomeStack.Screen name="BleWeight" component={BleWeightScreen} options={{ title: 'Weigh Waste', headerShown: true }} />
            <HomeStack.Screen name="CaptureImage" component={CaptureImageScreen} options={{ title: 'Capture Waste Photo', headerShown: true }} />
            <HomeStack.Screen name="AfternoonSync" component={AfternoonSyncScreen} options={{ title: 'Afternoon Sync', headerShown: true }} />
        </HomeStack.Navigator>
    );
}

function MapStackNavigator() {
    return (
        <MapStack.Navigator>
            <MapStack.Screen name="MapMain" component={MapScreen} options={{ headerShown: false }} />
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
                options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />, tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Map"
                component={MapStackNavigator}
                options={{ tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} />, tabBarLabel: 'Map' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon name="time" focused={focused} />, tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon name="stats-chart" focused={focused} />, tabBarLabel: 'Stats' }}
            />
        </Tab.Navigator>
    );
}
