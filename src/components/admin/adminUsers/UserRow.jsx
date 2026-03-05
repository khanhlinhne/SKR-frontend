import * as motion from 'motion/react-client';
import { Clock, Eye, Mail, Shield, ShieldOff } from 'lucide-react';
import { statusConfig, roleBadgeStyle } from './constants';

/**
 * UserRow - Hiển thị một dòng trong bảng người dùng.
 */
export default function UserRow({ user, index, onViewDetail }) {
    const status = statusConfig[user.status];
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
                            <img src={user.avatar} alt={user.name} />
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-base-content">{user.name}</p>
                        <p className="text-xs text-base-content/50">{user.email}</p>
                    </div>
                </div>
            </td>
            <td>
                <span className={`badge badge-sm font-bold ${roleBadgeStyle[user.role] || 'badge-ghost'}`}>
                    {user.role}
                </span>
            </td>
            <td>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg w-fit ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </span>
            </td>
            <td>
                <span className="font-bold text-sm">{user.courses}</span>
            </td>
            <td>
                <span className="text-sm text-base-content/70">{user.joinDate}</span>
            </td>
            <td>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {user.lastActive}
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
                    {user.status === 'banned' ? (
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
