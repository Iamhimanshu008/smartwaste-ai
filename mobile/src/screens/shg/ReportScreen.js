import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getBins, reportBin } from '../../api/shgApi';
import { COLORS } from '../../config';

const CustomSlider = ({ value, onValueChange }) => {
    const [trackWidth, setTrackWidth] = useState(0);

    const handleTouch = (evt) => {
        if (trackWidth === 0) return;
        const x = evt.nativeEvent.locationX;
        let pct = (x / trackWidth) * 100;
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        onValueChange(Math.round(pct));
    };

    const getColor = (v) => {
        if (v < 30) return '#10B981'; // Green
        if (v < 70) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    return (
        <View 
            style={sliderStyles.track}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleTouch}
            onResponderMove={handleTouch}
        >
            <View style={[sliderStyles.fill, { width: `${value}%`, backgroundColor: getColor(value) }]} pointerEvents="none" />
            <View style={[sliderStyles.thumb, { left: `${value}%`, borderColor: getColor(value) }]} pointerEvents="none" />
        </View>
    );
};

const sliderStyles = StyleSheet.create({
    track: { height: 40, backgroundColor: '#E5E7EB', borderRadius: 20, justifyContent: 'center', position: 'relative' },
    fill: { height: '100%', position: 'absolute', left: 0, top: 0, borderRadius: 20 },
    thumb: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF',
        position: 'absolute', top: 8, marginLeft: -12,
        borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2
    }
});

export default function ReportScreen() {
    const [bins, setBins] = useState([]);
    const [loadingBins, setLoadingBins] = useState(true);
    
    // Form state
    const [selectedBinId, setSelectedBinId] = useState(null);
    const [fillLevel, setFillLevel] = useState(0);
    const [photo, setPhoto] = useState(null);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadBins = async () => {
        try {
            const data = await getBins();
            setBins(data);
            if (data.length > 0 && !selectedBinId) {
                setSelectedBinId(data[0].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBins(false);
        }
    };

    useFocusEffect(useCallback(() => { loadBins(); }, []));

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission denied', 'Camera access is required.'); return; }
        const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
        if (!res.canceled) setPhoto(res.assets[0]);
    };

    const handleSubmit = async () => {
        const safeMessage = (detail) => {
            if (!detail) return 'An unexpected error occurred.';
            if (Array.isArray(detail)) return detail.map(e => e.msg || JSON.stringify(e)).join(', ');
            if (typeof detail === 'object') return JSON.stringify(detail);
            return String(detail);
        };

        if (!selectedBinId) {
            Alert.alert('Error', 'Please select a bin first.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('fill_level', fillLevel.toString());
            formData.append('notes', notes.trim());
            
            if (photo) {
                formData.append('image', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: 'report.jpg',
                });
            }

            const res = await reportBin(selectedBinId, formData);
            Alert.alert('Success', res.message || `Report submitted! Bin marked as ${fillLevel}% full.`);
            setFillLevel(0);
            setNotes('');
            setPhoto(null);
        } catch (e) {
            Alert.alert('Error', safeMessage(e.response?.data?.detail || e.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingBins) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.mid} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Report Bin Status</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Select Bin</Text>
                    <View style={styles.pickerRow}>
                        {bins.map(b => (
                            <TouchableOpacity 
                                key={b.id} 
                                style={[styles.choiceBtn, selectedBinId === b.id && styles.choiceBtnActive]}
                                onPress={() => setSelectedBinId(b.id)}
                            >
                                <Text style={[styles.choiceText, selectedBinId === b.id && styles.choiceTextActive]}>{b.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Fill Level: {fillLevel}%</Text>
                    <View style={{ marginBottom: 16 }}>
                        <CustomSlider value={fillLevel} onValueChange={setFillLevel} />
                        <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#666', fontWeight: '500' }}>
                            Bin is {fillLevel}% full
                        </Text>
                    </View>

                    <Text style={styles.label}>Photo (Optional)</Text>
                    {photo ? (
                        <View style={styles.photoPreviewContainer}>
                            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                            <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
                                <Text style={styles.retakeBtnText}>Remove ✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                            <Text style={styles.photoBtnEmoji}>📷</Text>
                            <Text style={styles.photoBtnText}>Take Photo</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Any observations?"
                        multiline
                    />

                    <TouchableOpacity 
                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Report</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 20 },
    card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: '#FAFAFA', fontSize: 15 },
    textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    choiceBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    choiceBtnActive: { backgroundColor: '#ECFDF5', borderColor: COLORS.mid },
    choiceText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    choiceTextActive: { color: COLORS.dark },
    photoBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, height: 80, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', marginBottom: 16 },
    photoBtnEmoji: { fontSize: 24, marginBottom: 4 },
    photoBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
    photoPreviewContainer: { position: 'relative', marginBottom: 16 },
    photoPreview: { width: '100%', height: 160, borderRadius: 12, resizeMode: 'cover' },
    retakeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    retakeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    submitBtn: { backgroundColor: COLORS.mid, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24, shadowColor: COLORS.mid, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
