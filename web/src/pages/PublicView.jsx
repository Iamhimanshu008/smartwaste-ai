import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Building, Recycle, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import MapBase from '../components/Map/MapBase';
import BinMarker from '../components/Map/BinMarker';
import api from '../api/client';
import * as recyclerApi from '../api/recyclerApi';
import LiveTracker from '../components/Map/LiveTracker';
import { CircleMarker, Tooltip } from 'react-leaflet';

export default function PublicView() {
    const [tab, setTab] = useState('map');
    
    const tabs = [
        { key: 'map', label: 'Bin Map', icon: MapPin },
        { key: 'report', label: 'Report Litter', icon: Camera },
        { key: 'recyclers', label: 'Nearby Recyclers', icon: Building },
    ];

    function LiveMap() {
        const [bins, setBins] = useState([]);
        const [liveStatus, setLiveStatus] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const loadData = async () => {
                try {
                    const [binsRes, locRes] = await Promise.all([
                        api.get('/public/bins'),
                        api.get('/public/live-status')
                    ]);
                    setBins(binsRes.data);
                    setLiveStatus(locRes.data);
                } catch (e) {
                    console.error('Error fetching public data:', e);
                }
                setLoading(false);
            };
            loadData();
            const interval = setInterval(loadData, 30000); // 30s refresh
            return () => clearInterval(interval);
        }, []);

        if (loading) return <div className="skeleton h-[600px] w-full rounded-2xl animate-fade-in" />;

        return (
            <div className="animate-fade-in">
                <div className="bg-white p-4 rounded-t-2xl border border-b-0 border-gray-100 flex gap-4">
                    <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500"></span> Empty/Low</div>
                    <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium</div>
                    <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500"></span> Full/Overflowing</div>
                </div>
                <div style={{ height: '600px' }} className="rounded-b-2xl overflow-hidden border border-gray-100 relative z-0">
                    <MapBase>
                        {bins.map((bin) => {
                            let status = 'empty';
                            if (bin.fill_level >= 80) status = 'high';
                            else if (bin.fill_level >= 50) status = 'medium';
                            else if (bin.fill_level >= 20) status = 'low';
                            return (
                                <BinMarker key={bin.id} bin={{ ...bin, status }} />
                            );
                        })}
                        
                        {liveStatus && liveStatus.collector_location && (
                            <CircleMarker 
                                center={[liveStatus.collector_location.lat, liveStatus.collector_location.lng]} 
                                radius={10} 
                                pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.8, weight: 3 }}
                            >
                                <Tooltip permanent direction="top" offset={[0, -10]}>
                                    <span className="font-bold text-blue-700">🚚 Collector</span>
                                </Tooltip>
                            </CircleMarker>
                        )}
                    </MapBase>
                    {liveStatus && (
                        <div className="absolute top-4 right-4 z-[400] max-w-[320px] w-full">
                            <LiveTracker status={liveStatus} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    function ReportTab() {
        const [form, setForm] = useState({ description: '', latitude: '', longitude: '' });
        const [photo, setPhoto] = useState(null);
        const [preview, setPreview] = useState(null);
        const [loadingLoc, setLoadingLoc] = useState(false);
        const [submitting, setSubmitting] = useState(false);
        const fileRef = useRef(null);

        const getLocation = () => {
            setLoadingLoc(true);
            if (!navigator.geolocation) {
                toast.error('Geolocation is not supported by your browser');
                setLoadingLoc(false);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
                    toast.success('Location captured');
                    setLoadingLoc(false);
                },
                (err) => {
                    toast.error('Could not get location. ' + err.message);
                    setLoadingLoc(false);
                }
            );
        };

        const handlePhotoChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setPhoto(file);
                const reader = new FileReader();
                reader.onload = (ev) => setPreview(ev.target.result);
                reader.readAsDataURL(file);
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!photo) { toast.error('Please add a photo'); return; }
            if (!form.latitude || !form.longitude) { toast.error('Please capture location'); return; }

            setSubmitting(true);
            try {
                // Mock API call since there's no public report endpoint yet
                await new Promise(r => setTimeout(r, 1500));
                toast.success('Thank you! Report submitted successfully 🌍');
                setForm({ description: '', latitude: '', longitude: '' });
                setPhoto(null);
                setPreview(null);
            } catch (err) {
                toast.error('Failed to submit report');
            }
            setSubmitting(false);
        };

        return (
            <div className="max-w-md mx-auto animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Report Litter / Full Bin</h2>
                    <p className="text-sm text-gray-500 mb-6">Help keep Chhattisgarh clean by reporting overflowing bins or illegal dumping.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence *</label>
                            {preview ? (
                                <div className="relative">
                                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-100" />
                                    <button type="button" onClick={() => { setPhoto(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-sw-mid hover:bg-sw-bg transition-colors text-gray-500">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-sm">Tap to capture photo</span>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <div className="flex gap-2">
                                <input readOnly value={form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : ''} placeholder="GPS Coordinates" className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                                <button type="button" onClick={getLocation} disabled={loadingLoc} className="px-4 py-2 bg-sw-mid hover:bg-sw-dark text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50 min-w-[120px] justify-center">
                                    {loadingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MapPin className="w-4 h-4"/> Get GPS</>}
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
                            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="E.g., Bin is broken, or illegal plastic dump on the corner..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sw-light resize-none"></textarea>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Report</>}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    function RecyclersTab() {
        const [recyclers, setRecyclers] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            recyclerApi.getPublicRecyclers().then(setRecyclers).catch(console.error).finally(() => setLoading(false));
        }, []);

        if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="skeleton h-40 rounded-2xl"/><div className="skeleton h-40 rounded-2xl"/></div>;

        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-emerald-900 mb-1">Sell your plastic waste! 💰</h2>
                        <p className="text-sm text-emerald-700">Find local recycling facilities that pay for sorted plastic waste.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recyclers.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{r.name}</h3>
                                    <p className="text-sm text-gray-500">{r.contact_person}</p>
                                </div>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold font-mono-data">₹{r.price_per_kg}/kg</span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {r.address}</p>
                                <p className="flex items-center gap-2">Accepts: <span className="capitalize">{r.accepted_types?.join(', ')}</span></p>
                                <p className="flex items-center gap-2 font-mono-data text-xs">Min quantity: {r.min_quantity_kg}kg</p>
                            </div>
                            <a href={`tel:${r.phone}`} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl flex justify-center items-center transition-colors border border-gray-200">
                                Call to Arrange Dropoff
                            </a>
                        </div>
                    ))}
                    {recyclers.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-gray-400">
                            <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No recyclers currently taking public drop-offs.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sw-bg">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-sw-mid flex items-center justify-center">
                            <Recycle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-gray-900">SmartWaste</span>
                            <span className="text-xs ml-1 px-2 py-0.5 bg-sw-mid/10 rounded text-sw-mid font-bold uppercase">Public</span>
                        </div>
                    </div>
                    <a href="/login" className="px-5 py-2 text-sm font-semibold text-sw-dark hover:bg-sw-bg rounded-xl transition-colors">
                        Staff Login
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-24">
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm">
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-sw-mid text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'map' && <LiveMap />}
                {tab === 'report' && <ReportTab />}
                {tab === 'recyclers' && <RecyclersTab />}
            </main>
        </div>
    );
}
