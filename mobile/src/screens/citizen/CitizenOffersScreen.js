import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenOffersScreen({ navigation }) {
  const { citizenWallet, setCitizenWallet } = useStore();
  const balance = citizenWallet?.balance ?? 0;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await citizenApi.fetchStoreItems();
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleRedeem = (item) => {
    if (balance < item.point_cost) {
      Alert.alert('Insufficient Points', `You need ${item.point_cost} points to redeem this item.`);
      return;
    }
    
    if (item.stock_quantity <= 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to redeem "${item.name}" for ${item.point_cost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          style: 'default',
          onPress: () => doRedeem(item)
        }
      ]
    );
  };

  const doRedeem = async (item) => {
    setRedeeming(true);
    try {
      await citizenApi.redeemItem(item.id, item.point_cost);
      
      // Refresh wallet balance
      try {
        const walletRes = await citizenApi.getWallet();
        if (walletRes.data) {
          setCitizenWallet(walletRes.data);
        }
      } catch (e) {
        // Fallback to local deduction if wallet fetch fails
        setCitizenWallet({ ...citizenWallet, balance: balance - item.point_cost });
      }

      Alert.alert('Success', `You successfully redeemed ${item.name}! Check your reward history.`);
      loadData(); // refresh stock
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to redeem item. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer?.() || navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Rewards</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('CitizenNotifications')}>
            <Ionicons name="notifications-outline" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[DARK_GREEN]} />}
      >
        {/* Points Banner */}
        <View style={styles.pointsBanner}>
          <View>
            <Text style={styles.pointsBannerLabel}>Available Points</Text>
            <Text style={styles.pointsBannerValue}>{balance.toLocaleString()} Points</Text>
          </View>
          <View style={styles.pointsBannerIconBox}>
            <MaterialCommunityIcons name="star-four-points-outline" size={28} color={DARK_GREEN} />
          </View>
        </View>

        <View style={styles.sectionHeadingContainer}>
          <Text style={styles.sectionHeading}>Your Rewards</Text>
          <Text style={styles.sectionSubtitle}>Redeem your points for exciting offers</Text>
        </View>

        {/* Loading / Empty / List */}
        {loading ? (
          <ActivityIndicator size="large" color={DARK_GREEN} style={{ marginTop: 20 }} />
        ) : offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="storefront-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No rewards available right now.</Text>
          </View>
        ) : (
          <View style={styles.offersList}>
            {offers.filter(o => o.is_active !== false).map(offer => {
              const canAfford = balance >= offer.point_cost;
              const isOutOfStock = offer.stock_quantity <= 0;
              
              return (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerCardContent}>
                    {offer.image_url ? (
                      <Image source={{ uri: offer.image_url }} style={styles.offerImage} />
                    ) : (
                      <View style={styles.offerIconBox}>
                        <MaterialCommunityIcons name="gift-outline" size={32} color={DARK_GREEN} />
                      </View>
                    )}
                    
                    <View style={styles.offerMiddle}>
                      <Text style={styles.offerTitle}>{offer.name}</Text>
                      <Text style={styles.offerDesc}>{offer.description || 'No description available.'}</Text>
                      <Text style={styles.offerStock}>
                        {isOutOfStock ? 'Out of Stock' : `${offer.stock_quantity} left`}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.offerActionRow}>
                    <Text style={styles.offerPoints}>{offer.point_cost.toLocaleString()} Points</Text>
                    <TouchableOpacity 
                      style={[
                        styles.redeemBtn, 
                        (!canAfford || isOutOfStock) && styles.redeemBtnDisabled
                      ]}
                      onPress={() => handleRedeem(offer)}
                      disabled={!canAfford || isOutOfStock || redeeming}
                    >
                      <Text style={styles.redeemBtnText}>
                        {redeeming ? 'Processing...' : (!canAfford ? 'Insufficient Points' : 'Redeem')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* View Reward History Button */}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('CitizenHistory')}>
          <MaterialCommunityIcons name="history" size={20} color="#666666" style={{ marginRight: 8 }} />
          <Text style={styles.historyBtnText}>View Reward History</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  pointsBanner: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  pointsBannerLabel: { fontSize: 14, color: LIGHT_GREEN, marginBottom: 6 },
  pointsBannerValue: { fontSize: 32, fontWeight: 'bold', color: WHITE },
  pointsBannerIconBox: {
    width: 52, height: 52, borderRadius: 12, backgroundColor: LIGHT_GREEN,
    justifyContent: 'center', alignItems: 'center',
  },

  sectionHeadingContainer: { marginBottom: 16 },
  sectionHeading: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#666666' },

  emptyContainer: { alignItems: 'center', marginVertical: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },

  offersList: { marginBottom: 24 },
  offerCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  offerCardContent: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16,
  },
  offerImage: {
    width: 64, height: 64, borderRadius: 12, marginRight: 16, backgroundColor: '#E8F5E9'
  },
  offerIconBox: {
    width: 64, height: 64, borderRadius: 12, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  offerMiddle: { flex: 1 },
  offerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  offerDesc: { fontSize: 13, color: '#666666', marginBottom: 8 },
  offerStock: { fontSize: 12, color: MED_GREEN, fontWeight: '600' },

  offerActionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 16,
  },
  offerPoints: { fontSize: 16, fontWeight: 'bold', color: DARK_GREEN },
  redeemBtn: {
    backgroundColor: MED_GREEN, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
  },
  redeemBtnDisabled: {
    backgroundColor: '#CCCCCC'
  },
  redeemBtnText: {
    color: WHITE, fontSize: 14, fontWeight: 'bold'
  },

  historyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 16, paddingVertical: 16, backgroundColor: BG,
  },
  historyBtnText: { fontSize: 16, fontWeight: '600', color: '#666666' },
});
