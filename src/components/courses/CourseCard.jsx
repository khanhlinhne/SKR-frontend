import * as motion from 'motion/react-client';
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
 * CourseCard - Grid-view course card (dashboard layout)
 * Maps to: mst_subjects
 *
 * @param {object} course   - Course data object
 * @param {object} expert   - Expert data object
 * @param {object} variants - Motion animation variants
 */
export default function CourseCard({ course, expert, variants }) {
    const hasDiscount = course.discountPercent > 0 && course.originalPrice > course.priceAmount;

    return (
        <motion.div
            variants={variants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative group h-full"
        >
            {/* Glow */}
            <div
                className={`absolute -inset-[1px] bg-gradient-to-r ${course.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
            />

            <div className="relative h-full bg-base-100 rounded-2xl border border-base-300 hover:border-base-content/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                {/* Banner */}
                <div className="relative h-36 overflow-hidden">
                    <img
                        src={course.bannerUrl}
                        alt={course.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-70" />

                    {/* Discount badge */}
                    {hasDiscount && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black rounded-md shadow-md">
                                -{course.discountPercent}%
                            </span>
                        </div>
                    )}

                    {/* Category */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${course.gradient} text-white text-[11px] font-bold shadow-md`}>
                            {course.icon} {course.category}
                        </span>
                    </div>

                    {/* Status badges */}
                    {course.isPurchased && (
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold shadow">
                                <CheckCircle2 className="w-3 h-3" /> Đã mua
                            </span>
                        </div>
                    )}
                    {course.visibility === 'premium_only' && !course.isPurchased && (
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold shadow">
                                <Crown className="w-3 h-3" /> Premium
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-sm font-black text-base-content tracking-tight leading-snug mb-1 line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-[11px] text-base-content/50 font-medium mb-2">{course.level}</p>

                    {/* Tags */}
                    {course.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {course.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-base-200/80 text-[10px] font-semibold text-base-content/50">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mb-3 text-[11px] text-base-content/50">
                        <span className="flex items-center gap-0.5 font-bold text-orange-500">
                            <Star className="w-3 h-3 fill-orange-500" />
                            {course.ratingAverage}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />
                            {course.purchaseCount?.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" />
                            {course.totalChapters} ch
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {course.estimatedDurationHours}h
                        </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-auto pt-3 border-t border-base-200 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-base font-black ${course.isFree ? 'text-emerald-600' : 'text-base-content'}`}>
                                {formatPrice(course.priceAmount)}
                            </span>
                            {hasDiscount && (
                                <span className="text-[11px] text-base-content/40 line-through font-semibold">
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
                                    'Học miễn phí'
                                ) : (
                                    <>
                                        <ShoppingCart className="w-3 h-3" />
                                        Xem
                                    </>
                                )}
                            </motion.button>
                        </Link>
                    </div>

                    {/* Expert */}
                    {expert && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-base-200/50">
                            <img
                                src={expert.avatar}
                                alt={expert.name}
                                loading="lazy"
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-base-200"
                            />
                            <p className="text-[11px] font-bold text-base-content/70 truncate">{expert.name}</p>
                            {expert.verified && (
                                <CheckCircle2 className="w-3 h-3 text-blue-500 ml-auto flex-shrink-0" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function formatPrice(amount) {
    if (amount === 0) return 'Miễn phí';
    if (amount >= 1_000_000) {
        return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    }
    return amount.toLocaleString('vi-VN') + '₫';
}
