import { useState, useEffect, useRef } from 'react';
import AutoText from '../../components/AutoText';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Image, Alert, ActivityIndicator, Modal, FlatList, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getBins, submitPublicReport } from '../../api/publicApi';
import client from '../../api/client';
import { haversineDistance } from '../../utils/geofence';
import { COLORS } from '../../config';
import { useTranslation } from '../../i18n';

export default function ReportScreen({ route, navigation }) {
    const { t } = useTranslation();
    const { preselectedBin } = route.params || {};

    const [bins, setBins] = useState([]);
    const [binsLoading, setBinsLoading] = useState(true);
    const [selectedBin, setSelectedBin] = useState(preselectedBin || null);
    const [photo, setPhoto] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [locStatus, setLocStatus] = useState('detecting');
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [showBinPicker, setShowBinPicker] = useState(false);
    const [result, setResult] = useState(null);
    const [distanceToBin, setDistanceToBin] = useState(null);
    const resetTimerRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getBins();
                setBins(Array.isArray(data) ? data : []);
            } catch (e) {
                Alert.alert('Error', e.message || 'Failed to load bins');
            } finally {
                setBinsLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (preselectedBin) setSelectedBin(preselectedBin);
    }, [preselectedBin]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setLocStatus('failed'); return; }
            try {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation(loc.coords);
                setLocStatus('found');
            } catch { setLocStatus('failed'); }
        })();
    }, []);

    useEffect(() => {
        if (location?.latitude && location?.longitude && selectedBin?.latitude && selectedBin?.longitude) {
            const d = haversineDistance(location.latitude, location.longitude, selectedBin.latitude, selectedBin.longitude);
            setDistanceToBin(Math.round(d));
        } else {
            setDistanceToBin(null);
        }
    }, [location, selectedBin]);

    useEffect(() => {
        return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); };
    }, []);

    const handleImageResult = (res) => {
        if (res.canceled) return;
        if (!res.assets || res.assets.length === 0) return;
        const asset = res.assets[0];
        if (!asset || !asset.uri) return;
        setPhoto(asset);
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera access is needed to take a photo of the bin.');
                return;
            }
            const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
            handleImageResult(res);
        } catch (err) {
            console.log('Camera error:', err);
            Alert.alert('Camera Error', 'Could not open camera. Please check app permissions in Settings.');
        }
    };

    const pickPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Gallery access is needed to select a photo.');
                return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
            handleImageResult(res);
        } catch (err) {
            console.log('Gallery error:', err);
            Alert.alert('Gallery Error', 'Could not open gallery. Please check app permissions in Settings.');
        }
    };

    const resetForm = () => {
        setSelectedBin(null);
        setPhoto(null);
        setDescription('');
        setResult(null);
    };

    const wakeUpServer = async () => {
        try {
            setSubmitStatus('Waking up server...');
            await client.get('/public/bins', { timeout: 30000 });
            console.log('Server is awake');
        } catch (e) {
            console.log('Wake-up ping failed, proceeding anyway');
        }
    };

    const handleSubmit = async () => {
        if (!photo || !photo.uri) {
            Alert.alert('Photo Required', 'Please take or select a photo first');
            return;
        }
        if (locStatus === 'failed') {
            Alert.alert('Location required', 'Please enable GPS/location services to report a bin.');
            return;
        }
        if (!selectedBin || locStatus !== 'found') return;
        
        if (!distanceToBin || distanceToBin > 50) {
            Alert.alert(
                "Too Far Away",
                `You must be within 50 meters of this bin to report it.\nYou are ${distanceToBin || '?'}m away.`
            );
            return;
        }

        setSubmitting(true);
        setSubmitStatus('Connecting to server...');
        setResult(null);
        try {
            // Wake up Render server (free tier spins down after inactivity)
            await wakeUpServer();

            setSubmitStatus('Uploading... please wait');
            const formData = new FormData();
            formData.append('bin_id', selectedBin.id);
            formData.append('image', {
                uri: photo.uri,
                type: photo.mimeType || 'image/jpeg',
                name: photo.fileName || `report_${Date.now()}.jpg`,
            });
            formData.append('latitude', String(location.latitude));
            formData.append('longitude', String(location.longitude));
            formData.append('description', description.trim());

            setSubmitStatus('AI is analyzing your photo...');
            const res = await submitPublicReport(formData);
            setResult(res);
            resetTimerRef.current = setTimeout(resetForm, 4000);
        } catch (err) {
            const detail = err.response?.data?.detail;
            const msg = typeof detail === 'object'
                ? (detail.rejection_reason || JSON.stringify(detail))
                : (detail || err.message || 'Submission Failed');
            Alert.alert('Submission Failed', msg);
        }
        setSubmitting(false);
        setSubmitStatus('');
    };

    const canSubmit = selectedBin && photo && locStatus === 'found' && !submitting;

    if (result) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.resultCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                            <AutoText style={styles.resultTitle}>Report submitted successfully!</AutoText>
                        </View>
                        <View style={styles.resultRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="stats-chart" size={16} color="#666" />
                                <AutoText style={styles.resultLabel}>Fill Level:</AutoText>
                            </View>
                            <Text style={styles.resultValue}>{result.fill_level}%</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#666" />
                                <AutoText style={styles.resultLabel}>Waste Type:</AutoText>
                            </View>
                            <Text style={styles.resultValue}>{result.waste_type || '—'}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="alert-circle" size={16} color="#666" />
                                <AutoText style={styles.resultLabel}>Urgency:</AutoText>
                            </View>
                            <Text style={styles.resultValue}>{result.urgency || '—'}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialIcons name="gps-fixed" size={16} color="#666" />
                                <AutoText style={styles.resultLabel}>AI Confidence:</AutoText>
                            </View>
                            <Text style={styles.resultValue}>{result.ai_confidence}%</Text>
                        </View>
                        {result.ai_observations ? (
                            <View style={styles.observationsBox}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <MaterialCommunityIcons name="comment-text-outline" size={16} color="#666" />
                                    <AutoText style={styles.resultLabel}>Observations:</AutoText>
                                </View>
                                <Text style={styles.observationsText}>{result.ai_observations}</Text>
                            </View>
                        ) : null}
                        <AutoText style={styles.resultFooter}>Your report is now under review.</AutoText>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Step 1 — Select Bin */}
                <View style={styles.stepCard}>
                    <AutoText style={styles.stepHeader}>Step 1 — Select Bin</AutoText>
                    <TouchableOpacity
                        style={styles.picker}
                        onPress={() => setShowBinPicker(true)}
                        disabled={binsLoading}
                    >
                        {binsLoading ? (
                            <ActivityIndicator size="small" color={COLORS.mid} />
                        ) : (
                            <>
                                <Text style={[styles.pickerText, !selectedBin && { color: '#999' }]}>
                                    {selectedBin ? `${selectedBin.label} — ${selectedBin.address || 'No address'}` : 'Tap to choose a bin...'}
                                </Text>
                                <Text style={styles.pickerArrow}>▾</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Step 2 — Photo */}
                <View style={styles.stepCard}>
                    <AutoText style={styles.stepHeader}>Step 2 — Take Photo</AutoText>
                    {photo ? (
                        <View style={styles.photoPreviewContainer}>
                            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                            <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
                                <AutoText style={styles.retakeBtnText}>Retake ✕</AutoText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.photoButtons}>
                            <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
                                <Ionicons name="camera" size={32} color={COLORS.white} style={{ marginBottom: 6 }} />
                                <AutoText style={styles.cameraBtnText}>Camera</AutoText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.galleryBtn} onPress={pickPhoto}>
                                <Ionicons name="images-outline" size={32} color={COLORS.dark} style={{ marginBottom: 6 }} />
                                <AutoText style={styles.galleryBtnText}>Gallery</AutoText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.stepCard}>
                    <AutoText style={styles.stepHeader}>Description (optional)</AutoText>
                    <TextInput
                        style={styles.descInput}
                        placeholder="Add any notes..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Step 3 — Location */}
                <View style={styles.stepCard}>
                    <AutoText style={styles.stepHeader}>Step 3 — Location</AutoText>
                    <View style={[styles.locRow, {
                        backgroundColor: locStatus === 'found' ? '#DCFCE7' : locStatus === 'detecting' ? '#EFF6FF' : '#FEE2E2'
                    }]}>
                        {locStatus === 'detecting' && <ActivityIndicator size="small" color="#3B82F6" />}
                        {locStatus === 'found' && <Ionicons name="checkmark-circle" size={18} color="#15803D" />}
                        {locStatus === 'failed' && <Ionicons name="close-circle" size={18} color="#DC2626" />}
                        <Text style={[styles.locText, {
                            color: locStatus === 'found' ? '#15803D' : locStatus === 'detecting' ? '#1D4ED8' : '#DC2626'
                        }]}>
                            {locStatus === 'detecting' && 'Detecting your location...'}
                            {locStatus === 'found' && location && `Detected: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                            {locStatus === 'failed' && 'Location failed. Please enable GPS.'}
                        </Text>
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                >
                    {submitting ? (
                        <>
                            <ActivityIndicator color="#fff" size="small" />
                            <AutoText style={[styles.submitBtnText, { marginLeft: 8, fontSize: 14 }]}>{submitStatus || 'Loading...'}</AutoText>
                        </>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="rocket-outline" size={18} color={COLORS.white} />
                            <AutoText style={styles.submitBtnText}>Submit Report</AutoText>
                        </View>
                    )}
                </TouchableOpacity>

                {selectedBin && (
                    <Text style={[styles.disclaimer, { 
                        color: distanceToBin === null ? '#888' : distanceToBin <= 50 ? '#15803D' : '#DC2626',
                        fontWeight: distanceToBin <= 50 ? '600' : 'bold'
                    }]}>
                        {distanceToBin === null 
                            ? "Fetching your location..." 
                            : distanceToBin <= 50 
                                ? `You are ${distanceToBin}m away — within range` 
                                : `You are ${distanceToBin}m away — move closer`}
                    </Text>
                )}
            </ScrollView>

            {/* Bin Picker Modal */}
            <Modal visible={showBinPicker} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
                    <View style={styles.modalHeader}>
                        <AutoText style={styles.modalTitle}>Select Bin</AutoText>
                        <TouchableOpacity onPress={() => setShowBinPicker(false)}>
                            <AutoText style={styles.modalClose}>✕ Close</AutoText>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={bins}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <View style={styles.emptyBins}>
                                <AutoText style={styles.emptyBinsText}>No bins available</AutoText>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.binOption, selectedBin?.id === item.id && { borderColor: COLORS.mid, borderWidth: 2 }]}
                                onPress={() => { setSelectedBin(item); setShowBinPicker(false); }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.binOptionTitle}>{item.label}</Text>
                                    <Text style={styles.binOptionSub}>{item.address || 'No address'}</Text>
                                </View>
                                {selectedBin?.id === item.id && <Text style={{ color: COLORS.mid, fontSize: 18 }}>✓</Text>}
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },
    stepCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    stepHeader: { fontSize: 13, fontWeight: '700', color: COLORS.mid, letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
    picker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14 },
    pickerText: { flex: 1, fontSize: 15, color: COLORS.dark, fontWeight: '500' },
    pickerArrow: { fontSize: 18, color: '#999' },
    photoButtons: { flexDirection: 'row', gap: 12 },
    cameraBtn: { flex: 1, backgroundColor: COLORS.mid, borderRadius: 14, padding: 20, alignItems: 'center' },
    galleryBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 14, padding: 20, alignItems: 'center' },

    cameraBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
    galleryBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
    descInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: 'top' },
    photoPreviewContainer: { position: 'relative' },
    photoPreview: { width: '100%', height: 200, borderRadius: 14, resizeMode: 'cover' },
    retakeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    retakeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },

    locText: { fontSize: 13, fontWeight: '500', flex: 1 },
    submitBtn: { height: 56, backgroundColor: COLORS.mid, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8, flexDirection: 'row', shadowColor: COLORS.mid, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
    submitBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
    disclaimer: { marginTop: 12, textAlign: 'center', fontSize: 12, color: '#888', lineHeight: 18 },
    resultCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
    resultTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 20 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    resultLabel: { fontSize: 15, color: '#666', fontWeight: '500' },
    resultValue: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
    observationsBox: { marginTop: 8, marginBottom: 16, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 12 },
    observationsText: { fontSize: 14, color: '#444', marginTop: 6, lineHeight: 20 },
    resultFooter: { fontSize: 13, color: '#666', fontStyle: 'italic' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
    modalClose: { color: COLORS.mid, fontSize: 14, fontWeight: '600' },
    binOption: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
    binOptionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
    binOptionSub: { fontSize: 12, color: '#777', marginTop: 3 },
    emptyBins: { padding: 24, alignItems: 'center' },
    emptyBinsText: { fontSize: 15, color: '#888' },
});
