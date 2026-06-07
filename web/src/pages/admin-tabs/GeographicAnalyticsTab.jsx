import React, { useState } from 'react';
import { Map, Filter, MapPin, ChevronDown, Trophy, AlertCircle } from 'lucide-react';

const MOCK_ZONES = [
    { id: 1, name: "North Zone", score: 95, status: "Excellent", collectionRate: "98%", issues: 2 },
    { id: 2, name: "South Zone", score: 88, status: "Good", collectionRate: "92%", issues: 5 },
    { id: 3, name: "East Zone", score: 76, status: "Needs Improvement", collectionRate: "81%", issues: 12 },
    { id: 4, name: "West Zone", score: 91, status: "Good", collectionRate: "95%", issues: 3 },
    { id: 5, name: "Central Zone", score: 82, status: "Good", collectionRate: "88%", issues: 8 },
];

export default function GeographicAnalyticsTab() {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Geographic Analytics</h2>
                    <p className="text-sm text-gray-500">Spatial distribution of waste operations and zone performance</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Map Section (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[600px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-[#14532D] flex items-center gap-2">
                            <Map className="w-5 h-5" /> Live Operations Map
                        </h3>
                        <div className="flex gap-2">
                            {['All', 'Critical', 'Active Trucks'].map((f) => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                        activeFilter === f ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 bg-[#F0FDF4] relative flex items-center justify-center">
                        {/* Map Placeholder */}
                        <div className="text-center">
                            <MapPin className="w-16 h-16 text-[#16A34A] mx-auto mb-4 opacity-50" />
                            <p className="text-[#14532D] font-medium font-display text-lg">Interactive Map Integration</p>
                            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                The geographic map will display live truck locations, smart bin statuses, and heatmaps of waste generation.
                            </p>
                        </div>
                        
                        {/* Fake Map Overlays for UI demonstration */}
                        <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.3)] animate-pulse"></div>
                        <div className="absolute top-32 right-20 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.3)] animate-pulse"></div>
                        <div className="absolute bottom-20 left-1/3 w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.3)] animate-pulse"></div>
                    </div>
                </div>

                {/* Rankings & Stats Section */}
                <div className="space-y-6">
                    {/* Zone Performance Ranking */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#14532D] mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#EA580C]" /> Zone Performance Ranking
                        </h3>
                        <div className="space-y-4">
                            {MOCK_ZONES.sort((a,b) => b.score - a.score).map((zone, index) => (
                                <div key={zone.id} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-50 text-gray-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{zone.name}</span>
                                            <span className="text-sm font-bold text-[#14532D]">{zone.score}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="h-1.5 rounded-full bg-[#16A34A]" style={{ width: `${zone.score}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Critical Areas */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#14532D] mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Areas Needing Attention
                        </h3>
                        <div className="space-y-3">
                            {MOCK_ZONES.filter(z => z.score < 85).map(zone => (
                                <div key={zone.id} className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-semibold text-red-900">{zone.name}</span>
                                        <span className="text-xs font-bold text-red-700">{zone.issues} Issues</span>
                                    </div>
                                    <p className="text-xs text-red-600">Collection rate dropped to {zone.collectionRate}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
