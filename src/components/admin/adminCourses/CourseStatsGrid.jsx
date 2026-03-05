import * as motion from 'motion/react-client';
import {
    Users,
    Star,
    BookOpen,
    Clock,
    TrendingUp,
    FileText,
    HelpCircle,
    Video,
    DollarSign,
    BarChart3,
} from 'lucide-react';
import { cardVariants } from './constants';

/**
 * CourseStatsGrid — Hiển thị các thống kê chính của khóa học
 * Dạng grid 4 cột, mỗi ô hiển thị icon + label + value
 */

const stats = (course) => [
    {
        icon: Users, label: 'Học viên', value: course.totalStudents?.toLocaleString(),
        color: 'from-blue-500 to-blue-600',
    },
    {
        icon: Star, label: 'Đánh giá',
        value: course.rating > 0 ? `${course.rating} (${course.ratingCount})` : 'N/A',
        color: 'from-amber-500 to-orange-500',
    },
    {
        icon: BookOpen, label: 'Bài học', value: course.totalLessons,
        color: 'from-emerald-500 to-teal-600',
    },
    {
        icon: Clock, label: 'Thời lượng', value: `${course.estimatedHours}h`,
        color: 'from-violet-500 to-purple-600',
    },
    {
        icon: Video, label: 'Video', value: course.totalVideos,
        color: 'from-rose-500 to-pink-600',
    },
    {
        icon: FileText, label: 'Tài liệu', value: course.totalDocuments,
        color: 'from-cyan-500 to-blue-500',
    },
    {
        icon: HelpCircle, label: 'Câu hỏi', value: course.totalQuestions,
        color: 'from-indigo-500 to-violet-500',
    },
    {
        icon: TrendingUp, label: 'Hoàn thành', value: `${course.completionRate}%`,
        color: 'from-emerald-500 to-green-600',
    },
];

export default function CourseStatsGrid({ course }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats(course).map((stat, i) => (
                <motion.div
                    key={stat.label}
                    variants={cardVariants}
                    className="bg-base-100 rounded-2xl p-4 shadow-lg border border-base-300 
                               hover:shadow-xl transition-shadow group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} 
                                         flex items-center justify-center shadow-lg 
                                         group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-base-content/50 font-medium">{stat.label}</p>
                            <p className="text-lg font-black text-base-content">{stat.value}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
