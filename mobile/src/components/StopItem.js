import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../config';

export default function StopItem({ number, binName, address, fillPercent, status, onCollect }) {
    const isCollected = status === 'collected';

    const badgeColor = fillPercent >= 90 ? '#EF4444' :
        fillPercent >= 70 ? '#F97316' :
            fillPercent >= 50 ? '#EAB308' : '#22C55E';

    return (
        <View style={[styles.container, isCollected && styles.containerCollected]}>
            {/* Number Badge */}
            <View style={[styles.badge, { backgroundColor: isCollected ? '#E5E7EB' : badgeColor }]}>
                <Text style={[styles.badgeText, { color: isCollected ? '#9CA3AF' : '#fff' }]}>
                    {isCollected ? '✓' : number}
                </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={[styles.binName, isCollected && styles.textCollected]}>
                    {binName}
                </Text>
                {address ? (
                    <Text style={styles.address} numberOfLines={1}>{address}</Text>
                ) : null}
                <View style={styles.fillRow}>
                    <View style={styles.fillBar}>
                        <View style={[styles.fillFill, { width: `${fillPercent}%`, backgroundColor: badgeColor }]} />
                    </View>
                    <Text style={styles.fillText}>{fillPercent}%</Text>
                </View>
            </View>

            {/* Collect Button */}
            {!isCollected && onCollect && (
                <TouchableOpacity style={styles.collectBtn} onPress={onCollect}>
                    <Text style={styles.collectBtnText}>✓</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 8, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    containerCollected: { opacity: 0.55, backgroundColor: '#F9FAFB' },
    badge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    badgeText: { fontSize: 14, fontWeight: '800' },
    info: { flex: 1 },
    binName: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
    textCollected: { textDecorationLine: 'line-through', color: '#9CA3AF' },
    address: { fontSize: 11, color: '#777', marginTop: 2 },
    fillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    fillBar: { flex: 1, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
    fillFill: { height: '100%', borderRadius: 3 },
    fillText: { fontSize: 11, fontWeight: '600', color: '#555', width: 28, textAlign: 'right' },
    collectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    collectBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
