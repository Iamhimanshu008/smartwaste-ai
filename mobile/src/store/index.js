import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
    // ── Auth ────────────────────────────────────────────────
    user: null,
    token: null,

    login: async (user, token) => {
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));
        set({ user, token });
    },

    logout: async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_user');
        set({ user: null, token: null });
    },

    loadStoredAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userStr = await AsyncStorage.getItem('auth_user');
            if (token && userStr) {
                set({ token, user: JSON.parse(userStr) });
                return true;
            }
        } catch (_) { }
        return false;
    },

    // ── Route ────────────────────────────────────────────────
    todayRoute: null,
    routeLoading: false,

    setTodayRoute: (route) => set({ todayRoute: route }),
    setRouteLoading: (loading) => set({ routeLoading: loading }),

    markStopCollected: (binId) =>
        set((state) => {
            if (!state.todayRoute) return state;
            const updatedStops = state.todayRoute.stops.map((s) =>
                s.bin_id === binId ? { ...s, status: 'collected' } : s
            );
            const collected = updatedStops.filter((s) => s.status === 'collected').length;
            return {
                todayRoute: {
                    ...state.todayRoute,
                    stops: updatedStops,
                    collected_stops: collected,
                },
            };
        }),

    // ── Bins ────────────────────────────────────────────────
    publicBins: [],
    setPublicBins: (bins) => set({ publicBins: bins }),

    // ── Notifications ───────────────────────────────────────
    unreadCount: 0,
    setUnreadCount: (count) => set({ unreadCount: count }),
    notifications: [],
    setNotifications: (list) => set({ notifications: list }),
}));

export default useStore;
