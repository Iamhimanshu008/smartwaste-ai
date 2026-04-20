import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, StatusBar, Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />
      
      {/* Background gradient effect */}
      <View style={styles.bgTop} />
      
      {/* Logo + Title */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>♻️</Text>
        </View>
        <Text style={styles.appName}>SmartWaste AI</Text>
        <Text style={styles.tagline}>
          Revolutionizing Rural{'\n'}Waste Management
        </Text>
        <Text style={styles.subtitle}>
          AI-powered collection routes • Real-time bin tracking{'\n'}
          Community reporting • Recycler marketplace
        </Text>
      </View>
      
      {/* Feature Pills */}
      <View style={styles.pillsRow}>
        {['🤖 AI Vision', '🗺️ GPS Routes', '📊 Analytics'].map((f, i) => (
          <View key={i} style={styles.pill}>
            <Text style={styles.pillText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>100+</Text>
          <Text style={styles.statLabel}>Bins Tracked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>4</Text>
          <Text style={styles.statLabel}>Zones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>AI</Text>
          <Text style={styles.statLabel}>Powered</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>🚀 Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('PublicStack')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>
            📸 Report a Bin (No Login Required)
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          For authorized staff only • SmartWaste AI V2
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#052e16',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  bgTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.5,
    backgroundColor: '#14532d',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 90, height: 90,
    borderRadius: 45,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#86efac',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#bbf7d0',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.85,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(22,163,74,0.3)',
    borderWidth: 1,
    borderColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#86efac',
    marginTop: 2,
  },
  statDivider: {
    width: 1, height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: '#4ade80',
    opacity: 0.7,
    textAlign: 'center',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#4ade80',
    paddingVertical: 13,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryBtnText: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LandingScreen;
