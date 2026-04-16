import client from './client';

export const login = async (email, password) => {
    // Backend expects JSON body with { email, password } (LoginRequest model)
    const authResponse = await client.post('/auth/login', {
        email,
        password,
    });
    
    // Fetch the user object since the login only returns token
    const userResponse = await client.get('/auth/me', {
        headers: {
            Authorization: `Bearer ${authResponse.data.access_token}`
        }
    });

    return {
        access_token: authResponse.data.access_token,
        refresh_token: authResponse.data.refresh_token,
        user: userResponse.data
    };
};

export const getMe = async () => {
    const res = await client.get('/auth/me');
    return res.data;
};
