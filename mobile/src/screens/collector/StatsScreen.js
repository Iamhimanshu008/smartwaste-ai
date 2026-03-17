import { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getStats } from '../../api/collectorApi';
import { COLORS } from '../../config';

const StatCard = ({ emoji, label, value, accent, flex = 1 }) => (
    <View style={[styles.card, { flex }]}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <Text style={[styles.cardValue, { color: accent }]}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
    </View>
);

export default function StatsScreen() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    const loadStats = async () => {
        try {
            setError(false);
            const data = await getStats();
            setStats(data);
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadStats(); }, []));
    const onRefresh = () => { setRefreshing(true); loadStats(); };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.light} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>Failed to load stats</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadStats}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.light} />}
            >
                {/* Header */}
                <Text style={styles.header}>My Performance 📊</Text>
                <Text style={styles.subtitle}>Track your collection impact</Text>

                {/* THIS MONTH */}
                <Text style={styles.sectionTitle}>THIS MONTH</Text>
                <View style={styles.row}>
                    <StatCard
                        emoji="🗑️"
                        label="Collections"
                        value={stats?.collections_this_month ?? 0}
                        accent={COLORS.light}
                    />
                    <View style={styles.gap} />
                    <StatCard
                        emoji="⚖️"
                        label="Kg Collected"
                        value={`${stats?.kg_this_month ?? 0} kg`}
                        accent={COLORS.light}
                    />
                </View>

                {/* ALL TIME */}
                <Text style={styles.sectionTitle}>ALL TIME</Text>
                <View style={styles.row}>
                    <StatCard
                        emoji="🏆"
                        label="Total Collections"
                        value={stats?.total_collections_all_time ?? 0}
                        accent={COLORS.mid}
                    />
                    <View style={styles.gap} />
                    <StatCard
                        emoji="♻️"
                        label="Total Kg"
                        value={`${stats?.total_kg_all_time ?? 0} kg`}
                        accent={COLORS.mid}
                    />
                </View>
                <View style={styles.row}>
                    <StatCard
                        emoji="📊"
                        label="Avg Kg / Collection"
                        value={`${stats?.avg_kg_per_collection ?? 0} kg`}
                        accent={COLORS.mid}
                        flex={1}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Every bin collected makes Raipur cleaner 🌱
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },

    header: { fontSize: 26, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#888', marginBottom: 24 },

    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#999',
        letterSpacing: 1.5, marginBottom: 12, marginTop: 8,
    },

    row: { flexDirection: 'row', marginBottom: 12 },
    gap: { width: 12 },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardEmoji: { fontSize: 28, marginBottom: 8 },
    cardValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
    cardLabel: { fontSize: 12, color: '#777', fontWeight: '500', textAlign: 'center' },

    footer: {
        marginTop: 24,
        backgroundColor: COLORS.dark,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    footerText: { color: COLORS.accent, fontSize: 15, fontWeight: '600', textAlign: 'center' },

    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorText: { fontSize: 16, color: '#666', marginBottom: 20 },
    retryBtn: {
        backgroundColor: COLORS.mid, borderRadius: 14,
        paddingHorizontal: 28, paddingVertical: 12,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
