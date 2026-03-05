import * as motion from 'motion/react-client';
import {
    TrendingUp, BookOpen, CheckCircle2, Award,
    User, Mail, Phone, MapPin, Calendar, Clock, Shield,
} from 'lucide-react';

/**
 * InfoRow - Hiển thị một dòng thông tin cá nhân.
 */
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-base-content/40 mt-0.5">{icon}</span>
            <div>
                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-base-content">{value}</p>
            </div>
        </div>
    );
}

/**
 * OverviewTab - Tab tổng quan: thống kê nhanh + thông tin cá nhân.
 */
export default function OverviewTab({ user }) {
    const stats = [
        { label: 'Tổng chi tiêu', value: user.totalSpent, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Khóa học', value: user.courses, icon: BookOpen, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Hoàn thành', value: user.completedCourses, icon: CheckCircle2, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Chứng chỉ', value: user.certificates, icon: Award, gradient: 'from-amber-500 to-orange-600' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            className="relative p-3 rounded-2xl bg-base-200 border border-base-300 overflow-hidden group hover:shadow-md transition-shadow"
                        >
                            <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-2xl bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-1.5`}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-base font-black text-base-content leading-tight">{stat.value}</p>
                            <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wide">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* User Info */}
            <div className="bg-base-200 rounded-2xl p-4 border border-base-300">
                <h4 className="text-sm font-black text-base-content mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    Thông tin cá nhân
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                    <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại" value={user.phone || 'Chưa cập nhật'} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={user.address || 'Chưa cập nhật'} />
                    <InfoRow icon={<Calendar className="w-4 h-4" />} label="Ngày tham gia" value={user.joinDate} />
                    <InfoRow icon={<Clock className="w-4 h-4" />} label="Hoạt động cuối" value={user.lastActive} />
                    <InfoRow icon={<Shield className="w-4 h-4" />} label="Vai trò" value={user.role} />
                </div>
                {user.bio && (
                    <div className="mt-4 pt-4 border-t border-base-300">
                        <p className="text-xs text-base-content/50 font-bold mb-1">Giới thiệu</p>
                        <p className="text-sm text-base-content/80">{user.bio}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
