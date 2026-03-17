import client from './client';
import { API_BASE_URL } from '../config';

export const getBins = async () => {
    const res = await client.get('/public/bins');
    return res.data;
};

export const submitReport = async (formData) => {
    const res = await client.post('/public/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
    });
    return res.data;
};

export const getReportStatus = async (id) => {
    const res = await client.get(`/public/report/${id}/status`);
    return res.data;
};
