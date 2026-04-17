import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { clearTokens } from '@/shared/utils/tokenManager';
import {
    BarChart3,
    BookOpen,
    BookMarked,
    CreditCard,
    FileText,
    Brain,
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
        { icon: BarChart3, label: 'Tổng quan', path: '/dashboard' },
        { icon: BookMarked, label: 'Khóa học của tôi', path: '/my-courses' },
        { icon: BookOpen, label: 'Môn học', path: '/courses' },
        { icon: CreditCard, label: 'Flashcards', path: '/flashcards' },
        { icon: FileText, label: 'Thi thử', path: '/tests' },
        { icon: Brain, label: 'AI Assistant', path: '/ai-assistant', badge: 'Premium' },
    ];

    const bottomItems = [
        { icon: User, label: 'Hồ sơ', path: '/profile' },
        { icon: Settings, label: 'Cài đặt', path: '/settings' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0, width: collapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex h-full flex-shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-100"
        >
            <div className={`flex-shrink-0 border-b border-base-300 ${collapsed ? 'flex justify-center p-3' : 'p-5'}`}>
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg">
                            <GraduationCap className="h-6 w-6 text-white" strokeWidth={2.5} />
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
                                <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                                    Smart Knowledge Revise
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
                        <SidebarLink item={item} collapsed={collapsed} isActive={isActive(item.path)} />
                    </motion.div>
                ))}
            </nav>

            {!collapsed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mx-3 mb-2 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-4"
                >
                    <div className="mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <h3 className="text-sm font-black text-base-content">Nâng cấp Premium</h3>
                    </div>
                    <p className="mb-3 text-xs text-base-content/70">
                        Mở khóa AI Assistant, Spaced Repetition và nhiều hơn nữa.
                    </p>
                    <Link to="/pricing">
                        <button className="btn btn-sm w-full rounded-xl border-none bg-gradient-to-r from-orange-500 to-pink-500 font-bold text-white hover:from-orange-600 hover:to-pink-600">
                            Nâng cấp ngay
                        </button>
                    </Link>
                </motion.div>
            )}

            {collapsed && (
                <div className="mb-2 flex justify-center">
                    <Link
                        to="/pricing"
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10"
                    >
                        <Zap className="h-4 w-4 text-orange-500" />
                        <div className="pointer-events-none absolute left-full z-[60] ml-3 whitespace-nowrap rounded-xl bg-base-content px-3 py-1.5 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            Nâng cấp Premium
                            <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-base-content" />
                        </div>
                    </Link>
                </div>
            )}

            <div className="space-y-0.5 border-t border-base-300 px-2 py-2">
                {bottomItems.map((item) => (
                    <SidebarLink key={item.path} item={item} collapsed={collapsed} isActive={isActive(item.path)} />
                ))}
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
    );
}

function SidebarLink({ item, collapsed, isActive }) {
    return (
        <Link
            to={item.path}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                collapsed ? 'justify-center' : ''
            } ${
                isActive
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
            }`}
        >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
            {!collapsed && item.badge && (
                <span className="badge badge-warning badge-xs ml-auto flex-shrink-0 font-bold">{item.badge}</span>
            )}
            {collapsed && (
                <div className="pointer-events-none absolute left-full z-[60] ml-3 whitespace-nowrap rounded-xl bg-base-content px-3 py-1.5 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    {item.label}
                    {item.badge && <span className="badge badge-warning badge-xs ml-1.5 font-bold">{item.badge}</span>}
                    <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-base-content" />
                </div>
            )}
        </Link>
    );
}
