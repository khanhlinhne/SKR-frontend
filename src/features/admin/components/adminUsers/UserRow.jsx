import { motion } from 'motion/react';
import { Clock, Eye, Mail, Shield, ShieldOff } from 'lucide-react';
import { statusConfig, roleBadgeStyle } from './constants';

/**
 * Normalize user object from API to have consistent field names.
 */
function normalizeUser(user) {
    // Name: prefer fullName > displayName > username > name
    const name = user.fullName || user.displayName || user.username || user.name || 'Người dùng';

    // Avatar
    const avatar = user.avatar || user.avatarUrl || user.avatar_url || '';

    // Role: extract from roles array or use directly
    let role = user.role;
    if (!role && Array.isArray(user.roles) && user.roles.length > 0) {
        const firstRole = user.roles[0];
        role = typeof firstRole === 'string' ? firstRole : (firstRole.roleCode || firstRole.role_code || firstRole);
    }

    // Status: map 'isBanned' boolean to 'banned'/'active'
    let status = user.status;
    // Backend sends isActive boolean: true=active, false=banned
    if (status === undefined && user.isBanned !== undefined) {
        status = user.isBanned ? 'false' : 'true';
    }
    if (status === undefined && user.isActive !== undefined) {
        status = user.isActive ? 'true' : 'false';
    }

    // Courses count
    const courses = user.courseCount || user.course_count || user.courses || 0;

    // Join date
    let joinDate = user.joinDate || user.join_date || user.createdAt || user.created_at;
    if (joinDate) {
        try {
            const date = new Date(joinDate);
            if (!isNaN(date)) {
                joinDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        } catch {
            // keep original
        }
    } else {
        joinDate = 'N/A';
    }

    // Last active
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
        } catch {
            // keep original
        }
    } else {
        lastActive = 'N/A';
    }

    // ID
    const id = user.id || user._id;

    // Extra fields for detail modal
    const phone = user.phone || user.phoneNumber || '';
    const address = user.address || user.location || '';
    const bio = user.bio || user.description || '';
    const totalSpent = user.totalSpent || user.total_spent || user.totalSpentAmount || '₫0';
    const completedCourses = user.completedCourses || user.completed_courses || 0;
    const certificates = user.certificates || user.certificateCount || 0;
    const enrolledCourses = user.enrolledCourses || user.courses || [];
    const activityLog = user.activityLog || user.activities || [];

    return {
        id,
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
 * UserRow - Hiển thị một dòng trong bảng người dùng.
 */
export default function UserRow({ user, index, onViewDetail }) {
    const u = normalizeUser(user);
    const status = statusConfig[u.status] || statusConfig.active;
    const StatusIcon = status.icon;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="hover:bg-base-200/50 cursor-pointer group"
            onClick={onViewDetail}
        >
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring-2 ring-base-300">
                            {u.avatar ? (
                                <img src={u.avatar} alt={u.name} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-base-content">{u.name}</p>
                        <p className="text-xs text-base-content/50">{u.email}</p>
                    </div>
                </div>
            </td>
            <td>
                <span className={`badge badge-sm font-bold ${roleBadgeStyle[u.role] || 'badge-ghost'}`}>
                    {u.role}
                </span>
            </td>
            <td>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg w-fit ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </span>
            </td>
            <td>
                <span className="font-bold text-sm">{u.courses}</span>
            </td>
            <td>
                <span className="text-sm text-base-content/70">{u.joinDate}</span>
            </td>
            <td>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {u.lastActive}
                </span>
            </td>
            <td>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-xs btn-circle" title="Xem chi tiết" onClick={onViewDetail}>
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn btn-ghost btn-xs btn-circle" title="Gửi email">
                        <Mail className="w-3.5 h-3.5" />
                    </button>
                    {u.status === 'banned' ? (
                        <button className="btn btn-ghost btn-xs btn-circle text-emerald-500" title="Mở khóa">
                            <Shield className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button className="btn btn-ghost btn-xs btn-circle text-red-500" title="Khóa tài khoản">
                            <ShieldOff className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </td>
        </motion.tr>
    );
}
