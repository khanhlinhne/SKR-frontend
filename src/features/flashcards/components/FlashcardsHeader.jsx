import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

/**
 * FlashcardsHeader - Header component for flashcards page
 */
export default function FlashcardsHeader({ onCreateNew, user }) {
    const defaultUser = {
        name: 'Đoàn Thế Anh',
        isPremium: true,
        avatar: 'https://i.pravatar.cc/150?img=33',
        notifications: 3,
    };

    const userData = user || defaultUser;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">Flashcards</h2>
                    <p className="text-sm text-base-content/60 font-medium">Quản lý và học flashcards của bạn</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm flashcard..."
                            className="input input-bordered w-64 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
                        />
                        <Icon name="Search" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCreateNew}
                        className="btn bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-2"
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

                    <div className="flex items-center gap-3 pl-4 border-l border-base-300">
                        <div className="text-right">
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
                                <img src={userData.avatar} alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
