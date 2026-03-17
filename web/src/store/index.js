import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // ── Auth Slice ──────────────────────────────────────
            user: null,
            token: null,
            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),

            // ── Bins Slice ──────────────────────────────────────
            bins: [],
            fetchBins: (bins) => set({ bins }),
            updateBin: (updatedBin) =>
                set((state) => ({
                    bins: state.bins.map((b) =>
                        b.id === updatedBin.id ? { ...b, ...updatedBin } : b
                    ),
                })),

            // ── Routes Slice ────────────────────────────────────
            routes: [],
            fetchRoutes: (routes) => set({ routes }),

            // ── UI Slice ────────────────────────────────────────
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'smartwaste-store',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
        }
    )
);

export default useStore;
