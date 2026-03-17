import client from './client';

export const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const res = await client.post('/auth/login', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};
