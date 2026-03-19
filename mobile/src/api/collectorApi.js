import client from './client';

export const getTodayRoute = async () => {
    const res = await client.get('/collector/route/today');
    return res.data;
};

export const collectBin = async (binId, kg_collected = 0, notes = null, collector_lat = null, collector_lng = null) => {
    const payload = {
        kg_collected,
        notes,
    };
    
    // Pass location as query parameters to match backend expectations
    const res = await client.post(`/collector/bins/${binId}/collect`, payload, {
        params: {
            collector_lat: collector_lat ? parseFloat(collector_lat) : null,
            collector_lng: collector_lng ? parseFloat(collector_lng) : null
        }
    });
    return res.data;
};

export const getHistory = async () => {
    const res = await client.get('/collector/history');
    return res.data;
};

export const getStats = async () => {
    const res = await client.get('/collector/stats');
    return res.data;
};

