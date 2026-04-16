import axios from 'axios';
import useStore from '../store';

// Production: VITE_API_URL points to Render backend (e.g. https://smartwaste-ai-f0i9.onrender.com)
// Development: falls back to 'http://localhost:8000'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: add auth token
client.interceptors.request.use((config) => {
    const token = useStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            const token = useStore.getState().token;
            // Skip for demo fallback token to avoid redirect loops
            if (token === 'demo-token-123') {
                useStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            try {
                const newToken = await useStore.getState().refreshAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                }
            } catch (err) {}
        }

        if (error.response?.status === 401) {
            useStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
