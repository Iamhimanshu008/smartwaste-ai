import client from './client';

export const getBins = async () => {
    const res = await client.get('/public/bins');
    return res.data;
};

export const submitReport = async (formData) => {
    const res = await client.post('/public/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const getReportStatus = async (id) => {
    const res = await client.get(`/public/report/${id}/status`);
    return res.data;
};

export const getLiveStatus = async () => {
    const res = await client.get('/public/live-status');
    return res.data;
};
