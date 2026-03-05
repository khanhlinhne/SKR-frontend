import * as motion from 'motion/react-client';
import {
    DollarSign,
    Users,
    TrendingUp,
    Star,
    ShoppingCart,
    BarChart3,
    Target,
    Repeat,
} from 'lucide-react';
import { cardVariants } from './constants';

/**
 * BusinessKPICards — 4 KPI lớn dành cho Admin
 * Tập trung vào chỉ số kinh doanh: Doanh thu, Học viên, Tỷ lệ hoàn thành, Đánh giá
 */
export default function BusinessKPICards({ course }) {
    const formatVND = (num) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);

    const kpis = [
        {
            icon: DollarSign,
            label: 'Tổng doanh thu',
            value: formatVND(course.revenue),
            change: '+18.5%',
            isPositive: true,
            gradient: 'from-emerald-500 to-teal-600',
            bgGlow: 'shadow-emerald-500/10',
        },
        {
            icon: Users,
            label: 'Tổng học viên',
            value: course.totalStudents?.toLocaleString(),
            change: '+12.3%',
            isPositive: true,
            gradient: 'from-blue-500 to-indigo-600',
            bgGlow: 'shadow-blue-500/10',
        },
        {
            icon: Target,
            label: 'Tỷ lệ hoàn thành',
            value: `${course.completionRate}%`,
            change: '+5.2%',
            isPositive: true,
            gradient: 'from-violet-500 to-purple-600',
            bgGlow: 'shadow-violet-500/10',
        },
        {
            icon: Star,
            label: 'Đánh giá TB',
            value: course.rating > 0 ? `${course.rating}/5` : 'N/A',
            change: `${course.ratingCount} lượt`,
            isPositive: true,
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'shadow-amber-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
                <motion.div
                    key={kpi.label}
                    variants={cardVariants}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className={`relative bg-base-100 rounded-2xl p-5 shadow-lg ${kpi.bgGlow} border border-base-300 
                        overflow-hidden group hover:shadow-xl transition-all cursor-default`}
                >
                    {/* Background gradient glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-[0.03] 
                        group-hover:opacity-[0.06] transition-opacity`} />

                    <div className="relative z-[1]">
                        {/* Icon + Label */}
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} 
                                flex items-center justify-center shadow-lg 
                                group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg
                                ${kpi.isPositive
                                    ? 'text-emerald-600 bg-emerald-500/10'
                                    : 'text-red-600 bg-red-500/10'
                                }`}
                            >
                                {kpi.change}
                            </span>
                        </div>

                        {/* Value */}
                        <p className="text-2xl font-black text-base-content mb-0.5">{kpi.value}</p>
                        <p className="text-xs text-base-content/50 font-medium">{kpi.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
