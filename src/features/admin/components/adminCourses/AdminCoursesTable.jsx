import { motion } from 'motion/react';
import { Edit3, Eye, Trash2, Users } from 'lucide-react';
import PublishToggle from './PublishToggle';
import {
    adminCourseStatusConfig,
    formatDate,
    formatPrice,
    formatRevenue,
} from './adminCourseDisplay';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export default function AdminCoursesTable({
    courses,
    totalCourses,
    togglingId,
    onView,
    onEdit,
    onDelete,
    onTogglePublish,
}) {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="bg-base-100 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-base-300/60 overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="table table-sm">
                    <thead>
                        <tr className="bg-base-200/30 border-b border-base-200">
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Khóa học</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Trạng thái</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Hiển thị</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Giá</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Học viên</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Doanh thu</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Cập nhật</th>
                            <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, index) => {
                            const status = adminCourseStatusConfig[course.status] || adminCourseStatusConfig.draft;

                            return (
                                <motion.tr
                                    key={course.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.04 }}
                                    className="hover:bg-base-200/30 group border-b border-base-200/50 last:border-0"
                                >
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center">
                                                {course.bannerUrl ? (
                                                    <img
                                                        src={course.bannerUrl}
                                                        alt={course.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(event) => {
                                                            event.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-xl">{course.image || '📚'}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-base-content truncate max-w-[200px]">
                                                    {course.name}
                                                </p>
                                                <p className="text-[11px] text-base-content/40 font-medium">
                                                    {course.instructor || 'Chưa gán'} • {course.category || 'Khác'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border ${status.color}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <PublishToggle
                                            course={course}
                                            onToggle={onTogglePublish}
                                            loading={togglingId === course.id}
                                        />
                                    </td>
                                    <td className="py-3">
                                        <span className={`font-bold text-sm ${course.price === 0 ? 'text-emerald-600' : 'text-base-content'}`}>
                                            {formatPrice(course.price)}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className="flex items-center gap-1 text-sm font-semibold">
                                            <Users className="w-3 h-3 text-violet-500" />
                                            {course.students.toLocaleString('vi-VN')}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className="text-sm font-bold text-emerald-600">
                                            {formatRevenue(course.revenue)}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className="text-[11px] text-base-content/40 font-medium">
                                            {formatDate(course.updatedAt)}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onView(course)}
                                                className="btn btn-ghost btn-xs btn-circle hover:bg-emerald-500/10"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(course)}
                                                className="btn btn-ghost btn-xs btn-circle hover:bg-blue-500/10"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(course)}
                                                className="btn btn-ghost btn-xs btn-circle hover:bg-red-500/10"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-base-200 flex items-center justify-between">
                <p className="text-xs text-base-content/40 font-medium">
                    Hiển thị {courses.length} / {totalCourses} khóa học
                </p>
            </div>
        </motion.div>
    );
}
