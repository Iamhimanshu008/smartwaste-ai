import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, TextInput,
  ScrollView, Modal, FlatList, Vibration, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { getCitizenByQR, searchCitizens, saveTransaction, getTodayStats, getTodayTransactions } from '../../services/localDB';

export default function CollectionScreen({ navigation, route }) {
  const wardNo = route?.params?.ward_no || 0;
  const { user } = useStore();

  // Scanner state
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Citizen state
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Weight state
  const [weightInput, setWeightInput] = useState('');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isBLEVerified, setIsBLEVerified] = useState(false);

  // Stats state
  const [todayStats, setTodayStats] = useState({ total_collections: 0, total_grams: 0, manual_count: 0 });
  const [todayList, setTodayList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { refreshStats(); }, []);

  useEffect(() => {
    if (route.params?.weight_grams) {
      setWeightInput(String(route.params.weight_grams));
      if (route.params.ble_verified) {
        setIsBLEVerified(true);
      }
      // Reset params so it doesn't trigger again
      navigation.setParams({ weight_grams: undefined, ble_verified: undefined, device_id: undefined });
    }
  }, [route.params?.weight_grams]);

  const refreshStats = async () => {
    const stats = await getTodayStats();
    const list = await getTodayTransactions();
    setTodayStats(stats);
    setTodayList(list);
  };

  const handleQRScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(false);
    Vibration.vibrate(100);

    const citizen = await getCitizenByQR(data);
    if (citizen) {
      setSelectedCitizen(citizen);
      setIsManualOverride(false);
    } else {
      Alert.alert(
        'QR Not Found',
        `House ID "${data}" not in today's list. Search manually?`,
        [
          { text: 'Search', onPress: () => setShowSearch(true) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const results = await searchCitizens(query);
    setSearchResults(results);
  };

  const selectCitizenFromSearch = (citizen) => {
    setSelectedCitizen(citizen);
    setIsManualOverride(true);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSaveCollection = async () => {
    if (!selectedCitizen) {
      Alert.alert('No Citizen', 'Please scan QR or search for a citizen first.');
      return;
    }
    const grams = parseInt(weightInput);
    if (!grams || grams <= 0 || grams > 10000) {
      Alert.alert('Invalid Weight', 'Enter weight between 1 and 10,000 grams.');
      return;
    }
    // Fraud check
    if (grams > 3000) {
      Alert.alert(
        'Weight Alert',
        `${grams}g exceeds daily limit (3000g). This will be flagged for audit. Continue?`,
        [
          { text: 'Continue', onPress: () => doSave(grams) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    doSave(grams);
  };

  const doSave = async (grams) => {
    setSaving(true);
    try {
      await saveTransaction({
        house_id: selectedCitizen.house_id,
        weight_grams: grams,
        is_manual_override: isManualOverride,
        is_ble_verified: isBLEVerified,
        waste_type: 'plastic',
        collected_at: new Date().toISOString(),
      });
      // Reset for next scan
      setSelectedCitizen(null);
      setWeightInput('');
      setScanned(false);
      setIsManualOverride(false);
      await refreshStats();
      Vibration.vibrate([0, 100, 50, 100]);
    } catch (err) {
      Alert.alert('Error', 'Could not save transaction. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'Camera access is needed to scan QR codes.');
        return;
      }
    }
    setScanned(false);
    setScanning(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Collection</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AfternoonSync', { ward_no: wardNo })}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Today Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayStats.total_collections}</Text>
          <Text style={styles.statLabel}>Collected</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{((todayStats.total_grams || 0) / 1000).toFixed(1)}kg</Text>
          <Text style={styles.statLabel}>Total Weight</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, todayStats.manual_count > 0 && styles.statWarning]}>
            {todayStats.manual_count}
          </Text>
          <Text style={styles.statLabel}>Manual</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.offlineBadge]}>
            <MaterialCommunityIcons name="wifi-off" size={12} color="#ffffff" />
            <Text style={styles.offlineBadgeText}>OFFLINE</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Scan / Search Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1 — Identify Citizen</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.scanBtn} onPress={handleOpenScanner}>
              <Ionicons name="qr-code-outline" size={28} color="#ffffff" />
              <Text style={styles.scanBtnText}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(true)}>
              <Ionicons name="search-outline" size={22} color="#16a34a" />
              <Text style={styles.searchBtnText}>Search Name</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Citizen */}
          {selectedCitizen ? (
            <View style={styles.citizenSelected}>
              <View style={styles.citizenAvatar}>
                <Text style={styles.citizenAvatarText}>{selectedCitizen.name?.charAt(0)}</Text>
              </View>
              <View style={styles.citizenInfo}>
                <Text style={styles.citizenName}>{selectedCitizen.name}</Text>
                <Text style={styles.citizenHouseId}>{selectedCitizen.house_id} • Ward {selectedCitizen.ward_no}</Text>
                {isManualOverride && (
                  <View style={styles.manualBadge}>
                    <Ionicons name="warning-outline" size={12} color="#f59e0b" />
                    <Text style={styles.manualBadgeText}>Manual Override</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => { setSelectedCitizen(null); setScanned(false); }}>
                <Ionicons name="close-circle" size={24} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.citizenEmpty}>
              <Ionicons name="person-outline" size={32} color="#d1d5db" />
              <Text style={styles.citizenEmptyText}>No citizen selected</Text>
            </View>
          )}
        </View>

        {/* Weight Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 2 — Enter Weight</Text>

          {/* BLE Button */}
          <TouchableOpacity 
            style={[styles.bleBanner, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
            onPress={() => navigation.navigate('BleWeightScreen')}
          >
            <MaterialCommunityIcons name="bluetooth" size={20} color="#3b82f6" />
            <Text style={[styles.bleBannerText, { color: '#1d4ed8', fontWeight: '600' }]}>
              Weigh with Smart Scale (BLE)
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
          </TouchableOpacity>

          <View style={styles.weightInputRow}>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#d1d5db"
              maxLength={5}
            />
            <Text style={styles.weightUnit}>g</Text>
          </View>

          {/* Quick weight buttons */}
          <View style={styles.quickWeights}>
            {[250, 500, 750, 1000, 1500, 2000].map(w => (
              <TouchableOpacity
                key={w}
                style={styles.quickWeightBtn}
                onPress={() => setWeightInput(String(w))}
              >
                <Text style={styles.quickWeightText}>{w >= 1000 ? `${w/1000}kg` : `${w}g`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!selectedCitizen || !weightInput) && styles.saveBtnDisabled,
          ]}
          onPress={handleSaveCollection}
          disabled={!selectedCitizen || !weightInput || saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
          )}
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Lock & Save Collection'}
          </Text>
        </TouchableOpacity>

        {/* Today's Collections List */}
        {todayList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Collections ({todayList.length})</Text>
            {todayList.slice(0, 5).map((item, i) => (
              <View key={item.id || i} style={styles.collectionItem}>
                <View style={styles.collectionIconBg}>
                  <MaterialCommunityIcons name="recycle" size={18} color="#16a34a" />
                </View>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{item.citizen_name || item.house_id}</Text>
                  <Text style={styles.collectionHouseId}>{item.house_id}</Text>
                </View>
                <View style={styles.collectionRight}>
                  <Text style={styles.collectionWeight}>{item.weight_grams}g</Text>
                  {item.is_manual_override ? (
                    <Ionicons name="warning" size={14} color="#f59e0b" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  )}
                </View>
              </View>
            ))}
            {todayList.length > 5 && (
              <Text style={styles.moreText}>+{todayList.length - 5} more collections</Text>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScanning(false)} style={styles.scannerClose}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Citizen QR</Text>
            <View style={{ width: 44 }} />
          </View>

          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleQRScan}
          />

          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
          </View>

          <View style={styles.scannerBottom}>
            <Text style={styles.scannerHint}>Point camera at the citizen's QR card</Text>
            <TouchableOpacity
              style={styles.manualFallback}
              onPress={() => { setScanning(false); setShowSearch(true); }}
            >
              <Text style={styles.manualFallbackText}>Can't scan? Search by name →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearch} animationType="slide" transparent>
        <View style={styles.searchModal}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Search Citizen</Text>
              <TouchableOpacity onPress={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search-outline" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Name or House ID..."
                autoFocus
                placeholderTextColor="#9ca3af"
              />
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.house_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResult}
                  onPress={() => selectCitizenFromSearch(item)}
                >
                  <View style={styles.searchResultAvatar}>
                    <Text style={styles.searchResultAvatarText}>{item.name?.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultId}>{item.house_id} • Ward {item.ward_no}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <Text style={styles.searchEmpty}>No citizens found</Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dcfce7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#14532d' },
  statsBar: {
    flexDirection: 'row', backgroundColor: '#14532d',
    paddingVertical: 10, paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  statWarning: { color: '#fbbf24' },
  statLabel: { fontSize: 10, color: '#86efac', textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: '#ffffff20' },
  offlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  offlineBadgeText: { fontSize: 10, color: '#ffffff', fontWeight: '700' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#14532d', marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  scanBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#16a34a', borderRadius: 12, padding: 14,
  },
  scanBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  searchBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#16a34a',
  },
  searchBtnText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  citizenSelected: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: '#16a34a',
  },
  citizenAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
  },
  citizenAvatarText: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  citizenInfo: { flex: 1 },
  citizenName: { fontSize: 15, fontWeight: '700', color: '#14532d' },
  citizenHouseId: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  manualBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  manualBadgeText: { fontSize: 11, color: '#f59e0b', fontWeight: '600' },
  citizenEmpty: { alignItems: 'center', padding: 16 },
  citizenEmptyText: { fontSize: 13, color: '#d1d5db', marginTop: 6 },
  bleBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, marginBottom: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  bleBannerText: { fontSize: 12, color: '#6b7280', flex: 1 },
  weightInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
  weightInput: {
    fontSize: 56, fontWeight: '900', color: '#14532d', textAlign: 'center',
    minWidth: 140, borderBottomWidth: 3, borderBottomColor: '#16a34a', paddingBottom: 4,
  },
  weightUnit: { fontSize: 28, fontWeight: '700', color: '#16a34a', marginTop: 20 },
  quickWeights: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  quickWeightBtn: {
    backgroundColor: '#f0fdf4', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#dcfce7',
  },
  quickWeightText: { fontSize: 13, color: '#16a34a', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#16a34a', borderRadius: 14, padding: 18, marginBottom: 20,
    elevation: 4, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  saveBtnDisabled: { backgroundColor: '#9ca3af', elevation: 0 },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#ffffff' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#14532d', marginBottom: 10 },
  collectionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
  },
  collectionIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  collectionInfo: { flex: 1 },
  collectionName: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  collectionHouseId: { fontSize: 11, color: '#9ca3af' },
  collectionRight: { alignItems: 'flex-end', gap: 4 },
  collectionWeight: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  moreText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 4, marginBottom: 8 },
  scannerContainer: { flex: 1, backgroundColor: '#000000' },
  scannerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  scannerClose: { padding: 8 },
  scannerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  camera: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 220, height: 220, borderWidth: 3, borderColor: '#16a34a', borderRadius: 16 },
  scannerBottom: { padding: 24, alignItems: 'center' },
  scannerHint: { fontSize: 14, color: '#ffffff', textAlign: 'center', marginBottom: 12 },
  manualFallback: { padding: 12 },
  manualFallbackText: { fontSize: 14, color: '#86efac', fontWeight: '600' },
  searchModal: { flex: 1, backgroundColor: '#00000060', justifyContent: 'flex-end' },
  searchModalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  searchModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  searchModalTitle: { fontSize: 17, fontWeight: '700', color: '#14532d' },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1f2937' },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchResultAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  searchResultAvatarText: { fontSize: 18, fontWeight: '700', color: '#16a34a' },
  searchResultName: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  searchResultId: { fontSize: 12, color: '#9ca3af' },
  searchEmpty: { textAlign: 'center', color: '#9ca3af', padding: 20, fontSize: 14 },
});
