import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 HARDCODED FOR PRODUCTION APK TO PREVENT 0B NETWORK ERRORS 🚨
const BASE_URL = "https://smartwaste-ai-f0i9.onrender.com/api";

console.log('[SmartWaste] API BASE_URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
