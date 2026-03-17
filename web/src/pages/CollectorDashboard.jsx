import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Truck, MapPin, Navigation, Navigation2, CheckCircle2, Clock, Calendar, CheckSquare, Search, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EcoQuote from '../components/EcoQuote';
import useStore from '../store';
import * as collectorApi from '../api/collectorApi';
import MapBase from '../components/Map/MapBase';
import BinMarker from '../components/Map/BinMarker';
import RouteOverlay from '../components/Map/RouteOverlay';

export default function CollectorDashboard() {
    const { sidebarOpen } = useStore();
    const [tab, setTab] = useState('route');

    const tabs = [
        { key: 'route', label: "Today's Route", icon: Truck },
        { key: 'history', label: 'History', icon: FileText },
    ];

    function TodaysRoute() {
        const [route, setRoute] = useState(null);
        const [loading, setLoading] = useState(true);
        const [collecting, setCollecting] = useState(null);

        useEffect(() => { loadRoute(); }, []);

        const loadRoute = async () => {
            setLoading(true);
            try { setRoute(await collectorApi.getTodayRoute()); } catch (e) { console.error(e); }
            setLoading(false);
        };

        const handleCollect = async (binId, index) => {
            setCollecting(binId);
            try {
                await collectorApi.collectBin(binId);
                toast.success('Bin collected successfully! 🚚');
                
                if (route) {
                    const newStops = [...route.stops];
                    if (newStops[index]) {
                        newStops[index].status = 'collected';
                        newStops[index].fill_level = 0;
                    }
                    setRoute({ ...route, stops: newStops });
                }
            } catch (e) {
                toast.error('Failed to mark collected');
            }
            setCollecting(null);
        };

        const handleNavigateAll = () => {
            if (!route || !route.stops || route.stops.length === 0) return;
            const origin = 'My Location';
            const waypoints = route.stops.filter(b => b.status !== 'collected').map(b => `${b.latitude},${b.longitude}`).join('|');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
            window.open(url, '_blank');
        };

        const handleNavigateSingle = (lat, lng) => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
            window.open(url, '_blank');
        };

        if (loading) return <LoadingSkeleton />;

        if (!route || !route.stops || route.stops.length === 0) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
                    <p className="text-gray-500">No active route assigned for today, or all bins collected.</p>
                </div>
            );
        }

        const collectedCount = route.stops.filter((b) => b.status === 'collected').length;
        const totalCount = route.stops.length;
        const progress = Math.round((collectedCount / totalCount) * 100) || 0;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Details Panel */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Route Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{route.name || "Today's Route"}</h2>
                        <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Progress</p>
                                <p className="text-2xl font-bold font-mono-data text-emerald-900">
                                    {collectedCount}<span className="text-emerald-500 text-lg">/{totalCount}</span>
                                </p>
                            </div>
                            <div className="bg-teal-50 rounded-xl p-3">
                                <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">Distance</p>
                                <p className="text-2xl font-bold font-mono-data text-teal-900">
                                    {route.total_distance_km || 0}<span className="text-teal-500 text-lg"> km</span>
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleNavigateAll}
                            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20"
                        >
                            <Navigation className="w-5 h-5" /> Navigate Entire Route
                        </button>
                    </div>

                    {/* Stops List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 font-display">Route Stops</h3>
                            <span className="text-xs font-semibold text-gray-500 uppercase">{totalCount - collectedCount} remaining</span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                            {route.stops.map((bin, i) => {
                                const isCollected = bin.status === 'collected';
                                return (
                                    <div key={bin.id} className={`p-5 transition-all ${isCollected ? 'bg-gray-50/50 opacity-60' : 'hover:bg-emerald-50/30'}`}>
                                        <div className="flex gap-4">
                                            {/* Stop Number Column */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCollected ? 'bg-emerald-100 text-emerald-700' : 'bg-sw-dark text-white'}`}>
                                                    {isCollected ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                                                </div>
                                                {i < route.stops.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                                            </div>
                                            
                                            {/* Stop Details */}
                                            <div className="flex-1 pb-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-semibold ${isCollected ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{bin.label}</h4>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {bin.address || 'Location unknown'}</p>
                                                
                                                {!isCollected && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button 
                                                            onClick={() => handleCollect(bin.id, i)}
                                                            disabled={collecting === bin.id}
                                                            className="flex-1 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-sm hover:bg-emerald-200 transition-colors flex justify-center items-center"
                                                        >
                                                            {collecting === bin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Collected'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleNavigateSingle(bin.latitude, bin.longitude)}
                                                            className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                            title="Navigate to this stop"
                                                        >
                                                            <Navigation2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Map Panel */}
                <div className="lg:col-span-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] min-h-[500px]">
                    <MapBase>
                        {route.stops.map((bin) => (
                            <BinMarker 
                                key={bin.id} 
                                bin={{...bin, label: bin.name || bin.label || bin.bin_name, status: bin.status === 'collected' ? 'empty' : 'critical'}} 
                            />
                        ))}
                        <RouteOverlay
                            stops={route.stops.filter(b => b.status !== 'collected')} 
                        />
                    </MapBase>
                </div>
            </div>
        );
    }

    function History() {
        const [history, setHistory] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const load = async () => {
                try { setHistory(await collectorApi.getHistory()); } catch (e) { console.error(e); }
                setLoading(false);
            };
            load();
        }, []);

        if (loading) return <LoadingSkeleton />;

        if (!history.length) {
            return (
                <div className="text-center py-16 animate-fade-in bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No collections yet</h3>
                    <p className="text-gray-500 text-sm">Your completed routes will appear here.</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bin Location</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Weight Collected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((h, i) => (
                            <tr key={h.id || i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {h.collected_at ? new Date(h.collected_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-gray-900">{h.bin_label || 'Unknown Bin'}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{h.address || `Zone ${h.zone_id || '?'}`}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold font-mono-data border border-emerald-100">
                                        {h.plastic_collected_kg || 0} kg
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-sw-bg">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 main-content-mobile ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-6">
                    <EcoQuote />
                    
                    <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1.5 border border-gray-100 w-fit">
                        {tabs.map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-sw-dark text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'route' && <TodaysRoute />}
                    {tab === 'history' && <History />}
                </div>
            </main>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
                <div className="skeleton h-48 rounded-2xl" />
                <div className="skeleton h-96 rounded-2xl" />
            </div>
            <div className="lg:col-span-2 skeleton h-[calc(100vh-140px)] min-h-[500px] rounded-2xl" />
        </div>
    );
}
