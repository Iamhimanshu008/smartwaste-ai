import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import AutoText from '../../components/AutoText';
import * as Location from 'expo-location';
import { getBins, getLiveStatus } from '../../api/publicApi';
import BinPin from '../../components/BinPin';
import { COLORS, RAIPUR_COORDS } from '../../config';

// Error boundary to catch native MapView crashes
class MapErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, info) {
        console.log('MapView native crash caught:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

// Lazy-load react-native-maps to prevent crash if native module is broken
let MapView, Marker, Callout, PROVIDER_GOOGLE;
let mapsAvailable = false;
try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Callout = maps.Callout;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    mapsAvailable = true;
} catch (e) {
    console.log('react-native-maps failed to load:', e);
}

export default function PublicMapScreen({ navigation }) {
    const [bins, setBins] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);

    // Request location permissions on mount
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    setLocationGranted(true);
                } else {
                    // Non-blocking: map still works without user location
                    console.log('Location permission not granted — map will show default region');
                }
            } catch (e) {
                console.log('Location permission error:', e);
            }
        })();
    }, []);

    // Fetch bins and live collector status
    useEffect(() => {
        getBins()
            .then(data => setBins(Array.isArray(data) ? data : []))
            .catch((err) => { console.log('Failed to fetch bins:', err); })
            .finally(() => setLoading(false));

        const fetchStatus = () => {
            getLiveStatus().then(data => {
                setCollectors(Array.isArray(data) ? data : []);
            }).catch(() => {});
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    // Fallback UI if MapView native module is unavailable or fails to render
    if (!mapsAvailable || mapError) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>🗺️</Text>
                    <AutoText style={styles.errorTitle}>Map Unavailable</AutoText>
                    <AutoText style={styles.errorSub}>
                        Map could not load. Please check your internet connection and try again.
                    </AutoText>
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => setMapError(false)}
                    >
                        <Text style={styles.retryBtnText}>🔄  Retry</Text>
                    </TouchableOpacity>
                </View>

                {/* Still allow navigation to report & recyclers */}
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={[styles.loginLink, { backgroundColor: '#F3E8FF', marginBottom: 8, width: '100%', alignItems: 'center' }]}
                        onPress={() => navigation.navigate('Recyclers')}
                    >
                        <AutoText style={[styles.loginLinkText, { color: '#7E22CE' }]}>🏭 Sell Waste to Recyclers</AutoText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('Report', {})}
                        activeOpacity={0.85}
                    >
                        <AutoText style={styles.fabText}>📸  Report Full Bin</AutoText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <AutoText style={styles.loginLinkText}>Collector? Sign In →</AutoText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map loading placeholder */}
            {!mapReady && (
                <View style={styles.mapPlaceholder}>
                    <ActivityIndicator size="large" color={COLORS.light} />
                    <Text style={styles.mapPlaceholderText}>Loading map…</Text>
                </View>
            )}

            <MapErrorBoundary fallback={
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>🗺️</Text>
                    <AutoText style={styles.errorTitle}>Map Crashed</AutoText>
                    <AutoText style={styles.errorSub}>The map component encountered an error. You can still report bins below.</AutoText>
                </View>
            }>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={[styles.map, !mapReady && { opacity: 0 }]}
                initialRegion={RAIPUR_COORDS}
                showsUserLocation={locationGranted}
                showsMyLocationButton={locationGranted}
                mapType="standard"
                onMapReady={() => setMapReady(true)}
                onError={(e) => {
                    console.log('MapView error:', e.nativeEvent);
                    setMapError(true);
                }}
            >
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

                {(collectors || []).map((col) => (
                    <Marker
                        key={`collector-${col.collector_id}`}
                        coordinate={{ latitude: col.latitude, longitude: col.longitude }}
                        zIndex={999}
                    >
                        <Text style={{fontSize: 28}}>🚚</Text>
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{col.name}</Text>
                                <Text style={styles.calloutSub}>Heading to: {col.current_bin}</Text>
                                <Text style={styles.calloutSub}>ETA: {col.eta_minutes} mins</Text>
                                {col.distance_meters > 0 && (
                                    <Text style={styles.calloutAddress}>Collector is {col.distance_meters} meters away</Text>
                                )}
                                {col.distance_meters === 0 && (
                                    <Text style={styles.calloutAddress}>Collector is active</Text>
                                )}
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
            </MapErrorBoundary>

            <View style={styles.header} pointerEvents="none">
                <View style={styles.headerCard}>
                    <Text style={styles.headerEmoji}>♻️</Text>
                    <View>
                        <AutoText style={styles.headerTitle}>SmartWaste AI</AutoText>
                        <AutoText style={styles.headerSub}>{bins.length} bins tracked in Raipur</AutoText>
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
                    <AutoText style={[styles.loginLinkText, { color: '#7E22CE' }]}>🏭 Sell Waste to Recyclers</AutoText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Report', {})}
                    activeOpacity={0.85}
                >
                    <AutoText style={styles.fabText}>📸  Report Full Bin</AutoText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                >
                    <AutoText style={styles.loginLinkText}>Collector? Sign In →</AutoText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1, width: '100%', height: '100%' },
    mapPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.dark, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    mapPlaceholderText: { color: COLORS.accent, fontSize: 14, marginTop: 12, fontWeight: '600' },
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
    // Error fallback styles
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark, paddingHorizontal: 40 },
    errorEmoji: { fontSize: 64, marginBottom: 16 },
    errorTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
    errorSub: { fontSize: 14, color: COLORS.accent, textAlign: 'center', lineHeight: 20 },
    retryBtn: { marginTop: 20, backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
    retryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});