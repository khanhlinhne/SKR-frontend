import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { cardVariants } from './constants';

const RANGE_OPTIONS = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'year', label: 'Năm' },
];

function formatVND(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

function formatCompactVND(value) {
    const amount = Number(value) || 0;

    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
    return `${amount}`;
}

export default function RevenueChart({
    range = 'month',
    loading = false,
    onRangeChange,
    title = 'Doanh thu',
    subtitle = '',
    revenueSeries = [],
    revenuePeriods = {},
}) {
    const maxRevenue = Math.max(...revenueSeries.map((item) => item.revenue), 0);
    const totalRevenue = revenuePeriods.total ?? revenueSeries.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const growthPercent = Number(revenuePeriods.growthPercent ?? 0);
    const isGrowth = growthPercent >= 0;
    const totalLabel = revenuePeriods.rangeLabel ?? 'Tháng này';
    const comparisonLabel = range === 'week' ? 'so với tuần trước' : range === 'year' ? 'so với năm trước' : 'so với tháng trước';

    return (
        <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg"
        >
            <div className="flex items-center justify-between gap-4 border-b border-base-300 px-6 py-4">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-base-content">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-base-content/50">{subtitle || 'Dữ liệu doanh thu của khóa học này'}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="join rounded-xl border border-base-300 bg-base-100 p-1">
                        {RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onRangeChange?.(option.value)}
                                className={`btn btn-xs join-item rounded-lg border-none px-3 font-bold ${
                                    range === option.value
                                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                                        : 'btn-ghost text-base-content/60'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-base-content/50">Tổng doanh thu</p>
                    <p className="text-lg font-black text-emerald-600">{formatVND(totalRevenue)}</p>
                </div>
            </div>

            <div className="space-y-6 p-6">
                <div className="rounded-2xl border border-base-300 bg-base-200/30 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-base-content/45">
                        {totalLabel}
                    </p>
                    <p className="mt-2 text-lg font-black text-base-content">{formatVND(totalRevenue)}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            isGrowth
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-red-500/10 text-red-600'
                        }`}
                    >
                        {isGrowth ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {isGrowth ? '+' : ''}
                        {growthPercent}%
                    </span>
                    <span className="text-xs text-base-content/40">{comparisonLabel}</span>
                </div>

                {revenueSeries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center text-sm font-medium text-base-content/50">
                        Chưa có đơn hàng hoàn thành để tính doanh thu cho khóa học này.
                    </div>
                ) : (
                    <div className="flex h-52 items-end gap-3">
                        {revenueSeries.map((item, index) => {
                            const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                            const isLast = index === revenueSeries.length - 1;

                            return (
                                <div key={`${item.month}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                    <span className={`text-xs font-bold ${isLast ? 'text-emerald-600' : 'text-base-content/50'}`}>
                                        {formatCompactVND(item.revenue)}
                                    </span>

                                    <div className="flex w-full flex-1 flex-col justify-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercent}%` }}
                                            transition={{ duration: 0.8, delay: 0.08 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            className={`min-h-[4px] w-full rounded-xl ${
                                                isLast
                                                    ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                                    : 'bg-gradient-to-t from-base-300 to-base-200'
                                            }`}
                                        />
                                    </div>

                                    <span className={`text-xs font-medium ${isLast ? 'font-bold text-emerald-600' : 'text-base-content/40'}`}>
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-base-content/45">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Doanh thu được tính từ các đơn hàng hoàn thành của riêng khóa học này theo bộ lọc đang chọn.
                </div>
            </div>
            {loading ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/45 backdrop-blur-[1px]">
                    <span className="loading loading-spinner loading-lg text-emerald-600" />
                </div>
            ) : null}
        </motion.div>
    );
}
