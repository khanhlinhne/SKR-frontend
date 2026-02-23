import { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import {
    ChevronDown,
    Play,
    FileText,
    Sparkles,
    CheckCircle2,
    Clock,
    CircleCheck,
    BookOpen,
    TrendingUp,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

const LEARN_SIDEBAR_KEY = 'skr-learn-sidebar-collapsed';

/**
 * LearnSidebar - Collapsible sidebar with Curriculum & Progress tabs.
 * Apple-style clean design with PanelLeftClose/PanelLeftOpen toggle.
 */
export default function LearnSidebar({
    chapters = [],
    activeChapter = 0,
    activeLesson = 0,
    completedLessons = {},
    onLessonSelect,
    courseGradient = 'from-blue-500 to-violet-500',
    courseIcon = '📚',
    courseTitle = '',
    viewMode = 'learn',
    onViewModeChange,
}) {
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(LEARN_SIDEBAR_KEY) === 'true'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem(LEARN_SIDEBAR_KEY, collapsed); } catch { }
    }, [collapsed]);

    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const totalCompleted = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((totalCompleted / totalLessons) * 100)
        : 0;

    const handleTabClick = (mode) => {
        onViewModeChange?.(mode);
    };

    // ─── Collapsed View ──────────────────────────────────
    if (collapsed) {
        return (
            <motion.aside
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1, width: 64 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-base-100 border-r border-base-300 flex flex-col h-full flex-shrink-0 overflow-hidden"
            >
                {/* Course icon */}
                <div className="p-3 border-b border-base-300 flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseGradient} flex items-center justify-center text-lg shadow-md`}>
                        {courseIcon}
                    </div>
                </div>

                {/* Toggle button */}
                <div className="flex justify-center pt-3">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-200 transition-all"
                        title="Mở rộng sidebar"
                    >
                        <PanelLeftOpen className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab icons */}
                <div className="flex flex-col items-center gap-1 p-2 border-b border-base-300 mt-1">
                    <button
                        onClick={() => handleTabClick('learn')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative
                            ${viewMode === 'learn' ? 'bg-base-200 text-base-content' : 'text-base-content/40 hover:text-base-content hover:bg-base-200/50'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                            Chương trình
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabClick('progress')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative
                            ${viewMode === 'progress' ? 'bg-base-200 text-base-content' : 'text-base-content/40 hover:text-base-content hover:bg-base-200/50'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                            Tiến độ
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                        </div>
                    </button>
                </div>

                {/* Chapter numbers */}
                <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1 px-2">
                    {chapters.map((chapter, chIdx) => {
                        const chCompleted = chapter.lessons.every(
                            (_, lIdx) => completedLessons[`${chIdx}-${lIdx}`]
                        );
                        const isChActive = chIdx === activeChapter;

                        return (
                            <button
                                key={chIdx}
                                onClick={() => {
                                    if (viewMode !== 'learn') handleTabClick('learn');
                                    onLessonSelect?.(chIdx, 0);
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all group relative
                                    ${chCompleted
                                        ? 'bg-green-500/10 text-green-600'
                                        : isChActive
                                            ? `bg-gradient-to-br ${courseGradient} text-white shadow-sm`
                                            : 'bg-base-200/50 text-base-content/40 hover:bg-base-200 hover:text-base-content'
                                    }`}
                            >
                                {chCompleted ? <CircleCheck className="w-4 h-4" /> : chIdx + 1}
                                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-base-content text-base-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl max-w-[200px] truncate">
                                    {chapter.title}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-base-content" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Mini progress */}
                <div className="p-2 border-t border-base-300 flex flex-col items-center">
                    <div className="relative w-10 h-10">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-base-200" />
                            <circle
                                cx="20" cy="20" r="16" stroke="url(#miniGrad)" strokeWidth="3"
                                fill="none" strokeDasharray={2 * Math.PI * 16} strokeLinecap="round"
                                strokeDashoffset={2 * Math.PI * 16 * (1 - overallProgress / 100)}
                            />
                            <defs>
                                <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-base-content">
                            {overallProgress}%
                        </span>
                    </div>
                </div>
            </motion.aside>
        );
    }

    // ─── Expanded View ───────────────────────────────────
    return (
        <motion.aside
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: 340 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-r border-base-300 flex flex-col h-full flex-shrink-0 overflow-hidden"
        >
            {/* Course info header */}
            <div className="p-5 border-b border-base-300 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseGradient} flex items-center justify-center text-lg shadow-md flex-shrink-0`}>
                        {courseIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-base-content truncate">
                            {courseTitle}
                        </h3>
                        <p className="text-[11px] text-base-content/50 font-medium">
                            {totalCompleted}/{totalLessons} bài hoàn thành
                        </p>
                    </div>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-200 transition-all flex-shrink-0"
                        title="Thu gọn sidebar"
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex-1 h-1.5 rounded-full bg-base-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full rounded-full bg-gradient-to-r ${courseGradient}`}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-base-content/50">
                        {overallProgress}%
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex bg-base-200 rounded-xl p-0.5">
                    <TabButton
                        icon={BookOpen}
                        label="Chương trình"
                        active={viewMode === 'learn'}
                        onClick={() => handleTabClick('learn')}
                    />
                    <TabButton
                        icon={TrendingUp}
                        label="Tiến độ"
                        active={viewMode === 'progress'}
                        onClick={() => handleTabClick('progress')}
                    />
                </div>
            </div>

            {/* Curriculum */}
            <div className="flex-1 overflow-y-auto">
                <CurriculumPanel
                    chapters={chapters}
                    activeChapter={activeChapter}
                    activeLesson={activeLesson}
                    completedLessons={completedLessons}
                    onLessonSelect={(chIdx, lIdx) => {
                        if (viewMode !== 'learn') handleTabClick('learn');
                        onLessonSelect?.(chIdx, lIdx);
                    }}
                    courseGradient={courseGradient}
                />
            </div>
        </motion.aside>
    );
}

// ─── Tab Button ──────────────────────────────────────────

function TabButton({ icon: Icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-bold transition-all
                ${active
                    ? 'bg-base-100 text-base-content shadow-sm'
                    : 'text-base-content/40 hover:text-base-content/60'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════
// CURRICULUM PANEL
// ═══════════════════════════════════════════════════════════

function CurriculumPanel({
    chapters,
    activeChapter,
    activeLesson,
    completedLessons,
    onLessonSelect,
    courseGradient,
}) {
    const [expandedChapters, setExpandedChapters] = useState(
        () => new Set([activeChapter])
    );

    const toggleChapter = (idx) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    return (
        <div className="py-2">
            {chapters.map((chapter, chIdx) => {
                const isExpanded = expandedChapters.has(chIdx);
                const chapterCompleted = chapter.lessons.every(
                    (_, lIdx) => completedLessons[`${chIdx}-${lIdx}`]
                );
                const chapterLessonsCompleted = chapter.lessons.filter(
                    (_, lIdx) => completedLessons[`${chIdx}-${lIdx}`]
                ).length;

                return (
                    <div key={chIdx} className="px-2">
                        <button
                            onClick={() => toggleChapter(chIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors
                                ${isExpanded ? 'bg-base-200/60' : 'hover:bg-base-200/40'}`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0
                                ${chapterCompleted
                                    ? 'bg-green-500/10 text-green-600'
                                    : `bg-gradient-to-br ${courseGradient} text-white shadow-sm`
                                }`}
                            >
                                {chapterCompleted ? <CircleCheck className="w-4 h-4" /> : chIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-bold text-base-content truncate">
                                    {chapter.title}
                                </h4>
                                <p className="text-[10px] text-base-content/40 font-medium">
                                    {chapterLessonsCompleted}/{chapter.lessons.length} bài
                                </p>
                            </div>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-base-content/30 transition-transform duration-300 flex-shrink-0
                                    ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <motion.div
                            initial={false}
                            animate={{
                                height: isExpanded ? 'auto' : 0,
                                opacity: isExpanded ? 1 : 0,
                            }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="overflow-hidden"
                        >
                            <div className="pl-4 pr-2 pb-1 space-y-0.5">
                                {chapter.lessons.map((lesson, lIdx) => {
                                    const isActive = chIdx === activeChapter && lIdx === activeLesson;
                                    const isCompleted = completedLessons[`${chIdx}-${lIdx}`];
                                    return (
                                        <LessonItem
                                            key={lIdx}
                                            lesson={lesson}
                                            isActive={isActive}
                                            isCompleted={isCompleted}
                                            courseGradient={courseGradient}
                                            onClick={() => onLessonSelect?.(chIdx, lIdx)}
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Lesson Item ─────────────────────────────────────────

function LessonItem({ lesson, isActive, isCompleted, courseGradient, onClick }) {
    const typeIcons = { video: Play, document: FileText, flashcard: Sparkles, quiz: CheckCircle2 };
    const TypeIcon = typeIcons[lesson.type] || Play;
    const typeLabels = { video: 'Video', document: 'Tài liệu', flashcard: 'Flashcard', quiz: 'Bài kiểm tra' };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group
                ${isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20'
                    : 'hover:bg-base-200/50 border border-transparent'
                }`}
        >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${isCompleted ? 'bg-green-500/10'
                    : isActive ? `bg-gradient-to-br ${courseGradient} shadow-sm`
                        : 'bg-base-200'
                }`}
            >
                {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : isActive ? (
                    <TypeIcon className="w-3 h-3 text-white" />
                ) : (
                    <TypeIcon className="w-3 h-3 text-base-content/30" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-semibold truncate ${isActive ? 'text-blue-600' : 'text-base-content/80'}`}>
                    {lesson.title}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-base-content/40">
                    {lesson.durationMinutes && (
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {lesson.durationMinutes}p
                        </span>
                    )}
                    <span>·</span>
                    <span>{typeLabels[lesson.type] || 'Bài học'}</span>
                </div>
            </div>
            {isActive && (
                <motion.div
                    layoutId="active-lesson"
                    className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500 flex-shrink-0"
                />
            )}
        </button>
    );
}
