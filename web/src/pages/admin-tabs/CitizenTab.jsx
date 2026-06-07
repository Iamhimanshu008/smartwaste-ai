import React from 'react';
import { Home, QrCode, ScanLine, Coins } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const MOCK_TRENDS = [
    { name: 'Jan', registered: 2100, scanned: 800 },
    { name: 'Feb', registered: 4800, scanned: 2100 },
    { name: 'Mar', registered: 7200, scanned: 4500 },
    { name: 'Apr', registered: 10100, scanned: 7800 },
    { name: 'May', registered: 13400, scanned: 10200 },
    { name: 'Jun', registered: 16284, scanned: 12847 },
];

const MOCK_QR_BREAKDOWN = [
    { name: 'QR Generated & Active', value: 79, color: '#16A34A' },
    { name: 'QR Generated Not Scanned', value: 12, color: '#EA580C' },
    { name: 'No QR Yet', value: 9, color: '#DC2626' },
];

const MOCK_WARD_COVERAGE = [
    { ward: 'Ward 1', name: 'Abhanpur', total: 2840, generated: 2650, active: 2180, coverage: '93.7%', avgPts: '142', status: 'Good' },
    { ward: 'Ward 2', name: 'Arang', total: 1920, generated: 1800, active: 1540, coverage: '93.8%', avgPts: '118', status: 'Good' },
    { ward: 'Ward 3', name: 'Bhatapara', total: 2340, generated: 2100, active: 1780, coverage: '89.7%', avgPts: '98', status: 'Fair' },
    { ward: 'Ward 4', name: 'Baloda Bazar', total: 1680, generated: 1420, active: 1100, coverage: '84.5%', avgPts: '87', status: 'Fair' },
    { ward: 'Ward 5', name: 'Patan', total: 980, generated: 720, active: 540, coverage: '73.5%', avgPts: '64', status: 'Low' },
    { ward: 'Ward 6', name: 'Simga', total: 1240, generated: 890, active: 620, coverage: '71.8%', avgPts: '55', status: 'Low' },
    { ward: 'Ward 7', name: 'Palari', total: 2100, generated: 2020, active: 1890, coverage: '96.2%', avgPts: '165', status: 'Good' },
    { ward: 'Ward 8', name: 'Bhilai-3', total: 3184, generated: 3321, active: 2197, coverage: '100%', avgPts: '189', status: 'Good' },
];

const MOCK_LEADERBOARD = [
    { rank: 1, id: 'SW-HOUSE-1045', name: 'Ramesh Kumar', ward: 'Ward 7', pts: '842', grade: '🥇 Gold' },
    { rank: 2, id: 'SW-HOUSE-0892', name: 'Sunita Devi', ward: 'Ward 1', pts: '798', grade: '🥇 Gold' },
    { rank: 3, id: 'SW-HOUSE-2341', name: 'Mohan Sahu', ward: 'Ward 8', pts: '756', grade: '🥈 Silver' },
    { rank: 4, id: 'SW-HOUSE-0234', name: 'Geeta Bai', ward: 'Ward 2', pts: '721', grade: '🥈 Silver' },
    { rank: 5, id: 'SW-HOUSE-1892', name: 'Rajesh Yadav', ward: 'Ward 3', pts: '698', grade: '🥈 Silver' },
];

const MOCK_NEW_REGISTRATIONS = [
    { name: 'Jan', count: 420 },
    { name: 'Feb', count: 1200 },
    { name: 'Mar', count: 890 },
    { name: 'Apr', count: 1560 },
    { name: 'May', count: 1840 },
    { name: 'Jun', count: 374 },
];

export default function CitizenTab() {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Citizen & Household Data</h2>
                    <p className="text-sm text-gray-500">Registered households, QR cards, and citizen engagement</p>
                </div>
            </div>

            {/* ROW 1 — 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Home className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Households Registered</p>
                        <p className="text-2xl font-bold text-gray-900">16,284</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">With House ID assigned</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><QrCode className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">QR Cards Generated</p>
                        <p className="text-2xl font-bold text-gray-900">14,921</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">91.6% of total households</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ScanLine className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">QR Cards Scanned (Active)</p>
                        <p className="text-2xl font-bold text-gray-900">12,847</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Coins className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Avg Mitan-Mudra per HH</p>
                        <p className="text-2xl font-bold text-gray-900">🌾 127 pts</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Monthly average</p>
                    </div>
                </div>
            </div>

            {/* ROW 2 — Registration Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Household Registration Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={MOCK_TRENDS}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="registered" name="Households Registered" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="scanned" name="QR Cards Scanned" stroke="#EA580C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">QR Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={MOCK_QR_BREAKDOWN}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {MOCK_QR_BREAKDOWN.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROW 3 — Ward-wise Household Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#14532D] mb-4">Ward-wise Household Coverage</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ward No</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ward Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total HH</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">QR Generated</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Active Citizens</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Coverage %</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Avg Points</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_WARD_COVERAGE.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.ward}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.total.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.generated.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.active.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{row.coverage}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-yellow-600 text-right">{row.avgPts} 🌾</td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {row.status === 'Good' && <span className="text-green-600">✅ Good</span>}
                                        {row.status === 'Fair' && <span className="text-orange-500">⚠️ Fair</span>}
                                        {row.status === 'Low' && <span className="text-red-500">❌ Low</span>}
                                    </td>
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-50 border-t border-gray-200 font-bold">
                                <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>TOTALS</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">16,284</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">14,921</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">12,847</td>
                                <td className="px-4 py-3 text-sm text-[#16A34A] text-right">91.6%</td>
                                <td className="px-4 py-3 text-sm text-yellow-600 text-right">127 🌾</td>
                                <td className="px-4 py-3 text-sm text-gray-900"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ROW 4 — Top Performing Citizens Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Top Households — Mitan-Mudra Leaderboard</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-100">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rank</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">House ID</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Household Name</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Points</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {MOCK_LEADERBOARD.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-center w-12">{row.rank}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-500">{row.id}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.ward}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-yellow-600 text-right">{row.pts} 🌾</td>
                                        <td className="px-4 py-3 text-sm font-medium">{row.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Grievance Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl border border-red-100 bg-red-50">
                            <p className="text-xs font-bold text-red-600 uppercase mb-1">Open Complaints</p>
                            <p className="text-3xl font-bold text-red-900">47</p>
                        </div>
                        <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                            <p className="text-xs font-bold text-green-600 uppercase mb-1">Resolved (30 Days)</p>
                            <p className="text-3xl font-bold text-green-900">183</p>
                        </div>
                    </div>
                    
                    <div className="mb-6 flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Resolution Rate</span>
                        <span className="font-bold text-[#16A34A] text-lg">79.5%</span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Recent Complaints</h4>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-900">"QR card not working"</p>
                                <p className="text-xs text-gray-500 mt-1">Ward 3</p>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Open</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-900">"Collector didn't come"</p>
                                <p className="text-xs text-gray-500 mt-1">Ward 5</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Resolved</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-900">"Points not credited"</p>
                                <p className="text-xs text-gray-500 mt-1">Ward 1</p>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Open</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 5 — Citizen Registration Trends */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#14532D] mb-4">Citizen Registration Trends</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={MOCK_NEW_REGISTRATIONS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="count" name="New Registrations" stroke="#0284C7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
