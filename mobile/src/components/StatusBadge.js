import { View, Text, StyleSheet } from 'react-native';

const STATUS_MAP = {
    overflow: { label: 'OVERFLOW', bg: '#FEE2E2', text: '#DC2626' },
    full: { label: 'FULL', bg: '#FEE2E2', text: '#DC2626' },
    high: { label: 'HIGH', bg: '#FFEDD5', text: '#EA580C' },
    medium: { label: 'MEDIUM', bg: '#FEF9C3', text: '#CA8A04' },
    low: { label: 'LOW', bg: '#DCFCE7', text: '#16A34A' },
    empty: { label: 'EMPTY', bg: '#DCFCE7', text: '#16A34A' },
    collected: { label: 'COLLECTED', bg: '#E5E7EB', text: '#6B7280' },
    completed: { label: 'COMPLETE', bg: '#DCFCE7', text: '#16A34A' },
    in_progress: { label: 'IN PROGRESS', bg: '#DBEAFE', text: '#1D4ED8' },
    planned: { label: 'PLANNED', bg: '#EDE9FE', text: '#7C3AED' },
    pending_verification: { label: 'AI REVIEW', bg: '#DBEAFE', text: '#1D4ED8' },
    verified: { label: 'VERIFIED', bg: '#DCFCE7', text: '#16A34A' },
    rejected: { label: 'REJECTED', bg: '#FEE2E2', text: '#DC2626' },
};

const DEFAULT = { label: 'UNKNOWN', bg: '#F3F4F6', text: '#6B7280' };

export default function StatusBadge({ status }) {
    const config = STATUS_MAP[status] || DEFAULT;
    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    text: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});
