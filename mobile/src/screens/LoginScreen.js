import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { login as loginApi, getMe } from '../api/authApi';
import client from '../api/client';
import useStore from '../store';
import { useTranslation } from '../i18n';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [statusMsg, setStatusMsg] = useState('');
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
    setStatusMsg('Connecting to server...');
    try {
      const tokenData = await loginApi(email, password, null, (attempt) => {
        setStatusMsg(`Server waking up, retrying... (${attempt}/${2})`);
      });
      const { access_token, refresh_token } = tokenData;
      await login(null, access_token, refresh_token);
      const user = await getMe();
      await login(user, access_token, refresh_token);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
      setStatusMsg('');
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

      // Step 1: Store tokens first (same pattern as email login)
      await login(null, access_token, refresh_token);

      // Step 2: Fetch user from /auth/me for consistent role format
      const user = await getMe();

      // Step 3: Store user — AppNavigator reacts to user.role
      await login(user, access_token, refresh_token);
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
          <Image source={require('../../assets/logo.png')} style={{ width: 60, height: 60, marginBottom: 8 }} resizeMode="contain" />
          <Text style={styles.title}>Swachhata Chakra</Text>
          <Text style={styles.subtitle}>{t('staff_login')}</Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'email' && styles.toggleActive, { flexDirection: 'row', justifyContent: 'center' }]}
            onPress={() => setMode('email')}
          >
            <Ionicons name="mail-outline" size={16} color={mode === 'email' ? 'white' : '#16a34a'} />
            <Text style={[
              styles.toggleText,
              { marginLeft: 6 },
              mode === 'email' && styles.toggleTextActive
            ]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'phone' && styles.toggleActive, { flexDirection: 'row', justifyContent: 'center' }]}
            onPress={() => setMode('phone')}
          >
            <Ionicons name="phone-portrait-outline" size={16} color={mode === 'phone' ? 'white' : '#16a34a'} />
            <Text style={[
              styles.toggleText,
              { marginLeft: 6 },
              mode === 'phone' && styles.toggleTextActive
            ]}>{t('phone_otp')}</Text>
          </TouchableOpacity>
        </View>

        {/* Email Mode */}
        {mode === 'email' && (
          <View style={styles.formSection}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              placeholder="staff@swachhata.ai"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.label}>{t('password')}</Text>
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
                : <Text style={styles.loginBtnText}>{t('login')}</Text>
              }
            </TouchableOpacity>
            {statusMsg ? (
              <Text style={{ color: '#16a34a', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                {statusMsg}
              </Text>
            ) : null}
          </View>
        )}

        {/* Phone OTP Mode */}
        {mode === 'phone' && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>IN +91</Text>
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
                  : <Text style={styles.otpBtnText}>{t('send_otp')}</Text>
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
                    : <Text style={styles.loginBtnText}>Verify & Login →</Text>
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
          <Text style={styles.backLinkText}>{t('back')}</Text>
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
  logo: { fontSize: 52 },
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