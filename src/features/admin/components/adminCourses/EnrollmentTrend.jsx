import { motion } from 'motion/react';
import { UserPlus } from 'lucide-react';
import { cardVariants } from './constants';

export default function EnrollmentTrend({ range = 'month', loading = false, subtitle = '', enrollments = [], totalNew = 0 }) {
    const maxCount = Math.max(...enrollments.map((item) => item.count), 0);
    const totalLabel = range === 'week' ? 'Tuần này' : range === 'year' ? 'Năm nay' : 'Tháng này';

    return (
        <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg"
        >
            <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-base-content">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                        Đăng ký mới
                    </h3>
                    <p className="mt-0.5 text-xs text-base-content/50">{subtitle || 'Đăng ký của khóa học này'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-base-content/50">{totalLabel}</p>
                    <p className="text-base font-black text-blue-600">+{totalNew}</p>
                </div>
            </div>

            <div className="p-6">
                {enrollments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center text-sm font-medium text-base-content/50">
                        Chưa có đăng ký hoàn thành để hiển thị xu hướng theo tuần.
                    </div>
                ) : (
                    <div className="flex h-36 items-end gap-2">
                        {enrollments.map((item, index) => {
                            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            const isLast = index === enrollments.length - 1;

                            return (
                                <div key={`${item.label}-${index}`} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                                    <div className="pointer-events-none absolute top-0 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-base-200 px-2 py-0.5 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100">
                                        {item.label}: {item.count} học viên
                                    </div>

                                    <div className="flex w-full flex-1 flex-col items-center justify-end">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.05 * index + 0.3 }}
                                            className={`z-[1] -mb-1.5 h-3 w-3 rounded-full ${
                                                isLast
                                                    ? 'bg-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                                                    : 'bg-blue-400 transition-all group-hover:bg-blue-500 group-hover:ring-4 group-hover:ring-blue-500/20'
                                            }`}
                                        />

                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercent}%` }}
                                            transition={{ duration: 0.6, delay: 0.05 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            className={`min-h-[4px] w-full rounded-b-lg rounded-t-sm pt-1.5 ${
                                                isLast
                                                    ? 'bg-gradient-to-t from-blue-500/30 to-blue-400/20'
                                                    : 'bg-gradient-to-t from-blue-500/15 to-blue-400/10'
                                            }`}
                                        />
                                    </div>

                                    <span className={`text-[10px] font-medium ${isLast ? 'font-bold text-blue-600' : 'text-base-content/35'}`}>
                                        {item.shortLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {loading ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/45 backdrop-blur-[1px]">
                    <span className="loading loading-spinner loading-md text-blue-600" />
                </div>
            ) : null}
        </motion.div>
    );
}
