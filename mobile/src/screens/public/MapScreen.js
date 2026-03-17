import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getBins } from '../../api/publicApi';
import BinPin from '../../components/BinPin';
import { COLORS, RAIPUR_COORDS } from '../../config';

export default function PublicMapScreen({ navigation }) {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBins()
            .then(data => setBins(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={RAIPUR_COORDS}>
                {(bins || []).map((bin) => (
                    <Marker
                        key={bin.id}
                        coordinate={{ latitude: bin.latitude, longitude: bin.longitude }}
                    >
                        <BinPin status={bin.status} />
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{bin.label}</Text>
                                <Text style={styles.calloutSub}>{bin.status?.toUpperCase()} • {bin.fill_level}%</Text>
                                {bin.address ? <Text style={styles.calloutAddress} numberOfLines={2}>{bin.address}</Text> : null}
                                <TouchableOpacity
                                    style={styles.reportBtn}
                                    onPress={() => navigation.navigate('Report', { preselectedBin: bin })}
                                >
                                    <Text style={styles.reportBtnText}>Report This Bin</Text>
                                </TouchableOpacity>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.header} pointerEvents="none">
                <View style={styles.headerCard}>
                    <Text style={styles.headerEmoji}>♻️</Text>
                    <View>
                        <Text style={styles.headerTitle}>SmartWaste AI</Text>
                        <Text style={styles.headerSub}>{bins.length} bins tracked in Raipur</Text>
                    </View>
                </View>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.light} />
                </View>
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={[styles.loginLink, { backgroundColor: '#F3E8FF', marginBottom: 8, width: '100%', alignItems: 'center' }]}
                    onPress={() => navigation.navigate('Recyclers')}
                >
                    <Text style={[styles.loginLinkText, { color: '#7E22CE' }]}>🏭 Sell Waste to Recyclers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Report', {})}
                    activeOpacity={0.85}
                >
                    <Text style={styles.fabText}>📸  Report Full Bin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginLinkText}>Collector? Sign In →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    header: { position: 'absolute', top: 52, left: 16, right: 16 },
    headerCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
    headerEmoji: { fontSize: 26 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
    headerSub: { fontSize: 12, color: '#666', marginTop: 1 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    fabContainer: { position: 'absolute', bottom: 40, left: 24, right: 24, alignItems: 'center', gap: 10 },
    fab: { backgroundColor: COLORS.gold, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, shadowColor: COLORS.gold, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
    fabText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
    loginLink: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
    loginLinkText: { color: COLORS.mid, fontSize: 13, fontWeight: '700' },
    callout: { padding: 12, minWidth: 180 },
    calloutTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
    calloutSub: { fontSize: 12, color: '#666', marginTop: 3 },
    calloutAddress: { fontSize: 11, color: '#888', marginTop: 4 },
    reportBtn: { marginTop: 8, backgroundColor: COLORS.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
    reportBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
});