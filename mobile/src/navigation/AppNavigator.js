import { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import useStore from '../store';
import LoginScreen from '../screens/LoginScreen';
import CollectorNavigator from './CollectorNavigator';
import SHGNavigator from './SHGNavigator';
import PublicNavigator from './PublicNavigator';
import { COLORS } from '../config';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token, user, loadStoredAuth } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await loadStoredAuth();
            setLoading(false);
        };
        init();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark }}>
                <ActivityIndicator size="large" color={COLORS.light} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!token ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="PublicStack" component={PublicNavigator} />
                </>
            ) : user?.role === 'collector' ? (
                <Stack.Screen name="CollectorTabs" component={CollectorNavigator} />
            ) : user?.role === 'shg' ? (
                <Stack.Screen name="SHGTabs" component={SHGNavigator} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}
