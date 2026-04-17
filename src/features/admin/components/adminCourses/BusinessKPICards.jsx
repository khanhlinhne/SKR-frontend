import { motion } from 'motion/react';
import {
    DollarSign,
    Users,
    Target,
    Star,
} from 'lucide-react';
import { cardVariants } from './constants';

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

function getBadgeClass(tone) {
    if (tone === 'warning') return 'bg-amber-500/10 text-amber-600';
    if (tone === 'neutral') return 'bg-base-200 text-base-content/60';
    return 'bg-emerald-500/10 text-emerald-600';
}

export default function BusinessKPICards({ course, analytics, range = 'month', loading = false }) {
    const totalRevenue = analytics?.totalRevenue ?? course.revenue ?? 0;
    const totalStudents = analytics?.totalStudents || course.totalStudents || 0;
    const totalOrders = analytics?.totalOrders ?? 0;
    const completedOrders = analytics?.completedOrders ?? 0;
    const orderSuccessRate = totalOrders > 0
        ? Math.round((completedOrders / totalOrders) * 100)
        : Math.round(course.completionRate || 0);
    const rangeLabel = range === 'week' ? 'tuần' : range === 'year' ? 'năm' : 'tháng';

    const kpis = [
        {
            id: 'revenue',
            icon: DollarSign,
            label: `Doanh thu ${rangeLabel}`,
            value: formatVND(totalRevenue),
            badge: analytics?.totalLabel ? `${analytics.totalLabel} ${formatCompactVND(totalRevenue)}` : formatCompactVND(totalRevenue),
            tone: totalRevenue > 0 ? 'positive' : 'neutral',
            gradient: 'from-emerald-500 to-teal-600',
            bgGlow: 'shadow-emerald-500/10',
        },
        {
            id: 'students',
            icon: Users,
            label: `Học viên ${rangeLabel}`,
            value: totalStudents.toLocaleString('vi-VN'),
            badge: `${completedOrders} lượt mua`,
            tone: completedOrders > 0 ? 'positive' : 'neutral',
            gradient: 'from-blue-500 to-indigo-600',
            bgGlow: 'shadow-blue-500/10',
        },
        {
            id: 'completion',
            icon: Target,
            label: 'Tỷ lệ hoàn tất đơn',
            value: `${orderSuccessRate}%`,
            badge: `${completedOrders}/${totalOrders} đơn`,
            tone: totalOrders > 0 ? 'positive' : 'neutral',
            gradient: 'from-violet-500 to-purple-600',
            bgGlow: 'shadow-violet-500/10',
        },
        {
            id: 'rating',
            icon: Star,
            label: 'Đánh giá TB',
            value: course.rating > 0 ? `${course.rating}/5` : 'N/A',
            badge: `${course.ratingCount} lượt`,
            tone: course.ratingCount > 0 ? 'warning' : 'neutral',
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'shadow-amber-500/10',
        },
    ];

    return (
        <div className="relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <motion.div
                    key={kpi.id}
                    variants={cardVariants}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className={`group relative cursor-default overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg ${kpi.bgGlow} transition-all hover:shadow-xl`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-[0.03] transition-opacity group-hover:opacity-[0.06]`} />

                        <div className="relative z-[1]">
                            <div className="mb-3 flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                                    <kpi.icon className="h-5 w-5 text-white" />
                                </div>
                                <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${getBadgeClass(kpi.tone)}`}>
                                    {kpi.badge}
                                </span>
                            </div>

                            <p className="mb-0.5 text-2xl font-black text-base-content">{kpi.value}</p>
                            <p className="text-xs font-medium text-base-content/50">{kpi.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            {loading ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/45 backdrop-blur-[1px]">
                    <span className="loading loading-spinner loading-md text-emerald-600" />
                </div>
            ) : null}
        </div>
    );
}
