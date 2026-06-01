import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, SafeAreaView, ImageBackground
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Feather } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';
import SideDrawer from '../../components/SideDrawer';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenHomeScreen({ navigation }) {
  const { user, citizenWallet, setCitizenWallet, citizenProfile, setCitizenProfile } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, walletRes] = await Promise.all([
        citizenApi.getProfile(),
        citizenApi.getWallet(),
      ]);
      setCitizenProfile(profileRes.data);
      setCitizenWallet(walletRes.data);
    } catch (err) {
      // Silently fail or use dummy data if API fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const balance = citizenWallet?.balance ?? 0;
  const initials = (user?.full_name || citizenProfile?.name || 'C').charAt(0).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DARK_GREEN} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)}>
          <Ionicons name="menu" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartWaste AI</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="globe-outline" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CitizenNotifications')}>
            <Ionicons name="notifications-outline" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[DARK_GREEN]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{citizenProfile?.name || user?.full_name || 'Citizen'}</Text>
              <Text style={styles.profileHouseId}>House ID: #{citizenProfile?.house_id || 'SW-XXXXX'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CitizenQR')}>
            <Ionicons name="qr-code" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
        </View>

        {/* POINTS CARD */}
        <View style={styles.pointsCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pointsLabel}>TOTAL REWARDS</Text>
            <Text style={styles.pointsValue}>{balance.toLocaleString()} Points</Text>
            <TouchableOpacity 
              style={styles.redeemButton} 
              onPress={() => navigation.navigate('CitizenOffers')}
            >
              <Text style={styles.redeemButtonText}>Redeem Rewards</Text>
              <Ionicons name="arrow-forward" size={16} color={DARK_GREEN} />
            </TouchableOpacity>
          </View>
          <View style={styles.coinIconWrapper}>
            <MaterialCommunityIcons name="currency-usd" size={32} color={DARK_GREEN} />
          </View>
        </View>

        {/* QUICK ACTION GRID */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCardWhite} onPress={() => navigation.navigate('CitizenHistory')}>
            <View style={styles.actionIconRow}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={DARK_GREEN} />
            </View>
            <Text style={styles.actionTitleWhite}>History</Text>
            <Text style={styles.actionSubtitleWhite}>3 disposals this month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCardGreen} onPress={() => navigation.navigate('CitizenOffers')}>
            <View style={styles.actionIconRow}>
              <MaterialCommunityIcons name="tag-outline" size={24} color={WHITE} />
            </View>
            <Text style={styles.actionTitleGreen}>Offers</Text>
            <Text style={styles.actionSubtitleGreen}>5 new rewards available</Text>
          </TouchableOpacity>
        </View>

        {/* UPCOMING PICKUP */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Pickup</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.pickupCard}>
          <View style={styles.pickupDateBadge}>
            <Text style={styles.pickupDateDay}>28</Text>
            <Text style={styles.pickupDateMonth}>OCT</Text>
          </View>
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupType}>Organic Waste</Text>
            <Text style={styles.pickupTime}>Tomorrow • 08:30 AM</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        {/* SUSTAINABILITY TIP */}
        <View style={styles.tipCard}>
          <View style={styles.tipPill}>
            <Text style={styles.tipPillText}>SUSTAINABILITY TIP</Text>
          </View>
          <Text style={styles.tipText}>
            Composting at home reduces landfill waste by up to 30%. Start with a small bin today!
          </Text>
        </View>
      </ScrollView>

      <SideDrawer 
        visible={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        navigation={navigation} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: DARK_GREEN },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Profile Card
  profileCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: WHITE,
    borderWidth: 2, borderColor: MED_GREEN,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: DARK_GREEN },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  profileHouseId: { fontSize: 14, color: '#666666' },
  qrButton: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: BG,
    justifyContent: 'center', alignItems: 'center',
  },

  // Points Card
  pointsCard: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 24, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  pointsLabel: { fontSize: 12, color: LIGHT_GREEN, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  pointsValue: { fontSize: 28, fontWeight: 'bold', color: WHITE, marginBottom: 12 },
  redeemButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: LIGHT_GREEN, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  redeemButtonText: { fontSize: 14, fontWeight: 'bold', color: DARK_GREEN, marginRight: 4 },
  coinIconWrapper: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: LIGHT_GREEN,
    justifyContent: 'center', alignItems: 'center',
  },

  // Actions Grid
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionCardWhite: {
    width: '48%', backgroundColor: WHITE, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  actionCardGreen: {
    width: '48%', backgroundColor: DARK_GREEN, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  actionIconRow: { marginBottom: 12 },
  actionTitleWhite: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  actionSubtitleWhite: { fontSize: 12, color: '#666666' },
  actionTitleGreen: { fontSize: 16, fontWeight: 'bold', color: WHITE, marginBottom: 4 },
  actionSubtitleGreen: { fontSize: 12, color: LIGHT_GREEN },

  // Upcoming Pickup
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  sectionLink: { fontSize: 14, fontWeight: '600', color: MED_GREEN },
  pickupCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  pickupDateBadge: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  pickupDateDay: { fontSize: 16, fontWeight: 'bold', color: MED_GREEN },
  pickupDateMonth: { fontSize: 10, fontWeight: 'bold', color: MED_GREEN },
  pickupInfo: { flex: 1 },
  pickupType: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  pickupTime: { fontSize: 14, color: '#666666' },

  // Tip Card
  tipCard: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  tipPill: {
    backgroundColor: LIGHT_GREEN, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  tipPillText: { fontSize: 10, fontWeight: 'bold', color: DARK_GREEN, letterSpacing: 0.5 },
  tipText: { fontSize: 18, fontWeight: 'bold', color: WHITE, lineHeight: 26 },
});
