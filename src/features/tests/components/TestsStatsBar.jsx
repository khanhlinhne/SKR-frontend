import { StatCard } from '@/shared/ui/common';

export default function TestsStatsBar({ stats, variants }) {
    return (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard icon="FileText" label="Tổng Bài Thi" value={stats.totalTests} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={variants} />
            <StatCard icon="PlayCircle" label="Lượt Thi" value={stats.totalAttempts} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={variants} />
            <StatCard icon="TrendingUp" label="Điểm TB" value={stats.avgScore} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={variants} />
            <StatCard icon="Trophy" label="Điểm Cao Nhất" value={stats.bestScore} iconBgColor="bg-yellow-500/10" iconColor="text-yellow-500" variants={variants} />
        </div>
    );
}
