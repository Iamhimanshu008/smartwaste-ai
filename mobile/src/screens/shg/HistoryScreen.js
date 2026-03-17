import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../../api/shgApi';
import { COLORS } from '../../config';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadHistory(); }, []));

    const onRefresh = () => { setRefreshing(true); loadHistory(); };

    // Group history by date
    const grouped = history.reduce((acc, curr) => {
        const dateStr = new Date(curr.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(curr);
        return acc;
    }, {});

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerArea}>
                <Text style={styles.title}>Collection History</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.mid} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.mid} style={{ marginTop: 40 }} />
                ) : history.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No collection reports available.</Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <View key={date} style={styles.dayGroup}>
                            <Text style={styles.dateHeader}>{date}</Text>
                            {items.map((item) => (
                                <View key={item.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.collectionPoint}>{item.collection_point}</Text>
                                        <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.weight}>{item.plastic_collected_kg} kg</Text>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeText}>{item.plastic_type?.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    {item.notes ? <Text style={styles.notes}>"{item.notes}"</Text> : null}
                                </View>
                            ))}
                        </View>
                    ))
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
    dayGroup: { marginBottom: 20 },
    dateHeader: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    collectionPoint: { fontSize: 16, fontWeight: '700', color: COLORS.dark, flex: 1 },
    time: { fontSize: 12, color: '#666', fontWeight: '500' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    weight: { fontSize: 18, fontWeight: '800', color: COLORS.mid },
    typeBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
    notes: { marginTop: 12, fontSize: 13, color: '#666', fontStyle: 'italic', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8 },
    emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 32, alignItems: 'center' },
    emptyText: { fontSize: 15, color: '#777', textAlign: 'center' },
});
