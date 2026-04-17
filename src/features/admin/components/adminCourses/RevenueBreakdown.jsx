import { motion } from 'motion/react';
import { PieChart } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * RevenueBreakdown — Phân bổ doanh thu (Admin, Expert, Platform)
 * Hiển thị dạng stacked bar giản lược
 */
export default function RevenueBreakdown({ course }) {
    const totalRevenue = course.revenue || 0;

    // Giả lập tỷ lệ chia doanh thu
    const breakdown = [
        { label: 'Expert nhận', percent: 60, color: 'bg-violet-500', textColor: 'text-violet-600', bgColor: 'bg-violet-500/10' },
        { label: 'Nền tảng', percent: 25, color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
        { label: 'Marketing', percent: 10, color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-500/10' },
        { label: 'Thuế & Phí', percent: 5, color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-500/10' },
    ];

    const formatVND = (num) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Phân bổ doanh thu
                </h3>
            </div>

            <div className="p-6 space-y-5">
                {/* Stacked bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-base-200">
                    {breakdown.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percent}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className={`${item.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === breakdown.length - 1 ? 'rounded-r-full' : ''}`}
                        />
                    ))}
                </div>

                {/* Legend + Values */}
                <div className="space-y-3">
                    {breakdown.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-base-content/70">
                                <span className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                                {item.label}
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.bgColor} ${item.textColor}`}>
                                    {item.percent}%
                                </span>
                            </span>
                            <span className="text-sm font-bold text-base-content">
                                {formatVND(Math.round(totalRevenue * item.percent / 100))}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-base-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-base-content/60">Tổng doanh thu</span>
                    <span className="text-lg font-black text-emerald-600">{formatVND(totalRevenue)}</span>
                </div>
            </div>
        </motion.div>
    );
}
