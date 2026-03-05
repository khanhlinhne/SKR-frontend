import * as motion from 'motion/react-client';
import {
    DollarSign,
    Tag,
    TrendingUp,
    Percent,
} from 'lucide-react';
import { cardVariants } from './constants';

/**
 * CoursePricingCard — Thông tin giá & doanh thu
 */
export default function CoursePricingCard({ course }) {
    const formatVND = (num) => {
        if (!num && num !== 0) return '₫0';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Giá & Doanh thu
                </h3>
            </div>

            <div className="p-6 space-y-5">
                {/* Current Price */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60 font-medium">Giá hiện tại</span>
                    <div className="text-right">
                        {course.isFree ? (
                            <span className="text-lg font-black text-emerald-600">Miễn phí</span>
                        ) : (
                            <div>
                                <span className="text-xl font-black text-emerald-600">
                                    {formatVND(course.price)}
                                </span>
                                {course.originalPrice > course.price && (
                                    <span className="text-sm text-base-content/40 line-through ml-2">
                                        {formatVND(course.originalPrice)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Discount */}
                {course.discountPercent > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60 font-medium flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" />
                            Giảm giá
                        </span>
                        <span className="badge badge-sm font-bold text-red-600 bg-red-500/10 border-0">
                            -{course.discountPercent}%
                        </span>
                    </div>
                )}

                <div className="divider my-1" />

                {/* Revenue */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60 font-medium flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Doanh thu
                    </span>
                    <span className="text-lg font-black text-base-content">
                        {formatVND(course.revenue)}
                    </span>
                </div>

                {/* Avg per student */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60 font-medium">TB / học viên</span>
                    <span className="font-bold text-sm text-base-content/80">
                        {course.totalStudents > 0
                            ? formatVND(Math.round(course.revenue / course.totalStudents))
                            : '₫0'
                        }
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
