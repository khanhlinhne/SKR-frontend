import { Link, useLocation } from 'react-router-dom';
import * as motion from 'motion/react-client';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    FileText,
    Brain,
    MessageSquare,
    Calendar,
    Trophy,
    User,
    Settings,
    LogOut,
    Zap,
    GraduationCap
} from 'lucide-react';

export default function DashboardSidebar() {
    const location = useLocation();

    const menuItems = [
        { icon: BarChart3, label: 'Tổng quan', path: '/dashboard' },
        { icon: BookOpen, label: 'Môn học', path: '/subjects' },
        { icon: CreditCard, label: 'Flashcards', path: '/flashcards' },
        { icon: FileText, label: 'Thi thử', path: '/tests' },
        { icon: Brain, label: 'AI Assistant', path: '/ai-assistant', badge: 'Premium' },
        { icon: MessageSquare, label: 'Cộng đồng', path: '/community' },
        { icon: Calendar, label: 'Lịch học', path: '/schedule' },
        { icon: Trophy, label: 'Thành tích', path: '/achievements' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-64 bg-base-100 border-r border-base-300 flex flex-col"
        >
            {/* Logo */}
            <div className="p-6 border-b border-base-300">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-base-content">SKR</h1>
                        <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                            Smart Knowledge Revise
                        </p>
                    </div>
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item, i) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                    >
                        <Link
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all relative ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                            {item.badge && (
                                <span className="ml-auto badge badge-xs badge-warning font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </nav>

            {/* Premium Upgrade CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="m-4 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20"
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

            {/* Bottom Menu */}
            <div className="p-4 space-y-1 border-t border-base-300">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <Link
                        to="/profile"
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive('/profile')
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                                : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Hồ sơ
                    </Link>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.05 }}
                >
                    <Link
                        to="/settings"
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive('/settings')
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                                : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        Cài đặt
                    </Link>
                </motion.div>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </motion.button>
            </div>
        </motion.aside>
    );
}
