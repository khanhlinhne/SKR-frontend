import { useState } from 'react';
import { motion } from 'motion/react';
import {
    ChevronDown,
    ChevronRight,
    PlayCircle,
    FileText,
    Clock,
    GripVertical,
} from 'lucide-react';
import { cardVariants } from './constants';

/**
 * ChapterList — Hiển thị danh sách các chương & bài học
 * Hỗ trợ expand/collapse từng chương
 */
export default function ChapterList({ chapters = [] }) {
    const [expanded, setExpanded] = useState({});

    const toggle = (chapterId) => {
        setExpanded((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
    };

    const toggleAll = () => {
        const allExpandedNow = chapters.every((ch) => expanded[ch.chapterId]);
        const newState = {};
        chapters.forEach((ch) => { newState[ch.chapterId] = !allExpandedNow; });
        setExpanded(newState);
    };

    return (
        <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content">
                    Nội dung khóa học
                    <span className="text-sm font-medium text-base-content/50 ml-2">
                        ({chapters.length} chương • {chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài)
                    </span>
                </h3>
                <button
                    onClick={toggleAll}
                    className="btn btn-ghost btn-xs font-bold text-emerald-600"
                >
                    {chapters.every((ch) => expanded[ch.chapterId]) ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </button>
            </div>

            {/* Chapters */}
            <div className="divide-y divide-base-200">
                {chapters.map((chapter) => {
                    const isOpen = expanded[chapter.chapterId] ?? false;
                    const totalMinutes = chapter.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 0), 0);

                    return (
                        <div key={chapter.chapterId}>
                            {/* Chapter header */}
                            <button
                                onClick={() => toggle(chapter.chapterId)}
                                className="w-full px-6 py-4 flex items-center gap-3 hover:bg-base-200/50 transition-colors text-left"
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-colors
                                    ${isOpen
                                        ? 'bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-lg'
                                        : 'bg-base-200 text-base-content/60'
                                    }`}>
                                    {chapter.chapterNumber}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-base-content truncate">
                                        {chapter.chapterName}
                                    </h4>
                                    <p className="text-xs text-base-content/50 mt-0.5">
                                        {chapter.lessons.length} bài học
                                        {totalMinutes > 0 && ` • ${Math.round(totalMinutes / 60 * 10) / 10}h`}
                                    </p>
                                </div>

                                <motion.div
                                    animate={{ rotate: isOpen ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight className="w-4 h-4 text-base-content/40" />
                                </motion.div>
                            </button>

                            {/* Lessons list */}
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isOpen ? 'auto' : 0,
                                    opacity: isOpen ? 1 : 0,
                                }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-3 space-y-1">
                                    {chapter.lessons.map((lesson) => (
                                        <div
                                            key={lesson.lessonId}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl 
                                                       hover:bg-base-200/70 transition-colors group cursor-pointer"
                                        >
                                            <span className="text-xs text-base-content/30 font-bold w-5 text-center">
                                                {lesson.lessonNumber}
                                            </span>
                                            <PlayCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <span className="text-sm text-base-content flex-1 truncate group-hover:text-emerald-600 transition-colors">
                                                {lesson.lessonName}
                                            </span>
                                            {lesson.estimatedMinutes > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-base-content/40">
                                                    <Clock className="w-3 h-3" />
                                                    {lesson.estimatedMinutes} phút
                                                </span>
                                            )}
                                        </div>
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


