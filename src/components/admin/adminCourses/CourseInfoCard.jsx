import * as motion from 'motion/react-client';
import { Calendar, Code, Globe, Crown } from 'lucide-react';
import { statusConfig, cardVariants } from './constants';

/**
 * CourseInfoCard — Thông tin cơ bản & metadata
 */
export default function CourseInfoCard({ course }) {
    const status = statusConfig[course.status] || statusConfig.draft;
    const StatusIcon = status.icon;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const infoRows = [
        { icon: Code, label: 'Mã khóa học', value: course.subjectCode || '—' },
        { icon: Globe, label: 'Danh mục', value: course.category || '—' },
        {
            icon: StatusIcon, label: 'Trạng thái',
            value: (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${status.color}`}>
                    {status.label}
                </span>
            ),
        },
        {
            icon: Crown, label: 'Nổi bật',
            value: course.isFeatured
                ? <span className="text-xs font-bold px-2 py-1 rounded-lg text-amber-600 bg-amber-500/10">⭐ Nổi bật</span>
                : <span className="text-xs text-base-content/40">Không</span>,
        },
        { icon: Calendar, label: 'Ngày tạo', value: formatDate(course.createdAt) },
        { icon: Calendar, label: 'Cập nhật', value: formatDate(course.updatedAt) },
        { icon: Calendar, label: 'Xuất bản', value: formatDate(course.publishedAt) },
    ];

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300">
                <h3 className="text-lg font-black text-base-content">Thông tin khóa học</h3>
            </div>

            {/* Info Rows */}
            <div className="divide-y divide-base-200">
                {infoRows.map((row, i) => (
                    <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-base-content/60 font-medium">
                            <row.icon className="w-4 h-4" />
                            {row.label}
                        </span>
                        <span className="text-sm font-bold text-base-content text-right">
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
