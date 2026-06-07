import React, { useState } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Info, Settings2, CheckCircle2, X } from 'lucide-react';

const MOCK_ALERTS = [
    { id: 1, type: 'critical', title: 'Smart Bin Overflow - Zone North', message: 'Sensor indicates Bin #B-104 is at 100% capacity for over 2 hours.', time: '10 mins ago', status: 'unread' },
    { id: 2, type: 'critical', title: 'IoT Gateway Offline', message: 'Gateway GT-05 in South Zone has lost connection.', time: '45 mins ago', status: 'unread' },
    { id: 3, type: 'warning', title: 'Collector Route Delayed', message: 'Truck BR-01 is running 1 hour behind schedule.', time: '1 hr ago', status: 'read' },
    { id: 4, type: 'warning', title: 'Low Quality Segregation', message: 'Recycling facility reported 15% mixed waste in batch #899.', time: '3 hrs ago', status: 'read' },
    { id: 5, type: 'info', title: 'New SHG Onboarded', message: 'Green Earth SHG has completed the onboarding process.', time: '5 hrs ago', status: 'read' },
    { id: 6, type: 'info', title: 'Monthly Report Generated', message: 'The compliance report for October is ready for review.', time: '1 day ago', status: 'read' },
];

export default function AlertsTab() {
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [filter, setFilter] = useState('all');

    const markAllRead = () => {
        setAlerts(alerts.map(a => ({ ...a, status: 'read' })));
    };

    const dismissAlert = (id) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'unread') return a.status === 'unread';
        return a.type === filter;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display flex items-center gap-2">
                        <Bell className="w-6 h-6" /> Alerts & Notifications
                    </h2>
                    <p className="text-sm text-gray-500">Manage system alerts, warnings, and notification preferences</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <CheckCircle2 className="w-4 h-4" /> Mark All as Read
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#14532D] text-white text-sm font-medium rounded-xl hover:bg-[#0f4022] transition-colors shadow-sm">
                        <Settings2 className="w-4 h-4" /> Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Filter Alerts</h3>
                        <div className="space-y-1">
                            <button onClick={() => setFilter('all')} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#16A34A] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                All Alerts
                                <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{alerts.length}</span>
                            </button>
                            <button onClick={() => setFilter('unread')} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-[#16A34A] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Unread
                                <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{alerts.filter(a => a.status === 'unread').length}</span>
                            </button>
                            <button onClick={() => setFilter('critical')} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'critical' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'}`}>
                                Critical
                            </button>
                            <button onClick={() => setFilter('warning')} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'warning' ? 'bg-[#EA580C] text-white' : 'text-orange-600 hover:bg-orange-50'}`}>
                                Warnings
                            </button>
                            <button onClick={() => setFilter('info')} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'info' ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50'}`}>
                                Information
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Notification Channels</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">Email Notifications</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">SMS Alerts (Critical)</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">Push Notifications</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="lg:col-span-3 space-y-3">
                    {filteredAlerts.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium text-gray-900">You're all caught up!</p>
                            <p className="text-gray-500 text-sm">No alerts match your current filter.</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <div key={alert.id} className={`bg-white rounded-xl p-4 border transition-all ${
                                alert.status === 'unread' ? 'shadow-md' : 'shadow-sm opacity-80'
                            } ${
                                alert.type === 'critical' ? 'border-l-4 border-l-red-500 border-y-gray-100 border-r-gray-100' :
                                alert.type === 'warning' ? 'border-l-4 border-l-[#EA580C] border-y-gray-100 border-r-gray-100' :
                                'border-l-4 border-l-blue-500 border-y-gray-100 border-r-gray-100'
                            }`}>
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {alert.type === 'critical' && <div className="p-2 bg-red-100 text-red-500 rounded-full"><ShieldAlert className="w-5 h-5" /></div>}
                                        {alert.type === 'warning' && <div className="p-2 bg-orange-100 text-[#EA580C] rounded-full"><AlertTriangle className="w-5 h-5" /></div>}
                                        {alert.type === 'info' && <div className="p-2 bg-blue-100 text-blue-500 rounded-full"><Info className="w-5 h-5" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-base font-bold ${alert.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {alert.title}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-gray-400">{alert.time}</span>
                                                <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                        
                                        {alert.type === 'critical' && alert.status === 'unread' && (
                                            <div className="mt-3 flex gap-2">
                                                <button className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">
                                                    Take Action
                                                </button>
                                                <button onClick={() => {
                                                    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'read' } : a));
                                                }} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                                    Acknowledge
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
