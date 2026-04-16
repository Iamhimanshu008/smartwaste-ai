import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
    persist(
        (set, get) => ({
            // ── Auth ────────────────────────────────────────────────
            user: null,
            token: null,
            refreshToken: null,

            login: async (user, token, refreshToken) => {
                set({ user, token, refreshToken });
                try {
                    await AsyncStorage.setItem('auth_token', token);
                    if (refreshToken) {
                        await AsyncStorage.setItem('refresh_token', refreshToken);
                    }
                    if (user) {
                        await AsyncStorage.setItem('auth_user', JSON.stringify(user));
                    }
                } catch (e) {}
            },

            logout: async () => {
                set({ user: null, token: null, refreshToken: null });
                try {
                    await AsyncStorage.removeItem('auth_token');
                    await AsyncStorage.removeItem('refresh_token');
                    await AsyncStorage.removeItem('auth_user');
                } catch (e) {}
            },

            refreshAccessToken: async () => {
                const rt = get().refreshToken || await AsyncStorage.getItem('refresh_token');
                if (!rt) {
                    get().logout();
                    return null;
                }
                try {
                    // Use a direct fetch/axios call ignoring interceptors to prevent loops
                    const response = await fetch('https://smartwaste-ai-f0i9.onrender.com/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: rt })
                    });
                    if (!response.ok) throw new Error('Refresh failed');
                    const data = await response.json();
                    
                    set({ token: data.access_token });
                    await AsyncStorage.setItem('auth_token', data.access_token);
                    return data.access_token;
                } catch (e) {
                    get().logout();
                    return null;
                }
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
        }),
        {
            name: 'smartwaste-mobile-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                token: state.token,
                refreshToken: state.refreshToken,
                user: state.user,
            }),
        }
    )
);

export default useStore;
