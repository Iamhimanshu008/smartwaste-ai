import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../store';

// Screens
import CitizenHomeScreen from '../screens/citizen/CitizenHomeScreen';
import CitizenQRScreen from '../screens/citizen/CitizenQRScreen';
import CitizenOffersScreen from '../screens/citizen/CitizenOffersScreen';
import CitizenHistoryScreen from '../screens/citizen/CitizenHistoryScreen';
import CitizenLeaderboardScreen from '../screens/citizen/CitizenLeaderboardScreen';
import CitizenNotificationsScreen from '../screens/citizen/CitizenNotificationsScreen';
import CitizenComplaintsScreen from '../screens/citizen/CitizenComplaintsScreen';
import CitizenSubmitComplaintScreen from '../screens/citizen/CitizenSubmitComplaintScreen';
import CitizenEditProfileScreen from '../screens/citizen/CitizenEditProfileScreen';
import CitizenSettingsScreen from '../screens/citizen/CitizenSettingsScreen';
import CitizenOnboardingScreen from '../screens/public/CitizenOnboardingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';

// Custom Tab Bar Icon Component for the center Scan button
const ScanTabIcon = ({ focused }) => (
  <View style={styles.scanButtonContainer}>
    <View style={[styles.scanButton, focused && styles.scanButtonFocused]}>
      <MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFFFFF" />
    </View>
  </View>
);

function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: MED_GREEN,
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="TabHome" 
        component={CitizenHomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="TabScan" 
        component={CitizenQRScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <ScanTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="TabRewards" 
        component={CitizenOffersScreen} 
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function CitizenNavigator() {
  const { user } = useStore();
  const isProfileComplete = user?.house_id && user?.ward_no && user?.full_name && user?.full_name !== 'Citizen';

  return (
    <Stack.Navigator 
      initialRouteName={isProfileComplete ? "CitizenHome" : "CitizenOnboarding"}
      screenOptions={{ 
        headerShown: false,
        ...(Platform.OS === 'android' ? TransitionPresets.FadeFromBottomAndroid : TransitionPresets.SlideFromRightIOS),
      }}
    >
      {/* The main tab navigator */}
      <Stack.Screen name="CitizenHome" component={CitizenTabs} />
      
      {/* Standalone screens that can be pushed on top of tabs */}
      <Stack.Screen name="CitizenQR" component={CitizenQRScreen} />
      <Stack.Screen name="CitizenOffers" component={CitizenOffersScreen} />
      <Stack.Screen name="CitizenHistory" component={CitizenHistoryScreen} />
      <Stack.Screen name="CitizenLeaderboard" component={CitizenLeaderboardScreen} />
      <Stack.Screen name="CitizenNotifications" component={CitizenNotificationsScreen} />
      <Stack.Screen name="CitizenComplaints" component={CitizenComplaintsScreen} />
      <Stack.Screen name="CitizenSubmitComplaint" component={CitizenSubmitComplaintScreen} />
      <Stack.Screen name="CitizenEditProfile" component={CitizenEditProfileScreen} />
      <Stack.Screen name="CitizenSettings" component={CitizenSettingsScreen} />
      <Stack.Screen name="CitizenOnboarding" component={CitizenOnboardingScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scanButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MED_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MED_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  scanButtonFocused: {
    backgroundColor: DARK_GREEN,
  }
});
