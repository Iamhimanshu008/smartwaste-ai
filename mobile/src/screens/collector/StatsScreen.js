import { useState, useCallback } from 'react';
import AutoText from '../../components/AutoText';
import {
    View, Text, ScrollView, StyleSheet,
    ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getStats } from '../../api/collectorApi';
import { COLORS } from '../../config';
import { useTranslation } from '../../i18n';

const StatCard = ({ icon, label, value, accent, flex = 1 }) => (
    <View style={[styles.card, { flex }]}>
        <View style={{ marginBottom: 8 }}>{icon}</View>
        <Text style={[styles.cardValue, { color: accent }]}>{value}</Text>
        <AutoText style={styles.cardLabel}>{label}</AutoText>
    </View>
);

const ImpactCard = ({ icon, label, value, flex = 1 }) => (
    <View style={[styles.impactCard, { flex }]}>
        <View style={{ marginBottom: 8 }}>{icon}</View>
        <Text style={styles.impactCardValue}>{value}</Text>
        <AutoText style={styles.impactCardLabel}>{label}</AutoText>
    </View>
);

export default function StatsScreen() {
    const { t } = useTranslation();
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
                <Ionicons name="warning-outline" size={48} color="#dc2626" style={{ marginBottom: 12 }} />
                <AutoText style={styles.errorText}>Failed to load stats</AutoText>
                <TouchableOpacity style={styles.retryBtn} onPress={loadStats}>
                    <AutoText style={styles.retryText}>Try Again</AutoText>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.header}>{t('stats')} </Text>
                    <Ionicons name="stats-chart" size={26} color="#16a34a" />
                </View>
                <AutoText style={styles.subtitle}>Track your collection impact</AutoText>

                {/* THIS MONTH */}
                <AutoText style={styles.sectionTitle}>THIS MONTH</AutoText>
                <View style={styles.row}>
                    <StatCard
                        icon={<Ionicons name="trash-bin-outline" size={28} color={COLORS.light} />}
                        label={t('bins_collected')}
                        value={stats?.collections_this_month ?? 0}
                        accent={COLORS.light}
                    />
                    <View style={styles.gap} />
                    <StatCard
                        icon={<MaterialCommunityIcons name="scale-balance" size={28} color={COLORS.light} />}
                        label={t('total_weight')}
                        value={`${stats?.kg_this_month ?? 0} kg`}
                        accent={COLORS.light}
                    />
                </View>

                {/* ALL TIME */}
                <AutoText style={styles.sectionTitle}>ALL TIME</AutoText>
                <View style={styles.row}>
                    <StatCard
                        icon={<Ionicons name="trash-bin-outline" size={28} color={COLORS.mid} />}
                        label={t('bins_collected')}
                        value={stats?.total_collections_all_time ?? 0}
                        accent={COLORS.mid}
                    />
                    <View style={styles.gap} />
                    <StatCard
                        icon={<MaterialCommunityIcons name="scale-balance" size={28} color={COLORS.mid} />}
                        label={t('total_weight')}
                        value={`${stats?.total_kg_all_time ?? 0} kg`}
                        accent={COLORS.mid}
                    />
                </View>
                <View style={styles.row}>
                    <StatCard
                        icon={<MaterialCommunityIcons name="chart-bell-curve" size={28} color={COLORS.mid} />}
                        label="Avg Kg / Collection"
                        value={`${stats?.avg_kg_per_collection ?? 0} kg`}
                        accent={COLORS.mid}
                        flex={1}
                    />
                </View>

                {/* ENVIRONMENTAL IMPACT */}
                <AutoText style={styles.sectionTitle}>ENVIRONMENTAL IMPACT</AutoText>
                <View style={styles.row}>
                    <ImpactCard
                        icon={<MaterialCommunityIcons name="tree-outline" size={28} color="white" />}
                        label="Trees Saved"
                        value={((stats?.total_kg_all_time ?? 0) * 0.017).toFixed(1)}
                    />
                    <View style={styles.gap} />
                    <ImpactCard
                        icon={<Ionicons name="earth" size={28} color="white" />}
                        label="kg CO2 Reduced"
                        value={((stats?.total_kg_all_time ?? 0) * 2.5).toFixed(1)}
                    />
                </View>
                <View style={styles.row}>
                    <ImpactCard
                        icon={<Ionicons name="water-outline" size={28} color="white" />}
                        label="L Water Saved"
                        value={((stats?.total_kg_all_time ?? 0) * 6).toFixed(0)}
                    />
                    <View style={styles.gap} />
                    <ImpactCard
                        icon={<MaterialCommunityIcons name="recycle" size={28} color="white" />}
                        label="kg Plastic Diverted"
                        value={((stats?.total_kg_all_time ?? 0) * 0.3).toFixed(1)}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AutoText style={styles.footerText}>Your contribution makes Raipur cleaner! </AutoText>
                        <MaterialCommunityIcons name="hands-pray" size={16} color="#16a34a" />
                    </View>
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

    impactCard: {
        backgroundColor: '#16a34a',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#16a34a',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    impactCardValue: { fontSize: 24, fontWeight: '800', marginBottom: 4, color: '#ffffff' },
    impactCardLabel: { fontSize: 12, color: '#e8f5e9', fontWeight: '600', textAlign: 'center' },

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
