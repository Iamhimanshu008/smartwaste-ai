import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building, MapPin, IndianRupee, Loader2, ClipboardCheck, ArrowRight, ArrowDown, Package, FileCheck, Banknote, ShieldCheck, Clock } from 'lucide-react';
import * as recyclerApi from '../api/recyclerApi';
import useStore from '../store';

export default function RecyclerPortal() {
    const { user, logout } = useStore();
    const [tab, setTab] = useState('marketplace');

    // Stats
    const [stats, setStats] = useState(null);
    useEffect(() => { recyclerApi.getRecyclerGlobalStats().then(setStats).catch(console.error); }, []);

    function Marketplace() {
        const [recyclers, setRecyclers] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            recyclerApi.getPublicRecyclers().then(setRecyclers).catch(console.error).finally(() => setLoading(false));
        }, []);

        if (loading) return <div className="skeleton h-[400px] rounded-2xl animate-fade-in" />;

        return (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-purple-700 uppercase">Total Volume</p>
                            <p className="text-2xl font-bold font-mono-data text-purple-900 mt-1">{stats?.plastic_sold_this_month_kg || 0} <span className="text-lg text-purple-600">kg</span></p>
                        </div>
                        <Package className="w-10 h-10 text-purple-200" />
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-700 uppercase">Avg Price/kg</p>
                            <p className="text-2xl font-bold font-mono-data text-emerald-900 mt-1">₹{stats?.average_price_per_kg || 0}</p>
                        </div>
                        <IndianRupee className="w-10 h-10 text-emerald-200" />
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-700 uppercase">Active Buyers</p>
                            <p className="text-2xl font-bold font-mono-data text-blue-900 mt-1">{stats?.total_active_recyclers || 0}</p>
                        </div>
                        <Building className="w-10 h-10 text-blue-200" />
                    </div>
                </div>

                {/* Facilities List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recyclers.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Building className="text-purple-600 w-5 h-5"/> {r.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{r.contact_person}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold font-mono-data border border-green-200 shadow-sm">
                                        ₹{r.price_per_kg}/kg
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1 font-mono-data">Min: {r.min_quantity_kg}kg</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 text-sm">
                                <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4"/> Zone {r.zone_id} | {r.address}</p>
                                <p className="text-gray-600 flex items-center gap-2">Accepts: <span className="capitalize">{r.accepted_types?.join(', ')}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function PartnerSetup() {
        const [form, setForm] = useState({ name: '', contact_person: '', phone: '', address: '', price_per_kg: '', min_quantity_kg: '', accepted_types: 'PET, HDPE, Mixed' });
        const [submitting, setSubmitting] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
                // In full implementation, this calls public endpoint to register as pending
                await recyclerApi.registerRecycler(form);
                toast.success('Application submitted for admin review!');
                setForm({ name: '', contact_person: '', phone: '', address: '', price_per_kg: '', min_quantity_kg: '', accepted_types: '' });
            } catch(e) { toast.error('Failed to submit application'); }
            setSubmitting(false);
        };

        return (
            <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
                {/* How it Works / Payment Flow Visualization */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 font-display text-center">SmartWaste Partnership Flow</h2>
                    
                    {/* Desktop Flow */}
                    <div className="hidden md:flex items-center justify-between gap-4 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2" />
                        
                        <FlowStep num="1" icon={ClipboardCheck} title="Register" desc="Submit facility details & pricing" color="blue" />
                        <ArrowRight className="w-6 h-6 text-gray-300 bg-white" />
                        
                        <FlowStep num="2" icon={ShieldCheck} title="Verify" desc="Admin site inspection & approval" color="purple" />
                        <ArrowRight className="w-6 h-6 text-gray-300 bg-white" />
                        
                        <FlowStep num="3" icon={Package} title="Pickup" desc="Request & receive sorted plastic" color="emerald" />
                        <ArrowRight className="w-6 h-6 text-gray-300 bg-white" />
                        
                        <FlowStep num="4" icon={Banknote} title="Payment" desc="Pay directly via bank/UPI per kg" color="orange" />
                    </div>

                    {/* Mobile Flow */}
                    <div className="flex flex-col items-center gap-6 md:hidden relative">
                        <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-100 -z-10 -translate-x-1/2" />
                        <FlowStep num="1" icon={ClipboardCheck} title="Register" desc="Submit details & pricing" color="blue" vertical />
                        <ArrowDown className="w-5 h-5 text-gray-300 bg-white" />
                        <FlowStep num="2" icon={ShieldCheck} title="Verify" desc="Admin approval" color="purple" vertical />
                        <ArrowDown className="w-5 h-5 text-gray-300 bg-white" />
                        <FlowStep num="3" icon={Package} title="Pickup" desc="Receive sorted plastic" color="emerald" vertical />
                        <ArrowDown className="w-5 h-5 text-gray-300 bg-white" />
                        <FlowStep num="4" icon={Banknote} title="Payment" desc="Direct bank/UPI transfer" color="orange" vertical />
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><FileCheck className="w-5 h-5 text-purple-600"/> Submit Facility Application</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Facility/Business Name *" className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                        <input required value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} placeholder="Contact Person Name *" className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                        <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number *" className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                        <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full Facility Address *" className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 md:col-span-2" />
                        
                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">Buying Price (₹/kg)</label>
                                <input required type="number" value={form.price_per_kg} onChange={e => setForm({...form, price_per_kg: e.target.value})} placeholder="e.g. 15" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono-data" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">Min Pickup Qty (kg)</label>
                                <input required type="number" value={form.min_quantity_kg} onChange={e => setForm({...form, min_quantity_kg: e.target.value})} placeholder="e.g. 500" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono-data" />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">Accepted Plastic Types</label>
                            <input required value={form.accepted_types} onChange={e => setForm({...form, accepted_types: e.target.value})} placeholder="e.g. PET, HDPE, Mixed" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4">
                            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl flex justify-center items-center shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all">
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Partnership Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sw-bg flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-gray-900">Recycler</span>
                            <span className="font-bold text-lg tracking-tight text-purple-600 ml-1">Portal</span>
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">{user.email}</span>
                            <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <a href="/login" className="px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                            Admin Login
                        </a>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 pb-24">
                {/* Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-2">
                    <button onClick={() => setTab('marketplace')}
                        className={`min-w-[160px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${tab === 'marketplace' ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-600 ring-offset-2' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}>
                        <Building className="w-4 h-4" /> B2B Marketplace
                    </button>
                    <button onClick={() => setTab('partner')}
                        className={`min-w-[160px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${tab === 'partner' ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-600 ring-offset-2' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}>
                        <ShieldCheck className="w-4 h-4" /> Become a Partner
                    </button>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                    {tab === 'marketplace' && <Marketplace />}
                    {tab === 'partner' && <PartnerSetup />}
                </div>
            </main>
        </div>
    );
}

// Helper for Flow UI
function FlowStep({ num, icon: Icon, title, desc, color, vertical }) {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-600 ring-blue-50 border-blue-200',
        purple: 'bg-purple-100 text-purple-600 ring-purple-50 border-purple-200',
        emerald: 'bg-emerald-100 text-emerald-600 ring-emerald-50 border-emerald-200',
        orange: 'bg-orange-100 text-orange-600 ring-orange-50 border-orange-200',
    };
    const c = colorMap[color];

    return (
        <div className={`flex flex-col items-center text-center bg-white z-10 p-2 ${vertical ? 'w-full max-w-xs' : 'w-48'} group`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ring-8 border transition-transform group-hover:scale-110 ${c}`}>
                <Icon className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                    {num}
                </div>
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
            <p className="text-xs text-gray-500 leading-tight">{desc}</p>
        </div>
    );
}
