import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AutoText from '../components/AutoText';
import { login as loginApi, getMe } from '../api/authApi';
import client from '../api/client';
import useStore from '../store';
import { useTranslation } from '../i18n';

const LoginScreen = ({ navigation }) => {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  
  // Email mode state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone mode state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // remove in prod
  
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login } = useStore();
  const { t } = useTranslation();

  // Email login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Enter email and password');
      return;
    }
    setLoading(true);
    try {
      const tokenData = await loginApi(email, password);
      const { access_token, refresh_token } = tokenData;
      await login(null, access_token, refresh_token);
      const user = await getMe();
      await login(user, access_token, refresh_token);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Enter valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await client.post('/auth/send-otp', {
        phone_number: phone
      });
      setOtpSent(true);
      setDevOtp(res.data.dev_otp || '');
      Alert.alert(
        'OTP Sent ✅',
        `OTP sent to +91${phone}\nExpires in 10 minutes${res.data.dev_otp ? '\n\n[DEV] OTP: ' + res.data.dev_otp : ''}`
      );
    } catch (err) {
      Alert.alert(
        'Failed',
        err.response?.data?.detail || 'Could not send OTP'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Login
  const handleOtpLogin = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('/auth/login-otp', {
        phone_number: phone,
        otp: otp
      });
      const { access_token, refresh_token } = res.data;
      // Store tokens same as email login
      await login(
        res.data.user,
        access_token,
        refresh_token
      );
    } catch (err) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.detail || 'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="recycle" size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>SmartWaste AI</Text>
          <AutoText style={styles.subtitle}>Staff Login</AutoText>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'email' && styles.toggleActive]}
            onPress={() => setMode('email')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="email" size={16} color={mode === 'email' ? '#ffffff' : '#16a34a'} />
              <Text style={[
                styles.toggleText,
                mode === 'email' && styles.toggleTextActive
              ]}>Email</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'phone' && styles.toggleActive]}
            onPress={() => setMode('phone')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="phone-iphone" size={16} color={mode === 'phone' ? '#ffffff' : '#16a34a'} />
              <Text style={[
                styles.toggleText,
                mode === 'phone' && styles.toggleTextActive
              ]}><AutoText>Phone OTP</AutoText></Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Email Mode */}
        {mode === 'email' && (
          <View style={styles.formSection}>
            <AutoText style={styles.label}>Email Address</AutoText>
            <TextInput
              style={styles.input}
              placeholder="staff@smartwaste.ai"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AutoText style={styles.label}>Password</AutoText>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <AutoText style={styles.loginBtnText}>Login</AutoText>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Phone OTP Mode */}
        {mode === 'phone' && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialIcons name="flag" size={16} color="#f97316" />
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="10-digit number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {!otpSent ? (
              <TouchableOpacity
                style={[styles.otpBtn, otpLoading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={otpLoading}
              >
                {otpLoading
                  ? <ActivityIndicator color="#16a34a" />
                  : <AutoText style={styles.otpBtnText}>Send OTP</AutoText>
                }
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={styles.resendLink}
                  onPress={() => { setOtpSent(false); setOtp(''); }}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.btnDisabled]}
                  onPress={handleOtpLogin}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.loginBtnText}>Verify & Login</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                      </View>
                    )
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Back to Landing */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Landing')}
          style={styles.backLink}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={18} color="#16a34a" />
            <AutoText style={styles.backLinkText}>Back</AutoText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  scrollContent: {
    flexGrow: 1, padding: 24,
    justifyContent: 'center', minHeight: '100%'
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26, fontWeight: '800',
    color: '#14532d', marginTop: 8
  },
  subtitle: { fontSize: 14, color: '#16a34a', marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 10, alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#16a34a' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  toggleTextActive: { color: '#ffffff' },
  formSection: { gap: 8 },
  label: {
    fontSize: 13, fontWeight: '600',
    color: '#374151', marginBottom: 2, marginTop: 8
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5, borderColor: '#d1fae5',
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  phoneRow: { flexDirection: 'row', gap: 8 },
  countryCode: {
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#d1fae5',
    borderRadius: 10, paddingHorizontal: 12,
    justifyContent: 'center',
  },
  countryCodeText: { fontSize: 14, fontWeight: '600' },
  phoneInput: { flex: 1 },
  otpInput: {
    textAlign: 'center', fontSize: 22,
    fontWeight: '700', letterSpacing: 8,
  },
  loginBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  loginBtnText: {
    color: '#fff', fontSize: 16, fontWeight: '700'
  },
  otpBtn: {
    borderWidth: 2, borderColor: '#16a34a',
    borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginTop: 8,
    backgroundColor: '#f0fdf4',
  },
  otpBtnText: {
    color: '#16a34a', fontSize: 15, fontWeight: '700'
  },
  btnDisabled: { opacity: 0.6 },
  resendLink: { alignSelf: 'flex-end', marginTop: 4 },
  resendText: { color: '#16a34a', fontSize: 13 },
  backLink: { alignItems: 'center', marginTop: 24 },
  backLinkText: { color: '#16a34a', fontSize: 14 },
});

export default LoginScreen;