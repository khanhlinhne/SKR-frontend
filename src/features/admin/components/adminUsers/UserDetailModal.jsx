import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import {
    X, User, BookOpen, Activity, Mail, Shield, ShieldOff,
} from 'lucide-react';
import { overlayVariants, modalVariants, statusConfig, roleBadgeStyle } from './constants';
import OverviewTab from './OverviewTab';
import CoursesTab from './CoursesTab';
import ActivityTab from './ActivityTab';

/**
 * UserDetailModal - Modal xem chi tiết người dùng với 3 tabs.
 */
export default function UserDetailModal({ user, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const status = statusConfig[user.status];

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: User },
        { id: 'courses', label: 'Khóa học', icon: BookOpen },
        { id: 'activity', label: 'Hoạt động', icon: Activity },
    ];

    return (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="relative bg-base-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header - Fixed */}
                <div className="flex-shrink-0">
                    <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-base-300">
                        <div className="avatar flex-shrink-0">
                            <div className="w-14 h-14 rounded-2xl ring-2 ring-base-300 shadow-lg">
                                <img src={user.avatar} alt={user.name} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-black text-base-content truncate">{user.name}</h2>
                                <span className={`badge badge-sm font-bold ${roleBadgeStyle[user.role] || 'badge-ghost'}`}>{user.role}</span>
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-sm text-base-content/60 truncate mt-0.5">{user.email}</p>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 pt-3 pb-0">
                        <div className="flex gap-1 p-1 bg-base-200 rounded-xl">
                            {tabs.map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                            ? 'bg-base-100 shadow text-base-content'
                                            : 'text-base-content/50 hover:text-base-content/80'}`}
                                    >
                                        <TabIcon className="w-3.5 h-3.5" /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && <OverviewTab key="overview" user={user} />}
                        {activeTab === 'courses' && <CoursesTab key="courses" user={user} />}
                        {activeTab === 'activity' && <ActivityTab key="activity" user={user} />}
                    </AnimatePresence>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t border-base-300 bg-base-200/50">
                    <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1">
                        <Mail className="w-3.5 h-3.5" /> Gửi email
                    </button>
                    {user.status === 'banned' ? (
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold text-emerald-600 gap-1">
                            <Shield className="w-3.5 h-3.5" /> Mở khóa
                        </button>
                    ) : (
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold text-red-500 gap-1">
                            <ShieldOff className="w-3.5 h-3.5" /> Khóa tài khoản
                        </button>
                    )}
                    <div className="flex-1" />
                    <button onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Đóng</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
