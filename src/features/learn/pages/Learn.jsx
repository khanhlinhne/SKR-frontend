import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    FlashcardLessonPlayer,
    LearnAssignmentFlow,
    LearnHeader,
    LearnLessonContent,
    LearnProgressView,
    LearnQuizFlow,
    LearnSidebar,
    LearnTransitionState,
    LearnVideoPlayer,
} from '@/features/learn/components';
import useLearnPageState from '@/features/learn/hooks/useLearnPageState';
import { OwlLoader } from '@/shared/ui/common';

export default function Learn() {
    const {
        courseId,
        course,
        loading,
        error,
        chapters,
        expert,
        courseDisplay,
        currentChapter,
        enrichedLesson,
        loadingContent,
        shouldShowLessonLoader,
        lessonLoadingCopy,
        isPlaying,
        viewMode,
        setViewMode,
        completedLessons,
        completionSaving,
        quizView,
        quizResult,
        quizAttemptSeed,
        nextLesson,
        overallProgress,
        isFlashcardLessonView,
        isQuizLessonView,
        isAssignmentLessonView,
        isCurrentLessonCompleted,
        activeChapter,
        activeLesson,
        handleLessonSelect,
        handleTogglePlay,
        handleToggleComplete,
        handleMarkComplete,
        handleQuizStart,
        handleQuizSubmit,
        handleQuizRetry,
        handleQuizShowReview,
        handleQuizBackToResults,
        handleQuizBackToDetail,
        handleNext,
    } = useLearnPageState();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-200">
                <OwlLoader
                    message="Đang tải không gian học tập..."
                    subMessage="SKR đang ghép video, tài liệu và tiến độ của bạn để mở đúng bài học hiện tại."
                    className="py-8"
                />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-200">
                <div className="text-center">
                    <p className="mb-4 text-6xl">😮</p>
                    <h2 className="mb-2 text-xl font-black text-base-content">
                        {error || 'Không tìm thấy khóa học'}
                    </h2>
                    <p className="mb-4 text-sm text-base-content/50">
                        Khóa học này không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg">
                        <ArrowLeft className="h-4 w-4" />
                        Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    if (chapters.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-200">
                <div className="text-center">
                    <p className="mb-4 text-6xl">📭</p>
                    <h2 className="mb-2 text-xl font-black text-base-content">Chưa có nội dung</h2>
                    <p className="mb-4 text-sm text-base-content/50">
                        Khóa học &quot;{course.courseName}&quot; chưa có chương hoặc bài học nào.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg">
                        <ArrowLeft className="h-4 w-4" />
                        Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <LearnSidebar
                chapters={chapters}
                activeChapter={activeChapter}
                activeLesson={activeLesson}
                completedLessons={completedLessons}
                onLessonSelect={handleLessonSelect}
                courseGradient={courseDisplay.gradient}
                courseIcon={courseDisplay.icon}
                courseTitle={courseDisplay.title}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <LearnHeader
                    course={courseDisplay}
                    lessonTitle={viewMode === 'progress' ? 'Phân tích tiến độ' : (enrichedLesson?.title || '')}
                    progress={overallProgress}
                />

                <main className="flex-1 overflow-y-auto">
                    {viewMode === 'progress' ? (
                        <LearnProgressView
                            chapters={chapters}
                            completedLessons={completedLessons}
                            courseGradient={courseDisplay.gradient}
                            courseTitle={courseDisplay.title}
                            courseIcon={courseDisplay.icon}
                            expertName={expert?.name}
                            expertAvatar={expert?.avatar}
                        />
                    ) : (
                        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
                            {shouldShowLessonLoader ? (
                                <LearnTransitionState
                                    gradient={courseDisplay.gradient}
                                    message={lessonLoadingCopy.message}
                                    subMessage={lessonLoadingCopy.subMessage}
                                />
                            ) : (
                                <>
                                    {isFlashcardLessonView ? (
                                        <FlashcardLessonPlayer
                                            key={enrichedLesson?.lessonId || 'flashcard-lesson'}
                                            lesson={enrichedLesson}
                                            onComplete={handleMarkComplete}
                                            isCompleted={isCurrentLessonCompleted}
                                            completionLoading={completionSaving}
                                            loadingContent={loadingContent}
                                        />
                                    ) : isAssignmentLessonView ? (
                                        <LearnAssignmentFlow
                                            courseId={courseId}
                                            courseTitle={courseDisplay.title}
                                            lesson={enrichedLesson}
                                            chapter={currentChapter}
                                            nextLesson={nextLesson}
                                            gradient={courseDisplay.gradient}
                                            onComplete={handleMarkComplete}
                                            onNext={handleNext}
                                            isCompleted={isCurrentLessonCompleted}
                                            loadingContent={loadingContent}
                                        />
                                    ) : isQuizLessonView ? (
                                        <LearnQuizFlow
                                            lesson={enrichedLesson}
                                            chapter={currentChapter}
                                            nextLesson={nextLesson}
                                            gradient={courseDisplay.gradient}
                                            mode={quizView}
                                            result={quizResult}
                                            attemptSeed={quizAttemptSeed}
                                            onStart={handleQuizStart}
                                            onSubmit={handleQuizSubmit}
                                            onRetry={handleQuizRetry}
                                            onShowReview={handleQuizShowReview}
                                            onBackToResults={handleQuizBackToResults}
                                            onBackToDetail={handleQuizBackToDetail}
                                            onNext={handleNext}
                                            isCompleted={isCurrentLessonCompleted}
                                            loadingContent={loadingContent}
                                        />
                                    ) : (
                                        <LearnVideoPlayer
                                            lesson={enrichedLesson}
                                            gradient={courseDisplay.gradient}
                                            isPlaying={isPlaying}
                                            onTogglePlay={handleTogglePlay}
                                            loadingContent={loadingContent}
                                        />
                                    )}

                                    {!isFlashcardLessonView && !isQuizLessonView && !isAssignmentLessonView && (
                                        <LearnLessonContent
                                            lesson={enrichedLesson}
                                            chapter={currentChapter}
                                            nextLesson={nextLesson}
                                            expertName={expert?.name}
                                            expertAvatar={expert?.avatar}
                                            gradient={courseDisplay.gradient}
                                            onNext={handleNext}
                                            onComplete={handleToggleComplete}
                                            isCompleted={isCurrentLessonCompleted}
                                            completionLoading={completionSaving}
                                            loadingContent={loadingContent}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
