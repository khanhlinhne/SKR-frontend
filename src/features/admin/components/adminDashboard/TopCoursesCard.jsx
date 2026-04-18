import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import {
    formatCompactCurrencyVND,
    formatCount,
    formatGrowth,
} from '@/features/admin/utils/adminDashboardData';
import { cardVariants, EmptyState, SectionLoading } from './shared';

export default function TopCoursesCard({ courses, ui, loading }) {
    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content">{ui?.title || 'Khóa học Nổi bật'}</h3>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem tất cả'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && courses.length === 0 ? (
                <SectionLoading />
            ) : courses.length === 0 ? (
                <EmptyState message="Chưa có dữ liệu khóa học nổi bật." />
            ) : (
                <div className="space-y-4">
                    {courses.map((course, index) => (
                        <motion.div
                            key={`${course.name}-${index}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.08 }}
                            className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200"
                        >
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${
                                    index === 0
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow'
                                        : index === 1
                                            ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                                            : index === 2
                                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                                : 'bg-base-200 text-base-content/60'
                                }`}
                            >
                                {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-bold text-base-content">{course.name}</h4>
                                <p className="text-xs text-base-content/60">
                                    {`${formatCount(course.students)} học viên${course.rating > 0 ? ` • ⭐ ${course.rating.toFixed(1)}` : ''}`}
                                </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-black text-base-content">{course.revenueDisplay || formatCompactCurrencyVND(course.revenue)}</p>
                                <p className="text-xs font-bold text-emerald-600">{course.growthDisplay || formatGrowth(course.growth)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
