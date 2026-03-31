import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { registerDevice } from '../api/notificationApi';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for Expo push notifications.
 * Requests permissions, gets Expo push token, and sends it to the backend.
 * Returns the token string or null if registration fails.
 */
export async function registerForPushNotifications() {
    try {
        // Expo Go dropped push support in SDK 53+
        const isExpoGo = Constants.appOwnership === 'expo';
        if (isExpoGo) {
            console.warn('[SmartWaste] Push notifications not supported in Expo Go (SDK 53+). Build a dev client to test push.');
            return null;
        }

        // Push notifications only work on physical devices
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return null;
        }

        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request if not already granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission not granted');
            return null;
        }

        // Get the Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId
            ?? Constants.easConfig?.projectId;

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        const token = tokenData.data;
        console.log('Expo Push Token:', token);

        // Send token to backend
        try {
            await registerDevice(token);
            console.log('Device registered with backend');
        } catch (err) {
            console.log('Failed to register device with backend:', err.message);
        }

        // Android-specific notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'SmartWaste Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2D6A4F',
                sound: 'default',
            });
        }

        return token;
    } catch (error) {
        console.log('Error registering for push notifications:', error);
        return null;
    }
}

/**
 * Set up listeners for incoming notifications.
 * Returns a cleanup function to remove listeners.
 */
export function setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Fired when a notification is received while the app is foregrounded
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Fired when user taps on a notification
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification tapped:', response);
        if (onNotificationResponse) {
            onNotificationResponse(response);
        }
    });

    // Return cleanup function
    return () => {
        receivedSub.remove();
        responseSub.remove();
    };
}
