import client from './client';

export const login = async (email, password) => {
    // Explicitly encode to avoid any object casting issues
    const formData = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

    const authResponse = await client.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    
    // Fetch the user object since the login only returns token
    const userResponse = await client.get('/auth/me', {
        headers: {
            Authorization: `Bearer ${authResponse.data.access_token}`
        }
    });

    return {
        access_token: authResponse.data.access_token,
        user: userResponse.data
    };
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};
