import { motion } from 'motion/react';
import { cardVariants, TIME_RANGE_LABELS } from './shared';

export default function AdminDashboardHeader({ page, timeRange, onTimeRangeChange }) {
    return (
        <motion.div variants={cardVariants} className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-black text-base-content lg:text-3xl">
                    {page.sectionTitle}
                </h1>
                <p className="mt-1 text-sm text-base-content/60">
                    {page.sectionSubtitle}
                </p>
            </div>
            <div className="flex gap-2 overflow-x-auto">
                {['week', 'month', 'year'].map((range) => (
                    <button
                        key={range}
                        type="button"
                        onClick={() => onTimeRangeChange(range)}
                        className={`btn btn-sm flex-1 rounded-xl font-bold sm:flex-none ${
                            timeRange === range
                                ? 'border-none bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                                : 'btn-ghost'
                        }`}
                    >
                        {TIME_RANGE_LABELS[range]}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
