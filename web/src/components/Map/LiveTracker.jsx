import { Truck, Navigation, Clock } from 'lucide-react';

export default function LiveTracker({ status }) {
    if (!status) return null;

    const {
        zone,
        collector,
        total_bins,
        collected_today,
        last_collection,
        route_completion_pct
    } = status;

    // Format relative time for last collection
    const formatRelativeTime = (isoString) => {
        if (!isoString) return 'Just now';
        const diff = Math.floor((new Date() - new Date(isoString)) / 60000); // mins
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} min ago`;
        return `${Math.floor(diff / 60)} hr ago`;
    };

    // Very simple estimaton
    const remaining = total_bins - collected_today;
    const estHours = Math.max(1, Math.round(remaining * 0.25));

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-sw-accent/20 overflow-hidden w-full max-w-sm pointer-events-auto transition-all duration-500">
            {/* Header */}
            <div className="bg-sw-dark px-5 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-sw-gold" />
                    <span className="font-bold text-sm tracking-wide">LIVE COLLECTION</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-gray-200">Active</span>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* Zone & Collector Info */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{zone}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        Collector: <span className="font-semibold text-sw-mid">{collector}</span>
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 relative pt-2">
                    <div className="flex justify-between items-end text-sm mb-1">
                        <span className="font-bold text-gray-700">{collected_today} of {total_bins} bins</span>
                        <span className="font-bold text-sw-mid">{route_completion_pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-sw-light to-sw-mid transition-all duration-1000 ease-out relative"
                            style={{ width: `${route_completion_pct}%` }}
                        >
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-white/30 w-full h-full -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>

                {/* Details Footer */}
                <div className="bg-sw-bg rounded-xl p-3 grid grid-cols-2 gap-3 text-xs border border-gray-100">
                    <div>
                        <p className="text-gray-500 flex items-center gap-1 mb-0.5"><Navigation className="w-3.5 h-3.5"/> Last Pickup</p>
                        <p className="font-semibold text-gray-800 truncate">{last_collection?.bin_name}</p>
                        <p className="text-gray-500 mt-0.5">{formatRelativeTime(last_collection?.time)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 flex items-center gap-1 mb-0.5"><Clock className="w-3.5 h-3.5"/> Estimated</p>
                        <p className="font-semibold text-gray-800">~{estHours} hrs left</p>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(200%); }
                }
                .animate-\\[shimmer_2s_infinite\\] {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
