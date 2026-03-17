import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, ClipboardCheck, MapPin, BarChart3, X, CheckCircle, XCircle, Building, Phone, Flame, Thermometer, Search, Filter, Sparkles, Leaf } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EcoQuote from '../components/EcoQuote';
import KPICard from '../components/cards/KPICard';
import StatusBadge from '../components/StatusBadge';
import AIAnalysisModal from '../components/AIAnalysisModal';
import ReportCard from '../components/ReportCard';
import MapBase from '../components/Map/MapBase';
import BinMarker from '../components/Map/BinMarker';
import HeatmapLayer, { HeatmapLegend } from '../components/Map/HeatmapLayer';
import useStore from '../store';
import * as subadminApi from '../api/subadminApi';
import * as recyclerApi from '../api/recyclerApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SubAdminDashboard() {
    const [tab, setTab] = useState('pending');
    const { sidebarOpen } = useStore();
    const [showAI, setShowAI] = useState(false);

    const tabs = [
        { key: 'pending', label: 'Pending', icon: ClipboardCheck },
        { key: 'verified', label: 'Verified', icon: CheckCircle },
        { key: 'rejected', label: 'Rejected', icon: XCircle },
        { key: 'map', label: 'Zone Map', icon: MapPin },
        { key: 'recyclers', label: 'Recyclers', icon: Building },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    function ReportsTab({ status }) {
        const [reports, setReports] = useState([]);
        const [loading, setLoading] = useState(true);
        const [rejectModal, setRejectModal] = useState(null);
        const [rejectReason, setRejectReason] = useState('');
        const [refresh, setRefresh] = useState(0);
        const [searchQuery, setSearchQuery] = useState('');
        const [urgencyFilter, setUrgencyFilter] = useState('all');

        useEffect(() => {
            const loadReports = async () => {
                setLoading(true);
                try {
                    const data = await subadminApi.getReports(status);
                    setReports(data || []);
                } catch (e) { console.error(e); }
                setLoading(false);
            };
            loadReports();
        }, [status, refresh]);

        // Auto-refresh
        useEffect(() => {
            const interval = setInterval(() => setRefresh(r => r + 1), 30000);
            return () => clearInterval(interval);
        }, []);

        const handleVerify = async (id) => {
            try {
                const res = await subadminApi.verifyReport(id, { action: 'approve' });
                setRefresh((r) => r + 1);
                if (res.route_optimized) {
                    toast.success('🚀 Route Auto-Optimized! ' + (res.message || ''), { duration: 5000 });
                } else {
                    toast.success(res.message || 'Report verified successfully');
                }
            } catch (e) { toast.error('Verification failed'); }
        };

        const handleReject = async () => {
            if (!rejectModal) return;
            try {
                await subadminApi.verifyReport(rejectModal, { action: 'reject', notes: rejectReason });
                setRejectModal(null);
                setRejectReason('');
                setRefresh((r) => r + 1);
                toast.success('Report rejected');
            } catch (e) { toast.error('Rejection failed'); }
        };

        if (loading) return <LoadingSkeleton />;

        const filteredReports = reports.filter(r => {
            const matchesSearch = !searchQuery || 
                (r.bin_label || r.bin_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.reporter_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
            return matchesSearch && matchesUrgency;
        });

        if (reports.length === 0) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <Leaf className="w-16 h-16 text-sw-accent mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No {status} reports — zone is clean! 🌿</p>
                </div>
            );
        }

        return (
            <div className="animate-fade-in">
                {/* Filter Bar */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex-1 relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            placeholder="Search by bin name or reporter..." 
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sw-light outline-none text-sm bg-white" 
                        />
                    </div>
                    <select 
                        value={urgencyFilter} 
                        onChange={(e) => setUrgencyFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                    >
                        <option value="all">All Urgency</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl">
                        <Sparkles className="w-4 h-4" /> AI Analyze
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 font-display">{status.charAt(0).toUpperCase() + status.slice(1)} Reports</h2>
                    <span className="px-2.5 py-0.5 bg-sw-gold text-white text-xs font-bold rounded-full">{filteredReports.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReports.map((r) => (
                        <ReportCard key={r.id} report={r} onVerify={handleVerify} onReject={(id) => setRejectModal(id)} />
                    ))}
                </div>

                {/* Reject Modal */}
                {rejectModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold">Reject Report</h3>
                                <button onClick={() => setRejectModal(null)}><X className="w-5 h-5" /></button>
                            </div>
                            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection (optional)..."
                                className="w-full px-3 py-2 border rounded-xl text-sm mb-4 h-24 resize-none focus:ring-2 focus:ring-red-300 outline-none" />
                            <button onClick={handleReject} className="w-full py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors">Reject Report</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function ZoneMap() {
        const [bins, setBins] = useState([]);
        const [loading, setLoading] = useState(true);
        const [mapMode, setMapMode] = useState('markers');

        useEffect(() => {
            const load = async () => {
                try { setBins(await subadminApi.getBins()); } catch (e) { console.error(e); }
                setLoading(false);
            };
            load();
        }, []);

        if (loading) return <LoadingSkeleton />;

        const avgFill = bins.length > 0 ? bins.reduce((sum, b) => sum + (b.fill_level ?? 0), 0) / bins.length : 0;
        const zoneTemp = avgFill >= 70 ? 'HIGH' : avgFill >= 40 ? 'MEDIUM' : 'LOW';
        const zoneTempClass = zoneTemp === 'HIGH' ? 'high' : zoneTemp === 'MEDIUM' ? 'medium' : 'low';

        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                        <button onClick={() => setMapMode('markers')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapMode === 'markers' ? 'bg-white shadow-sm text-sw-mid' : 'text-gray-500 hover:text-gray-700'}`}>
                            <MapPin className="w-3.5 h-3.5" /> Map View
                        </button>
                        <button onClick={() => setMapMode('heatmap')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapMode === 'heatmap' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Flame className="w-3.5 h-3.5" /> Heatmap View
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`zone-temp-badge ${zoneTempClass}`}>
                            <Thermometer className="w-4 h-4" /> Zone Temperature: {zoneTemp}
                        </div>
                        <span className="text-xs text-gray-400 font-mono-data">Avg fill: {Math.round(avgFill)}%</span>
                    </div>
                </div>
                <div style={{ height: '600px' }} className="rounded-2xl overflow-hidden border border-gray-100 relative">
                    <MapBase>
                        {mapMode === 'markers' && bins?.map((bin) => {
                            let markerStatus = 'empty';
                            if (bin.fill_level >= 80) markerStatus = 'high';
                            else if (bin.fill_level >= 50) markerStatus = 'medium';
                            else if (bin.fill_level >= 20) markerStatus = 'low';
                            return (
                                <BinMarker key={bin.id} bin={{ id: bin.id, label: bin.name || bin.label, latitude: bin.latitude, longitude: bin.longitude, status: markerStatus, fill_level: bin.fill_level, address: bin.address }} />
                            );
                        })}
                        {mapMode === 'heatmap' && <HeatmapLayer bins={bins} />}
                    </MapBase>
                    {mapMode === 'heatmap' && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
                            <HeatmapLegend />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    function ZoneAnalytics() {
        const [stats, setStats] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const load = async () => {
                try { setStats(await subadminApi.getAnalytics()); } catch (e) { console.error(e); }
                setLoading(false);
            };
            load();
        }, []);

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Pending Reports" value={stats?.pending_reports || 0} icon={ClipboardCheck} color="sw-gold" />
                    <KPICard title="Verified Today" value={stats?.verified_today || 0} icon={CheckCircle} color="sw-mid" />
                    <KPICard title="Rejected Today" value={stats?.rejected_today || 0} icon={XCircle} color="red" />
                    <KPICard title="Bins Needing Collection" value={stats?.bins_needing_collection || 0} icon={MapPin} color="sw-light" />
                </div>
            </div>
        );
    }

    function RecyclersTab() {
        const [recyclers, setRecyclers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [showPickup, setShowPickup] = useState(null);
        const [pickupForm, setPickupForm] = useState({ quantity_kg: '', notes: '' });
        const [pickupSubmitting, setPickupSubmitting] = useState(false);

        useEffect(() => { loadData(); }, []);

        const loadData = async () => {
            setLoading(true);
            try { setRecyclers(await recyclerApi.getPublicRecyclers()); } catch (e) { console.error(e); }
            setLoading(false);
        };

        const handleRequestPickup = async (e) => {
            e.preventDefault();
            setPickupSubmitting(true);
            try {
                await recyclerApi.requestPickup(showPickup, pickupForm.quantity_kg, pickupForm.notes);
                toast.success("Pickup requested!");
                setShowPickup(null);
                setPickupForm({ quantity_kg: '', notes: '' });
                loadData();
            } catch(e) { toast.error("Pickup request failed"); }
            setPickupSubmitting(false);
        };

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 font-display">Available Recyclers</h2>
                </div>
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
                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold font-mono-data">₹{r.price_per_kg}/kg</span>
                                    <p className="text-xs text-gray-500 mt-1">Min: {r.min_quantity_kg}kg</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 text-sm">
                                <p className="text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4"/> {r.phone}</p>
                                <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4"/> {r.zone_name}</p>
                            </div>
                            <button onClick={() => setShowPickup(r.id)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-xl transition-colors">Request Pickup</button>
                        </div>
                    ))}
                    {recyclers.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        No active recyclers found.
                    </div>}
                </div>

                {showPickup && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-gray-900">Request Pickup</h3>
                                <button onClick={() => setShowPickup(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleRequestPickup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg) *</label>
                                    <input required type="number" step="0.5" value={pickupForm.quantity_kg} onChange={(e) => setPickupForm({...pickupForm, quantity_kg: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 150" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea rows={3} value={pickupForm.notes} onChange={(e) => setPickupForm({...pickupForm, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                </div>
                                <button disabled={pickupSubmitting} type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl flex justify-center items-center shadow-lg shadow-purple-600/20">
                                    {pickupSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Send Request to Recycler'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-sw-bg">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 main-content-mobile ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-6">
                    <EcoQuote />
                    <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit overflow-x-auto">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            return (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-sw-mid text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <Icon className="w-4 h-4" /> {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {tab === 'pending' && <ReportsTab status="pending" />}
                    {tab === 'verified' && <ReportsTab status="verified" />}
                    {tab === 'rejected' && <ReportsTab status="rejected" />}
                    {tab === 'map' && <ZoneMap />}
                    {tab === 'recyclers' && <RecyclersTab />}
                    {tab === 'analytics' && <ZoneAnalytics />}
                </div>
            </main>
            <AIAnalysisModal isOpen={showAI} onClose={() => setShowAI(false)} />
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
            </div>
        </div>
    );
}
