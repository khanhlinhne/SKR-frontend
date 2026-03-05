import * as motion from 'motion/react-client';
import {
    BookOpen,
    Clock,
    Video,
    FileText,
    HelpCircle,
    Calendar,
    Code,
    Globe,
    Crown,
    Tag,
} from 'lucide-react';
import { cardVariants, statusConfig } from './constants';

/**
 * CourseSummaryCard — Thông tin tổng quan khóa học (dạng compact)
 * Dùng cho Admin: hiển thị metadata + thống kê nội dung, ko đi sâu vào chi tiết
 */
export default function CourseSummaryCard({ course }) {
    const status = statusConfig[course.status] || statusConfig.draft;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    const infoItems = [
        { icon: Code, label: 'Mã khóa', value: course.subjectCode },
        { icon: Globe, label: 'Danh mục', value: course.category },
        { icon: BookOpen, label: 'Chương / Bài', value: `${course.totalChapters} chương • ${course.totalLessons} bài` },
        { icon: Clock, label: 'Thời lượng', value: `${course.estimatedHours} giờ` },
        { icon: Video, label: 'Video', value: course.totalVideos },
        { icon: FileText, label: 'Tài liệu', value: course.totalDocuments },
        { icon: HelpCircle, label: 'Câu hỏi', value: course.totalQuestions },
        { icon: Calendar, label: 'Xuất bản', value: formatDate(course.publishedAt) },
    ];

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-500" />
                    Tổng quan khóa học
                </h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Content items */}
            <div className="divide-y divide-base-200">
                {infoItems.map((item, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-base-200/30 transition-colors">
                        <span className="flex items-center gap-2 text-sm text-base-content/60">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </span>
                        <span className="text-sm font-bold text-base-content">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Featured badge */}
            {course.isFeatured && (
                <div className="px-6 py-3 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600">Khóa học nổi bật</span>
                </div>
            )}
        </motion.div>
    );
}
