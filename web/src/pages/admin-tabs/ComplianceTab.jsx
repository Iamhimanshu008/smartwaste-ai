import React from 'react';
import { FileBarChart, CheckCircle, AlertTriangle, Download, FileText, Calendar, Filter, ShieldCheck } from 'lucide-react';

const MOCK_COMPLIANCE = [
    { title: 'SWM Rules 2016', status: 'Compliant', score: 95 },
    { title: 'Plastic Waste Management Rules', status: 'Compliant', score: 92 },
    { title: 'E-Waste Management Rules', status: 'Warning', score: 78 },
    { title: 'Bio-Medical Waste Rules', status: 'Compliant', score: 100 },
    { title: 'Construction & Demolition', status: 'Needs Attention', score: 65 },
    { title: 'Swachh Bharat Mission Guidelines', status: 'Compliant', score: 96 }
];

const MOCK_REPORTS = [
    { id: 'REP-2023-11', name: 'Monthly Zone Operations Report', date: '01 Nov 2023', type: 'Operations', size: '2.4 MB' },
    { id: 'REP-2023-10', name: 'Annual Environmental Impact', date: '15 Oct 2023', type: 'Environmental', size: '5.1 MB' },
    { id: 'REP-2023-09', name: 'Q3 Financial Sustainability', date: '01 Oct 2023', type: 'Financial', size: '1.8 MB' },
    { id: 'REP-2023-08', name: 'Swachh Survekshan Prep Data', date: '20 Sep 2023', type: 'Compliance', size: '8.4 MB' },
];

export default function ComplianceTab() {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Compliance & Reporting</h2>
                    <p className="text-sm text-gray-500">Regulatory adherence and automated report generation</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-sm font-medium rounded-xl hover:bg-[#14532D] transition-colors shadow-sm">
                        <FileBarChart className="w-4 h-4" /> Generate New Report
                    </button>
                </div>
            </div>

            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full border-8 border-[#16A34A] flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-3xl font-bold text-[#14532D]">88%</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#14532D] flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-6 h-6 text-[#16A34A]" /> Overall Compliance Score
                    </h3>
                    <p className="text-gray-600 mb-4">
                        The overall compliance score is calculated based on adherence to 6 major governmental guidelines. 
                        Currently, the system is performing well, but attention is needed in Construction & Demolition waste management.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                            <span className="text-sm font-medium text-gray-700">4 Fully Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                            <span className="text-sm font-medium text-gray-700">2 Require Review</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6 Compliance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_COMPLIANCE.map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-gray-900 leading-tight max-w-[80%]">{item.title}</h4>
                            <div className={`p-1.5 rounded-lg ${
                                item.status === 'Compliant' ? 'bg-green-50 text-[#16A34A]' :
                                item.status === 'Warning' ? 'bg-orange-50 text-[#EA580C]' :
                                'bg-red-50 text-red-600'
                            }`}>
                                {item.status === 'Compliant' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-[#14532D]">{item.score}%</span>
                            <span className="text-xs text-gray-500 mb-1">Score</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                            <div className={`h-1.5 rounded-full ${
                                item.status === 'Compliant' ? 'bg-[#16A34A]' :
                                item.status === 'Warning' ? 'bg-[#EA580C]' :
                                'bg-red-500'
                            }`} style={{ width: `${item.score}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Generation & Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Report Generator */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#14532D] mb-4">Quick Generate</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] outline-none">
                                <option>Monthly Operations Summary</option>
                                <option>Swachh Survekshan Data Export</option>
                                <option>Financial Audit Report</option>
                                <option>Environmental Impact Assessment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] outline-none">
                                <option>Last 30 Days</option>
                                <option>This Quarter</option>
                                <option>This Year</option>
                                <option>Custom Range...</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" name="format" className="accent-[#16A34A]" defaultChecked /> PDF
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" name="format" className="accent-[#16A34A]" /> Excel
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" name="format" className="accent-[#16A34A]" /> CSV
                                </label>
                            </div>
                        </div>
                        <button className="w-full py-2.5 mt-2 bg-[#14532D] text-white font-medium rounded-xl hover:bg-[#0f4022] transition-colors flex justify-center items-center gap-2">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>

                {/* Recent Reports Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#14532D]">Recent Reports</h3>
                        <button className="text-sm text-gray-500 hover:text-[#16A34A] flex items-center gap-1">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-100">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Report Name</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date Generated</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {MOCK_REPORTS.map((report, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{report.id} • {report.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-gray-400" /> {report.date}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#16A34A] hover:bg-green-50 rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
