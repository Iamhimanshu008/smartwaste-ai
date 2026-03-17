import client from './client';

export const getDashboard = async () => {
    const res = await client.get('/admin/dashboard');
    return res.data;
};

export const getUsers = async () => {
    const res = await client.get('/admin/users');
    return res.data;
};

export const createUser = async (data) => {
    const res = await client.post('/admin/users', data);
    return res.data;
};

export const updateUser = async (id, data) => {
    const res = await client.put(`/admin/users/${id}`, data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await client.delete(`/admin/users/${id}`);
    return res.data;
};

export const getZones = async () => {
    const res = await client.get('/admin/zones');
    return res.data;
};

export const getBins = async () => {
    const res = await client.get('/admin/bins');
    return res.data;
};

export const createBin = async (data) => {
    const res = await client.post('/admin/bins', data);
    return res.data;
};

export const updateBin = async (id, data) => {
    const res = await client.put(`/admin/bins/${id}`, data);
    return res.data;
};

export const deleteBin = async (id) => {
    const res = await client.delete(`/admin/bins/${id}`);
    return res.data;
};

export const getAnalytics = async () => {
    const res = await client.get('/admin/analytics');
    return res.data;
};

export const getRoutes = async () => {
    const res = await client.get('/admin/routes');
    return res.data;
};

export const generateRoutes = async (zoneId) => {
    const params = zoneId ? `?zone_id=${zoneId}` : '';
    const res = await client.post(`/admin/routes/generate${params}`);
    return res.data;
};

export const getSettings = async () => {
    const res = await client.get('/admin/settings');
    return res.data;
};

export const updateSettings = async (data) => {
    const res = await client.put('/admin/settings', data);
    return res.data;
};

export const getReports = async () => {
    const res = await client.get('/admin/reports');
    return res.data;
};

export const exportExcel = async () => {
    const res = await client.get('/admin/export/excel', { responseType: 'blob' });
    return res.data;
};
