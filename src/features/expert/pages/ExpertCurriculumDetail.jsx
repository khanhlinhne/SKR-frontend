import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { ExpertLayout } from '@/features/expert/components';
import CurriculumChaptersList from '@/features/expert/components/curriculum-detail/CurriculumChaptersList';
import CurriculumDetailEmptyState from '@/features/expert/components/curriculum-detail/CurriculumDetailEmptyState';
import CurriculumDetailHeader from '@/features/expert/components/curriculum-detail/CurriculumDetailHeader';
import CurriculumDetailModalLayer from '@/features/expert/components/curriculum-detail/CurriculumDetailModalLayer';
import CurriculumDetailStatsBar from '@/features/expert/components/curriculum-detail/CurriculumDetailStatsBar';
import useCurriculumDetailFeedback from '@/features/expert/hooks/useCurriculumDetailFeedback';
import useCurriculumDetailOverlays from '@/features/expert/hooks/useCurriculumDetailOverlays';
import useCurriculumDetailPage from '@/features/expert/hooks/useCurriculumDetailPage';
import { OwlLoader } from '@/shared/ui/common';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ExpertCurriculumDetail() {
    const { courseId } = useParams();
    const feedback = useCurriculumDetailFeedback();
    const overlays = useCurriculumDetailOverlays();
    const {
        course,
        chapters,
        loading,
        error,
        saving,
        expandedChapters,
        totalLessons,
        chapterActions,
        lessonState,
        questionModalContextTitle,
        fetchCourseData,
        getChapterLessons,
        getChapterName,
        getResolvedLessonType,
        isLessonSelected,
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
    } = useCurriculumDetailPage({
        courseId,
        feedback,
        overlays,
    });

    if (loading) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <OwlLoader
                        message="Đang tải chi tiết chương trình..."
                        subMessage="SKR đang mở chương, bài học và tài nguyên hiện có của khóa học này."
                        className="py-8"
                    />
                </div>
            </ExpertLayout>
        );
    }

    if (error) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-black">{error}</h3>
                        <div className="flex justify-center gap-2">
                            <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl gap-1.5 font-bold">
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại
                            </Link>
                            <button
                                onClick={fetchCourseData}
                                className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 gap-1.5 font-bold text-white"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={cardVariants}>
                    <CurriculumDetailHeader
                        courseName={course?.courseName}
                        chapterCount={chapters.length}
                    />
                </motion.div>

                <motion.div variants={cardVariants}>
                    <CurriculumDetailStatsBar
                        chaptersCount={chapters.length}
                        totalLessons={totalLessons}
                        course={course}
                    />
                </motion.div>

                {chapters.length === 0 && (
                    <motion.div variants={cardVariants}>
                        <CurriculumDetailEmptyState
                            onAddChapter={() => overlays.setShowAddChapter(true)}
                        />
                    </motion.div>
                )}

                <CurriculumChaptersList
                    chapters={chapters}
                    expandedChapters={expandedChapters}
                    isLessonSelected={isLessonSelected}
                    getResolvedLessonType={getResolvedLessonType}
                    lessonState={lessonState}
                    chapterActions={chapterActions}
                    onAddChapter={() => overlays.setShowAddChapter(true)}
                    cardVariants={cardVariants}
                />
            </motion.div>

            <CurriculumDetailModalLayer
                overlays={overlays}
                feedback={feedback}
                saving={saving}
                handleAddChapter={handleAddChapter}
                handleAddLesson={handleAddLesson}
                handleEditChapter={handleEditChapter}
                handleEditLesson={handleEditLesson}
                handleAddVideo={handleAddVideo}
                handleAddDocument={handleAddDocument}
                handleAddQuestion={handleAddQuestion}
                handleEditQuestion={handleEditQuestion}
                handleSaveAssignment={handleSaveAssignment}
                handleSaveFlashcardCard={handleSaveFlashcardCard}
                chapterName={getChapterName}
                existingLessons={getChapterLessons}
                questionModalContextTitle={questionModalContextTitle}
            />
        </ExpertLayout>
    );
}
