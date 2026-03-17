import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../config';

export default function RouteCard({ stops, collectedStops = 0, distance, duration, onStart }) {
    const progress = stops > 0 ? (collectedStops / stops) * 100 : 0;

    return (
        <View style={styles.card}>
            {/* Title Row */}
            <View style={styles.titleRow}>
                <Text style={styles.title}>Today's Route</Text>
                <Text style={styles.badge}>🚛 Active</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stops}</Text>
                    <Text style={styles.statLabel}>Stops</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{distance ?? '—'}</Text>
                    <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{duration ?? '—'}</Text>
                    <Text style={styles.statLabel}>min</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressCount}>{collectedStops}/{stops}</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>🗺️  View Route on Map</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.dark, borderRadius: 24, padding: 22, shadowColor: COLORS.dark, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    title: { fontSize: 18, fontWeight: '800', color: COLORS.white },
    badge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, color: COLORS.accent, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingVertical: 14 },
    stat: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 24, fontWeight: '800', color: COLORS.white },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
    progressSection: { marginBottom: 18 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    progressCount: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
    progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.light, borderRadius: 4 },
    startBtn: { backgroundColor: COLORS.light, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    startBtnText: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
});
