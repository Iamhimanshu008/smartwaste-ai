import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PublicMapScreen from '../screens/public/MapScreen';
import ReportScreen from '../screens/public/ReportScreen';
import StatusScreen from '../screens/public/StatusScreen';
import RecyclersScreen from '../screens/public/RecyclersScreen';
import { COLORS } from '../config';

const Stack = createNativeStackNavigator();

export default function PublicNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.dark },
                headerTintColor: COLORS.white,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <Stack.Screen
                name="PublicMap"
                component={PublicMapScreen}
                options={({ navigation }) => ({
                    title: 'SmartWaste - Public',
                    headerLeft: () => (
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Landing')}
                            style={{ marginLeft: 8 }}
                        >
                            <Text style={{ color: COLORS.white, fontSize: 16 }}>← Home</Text>
                        </TouchableOpacity>
                    ),
                    headerShown: true
                })}
            />
            <Stack.Screen
                name="Report"
                component={ReportScreen}
                options={{ title: 'Report Full Bin' }}
            />
            <Stack.Screen
                name="Status"
                component={StatusScreen}
                options={{ title: 'Report Status', headerBackVisible: false }}
            />
            <Stack.Screen
                name="Recyclers"
                component={RecyclersScreen}
                options={{ title: 'Nearby Recyclers' }}
            />
        </Stack.Navigator>
    );
}
