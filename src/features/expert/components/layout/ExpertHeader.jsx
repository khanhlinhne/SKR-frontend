import { motion } from 'motion/react';
import { Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';
import { clearTokens } from '@/shared/utils/tokenManager';

export default function ExpertHeader() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const { profile } = useCurrentUserProfile();
    const expert = {
        name: profile.name || 'Expert',
        email: profile.email || '',
        avatar: profile.avatarUrl || null,
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'synthwave' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-b border-base-300 bg-base-100 px-4 py-4 sm:px-6 lg:px-8"
        >
            <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-base-content sm:text-2xl">
                        Creator Studio
                    </h2>
                    <p className="truncate text-sm font-medium text-base-content/60">
                        Xin chào, {expert.name}! 🚀
                    </p>
                </div>

                <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học, bài giảng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-64 lg:w-80 pl-10 rounded-full bg-base-200 border-base-300 focus:border-violet-500 text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="btn btn-circle btn-ghost btn-sm"
                        title="Đổi giao diện"
                    >
                        {theme === 'light'
                            ? <Moon className="w-4 h-4" />
                            : <Sun className="w-4 h-4" />
                        }
                    </button>

                    {/* Notifications */}
                    <div className="indicator">
                        <span className="indicator-item badge badge-sm bg-violet-500 border-violet-500 text-white">2</span>
                        <button className="btn btn-circle btn-ghost btn-sm">
                            <Bell className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Profile */}
                    <div className="flex min-w-0 items-center gap-3 border-l border-base-300 pl-2 sm:pl-3">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-base-content">{expert.name}</p>
                            <div className="flex items-center justify-end gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                <p className="text-xs text-violet-600 font-bold">Expert</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-9 h-9 rounded-full ring-2 ring-violet-500 ring-offset-2 ring-offset-base-100">
                                {expert.avatar ? (
                                    <img
                                        src={expert.avatar}
                                        alt={expert.name}
                                        className="h-9 w-9 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-base-200 text-xs font-black text-base-content">
                                        {getUserInitials(expert.name)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-circle btn-ghost btn-sm text-red-500 hover:bg-red-500/10 md:hidden"
                        aria-label="Đăng xuất"
                        title="Đăng xuất"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.header>
    );
}
