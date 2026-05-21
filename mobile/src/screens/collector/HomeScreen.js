import { useState, useCallback, useEffect } from 'react';
import AutoText from '../../components/AutoText';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import useStore from '../../store';
import { getTodayRoute, updateLocation } from '../../api/collectorApi';
import RouteCard from '../../components/RouteCard';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../config';
import AppHeader from '../../components/AppHeader';
import SideDrawer from '../../components/SideDrawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n';

export default function HomeScreen({ navigation }) {
    const { user, todayRoute, setTodayRoute, unreadCount } = useStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadRoute = async () => {
        try {
            setError(null);
            const route = await getTodayRoute();
            setTodayRoute(route);
        } catch (e) {
            if (e.response?.status === 404) {
                setTodayRoute(null);
                setError('no_route');
            } else {
                setError('error');
                Alert.alert('Error', e.message || 'Failed to load route. Check network.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadRoute(); }, []));

    const onRefresh = () => { setRefreshing(true); loadRoute(); };

    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        let interval;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            setIsTracking(true);
            interval = setInterval(async () => {
                try {
                    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    await updateLocation(location.coords.latitude, location.coords.longitude);
                } catch (e) {
                    console.log('Location update failed', e);
                }
            }, 10000);
            try {
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                await updateLocation(location.coords.latitude, location.coords.longitude);
            } catch (e) {}
        })();
        return () => {
            if (interval) clearInterval(interval);
            setIsTracking(false);
        };
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('good_morning') || 'Good morning,';
        if (hour < 17) return t('good_afternoon') || 'Good afternoon,';
        return t('good_evening') || 'Good evening,';
    };

    // Count priority bins (use urgency from stops, else derive from fill_level)
    const pending = todayRoute?.stops?.filter(s => s.status !== 'collected') || [];
    const getPriority = (s) => {
        const u = String(s.urgency || '').toLowerCase();
        if (['critical', 'urgent'].includes(u) || (!u && s.fill_level >= 90)) return 'urgent';
        if (u === 'high' || (!u && s.fill_level >= 70 && s.fill_level < 90)) return 'high';
        return 'normal';
    };
    const urgentCount = pending.filter(s => getPriority(s) === 'urgent').length;
    const highCount = pending.filter(s => getPriority(s) === 'high').length;
    const normalCount = pending.filter(s => getPriority(s) === 'normal').length;

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={t('dashboard')}
                onMenuPress={() => setDrawerOpen(true)}
                notificationCount={unreadCount}
                navigation={navigation}
            />
            <SideDrawer
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                user={user}
                navigation={navigation}
            />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.light} />}
            >
                <View style={styles.greetingSection}>
                    <Text style={styles.greetingText}>{getGreeting()}</Text>
                    <Text style={styles.userName}>
                        {user?.full_name?.split(' ')[0] || 'User'} 
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.light} style={{ marginTop: 60 }} />
                ) : error === 'no_route' ? (
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="party-popper" size={48} color="#16a34a" style={styles.emptyEmoji} />
                        <Text style={styles.emptyTitle}>{t('no_route_today')}</Text>
                        <AutoText style={styles.emptyText}>Check back later or contact your zone manager.</AutoText>
                    </View>
                ) : todayRoute ? (
                    <>
                        {/* Route Card */}
                        <RouteCard
                            stops={todayRoute.total_stops}
                            collectedStops={todayRoute.collected_stops}
                            distance={todayRoute.total_distance_km}
                            duration={todayRoute.estimated_duration_min}
                            onStart={() => navigation.navigate('Map')}
                        />

                        {/* Priority Breakdown */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('priority_breakdown')}</Text>
                            <View style={styles.priorityRow}>
                                <View style={[styles.priorityChip, { backgroundColor: '#FEE2E2' }]}>
                                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                                    <Text style={[styles.priorityCount, { color: '#DC2626' }]}>{urgentCount}</Text>
                                    <Text style={styles.priorityLabel}>{t('urgent')}</Text>
                                </View>
                                <View style={[styles.priorityChip, { backgroundColor: '#FFEDD5' }]}>
                                    <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
                                    <Text style={[styles.priorityCount, { color: '#EA580C' }]}>{highCount}</Text>
                                    <Text style={styles.priorityLabel}>{t('high')}</Text>
                                </View>
                                <View style={[styles.priorityChip, { backgroundColor: '#DCFCE7' }]}>
                                    <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                                    <Text style={[styles.priorityCount, { color: '#16A34A' }]}>{normalCount}</Text>
                                    <Text style={styles.priorityLabel}>{t('normal')}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Progress */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>{t('progress')}</Text>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressText}>{todayRoute.collected_stops} / {todayRoute.total_stops} {t('bins_collected_today')}</Text>
                                <StatusBadge status={todayRoute.collected_stops === todayRoute.total_stops ? 'completed' : 'in_progress'} />
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, {
                                    width: `${todayRoute.total_stops > 0 ? (todayRoute.collected_stops / todayRoute.total_stops) * 100 : 0}%`
                                }]} />
                            </View>
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },
    greetingSection: { marginBottom: 16 },
    greetingText: { fontSize: 16, color: '#6b7280' },
    userName: { fontSize: 28, fontWeight: '800', color: '#14532d' },
    emptyCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 20 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, textAlign: 'center', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
    section: { marginTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
    priorityRow: { flexDirection: 'row', gap: 10 },
    priorityChip: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
    priorityCount: { fontSize: 24, fontWeight: '800' },
    priorityLabel: { fontSize: 11, color: '#666', fontWeight: '500', marginTop: 2 },
    card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardLabel: { fontSize: 14, color: '#666', fontWeight: '600', marginBottom: 10 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    progressText: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
    progressBar: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.light, borderRadius: 5 },
});
