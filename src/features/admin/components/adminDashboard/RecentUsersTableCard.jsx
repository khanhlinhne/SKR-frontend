import { motion } from 'motion/react';
import {
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { getInitials } from '@/features/admin/utils/adminDashboardData';
import { cardVariants, EmptyState, SectionLoading } from './shared';

const statusConfig = {
    active: { label: 'Hoạt động', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
    pending: { label: 'Chờ xác minh', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10' },
    banned: { label: 'Bị khóa', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
};

export default function RecentUsersTableCard({ users, ui, loading }) {
    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-black text-base-content">{ui?.title || 'Người dùng Mới'}</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem tất cả'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && users.length === 0 ? (
                <SectionLoading />
            ) : users.length === 0 ? (
                <EmptyState message="Chưa có người dùng mới." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr className="text-base-content/60">
                                {(ui?.columns || []).map((column) => (
                                    <th key={column.key} className="text-xs font-bold uppercase">{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => {
                                const status = statusConfig[user.status] || statusConfig.active;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 + index * 0.06 }}
                                        className="cursor-pointer hover:bg-base-200/50"
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <div className="avatar">
                                                        <div className="h-8 w-8 rounded-full">
                                                            <img src={user.avatar} alt={user.name} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-black text-emerald-600">
                                                        {getInitials(user.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-base-content">{user.name}</p>
                                                    <p className="text-xs text-base-content/50">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm font-bold ${user.role === 'Premium' ? 'badge-warning' : 'badge-ghost'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {user.statusLabel || status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-1 text-xs text-base-content/60">
                                                <Clock className="h-3 w-3" />
                                                {user.joinDate}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
