import { View, StyleSheet } from 'react-native';

const STATUS_COLORS = {
    overflow: '#EF4444',
    full: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
    empty: '#22C55E',
    collected: '#9CA3AF',
};

const STATUS_SIZES = {
    overflow: 22, full: 20, high: 18, medium: 16, low: 14, empty: 14, collected: 12,
};

export default function BinPin({ status }) {
    const color = STATUS_COLORS[status] || '#6B7280';
    const size = STATUS_SIZES[status] || 14;

    return (
        <View style={[styles.outer, { borderColor: color, width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
            <View style={[styles.inner, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    outer: { justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, backgroundColor: 'rgba(255,255,255,0.85)' },
    inner: {},
});
