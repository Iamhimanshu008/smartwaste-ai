import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { completeProfile, getMe } from '../../api/authApi';
import useStore from '../../store';

const CitizenOnboardingScreen = () => {
  const { user, login } = useStore();
  const [fullName, setFullName] = useState('');
  const [houseId, setHouseId] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phone_number || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName || !houseId || !wardNo || !phoneNumber) {
      Alert.alert('Error', 'Sabhi fields bharna zaroori hai (All fields are required)');
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Phone number 10 digits ka hona chahiye');
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        full_name: fullName,
        house_id: houseId,
        ward_no: parseInt(wardNo, 10),
        phone_number: phoneNumber
      });
      
      // Fetch updated user and update store
      const updatedUser = await getMe();
      await login(updatedUser, useStore.getState().token, useStore.getState().refreshToken);
      
      // Store update will automatically trigger navigation via AppNavigator
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Profile save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert(
      'Skip Profile',
      'Aap baad mein profile complete kar sakte hain (You can complete your profile later).',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: async () => {
            // Trick AppNavigator by artificially setting house_id temporarily, 
            // OR we can just update the user's name to not be 'Citizen' to bypass the check.
            try {
               await completeProfile({ full_name: 'Skipped_Profile' });
               const updatedUser = await getMe();
               await login(updatedUser, useStore.getState().token, useStore.getState().refreshToken);
            } catch (e) {
               // If it fails, just ignore
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us find your house for waste collection</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Aapka poora naam (Your full name)"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>House ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW-HOUSE-1045"
            value={houseId}
            onChangeText={setHouseId}
            autoCapitalize="characters"
          />
          <Text style={styles.helperText}>Yeh aapke QR card pe likha hai</Text>

          <Text style={styles.label}>Ward Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Ward number (1-50)"
            value={wardNo}
            onChangeText={setWardNo}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.btnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save & Continue →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  formSection: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: -4,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipBtn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  skipBtnText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});

export default CitizenOnboardingScreen;
