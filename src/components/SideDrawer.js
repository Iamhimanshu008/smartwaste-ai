import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Dimensions, ScrollView, Alert
} from 'react-native';
import { useTranslation } from '../i18n';
import useStore from '../store';
import { checkForUpdate } from '../utils/updateChecker';
import appJson from '../../app.json';

const { width } = Dimensions.get('window');

const SideDrawer = ({ visible, onClose, user, navigation }) => {
  const { t } = useTranslation();
  const logout = useStore(state => state.logout);

  const menuItems = [
    { icon: '🏠', key: 'dashboard', screen: 'Home' },
    { icon: '🗺️', key: 'my_route', screen: 'Map' },
    { icon: '📊', key: 'stats', screen: 'Stats' },
    { icon: '📋', key: 'history', screen: 'History' },
    { icon: '🦺', key: 'Safety Checklist', screen: 'SafetyChecklist' },
    { icon: '📰', key: 'Swachhta Samachar', screen: 'NewsFeed' },
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
                <Text style={styles.menuIcon}>{item.icon}</Text>
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
            <Text style={styles.menuIcon}>🔄</Text>
            <Text style={styles.menuLabel}>{t('check_for_updates') || 'Check for Updates'}</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert(
                t('logout'),
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: t('logout'),
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
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>{t('logout')}</Text>
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
  menuIcon: { fontSize: 20, width: 28 },
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
  logoutIcon: { fontSize: 20 },
  logoutText: {
    color: '#ef4444', fontSize: 15, fontWeight: '700',
  },
});

export default SideDrawer;
