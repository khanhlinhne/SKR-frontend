import { motion } from 'motion/react';
import { UserPlus, TrendingUp } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * EnrollmentTrend — Xu hướng đăng ký học viên theo tuần
 * CSS-based line chart đơn giản cho Admin
 */

const mockWeeklyEnrollments = [
    { week: 'T1/W1', count: 12 },
    { week: 'T1/W2', count: 18 },
    { week: 'T1/W3', count: 25 },
    { week: 'T1/W4', count: 22 },
    { week: 'T2/W1', count: 30 },
    { week: 'T2/W2', count: 28 },
    { week: 'T2/W3', count: 35 },
    { week: 'T2/W4', count: 42 },
    { week: 'T3/W1', count: 15 },
];

export default function EnrollmentTrend() {
    const maxCount = Math.max(...mockWeeklyEnrollments.map(w => w.count));
    const totalNew = mockWeeklyEnrollments.reduce((acc, w) => acc + w.count, 0);

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Đăng ký mới
                </h3>
                <div className="text-right">
                    <p className="text-xs text-base-content/50">Tổng mới</p>
                    <p className="text-base font-black text-blue-600">+{totalNew}</p>
                </div>
            </div>

            {/* Chart — Dot line */}
            <div className="p-6">
                <div className="flex items-end gap-2 h-36">
                    {mockWeeklyEnrollments.map((w, i) => {
                        const heightPercent = (w.count / maxCount) * 100;
                        const isLast = i === mockWeeklyEnrollments.length - 1;

                        return (
                            <div key={w.week} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group relative">
                                {/* Tooltip on hover */}
                                <div className="absolute top-0 bg-base-200 text-xs font-bold px-2 py-0.5 rounded-lg 
                                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap -translate-y-full">
                                    {w.count} học viên
                                </div>

                                {/* Chart Column */}
                                <div className="w-full flex-1 flex flex-col justify-end items-center">
                                    {/* Dot */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.05 * i + 0.3 }}
                                        className={`w-3 h-3 rounded-full flex-shrink-0 z-[1] -mb-1.5
                                            ${isLast
                                                ? 'bg-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                                                : 'bg-blue-400 group-hover:bg-blue-500 group-hover:ring-4 group-hover:ring-blue-500/20'
                                            } transition-all`}
                                    />

                                    {/* Bar behind */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className={`w-full rounded-b-lg rounded-t-sm min-h-[4px] pt-1.5 ${isLast
                                            ? 'bg-gradient-to-t from-blue-500/30 to-blue-400/20'
                                            : 'bg-gradient-to-t from-blue-500/15 to-blue-400/10'
                                            }`}
                                    />
                                </div>

                                {/* Week label */}
                                <span className={`text-[10px] font-medium ${isLast ? 'text-blue-600 font-bold' : 'text-base-content/30'}`}>
                                    {w.week.split('/')[1]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
