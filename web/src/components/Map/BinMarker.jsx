import { CircleMarker, Popup } from 'react-leaflet';

const statusColors = {
    overflow: '#EF4444',
    full: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
    empty: '#22C55E',
};

const statusRadius = {
    overflow: 12,
    full: 11,
    high: 10,
    medium: 9,
    low: 8,
    empty: 7,
};

export default function BinMarker({ bin, onClick }) {
    const color = statusColors[bin.status] || '#6B7280';
    const radius = statusRadius[bin.status] || 8;

    return (
        <CircleMarker
            center={[bin.latitude, bin.longitude]}
            radius={radius}
            pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
            }}
            eventHandlers={{
                click: () => onClick && onClick(bin),
            }}
        >
            <Popup>
                <div className="min-w-[180px]">
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{bin.label}</h3>
                    {bin.address && (
                        <p className="text-xs text-gray-500 mb-2">{bin.address}</p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                        <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: color }}
                        >
                            {bin.status?.toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                            {bin.fill_level}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all"
                            style={{
                                width: `${bin.fill_level}%`,
                                backgroundColor: color,
                            }}
                        />
                    </div>
                    {bin.last_collected && (
                        <p className="text-xs text-gray-400 mt-2">
                            Last collected: {new Date(bin.last_collected).toLocaleDateString()}
                        </p>
                    )}
                    {onClick && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(bin); }}
                            className="mt-2 w-full px-3 py-1.5 bg-sw-mid text-white text-xs rounded-lg font-medium hover:bg-sw-dark transition-colors"
                        >
                            Report This Bin
                        </button>
                    )}
                </div>
            </Popup>
        </CircleMarker>
    );
}
