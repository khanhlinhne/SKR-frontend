import { motion } from 'motion/react';
import { CheckCircle2, Lock, PlayCircle, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    buildCourseBuyPath,
    buildCourseLearnPath,
    formatCoursePrice,
    hasAuthToken,
} from '@/features/courses/utils/publicCourseModel';

export default function PublicCoursePurchasePanel({
    course,
    previewAnchorId = 'preview-lessons',
}) {
    const isAuthenticated = hasAuthToken();
    const hasDiscount = course.discountPercent > 0 && course.originalPrice > course.priceAmount;
    const primaryHref = course.hasAccess || course.isFree
        ? buildCourseLearnPath(course.id, isAuthenticated)
        : buildCourseBuyPath(course.id, isAuthenticated);
    const primaryLabel = course.hasAccess
        ? 'Vào học ngay'
        : course.isFree
            ? 'Học miễn phí'
            : 'Mua ngay';
    const PrimaryIcon = course.hasAccess || course.isFree ? PlayCircle : ShoppingCart;

    return (
        <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-5 lg:sticky lg:top-28"
        >
            <div className="apple-panel apple-card-shadow overflow-hidden rounded-[32px] border">
                <div className={`bg-gradient-to-br ${course.accent.backgroundGradient} px-6 py-6`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/60">
                        {course.isFree ? 'Khóa học public' : 'Đăng ký khóa học'}
                    </p>
                    <div className="mt-3 flex items-end gap-3">
                        <span className={`text-4xl font-semibold ${course.isFree ? 'text-emerald-600' : 'text-base-content'}`}>
                            {course.formattedPrice}
                        </span>
                        {hasDiscount ? (
                            <span className="pb-1 text-base font-semibold text-base-content/35 line-through">
                                {formatCoursePrice(course.originalPrice)}
                            </span>
                        ) : null}
                    </div>
                    {hasDiscount ? (
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                            Tiết kiệm {formatCoursePrice(course.originalPrice - course.priceAmount)}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-4 px-6 py-6">
                    <Link
                        to={primaryHref}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                    >
                        <PrimaryIcon className="mr-2 h-4 w-4" />
                        {primaryLabel}
                    </Link>

                    {!course.hasAccess ? (
                        <a
                            href={`#${previewAnchorId}`}
                            className="apple-secondary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                        >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Xem bài học miễn phí
                        </a>
                    ) : null}

                    {!course.isFree && !isAuthenticated ? (
                        <div className="flex items-center gap-2 rounded-[22px] bg-base-200/80 px-4 py-3 text-xs font-medium text-base-content/65">
                            <Lock className="h-3.5 w-3.5" />
                            Bạn sẽ được đưa qua đăng nhập trước khi vào checkout để gắn đơn hàng với tài khoản.
                        </div>
                    ) : null}

                    <div className="space-y-3 rounded-[24px] border border-base-200 bg-base-100/75 px-4 py-4">
                        <h3 className="text-sm font-semibold text-base-content">Bạn sẽ nhận được</h3>
                        <IncludeItem label={`${course.totalLessons} bài học theo lộ trình rõ ràng`} />
                        <IncludeItem label={`${course.totalVideos} video và ${course.totalDocuments} tài liệu tham khảo`} />
                        <IncludeItem label={`${course.totalQuestions} hoạt động ôn tập và kiểm tra`} />
                        <IncludeItem label={`${course.previewLessons.length} bài được mở xem trước trước khi mua`} />
                        <IncludeItem label="Truy cập trên cùng một tài khoản để lưu tiến độ lâu dài" />
                    </div>
                </div>
            </div>

            <div className="apple-panel rounded-[28px] border px-5 py-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Thanh toán và truy cập rõ ràng
                </div>
                <p className="apple-secondary-text mt-3 text-sm leading-7">
                    Trang public chỉ giúp bạn khám phá và quyết định mua. Sau khi hoàn tất checkout, khóa học sẽ gắn với tài khoản để bạn quay lại học, làm quiz và ôn flashcards trong cùng một nơi.
                </p>
            </div>
        </motion.aside>
    );
}

function IncludeItem({ label }) {
    return (
        <div className="flex items-start gap-2 text-sm text-base-content/70">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{label}</span>
        </div>
    );
}
