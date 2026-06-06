import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, KeyRound, Mail, Phone, ShieldCheck, Factory, Home, User, ArrowRight } from 'lucide-react';
import useStore from '../store';
import * as authApi from '../api/authApi';
import client from '../api/client';

export default function Login() {
    // TABS: 'admin', 'pwmu', 'shg', 'collector'
    const [activeTab, setActiveTab] = useState('admin');
    
    // Auth state
    const [credentials, setCredentials] = useState({ username: '', password: '', phone: '', otp: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login } = useStore();
    const navigate = useNavigate();

    // Reset OTP state when changing tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setOtpSent(false);
        setCredentials({ username: '', password: '', phone: '', otp: '' });
    };

    // Traditional Email/Password Login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(String(credentials.username), String(credentials.password));
            login(data.user, data.access_token, data.refresh_token);
            toast.success(`Welcome back, ${data.user.full_name || 'User'}!`);
            navigate(`/${data.user.role.replace('_', '')}`);
        } catch (err) {
            toast.error(err.message || 'Invalid username or password');
        }
        setLoading(false);
    };

    // Send OTP for Phone Login
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!credentials.phone || credentials.phone.length < 10) {
            toast.error('Enter valid 10-digit phone number');
            return;
        }
        setLoading(true);
        try {
            const res = await client.post('/auth/send-otp', { phone_number: credentials.phone });
            setOtpSent(true);
            toast.success('OTP sent successfully!');
            if (res.data.dev_otp) {
                toast.success(`[DEV] OTP: ${res.data.dev_otp}`, { duration: 6000 });
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Could not send OTP');
        }
        setLoading(false);
    };

    // Verify OTP for Phone Login
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!credentials.otp || credentials.otp.length !== 6) {
            toast.error('Enter 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const res = await client.post('/auth/login-otp', {
                phone_number: credentials.phone,
                otp: credentials.otp
            });
            const { access_token, refresh_token } = res.data;
            
            // Fetch complete user object (since login-otp might only return token or incomplete user object)
            const userResponse = await client.get('/auth/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            
            login(userResponse.data, access_token, refresh_token);
            toast.success(`Welcome back!`);
            navigate(`/${userResponse.data.role.replace('_', '')}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid OTP');
        }
        setLoading(false);
    };

    const isEmailMode = activeTab === 'admin' || activeTab === 'pwmu';

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* LEFT COLUMN */}
            <div className="hidden lg:flex w-1/2 bg-[#1E3A5F] flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#0f1f33] z-0"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#16A34A] rounded-full blur-[120px] opacity-20 mix-blend-screen"></div>
                
                <div className="relative z-10 flex justify-center mt-12">
                    <img src="/logo.png" alt="Swachhata Chakra Logo" className="h-24 object-contain drop-shadow-2xl" />
                </div>
                
                <div className="relative z-10 text-center max-w-lg mx-auto mb-12">
                    <h1 className="text-5xl font-bold text-white mb-6">Welcome Back</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Sign in to access your personalized dashboard. 
                        The Swachhata Chakra Portal streamlines plastic waste management 
                        tracking, reporting, and market linkages across Chhattisgarh.
                    </p>
                </div>
                
                <div className="relative z-10 text-center text-gray-400 text-sm">
                    Need help? <a href="#" className="text-white hover:underline underline-offset-4">Contact Support</a>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col p-8 sm:p-12 justify-center shadow-2xl relative z-10">
                <div className="max-w-md w-full mx-auto">
                    
                    <div className="flex justify-center items-center gap-6 mb-10">
                        <img src="/cg-govt-logo.png" alt="CG Govt" className="h-12 w-auto" />
                        <img src="/unicef-logo.png" alt="UNICEF" className="h-10 w-auto" />
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-2">Sign In to Dashboard</h2>
                        <p className="text-gray-500 font-medium">Select your portal role to continue</p>
                    </div>

                    {/* ROLE TABS */}
                    <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button 
                            onClick={() => handleTabChange('admin')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
                        >
                            <ShieldCheck className="w-5 h-5 mb-1" />
                            <span className="text-[10px] sm:text-xs font-bold text-center">Admin / Nodal</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('pwmu')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${activeTab === 'pwmu' ? 'bg-white shadow-sm border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
                        >
                            <Factory className="w-5 h-5 mb-1" />
                            <span className="text-[10px] sm:text-xs font-bold text-center">PWMU Center</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('shg')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${activeTab === 'shg' ? 'bg-white shadow-sm border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
                        >
                            <Home className="w-5 h-5 mb-1" />
                            <span className="text-[10px] sm:text-xs font-bold text-center">Village Shed / SHG</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('collector')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${activeTab === 'collector' ? 'bg-white shadow-sm border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
                        >
                            <User className="w-5 h-5 mb-1" />
                            <span className="text-[10px] sm:text-xs font-bold text-center">Collector</span>
                        </button>
                    </div>

                    <div className="text-center text-sm font-semibold text-[#16A34A] bg-[#F0FDF4] py-2 rounded-lg mb-8 border border-green-100">
                        {activeTab === 'admin' && 'Enter admin credentials'}
                        {activeTab === 'pwmu' && 'Enter PWMU center credentials'}
                        {activeTab === 'shg' && 'Enter SHG worker phone number'}
                        {activeTab === 'collector' && 'Enter collector phone number'}
                    </div>

                    {/* FORM */}
                    {isEmailMode ? (
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E3A5F] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-gray-700">Password</label>
                                    <a href="#" className="text-xs font-semibold text-[#EA580C] hover:underline">Forgot Password?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E3A5F] transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !credentials.username || !credentials.password}
                                className="w-full mt-6 py-4 px-4 bg-[#1E3A5F] hover:bg-[#142847] text-white rounded-xl text-base font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                            
                            {activeTab === 'pwmu' && (
                                <button
                                    type="button"
                                    onClick={() => setCredentials({ username: 'recycler1@smartwaste.com', password: 'Rec@123' })}
                                    className="w-full mt-3 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    Use Demo PWMU Account
                                </button>
                            )}
                        </form>
                    ) : (
                        <form onSubmit={!otpSent ? handleSendOTP : handleVerifyOTP} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E3A5F] transition-colors" />
                                    </div>
                                    <span className="absolute inset-y-0 left-12 flex items-center text-gray-500 font-semibold border-r border-gray-200 pr-2 my-2">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength="10"
                                        disabled={otpSent}
                                        value={credentials.phone}
                                        onChange={(e) => setCredentials({ ...credentials, phone: e.target.value.replace(/\D/g, '') })}
                                        className="block w-full pl-[5.5rem] pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all disabled:opacity-50 disabled:bg-gray-100 font-medium tracking-wide"
                                        placeholder="Enter 10-digit mobile number"
                                    />
                                </div>
                            </div>

                            {otpSent && (
                                <div className="space-y-1.5 animate-fade-in">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-gray-700">Enter OTP</label>
                                        <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-semibold text-[#EA580C] hover:underline">Change Number</button>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        value={credentials.otp}
                                        onChange={(e) => setCredentials({ ...credentials, otp: e.target.value.replace(/\D/g, '') })}
                                        className="block w-full text-center tracking-[0.5em] text-2xl py-3.5 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#1E3A5F] transition-all"
                                        placeholder="••••••"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (otpSent ? credentials.otp.length !== 6 : credentials.phone.length !== 10)}
                                className="w-full mt-6 py-4 px-4 bg-[#1E3A5F] hover:bg-[#142847] text-white rounded-xl text-base font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (!otpSent ? 'Send OTP' : 'Verify & Sign In')}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <a href="/public" className="text-[#EA580C] font-bold hover:underline underline-offset-2">
                                Go to Registration Portal
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
