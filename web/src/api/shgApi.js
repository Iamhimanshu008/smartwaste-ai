import client from './client';

export const getMyBins = async () => {
    const res = await client.get('/shg/bins');
    return res.data;
};

export const reportBin = async (binId, data) => {
    const res = await client.post(`/shg/bins/${binId}/report`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const getReports = async () => {
    const res = await client.get('/shg/reports');
    return res.data;
};

export const getHistory = async () => {
    const res = await client.get('/shg/history');
    return res.data;
};

export const getSchedule = async () => {
    const res = await client.get('/shg/schedule');
    return res.data;
};

export const getStats = async () => {
    const res = await client.get('/shg/stats');
    return res.data;
};
