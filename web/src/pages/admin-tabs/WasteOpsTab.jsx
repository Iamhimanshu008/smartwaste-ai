import React from 'react';
import { Truck, Trash2, Cpu, CheckCircle2, XCircle, AlertCircle, PackageSearch, Users } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const MOCK_STREAM_DATA = [
    { type: '🟢 Wet/Organic Waste', volume: '7,914 kg', purity: '37.5%', status: '✅ On Target', note: '' },
    { type: '🔵 Dry Waste (Plastic/Paper/Metal)', volume: '10,020 kg', purity: '47.5%', status: '✅ On Target', note: '' },
    { type: '🟡 Sanitary Waste', volume: '1,578 kg', purity: '7.5%', status: '⚠️ Monitor', note: 'Requires separate disposal — not recyclable' },
    { type: '🔴 Special Care/Hazardous Waste', volume: '822 kg', purity: '3.9%', status: '⚠️ Handle carefully', note: 'PWMU center required for disposal' },
    { type: '🟣 E-Waste (E-Waste Rules 2022)', volume: '348 kg', purity: '1.6%', status: 'ℹ️ Separate rules apply', note: 'Collect & send to authorized e-waste recycler' }
];

const MOCK_COLLECTOR_DATA = [
    { id: 'C-001', name: 'Rajesh Kumar', zone: 'Ward 1', binsCollected: 145, efficiency: '96%', status: 'Active' },
    { id: 'C-002', name: 'Suresh Singh', zone: 'Ward 2', binsCollected: 132, efficiency: '92%', status: 'Active' },
    { id: 'C-003', name: 'Amit Patel', zone: 'Ward 3', binsCollected: 98, efficiency: '85%', status: 'Delayed' },
    { id: 'C-004', name: 'Vikram Sharma', zone: 'Ward 4', binsCollected: 156, efficiency: '98%', status: 'Active' },
    { id: 'C-005', name: 'Deepak Verma', zone: 'Ward 5', binsCollected: 0, efficiency: '-', status: 'Off Duty' }
];

const MOCK_IOT_DEVICES = [
    { type: 'Smart Bin Sensors', total: 450, online: 432, lowBattery: 15, offline: 3 },
    { type: 'GPS Trackers (Trucks)', total: 45, online: 42, lowBattery: 0, offline: 3 },
    { type: 'RFID Scanners', total: 120, online: 118, lowBattery: 2, offline: 0 }
];

export default function WasteOpsTab() {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Waste Collection & Operations</h2>
                    <p className="text-sm text-gray-500">Logistics, waste stream analysis, and hardware health</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Trucks</p>
                        <p className="text-2xl font-bold text-gray-900">42 <span className="text-sm font-normal text-gray-500">/ 45</span></p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-[#16A34A] rounded-xl"><Trash2 className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Bins Emptied Today</p>
                        <p className="text-2xl font-bold text-gray-900">1,245</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-[#EA580C] rounded-xl"><Cpu className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">IoT Sensor Uptime</p>
                        <p className="text-2xl font-bold text-gray-900">98.5%</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><PackageSearch className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Segregation Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900">89%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Stream Analysis */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Waste Stream Analysis</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-100">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stream Type</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status & Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {MOCK_STREAM_DATA.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.volume}</td>
                                        <td className="px-4 py-3 text-sm text-[#16A34A] font-semibold">{row.purity}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="text-gray-900">{row.status}</div>
                                            {row.note && <div className="text-xs text-gray-500 mt-1">{row.note}</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* IoT Device Health */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">IoT Device Health</h3>
                    <div className="space-y-4">
                        {MOCK_IOT_DEVICES.map((device, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-gray-900">{device.type}</span>
                                    <span className="text-sm text-gray-500">Total: {device.total}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] mb-1" />
                                        <span className="text-lg font-bold text-[#14532D]">{device.online}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Online</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-orange-50 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-[#EA580C] mb-1" />
                                        <span className="text-lg font-bold text-orange-900">{device.lowBattery}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Low Batt</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg">
                                        <XCircle className="w-4 h-4 text-red-500 mb-1" />
                                        <span className="text-lg font-bold text-red-900">{device.offline}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Offline</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Collector Performance Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#14532D] flex items-center gap-2"><Users className="w-5 h-5"/> Collector Fleet Performance</h3>
                    <button className="text-sm text-[#16A34A] font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bins Collected</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Efficiency</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_COLLECTOR_DATA.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.zone}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-semibold">{row.binsCollected}</td>
                                    <td className="px-4 py-3 text-sm text-[#16A34A]">{row.efficiency}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            row.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            row.status === 'Delayed' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
