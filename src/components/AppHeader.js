import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView
} from 'react-native';
import { useTranslation } from '../i18n';
import LanguagePickerModal from './LanguagePickerModal';

const AppHeader = ({ title, onMenuPress, notificationCount = 0, navigation }) => {
  const [showLangPicker, setShowLangPicker] = useState(false);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Left — Hamburger */}
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={onMenuPress}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>

        {/* Center — Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title || 'SmartWaste AI'}
        </Text>

        {/* Right — Lang + Bell */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowLangPicker(true)}
          >
            <Text style={styles.langIcon}>🌐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation?.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <LanguagePickerModal
        visible={showLangPicker}
        onClose={() => setShowLangPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#052e16' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#052e16',
  },
  iconBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  hamburgerLine: {
    width: 20, height: 2,
    backgroundColor: '#ffffff',
    marginVertical: 2, borderRadius: 2,
  },
  title: {
    flex: 1, color: '#ffffff',
    fontSize: 16, fontWeight: '700',
    textAlign: 'center', marginHorizontal: 8,
  },
  rightIcons: { flexDirection: 'row', gap: 8 },
  langIcon: { fontSize: 20 },
  bellIcon: { fontSize: 20 },
  badge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: {
    color: '#fff', fontSize: 9, fontWeight: '800',
  },
});

export default AppHeader;
