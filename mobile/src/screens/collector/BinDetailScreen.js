import { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectBin } from '../../api/collectorApi';
import useStore from '../../store';
import StatusBadge from '../../components/StatusBadge';
import * as Location from 'expo-location';
import { haversineDistance, isWithinRadius } from '../../utils/geofence';
import { COLORS } from '../../config';

export default function BinDetailScreen({ route, navigation }) {
    const { stop } = route.params || {};
    const { markStopCollected } = useStore();
    const [wasteKg, setWasteKg] = useState('');
    const [collecting, setCollecting] = useState(false);
    const [collected, setCollected] = useState(stop?.status === 'collected');

    const handleCollect = async () => {
        const safeMessage = (detail) => {
            if (!detail) return 'An unexpected error occurred.';
            if (Array.isArray(detail)) return detail.map(e => e.msg || JSON.stringify(e)).join(', ');
            if (typeof detail === 'object') return JSON.stringify(detail);
            return String(detail);
        };

        setCollecting(true);
        try {
            // Get fresh GPS location
            const loc = await Location.getCurrentPositionAsync({ 
                accuracy: Location.Accuracy.High 
            });
            const { latitude, longitude } = loc.coords;

            // Check distance
            const distance = haversineDistance(latitude, longitude, stop.latitude, stop.longitude);
            if (distance > 50) {
                Alert.alert(
                    "Too Far Away",
                    `You are ${Math.round(distance)}m away. You must be within 50 meters of this bin to mark it collected.`
                );
                setCollecting(false);
                return;
            }

            await collectBin(stop.bin_id, parseFloat(wasteKg) || 0, null, latitude, longitude);
            markStopCollected(stop.bin_id);
            setCollected(true);
            Alert.alert('✓ Collected!', `${stop.bin_label} marked as collected.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            Alert.alert('Error', safeMessage(e.response?.data?.detail || e.message));
        }
        setCollecting(false);
    };

    const infoRows = [
        { label: 'Bin Name', value: stop?.bin_label || 'Unknown' },
        { label: 'Stop Number', value: `#${stop?.stop_order || '—'}` },
        { label: 'GPS', value: stop ? `${stop.latitude?.toFixed(4)}, ${stop.longitude?.toFixed(4)}` : '—' },
        { label: 'Fill Level', value: `${stop?.fill_level ?? '—'}%` },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Banner */}
                <View style={[styles.banner, { backgroundColor: collected ? '#DCFCE7' : stop?.fill_level >= 80 ? '#FEE2E2' : '#FFF7ED' }]}>
                    <Text style={styles.bannerEmoji}>{collected ? '✅' : stop?.fill_level >= 80 ? '🚨' : '📦'}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.bannerTitle}>{stop?.bin_label}</Text>
                        <StatusBadge status={collected ? 'collected' : stop?.fill_level >= 90 ? 'overflow' : stop?.fill_level >= 70 ? 'high' : 'medium'} />
                    </View>
                </View>

                {/* Info Rows */}
                <View style={styles.card}>
                    {infoRows.map((row) => (
                        <View key={row.label} style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{row.label}</Text>
                            <Text style={styles.infoValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Fill Level Bar */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fill Level</Text>
                    <View style={styles.fillBar}>
                        <View style={[styles.fillFill, {
                            width: `${stop?.fill_level || 0}%`,
                            backgroundColor: stop?.fill_level >= 80 ? '#EF4444' : stop?.fill_level >= 50 ? '#F97316' : '#22C55E',
                        }]} />
                    </View>
                    <Text style={styles.fillLabel}>{stop?.fill_level || 0}% full</Text>
                </View>

                {/* Waste Weight Input */}
                {!collected && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Waste Collected (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={wasteKg}
                            onChangeText={setWasteKg}
                            placeholder="Enter weight in kg (e.g. 8.5)"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                )}
            </ScrollView>

            {/* Collect Button */}
            {!collected && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.collectBtn, collecting && { opacity: 0.6 }]}
                        onPress={handleCollect}
                        disabled={collecting}
                    >
                        {collecting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.collectBtnText}>✓  Mark as Collected</Text>
                        }
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },
    banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, marginBottom: 16 },
    bannerEmoji: { fontSize: 36 },
    bannerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
    card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    infoLabel: { fontSize: 14, color: '#777', fontWeight: '500' },
    infoValue: { fontSize: 14, color: COLORS.dark, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
    fillBar: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden', marginBottom: 8 },
    fillFill: { height: '100%', borderRadius: 7 },
    fillLabel: { fontSize: 13, color: '#666', textAlign: 'right' },
    input: { height: 48, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#1a1a1a', backgroundColor: '#FAFAFA' },
    footer: { padding: 20, paddingBottom: 34, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    collectBtn: { height: 56, backgroundColor: '#22C55E', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#22C55E', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
    collectBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
