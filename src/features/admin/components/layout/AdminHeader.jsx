import { motion } from 'motion/react';
import { Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '@/shared/utils/tokenManager';

function getStoredAdmin() {
    try {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) {
            return { name: 'Admin', email: '' };
        }

        return {
            name: stored.name || stored.username || 'Admin',
            email: stored.email || '',
        };
    } catch {
        return { name: 'Admin', email: '' };
    }
}

export default function AdminHeader() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [admin] = useState(getStoredAdmin);

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
                        Quản trị hệ thống
                    </h2>
                    <p className="truncate text-sm font-medium text-base-content/60">
                        Chào mừng trở lại, {admin.name}!
                    </p>
                </div>

                <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3">
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-64 lg:w-80 pl-10 rounded-full bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

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

                    <div className="indicator">
                        <span className="indicator-item badge badge-sm bg-emerald-500 border-emerald-500 text-white">5</span>
                        <button className="btn btn-circle btn-ghost btn-sm">
                            <Bell className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 border-l border-base-300 pl-2 sm:pl-3">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-base-content">{admin.name}</p>
                            <div className="flex items-center justify-end gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <p className="text-xs text-emerald-600 font-bold">Administrator</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-9 h-9 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-base-100">
                                <img src="https://i.pravatar.cc/150?img=12" alt="Admin" />
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
