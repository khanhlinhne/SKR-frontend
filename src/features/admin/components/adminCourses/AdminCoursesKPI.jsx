import { motion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, BookOpen, DollarSign, Star, Users } from 'lucide-react';
import { formatPrice, formatRevenue } from './adminCourseDisplay';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export default function AdminCoursesKPI({ courses }) {
    const totalCourses = courses.length;
    const published = courses.filter((course) => course.status === 'published').length;
    const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
    const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
    const ratedCourses = courses.filter((course) => course.rating > 0);
    const avgRating = ratedCourses.length > 0
        ? ratedCourses.reduce((sum, course) => sum + course.rating, 0) / ratedCourses.length
        : 0;
    const ratedCompletions = courses.filter((course) => course.completionRate > 0);
    const avgCompletion = ratedCompletions.length > 0
        ? ratedCompletions.reduce((sum, course) => sum + course.completionRate, 0) / ratedCompletions.length
        : 0;

    const kpis = [
        {
            label: 'Tổng khóa học',
            value: totalCourses,
            subLabel: `${published} đã xuất bản`,
            icon: BookOpen,
            gradient: 'from-blue-500 to-indigo-500',
            iconBg: 'bg-blue-500/15',
            iconColor: 'text-blue-600',
            trend: `+${courses.length > 0 ? published : 0}`,
            trendUp: true,
        },
        {
            label: 'Tổng học viên',
            value: totalStudents.toLocaleString('vi-VN'),
            subLabel: 'Đăng ký toàn hệ thống',
            icon: Users,
            gradient: 'from-violet-500 to-purple-500',
            iconBg: 'bg-violet-500/15',
            iconColor: 'text-violet-600',
            trend: '+' + totalStudents,
            trendUp: true,
        },
        {
            label: 'Tổng doanh thu',
            value: formatRevenue(totalRevenue),
            subLabel: formatPrice(totalRevenue),
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-600',
            trend: formatRevenue(totalRevenue),
            trendUp: true,
        },
        {
            label: 'Đánh giá TB',
            value: avgRating > 0 ? avgRating.toFixed(1) : '—',
            subLabel: `Hoàn thành TB ${Math.round(avgCompletion)}%`,
            icon: Star,
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-600',
            trend: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : '—',
            trendUp: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
                <motion.div
                    key={kpi.label}
                    variants={cardVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="relative overflow-hidden bg-base-100 rounded-2xl border border-base-300/60 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-default"
                >
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-[0.06] blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`} />
                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">
                                    {kpi.label}
                                </p>
                                <p className={`text-2xl font-bold ${kpi.iconColor} tracking-tight leading-none`}>
                                    {kpi.value}
                                </p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {kpi.trend}
                        </div>
                    </div>
                    <p className="text-[11px] text-base-content/40 font-medium mt-2 ml-[3.4rem]">
                        {kpi.subLabel}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
