import { useState, useEffect } from 'react';
import {
    View, Text, SectionList, StyleSheet,
    RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHistory } from '../../api/collectorApi';
import { COLORS } from '../../config';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(dt) {
    if (!dt) return '';
    const d = typeof dt === 'string' ? new Date(dt) : dt;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(Array.isArray(data) ? data : []);
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to load history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadHistory(); }, []);

    const sections = history.map((group, idx) => ({
        title: formatDate(group.date),
        summary: `${group.bins_collected || 0} bins, ${group.total_kg || 0} kg total`,
        data: (group.collections || []).map((c, i) => ({ ...c, _key: `${group.date}-${i}-${c.bin_name}` })),
    }));

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionDate}>{section.title}</Text>
            <Text style={styles.sectionSummary}>{section.summary}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.collectionRow}>
            <View style={styles.collectionInfo}>
                <Text style={styles.binName}>{item.bin_name}</Text>
                <Text style={styles.zoneText}>{item.zone_name || '—'}</Text>
            </View>
            <View style={styles.collectionMeta}>
                <Text style={styles.kgText}>{item.kg_collected ?? 0} kg</Text>
                <Text style={styles.timeText}>{formatTime(item.collected_at)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.light} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>Collection History</Text>
            </View>
            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item._key}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadHistory(); }}
                        tintColor={COLORS.light}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyTitle}>No collections yet</Text>
                        <Text style={styles.emptyText}>Completed collections will appear here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { padding: 20, paddingBottom: 12, backgroundColor: COLORS.dark },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.white },
    list: { padding: 16, paddingBottom: 40 },
    sectionHeader: { backgroundColor: COLORS.bg, paddingVertical: 12, paddingHorizontal: 4, marginTop: 8 },
    sectionDate: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
    sectionSummary: { fontSize: 13, color: '#666', marginTop: 2 },
    collectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    collectionInfo: { flex: 1 },
    binName: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
    zoneText: { fontSize: 12, color: '#888', marginTop: 2 },
    collectionMeta: { alignItems: 'flex-end' },
    kgText: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
    timeText: { fontSize: 12, color: '#888', marginTop: 2 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#777', textAlign: 'center' },
});
