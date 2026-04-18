import { AnimatePresence } from 'motion/react';
import AddQuestionModal from '@/features/expert/components/AddQuestionModal';
import AssignmentBuilderModal from '@/features/expert/components/AssignmentBuilderModal';
import AddFlashcardCardModal from '@/features/expert/components/curriculum-detail/AddFlashcardCardModal';
import AddDocumentModal from '@/features/expert/components/curriculum-detail/AddDocumentModal';
import AddVideoModal from '@/features/expert/components/curriculum-detail/AddVideoModal';
import {
    AddChapterModal,
    AddLessonModal,
    EditChapterModal,
    EditLessonModal,
    EditQuestionModal,
} from '@/features/expert/components/curriculum-detail/CurriculumDetailModals';
import OwlConfirmDialog from '@/features/expert/components/curriculum-detail/OwlConfirmDialog';
import {
    CurriculumToast,
    DocumentPreviewModal,
    QuestionPreviewModal,
    VideoPreviewModal,
} from '@/features/expert/components/curriculum-detail/CurriculumDetailOverlays';

export default function CurriculumDetailModalLayer({
    overlays,
    feedback,
    saving,
    handleAddChapter,
    handleAddLesson,
    handleEditChapter,
    handleEditLesson,
    handleAddVideo,
    handleAddDocument,
    handleAddQuestion,
    handleEditQuestion,
    handleSaveAssignment,
    handleSaveFlashcardCard,
    chapterName,
    existingLessons,
    questionModalContextTitle,
}) {
    const {
        showAddChapter,
        setShowAddChapter,
        showAddLesson,
        setShowAddLesson,
        showEditChapter,
        setShowEditChapter,
        showEditLesson,
        setShowEditLesson,
        showAddVideo,
        setShowAddVideo,
        showAddDocument,
        setShowAddDocument,
        showAddQuestion,
        setShowAddQuestion,
        showEditQuestion,
        setShowEditQuestion,
        showAssignmentBuilder,
        setShowAssignmentBuilder,
        showAddFlashcardCard,
        setShowAddFlashcardCard,
        previewVideo,
        setPreviewVideo,
        previewDocument,
        setPreviewDocument,
        previewQuestion,
        setPreviewQuestion,
    } = overlays;
    const {
        toast,
        dismissToast,
        confirmDialog,
        resolveConfirmation,
        showToast,
    } = feedback;

    return (
        <>
            <AddChapterModal
                open={showAddChapter}
                onClose={() => setShowAddChapter(false)}
                onSubmit={handleAddChapter}
                loading={saving}
            />
            <AddLessonModal
                open={!!showAddLesson}
                onClose={() => setShowAddLesson(null)}
                onSubmit={handleAddLesson}
                loading={saving}
                chapterName={showAddLesson ? chapterName(showAddLesson) : ''}
                existingLessons={showAddLesson ? existingLessons(showAddLesson) : []}
                onValidationError={(validation) => {
                    if (!validation?.summary) return;
                    showToast({
                        title: 'Cần kiểm tra lại bài giảng mới',
                        message: validation.summary,
                    }, 'error');
                }}
            />
            {showEditChapter && (
                <EditChapterModal
                    open={true}
                    onClose={() => setShowEditChapter(null)}
                    onSubmit={handleEditChapter}
                    loading={saving}
                    initialValue={showEditChapter}
                    onValidationError={(validation) => {
                        if (!validation?.summary) return;
                        showToast({
                            title: 'Cần kiểm tra lại thông tin chương',
                            message: validation.summary,
                        }, 'error');
                    }}
                />
            )}
            {showEditLesson && (
                <EditLessonModal
                    open={true}
                    onClose={() => setShowEditLesson(null)}
                    onSubmit={handleEditLesson}
                    loading={saving}
                    chapterName={chapterName(showEditLesson.chapterId)}
                    existingLessons={existingLessons(showEditLesson.chapterId)}
                    currentLessonId={showEditLesson?.lesson?.lessonId || showEditLesson?.lesson?.id || null}
                    initialValue={showEditLesson?.lesson || null}
                    onValidationError={(validation) => {
                        if (!validation?.summary) return;
                        showToast({
                            title: 'Cần kiểm tra lại thông tin bài học',
                            message: validation.summary,
                        }, 'error');
                    }}
                />
            )}

            <AddFlashcardCardModal
                open={!!showAddFlashcardCard}
                onClose={() => setShowAddFlashcardCard(null)}
                onSubmit={handleSaveFlashcardCard}
                loading={saving}
                setTitle={showAddFlashcardCard?.setTitle || ''}
                nextOrder={showAddFlashcardCard?.nextOrder}
                mode={showAddFlashcardCard?.mode || 'create'}
                initialCards={showAddFlashcardCard?.initialCards || []}
            />

            <AddVideoModal
                open={!!showAddVideo}
                onClose={() => setShowAddVideo(null)}
                onSubmit={handleAddVideo}
                loading={saving}
            />
            <AddDocumentModal
                open={!!showAddDocument}
                onClose={() => setShowAddDocument(null)}
                onSubmit={handleAddDocument}
                loading={saving}
            />

            {showAddQuestion && (
                <AddQuestionModal
                    open={true}
                    onClose={() => setShowAddQuestion(null)}
                    onSubmit={handleAddQuestion}
                    loading={saving}
                    contextTitle={questionModalContextTitle}
                />
            )}

            {showEditQuestion && (
                <EditQuestionModal
                    open={true}
                    onClose={() => setShowEditQuestion(null)}
                    onSubmit={handleEditQuestion}
                    loading={saving}
                    initialValue={showEditQuestion.question}
                />
            )}

            {showAssignmentBuilder && (
                <AssignmentBuilderModal
                    open={true}
                    onClose={() => setShowAssignmentBuilder(null)}
                    onSave={handleSaveAssignment}
                    loading={saving}
                    contextTitle={showAssignmentBuilder.lessonName || 'Assignment lesson'}
                    initialValue={showAssignmentBuilder.initialValue}
                />
            )}

            <VideoPreviewModal previewVideo={previewVideo} onClose={() => setPreviewVideo(null)} />
            <DocumentPreviewModal previewDocument={previewDocument} onClose={() => setPreviewDocument(null)} />
            <QuestionPreviewModal previewQuestion={previewQuestion} onClose={() => setPreviewQuestion(null)} />

            <AnimatePresence>
                {confirmDialog && (
                    <OwlConfirmDialog
                        dialog={confirmDialog}
                        onCancel={() => resolveConfirmation(false)}
                        onConfirm={() => resolveConfirmation(true)}
                    />
                )}
            </AnimatePresence>

            <CurriculumToast
                toast={
                    toast
                        ? {
                            ...toast,
                            onClose: dismissToast,
                            cta: toast.type === 'error' ? 'Cần kiểm tra lại' : 'Đã cập nhật thành công',
                        }
                        : null
                }
            />
        </>
    );
}
