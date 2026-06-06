import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenSettingsScreen({ navigation }) {
  const logout = useStore(state => state.logout);
  const [darkMode, setDarkMode] = useState(false);
  const [lowData, setLowData] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setTimeout(() => logout(), 500);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Preferences</Text>
            <Text style={styles.bannerSubtitle}>Manage your app experience</Text>
          </View>
        </View>

        {/* Appearance & Data */}
        <Text style={styles.sectionLabel}>APPEARANCE & DATA</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="moon-outline" size={22} color={DARK_GREEN} />
            </View>
            <View style={styles.settingMiddle}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>Switch to Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E5E5', true: LIGHT_GREEN }}
              thumbColor={darkMode ? DARK_GREEN : '#f4f3f4'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="cellular-outline" size={22} color={DARK_GREEN} />
            </View>
            <View style={styles.settingMiddle}>
              <Text style={styles.settingTitle}>Low Data Mode</Text>
              <Text style={styles.settingSubtitle}>Reduce image quality on mobile data</Text>
            </View>
            <Switch
              value={lowData}
              onValueChange={setLowData}
              trackColor={{ false: '#E5E5E5', true: LIGHT_GREEN }}
              thumbColor={lowData ? DARK_GREEN : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account & Safety */}
        <Text style={styles.sectionLabel}>ACCOUNT & SAFETY</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="call-outline" size={22} color={DARK_GREEN} />
            </View>
            <View style={styles.settingMiddle}>
              <Text style={styles.settingTitle}>Change Number</Text>
              <Text style={styles.settingSubtitle}>Update your registered phone number</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color={DARK_GREEN} />
            </View>
            <View style={styles.settingMiddle}>
              <Text style={styles.settingTitle}>Privacy & Policies</Text>
              <Text style={styles.settingSubtitle}>Terms, Data Usage, and Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Information */}
        <Text style={styles.sectionLabel}>INFORMATION</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="information-circle-outline" size={22} color={DARK_GREEN} />
            </View>
            <View style={styles.settingMiddle}>
              <Text style={styles.settingTitle}>About Swachhata Chakra</Text>
              <Text style={styles.settingSubtitle}>v2.4.1</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.navigate('CitizenHome')}>
          <Ionicons name="home-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.exitBtnText}>Exit Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: BG,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: DARK_GREEN },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

  banner: {
    backgroundColor: MED_GREEN, borderRadius: 16, height: 120, marginBottom: 24,
    justifyContent: 'flex-end', padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  bannerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  bannerSubtitle: { fontSize: 13, color: '#666666' },

  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: DARK_GREEN, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },

  settingsGroup: {
    backgroundColor: WHITE, borderRadius: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingIconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  settingMiddle: { flex: 1, marginRight: 8 },
  settingTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  settingSubtitle: { fontSize: 12, color: '#666666' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, marginTop: 8, marginBottom: 24,
  },
  signOutText: { fontSize: 16, fontWeight: 'bold', color: '#DC2626' },

  footer: { padding: 20, backgroundColor: BG },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK_GREEN, borderRadius: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  exitBtnText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
});
