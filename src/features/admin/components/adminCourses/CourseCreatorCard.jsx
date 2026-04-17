import { motion } from 'motion/react';
import { User, Mail, Calendar } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * CourseCreatorCard — Thông tin giảng viên tạo khóa học
 */
export default function CourseCreatorCard({ creator }) {
    if (!creator) return null;

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-500" />
                    Giảng viên
                </h3>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-4">
                    <div className="avatar">
                        <div className="w-14 h-14 rounded-xl ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-base-100">
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
                            <p className="text-xs text-base-content/50 mt-1 line-clamp-2">
                                {creator.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
