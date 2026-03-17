import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

export default function RouteOverlay({ stops }) {
    if (!stops || stops.length === 0) return null;

    const positions = stops.map((s) => [s.latitude, s.longitude]);

    return (
        <>
            {/* Route polyline */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: '#2D6A4F',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 6',
                }}
            />

            {/* Numbered stop markers */}
            {stops.map((stop, idx) => {
                const isCollected = stop.status === 'collected';
                return (
                    <CircleMarker
                        key={`stop-${idx}`}
                        center={[stop.latitude, stop.longitude]}
                        radius={14}
                        pathOptions={{
                            color: isCollected ? '#22C55E' : '#F97316',
                            fillColor: isCollected ? '#22C55E' : '#FFFFFF',
                            fillOpacity: isCollected ? 0.9 : 0.95,
                            weight: 3,
                        }}
                    >
                        <Tooltip permanent direction="center" className="stop-number-tooltip">
                            <span className={`text-xs font-bold ${isCollected ? 'text-white' : 'text-sw-dark'}`}>
                                {stop.stop_order || idx + 1}
                            </span>
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </>
    );
}
