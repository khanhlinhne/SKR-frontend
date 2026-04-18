import { motion } from 'motion/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cardVariants } from './shared';

function StatsCard({ stat, loading }) {
    const TrendIcon = stat.trend === 'down' ? TrendingDown : TrendingUp;

    return (
        <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg transition-shadow hover:shadow-xl"
        >
            <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                </div>
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-base-content/60">{stat.label}</p>
            <div className="flex items-end justify-between gap-3">
                <h3 className="text-2xl font-black text-base-content lg:text-3xl">{loading ? '...' : stat.value}</h3>
                <span
                    className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold ${
                        stat.trend === 'up'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : stat.trend === 'down'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-base-200 text-base-content/60'
                    }`}
                >
                    <TrendIcon className="h-3 w-3" />
                    {loading ? '--' : stat.change}
                </span>
            </div>
        </motion.div>
    );
}

export default function AdminDashboardStatsGrid({ statsData, loading }) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {statsData.map((stat) => (
                <StatsCard key={stat.id} stat={stat} loading={loading} />
            ))}
        </div>
    );
}
