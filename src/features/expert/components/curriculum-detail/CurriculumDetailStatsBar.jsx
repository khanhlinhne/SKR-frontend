import { BookOpen, Eye, GraduationCap, Hash, Layers } from 'lucide-react';

export default function CurriculumDetailStatsBar({ chaptersCount, totalLessons, course }) {
    const stats = [
        { label: 'Chương', value: chaptersCount, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        { label: 'Bài giảng', value: totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Trạng thái', value: course?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Mã khóa học', value: course?.courseCode || '—', icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-sm">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-base-content">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
