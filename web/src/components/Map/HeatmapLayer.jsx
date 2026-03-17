import { useEffect, useRef } from 'react';
import { useMap, CircleMarker } from 'react-leaflet';

/**
 * Converts a bin's fill_level to a heat intensity value (0–1).
 */
function getIntensity(fillLevel) {
    if (fillLevel > 80) return 1.0;
    if (fillLevel >= 50) return 0.6;
    return 0.3;
}

/**
 * HeatmapLayer — renders an L.heatLayer on the current Leaflet map
 * and overlays pulsing markers on critical (fill > 80%) bins.
 *
 * Props:
 *   bins: Array<{ latitude, longitude, fill_level, ... }>
 *   showPulse: boolean (default true)
 */
export default function HeatmapLayer({ bins = [], showPulse = true }) {
    const map = useMap();
    const heatRef = useRef(null);

    useEffect(() => {
        if (!map || !window.L?.heatLayer) return;

        // Build heat points: [lat, lng, intensity]
        const points = bins.map((bin) => [
            bin.latitude,
            bin.longitude,
            getIntensity(bin.fill_level ?? 0),
        ]);

        // Create or update the heat layer
        if (heatRef.current) {
            map.removeLayer(heatRef.current);
        }

        heatRef.current = window.L.heatLayer(points, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: '#22C55E',   // green — cool / empty
                0.3: '#22C55E',
                0.5: '#F4A261',   // orange — medium
                0.7: '#F97316',
                0.85: '#EF4444',  // red — hot / overflow
                1.0: '#DC2626',
            },
        }).addTo(map);

        return () => {
            if (heatRef.current) {
                map.removeLayer(heatRef.current);
                heatRef.current = null;
            }
        };
    }, [map, bins]);

    // Critical bins get a pulsing ring overlay
    const criticalBins = showPulse
        ? bins.filter((b) => (b.fill_level ?? 0) > 80)
        : [];

    return (
        <>
            {criticalBins.map((bin) => (
                <CircleMarker
                    key={`pulse-${bin.id}`}
                    center={[bin.latitude, bin.longitude]}
                    radius={14}
                    pathOptions={{
                        color: '#EF4444',
                        fillColor: '#EF4444',
                        fillOpacity: 0.25,
                        weight: 2,
                        className: 'heatmap-pulse-ring',
                    }}
                />
            ))}
        </>
    );
}

/**
 * HeatmapLegend — floating legend card for the heatmap.
 */
export function HeatmapLegend() {
    return (
        <div className="heatmap-legend">
            <p className="heatmap-legend-title">Waste Heat Index</p>
            <div className="heatmap-legend-bar" />
            <div className="heatmap-legend-labels">
                <span>🟢 Cool · Empty</span>
                <span>🟠 Warm</span>
                <span>🔴 Hot · Overflow</span>
            </div>
        </div>
    );
}
