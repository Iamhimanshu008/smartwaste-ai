import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Receipt, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MOCK_FINANCIALS = {
    revenue: "₹4,25,000",
    revenueTrend: "+15%",
    expenses: "₹2,80,000",
    expensesTrend: "-5%",
    profit: "₹1,45,000",
    profitTrend: "+42%",
    carbonCredits: "₹85,000",
};

const MOCK_MONTHLY_DATA = [
    { month: 'Jan', revenue: 320000, expenses: 250000, profit: 70000 },
    { month: 'Feb', revenue: 340000, expenses: 245000, profit: 95000 },
    { month: 'Mar', revenue: 310000, expenses: 260000, profit: 50000 },
    { month: 'Apr', revenue: 380000, expenses: 255000, profit: 125000 },
    { month: 'May', revenue: 425000, expenses: 280000, profit: 145000 },
];

const MOCK_REVENUE_STREAMS = [
    { name: 'Recyclables Sale', value: 185000 },
    { name: 'Compost Sale', value: 95000 },
    { name: 'Carbon Credits', value: 85000 },
    { name: 'User Fees', value: 60000 },
];

export default function FinancialTab() {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Revenue & Waste Economy</h2>
                    <p className="text-sm text-gray-500">Financial sustainability and monetization tracking</p>
                </div>
            </div>

            {/* Profitability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 text-[#16A34A] rounded-lg"><IndianRupee className="w-5 h-5" /></div>
                        <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            {MOCK_FINANCIALS.revenueTrend} <ArrowUpRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (MTD)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{MOCK_FINANCIALS.revenue}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Receipt className="w-5 h-5" /></div>
                        <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            {MOCK_FINANCIALS.expensesTrend} <ArrowDownRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Operational Costs</p>
                        <h3 className="text-2xl font-bold text-gray-900">{MOCK_FINANCIALS.expenses}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
                        <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            {MOCK_FINANCIALS.profitTrend} <ArrowUpRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
                        <h3 className="text-2xl font-bold text-[#14532D]">{MOCK_FINANCIALS.profit}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#14532D] to-[#16A34A] rounded-2xl p-6 shadow-sm text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><LineChartIcon className="w-5 h-5 text-white" /></div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-100 mb-1">Carbon Credits Value</p>
                        <h3 className="text-2xl font-bold">{MOCK_FINANCIALS.carbonCredits}</h3>
                        <p className="text-xs text-green-200 mt-2">Monetized through voluntary markets</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Financial Overview Line Chart (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Financial Overview (5 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={MOCK_MONTHLY_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7C6E' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#0284C7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Streams Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Revenue Streams</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={MOCK_REVENUE_STREAMS} layout="vertical" margin={{ left: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7C6E' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B7C6E' }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" fill="#16A34A" radius={[0, 4, 4, 0]}>
                                {MOCK_REVENUE_STREAMS.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        index === 0 ? '#14532D' :
                                        index === 1 ? '#16A34A' :
                                        index === 2 ? '#0284C7' : '#EA580C'
                                    } />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
