import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import LessonRow from '@/features/expert/components/curriculum-detail/LessonRow';

export default function ChapterCard({
    chapter,
    chapterIndex,
    isExpanded,
    isLessonSelected,
    getResolvedLessonType,
    lessonState,
    actions,
}) {
    const chapterId = chapter.chapterId || chapter.id;
    const lessons = chapter.lessons || [];

    return (
        <motion.div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg">
            <div
                className={`flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors ${
                    isExpanded
                        ? 'border-b border-base-300 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5'
                        : 'hover:bg-base-200/50'
                }`}
                onClick={() => actions.onToggleChapter(chapterId)}
            >
                <div className="flex shrink-0 items-center gap-2">
                    <GripVertical className="h-4 w-4 cursor-grab text-base-content/30" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-black text-white shadow-md">
                        {chapterIndex + 1}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-base-content">{chapter.chapterName}</h3>
                    <div className="flex items-center gap-2">
                        {chapter.chapterCode && (
                            <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                                {chapter.chapterCode}
                            </span>
                        )}
                        <p className="text-xs text-base-content/50">{`${lessons.length} bai giang`}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => actions.onEditChapter(chapter)}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Chinh sua chuong"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => actions.onDeleteChapter(chapter)}
                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                        title="Xoa chuong"
                        disabled={lessonState.saving}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="ml-1">
                        {isExpanded
                            ? <ChevronDown className="h-5 w-5 text-base-content/40" />
                            : <ChevronRight className="h-5 w-5 text-base-content/40" />}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-1.5 px-5 py-3">
                            {lessons.length === 0 && (
                                <div className="py-6 text-center">
                                    <p className="text-sm font-medium text-base-content/40">Chua co bai giang nao</p>
                                    <p className="text-xs text-base-content/30">Nhan nut ben duoi de them bai giang dau tien</p>
                                    <p className="text-xs text-base-content/30">Ban co the bat dau bang video hoac flashcard cho chuong nay.</p>
                                </div>
                            )}

                            {lessons.map((lesson, lessonIndex) => {
                                const lessonId = lesson.lessonId || lesson.id;

                                return (
                                    <LessonRow
                                        key={lessonId}
                                        chapterId={chapterId}
                                        lesson={lesson}
                                        lessonIndex={lessonIndex}
                                        isSelected={isLessonSelected(chapterId, lessonId)}
                                        lessonState={lessonState}
                                        actions={actions}
                                        getResolvedLessonType={getResolvedLessonType}
                                    />
                                );
                            })}

                            <div className="px-0 pb-1 pt-2">
                                <button
                                    type="button"
                                    onClick={() => actions.onOpenAddLesson(chapterId)}
                                    className="btn btn-sm w-full rounded-xl border-2 border-dashed border-base-300 btn-ghost gap-1.5 font-bold text-violet-600 hover:border-violet-500/50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Them bai giang
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
