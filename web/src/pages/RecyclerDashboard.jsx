import { useState, useEffect } from 'react';
import { Package, IndianRupee, Clock, CheckCircle2, Factory } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store';
import axios from 'axios';

// Assuming base URL is configured in axios or you can use relative path via vite proxy
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api` 
        : '/api'
});

export default function RecyclerDashboard() {
    const { token } = useStore();
    const [stats, setStats] = useState({
        recycler_name: 'Loading...',
        total_plastic_bought_kg: 0,
        total_amount_paid: 0,
        active_bids_count: 0
    });
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, bidsRes] = await Promise.all([
                api.get('/recycler/dashboard', { headers }),
                api.get('/recycler/bids', { headers })
            ]);
            setStats(statsRes.data);
            setBids(bidsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAccept = async (id) => {
        try {
            await api.post(`/recycler/bids/${id}/accept`, {}, { headers });
            toast.success('Bid accepted successfully!');
            loadData();
        } catch (error) {
            toast.error('Error accepting bid');
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.post(`/recycler/bids/${id}/complete`, {}, { headers });
            toast.success('Transaction marked as completed! 🌿');
            loadData();
        } catch (error) {
            toast.error('Error completing transaction');
        }
    };

    return (
        <div className="min-h-screen bg-sw-bg p-6 md:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-sw-dark mb-2">
                            <Factory className="w-8 h-8" />
                            <h1 className="text-3xl font-display font-bold">Recycler Portal</h1>
                        </div>
                        <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold">{stats.recycler_name}</span></p>
                    </div>
                    <button 
                        onClick={loadData}
                        className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-sm font-semibold text-sw-dark hover:bg-gray-50 transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Package className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Plastic Bought</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total_plastic_bought_kg} kg</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 border-l-4 border-l-green-500">
                        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                            <IndianRupee className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Amount Paid</p>
                            <h3 className="text-2xl font-bold text-gray-900">₹{stats.total_amount_paid.toLocaleString('en-IN')}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 border-l-4 border-l-amber-500">
                        <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Clock className="w-7 h-7 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Active / Pending Bids</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.active_bids_count}</h3>
                        </div>
                    </div>
                </div>

                {/* Bids Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Incoming Bids & Active Transactions</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage plastic pickup requests assigned to your facility.</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Loading bids...</td>
                                    </tr>
                                ) : bids.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No bids found for your facility.</td>
                                    </tr>
                                ) : (
                                    bids.map((bid) => (
                                        <tr key={bid.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {new Date(bid.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                {bid.quantity_kg} kg
                                                <div className="text-xs text-gray-400 font-normal">@ ₹{bid.offered_price_per_kg}/kg</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-sw-dark">
                                                ₹{bid.total_value}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    bid.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    bid.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                    {bid.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                {bid.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAccept(bid.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-sw-mid text-white text-xs font-semibold rounded-lg hover:bg-sw-dark transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {bid.status === 'accepted' && (
                                                    <button 
                                                        onClick={() => handleComplete(bid.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                                                    </button>
                                                )}
                                                {bid.status === 'completed' && (
                                                    <span className="text-xs text-gray-400 font-medium italic">Handled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
