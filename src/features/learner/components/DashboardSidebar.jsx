import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    FileText,
    Brain,
    MessageSquare,
    Calendar,
    Trophy,
    ShoppingBag,
    User,
    Settings,
    LogOut,
    Zap,
    GraduationCap,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

const SIDEBAR_KEY = 'skr-dashboard-sidebar-collapsed';

export default function DashboardSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
    });

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        try { localStorage.setItem(SIDEBAR_KEY, collapsed); } catch { /* ignore persistence errors */ }
    }, [collapsed]);

    const menuItems = [
        { icon: BarChart3, label: 'Tổng quan', path: '/dashboard' },
        { icon: BookOpen, label: 'Môn học', path: '/courses' },
        { icon: CreditCard, label: 'Flashcards', path: '/flashcards' },
        { icon: FileText, label: 'Thi thử', path: '/tests' },
        { icon: ShoppingBag, label: 'Đơn hàng', path: '/orders' },
        { icon: Brain, label: 'AI Assistant', path: '/ai-assistant', badge: 'Premium' },
        { icon: MessageSquare, label: 'Cộng đồng', path: '/community' },
        { icon: Calendar, label: 'Lịch học', path: '/schedule' },
        { icon: Trophy, label: 'Thành tích', path: '/achievements' }
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0, width: collapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-r border-base-300 flex flex-col flex-shrink-0 overflow-hidden h-full"
        >
            {/* Logo */}
            <div className={`border-b border-base-300 flex-shrink-0 ${collapsed ? 'p-3 flex justify-center' : 'p-5'}`}>
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                    </Link>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="min-w-0"
                        >
                            <Link to="/dashboard">
                                <h1 className="text-xl font-black text-base-content">SKR</h1>
                                <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider whitespace-nowrap">
                                    Smart Knowledge Revise
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
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
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
                                    {item.badge && (
                                        <span className="ml-1.5 badge badge-xs badge-warning font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </nav>

            {/* Premium Upgrade CTA — expanded */}
            {!collapsed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mx-3 mb-2 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <h3 className="font-black text-sm text-base-content">Nâng cấp Premium</h3>
                    </div>
                    <p className="text-xs text-base-content/70 mb-3">
                        Mở khóa AI Assistant, Spaced Repetition và nhiều hơn!
                    </p>
                    <Link to="/pricing">
                        <button className="btn btn-sm w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-none rounded-xl font-bold">
                            Nâng cấp ngay
                        </button>
                    </Link>
                </motion.div>
            )}
            {/* Premium icon — collapsed */}
            {collapsed && (
                <div className="flex justify-center mb-2">
                    <Link
                        to="/pricing"
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 flex items-center justify-center group relative"
                    >
                        <Zap className="w-4 h-4 text-orange-500" />
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                            Nâng cấp Premium
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                        </div>
                    </Link>
                </div>
            )}

            {/* Bottom Menu */}
            <div className="px-2 py-2 space-y-0.5 border-t border-base-300">
                {[
                    { icon: User, label: 'Hồ sơ', path: '/profile' },
                    { icon: Settings, label: 'Cài đặt', path: '/settings' },
                ].map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all relative group
                            ${collapsed ? 'justify-center' : ''}
                            ${isActive(item.path)
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                                : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                            }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                                {item.label}
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                            </div>
                        )}
                    </Link>
                ))}
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
