import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, unit, icon: Icon, color = 'sw-light', trend }) {
    const colorMap = {
        'sw-light': 'bg-sw-light/10 text-sw-light border-sw-light/20',
        'sw-gold': 'bg-amber-50 text-sw-gold border-sw-gold/20',
        'sw-mid': 'bg-sw-mid/10 text-sw-mid border-sw-mid/20',
        'red': 'bg-red-50 text-red-500 border-red-200',
        'blue': 'bg-blue-50 text-blue-500 border-blue-200',
    };

    const iconColorMap = {
        'sw-light': 'bg-sw-light/20 text-sw-light',
        'sw-gold': 'bg-amber-100 text-sw-gold',
        'sw-mid': 'bg-sw-mid/20 text-sw-mid',
        'red': 'bg-red-100 text-red-500',
        'blue': 'bg-blue-100 text-blue-500',
    };

    return (
        <div className={`bg-white rounded-2xl p-6 border ${colorMap[color] || colorMap['sw-light']} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                        {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{Math.abs(trend)}% vs last week</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${iconColorMap[color] || iconColorMap['sw-light']}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
