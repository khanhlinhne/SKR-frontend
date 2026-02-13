import * as motion from 'motion/react-client';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Play,
    BookOpen,
    Sparkles,
    FileText,
    Crown,
    Lock
} from 'lucide-react';

/**
 * CourseDetailSidebar - Sticky sidebar with pricing, CTA, and includes
 * Maps to: mst_subjects (price), pmt_subject_purchases (purchase status)
 *
 * @param {object}  course      - Course data
 * @param {boolean} isPurchased - Whether user already owns this course
 * @param {object}  variants    - Animation variants
 */
export default function CourseDetailSidebar({ course, isPurchased = false, variants }) {
    const hasDiscount = course.discountPercent > 0 && course.originalPrice > course.priceAmount;

    return (
        <motion.div variants={variants} className="space-y-4">
            {/* Price Card */}
            <div className="bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden">
                {/* Price header */}
                <div className={`p-5 bg-gradient-to-br ${course.bgGradient}`}>
                    <div className="flex items-end gap-3 mb-2">
                        <span className={`text-3xl font-black ${course.isFree ? 'text-emerald-600' : 'text-base-content'}`}>
                            {formatPrice(course.priceAmount)}
                        </span>
                        {hasDiscount && (
                            <span className="text-base text-base-content/40 line-through font-semibold pb-0.5">
                                {formatPrice(course.originalPrice)}
                            </span>
                        )}
                    </div>
                    {hasDiscount && (
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black rounded-md">
                                Tiết kiệm {formatPrice(course.originalPrice - course.priceAmount)}
                            </span>
                            <span className="text-xs text-base-content/50 font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Ưu đãi có hạn
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="p-5 space-y-3">
                    {isPurchased ? (
                        <Link to={`/courses/${course.id}/learn`} className="block">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-lg w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none rounded-xl font-bold shadow-xl shadow-emerald-500/20"
                            >
                                <Play className="w-5 h-5" />
                                Tiếp tục học
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                    ) : course.isFree ? (
                        <Link to={`/courses/${course.id}/learn`} className="block">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-lg w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none rounded-xl font-bold shadow-xl shadow-emerald-500/20"
                            >
                                <Play className="w-5 h-5" />
                                Học miễn phí
                            </motion.button>
                        </Link>
                    ) : (
                        <>
                            <Link to={`/checkout?type=course&id=${course.id}`} className="block">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`btn btn-lg w-full bg-gradient-to-r ${course.gradient} text-white border-none rounded-xl font-bold shadow-xl`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Mua ngay
                                </motion.button>
                            </Link>
                            {course.visibility === 'premium_only' && (
                                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-bold">
                                    <Crown className="w-3.5 h-3.5" />
                                    Dành cho Premium users
                                </div>
                            )}
                        </>
                    )}

                    {/* Trust signals */}
                    <div className="flex items-center justify-center gap-3 pt-2 text-base-content/30">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Bảo hành 7 ngày
                        </span>
                        <span className="w-1 h-1 rounded-full bg-base-300" />
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <Lock className="w-3 h-3" /> Thanh toán an toàn
                        </span>
                    </div>
                </div>
            </div>

            {/* What you'll get */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                <h4 className="text-sm font-black text-base-content mb-3">Bạn sẽ nhận được</h4>
                <div className="space-y-2.5">
                    <IncludeItem icon={Play} label={`${course.totalVideos} video bài giảng HD`} />
                    <IncludeItem icon={BookOpen} label={`${course.totalChapters} chương · ${course.totalLessons} bài học`} />
                    <IncludeItem icon={FileText} label={`${course.totalDocuments} tài liệu tham khảo`} />
                    <IncludeItem icon={Sparkles} label={`${course.flashcards} flashcard thông minh`} />
                    <IncludeItem icon={CheckCircle2} label={`${course.totalQuestions} câu hỏi ôn tập`} />
                    <IncludeItem icon={Clock} label={`${course.estimatedDurationHours} giờ nội dung`} />
                    <IncludeItem icon={ShieldCheck} label="Truy cập trọn đời" />
                </div>
            </div>

            {/* Purchase status */}
            {isPurchased && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-black text-emerald-600">Đã sở hữu</span>
                    </div>
                    <p className="text-xs text-emerald-600/70 font-medium">
                        Bạn đã mua khóa học này. Truy cập toàn bộ nội dung ngay!
                    </p>
                </div>
            )}
        </motion.div>
    );
}

function IncludeItem({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-base-content/70">{label}</span>
        </div>
    );
}

function formatPrice(amount) {
    if (amount === 0) return 'Miễn phí';
    return amount.toLocaleString('vi-VN') + '₫';
}
