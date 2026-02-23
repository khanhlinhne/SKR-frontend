import { useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import {
    Clock,
    Target,
    Flame,
    BookOpen,
    Play,
    FileText,
    Sparkles,
    CheckCircle2,
    TrendingUp,
    Brain,
    CreditCard,
    Calendar,
    ChevronDown,
    CircleCheck,
    Circle,
    Award,
    BarChart3,
    Zap,
} from 'lucide-react';

/**
 * LearnProgressView - Full analytics dashboard for course progress.
 * Displayed in main content area when "Tiến độ" tab is selected.
 *
 * @param {Array}    chapters         - Chapters with lessons data
 * @param {object}   completedLessons - Map of completed lessons
 * @param {string}   courseGradient   - Course gradient class
 * @param {string}   courseTitle      - Course title
 * @param {string}   courseIcon       - Course emoji
 * @param {string}   expertName       - Expert name
 * @param {string}   expertAvatar     - Expert avatar URL
 */
export default function LearnProgressView({
    chapters = [],
    completedLessons = {},
    courseGradient = 'from-blue-500 to-violet-500',
    courseTitle = '',
    courseIcon = '📚',
    expertName = '',
    expertAvatar = '',
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    // ─── Computed Stats ──────────────────────────────────
    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const totalCompleted = Object.keys(completedLessons).length;
    const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    const typeStats = useMemo(() => {
        const s = { video: { done: 0, total: 0, mins: 0 }, document: { done: 0, total: 0, mins: 0 }, flashcard: { done: 0, total: 0, mins: 0 }, quiz: { done: 0, total: 0, mins: 0 } };
        chapters.forEach((ch, ci) => {
            ch.lessons.forEach((l, li) => {
                const t = l.type || 'video';
                if (s[t]) {
                    s[t].total++;
                    s[t].mins += l.durationMinutes || 0;
                    if (completedLessons[`${ci}-${li}`]) s[t].done++;
                }
            });
        });
        return s;
    }, [chapters, completedLessons]);

    const totalMinutes = chapters.reduce((a, ch) => a + ch.lessons.reduce((b, l) => b + (l.durationMinutes || 0), 0), 0);
    const completedMinutes = useMemo(() => {
        let m = 0;
        chapters.forEach((ch, ci) => ch.lessons.forEach((l, li) => {
            if (completedLessons[`${ci}-${li}`]) m += l.durationMinutes || 0;
        }));
        return m;
    }, [chapters, completedLessons]);
    const remainingMinutes = totalMinutes - completedMinutes;

    const chapterProgress = useMemo(() => {
        return chapters.map((ch, ci) => {
            const done = ch.lessons.filter((_, li) => completedLessons[`${ci}-${li}`]).length;
            return {
                title: ch.title,
                done,
                total: ch.lessons.length,
                percent: ch.lessons.length > 0 ? Math.round((done / ch.lessons.length) * 100) : 0,
                lessons: ch.lessons.map((l, li) => ({
                    ...l,
                    completed: !!completedLessons[`${ci}-${li}`],
                })),
            };
        });
    }, [chapters, completedLessons]);

    // Mock data for richer analytics
    const weeklyStudyData = [
        { day: 'T2', minutes: 45 }, { day: 'T3', minutes: 30 }, { day: 'T4', minutes: 65 },
        { day: 'T5', minutes: 20 }, { day: 'T6', minutes: 50 }, { day: 'T7', minutes: 80 },
        { day: 'CN', minutes: 35 },
    ];
    const maxWeekly = Math.max(...weeklyStudyData.map(d => d.minutes));

    const mockScores = [
        { label: 'Bài tập 1', score: 75, type: 'quiz' },
        { label: 'KT Chương 1', score: 82, type: 'test' },
        { label: 'Bài tập 2', score: 68, type: 'quiz' },
        { label: 'KT Chương 2', score: 90, type: 'test' },
        { label: 'Bài tập 3', score: 85, type: 'quiz' },
        { label: 'KT Chương 3', score: 95, type: 'test' },
    ];
    const avgScore = Math.round(mockScores.reduce((a, s) => a + s.score, 0) / mockScores.length);

    const circumference = 2 * Math.PI * 52;

    return (
        <motion.div
            className="max-w-5xl mx-auto px-6 py-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* ─── Hero Section ───────────────────────────────── */}
            <motion.div variants={itemVariants} className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${courseGradient}`} />
                <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Circular progress */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="7" fill="none" className="text-base-200" />
                            <motion.circle
                                cx="64" cy="64" r="52" stroke="url(#heroGrad)" strokeWidth="7"
                                fill="none" strokeDasharray={circumference} strokeLinecap="round"
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference * (1 - overallPercent / 100) }}
                                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                            />
                            <defs>
                                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-base-content">{overallPercent}%</span>
                            <span className="text-[10px] text-base-content/40 font-bold">Hoàn thành</span>
                        </div>
                    </div>

                    {/* Course info */}
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="text-2xl">{courseIcon}</span>
                            <h2 className="text-xl font-black text-base-content">{courseTitle}</h2>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                            <img src={expertAvatar || 'https://i.pravatar.cc/150?img=12'} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-sm text-base-content/50 font-medium">{expertName}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                            <HeroStat icon={BookOpen} value={`${totalCompleted}/${totalLessons}`} label="bài học" />
                            <HeroStat icon={Clock} value={`${Math.floor(completedMinutes / 60)}h ${completedMinutes % 60}p`} label="đã học" />
                            <HeroStat icon={Target} value={`${avgScore}%`} label="điểm TB" />
                            <HeroStat icon={Flame} value={`~${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}p`} label="còn lại" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Stats Cards Row ────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard variants={itemVariants} icon={Play} label="Video" done={typeStats.video.done} total={typeStats.video.total} color="blue" gradient={courseGradient} />
                <StatCard variants={itemVariants} icon={FileText} label="Tài liệu" done={typeStats.document.done} total={typeStats.document.total} color="emerald" gradient={courseGradient} />
                <StatCard variants={itemVariants} icon={Sparkles} label="Flashcards" done={typeStats.flashcard.done} total={typeStats.flashcard.total} color="amber" gradient={courseGradient} />
                <StatCard variants={itemVariants} icon={CheckCircle2} label="Bài kiểm tra" done={typeStats.quiz.done} total={typeStats.quiz.total} color="violet" gradient={courseGradient} />
            </div>

            {/* ─── Two Column Layout ─────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Left: Charts */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Weekly study time */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-base-content">Thời gian học tuần này</h3>
                            <span className="text-[11px] font-bold text-base-content/40">
                                Tổng: {weeklyStudyData.reduce((a, d) => a + d.minutes, 0)} phút
                            </span>
                        </div>
                        <div className="flex items-end gap-2" style={{ height: 144 }}>
                            {weeklyStudyData.map((d, i) => {
                                const barH = Math.max(6, Math.round((d.minutes / maxWeekly) * 128));
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                                        <span className="text-[9px] font-bold text-base-content/50">{d.minutes}p</span>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: barH }}
                                            transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                                            className={`w-full rounded-lg bg-gradient-to-t ${courseGradient} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                            title={`${d.day}: ${d.minutes} phút`}
                                        />
                                        <span className="text-[9px] font-bold text-base-content/40">{d.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Score history */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-base-content">Lịch sử điểm số</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-600">TB: {avgScore}%</span>
                                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-[10px] font-bold text-green-600">
                                    Cao nhất: {Math.max(...mockScores.map(s => s.score))}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end gap-3" style={{ height: 160 }}>
                            {mockScores.map((s, i) => {
                                const isTest = s.type === 'test';
                                const barH = Math.max(6, Math.round((s.score / 100) * 130));
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-base-content text-base-100 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap z-10">
                                            {s.label}: {s.score}%
                                        </div>
                                        <span className="text-[9px] font-bold text-base-content/50">{s.score}%</span>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: barH }}
                                            transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                                            className={`w-full rounded-lg ${isTest ? `bg-gradient-to-t ${courseGradient}` : 'bg-base-content/15'} hover:opacity-100 opacity-85 transition-opacity cursor-pointer`}
                                        />
                                        <span className="text-[8px] font-bold text-base-content/30 truncate max-w-full">{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-base-200">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded bg-gradient-to-r ${courseGradient}`} />
                                <span className="text-[10px] text-base-content/50 font-bold">Bài kiểm tra</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-base-content/12" />
                                <span className="text-[10px] text-base-content/50 font-bold">Bài tập</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chapter breakdown */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <h3 className="text-sm font-black text-base-content mb-4">Tiến độ theo chương</h3>
                        <div className="space-y-2">
                            {chapterProgress.map((ch, i) => (
                                <ChapterRow key={i} chapter={ch} index={i} gradient={courseGradient} />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right: Sidebar insights */}
                <div className="xl:col-span-2 space-y-6">
                    {/* AI insights */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-4 h-4 text-violet-500" />
                            <h3 className="text-sm font-black text-base-content">Phân tích AI</h3>
                            <span className="ml-auto badge badge-xs badge-warning font-bold">Premium</span>
                        </div>
                        <div className="space-y-3">
                            <InsightItem emoji="💪" title="Điểm mạnh" text="Bạn nắm chắc các chương đầu, tỉ lệ chính xác cao ở bài kiểm tra." color="green" />
                            <InsightItem emoji="⚠️" title="Cần cải thiện" text="Các bài Flashcard chưa được ôn tập. Nên ôn lại để nhớ lâu hơn." color="red" />
                            <InsightItem emoji="💡" title="Gợi ý" text={`Với tốc độ hiện tại, bạn sẽ hoàn thành môn này trong khoảng ${Math.ceil(remainingMinutes / 45)} buổi học nữa.`} color="blue" />
                            <InsightItem emoji="🎯" title="Mục tiêu" text={`Điểm TB hiện tại: ${avgScore}%. Cố gắng đạt 85%+ để đạt loại Giỏi.`} color="violet" />
                        </div>
                    </motion.div>

                    {/* Achievements / milestones */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-black text-base-content">Thành tựu</h3>
                        </div>
                        <div className="space-y-2.5">
                            <AchievementItem icon="🔥" label="Streak 5 ngày" unlocked />
                            <AchievementItem icon="📖" label="Hoàn thành chương đầu tiên" unlocked />
                            <AchievementItem icon="🎯" label={`Đạt ${avgScore >= 80 ? '80%' : '70%'}+ điểm TB`} unlocked={avgScore >= 70} />
                            <AchievementItem icon="⚡" label="Học liên tục 7 ngày" unlocked={false} />
                            <AchievementItem icon="🏆" label="Hoàn thành toàn bộ môn học" unlocked={overallPercent === 100} />
                        </div>
                    </motion.div>

                    {/* Study time by type */}
                    <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-black text-base-content">Thời gian theo loại</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Video bài giảng', mins: typeStats.video.mins, color: 'blue', icon: Play },
                                { label: 'Tài liệu', mins: typeStats.document.mins, color: 'emerald', icon: FileText },
                                { label: 'Flashcards', mins: typeStats.flashcard.mins, color: 'amber', icon: Sparkles },
                                { label: 'Bài kiểm tra', mins: typeStats.quiz.mins, color: 'violet', icon: CheckCircle2 },
                            ].map((item, i) => {
                                const maxMins = Math.max(typeStats.video.mins, typeStats.document.mins, typeStats.flashcard.mins, typeStats.quiz.mins, 1);
                                const barPercent = (item.mins / maxMins) * 100;
                                const ItemIcon = item.icon;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-[11px] mb-1">
                                            <span className="flex items-center gap-1.5 text-base-content/60 font-medium">
                                                <ItemIcon className={`w-3 h-3 text-${item.color}-500`} />
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-base-content">{item.mins}p</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${barPercent}%` }}
                                                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                                                className={`h-full rounded-full bg-${item.color}-500`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Motivation card */}
                    <motion.div variants={itemVariants}>
                        <div className={`p-5 rounded-2xl bg-gradient-to-br ${courseGradient} text-white shadow-md`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-black">
                                    {overallPercent >= 80 ? 'Sắp hoàn thành!' : overallPercent >= 50 ? 'Nửa chặng đường!' : 'Tiếp tục nào!'}
                                </span>
                            </div>
                            <p className="text-[12px] opacity-85 leading-relaxed">
                                {overallPercent >= 80
                                    ? `Chỉ còn ${totalLessons - totalCompleted} bài nữa thôi. Bạn sắp chinh phục xong môn này rồi! 🎉`
                                    : overallPercent >= 50
                                        ? `Đã hoàn thành ${totalCompleted} bài. Cố gắng thêm một chút nữa để vượt qua mốc 80%! 💪`
                                        : `Mỗi ngày tiến bộ một chút, bạn sẽ sớm nắm vững kiến thức. Bạn đang làm rất tốt! 🌱`}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Sub-components ──────────────────────────────────────

function HeroStat({ icon: Icon, value, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-base-content/30" />
            <span className="text-sm font-black text-base-content">{value}</span>
            <span className="text-xs text-base-content/40 font-medium">{label}</span>
        </div>
    );
}

function StatCard({ variants, icon: Icon, label, done, total, color, gradient }) {
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <motion.div variants={variants} className="bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 text-${color}-500`} />
                </div>
                <span className="text-[11px] font-bold text-base-content/50">{label}</span>
            </div>
            <p className="text-xl font-black text-base-content mb-1">{done}/{total}</p>
            <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                />
            </div>
        </motion.div>
    );
}

function ChapterRow({ chapter, index, gradient }) {
    const [expanded, setExpanded] = useState(false);
    const isComplete = chapter.percent === 100;

    return (
        <div className="bg-base-200/30 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 p-3 hover:bg-base-200/50 transition-colors text-left"
            >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0
                    ${isComplete ? 'bg-green-500/10 text-green-600' : `bg-gradient-to-br ${gradient} text-white shadow-sm`}`}>
                    {isComplete ? <CircleCheck className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-base-content truncate">{chapter.title}</p>
                    <p className="text-[10px] text-base-content/40 font-medium">{chapter.done}/{chapter.total} bài</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-14 h-1.5 rounded-full bg-base-200 overflow-hidden hidden sm:block">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${chapter.percent}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-base-content/50 w-7 text-right">{chapter.percent}%</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-base-content/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <motion.div
                initial={false}
                animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="px-3 pb-3 space-y-1">
                    {chapter.lessons.map((l, li) => {
                        const typeIcons = { video: Play, document: FileText, flashcard: Sparkles, quiz: CheckCircle2 };
                        const TIcon = typeIcons[l.type] || Play;
                        return (
                            <div key={li} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                                {l.completed
                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    : <Circle className="w-3.5 h-3.5 text-base-content/20 flex-shrink-0" />
                                }
                                <TIcon className={`w-3 h-3 ${l.completed ? 'text-base-content/30' : 'text-base-content/40'} flex-shrink-0`} />
                                <span className={`text-[11px] truncate ${l.completed ? 'text-base-content/40 line-through' : 'text-base-content/70 font-medium'}`}>
                                    {l.title}
                                </span>
                                {l.durationMinutes && (
                                    <span className="ml-auto text-[9px] text-base-content/30 font-medium flex-shrink-0">{l.durationMinutes}p</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

function InsightItem({ emoji, title, text, color }) {
    return (
        <div className={`p-3 rounded-xl bg-${color}-500/5 border border-${color}-500/10`}>
            <p className={`text-[11px] font-bold text-${color}-600 mb-0.5`}>{emoji} {title}</p>
            <p className="text-[11px] text-base-content/60 leading-relaxed">{text}</p>
        </div>
    );
}

function AchievementItem({ icon, label, unlocked }) {
    return (
        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${unlocked ? 'bg-amber-500/5' : 'bg-base-200/30 opacity-50'}`}>
            <span className={`text-lg ${unlocked ? '' : 'grayscale'}`}>{icon}</span>
            <span className={`text-xs font-semibold flex-1 ${unlocked ? 'text-base-content' : 'text-base-content/40'}`}>{label}</span>
            {unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
        </div>
    );
}
