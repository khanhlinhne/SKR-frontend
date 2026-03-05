import * as motion from 'motion/react-client';
import { UserCheck, Mail, ExternalLink, Award } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * ExpertAssignmentCard — Hiển thị expert được giao khóa học
 * Admin là người tạo yêu cầu, expert là người hoàn thành nội dung
 */
export default function ExpertAssignmentCard({ creator }) {
    if (!creator) return null;

    // Giả lập trạng thái task
    const taskStatus = {
        label: 'Đã hoàn thành',
        color: 'text-emerald-600 bg-emerald-500/10',
        dot: 'bg-emerald-500',
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-violet-500" />
                    Expert phụ trách
                </h3>
            </div>

            <div className="p-6">
                {/* Expert info */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                        <div className="w-14 h-14 rounded-xl ring-2 ring-violet-500/30 ring-offset-2 ring-offset-base-100">
                            <img
                                src={creator.avatarUrl || 'https://i.pravatar.cc/150?img=60'}
                                alt={creator.fullName}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-base-content truncate">
                            {creator.fullName}
                        </h4>
                        {creator.bio && (
                            <p className="text-xs text-base-content/50 mt-0.5 line-clamp-2">
                                {creator.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Task status */}
                <div className="bg-base-200/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/50 font-medium">Trạng thái</span>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${taskStatus.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${taskStatus.dot}`} />
                            {taskStatus.label}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/50 font-medium">Tiến độ nội dung</span>
                        <span className="text-xs font-bold text-base-content">100%</span>
                    </div>
                    <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/50 font-medium">Số khóa học khác</span>
                        <span className="text-xs font-bold text-base-content">12 khóa</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button className="btn btn-sm flex-1 btn-ghost rounded-xl font-bold gap-1 text-xs">
                        <Mail className="w-3.5 h-3.5" />
                        Liên hệ
                    </button>
                    <button className="btn btn-sm flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none rounded-xl font-bold gap-1 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Xem hồ sơ
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
