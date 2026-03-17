import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getSchedule } from '../../api/shgApi';
import { COLORS } from '../../config';

export default function ScheduleScreen() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSchedule = async () => {
        try {
            const data = await getSchedule();
            setSchedule(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadSchedule(); }, []));

    const onRefresh = () => { setRefreshing(true); loadSchedule(); };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerArea}>
                <Text style={styles.title}>Upcoming schedule</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.mid} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.mid} style={{ marginTop: 40 }} />
                ) : schedule.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No collections scheduled for the next 3 days.</Text>
                    </View>
                ) : (
                    schedule.map((route) => {
                        const dateObj = new Date(route.date);
                        const isToday = dateObj.toDateString() === new Date().toDateString();
                        const dateStr = isToday ? 'Today' : dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

                        return (
                            <View key={route.route_id} style={[styles.card, isToday && styles.cardToday]}>
                                <View style={styles.dateBox}>
                                    <Text style={[styles.dateText, isToday && { color: COLORS.mid }]}>{dateStr}</Text>
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.routeName}>{route.name}</Text>
                                    <Text style={styles.distance}>Approx. {route.total_distance_km} km</Text>
                                    <View style={[styles.statusBadge, 
                                        route.status === 'planned' ? styles.bgBlue : 
                                        route.status === 'in_progress' ? styles.bgOrange : styles.bgGreen]}
                                    >
                                        <Text style={[styles.statusText, 
                                            route.status === 'planned' ? styles.textBlue : 
                                            route.status === 'in_progress' ? styles.textOrange : styles.textGreen]}
                                        >
                                            {route.status.replace('_', ' ').toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF0' },
    headerArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
    content: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    cardToday: { borderColor: COLORS.mid, borderWidth: 2 },
    dateBox: { width: 70, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#E5E7EB', paddingRight: 16, marginRight: 16 },
    dateText: { fontSize: 14, fontWeight: '800', color: COLORS.dark, textAlign: 'center' },
    details: { flex: 1, justifyContent: 'center' },
    routeName: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
    distance: { fontSize: 13, color: '#666', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: '800' },
    bgBlue: { backgroundColor: '#DBEAFE' }, textBlue: { color: '#1D4ED8' },
    bgOrange: { backgroundColor: '#FFEDD5' }, textOrange: { color: '#C2410C' },
    bgGreen: { backgroundColor: '#DCFCE7' }, textGreen: { color: '#15803D' },
    emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 32, alignItems: 'center' },
    emptyText: { fontSize: 15, color: '#777', textAlign: 'center' },
});
