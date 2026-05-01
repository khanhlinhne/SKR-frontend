import {
    ArrowLeft,
    Edit3,
    ExternalLink,
    EyeOff,
    Globe,
    Loader2,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cardVariants, statusConfig } from './constants';

export default function AdminCourseDetailHeader({
    course,
    toggling,
    onBack,
    onTogglePublish,
    onEdit,
    onDelete,
}) {
    const status = statusConfig[course.status] || statusConfig.draft;

    return (
        <motion.div
            variants={cardVariants}
            className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
            <div className="flex min-w-0 items-start gap-3">
                <button
                    onClick={onBack}
                    className="btn btn-circle btn-ghost btn-sm"
                    title="Quay lại"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-base-content lg:text-3xl">
                        {course.name}
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${status.color}`}>
                            {status.label}
                        </span>
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        {course.subjectCode && (
                            <>
                                <span className="text-sm font-medium text-base-content/60">
                                    Mã khóa: {course.subjectCode}
                                </span>
                                <span className="text-sm text-base-content/30">•</span>
                            </>
                        )}
                        <span className="text-sm font-medium text-base-content/60">
                            {course.category || 'Khác'}
                        </span>
                        <span className="text-sm text-base-content/30">•</span>
                        <span className="text-sm font-medium text-base-content/60">
                            {course.lessons} bài học • {course.chapters} chương
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                <button
                    onClick={onTogglePublish}
                    disabled={toggling}
                    className={`btn btn-sm flex-1 gap-1.5 rounded-xl font-bold sm:flex-none ${
                        course.status === 'published'
                            ? 'border border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                            : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                >
                    {toggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : course.status === 'published' ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Globe className="h-4 w-4" />
                    )}
                    {course.status === 'published' ? 'Hủy công khai' : 'Công khai ngay'}
                </button>

                <button
                    onClick={onEdit}
                    className="btn btn-sm flex-1 gap-1.5 rounded-xl border-none bg-gradient-to-r from-emerald-600 to-cyan-600 font-bold text-white shadow-lg sm:flex-none"
                >
                    <Edit3 className="h-4 w-4" />
                    Chỉnh sửa
                </button>

                {course.status === 'published' && (
                    <a
                        href={`/courses/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost gap-1.5 rounded-xl font-bold"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Xem Landing Page
                    </a>
                )}

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu z-[1] w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl">
                        <li>
                            <button
                                onClick={onDelete}
                                className="text-sm font-bold text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa khóa học
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}
