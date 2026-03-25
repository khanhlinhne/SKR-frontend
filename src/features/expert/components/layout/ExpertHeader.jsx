import { motion } from 'motion/react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

function getStoredExpert() {
    try {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) return { name: 'Expert', email: '' };
        return {
            name: stored.name || stored.username || 'Expert',
            email: stored.email || '',
            avatar: stored.avatar || null,
        };
    } catch {
        return { name: 'Expert', email: '' };
    }
}

export default function ExpertHeader() {
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [expert] = useState(getStoredExpert);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'synthwave' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-6 lg:px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">
                        Creator Studio
                    </h2>
                    <p className="text-sm text-base-content/60 font-medium">
                        Xin chào, {expert.name}! 🚀
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-3 pl-3 border-l border-base-300">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-base-content">{expert.name}</p>
                            <div className="flex items-center justify-end gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                <p className="text-xs text-violet-600 font-bold">Expert</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-9 h-9 rounded-full ring-2 ring-violet-500 ring-offset-2 ring-offset-base-100">
                                <img
                                    src={expert.avatar || 'https://i.pravatar.cc/150?img=32'}
                                    alt={expert.name}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
