import { useState } from 'react';
import * as motion from 'motion/react-client';
import {
    ChevronDown,
    Play,
    FileText,
    Sparkles,
    CheckCircle2,
    Clock,
    Eye,
    Lock,
    CircleCheck
} from 'lucide-react';

/**
 * LearnSidebar - Collapsible curriculum sidebar
 * Shows chapters and lessons with progress tracking, Apple-style clean design.
 *
 * @param {Array}   chapters         - Array of chapter objects from course data
 * @param {number}  activeChapter    - Index of active chapter
 * @param {number}  activeLesson     - Index of active lesson in the active chapter
 * @param {object}  completedLessons - Map of `${chIdx}-${lIdx}` → true for completed lessons
 * @param {Function} onLessonSelect  - Callback(chapterIndex, lessonIndex)
 * @param {string}  courseGradient   - Gradient class for the course (e.g. 'from-amber-500 to-orange-500')
 * @param {string}  courseIcon       - Emoji icon for the course
 * @param {string}  courseTitle      - Course title
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

    // Calculate overall progress
    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const totalCompleted = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((totalCompleted / totalLessons) * 100)
        : 0;

    return (
        <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-80 xl:w-[340px] bg-base-100 border-r border-base-300 flex flex-col h-full flex-shrink-0"
        >
            {/* Course info header */}
            <div className="p-5 border-b border-base-300 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseGradient} flex items-center justify-center text-lg shadow-md`}>
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
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2.5">
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
            </div>

            {/* Chapters list */}
            <div className="flex-1 overflow-y-auto py-2">
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
                            {/* Chapter header */}
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
                                    {chapterCompleted
                                        ? <CircleCheck className="w-4 h-4" />
                                        : chIdx + 1
                                    }
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

                            {/* Lessons */}
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
                                        const isActive =
                                            chIdx === activeChapter && lIdx === activeLesson;
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
        </motion.aside>
    );
}

// ─── Lesson Item ─────────────────────────────────────────

function LessonItem({ lesson, isActive, isCompleted, courseGradient, onClick }) {
    const typeIcons = {
        video: Play,
        document: FileText,
        flashcard: Sparkles,
        quiz: CheckCircle2,
    };
    const TypeIcon = typeIcons[lesson.type] || Play;

    const typeLabels = {
        video: 'Video',
        document: 'Tài liệu',
        flashcard: 'Flashcard',
        quiz: 'Bài kiểm tra',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group
                ${isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20'
                    : 'hover:bg-base-200/50 border border-transparent'
                }`}
        >
            {/* Status indicator */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${isCompleted
                    ? 'bg-green-500/10'
                    : isActive
                        ? `bg-gradient-to-br ${courseGradient} shadow-sm`
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

            {/* Lesson info */}
            <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-semibold truncate
                    ${isActive ? 'text-blue-600' : 'text-base-content/80'}`}
                >
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

            {/* Active indicator */}
            {isActive && (
                <motion.div
                    layoutId="active-lesson"
                    className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500 flex-shrink-0"
                />
            )}
        </button>
    );
}
