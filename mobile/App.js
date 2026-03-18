import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications } from './src/utils/notifications';
import { savePushToken } from './src/api/collectorApi';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then(token => {
      if (token) {
        console.log('Push token registered:', token);
        savePushToken(token).catch(err => 
            console.log('Token save error:', err)
        );
      }
    });

    // Listen for notifications while app is open
    notificationListener.current = 
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

    // Listen for notification taps
    responseListener.current = 
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(
        responseListener.current
      );
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
