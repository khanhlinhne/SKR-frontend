import * as motion from 'motion/react-client';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminHeader() {
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'synthwave' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Get admin info from localStorage
    const [admin, setAdmin] = useState({ name: 'Admin', email: '' });

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored) {
                setAdmin({
                    name: stored.name || stored.username || 'Admin',
                    email: stored.email || '',
                });
            }
        } catch { /* ignore */ }
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-6 lg:px-8 py-4"
        >
            <div className="flex items-center justify-between">
                {/* Left - Title */}
                <div>
                    <h2 className="text-2xl font-black text-base-content">
                        Quản trị hệ thống
                    </h2>
                    <p className="text-sm text-base-content/60 font-medium">
                        Chào mừng trở lại, {admin.name}!
                    </p>
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
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

                    {/* Theme Toggle */}
                    <button
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
                        <span className="indicator-item badge badge-sm bg-emerald-500 border-emerald-500 text-white">5</span>
                        <button className="btn btn-circle btn-ghost btn-sm">
                            <Bell className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Admin Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-base-300">
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
                </div>
            </div>
        </motion.header>
    );
}
