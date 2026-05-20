import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { getBins } from '../../api/shgApi';
import { COLORS } from '../../config';

export default function BinsScreen({ navigation }) {
    const { user, logout } = useStore();
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBins = async () => {
        try {
            const data = await getBins();
            setBins(data);
        } catch (e) {
            Alert.alert('Error', 'Failed to load bins.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadBins(); }, []));

    const onRefresh = () => { setRefreshing(true); loadBins(); };

    const doLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.light} />}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={styles.header}>
                        <Text style={styles.greeting}>SHG Dashboard</Text>
                        <Text style={styles.name}>{user?.full_name?.split(' ')[0] || 'Member'}</Text>
                    </View>
                    <TouchableOpacity onPress={doLogout} style={styles.logoutBtn}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="log-out-outline" size={16} color={COLORS.mid} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>My Assigned Bins</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.light} style={{ marginTop: 40 }} />
                ) : bins.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No bins assigned to your zone yet.</Text>
                    </View>
                ) : (
                    bins.map((bin) => (
                        <View key={bin.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.binName}>{bin.label}</Text>
                                <View style={[styles.badge, 
                                    bin.status === 'full' || bin.status === 'overflow' ? styles.badgeRed : 
                                    bin.status === 'high' ? styles.badgeOrange :
                                    bin.status === 'medium' ? styles.badgeYellow : styles.badgeGreen]}
                                >
                                    <Text style={styles.badgeText}>{bin.status.toUpperCase()}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="location-outline" size={14} color="#666" />
                                <Text style={styles.address}>{bin.address}</Text>
                            </View>
                            <View style={styles.fillContainer}>
                                <View style={[styles.fillBar, { width: `${bin.fill_level}%`, backgroundColor: bin.fill_level > 80 ? '#EF4444' : COLORS.light }]} />
                            </View>
                            <Text style={styles.fillLevel}>{bin.fill_level}% Full</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    header: { flex: 1 },
    greeting: { fontSize: 16, color: '#666', fontWeight: '500' },
    name: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginTop: 2 },
    logoutBtn: { paddingVertical: 8, paddingHorizontal: 12 },
    logoutText: { fontSize: 14, color: COLORS.mid, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    binName: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
    address: { fontSize: 13, color: '#666', marginBottom: 16 },
    fillContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
    fillBar: { height: '100%', borderRadius: 4 },
    fillLevel: { fontSize: 12, color: '#555', fontWeight: '600', textAlign: 'right' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeRed: { backgroundColor: '#FEE2E2' },
    badgeOrange: { backgroundColor: '#FFEDD5' },
    badgeYellow: { backgroundColor: '#FEF9C3' },
    badgeGreen: { backgroundColor: '#DCFCE7' },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#1F2937' },
    emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 32, alignItems: 'center' },
    emptyText: { fontSize: 15, color: '#777', textAlign: 'center' },
});
