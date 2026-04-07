import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
    ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store';
import { login as loginApi, getMe } from '../api/authApi';
import { COLORS } from '../config';

const DEMO_ACCOUNTS = {
    'collector1@smartwaste.com': { password: 'Col@123', name: 'Collector 1' },
    'collector2@smartwaste.com': { password: 'Col@123', name: 'Collector 2' },
};

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('collector'); // 'collector' or 'shg'
    const [loading, setLoading] = useState(false);
    const { login } = useStore();

    const performLogin = async (emailToUse, passwordToUse) => {
        setLoading(true);
        try {
            const tokenData = await loginApi(emailToUse, passwordToUse);
            const { access_token } = tokenData;
            await login(null, access_token);
            const user = await getMe();
            await login(user, access_token);
            // Global state drives AppNavigator, so we don't need manual navigation replace
        } catch (err) {
            const detail = err.response?.data?.detail;
            const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : 'Login failed. Check credentials.';
            Alert.alert('Login Failed', msg || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        performLogin(email, password);
    };

    const handleDemoLogin = () => {
        if (role === 'collector') {
            performLogin('collector1@smartwaste.com', 'Col@123');
        } else {
            performLogin('shg1@smartwaste.com', 'SHG@123');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>♻️</Text>
                        <Text style={styles.logoTitle}>SmartWaste AI</Text>
                        <Text style={styles.logoSubtitle}>Staff App</Text>
                        <Text style={styles.logoDesc}>
                            Rural Plastic Waste Management{'\n'}Chhattisgarh, India
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.card}>
                        <View style={styles.roleToggle}>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'collector' && styles.roleBtnActive]} 
                                onPress={() => { setRole('collector'); setEmail(''); setPassword(''); }}
                            >
                                <Text style={[styles.roleBtnText, role === 'collector' && styles.roleBtnTextActive]}>Collector</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'shg' && styles.roleBtnActive]} 
                                onPress={() => { setRole('shg'); setEmail(''); setPassword(''); }}
                            >
                                <Text style={[styles.roleBtnText, role === 'shg' && styles.roleBtnTextActive]}>SHG Member</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.cardTitle}>Sign In</Text>

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={role === 'collector' ? "collector1@smartwaste.com" : "shg1@smartwaste.com"}
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={role === 'collector' ? "Col@123" : "SHG@123"}
                            placeholderTextColor="#999"
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.loginBtnText}>Sign In</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.demoBtn}
                            onPress={handleDemoLogin}
                        >
                            <Text style={styles.demoBtnText}>Use Demo Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Guest access */}
                    <TouchableOpacity
                        style={styles.guestBtn}
                        onPress={() => navigation.navigate('PublicStack', { screen: 'PublicMap' })}
                    >
                        <Text style={styles.guestBtnText}>
                            📸  Report as Guest (No Login)
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.dark },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoEmoji: { fontSize: 64, marginBottom: 12 },
    logoTitle: { fontSize: 28, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
    logoSubtitle: { fontSize: 14, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
    logoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8, lineHeight: 18 },
    card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
    cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginBottom: 20 },
    roleToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 },
    roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    roleBtnActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    roleBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    roleBtnTextActive: { color: COLORS.mid },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: '#1a1a1a', marginBottom: 16, backgroundColor: '#FAFAFA' },
    loginBtn: { height: 52, backgroundColor: COLORS.mid, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4, shadowColor: COLORS.mid, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    demoBtn: { marginTop: 12, padding: 10, alignItems: 'center' },
    demoBtnText: { color: COLORS.mid, fontSize: 13, fontWeight: '600' },
    guestBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    guestBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});