import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Linking, ActivityIndicator, Alert, Modal, TextInput, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import useStore from '../../store';
import { getTodayRoute, collectBin } from '../../api/collectorApi';
import { COLORS, RAIPUR_COORDS } from '../../config';

function getMarkerColor(stop) {
    if (stop.status === 'collected') return '#9CA3AF';
    const u = String(stop.urgency || '').toLowerCase();
    if (['critical', 'urgent'].includes(u) || (!u && stop.fill_level >= 90)) return '#EF4444';
    if (u === 'high' || (!u && stop.fill_level >= 70)) return '#F97316';
    return '#3B82F6';
}

export default function MapScreen({ navigation }) {
    const { todayRoute, setTodayRoute, markStopCollected } = useStore();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(!todayRoute);
    const [collecting, setCollecting] = useState(false);
    const [selectedStop, setSelectedStop] = useState(null);
    const [collectModal, setCollectModal] = useState(null);
    const [kgCollected, setKgCollected] = useState('');
    const [notes, setNotes] = useState('');
    const mapRef = useRef(null);

    const loadRoute = useCallback(async () => {
        try {
            const route = await getTodayRoute();
            setTodayRoute(route);
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to load route');
        } finally {
            setLoading(false);
        }
    }, [setTodayRoute]);

    useFocusEffect(useCallback(() => {
        if (!todayRoute) {
            loadRoute();
        } else {
            setLoading(false);
        }
    }, [todayRoute]));

    useEffect(() => {
        let sub;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            sub = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 10 },
                (loc) => setLocation(loc.coords)
            );
        })();
        return () => sub?.remove();
    }, []);

    const stops = todayRoute?.stops || [];
    const selected = selectedStop || stops.find(s => s.status !== 'collected');

    const handleCollectPress = (stop) => {
        if (stop.status === 'collected') return;
        setCollectModal(stop);
        setKgCollected('');
        setNotes('');
    };

    const handleCollectSubmit = async () => {
        const safeMessage = (detail) => {
            if (!detail) return 'An unexpected error occurred.';
            if (Array.isArray(detail)) return detail.map(e => e.msg || JSON.stringify(e)).join(', ');
            if (typeof detail === 'object') return JSON.stringify(detail);
            return String(detail);
        };

        if (!collectModal) return;
        const kg = parseFloat(kgCollected) || 0;
        setCollecting(true);
        try {
            // Get fresh GPS location
            const loc = await Location.getCurrentPositionAsync({ 
                accuracy: Location.Accuracy.High 
            });
            const { latitude, longitude } = loc.coords;

            const res = await collectBin(
                collectModal.bin_id, 
                kg, 
                notes.trim() || null, 
                parseFloat(latitude) || null, 
                parseFloat(longitude) || null
            );
            markStopCollected(collectModal.bin_id);
            const route = await getTodayRoute();
            setTodayRoute(route);
            setCollectModal(null);
            Alert.alert('Success', `Bin collected! Total today: ${res.total_collected_today} kg`);
        } catch (e) {
            Alert.alert('Error', safeMessage(e.response?.data?.detail || e.message));
        }
        setCollecting(false);
    };

    const handleNavigate = () => {
        if (!selected) return;
        const url = `https://maps.google.com/?q=${selected.latitude},${selected.longitude}`;
        Linking.openURL(url);
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.light} /></View>;
    }

    if (!todayRoute || stops.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.noRoute}>No route for today</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const routeCoords = stops
        .sort((a, b) => (a.stop_order ?? a.sequence_order) - (b.stop_order ?? b.sequence_order))
        .map(s => ({
            latitude: s.bin_lat ?? s.latitude,
            longitude: s.bin_lng ?? s.longitude,
            ...s
        }));

    const initialRegion = routeCoords.length > 0 ? {
        latitude: routeCoords[0].latitude,
        longitude: routeCoords[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        ...RAIPUR_COORDS,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
                    <Text style={styles.backArrowText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Route {todayRoute.collected_stops}/{todayRoute.total_stops}
                </Text>
            </View>

            {/* Map */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
                mapType={Platform.OS === 'android' ? 'none' : 'standard'}
            >
                {/* OpenStreetMap Tiles (free, no API key) */}
                <UrlTile
                    urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />

                {/* Route Polyline */}
                {routeCoords.length > 1 && (
                    <Polyline coordinates={routeCoords} strokeColor="#00AA44" strokeWidth={3} />
                )}

                {/* Stop Markers */}
                {routeCoords.map((stop, idx) => {
                    const isCollected = stop.status === 'collected';
                    const color = getMarkerColor(stop);
                    return (
                        <Marker
                            key={stop.bin_id || idx}
                            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                            onPress={() => setSelectedStop(stop)}
                            pinColor={idx === 0 ? 'green' : idx === routeCoords.length - 1 ? 'red' : 'orange'}
                        >
                            <View style={[styles.markerContainer, { backgroundColor: color, opacity: isCollected ? 0.6 : 1 }]}>
                                <Text style={styles.markerText}>{isCollected ? '✓' : stop.stop_order ?? stop.sequence_order ?? idx + 1}</Text>
                            </View>
                        </Marker>
                    );
                })}

                {/* Live Location */}
                {location && (
                    <>
                        <Circle center={{ latitude: location.latitude, longitude: location.longitude }} radius={20} fillColor="rgba(59,130,246,0.3)" strokeColor="#3B82F6" strokeWidth={2} />
                        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
                            <View style={styles.locationDot} />
                        </Marker>
                    </>
                )}
            </MapView>

            {/* Bottom Sheet */}
            {stops.length > 0 && stops.every(s => s.status === 'collected') ? (
                <View style={styles.bottomSheet}>
                    <Text style={styles.doneEmoji}>🎉</Text>
                    <Text style={styles.doneText}>All bins collected! Route complete.</Text>
                </View>
            ) : selected ? (
                <View style={styles.bottomSheet}>
                    <View style={styles.bottomHandle} />
                    <Text style={styles.nextLabel}>{selected.status === 'collected' ? 'COLLECTED' : 'BIN DETAILS'}</Text>
                    <Text style={styles.binName}>{selected.bin_label}</Text>
                    {selected.address ? <Text style={styles.addressText} numberOfLines={2}>{selected.address}</Text> : null}
                    <View style={styles.fillRow}>
                        <Text style={styles.fillText}>Fill: </Text>
                        <Text style={[styles.fillValue, { color: selected.fill_level >= 80 ? '#EF4444' : COLORS.dark }]}>
                            {selected.fill_level}%
                        </Text>
                        <Text style={[styles.urgencyBadge, { marginLeft: 8 }]}>{selected.urgency || 'normal'}</Text>
                    </View>
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.navBtn} onPress={handleNavigate}>
                            <Text style={styles.navBtnText}>🗺️  Navigate</Text>
                        </TouchableOpacity>
                        {selected.status !== 'collected' ? (
                            <TouchableOpacity
                                style={[styles.collectBtn, collecting && { opacity: 0.6 }]}
                                onPress={() => handleCollectPress(selected)}
                                disabled={collecting}
                            >
                                <Text style={styles.collectBtnText}>✓  Mark Collected</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            ) : null}

            {/* Mark Collected Modal */}
            <Modal visible={!!collectModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mark Collected</Text>
                        <Text style={styles.modalSub}>Enter kg collected for {collectModal?.bin_label}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="kg collected (e.g. 5)"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                            value={kgCollected}
                            onChangeText={setKgCollected}
                        />
                        <TextInput
                            style={[styles.modalInput, styles.notesInput]}
                            placeholder="Notes (optional)"
                            placeholderTextColor="#999"
                            value={notes}
                            onChangeText={setNotes}
                        />
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCollectModal(null)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, collecting && { opacity: 0.6 }]}
                                onPress={handleCollectSubmit}
                                disabled={collecting}
                            >
                                {collecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSubmitText}>Submit</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.dark },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, backgroundColor: COLORS.dark },
    backArrow: { padding: 8 },
    backArrowText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
    headerTitle: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
    map: { flex: 1, width: '100%', height: '100%' },
    markerContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    markerText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    locationDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#3B82F6', borderWidth: 2.5, borderColor: '#fff' },
    bottomSheet: { backgroundColor: COLORS.white, padding: 20, paddingBottom: 34, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { height: -4 }, elevation: 10 },
    bottomHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    nextLabel: { fontSize: 10, color: '#999', fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    binName: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 6 },
    addressText: { fontSize: 12, color: '#666', marginBottom: 8 },
    fillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    fillText: { fontSize: 14, color: '#666' },
    fillValue: { fontSize: 14, fontWeight: '700' },
    urgencyBadge: { fontSize: 11, color: '#666', textTransform: 'capitalize' },
    btnRow: { flexDirection: 'row', gap: 10 },
    navBtn: { flex: 1, height: 48, borderWidth: 2, borderColor: COLORS.mid, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    navBtnText: { color: COLORS.mid, fontSize: 14, fontWeight: '700' },
    collectBtn: { flex: 1.5, height: 48, backgroundColor: '#22C55E', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    collectBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    doneEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
    doneText: { fontSize: 16, fontWeight: '600', color: COLORS.dark, textAlign: 'center' },
    noRoute: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
    backBtn: { backgroundColor: COLORS.mid, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    backBtnText: { color: '#fff', fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
    modalSub: { fontSize: 13, color: '#666', marginBottom: 16 },
    modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
    notesInput: { height: 60, textAlignVertical: 'top' },
    modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalCancelBtn: { flex: 1, height: 48, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '700', color: '#666' },
    modalSubmitBtn: { flex: 1, height: 48, backgroundColor: COLORS.mid, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    modalSubmitText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
