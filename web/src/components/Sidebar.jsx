import { NavLink, useNavigate } from 'react-router-dom';
import useStore from '../store';
import {
    LayoutDashboard, Users, Trash2, MapPin, FileText,
    Settings, LogOut, Menu, ChevronLeft, Truck,
    ClipboardCheck, BarChart3, Calendar, Recycle, Building
} from 'lucide-react';

const roleNavItems = {
    admin: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/bins', icon: Trash2, label: 'Bins' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/routes', icon: MapPin, label: 'Routes' },
        { to: '/admin/recyclers', icon: Building, label: 'Recyclers' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
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

export default function Sidebar() {
    const { user, logout, sidebarOpen, toggleSidebar } = useStore();
    const navigate = useNavigate();
    const navItems = roleNavItems[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`sidebar-desktop fixed left-0 top-0 h-full bg-gradient-to-b from-sw-dark to-[#143728] text-white z-40 transition-all duration-300 flex flex-col ${
                    sidebarOpen ? 'w-64' : 'w-20'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sw-light/20 flex items-center justify-center">
                                <Recycle className="w-5 h-5 text-sw-light" />
                            </div>
                            <div>
                                <span className="font-bold text-base tracking-tight">SmartWaste</span>
                                <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-sw-light/20 rounded text-sw-light font-semibold">AI</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-sw-light text-sw-dark font-semibold shadow-lg shadow-sw-light/20'
                                        : 'text-white/60 hover:text-white hover:bg-white/8'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div className="p-4 border-t border-white/10">
                    {sidebarOpen && user && (
                        <div className="mb-3 px-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-sw-light/20 flex items-center justify-center text-sm font-bold text-sw-light">
                                    {(user.full_name || user.name || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{user.full_name || user.name}</p>
                                    <p className="text-xs text-white/40 capitalize">{user.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
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
                            `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
                                isActive
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
