import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';

/**
 * FlashcardsHeader - Header component for flashcards page
 */
export default function FlashcardsHeader({ onCreateNew, searchValue = '', onSearchChange }) {
    const { profile } = useCurrentUserProfile();
    const userData = {
        name: profile.name || 'Người dùng',
        isPremium: profile.isPremium,
        avatar: profile.avatarUrl,
        notifications: 3,
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
                    <h2 className="text-xl font-black text-base-content sm:text-2xl">Flashcards</h2>
                    <p className="text-sm text-base-content/60 font-medium">Quản lý và học flashcards của bạn</p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap lg:gap-4">
                    <div className="relative min-w-0 flex-1 sm:flex-none">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => onSearchChange?.(event.target.value)}
                            placeholder="Tìm flashcard..."
                            className="input input-bordered w-full rounded-full border-base-300 bg-base-200 pl-10 focus:border-blue-500 sm:w-64"
                        />
                        <Icon name="Search" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCreateNew}
                        className="btn gap-2 rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-violet-700"
                    >
                        <Icon name="Plus" size="md" />
                        Tạo mới
                    </motion.button>

                    <div className="indicator">
                        {userData.notifications > 0 && (
                            <span className="indicator-item badge badge-sm badge-primary">{userData.notifications}</span>
                        )}
                        <button className="btn btn-circle btn-ghost">
                            <Icon name="Bell" size="md" />
                        </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 border-l border-base-300 pl-3 sm:pl-4">
                        <div className="hidden min-w-0 text-right sm:block">
                            <p className="font-bold text-sm text-base-content">{userData.name}</p>
                            {userData.isPremium && (
                                <div className="flex items-center justify-end gap-1">
                                    <Icon name="Star" size="xs" className="fill-orange-500 text-orange-500" />
                                    <p className="text-xs text-orange-500 font-bold">Premium User</p>
                                </div>
                            )}
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt={userData.name} className="h-10 w-10 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-xs font-black text-base-content">
                                        {getUserInitials(userData.name)}
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
