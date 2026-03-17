import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Leaf, LogIn, Loader2, KeyRound, Mail, AlertCircle, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';
import useStore from '../store';
import * as authApi from '../api/authApi';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(String(credentials.username), String(credentials.password));
            login(data.user, data.access_token);
            toast.success(`Welcome back, ${data.user.full_name || 'User'}! 🌿`);
            
            navigate(`/${data.user.role.replace('_', '')}`);
        } catch (err) {
            toast.error(err.message || 'Invalid username or password');
        }
        setLoading(false);
    };



    return (
        <div className="min-h-screen bg-sw-bg flex items-center justify-center p-4 selection:bg-sw-mid selection:text-white relative overflow-hidden">
            
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulseSoft"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulseSoft" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50 animate-fade-in">
                
                {/* Visual Branding Section - Hidden on small screens */}
                <div className="hidden md:flex w-1/2 bg-sw-dark p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-sw-dark via-[#103423] to-[#0a2016] z-0"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Leaf className="w-7 h-7 text-sw-accent" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">SmartWaste<span className="text-sw-accent">AI</span></span>
                        </div>
                        
                        <h1 className="text-4xl font-display font-medium text-white leading-tight mb-6">
                            Next-gen waste management for a cleaner <span className="text-sw-accent italic">tomorrow</span>.
                        </h1>
                        <p className="text-sw-bg/80 text-lg leading-relaxed max-w-md">
                            AI-powered dashbards for real-time monitoring, route optimization, and circular economy tracking.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <ShieldCheck className="w-5 h-5 text-sw-accent" />
                            <span className="text-sm font-medium">Smart Bin Route Optimization</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 text-sw-accent" />
                            <span className="text-sm font-medium">SHG Community Analytics</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl transform translate-x-4">
                            <MapPin className="w-5 h-5 text-sw-accent" />
                            <span className="text-sm font-medium">Public Recycler Marketplace</span>
                        </div>
                    </div>
                </div>

                {/* Login Form Section */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-gray-50/50">
                    <div className="md:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-sw-dark rounded-xl flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-sw-accent" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-sw-dark">SmartWaste<span className="text-sw-mid">AI</span></span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to your staff or admin account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-sw-mid transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sw-light focus:border-sw-mid transition-all shadow-sm"
                                    placeholder="name@smartwaste.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-sw-mid transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sw-light focus:border-sw-mid transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !credentials.username || !credentials.password}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-sw-mid/20 text-sm font-bold text-white bg-sw-mid hover:bg-sw-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sw-light transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Public Map Link */}
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <div className="text-center">
                            <a href="/public" className="text-sm font-medium text-sw-mid hover:text-sw-dark hover:underline underline-offset-4 flex items-center justify-center gap-1">
                                View Public Map <MapPin className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
