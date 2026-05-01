import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Star, LogOut } from 'lucide-react';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';
import { clearTokens } from '@/shared/utils/tokenManager';

function getDisplayName(name) {
    return name || 'Người dùng';
}

function getGreetingName(name) {
    const displayName = getDisplayName(name);
    const parts = displayName.trim().split(/\s+/);
    return parts[parts.length - 1] || displayName;
}

export default function DashboardHeader() {
    const navigate = useNavigate();
    const { profile } = useCurrentUserProfile();
    const displayName = getDisplayName(profile.name);
    const greetingName = getGreetingName(displayName);

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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-base-content sm:text-2xl">Xin chào, {greetingName}!</h2>
                    <p className="text-sm font-medium text-base-content/60">Hôm nay bạn muốn học gì?</p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap lg:gap-4">
                    <div className="relative min-w-0 flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-full rounded-full border-base-300 bg-base-200 pl-10 focus:border-blue-500 sm:w-72 xl:w-96"
                        />
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="indicator">
                        <span className="indicator-item badge badge-primary badge-sm">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 border-l border-base-300 pl-3 sm:pl-4">
                        <div className="hidden min-w-0 text-right sm:block">
                            <p className="text-sm font-bold text-base-content">{displayName}</p>
                            {profile.isPremium && (
                                <div className="flex items-center justify-end gap-1">
                                    <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                                    <p className="text-xs font-bold text-orange-500">Premium User</p>
                                </div>
                            )}
                        </div>

                        <div className="avatar">
                            <div className="w-10 overflow-hidden rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={displayName} className="h-10 w-10 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center bg-base-200 text-xs font-black text-base-content">
                                        {getUserInitials(displayName)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="btn btn-circle btn-ghost text-red-500 hover:bg-red-500/10 md:hidden"
                            aria-label="Đăng xuất"
                            title="Đăng xuất"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
