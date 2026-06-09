import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store';
import {
    LayoutDashboard, Users, Trash2, MapPin, FileText,
    Settings, LogOut, Menu, ChevronLeft, Truck,
    ClipboardCheck, BarChart3, Calendar, Recycle, Building, Newspaper,
    Home, Globe, Package, UserCheck, IndianRupee, FileBarChart,
    BrainCircuit, Bell, UserCog, Cpu
} from 'lucide-react';

const roleNavItems = {
    admin: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/bins', icon: Trash2, label: 'Bins' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/routes', icon: MapPin, label: 'Routes' },
        { to: '/admin/recyclers', icon: Building, label: 'Recyclers' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/news', icon: Newspaper, label: 'News Feed' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
    sub_admin: [
        { to: '/subadmin', icon: ClipboardCheck, label: 'Reports', end: true },
        { to: '/subadmin/map', icon: MapPin, label: 'Zone Map' },
        { to: '/subadmin/recyclers', icon: Building, label: 'Recyclers' },
        { to: '/subadmin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
    shg: [
        { to: '/shg', icon: Trash2, label: 'My Bins', end: true },
        { to: '/shg/report', icon: FileText, label: 'Report' },
        { to: '/shg/history', icon: FileText, label: 'History' },
        { to: '/shg/schedule', icon: Calendar, label: 'Schedule' },
    ],
    collector: [
        { to: '/collector', icon: Truck, label: "Today's Route", end: true },
        { to: '/collector/history', icon: FileText, label: 'History' },
    ],
};

/* ── New admin dashboard menu sections ── */
const dashboardMenuSections = [
    {
        title: 'MAIN MENU',
        items: [
            { key: 'overview', icon: Home, label: 'Overview Dashboard', emoji: '🏠' },
            { key: 'geographic', icon: Globe, label: 'Geographic Analytics', emoji: '🗺️' },
            { key: 'waste_ops', icon: Package, label: 'Waste Collection & Ops', emoji: '♻️' },
            { key: 'citizen', icon: Users, label: 'Citizen & Household Data', emoji: '👥' },
            { key: 'revenue', icon: IndianRupee, label: 'Revenue & Waste Economy', emoji: '💰' },
            { key: 'compliance', icon: FileBarChart, label: 'Compliance & Reporting', emoji: '📋' },
            { key: 'ai_insights', icon: BrainCircuit, label: 'AI & Quality Insights', emoji: '🤖' },
            { key: 'alerts', icon: Bell, label: 'Alerts & Notifications', emoji: '🔔' },
            { key: 'users', icon: UserCog, label: 'User & Role Management', emoji: '👤' },
            { key: 'settings', icon: Settings, label: 'System & Configuration', emoji: '⚙️' },
        ]
    },
];

/* ── Legacy tabs that still exist but are accessed from "System & Configuration" ── */
const legacyTabKeys = [
    'panchayat', 'rural', 'qrmanager', 'bins', 'collectors', 'routes',
    'iot', 'ai', 'gamification', 'store', 'recyclers', 'analytics'
];

export default function Sidebar({ activeTab, onTabChange, tabs }) {
    const { user, logout, sidebarOpen, toggleSidebar } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = roleNavItems[user?.role] || [];

    // Show dashboard tabs when on the /admin page (exact match)
    const isAdminDashboard = location.pathname === '/admin';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`sidebar-desktop fixed left-0 top-0 h-full z-40 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-[260px]' : 'w-20'
                    }`}
                style={{ background: '#14532D' }}
            >
                {/* Header / Logo */}
                <div className="flex items-center justify-between p-4 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {sidebarOpen && (
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center">
                                <img src="/logo.png" className="h-10 w-auto" alt="Logo" />
                            </div>
                            <div>
                                <span className="font-bold text-sm leading-tight block text-white">Swachhata<br />Chakra</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-3 px-2 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
                    {/* Regular nav links — always shown for non-admin or admin on other pages */}
                    {!isAdminDashboard && (
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'text-white font-semibold shadow-lg'
                                            : 'hover:text-white hover:bg-white/10'
                                        }`
                                    }
                                    style={({ isActive }) => isActive ? { background: '#16A34A', color: '#fff' } : { color: '#D1FAE5' }}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* NEW: Dashboard section menu items — shown on /admin route */}
                    {isAdminDashboard && (
                        <>
                            {dashboardMenuSections.map((section) => (
                                <div key={section.title}>
                                    {sidebarOpen && (
                                        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mt-4 mb-2" style={{ color: '#EA580C' }}>
                                            {section.title}
                                        </p>
                                    )}
                                    {!sidebarOpen && (
                                        <div className="my-2 border-t border-white/10" />
                                    )}
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.key;
                                            return (
                                                <button
                                                    key={item.key}
                                                    onClick={() => onTabChange && onTabChange(item.key)}
                                                    title={!sidebarOpen ? item.label : undefined}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left relative ${isActive ? 'font-semibold shadow-lg' : 'hover:bg-white/10'
                                                        }`}
                                                    style={
                                                        isActive
                                                            ? { background: '#16A34A', color: '#fff', borderLeft: '3px solid #fff' }
                                                            : { color: '#D1FAE5' }
                                                    }
                                                >
                                                    {sidebarOpen ? (
                                                        <span className="text-base flex-shrink-0 w-5 text-center">{item.emoji}</span>
                                                    ) : (
                                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                                    )}
                                                    {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Legacy tabs section — for existing features */}
                            {tabs && tabs.length > 0 && (() => {
                                const legacyTabs = tabs.filter(t => legacyTabKeys.includes(t.key));
                                if (legacyTabs.length === 0) return null;
                                return (
                                    <>
                                        {sidebarOpen && (
                                            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mt-5 mb-2" style={{ color: '#EA580C' }}>
                                                Operations
                                            </p>
                                        )}
                                        {!sidebarOpen && (
                                            <div className="my-2 border-t border-white/10" />
                                        )}
                                        <div className="space-y-0.5">
                                            {legacyTabs.map((t) => {
                                                const Icon = t.icon;
                                                const isActive = activeTab === t.key;
                                                return (
                                                    <button
                                                        key={t.key}
                                                        onClick={() => onTabChange && onTabChange(t.key)}
                                                        title={!sidebarOpen ? t.label : undefined}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 w-full text-left ${isActive ? 'font-semibold shadow-lg' : 'hover:bg-white/10'
                                                            }`}
                                                        style={
                                                            isActive
                                                                ? { background: '#16A34A', color: '#fff', borderLeft: '3px solid #fff' }
                                                                : { color: '#D1FAE5' }
                                                        }
                                                    >
                                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                                        {sidebarOpen && <span className="truncate text-xs">{t.label}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    )}
                </nav>

                {/* User Info + Version + Logout */}
                <div className="p-3 border-t border-white/10">
                    {sidebarOpen && user && (
                        <div className="mb-3 px-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(22,163,74,0.3)', color: '#D1FAE5' }}>
                                    {((user.full_name || user.name || 'U')[0] || 'U').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate text-white">{user.full_name || user.name}</p>
                                    <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>

                    {/* Version badge + Powered by */}
                    {sidebarOpen && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-center">
                            <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.2)', color: '#86EFAC' }}>
                                v2.4.3
                            </span>
                            <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Powered by Team CodeX
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1 flex items-center justify-around safe-area-bottom">
                {navItems.slice(0, 5).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${isActive
                                ? 'text-sw-mid font-semibold'
                                : 'text-gray-400'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-[56px]">{item.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-gray-400 hover:text-red-400"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px]">Logout</span>
                </button>
            </nav>
        </>
    );
}
