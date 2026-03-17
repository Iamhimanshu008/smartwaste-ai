import client from './client';

export const getDashboard = async () => {
    const res = await client.get('/subadmin/dashboard');
    return res.data;
};

export const getReports = async (status = 'pending') => {
    const res = await client.get('/subadmin/reports', {
        params: { status },
    });
    return res.data;
};

export const verifyReport = async (id, payload) => {
    const res = await client.post(`/subadmin/reports/${id}/verify`, payload);
    return res.data;
};

export const getRoutes = async () => {
    const res = await client.get('/subadmin/routes');
    return res.data;
};

export const getBins = async () => {
    const res = await client.get('/subadmin/bins');
    return res.data;
};

export const getAnalytics = async () => {
    const res = await client.get('/subadmin/analytics');
    return res.data;
};
