import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Trash2, FileText, Calendar, X, Package, BarChart3, Camera, Upload, Leaf } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EcoQuote from '../components/EcoQuote';
import KPICard from '../components/cards/KPICard';
import StatusBadge from '../components/StatusBadge';
import useStore from '../store';
import * as shgApi from '../api/shgApi';

export default function SHGDashboard() {
    const { sidebarOpen } = useStore();
    const [tab, setTab] = useState('bins');
    const tabs = [
        { key: 'bins', label: 'My Bins', icon: Trash2 },
        { key: 'report', label: 'Report', icon: FileText },
        { key: 'history', label: 'History', icon: FileText },
        { key: 'schedule', label: 'Schedule', icon: Calendar },
    ];

    function StatsRow() {
        const [stats, setStats] = useState(null);
        useEffect(() => { shgApi.getStats().then(setStats).catch(console.error); }, []);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <KPICard title="Reports This Week" value={stats?.this_week?.reports_count || 0} icon={FileText} color="sw-light" />
                <KPICard title="This Week (kg)" value={stats?.this_week?.plastic_collected_kg || 0} unit="kg" icon={Package} color="sw-gold" />
                <KPICard title="This Month (kg)" value={stats?.this_month?.plastic_collected_kg || 0} unit="kg" icon={BarChart3} color="sw-mid" />
            </div>
        );
    }

    function MyBins() {
        const [bins, setBins] = useState([]);
        const [loading, setLoading] = useState(true);
        const [modal, setModal] = useState(null);
        const [fillLevel, setFillLevel] = useState(50);
        const [photo, setPhoto] = useState(null);
        const [photoPreview, setPhotoPreview] = useState(null);
        const [notes, setNotes] = useState('');
        const [refresh, setRefresh] = useState(0);
        const fileRef = useRef(null);

        useEffect(() => {
            const loadBins = async () => {
                setLoading(true);
                try { setBins(await shgApi.getMyBins()); } catch (e) { console.error(e); }
                setLoading(false);
            };
            loadBins();
        }, [refresh]);

        const handlePhotoChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setPhoto(file);
                const reader = new FileReader();
                reader.onload = (ev) => setPhotoPreview(ev.target.result);
                reader.readAsDataURL(file);
            }
        };

        const handleReport = async () => {
            if (!modal) return;
            try {
                const formData = new FormData();
                formData.append('fill_level', fillLevel);
                if (notes) formData.append('notes', notes);
                if (photo) formData.append('photo', photo);

                const result = await shgApi.reportBin(modal.id, formData);
                setModal(null);
                setFillLevel(50);
                setPhoto(null);
                setPhotoPreview(null);
                setNotes('');
                setRefresh((r) => r + 1);
                toast.success(result.message || 'Report submitted! 🌿');
            } catch (e) { toast.error('Report failed'); }
        };

        const getFillColor = (level) => {
            if (level >= 80) return 'bg-red-500';
            if (level >= 50) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="animate-fade-in">
                {/* Bin Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bins.map((b) => (
                        <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{b.label}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{b.address || 'No address'}</p>
                                </div>
                                <StatusBadge status={b.status} />
                            </div>
                            
                            {/* Fill Level Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Fill Level</span>
                                    <span className="font-bold font-mono-data">{b.fill_level}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div className={`h-3 rounded-full transition-all duration-500 ${getFillColor(b.fill_level)}`} style={{ width: `${b.fill_level}%` }} />
                                </div>
                            </div>

                            <button 
                                onClick={() => { setModal(b); setFillLevel(b.fill_level || 50); }}
                                className="w-full py-2 bg-sw-mid text-white text-sm font-medium rounded-xl hover:bg-sw-dark transition-colors"
                            >
                                Report Fill Level
                            </button>
                        </div>
                    ))}
                    {bins.length === 0 && (
                        <div className="col-span-3 text-center py-16">
                            <Leaf className="w-16 h-16 text-sw-accent mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No bins assigned</h3>
                            <p className="text-gray-500">Contact your zone manager to assign bins.</p>
                        </div>
                    )}
                </div>

                {/* Report Modal with Fill Level Slider */}
                {modal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-bold text-lg">Report — {modal.label}</h3>
                                <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-5">
                                {/* Fill Level Slider */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Fill Level</label>
                                    <div className="relative">
                                        <input 
                                            type="range" min="0" max="100" value={fillLevel}
                                            onChange={(e) => setFillLevel(parseInt(e.target.value))}
                                            className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #22C55E ${fillLevel * 0.4}%, #EAB308 ${fillLevel * 0.7}%, #EF4444 ${fillLevel}%, #e5e7eb ${fillLevel}%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>0%</span>
                                            <span className="font-bold text-lg text-gray-900 font-mono-data">{fillLevel}%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[0, 25, 50, 75, 100].map(v => (
                                            <button key={v} onClick={() => setFillLevel(v)}
                                                className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${fillLevel === v ? 'bg-sw-mid text-white border-sw-mid' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                {v}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Photo (Optional)</label>
                                    {photoPreview ? (
                                        <div className="relative">
                                            <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                                            <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                                                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => fileRef.current?.click()}
                                            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-sw-light hover:text-sw-mid transition-colors">
                                            <Camera className="w-6 h-6" />
                                            <span className="text-xs">Tap to capture or upload photo</span>
                                        </button>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Notes (Optional)</label>
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} 
                                        className="w-full px-3 py-2 border rounded-xl text-sm h-20 resize-none focus:ring-2 focus:ring-sw-light outline-none" 
                                        placeholder="Any observations about the bin..." />
                                </div>

                                <button onClick={handleReport} className="w-full py-3 bg-sw-mid text-white font-semibold rounded-xl hover:bg-sw-dark transition-colors">
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function ReportTab() {
        const [bins, setBins] = useState([]);
        const [selectedBin, setSelectedBin] = useState(null);
        const [fillLevel, setFillLevel] = useState(50);
        const [notes, setNotes] = useState('');
        const [loading, setLoading] = useState(true);
        const [submitting, setSubmitting] = useState(false);

        useEffect(() => {
            shgApi.getMyBins().then(setBins).catch(console.error).finally(() => setLoading(false));
        }, []);

        const handleSubmit = async () => {
            if (!selectedBin) { toast.error('Please select a bin'); return; }
            setSubmitting(true);
            try {
                const formData = new FormData();
                formData.append('fill_level', fillLevel);
                if (notes) formData.append('notes', notes);

                await shgApi.reportBin(selectedBin, formData);
                toast.success('Report submitted! 🌿');
                setSelectedBin(null);
                setFillLevel(50);
                setNotes('');
            } catch (e) { toast.error('Report failed'); }
            setSubmitting(false);
        };

        if (loading) return <LoadingSkeleton />;

        return (
            <div className="max-w-lg animate-fade-in">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-5 font-display">Submit Fill Level Report</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Select Bin</label>
                            <select value={selectedBin || ''} onChange={(e) => setSelectedBin(parseInt(e.target.value))}
                                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none">
                                <option value="">Choose a bin...</option>
                                {bins.map(b => <option key={b.id} value={b.id}>{b.label} — {b.address || 'N/A'}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Fill Level: <span className="font-mono-data text-lg font-bold text-sw-dark">{fillLevel}%</span></label>
                            <input type="range" min="0" max="100" value={fillLevel} onChange={(e) => setFillLevel(parseInt(e.target.value))}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #22C55E ${fillLevel * 0.4}%, #EAB308 ${fillLevel * 0.7}%, #EF4444 ${fillLevel}%, #e5e7eb ${fillLevel}%)`
                                }} />
                            <div className="flex gap-2 mt-2">
                                {[0, 25, 50, 75, 100].map(v => (
                                    <button key={v} onClick={() => setFillLevel(v)}
                                        className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${fillLevel === v ? 'bg-sw-mid text-white border-sw-mid' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        {v}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-sm h-20 resize-none focus:ring-2 focus:ring-sw-light outline-none"
                                placeholder="Optional observations..." />
                        </div>

                        <button onClick={handleSubmit} disabled={!selectedBin || submitting}
                            className="w-full py-3 bg-sw-mid text-white font-semibold rounded-xl hover:bg-sw-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Submit Report
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    function History() {
        const [history, setHistory] = useState([]);
        const [loading, setLoading] = useState(true);
        useEffect(() => { shgApi.getHistory().then(setHistory).catch(console.error).finally(() => setLoading(false)); }, []);

        if (loading) return <LoadingSkeleton />;
        if (!history.length) return (
            <div className="text-center py-16 animate-fade-in">
                <Leaf className="w-16 h-16 text-sw-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No history yet</h3>
                <p className="text-gray-500">Reports will appear here after you submit collections.</p>
            </div>
        );

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Collected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 text-gray-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-3 font-medium">{r.collection_point || '—'}</td>
                                <td className="px-4 py-3 text-gray-600">{r.plastic_type || '—'}</td>
                                <td className="px-4 py-3 font-bold text-sw-dark font-mono-data">{r.plastic_collected_kg || 0} kg</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    function Schedule() {
        const [schedule, setSchedule] = useState([]);
        const [loading, setLoading] = useState(true);
        useEffect(() => { shgApi.getSchedule().then(setSchedule).catch(console.error).finally(() => setLoading(false)); }, []);

        if (loading) return <LoadingSkeleton />;
        if (!schedule.length) return (
            <div className="text-center py-16 animate-fade-in">
                <Calendar className="w-16 h-16 text-sw-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No upcoming routes</h3>
                <p className="text-gray-500">Schedules will appear here.</p>
            </div>
        );

        return (
            <div className="space-y-4 animate-fade-in">
                {schedule.map((r) => (
                    <div key={r.route_id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 card-hover">
                        <div className="w-14 h-14 bg-sw-light/10 rounded-xl flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-sw-mid" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{r.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">{r.date || 'TBD'}</span>
                                <StatusBadge status={r.status} />
                            </div>
                        </div>
                        {r.total_distance_km && (
                            <div className="text-right">
                                <p className="text-sm font-bold font-mono-data">{r.total_distance_km} km</p>
                                <p className="text-xs text-gray-500">distance</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-sw-bg">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 main-content-mobile ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-6">
                    <EcoQuote />
                    <StatsRow />
                    <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit overflow-x-auto">
                        {tabs.map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-sw-mid text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>
                    {tab === 'bins' && <MyBins />}
                    {tab === 'report' && <ReportTab />}
                    {tab === 'history' && <History />}
                    {tab === 'schedule' && <Schedule />}
                </div>
            </main>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
        </div>
    );
}
