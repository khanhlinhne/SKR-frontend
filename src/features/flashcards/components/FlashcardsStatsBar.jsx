import { StatCard } from '@/shared/ui/common';

export default function FlashcardsStatsBar({ stats, variants }) {
    return (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard icon="BookOpen" label="Tổng Flashcards" value={stats.totalCards} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={variants} />
            <StatCard icon="CheckCircle2" label="Đã thuộc" value={stats.mastered} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={variants} />
            <StatCard icon="Target" label="Cần ôn hôm nay" value={stats.dueToday} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={variants} />
            <StatCard icon="Flame" label="Streak" value={`${stats.streak} ngày`} iconBgColor="bg-red-500/10" iconColor="text-red-500" variants={variants} />
        </div>
    );
}
