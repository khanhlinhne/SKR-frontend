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
import adminApi from '@/shared/api/adminApi';

function normalizeUser(user) {
    const name = user.fullName || user.displayName || user.username || user.name || 'Người dùng';
    const avatar = user.avatar || user.avatarUrl || user.avatar_url || '';
    let role = user.role;
    if (!role && Array.isArray(user.roles) && user.roles.length > 0) {
        const firstRole = user.roles[0];
        role = typeof firstRole === 'string' ? firstRole : (firstRole.roleCode || firstRole.role_code || firstRole);
    }
    let status = user.status;
    if (status === undefined && user.isBanned !== undefined) {
        status = user.isBanned ? 'false' : 'true';
    }
    if (status === undefined && user.isActive !== undefined) {
        status = user.isActive ? 'true' : 'false';
    }
    let joinDate = user.joinDate || user.join_date || user.createdAt || user.created_at;
    if (joinDate) {
        try {
            const date = new Date(joinDate);
            if (!isNaN(date)) {
                joinDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        } catch { /* keep original */ }
    } else {
        joinDate = 'N/A';
    }
    let lastActive = user.lastActive || user.last_active || user.lastLoginAt || user.last_login_at;
    if (lastActive) {
        try {
            const date = new Date(lastActive);
            if (!isNaN(date)) {
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);
                if (diffMins < 60) lastActive = `${diffMins} phút trước`;
                else if (diffHours < 24) lastActive = `${diffHours} giờ trước`;
                else if (diffDays < 7) lastActive = `${diffDays} ngày trước`;
                else lastActive = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        } catch { /* keep original */ }
    } else {
        lastActive = 'N/A';
    }
    const phone = user.phone || user.phoneNumber || '';
    const address = user.address || user.location || '';
    const bio = user.bio || user.description || '';
    const totalSpent = user.totalSpent || user.total_spent || user.totalSpentAmount || '₫0';
    const completedCourses = user.completedCourses || user.completed_courses || 0;
    const certificates = user.certificates || user.certificateCount || 0;
    const courses = user.courseCount || user.course_count || user.courses || 0;
    const enrolledCourses = user.enrolledCourses || user.courses || [];
    const activityLog = user.activityLog || user.activities || [];

    return {
        id: user.id || user._id,
        name,
        email: user.email || '',
        role: role || 'Learner',
        status: status || 'active',
        avatar,
        phone,
        address,
        bio,
        totalSpent,
        completedCourses,
        certificates,
        courses,
        joinDate,
        lastActive,
        enrolledCourses,
        activityLog,
    };
}

/**
 * UserDetailModal - Modal xem chi tiết người dùng với 3 tabs.
 */
export default function UserDetailModal({ user, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [actionLoading, setActionLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);

    const u = normalizeUser(currentUser);
    const status = statusConfig[u.status] || statusConfig.active;

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: User },
        { id: 'courses', label: 'Khóa học', icon: BookOpen },
        { id: 'activity', label: 'Hoạt động', icon: Activity },
    ];

    const handleBanToggle = async () => {
        if (!u.id) return;
        const newIsActive = u.status === 'banned';
        setActionLoading(true);
        try {
            await adminApi.updateUserStatus(u.id, { isActive: newIsActive });
            setCurrentUser(prev => ({ ...prev, isActive: newIsActive }));
            onUpdate?.();
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', err);
        } finally {
            setActionLoading(false);
        }
    };

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
                                {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-black text-base-content truncate">{u.name}</h2>
                                <span className={`badge badge-sm font-bold ${roleBadgeStyle[u.role] || 'badge-ghost'}`}>{u.role}</span>
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${u.status === 'active' ? 'animate-pulse' : ''}`} />
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-sm text-base-content/60 truncate mt-0.5">{u.email}</p>
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
                        {activeTab === 'overview' && <OverviewTab key="overview" user={u} />}
                        {activeTab === 'courses' && <CoursesTab key="courses" user={u} />}
                        {activeTab === 'activity' && <ActivityTab key="activity" user={u} />}
                    </AnimatePresence>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t border-base-300 bg-base-200/50">
                    <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1">
                        <Mail className="w-3.5 h-3.5" /> Gửi email
                    </button>
                    <button
                        onClick={handleBanToggle}
                        disabled={actionLoading}
                        className={`btn btn-sm btn-ghost rounded-xl font-bold gap-1 ${u.status === 'banned' ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                        {actionLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : u.status === 'banned' ? (
                            <Shield className="w-3.5 h-3.5" />
                        ) : (
                            <ShieldOff className="w-3.5 h-3.5" />
                        )}
                        {u.status === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'}
                    </button>
                    <div className="flex-1" />
                    <button onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Đóng</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
