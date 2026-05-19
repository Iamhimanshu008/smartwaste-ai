import { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getReportStatus } from '../../api/publicApi';
import { COLORS } from '../../config';

const STEPS = [
    { key: 'submitted', label: 'Submitted', subtitle: 'Report received by SmartWaste AI' },
    { key: 'ai_verified', label: 'AI Verified', subtitle: 'Image analyzed by Gemini Vision' },
    { key: 'supervisor_approved', label: 'Supervisor Approved', subtitle: 'Review by zone supervisor' },
    { key: 'added_to_route', label: 'Added to Route', subtitle: 'Scheduled for collection' },
];

function getStepState(reportStatus, stepKey) {
    const map = {
        submitted: { submitted: 'done', ai_verified: 'pending', supervisor_approved: 'pending', added_to_route: 'pending' },
        pending_verification: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'pending', added_to_route: 'pending' },
        verified: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'done', added_to_route: 'done' },
        rejected: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'failed', added_to_route: 'pending' },
    };
    return map[reportStatus]?.[stepKey] || 'pending';
}

export default function StatusScreen({ route, navigation }) {
    const { reportId } = route.params || {};
    const [status, setStatus] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const poll = async () => {
            try {
                const data = await getReportStatus(reportId);
                setStatus(data);
                if (['verified', 'rejected'].includes(data.status)) {
                    clearInterval(intervalRef.current);
                }
            } catch (e) { console.error(e); }
        };

        poll();
        intervalRef.current = setInterval(poll, 10000);
        return () => clearInterval(intervalRef.current);
    }, [reportId]);

    const isComplete = status?.status === 'verified';
    const isRejected = status?.status === 'rejected';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Report Status</Text>
                <Text style={styles.subtitle}>Report #{reportId}</Text>

                {!status ? (
                    <ActivityIndicator size="large" color={COLORS.light} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Step Tracker */}
                        <View style={styles.trackerCard}>
                            {STEPS.map((step, idx) => {
                                const state = getStepState(status.status, step.key);
                                return (
                                    <View key={step.key}>
                                        <View style={styles.stepRow}>
                                            {/* Circle */}
                                            <View style={[styles.circle, {
                                                backgroundColor: state === 'done' ? '#22C55E' : state === 'failed' ? '#EF4444' : '#E5E7EB',
                                            }]}>
                                                <Text style={styles.circleText}>
                                                    {state === 'done' ? '✓' : state === 'failed' ? '✕' : idx + 1}
                                                </Text>
                                            </View>

                                            {/* Label */}
                                            <View style={styles.stepInfo}>
                                                <Text style={[styles.stepLabel, {
                                                    color: state === 'done' ? '#15803D' : state === 'failed' ? '#DC2626' : '#9CA3AF',
                                                    fontWeight: state === 'done' ? '700' : '500',
                                                }]}>
                                                    {step.label}
                                                </Text>
                                                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                                            </View>
                                        </View>

                                        {/* Connector */}
                                        {idx < STEPS.length - 1 && (
                                            <View style={[styles.connector, {
                                                backgroundColor: getStepState(status.status, STEPS[idx + 1].key) === 'done' ? '#22C55E' : '#E5E7EB',
                                            }]} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* AI Confidence */}
                        {status.ai_confidence != null && (
                            <View style={styles.infoCard}>
                                <Text style={styles.infoLabel}>AI Confidence</Text>
                                <Text style={styles.infoValue}>{status.ai_confidence}%</Text>
                            </View>
                        )}

                        {/* Completion Message */}
                        {isComplete && (
                            <View style={styles.successCard}>
                                <MaterialCommunityIcons name="leaf" size={48} color="#15803D" style={{ marginBottom: 8 }} />
                                <Text style={styles.successTitle}>Thank you!</Text>
                                <Text style={styles.successText}>
                                    Your report helped keep the city clean!
                                </Text>
                            </View>
                        )}

                        {isRejected && (
                            <View style={styles.rejectedCard}>
                                <Ionicons name="alert-circle" size={40} color="#DC2626" style={{ marginBottom: 8 }} />
                                <Text style={styles.rejectedTitle}>Report Not Verified</Text>
                                <Text style={styles.rejectedText}>
                                    The report could not be verified. This may be due to photo quality or distance from the bin.
                                </Text>
                            </View>
                        )}

                        {/* Report Another Button */}
                        {(isComplete || isRejected) && (
                            <TouchableOpacity
                                style={styles.reportAnotherBtn}
                                onPress={() => navigation.navigate('PublicMap')}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="location" size={18} color={COLORS.white} />
                                    <Text style={styles.reportAnotherText}>Report Another Bin</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#888', marginBottom: 28 },
    trackerCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    circle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    circleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    stepInfo: { flex: 1 },
    stepLabel: { fontSize: 15, marginBottom: 2 },
    stepSubtitle: { fontSize: 12, color: '#9CA3AF' },
    connector: { width: 3, height: 28, marginLeft: 20, borderRadius: 2, marginVertical: 4 },
    infoCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
    infoValue: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
    successCard: { backgroundColor: '#DCFCE7', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },

    successTitle: { fontSize: 22, fontWeight: '800', color: '#15803D', marginBottom: 6 },
    successText: { fontSize: 14, color: '#166534', textAlign: 'center', lineHeight: 20 },
    rejectedCard: { backgroundColor: '#FEF2F2', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },

    rejectedTitle: { fontSize: 18, fontWeight: '800', color: '#991B1B', marginBottom: 6 },
    rejectedText: { fontSize: 13, color: '#7F1D1D', textAlign: 'center', lineHeight: 18 },
    reportAnotherBtn: { backgroundColor: COLORS.mid, borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: COLORS.mid, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
    reportAnotherText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
