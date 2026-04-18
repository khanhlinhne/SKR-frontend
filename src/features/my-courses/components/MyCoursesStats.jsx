import { motion } from 'motion/react';
import {
    BookMarked,
    Trophy,
    TrendingUp,
    Clock,
    Flame,
} from 'lucide-react';

/**
 * MyCoursesStats — Premium stats overview cho trang My Courses.
 */
export default function MyCoursesStats({ stats, variants }) {
    const items = [
        {
            label: 'Tổng khóa học',
            value: stats.totalCourses ?? 0,
            icon: BookMarked,
            gradient: 'from-blue-500 to-indigo-500',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            accentColor: 'text-blue-600',
        },
        {
            label: 'Đang học',
            value: stats.inProgress ?? 0,
            icon: TrendingUp,
            gradient: 'from-violet-500 to-purple-500',
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-500',
            accentColor: 'text-violet-600',
        },
        {
            label: 'Hoàn thành',
            value: stats.completed ?? 0,
            icon: Trophy,
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            accentColor: 'text-emerald-600',
        },
        {
            label: 'Giờ học',
            value: stats.totalHours ?? 0,
            suffix: 'h',
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            accentColor: 'text-amber-600',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    variants={variants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="relative overflow-hidden bg-base-100 rounded-2xl border border-base-300/50 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-default"
                >
                    {/* Decorative background gradient blob */}
                    <div
                        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.06] blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`}
                    />
                    <div
                        className={`absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.04] blur-xl`}
                    />

                    <div className="relative flex items-center gap-3.5">
                        {/* Icon container */}
                        <div
                            className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">
                                {item.label}
                            </p>
                            <p className={`text-2xl font-bold ${item.accentColor} tracking-tight`}>
                                {item.value}
                                {item.suffix && (
                                    <span className="text-sm font-semibold text-base-content/40 ml-0.5">
                                        {item.suffix}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
