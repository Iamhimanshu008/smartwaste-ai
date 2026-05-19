import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Dimensions, ScrollView, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import useStore from '../store';
import { checkForUpdate } from '../utils/updateChecker';
import appJson from '../../app.json';

const { width } = Dimensions.get('window');

const SideDrawer = ({ visible, onClose, user, navigation }) => {
  const { t } = useTranslation();
  const logout = useStore(state => state.logout);

  const menuItems = [
    { icon: <Ionicons name="home-outline" size={22} color="#16a34a" />, key: 'Dashboard', screen: 'Home' },
    { icon: <MaterialCommunityIcons name="map-marker-path" size={22} color="#16a34a" />, key: 'My Route', screen: 'Map' },
    { icon: <Ionicons name="stats-chart-outline" size={22} color="#16a34a" />, key: 'Stats', screen: 'Stats' },
    { icon: <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#16a34a" />, key: 'History', screen: 'History' },
    { icon: <MaterialCommunityIcons name="shield-check-outline" size={22} color="#16a34a" />, key: 'Safety Checklist', screen: 'SafetyChecklist' },
    { icon: <MaterialCommunityIcons name="newspaper-variant-outline" size={22} color="#16a34a" />, key: 'Swachhta Samachar', screen: 'NewsFeed' },
  ];

  const handleNavigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={onClose} 
          activeOpacity={1}
        />
        <View style={styles.drawer}>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.full_name || 'Staff'}
              </Text>
              <Text style={styles.userRole}>
                {user?.role?.replace('_', ' ')?.toUpperCase()}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
          <ScrollView style={styles.menuList}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <View style={styles.menuIconContainer}>{item.icon}</View>
                <Text style={styles.menuLabel}>{t(item.key)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 8 }]}
            onPress={async () => {
              onClose();
              await checkForUpdate(appJson.expo.version, true);
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="refresh-circle-outline" size={22} color="#6b7280" />
            </View>
            <Text style={styles.menuLabel}>{t('Check for Updates') || 'Check for Updates'}</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert(
                t('Logout'),
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: t('Logout'),
                    style: 'destructive',
                    onPress: () => {
                      // 1. Close the drawer Modal FIRST
                      onClose();
                      // 2. Wait for Modal slide animation to fully dismiss,
                      //    THEN clear auth state so navigator can safely swap trees
                      setTimeout(() => logout(), 500);
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.logoutIconContainer}>
              <MaterialIcons name="logout" size={22} color="#dc2626" />
            </View>
            <Text style={styles.logoutText}>{t('Logout')}</Text>
          </TouchableOpacity>

          <Text style={{ 
            color: '#9ca3af', 
            fontSize: 11, 
            textAlign: 'center',
            paddingBottom: 16 
          }}>
            SmartWaste AI v{appJson.expo.version}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'
  },
  drawer: {
    width: width * 0.75,
    backgroundColor: '#0f172a',
    position: 'absolute', left: 0, top: 0, bottom: 0,
    paddingTop: 50,
  },
  profileSection: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 12,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    color: '#fff', fontSize: 22, fontWeight: '800',
  },
  profileInfo: { flex: 1 },
  userName: {
    color: '#ffffff', fontSize: 16, fontWeight: '700',
  },
  userRole: {
    color: '#4ade80', fontSize: 11,
    fontWeight: '600', marginTop: 2,
  },
  userEmail: {
    color: '#94a3b8', fontSize: 12, marginTop: 2,
  },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16, marginVertical: 8,
  },
  menuList: { flex: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, gap: 14,
  },
  menuIconContainer: { width: 28, alignItems: 'center' },
  menuLabel: {
    color: '#e2e8f0', fontSize: 15, fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 14,
    backgroundColor: 'rgba(220,38,38,0.1)',
    margin: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)',
  },
  logoutIconContainer: { width: 28, alignItems: 'center' },
  logoutText: {
    color: '#ef4444', fontSize: 15, fontWeight: '700',
  },
});

export default SideDrawer;
