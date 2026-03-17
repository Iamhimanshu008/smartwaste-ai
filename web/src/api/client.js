import axios from 'axios';
import useStore from '../store';

const client = axios.create({
    baseURL: '/api',
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
    (error) => {
        if (error.response?.status === 401) {
            const token = useStore.getState().token;
            // Only auto-logout if we have a token (not during login itself)
            // Skip for demo fallback token to avoid redirect loops
            if (token && token !== 'demo-token-123') {
                useStore.getState().logout();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
