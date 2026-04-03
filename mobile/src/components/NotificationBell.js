import { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStore from '../store';
import { getUnreadCount } from '../api/notificationApi';
import { COLORS } from '../config';

/**
 * Notification bell icon with animated badge count.
 * Polls unread count every 30 seconds.
 * Tap to navigate to NotificationsScreen.
 */
export default function NotificationBell() {
    const navigation = useNavigation();
    const { unreadCount, setUnreadCount, token } = useStore();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Poll unread count
    useEffect(() => {
        if (!token) return;

        const fetchCount = async () => {
            try {
                const data = await getUnreadCount();
                setUnreadCount(data.count || 0);
            } catch (e) {
                // Silently fail
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [token]);

    // Pulse animation when count changes
    useEffect(() => {
        if (unreadCount > 0) {
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [unreadCount]);

    return (
        <TouchableOpacity
            id="notification-bell"
            onPress={() => {
                try {
                    navigation?.navigate('Notifications');
                } catch (e) {
                    // Navigation unavailable outside NavigationContainer — silent fail
                }
            }}
            style={styles.container}
            activeOpacity={0.7}
        >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
                <Animated.View
                    style={[
                        styles.badge,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </Animated.View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bellIcon: {
        fontSize: 22,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.bg,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
    },
});
