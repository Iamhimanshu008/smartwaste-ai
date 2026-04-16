import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // ── Auth Slice ──────────────────────────────────────
            user: null,
            token: null,
            refreshToken: null,
            
            login: (user, token, refreshToken) => set({ user, token, refreshToken }),
            
            logout: () => set({ user: null, token: null, refreshToken: null }),

            refreshAccessToken: async () => {
                const rt = get().refreshToken;
                if (!rt) {
                    get().logout();
                    return null;
                }
                try {
                    const API_BASE = import.meta.env.VITE_API_URL || '/api';
                    const response = await fetch(`${API_BASE}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: rt })
                    });
                    if (!response.ok) throw new Error('Refresh failed');
                    const data = await response.json();
                    
                    set({ token: data.access_token });
                    return data.access_token;
                } catch (e) {
                    get().logout();
                    return null;
                }
            },

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
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export default useStore;
