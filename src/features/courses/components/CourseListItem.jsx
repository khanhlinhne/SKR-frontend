import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Star,
    Users,
    BookOpen,
    Clock,
    Play,
    CheckCircle2,
    ShoppingCart,
    ArrowRight,
    Crown
} from 'lucide-react';

/**
 * CourseListItem - List/row-view course item (dashboard layout)
 * Maps to: mst_subjects
 *
 * @param {object} course   - Course data object
 * @param {object} expert   - Expert data object
 * @param {object} variants - Motion animation variants
 */
export default function CourseListItem({ course, expert, variants }) {
    const hasDiscount = course.discountPercent > 0 && course.originalPrice > course.priceAmount;

    return (
        <motion.div
            variants={variants}
            whileHover={{ x: 3, transition: { duration: 0.2 } }}
            className="relative group"
        >
            <div className="bg-base-100 rounded-2xl border border-base-300 hover:border-base-content/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                        <img
                            src={course.bannerUrl}
                            alt={course.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Discount badge */}
                        {hasDiscount && (
                            <div className="absolute top-2.5 left-2.5 z-10">
                                <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black rounded-md shadow-md">
                                    -{course.discountPercent}%
                                </span>
                            </div>
                        )}
                        {/* Category */}
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                            <span className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${course.gradient} text-white text-[11px] font-bold shadow`}>
                                {course.icon} {course.category}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        {/* Top */}
                        <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-base-content tracking-tight leading-snug line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-[11px] text-base-content/50 font-medium">{course.level}</p>
                                </div>
                                {course.isPurchased ? (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                                        <CheckCircle2 className="w-3 h-3" /> Đã mua
                                    </span>
                                ) : course.visibility === 'premium_only' ? (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-bold">
                                        <Crown className="w-3 h-3" /> Premium
                                    </span>
                                ) : null}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[11px] text-base-content/50">
                                <span className="flex items-center gap-0.5 font-bold text-orange-500">
                                    <Star className="w-3 h-3 fill-orange-500" /> {course.ratingAverage} ({course.ratingCount})
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Users className="w-3 h-3" /> {course.purchaseCount?.toLocaleString()} học viên
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <BookOpen className="w-3 h-3" /> {course.totalChapters} chương · {course.totalLessons} bài
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Play className="w-3 h-3" /> {course.totalVideos} video
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" /> {course.estimatedDurationHours} giờ
                                </span>
                            </div>

                            {/* Tags */}
                            {course.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {course.tags.slice(0, 4).map((tag, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded bg-base-200/80 text-[10px] font-semibold text-base-content/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bottom: Expert + Price + CTA */}
                        <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-base-200">
                            {/* Expert */}
                            {expert && (
                                <div className="flex items-center gap-2 min-w-0">
                                    <img
                                        src={expert.avatar}
                                        alt={expert.name}
                                        loading="lazy"
                                        className="w-6 h-6 rounded-full object-cover ring-1 ring-base-200"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-base-content truncate">{expert.name}</p>
                                        <p className="text-[10px] text-base-content/50 font-medium truncate">{expert.speciality}</p>
                                    </div>
                                    {expert.verified && (
                                        <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                    )}
                                </div>
                            )}

                            {/* Price + CTA */}
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                                <div className="text-right">
                                    <span className={`text-sm font-black ${course.isFree ? 'text-emerald-600' : 'text-base-content'}`}>
                                        {formatPrice(course.priceAmount)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="block text-[10px] text-base-content/40 line-through font-semibold">
                                            {formatPrice(course.originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <Link to={course.isPurchased ? `/courses/${course.id}/learn` : `/courses/${course.id}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`btn btn-xs border-none rounded-lg font-bold shadow ${course.isPurchased
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                            : `bg-gradient-to-r ${course.gradient} text-white`
                                            }`}
                                    >
                                        {course.isPurchased ? (
                                            <>Học tiếp <ArrowRight className="w-3 h-3" /></>
                                        ) : course.isFree ? (
                                            'Học ngay'
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-3 h-3" />
                                                Xem
                                            </>
                                        )}
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function formatPrice(amount) {
    const num = Number(amount);
    if (isNaN(num) || num === 0) return 'Miễn phí';
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    }
    return num.toLocaleString('vi-VN') + '₫';
}
