import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RAIPUR_CENTER = [21.2514, 81.6296];
const DEFAULT_ZOOM = 13;

export default function MapBase({ children, center, zoom, className = '' }) {
    return (
        <MapContainer
            center={center || RAIPUR_CENTER}
            zoom={zoom || DEFAULT_ZOOM}
            className={`w-full h-full rounded-2xl ${className}`}
            style={{ minHeight: '400px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {children}
        </MapContainer>
    );
}
