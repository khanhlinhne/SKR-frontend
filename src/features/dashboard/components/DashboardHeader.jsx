import { motion } from 'motion/react';
import { Search, Bell, Star } from 'lucide-react';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';

function getDisplayName(name) {
    return name || 'Người dùng';
}

function getGreetingName(name) {
    const displayName = getDisplayName(name);
    const parts = displayName.trim().split(/\s+/);
    return parts[parts.length - 1] || displayName;
}

export default function DashboardHeader() {
    const { profile } = useCurrentUserProfile();
    const displayName = getDisplayName(profile.name);
    const greetingName = getGreetingName(displayName);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-b border-base-300 bg-base-100 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">Xin chào, {greetingName}!</h2>
                    <p className="text-sm font-medium text-base-content/60">Hôm nay bạn muốn học gì?</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-96 rounded-full border-base-300 bg-base-200 pl-10 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="indicator">
                        <span className="indicator-item badge badge-primary badge-sm">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 border-l border-base-300 pl-4">
                        <div className="text-right">
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
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
