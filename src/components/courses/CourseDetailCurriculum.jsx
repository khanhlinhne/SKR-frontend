import { useState } from 'react';
import * as motion from 'motion/react-client';
import {
    ChevronDown,
    Play,
    FileText,
    Lock,
    CheckCircle2,
    Clock,
    Sparkles,
    Eye
} from 'lucide-react';

/**
 * CourseDetailCurriculum - Accordion for chapters & lessons
 * Maps to: mst_chapters, mst_lessons, cnt_videos, cnt_documents
 *
 * @param {Array}  chapters  - Array of chapter objects with lessons
 * @param {boolean} isPurchased - Whether user has purchased the course
 * @param {object}  variants  - Animation variants
 */
export default function CourseDetailCurriculum({ chapters = [], isPurchased = false, variants }) {
    const [expandedChapter, setExpandedChapter] = useState(0); // first chapter open

    const toggleChapter = (idx) => {
        setExpandedChapter(expandedChapter === idx ? -1 : idx);
    };

    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const totalDuration = chapters.reduce((a, ch) =>
        a + ch.lessons.reduce((b, l) => b + (l.durationMinutes || 0), 0), 0
    );

    return (
        <motion.div variants={variants} className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-base-content">
                    Nội dung chương trình
                </h3>
                <span className="text-xs text-base-content/50 font-bold">
                    {chapters.length} chương · {totalLessons} bài · {Math.round(totalDuration / 60)} giờ
                </span>
            </div>

            {/* Chapters accordion */}
            <div className="space-y-2">
                {chapters.map((chapter, chIdx) => {
                    const isExpanded = expandedChapter === chIdx;
                    const chapterDuration = chapter.lessons.reduce((a, l) => a + (l.durationMinutes || 0), 0);

                    return (
                        <div
                            key={chIdx}
                            className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm"
                        >
                            {/* Chapter header */}
                            <button
                                onClick={() => toggleChapter(chIdx)}
                                className="w-full flex items-center gap-3 p-4 text-left hover:bg-base-200/50 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${chapter.gradient || 'from-blue-500 to-violet-500'} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow`}>
                                    {chIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-base-content truncate">
                                        {chapter.title}
                                    </h4>
                                    <p className="text-[11px] text-base-content/50 font-medium">
                                        {chapter.lessons.length} bài · {chapterDuration} phút
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-base-content/40 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Lessons list */}
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isExpanded ? 'auto' : 0,
                                    opacity: isExpanded ? 1 : 0,
                                }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-3 space-y-1">
                                    {chapter.lessons.map((lesson, lIdx) => (
                                        <LessonRow
                                            key={lIdx}
                                            lesson={lesson}
                                            index={lIdx}
                                            isPurchased={isPurchased}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function LessonRow({ lesson, index, isPurchased }) {
    const isPreview = lesson.isPreview;
    const canAccess = isPurchased || isPreview;

    const typeIcons = {
        video: Play,
        document: FileText,
        flashcard: Sparkles,
        quiz: CheckCircle2,
    };
    const TypeIcon = typeIcons[lesson.type] || Play;

    const typeColors = {
        video: 'text-blue-500 bg-blue-500/10',
        document: 'text-emerald-500 bg-emerald-500/10',
        flashcard: 'text-amber-500 bg-amber-500/10',
        quiz: 'text-violet-500 bg-violet-500/10',
    };
    const typeColor = typeColors[lesson.type] || 'text-blue-500 bg-blue-500/10';

    return (
        <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${canAccess
                ? 'hover:bg-base-200/70 cursor-pointer'
                : 'opacity-60'
                }`}
        >
            {/* Icon */}
            <div className={`w-7 h-7 rounded-lg ${typeColor.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                <TypeIcon className={`w-3.5 h-3.5 ${typeColor.split(' ')[0]}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-base-content truncate">
                    {lesson.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-base-content/40">
                    {lesson.durationMinutes && (
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {lesson.durationMinutes} phút
                        </span>
                    )}
                    <span className="capitalize">{lesson.type === 'video' ? 'Video' : lesson.type === 'document' ? 'Tài liệu' : lesson.type === 'flashcard' ? 'Flashcard' : 'Bài kiểm tra'}</span>
                </div>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
                {isPreview ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        <Eye className="w-2.5 h-2.5" /> Preview
                    </span>
                ) : !isPurchased ? (
                    <Lock className="w-3.5 h-3.5 text-base-content/30" />
                ) : null}
            </div>
        </div>
    );
}
