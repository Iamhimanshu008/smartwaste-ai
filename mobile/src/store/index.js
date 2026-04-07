import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
    persist(
        (set, get) => ({
            // ── Auth ────────────────────────────────────────────────
            user: null,
            token: null,

            login: (user, token) => set({ user, token }),

            logout: () => set({ user: null, token: null }),

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
                user: state.user,
            }),
        }
    )
);

export default useStore;
