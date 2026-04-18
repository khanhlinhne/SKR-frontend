import { motion } from 'motion/react';
import {
    BookOpen,
    DollarSign,
    Edit3,
    Eye,
    Layers,
    MoreHorizontal,
    Star,
    Target,
    Users,
} from 'lucide-react';
import {
    adminCourseStatusConfig,
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

export default function AdminCourseCard({ course, onView, onEdit }) {
    const status = adminCourseStatusConfig[course.status] || adminCourseStatusConfig.draft;
    const StatusIcon = status.icon;
    const isFree = course.price === 0;
    const discount = course.originalPrice > 0 && course.price > 0
        ? Math.round((1 - course.price / course.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group bg-base-100 rounded-2xl border border-base-300/60 hover:border-base-content/8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-col"
        >
            <div className="relative h-36 overflow-hidden">
                {course.bannerUrl ? (
                    <img
                        src={course.bannerUrl}
                        alt={course.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(event) => {
                            event.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                        <span className="text-4xl">{course.image || '📚'}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${status.color} text-[11px] font-bold backdrop-blur-sm`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </span>
                </div>

                <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.();
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Edit3 className="w-3.5 h-3.5 text-base-content/70" />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        title="Thêm tùy chọn"
                    >
                        <MoreHorizontal className="w-3.5 h-3.5 text-base-content/70" />
                    </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        {course.category || 'Khác'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
                        <span className="flex items-center gap-0.5">
                            <Layers className="w-3 h-3" />
                            {course.chapters} chương
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                        <span className="flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" />
                            {course.lessons} bài
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-[15px] font-bold text-base-content leading-snug mb-1 line-clamp-1 tracking-tight">
                    {course.name}
                </h3>

                <p className="text-[11px] text-base-content/40 font-medium mb-3 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0 flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">
                            {course.instructor?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                    </span>
                    {course.instructor || 'Chưa gán'}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Học viên</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <Users className="w-3 h-3 text-violet-500" />
                            {course.students.toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Doanh thu</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            {formatRevenue(course.revenue)}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Đánh giá</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            {course.rating > 0 ? (
                                <>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {course.rating}
                                    <span className="text-[10px] text-base-content/30 font-normal">({course.ratingCount})</span>
                                </>
                            ) : (
                                <span className="text-base-content/30 text-xs">N/A</span>
                            )}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Hoàn thành</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-500" />
                            {course.completionRate}%
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-base-200">
                    <div>
                        {isFree ? (
                            <span className="text-sm font-bold text-emerald-600">Miễn phí</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-base-content">
                                    {formatPrice(course.price)}
                                </span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-[11px] text-base-content/30 line-through">
                                            {formatPrice(course.originalPrice)}
                                        </span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                            -{discount}%
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onView}
                        className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1 shadow-md hover:shadow-lg transition-shadow text-xs px-3"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
