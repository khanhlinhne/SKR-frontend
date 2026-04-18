import { motion } from 'motion/react';
import { ChevronDown, GripVertical, Pencil, Trash2 } from 'lucide-react';
import LessonContentPanel from '@/features/expert/components/curriculum-detail/LessonContentPanel';
import {
    createFlashcardDraftFromItem,
    formatDurationMinutes,
    getFlashcardSetItems,
    getLessonDurationMinutes,
    getLessonFlashcardSets,
    lessonTypeConfig,
} from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';

export default function LessonRow({ 
    chapterId, 
    lesson, 
    lessonIndex, 
    isSelected, 
    lessonState, 
    actions, 
    getResolvedLessonType 
}) {
    const lessonId = lesson.lessonId || lesson.id;
    const resolvedLessonType = getResolvedLessonType(
        lesson,
        isSelected ? lessonState.lessonContent : null,
    );
    const lessonQuestions = isSelected ? (lessonState.lessonContent?.questions || []) : [];
    const lessonFlashcardSets = isSelected ? getLessonFlashcardSets(lessonState.lessonContent) : [];
    const lessonAssignment = isSelected ? (lessonState.lessonContent?.assignment || null) : null;
    const lessonQuizTimeLimitMinutes = getLessonDurationMinutes(
        isSelected ? { ...lesson, ...lessonState.lessonContent } : lesson,
    );
    const savedQuizTimeLimitDraft = lessonQuizTimeLimitMinutes > 0 ? String(lessonQuizTimeLimitMinutes) : '';
    const isQuizTimeLimitDirty = isSelected && lessonState.quizTimeLimitDraft !== savedQuizTimeLimitDraft;
    const lessonType = lessonTypeConfig[resolvedLessonType] || lessonTypeConfig.video;
    const LessonIcon = lessonType.icon;

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: lessonIndex * 0.05 }}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isSelected ? 'border border-violet-500/20 bg-violet-500/10' : 'hover:bg-base-200/50'}`}
                onClick={() => void actions.onToggleLessonContent(chapterId, lessonId, lesson)}
            >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-base-content/20 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${lessonType.color}`}>
                    <LessonIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-base-content">{lesson.lessonName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${lessonType.color}`}>{lessonType.label}</span>
                        {lesson.lessonCode && <span className="font-mono text-[10px] text-base-content/40">{lesson.lessonCode}</span>}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => actions.onEditLesson({ chapterId, lesson })}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Chỉnh sửa bài học"
                    >
                        <Pencil className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => actions.onDeleteLesson(chapterId, lesson)}
                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                        title="Xóa bài học"
                        disabled={lessonState.saving}
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
                <ChevronDown className={`h-4 w-4 text-base-content/30 transition-transform ${isSelected ? 'rotate-180 text-violet-500' : ''}`} />
            </motion.div>

            <LessonContentPanel
                open={isSelected}
                chapterId={chapterId}
                lessonId={lessonId}
                lesson={lesson}
                lessonContent={lessonState.lessonContent}
                loadingContent={lessonState.loadingContent}
                saving={lessonState.saving}
                resolvedLessonType={resolvedLessonType}
                lessonQuestions={lessonQuestions}
                lessonFlashcardSets={lessonFlashcardSets}
                lessonAssignment={lessonAssignment}
                lessonQuizTimeLimitMinutes={lessonQuizTimeLimitMinutes}
                quizTimeLimitDraft={lessonState.quizTimeLimitDraft}
                isQuizTimeLimitDirty={isQuizTimeLimitDirty}
                onQuizTimeLimitDraftChange={actions.onQuizTimeLimitDraftChange}
                onOpenAddVideo={actions.onOpenAddVideo}
                onPreviewVideo={actions.onPreviewVideo}
                onDeleteVideo={actions.onDeleteVideo}
                onOpenAddDocument={actions.onOpenAddDocument}
                onPreviewDocument={actions.onPreviewDocument}
                onDeleteDocument={actions.onDeleteDocument}
                onOpenAddQuestion={actions.onOpenAddQuestion}
                onOpenEditQuestion={actions.onOpenEditQuestion}
                onPreviewQuestion={actions.onPreviewQuestion}
                onDeleteQuestion={actions.onDeleteQuestion}
                onOpenAssignmentBuilder={actions.onOpenAssignmentBuilder}
                onSaveQuizTiming={actions.onSaveQuizTiming}
                onCreateFlashcardSet={actions.onCreateFlashcardSet}
                onOpenFlashcardCardModal={actions.onOpenFlashcardCardModal}
                onDeleteFlashcardItem={actions.onDeleteFlashcardItem}
                formatDurationMinutes={formatDurationMinutes}
                getFlashcardSetItems={getFlashcardSetItems}
                createFlashcardDraftFromItem={createFlashcardDraftFromItem}
            />
        </div>
    );
}