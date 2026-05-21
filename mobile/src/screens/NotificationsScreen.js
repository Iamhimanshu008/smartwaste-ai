import { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../api/notificationApi';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../config';
import { useTranslation } from '../i18n';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const NOTIFICATION_ICONS = {
    critical_bin: <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />,
    route_assigned: <MaterialCommunityIcons name="truck" size={20} color="#3b82f6" />,
    report_verified: <Ionicons name="checkmark-circle" size={20} color="#16a34a" />,
    route_complete: <Ionicons name="flag" size={20} color="#16a34a" />,
};

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen({ navigation }) {
    const { notifications, setNotifications, setUnreadCount } = useStore();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            const countData = await getUnreadCount();
            setUnreadCount(countData.count || 0);
        } catch (e) {
            console.log('Failed to load notifications:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => {
        loadNotifications();
    }, []));

    const handleMarkRead = async (item) => {
        if (item.is_read) return;
        try {
            await markAsRead(item.id);
            setNotifications(
                notifications.map(n => n.id === item.id ? { ...n, is_read: true } : n)
            );
            const countData = await getUnreadCount();
            setUnreadCount(countData.count || 0);
        } catch (e) {
            console.log('Failed to mark as read:', e.message);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) {
            console.log('Failed to mark all as read:', e.message);
        }
    };

    const getNotifType = (item) => {
        try {
            if (item.data) {
                const parsed = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                return parsed.type || 'default';
            }
        } catch { }
        return 'default';
    };

    const renderItem = ({ item }) => {
        const type = getNotifType(item);
        const icon = NOTIFICATION_ICONS[type] || <Ionicons name="notifications" size={20} color="#6b7280" />;

        return (
            <TouchableOpacity
                style={[styles.card, !item.is_read && styles.cardUnread]}
                onPress={() => handleMarkRead(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardRow}>
                    <View style={[styles.iconCircle, !item.is_read && styles.iconCircleUnread]}>
                        {icon}
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleUnread]}>
                                {item.title}
                            </Text>
                            {!item.is_read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.cardBody}>{item.body}</Text>
                        <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const unreadExists = notifications.some(n => !n.is_read);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications')}</Text>
                {unreadExists && (
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Read All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.light} style={{ marginTop: 60 }} />
            ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={56} color="#9ca3af" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>{t('no_notifications')}</Text>
                    <Text style={styles.emptyText}>
                        You'll receive alerts for routes, bin reports, and collection updates.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadNotifications(); }}
                            tintColor={COLORS.light}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        paddingVertical: 4,
        paddingRight: 12,
    },
    backText: {
        fontSize: 15,
        color: COLORS.mid,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.dark,
        flex: 1,
        textAlign: 'center',
    },
    markAllBtn: {
        backgroundColor: COLORS.accent + '40',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    markAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.mid,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
        borderLeftWidth: 0,
    },
    cardUnread: {
        backgroundColor: '#F0FFF4',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.light,
        shadowOpacity: 0.08,
        elevation: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconCircleUnread: {
        backgroundColor: COLORS.accent + '50',
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        flex: 1,
    },
    cardTitleUnread: {
        fontWeight: '800',
        color: COLORS.dark,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.light,
        marginLeft: 8,
    },
    cardBody: {
        fontSize: 13,
        color: '#666',
        lineHeight: 19,
        marginTop: 4,
    },
    cardTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
});
