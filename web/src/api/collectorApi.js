import client from './client';

export const getTodayRoute = async () => {
    const res = await client.get('/collector/route/today');
    return res.data;
};

export const collectBin = async (binId, data) => {
    const res = await client.post(`/collector/bins/${binId}/collect`, data);
    return res.data;
};

export const getHistory = async () => {
    const res = await client.get('/collector/history');
    return res.data;
};
