import { motion } from 'motion/react';
import { FolderPlus } from 'lucide-react';
import ChapterCard from './ChapterCard';

export default function CurriculumChaptersList({
    chapters,
    expandedChapters,
    isLessonSelected,
    getResolvedLessonType,
    lessonState,
    chapterActions,
    onAddChapter,
    cardVariants,
}) {
    return (
        <>
            <div className="space-y-4">
                {chapters.map((chapter, chapterIndex) => {
                    const chapterId = chapter.chapterId || chapter.id;

                    return (
                        <motion.div key={chapterId} variants={cardVariants}>
                            <ChapterCard
                                chapter={chapter}
                                chapterIndex={chapterIndex}
                                isExpanded={expandedChapters.has(chapterId)}
                                isLessonSelected={isLessonSelected}
                                getResolvedLessonType={getResolvedLessonType}
                                lessonState={lessonState}
                                actions={chapterActions}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {chapters.length > 0 && (
                <motion.div variants={cardVariants} className="mt-4">
                    <button
                        onClick={onAddChapter}
                        className="btn btn-lg w-full rounded-2xl border-2 border-dashed border-violet-500/30 bg-base-100 gap-2 font-black text-violet-600 shadow-lg transition-all hover:border-violet-500 hover:bg-violet-500/5"
                    >
                        <FolderPlus className="h-5 w-5" />
                        Thêm chương mới
                    </button>
                </motion.div>
            )}
        </>
    );
}
