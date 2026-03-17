import client from './client';

export const getBins = async () => {
    const res = await client.get('/shg/bins');
    return res.data;
};

export const reportBin = async (binId, payload) => {
    const res = await client.post(`/shg/bins/${binId}/report`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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
