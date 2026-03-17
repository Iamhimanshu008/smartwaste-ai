import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, unit, icon: Icon, trend, trendValue, color = 'sw-mid' }) {
    const colorMap = {
        'sw-dark': { bg: 'bg-emerald-900/10', icon: 'text-emerald-900', border: 'border-emerald-200' },
        'sw-mid':  { bg: 'bg-emerald-50',     icon: 'text-emerald-700', border: 'border-emerald-100' },
        'sw-light':{ bg: 'bg-green-50',       icon: 'text-green-600',  border: 'border-green-100' },
        'sw-gold': { bg: 'bg-orange-50',      icon: 'text-orange-600', border: 'border-orange-100' },
        'sw-accent':{ bg: 'bg-teal-50',       icon: 'text-teal-600',   border: 'border-teal-100' },
        'blue':    { bg: 'bg-blue-50',        icon: 'text-blue-600',   border: 'border-blue-100' },
        'red':     { bg: 'bg-red-50',         icon: 'text-red-600',    border: 'border-red-100' },
        'purple':  { bg: 'bg-purple-50',      icon: 'text-purple-600', border: 'border-purple-100' },
    };

    const c = colorMap[color] || colorMap['sw-mid'];

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} card-hover relative overflow-hidden`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-gray-900 font-mono-data">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                        {unit && (
                            <span className="text-sm text-gray-500 font-medium">{unit}</span>
                        )}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                            trend === 'up' ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {trend === 'up'
                                ? <TrendingUp className="w-3.5 h-3.5" />
                                : <TrendingDown className="w-3.5 h-3.5" />
                            }
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                )}
            </div>
        </div>
    );
}
