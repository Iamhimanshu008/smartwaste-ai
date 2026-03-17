import client from './client';

export const getPublicRecyclers = async (type = null) => {
    const url = type ? `/recyclers?type=${type}` : '/recyclers';
    const response = await client.get(url);
    return response.data;
};

export const registerRecycler = async (data) => {
    const response = await client.post('/recyclers/register', data);
    return response.data;
};

export const getAdminRecyclers = async () => {
    const response = await client.get('/admin/recyclers');
    return response.data;
};

export const getRecyclerGlobalStats = async () => {
    const response = await client.get('/admin/recyclers/stats');
    return response.data;
};

export const createAdminRecycler = async (data) => {
    const response = await client.post('/admin/recyclers', data);
    return response.data;
};

export const updateAdminRecycler = async (id, data) => {
    const response = await client.put(`/admin/recyclers/${id}`, data);
    return response.data;
};

export const deleteAdminRecycler = async (id) => {
    const response = await client.delete(`/admin/recyclers/${id}`);
    return response.data;
};

export const requestPickup = async (recyclerId, quantity_kg, notes = "") => {
    const response = await client.post(`/recyclers/${recyclerId}/bid`, {
        quantity_kg: parseFloat(quantity_kg),
        notes
    });
    return response.data;
};
