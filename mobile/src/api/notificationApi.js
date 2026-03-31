import client from './client';

export const registerDevice = async (expoPushToken) => {
    const res = await client.post('/auth/register-device', {
        expo_push_token: expoPushToken,
    });
    return res.data;
};

export const getNotifications = async () => {
    const res = await client.get('/notifications');
    return res.data;
};

export const getUnreadCount = async () => {
    const res = await client.get('/notifications/unread-count');
    return res.data;
};

export const markAsRead = async (notificationId) => {
    const res = await client.post(`/notifications/${notificationId}/read`);
    return res.data;
};

export const markAllAsRead = async () => {
    const res = await client.post('/notifications/read-all');
    return res.data;
};
