import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { clearTokens } from '@/shared/utils/tokenManager';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Shield,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

const SIDEBAR_KEY = 'skr-admin-sidebar-collapsed';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_KEY, collapsed);
        } catch {
            // ignore persistence errors
        }
    }, [collapsed]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
        { icon: Users, label: 'Người dùng', path: '/admin/users' },
        { icon: BookOpen, label: 'Khóa học', path: '/admin/courses' },
    ];

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const mobileItems = [
        ...menuItems,
        { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
    ];

    return (
        <>
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0, width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden h-full flex-shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-100 md:flex"
        >
            <div className={`flex-shrink-0 border-b border-base-300 ${collapsed ? 'flex justify-center p-3' : 'p-5'}`}>
                <div className="flex items-center gap-3">
                    <Link to="/admin" className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 shadow-lg">
                            <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                    </Link>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="min-w-0"
                        >
                            <Link to="/admin">
                                <h1 className="text-xl font-black text-base-content">SKR Admin</h1>
                                <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                                    Management Panel
                                </p>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className={`flex px-3 pt-3 ${collapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-base-content/40 transition-all hover:bg-base-200 hover:text-base-content"
                    title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                >
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 py-2">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.04 }}
                    >
                        <Link
                            to={item.path}
                            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                                collapsed ? 'justify-center' : ''
                            } ${
                                isActive(item.path)
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                            }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                            {collapsed && (
                                <div className="pointer-events-none absolute left-full z-[60] ml-3 whitespace-nowrap rounded-xl bg-base-content px-3 py-1.5 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                    {item.label}
                                    <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-base-content" />
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </nav>

            <div className="space-y-0.5 border-t border-base-300 px-2 py-2">
                <Link
                    to="/admin/settings"
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                        collapsed ? 'justify-center' : ''
                    } ${
                        isActive('/admin/settings')
                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                            : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                    }`}
                >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">Cài đặt</span>}
                    {collapsed && (
                        <div className="pointer-events-none absolute left-full z-[60] ml-3 whitespace-nowrap rounded-xl bg-base-content px-3 py-1.5 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            Cài đặt
                            <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-base-content" />
                        </div>
                    )}
                </Link>

                <button
                    onClick={handleLogout}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10 ${
                        collapsed ? 'justify-center' : ''
                    }`}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Đăng xuất</span>}
                    {collapsed && (
                        <div className="pointer-events-none absolute left-full z-[60] ml-3 whitespace-nowrap rounded-xl bg-base-content px-3 py-1.5 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            Đăng xuất
                            <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-base-content" />
                        </div>
                    )}
                </button>
            </div>
        </motion.aside>
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 px-2 py-2 shadow-2xl backdrop-blur md:hidden">
            <div className="flex gap-1 overflow-x-auto">
                {mobileItems.map((item) => (
                    <MobileNavLink key={item.path} item={item} isActive={isActive(item.path)} />
                ))}
            </div>
        </nav>
        </>
    );
}

function MobileNavLink({ item, isActive }) {
    return (
        <Link
            to={item.path}
            className={`flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition-all ${
                isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                    : 'text-base-content/55 hover:bg-base-200 hover:text-base-content'
            }`}
        >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="max-w-full truncate">{item.label}</span>
        </Link>
    );
}
