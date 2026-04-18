import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { clearTokens } from '@/shared/utils/tokenManager';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Shield,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    CreditCard,
    MessageSquare,
    Bell,
} from 'lucide-react';

const SIDEBAR_KEY = 'skr-admin-sidebar-collapsed';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
    });

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };

    useEffect(() => {
        try { localStorage.setItem(SIDEBAR_KEY, collapsed); } catch { /* ignore persistence errors */ }
    }, [collapsed]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
        { icon: Users, label: 'Người dùng', path: '/admin/users' },
        { icon: BookOpen, label: 'Khóa học', path: '/admin/courses' },
        { icon: FileText, label: 'Bài thi', path: '/admin/tests' },
        { icon: CreditCard, label: 'Đơn hàng', path: '/admin/orders' },
        { icon: BarChart3, label: 'Thống kê', path: '/admin/analytics' },
        { icon: MessageSquare, label: 'Phản hồi', path: '/admin/feedback' },
        { icon: Bell, label: 'Thông báo', path: '/admin/notifications' },
    ];

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0, width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-r border-base-300 flex flex-col flex-shrink-0 overflow-hidden h-full"
        >
            {/* Logo */}
            <div className={`border-b border-base-300 flex-shrink-0 ${collapsed ? 'p-3 flex justify-center' : 'p-5'}`}>
                <div className="flex items-center gap-3">
                    <Link to="/admin" className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider whitespace-nowrap">
                                    Management Panel
                                </p>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Toggle collapse button */}
            <div className={`px-3 pt-3 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                    onClick={() => setCollapsed(prev => !prev)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-200 transition-all"
                    title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                >
                    {collapsed
                        ? <PanelLeftOpen className="w-4 h-4" />
                        : <PanelLeftClose className="w-4 h-4" />
                    }
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item, i) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                    >
                        <Link
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all relative group
                                ${collapsed ? 'justify-center' : ''}
                                ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                                }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                                <span className="truncate whitespace-nowrap">{item.label}</span>
                            )}
                            {!collapsed && item.badge && (
                                <span className="ml-auto badge badge-xs badge-warning font-bold flex-shrink-0">
                                    {item.badge}
                                </span>
                            )}
                            {/* Tooltip when collapsed */}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                                    {item.label}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </nav>

            {/* Bottom Menu */}
            <div className="px-2 py-2 space-y-0.5 border-t border-base-300">
                <Link
                    to="/admin/settings"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all relative group
                        ${collapsed ? 'justify-center' : ''}
                        ${isActive('/admin/settings')
                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                            : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                        }`}
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">Cài đặt</span>}
                    {collapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                            Cài đặt
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                        </div>
                    )}
                </Link>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all relative group
                        ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Đăng xuất</span>}
                    {collapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                            Đăng xuất
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                        </div>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
