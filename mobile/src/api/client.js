import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../store';

const BASE_URL = "https://smartwaste-ai-f0i9.onrender.com/api";

console.log('[SmartWaste] API BASE_URL:', BASE_URL);

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 60000,
});

// Request interceptor: attach JWT token from AsyncStorage or Zustand
client.interceptors.request.use(async (config) => {
    try {
        let token = useStore.getState().token;
        if (!token) {
            token = await AsyncStorage.getItem('auth_token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) { }
    return config;
});

// Response interceptor: handle 401 and refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Let's avoid looping on the refresh endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;
            try {
                const newToken = await useStore.getState().refreshAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                }
                // If it resolves to null, the store's logout logic kicks in
            } catch (err) {
                // Ignore, it will gracefully reject
            }
        }
        
        // If not 401, or already retried, or refresh failed, manually clean and propagate
        if (error.response?.status === 401 && originalRequest.url.includes('/auth/refresh')) {
            useStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default client;
