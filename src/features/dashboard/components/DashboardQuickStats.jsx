import { motion } from 'motion/react';
import { Flame, CreditCard, CheckCircle2 } from 'lucide-react';

export default function DashboardQuickStats({ stats, variants }) {
    const items = [
        {
            label: 'Chuỗi ngày học',
            value: `${stats.studyStreak} ngày`,
            icon: Flame,
            iconWrap: 'bg-orange-500/10',
            iconColor: 'text-orange-500',
        },
        {
            label: 'Flashcards đã ôn',
            value: stats.flashcardsReviewed,
            icon: CreditCard,
            iconWrap: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            label: 'Bài test hoàn thành',
            value: `${stats.testsCompleted} bài`,
            icon: CheckCircle2,
            iconWrap: 'bg-green-500/10',
            iconColor: 'text-green-500',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {items.map((item) => (
                <motion.div
                    key={item.label}
                    variants={variants}
                    className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow"
                >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.iconWrap}`}>
                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-base-content/60">{item.label}</p>
                        <p className="text-2xl font-black text-base-content">{item.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
