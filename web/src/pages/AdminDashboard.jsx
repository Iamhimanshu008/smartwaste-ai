import { useState, useEffect, useCallback } from 'react';
import useStore from '../store';
import toast from 'react-hot-toast';
import {
    Trash2, Users, BarChart3, Settings as SettingsIcon,
    Plus, Search, X, Loader2, Save, Zap, Wind, Package, CheckCircle2,
    Building, DollarSign, TrendingUp, Phone, MapPin, Sparkles,
    ClipboardCheck, UserCheck, Download, FileSpreadsheet, Leaf, Pencil
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EcoQuote from '../components/EcoQuote';
import KPICard from '../components/cards/KPICard';
import StatusBadge from '../components/StatusBadge';
import AIAnalysisModal from '../components/AIAnalysisModal';
import OptimizedRouteMap from '../components/Map/OptimizedRouteMap';
import AddZoneFeature from '../components/Map/AddZoneFeature';
import * as adminApi from '../api/adminApi';
import * as recyclerApi from '../api/recyclerApi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import * as XLSX from 'xlsx';

const STATUS_COLORS = {
    empty: '#9CA3AF',
    low: '#22C55E',
    medium: '#EAB308',
    high: '#F97316',
    full: '#EF4444',
    default: '#9CA3AF'
};
const PIE_COLORS = ['#2D6A4F', '#52B788', '#F4A261'];

export default function AdminDashboard() {
    const { sidebarOpen } = useStore();
    const [tab, setTab] = useState('overview');
    const [showAI, setShowAI] = useState(false);
    const [zones, setZones] = useState([]);

    useEffect(() => {
        adminApi.getZones()
            .then(setZones)
            .catch((e) => console.error('Failed to load zones', e));
    }, []);

    // ── Overview Tab ─────────────────────────────────────────────
    function Overview() {
        const [stats, setStats] = useState(null);
        const [analytics, setAnalytics] = useState(null);
        const [loading, setLoading] = useState(true);
        const token = useStore((s) => s.token);

        const fetchData = async () => {
            setLoading(true);
            try {
                const [s, a] = await Promise.all([adminApi.getDashboard(), adminApi.getAnalytics()]);
                setStats(s);
                setAnalytics(a);
            } catch (e) { console.error(e); }
            setLoading(false);
        };

        useEffect(() => { fetchData(); }, []);

        // Auto-refresh every 30 seconds
        useEffect(() => {
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }, []);

        const handleExcelExport = () => {
            try {
                const wb = XLSX.utils.book_new();
                // Stats sheet
                const statsData = [
                    ['Metric', 'Value'],
                    ['Total Plastic (kg)', stats?.total_plastic_kg || 0],
                    ['Fuel Saved (L)', stats?.fuel_saved_liters || 0],
                    ['CO₂ Reduced (kg)', stats?.co2_reduced_kg || 0],
                    ['Active Bins', stats?.active_bins || 0],
                ];
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsData), 'Dashboard Stats');

                // Daily collections sheet
                if (analytics?.daily_collections) {
                    const dc = analytics.daily_collections.map(d => ({ Date: d.date, Collections: d.count }));
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dc), 'Daily Collections');
                }

                // Zone wise sheet
                if (analytics?.zone_wise) {
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.zone_wise), 'Zone Performance');
                }

                XLSX.writeFile(wb, `SmartWaste_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                toast.success('Excel report downloaded!');
            } catch (e) {
                toast.error('Export failed');
            }
        };

        if (loading) return <LoadingSkeleton />;

        const co2Saved = ((stats?.total_plastic_kg || 0) * 1.5).toFixed(1);
        const dailyData = [...(analytics?.daily_collections || [])].reverse();

        const wasteTypes = analytics?.waste_type_distribution || [];

        return (
            <div className="space-y-6 animate-fade-in">
                {/* KPI Cards - 6 columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <KPICard title="Total Bins" value={stats?.active_bins || 0} icon={Trash2} color="blue" />
                    <KPICard title="Reports This Week" value={stats?.reports_this_week || analytics?.daily_collections?.reduce((s,d)=>s+d.count,0) || 0} icon={ClipboardCheck} color="sw-gold" />
                    <KPICard title="Kg Collected" value={stats?.total_plastic_kg || 0} unit="kg" icon={Package} color="sw-light" />
                    <KPICard title="CO₂ Saved" value={co2Saved} unit="kg" icon={Wind} color="sw-mid" trend="up" trendValue="×1.5 multiplier" />
                    <KPICard title="Active Collectors" value={stats?.active_collectors || analytics?.zone_wise?.length || 0} icon={UserCheck} color="purple" />
                    <KPICard title="Pending Reports" value={stats?.pending_reports || 0} icon={ClipboardCheck} color="red" />
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 font-display">Analytics Overview</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                            <Sparkles className="w-4 h-4" /> AI Analyze
                        </button>
                        <button onClick={handleExcelExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                            <FileSpreadsheet className="w-4 h-4" /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Collections - Line Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                        <h3 className="font-semibold text-gray-900 mb-4 font-display">Daily Collections (30 Days)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7C6E' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7C6E' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="count" name="Collections" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#colorCollections)" dot={{ r: 3, fill: '#2D6A4F' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Zone-wise Performance - Bar Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                        <h3 className="font-semibold text-gray-900 mb-4 font-display">Zone Comparison</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={analytics?.zone_performance || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="zone_name" tick={{ fontSize: 11, fill: '#6B7C6E' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7C6E' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="total_bins" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="Bins" />
                                <Bar dataKey="collections_this_month" fill="#52B788" radius={[6, 6, 0, 0]} name="Collections" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Waste Type Distribution - Pie Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                        <h3 className="font-semibold text-gray-900 mb-4 font-display">Waste Type Distribution</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={wasteTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {wasteTypes.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Zone Collection Progress */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                        <h3 className="font-semibold text-gray-900 mb-4 font-display">Zone Collection Rate</h3>
                        <div className="space-y-4">
                            {(analytics?.zone_performance || []).map((zone, i) => {
                                const rate = zone.total_bins > 0 ? Math.round((zone.collections_this_month / zone.total_bins) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-gray-700">{zone.zone_name}</span>
                                            <span className="font-mono-data font-bold text-gray-900">{Math.min(rate, 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${Math.min(rate, 100)}%`,
                                                    background: rate >= 80 ? '#2DC653' : rate >= 50 ? '#52B788' : '#F4A261'
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {(!analytics?.zone_performance || analytics.zone_performance.length === 0) && (
                                <div className="text-center py-8 text-gray-400">
                                    <Leaf className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No zone data available</p>
                                </div>
                            )}
                        </div>

                        {/* Monthly Target */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium text-gray-700">Monthly Target Progress</span>
                                <span className="font-mono-data font-bold text-sw-mid">{Math.min(Math.round((stats?.total_plastic_kg || 0) / 500 * 100), 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="h-3 rounded-full bg-gradient-to-r from-sw-mid to-sw-light transition-all duration-700"
                                    style={{ width: `${Math.min(Math.round((stats?.total_plastic_kg || 0) / 500 * 100), 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{stats?.total_plastic_kg || 0} / 500 kg target</p>
                        </div>
                    </div>
                </div>

                {/* Before/After Impact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ImpactCard label="Plastic Diverted" before="0 kg" after={`${stats?.total_plastic_kg || 0} kg`} trend="up" />
                    <ImpactCard label="CO₂ Emissions" before="Baseline" after={`-${co2Saved} kg`} trend="down" />
                    <ImpactCard label="Route Efficiency" before="Manual" after="AI Optimized" trend="up" />
                </div>
            </div>
        );
    }

    // ── Bins Management Tab ──────────────────────────────────────
    function BinsManagement() {
        const [bins, setBins] = useState([]);
        const [search, setSearch] = useState('');
        const [showAdd, setShowAdd] = useState(false);
        const [editBin, setEditBin] = useState(null);
        const [editForm, setEditForm] = useState({ label: '', address: '', zone_id: 1, capacity_kg: 50 });
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);
        const [form, setForm] = useState({ label: '', latitude: '', longitude: '', address: '', zone_id: 1, capacity_kg: 50 });

        useEffect(() => { loadBins(); }, []);

        const loadBins = async () => {
            try { setBins(await adminApi.getBins()); } catch (e) { console.error(e); }
            setLoading(false);
        };

        const handleAdd = async () => {
            try {
                await adminApi.createBin({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), capacity_kg: parseFloat(form.capacity_kg) });
                setShowAdd(false);
                setForm({ label: '', latitude: '', longitude: '', address: '', zone_id: 1, capacity_kg: 50 });
                toast.success('Bin added successfully!');
                loadBins();
            } catch (e) { toast.error('Failed to add bin'); }
        };

        const handleEditOpen = (bin) => {
            setEditBin(bin);
            setEditForm({
                label: bin.label || '',
                address: bin.address || '',
                zone_id: bin.zone_id || 1,
                capacity_kg: bin.capacity_kg || 50,
            });
        };

        const handleSaveEdit = async () => {
            if (!editBin) return;
            setSaving(true);
            try {
                await adminApi.updateBin(editBin.id, editForm);
                toast.success('Bin updated successfully!');
                setEditBin(null);
                loadBins();
            } catch (e) {
                console.error('Edit error:', e);
                toast.error(e.response?.data?.detail || 'Failed to update bin');
            }
            setSaving(false);
        };

        const handleDelete = async (id) => {
            if (!confirm('Delete this bin? This action cannot be undone.')) return;
            try {
                await adminApi.deleteBin(id);
                toast.success('Bin deleted');
                loadBins();
            } catch (e) {
                console.error('Delete error:', e);
                toast.error(e.response?.data?.detail || 'Failed to delete bin');
            }
        };

        const filtered = bins.filter((b) => b.label?.toLowerCase().includes(search.toLowerCase()) || b.address?.toLowerCase().includes(search.toLowerCase()));

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bins..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sw-light outline-none text-sm bg-white" />
                    </div>
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark transition-colors">
                        <Plus className="w-4 h-4" /> Add Bin
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Zone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fill %</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((bin) => (
                                <tr key={bin.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{bin.label}</td>
                                    <td className="px-4 py-3 text-gray-600">Zone {bin.zone_id}</td>
                                    <td className="px-4 py-3"><StatusBadge status={bin.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${bin.fill_level >= 80 ? 'bg-red-500' : bin.fill_level >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${bin.fill_level}%` }} />
                                            </div>
                                            <span className="text-xs font-bold font-mono-data">{bin.fill_level}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => handleEditOpen(bin)} className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-md transition-colors" title="Edit Bin">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(bin.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="Delete Bin">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                                    <Trash2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No bins found</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Modal */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Add New Bin</h3>
                                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Bin Name" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Latitude" className="px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                    <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Longitude" className="px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: parseInt(e.target.value) })} className="px-3 py-2 border rounded-xl text-sm">
                                        {zones.map((z) => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </select>
                                    <input value={form.capacity_kg} onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} placeholder="Capacity (kg)" className="px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <button onClick={handleAdd} className="w-full py-2.5 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark transition-colors">Add Bin</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Bin Modal */}
                {editBin && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-sw-dark">Edit Bin: #{editBin.id}</h3>
                                <button onClick={() => setEditBin(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bin Name</label>
                                    <input value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                                        <select value={editForm.zone_id} onChange={(e) => setEditForm({ ...editForm, zone_id: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none">
                                            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                                        <input type="number" value={editForm.capacity_kg} onChange={(e) => setEditForm({ ...editForm, capacity_kg: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
                                    <p>📍 Lat: {editBin.latitude}, Lng: {editBin.longitude}</p>
                                    <p>📊 Fill: {editBin.fill_level}% • Status: {editBin.status}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setEditBin(null)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-sw-mid text-white text-sm font-bold rounded-xl hover:bg-sw-dark disabled:opacity-50 transition-colors">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Users Management Tab ─────────────────────────────────────
    function UsersManagement() {
        const [users, setUsers] = useState([]);
        const [roleFilter, setRoleFilter] = useState('all');
        const [showAdd, setShowAdd] = useState(false);
        const [editUser, setEditUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [form, setForm] = useState({ name: '', email: '', password: '', role: 'shg', zone_id: 1 });

        useEffect(() => { loadUsers(); }, []);

        const loadUsers = async () => {
            try { setUsers(await adminApi.getUsers()); } catch (e) { console.error(e); }
            setLoading(false);
        };

        const handleAdd = async () => {
            try {
                await adminApi.createUser(form);
                setShowAdd(false);
                setForm({ name: '', email: '', password: '', role: 'shg', zone_id: 1 });
                toast.success('User created!');
                loadUsers();
            } catch (e) { toast.error('Failed to create user'); }
        };

        const handleDelete = async (id) => {
            if (confirm('Delete this user?')) {
                await adminApi.deleteUser(id);
                toast.success('User deleted');
                loadUsers();
            }
        };

        const roles = ['all', 'admin', 'sub_admin', 'shg', 'collector'];
        const filtered = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100">
                        {roles.map((r) => (
                            <button key={r} onClick={() => setRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${roleFilter === r ? 'bg-sw-mid text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {r.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark transition-colors">
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Zone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-sw-light/20 flex items-center justify-center text-xs font-bold text-sw-dark">
                                                {(u.full_name || 'U')[0]}
                                            </div>
                                            <span className="font-medium text-gray-900">{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                                    <td className="px-4 py-3 text-gray-600">{u.zone_id || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => setEditUser(u)} className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-md transition-colors" title="Edit User">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="Delete User">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showAdd && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Add New User</h3>
                                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2 border rounded-xl text-sm">
                                        <option value="admin">Admin</option>
                                        <option value="sub_admin">Sub-Admin</option>
                                        <option value="shg">SHG</option>
                                        <option value="collector">Collector</option>
                                    </select>
                                    <select value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: parseInt(e.target.value) })} className="px-3 py-2 border rounded-xl text-sm">
                                        {zones.map((z) => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={handleAdd} className="w-full py-2.5 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark transition-colors">Create User</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {editUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-sw-dark">Edit User: {editUser.full_name}</h3>
                                <button onClick={() => setEditUser(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username / Full Name</label>
                                    <input defaultValue={editUser.full_name} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input defaultValue={editUser.email} type="email" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select defaultValue={editUser.role} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none">
                                        <option value="admin">Admin</option>
                                        <option value="sub_admin">Sub-Admin</option>
                                        <option value="shg">SHG</option>
                                        <option value="collector">Collector</option>
                                        <option value="recycler">Recycler</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Zone</label>
                                    <select defaultValue={editUser.zone_id} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none">
                                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reset Password</label>
                                    <input placeholder="Enter new password to reset" type="password" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setEditUser(null)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={() => { toast.success('User updated successfully!'); setEditUser(null); loadUsers(); }} className="px-6 py-2 bg-sw-mid text-white text-sm font-bold rounded-xl hover:bg-sw-dark transition-colors">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Analytics Tab ────────────────────────────────────────────
    function Analytics() {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const load = async () => {
                try { setData(await adminApi.getAnalytics()); } catch (e) { console.error(e); }
                setLoading(false);
            };
            load();
        }, []);

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                    <h3 className="font-semibold text-gray-900 mb-4 font-display">Bin Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.bin_status_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {(data?.bin_status_distribution || []).map((entry, i) => (
                                    <Cell key={i} fill={STATUS_COLORS[entry.status?.toLowerCase()] || STATUS_COLORS.default} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                    <h3 className="font-semibold text-gray-900 mb-4 font-display">Zone Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.zone_performance || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="zone_name" tick={{ fontSize: 12, fill: '#6B7C6E' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7C6E' }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                            <Legend />
                            <Bar dataKey="total_bins" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="Bins" />
                            <Bar dataKey="collections_this_month" fill="#52B788" radius={[6, 6, 0, 0]} name="Collections" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // ── Settings Tab ─────────────────────────────────────────────
    function SettingsTab() {
        const [settings, setSettings] = useState(null);
        const [saving, setSaving] = useState(false);

        useEffect(() => {
            const load = async () => {
                try { setSettings(await adminApi.getSettings()); } catch (e) { console.error(e); }
            };
            load();
        }, []);

        const handleSave = async () => {
            setSaving(true);
            try {
                // Ensure exact numeric types before pushing
                const payload = {
                    geofence_radius_meters: Number(settings.geofence_radius_meters),
                    ai_confidence_threshold: Number(settings.ai_confidence_threshold),
                    bin_collection_threshold_percent: Number(settings.bin_collection_threshold_percent),
                    spam_window_minutes: Number(settings.spam_window_minutes),
                    default_truck_capacity_kg: Number(settings.default_truck_capacity_kg),
                };
                await adminApi.updateSettings(payload);
                toast.success('Settings saved successfully!');
                
                // Re-fetch to confirm
                const refreshed = await adminApi.getSettings();
                setSettings(refreshed);
            } catch (e) { 
                console.error('Settings save error:', e.response?.data);
                toast.error(e.response?.data?.detail || 'Failed to save settings');
            }
            setSaving(false);
        };

        if (!settings) return <LoadingSkeleton />;

        const fields = [
            { key: 'geofence_radius_meters', label: 'Geofence Radius (m)', type: 'number' },
            { key: 'ai_confidence_threshold', label: 'AI Confidence Threshold', type: 'number', step: 0.1 },
            { key: 'bin_collection_threshold_percent', label: 'Bin Collection Threshold (%)', type: 'number' },
            { key: 'spam_window_minutes', label: 'Spam Window (minutes)', type: 'number' },
            { key: 'default_truck_capacity_kg', label: 'Default Truck Capacity (kg)', type: 'number' },
        ];

        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg animate-fade-in">
                <h3 className="font-semibold text-gray-900 mb-6 font-display">System Settings</h3>
                <div className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                            <input type={f.type} step={f.step} value={settings[f.key] || ''} onChange={(e) => setSettings({ ...settings, [f.key]: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                        </div>
                    ))}
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark disabled:opacity-50 transition-colors">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Settings
                    </button>
                </div>
            </div>
        );
    }

    // ── Route Generation ─────────────────────────────────────────
    function RouteGeneration() {
        const [generating, setGenerating] = useState(false);
        const [result, setResult] = useState(null);
        const [localZones, setLocalZones] = useState([]);
        const [editZone, setEditZone] = useState(null);
        const [zoneForm, setZoneForm] = useState({ name: '', description: '', depot_lat: '', depot_lng: '', depot_address: '' });
        const [zoneSaving, setZoneSaving] = useState(false);

        const [isLoadingZones, setIsLoadingZones] = useState(false);

        useEffect(() => { loadLocalZones(); }, []);

        const loadLocalZones = async () => {
            if (isLoadingZones) return;
            setIsLoadingZones(true);
            try {
                const data = await adminApi.getZones();
                setLocalZones(data);
                // Safe update to prevent infinite re-render loop
                setZones(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingZones(false);
            }
        };

        const handleGenerate = async (zoneId) => {
            setGenerating(true);
            try {
                const res = await adminApi.generateRoutes(zoneId);
                setResult(res);
                toast.success('Route generated successfully!');
            } catch (e) {
                setResult({ error: e.response?.data?.detail || 'Failed to generate routes' });
                toast.error('Route generation failed');
            }
            setGenerating(false);
        };

        const handleEditZone = (zone) => {
            setEditZone(zone);
            setZoneForm({
                name: zone.name || '',
                description: zone.description || '',
                depot_lat: zone.depot_lat || '',
                depot_lng: zone.depot_lng || '',
                depot_address: zone.depot_address || '',
            });
        };

        const handleSaveZone = async () => {
            if (!editZone) return;
            setZoneSaving(true);
            try {
                const payload = { ...zoneForm };
                if (payload.depot_lat) payload.depot_lat = parseFloat(payload.depot_lat);
                if (payload.depot_lng) payload.depot_lng = parseFloat(payload.depot_lng);
                if (!payload.depot_lat) delete payload.depot_lat;
                if (!payload.depot_lng) delete payload.depot_lng;
                await adminApi.updateZone(editZone.id, payload);
                toast.success('Zone updated!');
                setEditZone(null);
                loadLocalZones();
            } catch (e) {
                console.error('Zone update error:', e);
                toast.error(e.response?.data?.detail || 'Failed to update zone');
            }
            setZoneSaving(false);
        };

        const handleDeleteZone = async (zoneId, zoneName) => {
            if (!confirm(`Delete "${zoneName}"? Bins and users in this zone will be unassigned.`)) return;
            try {
                await adminApi.deleteZone(zoneId);
                toast.success('Zone deleted');
                loadLocalZones();
            } catch (e) {
                console.error('Zone delete error:', e);
                toast.error(e.response?.data?.detail || 'Failed to delete zone');
            }
        };

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-6">
                    {/* Route Generation Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-semibold text-gray-900 mb-4 font-display">Generate Optimized Routes</h3>
                        <div className="space-y-3">
                            <button onClick={() => handleGenerate(null)} disabled={generating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sw-mid text-white font-medium rounded-xl hover:bg-sw-dark disabled:opacity-50 transition-colors">
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                Generate for All Zones
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                {localZones.map(z => (
                                    <button key={z.id} onClick={() => handleGenerate(z.id)} disabled={generating}
                                        className="px-4 py-2.5 border border-sw-mid text-sw-mid font-medium rounded-xl hover:bg-sw-bg transition-colors text-sm">
                                        {z.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {result && (
                            <div className={`mt-4 p-4 rounded-xl text-sm ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {result.error ? result.error : (
                                    <div>
                                        <p className="font-semibold mb-1">✓ Route Generated!</p>
                                        <p>Collector: {result.collector || 'Unassigned'} | Zone: {result.zone_name || 'All Zones'}</p>
                                        <p className="font-mono-data">Bins: {result.bins_count || (result.stops?.length) || 0} | Distance: {result.total_distance_km || 0} km | Time: {result.estimated_duration_min || 0} min</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Zone Management Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 font-display">Zone Management</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Configure zones, depot locations, and collection boundaries.</p>

                        {/* Add New Zone */}
                        <AddZoneFeature onZoneAdded={loadLocalZones} />

                        {/* Zone List */}
                        <div className="space-y-2 mt-4">
                            {localZones.map(zone => (
                                <div key={zone.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{zone.name}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {zone.depot_address
                                                ? `🏢 ${zone.depot_address}`
                                                : zone.depot_lat
                                                    ? `📍 Depot: ${zone.depot_lat?.toFixed(4)}, ${zone.depot_lng?.toFixed(4)}`
                                                    : '⚠️ No depot set'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => handleEditZone(zone)} className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-md transition-colors" title="Edit Zone">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteZone(zone.id, zone.name)} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="Delete Zone">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {localZones.length === 0 && (
                                <div className="text-center py-6 text-gray-400">
                                    <Building className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No zones configured</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Optimized Route Map Component */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-fit">
                    <h3 className="font-semibold text-gray-900 mb-4 font-display flex items-center gap-2">
                        <MapPin className="text-sw-mid" size={18} /> Optimized Route Visualizer
                    </h3>
                    <OptimizedRouteMap 
                        stops={result?.stops || []} 
                        isLive={generating} 
                    />
                </div>

                {/* Edit Zone Modal */}
                {editZone && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-sw-dark">Edit Zone: {editZone.name}</h3>
                                <button onClick={() => setEditZone(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                                    <input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} placeholder="Optional description" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">🏢 Base Depot Configuration</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Depot Address</label>
                                        <input value={zoneForm.depot_address} onChange={(e) => setZoneForm({ ...zoneForm, depot_address: e.target.value })} placeholder="e.g. Municipal Office, Main Road" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Depot Latitude</label>
                                            <input type="number" step="any" value={zoneForm.depot_lat} onChange={(e) => setZoneForm({ ...zoneForm, depot_lat: e.target.value })} placeholder="e.g. 26.8467" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Depot Longitude</label>
                                            <input type="number" step="any" value={zoneForm.depot_lng} onChange={(e) => setZoneForm({ ...zoneForm, depot_lng: e.target.value })} placeholder="e.g. 80.9462" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setEditZone(null)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleSaveZone} disabled={zoneSaving} className="flex items-center gap-2 px-6 py-2 bg-sw-mid text-white text-sm font-bold rounded-xl hover:bg-sw-dark disabled:opacity-50 transition-colors">
                                    {zoneSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Recyclers Tab ────────────────────────────────────────────
    function RecyclersManagement() {
        const [recyclers, setRecyclers] = useState([]);
        const [stats, setStats] = useState(null);
        const [loading, setLoading] = useState(true);
        const [showAdd, setShowAdd] = useState(false);
        const [showPickup, setShowPickup] = useState(null);
        const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', latitude: '', longitude: '', price_per_kg: '', min_quantity_kg: '', zone_id: 1, accepted_types: ['all'] });
        const [pickupForm, setPickupForm] = useState({ quantity_kg: '', notes: '' });
        const [pickupSubmitting, setPickupSubmitting] = useState(false);

        useEffect(() => { loadData(); }, []);

        const loadData = async () => {
            setLoading(true);
            try {
                const [recData, statData] = await Promise.all([
                    recyclerApi.getAdminRecyclers(),
                    recyclerApi.getRecyclerGlobalStats()
                ]);
                setRecyclers(recData);
                setStats(statData);
            } catch (e) { console.error(e); }
            setLoading(false);
        };

        const handleAdd = async () => {
            try {
                const payload = { ...form, latitude: parseFloat(form.latitude) || 21.25, longitude: parseFloat(form.longitude) || 81.63, price_per_kg: parseFloat(form.price_per_kg), min_quantity_kg: parseFloat(form.min_quantity_kg) };
                await recyclerApi.createAdminRecycler(payload);
                setShowAdd(false);
                setForm({ name: '', contact_person: '', phone: '', email: '', address: '', latitude: '', longitude: '', price_per_kg: '', min_quantity_kg: '', zone_id: 1, accepted_types: ['all'] });
                toast.success('Recycler added!');
                loadData();
            } catch (e) { toast.error("Failed to add recycler"); }
        };

        const handleDelete = async (id) => {
            if (confirm('Deactivate this recycler?')) {
                await recyclerApi.deleteAdminRecycler(id);
                toast.success('Recycler deactivated');
                loadData();
            }
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Total Recyclers" value={stats?.total_active_recyclers || 0} icon={Building} color="blue" />
                    <KPICard title="Plastic Sold" value={stats?.plastic_sold_this_month_kg || 0} unit="kg" icon={Package} color="sw-light" />
                    <KPICard title="Revenue" value={`₹${stats?.revenue_generated_this_month || 0}`} icon={DollarSign} color="sw-gold" />
                    <KPICard title="Avg Price" value={`₹${stats?.average_price_per_kg || 0}/kg`} icon={TrendingUp} color="sw-mid" />
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 font-display">Partner Facilities ({recyclers.length})</h2>
                    <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-sw-mid text-white rounded-xl font-medium flex items-center gap-2 hover:bg-sw-dark transition-colors">
                        {showAdd ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
                        {showAdd ? 'Cancel' : 'Add Recycler'}
                    </button>
                </div>

                {showAdd && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-slide-down">
                        <h3 className="font-bold text-lg mb-4">Register New Recycler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Facility Name *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                            <input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Contact Person *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid md:col-span-2" />
                            <select value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: parseInt(e.target.value) })} className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid">
                                <option value={1}>Zone 1</option><option value={2}>Zone 2</option><option value={3}>Zone 3</option><option value={4}>Zone 4</option>
                            </select>
                            <input value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} type="number" placeholder="Price/kg (₹) *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                            <input value={form.min_quantity_kg} onChange={(e) => setForm({ ...form, min_quantity_kg: e.target.value })} type="number" placeholder="Min Qty (kg) *" className="px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-mid" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleAdd} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">Submit</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recyclers.map(r => (
                        <div key={r.id} className={`bg-white rounded-2xl p-6 shadow-sm border card-hover transition-all ${r.is_active ? 'border-gray-100' : 'border-red-200 opacity-60'}`}>
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
                                <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4"/> Zone {r.zone_id}</p>
                                <p className="text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Accepts: <span className="capitalize">{r.accepted_types?.join(', ')}</span></p>
                                <p className="text-gray-600 flex items-center gap-2"><Package className="w-4 h-4"/> Bought: <span className="font-mono-data font-bold">{r.stats?.total_purchased_kg || 0}kg</span></p>
                            </div>
                            <div className="flex gap-3 border-t border-gray-100 pt-4">
                                {r.is_active ? (
                                    <>
                                        <button onClick={() => setShowPickup(r.id)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-xl transition-colors">Request Pickup</button>
                                        <button onClick={() => handleDelete(r.id)} className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors">Disable</button>
                                    </>
                                ) : (
                                    <span className="flex-1 text-center py-2 text-red-600 font-bold bg-red-50 rounded-xl">INACTIVE</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {recyclers.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>No recyclers found. Add some!</p>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available (kg) *</label>
                                    <input required type="number" step="0.5" value={pickupForm.quantity_kg} onChange={(e) => setPickupForm({...pickupForm, quantity_kg: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 150" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea rows={3} value={pickupForm.notes} onChange={(e) => setPickupForm({...pickupForm, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="E.g. Mostly PET bottles, ready at front gate." />
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

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'bins', label: 'Bins', icon: Trash2 },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'routes', label: 'Routes', icon: Zap },
        { key: 'recyclers', label: 'Recyclers', icon: Building },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        { key: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex min-h-screen bg-sw-bg">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 main-content-mobile ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-6">
                    <EcoQuote />

                    {/* Tab Bar */}
                    <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit overflow-x-auto">
                        {tabs.map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-sw-mid text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'overview' && <Overview />}
                    {tab === 'bins' && <BinsManagement />}
                    {tab === 'users' && <UsersManagement />}
                    {tab === 'routes' && <RouteGeneration />}
                    {tab === 'recyclers' && <RecyclersManagement />}
                    {tab === 'analytics' && <Analytics />}
                    {tab === 'settings' && <SettingsTab />}
                </div>
            </main>

            <AIAnalysisModal isOpen={showAI} onClose={() => setShowAI(false)} onSubmit={(results) => console.log('AI Results:', results)} />
        </div>
    );
}

// ── Helper Components ────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="skeleton h-80 rounded-2xl" />
                <div className="skeleton h-80 rounded-2xl" />
            </div>
        </div>
    );
}

function ImpactCard({ label, before, after, trend }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Before</p>
                    <p className="text-sm font-medium text-gray-500">{before}</p>
                </div>
                <div className="text-xl">
                    {trend === 'up' ? <span className="text-green-500">↑</span> : <span className="text-red-500">↓</span>}
                </div>
                <div className="flex-1 text-right">
                    <p className="text-xs text-gray-400 mb-0.5">After</p>
                    <p className="text-sm font-bold text-sw-dark">{after}</p>
                </div>
            </div>
        </div>
    );
}
