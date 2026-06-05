import client from './client';
import axios from 'axios';

const WAKE_URL = process.env.EXPO_PUBLIC_API_URL
  || 'https://smartwaste-ai-f0i9.onrender.com';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

// Helper: wait ms
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: ping server to wake it up before login
const wakeUpServer = async () => {
    try {
        await axios.get(WAKE_URL, { timeout: 10000 });
        console.log('[SmartWaste] Server wake-up ping: OK');
    } catch (e) {
        console.log('[SmartWaste] Server wake-up ping failed, waiting 5s before login...');
        await wait(5000);
    }
};

// Check if error is retryable (network/timeout, NOT auth errors)
const isRetryable = (err) => {
    if (err.response?.status === 401) return false; // wrong password — don't retry
    if (err.code === 'ECONNABORTED') return true;   // timeout
    if (err.code === 'ERR_NETWORK') return true;     // network error
    if (!err.response) return true;                   // no response at all
    return false;
};

export const login = async (email, password, role, onRetry) => {
    const payload = { email, password, role: role || 'collector' };

    // Step 1: Wake up server
    await wakeUpServer();

    // Step 2: Attempt login with retries
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await client.post('/auth/login', payload, { timeout: 120000 });
            return res.data;
        } catch (err) {
            lastError = err;
            console.error(`[SmartWaste] Login attempt ${attempt + 1} failed:`, err.code, err.message);

            // Don't retry non-retryable errors
            if (!isRetryable(err)) break;

            // Don't wait after final attempt
            if (attempt < MAX_RETRIES) {
                if (onRetry) onRetry(attempt + 1);
                console.log(`[SmartWaste] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await wait(RETRY_DELAY_MS);
            }
        }
    }

    // All attempts failed — throw appropriate error
    if (lastError.code === 'ECONNABORTED') {
        throw new Error('Server is waking up, please wait 30 seconds and try again');
    } else if (!lastError.response) {
        throw new Error(`Cannot reach server (${lastError.code || 'NETWORK_ERROR'}). Check your internet connection.`);
    } else if (lastError.response.status === 401) {
        throw new Error('Invalid email or password');
    } else {
        throw new Error(lastError.response?.data?.detail || 'Login failed');
    }
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};

export const completeProfile = async (profileData) => {
  const response = await client.patch('/auth/complete-profile', profileData);
  return response.data;
};
