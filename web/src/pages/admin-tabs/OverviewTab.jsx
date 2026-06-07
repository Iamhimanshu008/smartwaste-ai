import React, { useState, useEffect } from 'react';
import {
    Trash2, Users, Package, Wind, AlertTriangle, TrendingUp, TrendingDown,
    Activity, Leaf, Droplets, Battery, CheckCircle2, ShieldAlert
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Mock data to match the UI requirements
const MOCK_STATS = [
    { title: "Total Waste Collected", value: "1,245", unit: "Tons", icon: Package, trend: "up", color: "#16A34A" },
    { title: "Active Collectors", value: "156", unit: "People", icon: Users, trend: "up", color: "#14532D" },
    { title: "Smart Bins Deployed", value: "342", unit: "Units", icon: Trash2, trend: "up", color: "#EA580C" },
    { title: "Material Recovered", value: "85%", unit: "Rate", icon: Activity, trend: "up", color: "#0284C7" },
    { title: "Carbon Offset", value: "4,500", unit: "kg CO₂", icon: Wind, trend: "up", color: "#059669" },
];

const MOCK_PERFORMANCE = [
    { label: "Collection Efficiency", value: "92%", status: "excellent" },
    { label: "Route Optimization", value: "88%", status: "good" },
    { label: "Bin Overflow Rate", value: "3%", status: "warning" },
    { label: "Citizen App Engagement", value: "45k", status: "good" },
];

const MOCK_ALERTS = [
    { type: "critical", msg: "3 Bins overflowed in Zone North", time: "10 mins ago" },
    { type: "warning", msg: "Collector truck BR-01 delayed", time: "1 hr ago" },
    { type: "info", msg: "New SHG group onboarded", time: "2 hrs ago" },
];

const MOCK_DAILY_DATA = [
    { name: 'Mon', organic: 400, recyclable: 240, hazardous: 20 },
    { name: 'Tue', organic: 300, recyclable: 139, hazardous: 25 },
    { name: 'Wed', organic: 200, recyclable: 980, hazardous: 15 },
    { name: 'Thu', organic: 278, recyclable: 390, hazardous: 30 },
    { name: 'Fri', organic: 189, recyclable: 480, hazardous: 10 },
    { name: 'Sat', organic: 239, recyclable: 380, hazardous: 12 },
    { name: 'Sun', organic: 349, recyclable: 430, hazardous: 8 },
];

const MOCK_VALUE_CHAIN = [
    { stage: "Collection", volume: "1,245 Tons", efficiency: "92%", cost: "₹45,000" },
    { stage: "Segregation", volume: "1,100 Tons", efficiency: "88%", cost: "₹30,000" },
    { stage: "Processing (Compost)", volume: "600 Tons", efficiency: "95%", cost: "₹15,000" },
    { stage: "Recycling (Plastic/Paper)", volume: "450 Tons", efficiency: "85%", cost: "₹25,000" },
];

export default function OverviewTab({ stats, analytics }) {
    // Determine trend colors
    const getStatusColor = (status) => {
        if (status === 'excellent') return 'text-green-600 bg-green-100';
        if (status === 'good') return 'text-blue-600 bg-blue-100';
        if (status === 'warning') return 'text-orange-600 bg-orange-100';
        return 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Command Center Overview</h2>
                    <p className="text-sm text-gray-500">Real-time monitoring of waste management operations</p>
                </div>
            </div>

            {/* 5 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {MOCK_STATS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                                <span className="text-sm font-medium text-gray-500 mb-1">{stat.unit}</span>
                            </div>
                            <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>+12% from last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 4 Performance Cards & 3 Alert Cards (Left Column 4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Performance Cards */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#14532D] mb-4">System Performance</h3>
                        <div className="space-y-4">
                            {MOCK_PERFORMANCE.map((perf, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">{perf.label}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(perf.status)}`}>
                                        {perf.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts Cards */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#14532D]">Active Alerts</h3>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">3 New</span>
                        </div>
                        <div className="space-y-3">
                            {MOCK_ALERTS.map((alert, i) => (
                                <div key={i} className={`flex gap-3 p-3 rounded-xl border-l-4 ${
                                    alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                                    alert.type === 'warning' ? 'bg-orange-50 border-[#EA580C]' :
                                    'bg-blue-50 border-blue-500'
                                }`}>
                                    <div className="mt-0.5">
                                        {alert.type === 'critical' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#EA580C]" />}
                                        {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{alert.msg}</p>
                                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2 Charts & Value Chain Table (Right Column 8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 font-display">Waste Generation Trends</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={MOCK_DAILY_DATA}>
                                    <defs>
                                        <linearGradient id="colorOrg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="organic" stroke="#16A34A" fill="url(#colorOrg)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="recyclable" stroke="#0284C7" fill="url(#colorRec)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 font-display">Collection by Zone</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={MOCK_DAILY_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="organic" stackId="a" fill="#14532D" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="recyclable" stackId="a" fill="#16A34A" />
                                    <Bar dataKey="hazardous" stackId="a" fill="#EA580C" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Value Chain Table */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                        <h3 className="text-lg font-bold text-[#14532D] mb-4">Waste Value Chain Metrics</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-y border-gray-100">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume Processed</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Efficiency</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operational Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {MOCK_VALUE_CHAIN.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.stage}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{row.volume}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#16A34A]" style={{ width: row.efficiency }}></div>
                                                    </div>
                                                    <span>{row.efficiency}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-[#14532D]">{row.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Environmental Impact Cards */}
            <div className="mt-2">
                <h2 className="text-lg font-bold text-[#14532D] font-display mb-4">Environmental Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-green-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-full text-[#16A34A] shadow-sm">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Trees Saved</p>
                            <p className="text-2xl font-bold text-[#14532D]">3,420</p>
                        </div>
                    </div>
                    <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-green-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm">
                            <Wind className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800 uppercase tracking-wide">CO₂ Reduced</p>
                            <p className="text-2xl font-bold text-[#14532D]">4.5 <span className="text-sm">Tons</span></p>
                        </div>
                    </div>
                    <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-green-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-full text-cyan-500 shadow-sm">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Water Saved</p>
                            <p className="text-2xl font-bold text-[#14532D]">12.5k <span className="text-sm">L</span></p>
                        </div>
                    </div>
                    <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-green-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-full text-yellow-500 shadow-sm">
                            <Battery className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Energy Saved</p>
                            <p className="text-2xl font-bold text-[#14532D]">8,200 <span className="text-sm">kWh</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
