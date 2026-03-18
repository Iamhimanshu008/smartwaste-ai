// ─────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────
// Set your WiFi IP in mobile/.env file:
// EXPO_PUBLIC_API_URL=http://192.168.43.153:8000
//
// Find your IP:
// Windows: ipconfig
// Mac/Linux: ifconfig
// ─────────────────────────────────────────────

export const API_BASE_URL = 
    process.env.EXPO_PUBLIC_API_URL || 
    'http://172.24.49.198:8000';

export const COLORS = {
    dark: '#1B4332',
    mid: '#2D6A4F',
    light: '#52B788',
    accent: '#95D5B2',
    gold: '#F4A261',
    bg: '#F0F4F1',
    white: '#FFFFFF',
};

export const RAIPUR_COORDS = {
    latitude: 21.2514,
    longitude: 81.6296,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
};
