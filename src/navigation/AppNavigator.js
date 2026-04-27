import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import useStore from '../store';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CollectorNavigator from './CollectorNavigator';
import SHGNavigator from './SHGNavigator';
import PublicNavigator from './PublicNavigator';
import { COLORS } from '../config';
import { registerForPushNotifications, setupNotificationListeners } from '../utils/notifications';
import { getUnreadCount } from '../api/notificationApi';

import LandingScreen from '../screens/LandingScreen';
import { checkForUpdate } from '../utils/updateChecker';
import { expo } from '../../app.json';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token, user, setUnreadCount } = useStore();
    const [loading, setLoading] = useState(true);

    // Wait for Zustand persist to rehydrate auth from AsyncStorage
    useEffect(() => {
        const unsub = useStore.persist.onFinishHydration(() => {
            setLoading(false);
        });
        // If already hydrated (e.g. fast device), unblock immediately
        if (useStore.persist.hasHydrated()) {
            setLoading(false);
        }

        // Check for updates silently on startup (no alert if up to date)
        setTimeout(() => {
            checkForUpdate(expo.version, false);
        }, 3000); // 3 second delay after app loads

        return unsub;
    }, []);

    // Register for push notifications after login
    useEffect(() => {
        if (!token || !user) return;

        // Register device & setup listeners only if not in Expo Go
        if (Constants.appOwnership !== 'expo') {
            registerForPushNotifications();
        }

        const cleanup = setupNotificationListeners(
            // On notification received in foreground
            async () => {
                try {
                    const data = await getUnreadCount();
                    setUnreadCount(data.count || 0);
                } catch (e) { }
            },
            // On notification tapped — could navigate to specific screen
            null,
        );

        // Fetch initial unread count
        (async () => {
            try {
                const data = await getUnreadCount();
                setUnreadCount(data.count || 0);
            } catch (e) { }
        })();

        return cleanup;
    }, [token, user]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark }}>
                <ActivityIndicator size="large" color={COLORS.light} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
            {!token ? (
                <>
                    <Stack.Screen name="Landing" component={LandingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="PublicStack" component={PublicNavigator} />
                </>
            ) : user?.role === 'collector' ? (
                <Stack.Screen name="CollectorTabs" component={CollectorNavigator} />
            ) : user?.role === 'shg' ? (
                <Stack.Screen name="SHGTabs" component={SHGNavigator} />
            ) : (
                <>
                    <Stack.Screen name="Landing" component={LandingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="PublicStack" component={PublicNavigator} />
                </>
            )}
        </Stack.Navigator>
    );
}

