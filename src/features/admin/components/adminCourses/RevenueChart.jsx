import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * RevenueChart — Biểu đồ doanh thu theo tháng (CSS-based bar chart)
 * Dành cho Admin xem tổng quan kinh doanh của khóa học
 */

const mockMonthlyRevenue = [
    { month: 'T9', revenue: 8200000 },
    { month: 'T10', revenue: 15600000 },
    { month: 'T11', revenue: 22400000 },
    { month: 'T12', revenue: 28900000 },
    { month: 'T1', revenue: 35200000 },
    { month: 'T2', revenue: 42100000 },
    { month: 'T3', revenue: 17033000 },
];

export default function RevenueChart() {
    const maxRevenue = Math.max(...mockMonthlyRevenue.map(m => m.revenue));
    const totalRevenue = mockMonthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
    const currentMonth = mockMonthlyRevenue[mockMonthlyRevenue.length - 1];
    const prevMonth = mockMonthlyRevenue[mockMonthlyRevenue.length - 2];
    const growthPercent = prevMonth
        ? (((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1)
        : 0;
    const isGrowth = Number(growthPercent) >= 0;

    const formatVND = (num) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);

    const formatShort = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}tr`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num;
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Doanh thu theo tháng
                    </h3>
                    <p className="text-xs text-base-content/50 mt-0.5">7 tháng gần nhất</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-base-content/50">Tổng doanh thu</p>
                    <p className="text-lg font-black text-emerald-600">{formatVND(totalRevenue)}</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-6">
                {/* Growth indicator */}
                <div className="flex items-center gap-2 mb-6">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg
                        ${isGrowth
                            ? 'text-emerald-600 bg-emerald-500/10'
                            : 'text-red-600 bg-red-500/10'
                        }`}
                    >
                        {isGrowth
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />
                        }
                        {isGrowth ? '+' : ''}{growthPercent}%
                    </span>
                    <span className="text-xs text-base-content/40">so với tháng trước</span>
                </div>

                {/* Bar chart */}
                <div className="flex items-end gap-3 h-48">
                    {mockMonthlyRevenue.map((m, i) => {
                        const heightPercent = (m.revenue / maxRevenue) * 100;
                        const isLast = i === mockMonthlyRevenue.length - 1;

                        return (
                            <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                                {/* Value label */}
                                <span className={`text-xs font-bold ${isLast ? 'text-emerald-600' : 'text-base-content/50'}`}>
                                    {formatShort(m.revenue)}
                                </span>

                                {/* Bar Container */}
                                <div className="w-full flex-1 flex flex-col justify-end">
                                    {/* Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className={`w-full rounded-xl min-h-[4px] ${isLast
                                            ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                            : 'bg-gradient-to-t from-base-300 to-base-200'
                                            }`}
                                    />
                                </div>

                                {/* Month label */}
                                <span className={`text-xs font-medium ${isLast ? 'text-emerald-600 font-bold' : 'text-base-content/40'}`}>
                                    {m.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
