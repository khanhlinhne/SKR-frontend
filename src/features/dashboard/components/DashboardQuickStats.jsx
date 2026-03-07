import { motion } from 'motion/react';
import { Flame, CreditCard, CheckCircle2 } from 'lucide-react';

export default function DashboardQuickStats({ stats, variants }) {
    const items = [
        {
            label: 'Study Streak',
            value: `${stats.studyStreak} Ngay`,
            icon: Flame,
            iconWrap: 'bg-orange-500/10',
            iconColor: 'text-orange-500',
        },
        {
            label: 'Flashcards Reviewed',
            value: stats.flashcardsReviewed,
            icon: CreditCard,
            iconWrap: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            label: 'Tests Completed',
            value: `${stats.testsCompleted} Bai`,
            icon: CheckCircle2,
            iconWrap: 'bg-green-500/10',
            iconColor: 'text-green-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {items.map((item) => (
                <motion.div
                    key={item.label}
                    variants={variants}
                    className="bg-base-100 rounded-2xl p-4 shadow border border-base-300 flex items-center gap-4"
                >
                    <div className={`w-12 h-12 rounded-full ${item.iconWrap} flex items-center justify-center`}>
                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-xs text-base-content/60 font-bold">{item.label}</p>
                        <p className="text-2xl font-black text-base-content">{item.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
