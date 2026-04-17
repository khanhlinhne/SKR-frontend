import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
    LearnSidebar,
    LearnAssignmentFlow,
    LearnVideoPlayer,
    LearnLessonContent,
    LearnHeader,
    LearnProgressView,
    LearnQuizFlow,
} from '@/features/learn/components';
import { FlashcardStudyCard, StudyControls, StudyHeader, KeyboardHints } from '@/features/flashcards/components';
import { assignmentApi, courseApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';

const VALID_LESSON_TYPES = new Set(['video', 'document', 'flashcard', 'quiz', 'assignment']);

function toNonNegativeCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
}

function resolveLessonTimeLimitMinutes(lesson = {}) {
    const parsed = Number(
        lesson?.timeLimitMinutes
        ?? lesson?.estimatedDurationMinutes
        ?? lesson?.durationMinutes
        ?? 0
    );
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed);
}

function resolveLessonType(lesson = {}) {
    const explicitType =
        typeof lesson.lessonType === 'string'
            ? lesson.lessonType.trim().toLowerCase()
            : typeof lesson.type === 'string'
                ? lesson.type.trim().toLowerCase()
                : '';

    const totalFlashcardSets = toNonNegativeCount(lesson.totalFlashcardSets ?? lesson.flashcardSets?.length);
    const totalVideos = toNonNegativeCount(lesson.totalVideos ?? lesson.videos?.length);
    const totalDocuments = toNonNegativeCount(lesson.totalDocuments ?? lesson.documents?.length);
    const totalQuestions = toNonNegativeCount(lesson.totalQuestions ?? lesson.questions?.length);

    // Flashcard lessons should stay in flashcard mode even when no video exists.
    if (totalFlashcardSets > 0 && totalVideos === 0 && totalDocuments === 0 && totalQuestions === 0) return 'flashcard';
    if (lesson?.assignment?.assignmentId || lesson?.assignment?.title || lesson?.hasAssignment) return 'assignment';
    if (VALID_LESSON_TYPES.has(explicitType) && explicitType !== 'video') {
        return explicitType;
    }
    if (totalVideos > 0) return 'video';
    if (totalDocuments > 0) return 'document';
    if (totalQuestions > 0) return 'quiz';
    if (totalFlashcardSets > 0) return 'flashcard';
    if (explicitType === 'video') return 'video';

    return 'video';
}

function normalizeLessonFlashcardItems(lesson) {
    const sets = Array.isArray(lesson?.flashcardSets) ? lesson.flashcardSets : [];
    const items = sets.flatMap((set) => {
        const setId = set?.flashcardSetId || set?.id || '';
        const setTitle = set?.setTitle || set?.title || 'Flashcard';
        const cards = Array.isArray(set?.items) ? set.items : [];

        return cards.map((item, index) => ({
            id: item.flashcardItemId || item.id || `${setId}-${index}`,
            setId,
            setTitle,
            front: item.frontText || '',
            back: item.backText || '',
            frontImageUrl: item.frontImageUrl || '',
            backImageUrl: item.backImageUrl || '',
            difficulty: item.difficulty || 'medium',
        }));
    });

    return items.filter((item) => item.front || item.back);
}

function buildLessonKey(chapterId, lessonId) {
    if (!chapterId || !lessonId) return '';
    return `${chapterId}:${lessonId}`;
}

function getLessonLoadingCopy(lesson = {}) {
    const lessonTitle = typeof lesson?.title === 'string' && lesson.title.trim()
        ? lesson.title.trim()
        : 'bài học này';

    switch (resolveLessonType(lesson)) {
        case 'flashcard':
            return {
                message: `Đang mở flashcard "${lessonTitle}"...`,
                subMessage: 'Cú đang xếp bộ thẻ, vị trí thẻ hiện tại và nhịp ôn tập để bạn tiếp tục không bị lệch mạch.',
            };
        case 'document':
            return {
                message: `Đang mở tài liệu "${lessonTitle}"...`,
                subMessage: 'Cú đang đồng bộ tài liệu, mô tả bài học và ghi chú liên quan trước khi hiển thị nội dung mới.',
            };
        case 'quiz':
            return {
                message: `Đang mở bài luyện tập "${lessonTitle}"...`,
                subMessage: 'Cú đang chuẩn bị câu hỏi, đáp án và tiến độ ôn tập để bạn chuyển bài mượt hơn.',
            };
        case 'assignment':
            return {
                message: `Dang mo assignment "${lessonTitle}"...`,
                subMessage: 'SKR dang dong bo de bai, rubric va bai nop gan nhat de ban tiep tuc lam bai.',
            };
        case 'video':
            return {
                message: `Đang mở bài giảng "${lessonTitle}"...`,
                subMessage: 'Cú đang đồng bộ video, tài liệu đính kèm và tiến độ hiện tại để mở đúng bài học bạn vừa chọn.',
            };
        default:
            return {
                message: `Đang mở "${lessonTitle}"...`,
                subMessage: 'Cú đang cập nhật nội dung bài học mới để giao diện và dữ liệu hiển thị đồng bộ.',
            };
    }
}

function LessonTransitionState({ lesson, gradient = 'from-blue-500 to-violet-500' }) {
    const { message, subMessage } = getLessonLoadingCopy(lesson);

    return (
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
            <OwlLoader
                message={message}
                subMessage={subMessage}
                className="min-h-[calc(100vh-16rem)] px-6 py-10"
            />
        </div>
    );
}

function FlashcardLessonPlayer({ lesson, loadingContent = false }) {
    const cards = useMemo(() => normalizeLessonFlashcardItems(lesson), [lesson]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

    useEffect(() => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setStats({ correct: 0, incorrect: 0 });
    }, [lesson?.lessonId]);

    const currentCard = cards[currentCardIndex] || null;
    const progress = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

    const handleFlip = () => {
        if (!currentCard) return;
        setIsFlipped((prev) => !prev);
    };

    const handleMove = (direction) => {
        if (cards.length === 0) return;
        setCurrentCardIndex((prev) => {
            const nextIndex = direction === 'prev'
                ? (prev - 1 + cards.length) % cards.length
                : (prev + 1) % cards.length;
            return nextIndex;
        });
        setIsFlipped(false);
    };

    const handleReview = (result) => {
        if (result === 'correct') {
            setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
        }
        if (result === 'incorrect') {
            setStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }
        handleMove('next');
    };

    if (loadingContent) {
        return (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-10 shadow-xl">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-xl">
                <p className="text-lg font-black text-base-content">Bài học flashcard này chưa có thẻ</p>
                <p className="mt-2 text-sm text-base-content/50">Giảng viên cần thêm mặt trước và mặt sau để người học bắt đầu ôn tập.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-11rem)] overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <StudyHeader
                deckName={currentCard.setTitle || lesson?.title || 'Flashcard'}
                currentIndex={currentCardIndex}
                totalCards={cards.length}
                stats={stats}
                progress={progress}
                onClose={() => {}}
            />
            <div className="flex min-h-[calc(100vh-16rem)] flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-8 sm:px-6 lg:px-10">
                <FlashcardStudyCard
                    card={currentCard}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    cardHeightClass="h-[28rem] sm:h-[32rem] lg:h-[36rem]"
                />
                <StudyControls
                    onPrev={() => handleMove('prev')}
                    onNext={handleReview}
                    onSkip={() => handleMove('next')}
                    canGoPrev={cards.length > 1}
                    canGoNext={cards.length > 1}
                />
                <KeyboardHints />
            </div>
        </div>
    );
}

// ─── Learn Page ─────────────────────────────────────────

export default function Learn() {
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lessonContent, setLessonContent] = useState(null);
    const [lessonContentKey, setLessonContentKey] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);

    // Active lesson state
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeLesson, setActiveLesson] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewMode, setViewMode] = useState('learn'); // 'learn' | 'progress'
    const [completedLessons, setCompletedLessons] = useState({});
    const [quizView, setQuizView] = useState('detail');
    const [quizResult, setQuizResult] = useState(null);
    const [quizAttemptSeed, setQuizAttemptSeed] = useState(0);

    // Fetch course detail from API
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await courseApi.getById(id);
                const data = response.data;
                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Không thể tải dữ liệu khóa học.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    // Map chapters from API data
    const chapters = useMemo(() => {
        if (!course?.chapters) return [];
        return course.chapters
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((ch) => ({
                chapterId: ch.chapterId,
                title: ch.chapterName,
                description: ch.chapterDescription,
                estimatedDurationMinutes: ch.estimatedDurationMinutes,
                lessons: (ch.lessons || [])
                    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                    .map((l) => {
                        const localAssignment = assignmentApi.peekLessonAssignment(id, ch.chapterId, l.lessonId);
                        const hasAssignment = Boolean(l.hasAssignment)
                            || String(l.lessonType || '').trim().toLowerCase() === 'assignment'
                            || Boolean(localAssignment?.assignmentId || localAssignment?.title);

                        return {
                            lessonId: l.lessonId,
                            title: l.lessonName,
                            description: l.lessonDescription,
                            lessonType: l.lessonType,
                            type: resolveLessonType({
                                ...l,
                                hasAssignment,
                                assignment: localAssignment,
                            }),
                            durationMinutes: l.estimatedDurationMinutes || 0,
                            timeLimitMinutes: resolveLessonTimeLimitMinutes(l),
                            totalVideos: toNonNegativeCount(l.totalVideos),
                            totalDocuments: toNonNegativeCount(l.totalDocuments),
                            totalQuestions: toNonNegativeCount(l.totalQuestions),
                            totalFlashcardSets: toNonNegativeCount(l.totalFlashcardSets),
                            hasFlashcardSet: Boolean(l.hasFlashcardSet),
                            hasAssignment,
                            assignment: localAssignment || null,
                            isPreview: false,
                        };
                    }),
            }));
    }, [course, id]);

    // Expert info
    const expert = useMemo(() => {
        if (!course?.creator) return null;
        return {
            name: course.creator.displayName || course.creator.fullName,
            avatar: course.creator.avatarUrl,
        };
    }, [course]);

    // Course display info
    const courseDisplay = useMemo(() => {
        if (!course) return null;
        return {
            id: course.courseId,
            title: course.courseName,
            gradient: 'from-violet-500 to-purple-500',
            icon: '📚',
            totalChapters: course.totalChapters || chapters.length,
            totalLessons: course.totalLessons || 0,
        };
    }, [course, chapters]);

    // Derived data
    const currentChapter = chapters[activeChapter];
    const currentLesson = currentChapter?.lessons[activeLesson];
    const currentLessonKey = buildLessonKey(currentChapter?.chapterId, currentLesson?.lessonId);
    const currentLessonCompletionKey = `${activeChapter}-${activeLesson}`;

    // Fetch lesson content when active lesson changes
    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchLessonContent = async () => {
            if (!currentLessonKey || !id) {
                setLessonContent(null);
                setLessonContentKey('');
                setLoadingContent(false);
                return;
            }

            try {
                setLoadingContent(true);
                setLessonContent(null);
                setLessonContentKey('');
                const response = await courseApi.getLessonContent(
                    id,
                    currentChapter.chapterId,
                    currentLesson.lessonId,
                    { signal: controller.signal }
                );
                if (ignore) return;
                const content = response?.data || response || {};
                const assignment = resolveLessonType({
                    ...currentLesson,
                    ...content,
                }) === 'assignment'
                    ? await assignmentApi.getLessonAssignment(id, currentChapter.chapterId, currentLesson.lessonId)
                    : null;
                setLessonContent({
                    ...content,
                    assignment,
                });
                setLessonContentKey(currentLessonKey);
            } catch (err) {
                if (ignore || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
                    return;
                }
                console.error('Error fetching lesson content:', err);
                const assignment = resolveLessonType(currentLesson) === 'assignment'
                    ? await assignmentApi.getLessonAssignment(id, currentChapter.chapterId, currentLesson.lessonId)
                    : null;
                setLessonContent(assignment ? { assignment, lessonType: 'assignment' } : null);
                setLessonContentKey(currentLessonKey);
            } finally {
                if (!ignore) {
                    setLoadingContent(false);
                }
            }
        };

        fetchLessonContent();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, [currentChapter?.chapterId, currentLesson?.lessonId, currentLessonKey, id]);

    const syncedLessonContent = lessonContentKey === currentLessonKey
        ? lessonContent
        : null;

    const shouldShowLessonLoader = Boolean(currentLessonKey)
        && (loadingContent || lessonContentKey !== currentLessonKey);

    // Merge lesson content into current lesson for child components
    const enrichedLesson = useMemo(() => {
        if (!currentLesson) return null;
        const flashcardSets = syncedLessonContent?.flashcardSets || syncedLessonContent?.flashcards || [];
        const type = resolveLessonType({
            ...currentLesson,
            lessonType: syncedLessonContent?.lessonType ?? currentLesson.lessonType ?? currentLesson.type,
            totalVideos: syncedLessonContent?.videos?.length ?? currentLesson.totalVideos,
            totalDocuments: syncedLessonContent?.documents?.length ?? currentLesson.totalDocuments,
            totalQuestions: syncedLessonContent?.questions?.length ?? currentLesson.totalQuestions,
            totalFlashcardSets: flashcardSets.length || currentLesson.totalFlashcardSets,
            assignment: syncedLessonContent?.assignment || currentLesson.assignment,
        });

        return {
            ...currentLesson,
            lessonType: syncedLessonContent?.lessonType ?? currentLesson.lessonType ?? currentLesson.type,
            type,
            durationMinutes: resolveLessonTimeLimitMinutes({
                estimatedDurationMinutes: syncedLessonContent?.estimatedDurationMinutes,
                durationMinutes: currentLesson.durationMinutes,
            }),
            timeLimitMinutes: resolveLessonTimeLimitMinutes({
                ...currentLesson,
                ...syncedLessonContent,
            }),
            videos: syncedLessonContent?.videos || [],
            documents: syncedLessonContent?.documents || [],
            questions: syncedLessonContent?.questions || [],
            flashcardSets,
            assignment: syncedLessonContent?.assignment || currentLesson.assignment || null,
            description: syncedLessonContent?.lessonDescription || currentLesson.description,
        };
    }, [currentLesson, syncedLessonContent]);

    const isFlashcardLessonView = enrichedLesson?.type === 'flashcard';
    const isQuizLessonView = enrichedLesson?.type === 'quiz';
    const isAssignmentLessonView = enrichedLesson?.type === 'assignment';
    const isCurrentLessonCompleted = !!completedLessons[currentLessonCompletionKey];

    useEffect(() => {
        setQuizView('detail');
        setQuizResult(null);
        setQuizAttemptSeed(0);
    }, [currentLessonKey]);

    // Find next lesson
    const nextLesson = useMemo(() => {
        if (!currentChapter) return null;

        if (activeLesson < currentChapter.lessons.length - 1) {
            return currentChapter.lessons[activeLesson + 1];
        }
        if (activeChapter < chapters.length - 1) {
            return chapters[activeChapter + 1]?.lessons[0];
        }
        return null;
    }, [activeChapter, activeLesson, chapters, currentChapter]);

    // Overall progress
    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const completedCount = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    // Handlers
    const handleLessonSelect = useCallback((chIdx, lIdx) => {
        if (chIdx === activeChapter && lIdx === activeLesson) {
            return;
        }
        setActiveChapter(chIdx);
        setActiveLesson(lIdx);
        setIsPlaying(false);
    }, [activeChapter, activeLesson]);

    const handleTogglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleToggleComplete = useCallback(() => {
        const key = `${activeChapter}-${activeLesson}`;
        setCompletedLessons(prev => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: true };
        });
    }, [activeChapter, activeLesson]);

    const handleMarkComplete = useCallback(() => {
        const key = `${activeChapter}-${activeLesson}`;
        setCompletedLessons(prev => (prev[key] ? prev : { ...prev, [key]: true }));
    }, [activeChapter, activeLesson]);

    const handleQuizStart = useCallback(() => {
        if (!currentChapter?.chapterId || !currentLesson?.lessonId) return;
        const quizUrl = `/courses/${id}/learn/quiz/${currentChapter.chapterId}/${currentLesson.lessonId}?gradient=${encodeURIComponent(courseDisplay?.gradient || 'from-violet-500 to-purple-500')}`;
        window.open(quizUrl, '_blank');
    }, [id, currentChapter?.chapterId, currentLesson?.lessonId, courseDisplay?.gradient]);

    const handleQuizSubmit = useCallback((result) => {
        setQuizResult(result);
        setQuizView('results');
        if (!isCurrentLessonCompleted) {
            handleMarkComplete();
        }
    }, [handleMarkComplete, isCurrentLessonCompleted]);

    const handleQuizRetry = useCallback(() => {
        setQuizResult(null);
        setQuizAttemptSeed(prev => prev + 1);
        setQuizView('taking');
    }, []);

    const handleQuizShowReview = useCallback(() => {
        if (quizResult) {
            setQuizView('review');
        }
    }, [quizResult]);

    const handleQuizBackToResults = useCallback(() => {
        if (quizResult) {
            setQuizView('results');
        }
    }, [quizResult]);

    const handleQuizBackToDetail = useCallback(() => {
        setQuizView('detail');
    }, []);

    const handleNext = useCallback(() => {
        if (activeLesson < (currentChapter?.lessons.length || 0) - 1) {
            setActiveLesson(prev => prev + 1);
        } else if (activeChapter < chapters.length - 1) {
            setActiveChapter(prev => prev + 1);
            setActiveLesson(0);
        }
        setIsPlaying(false);
    }, [activeChapter, activeLesson, chapters.length, currentChapter?.lessons.length]);

    // Guard: loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <OwlLoader
                    message="Đang tải không gian học tập..."
                    subMessage="SKR đang ghép video, tài liệu và tiến độ của bạn để mở đúng bài học hiện tại."
                    className="py-8"
                />
            </div>
        );
    }

    // Guard: error or course not found
    if (error || !course) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <p className="text-6xl mb-4">😮</p>
                    <h2 className="text-xl font-black text-base-content mb-2">
                        {error || 'Không tìm thấy khóa học'}
                    </h2>
                    <p className="text-sm text-base-content/50 mb-4">
                        Khóa học này không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                        <ArrowLeft className="w-4 h-4" /> Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    // Guard: no chapters
    if (chapters.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <p className="text-6xl mb-4">📭</p>
                    <h2 className="text-xl font-black text-base-content mb-2">Chưa có nội dung</h2>
                    <p className="text-sm text-base-content/50 mb-4">
                        Khóa học &quot;{course.courseName}&quot; chưa có chương hoặc bài học nào.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                        <ArrowLeft className="w-4 h-4" /> Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Curriculum Sidebar */}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <LearnHeader
                    course={courseDisplay}
                    lessonTitle={viewMode === 'progress' ? 'Phân tích tiến độ' : (enrichedLesson?.title || '')}
                    progress={overallProgress}
                />

                {/* Scrollable content area */}
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
                                <LessonTransitionState
                                    lesson={currentLesson}
                                    gradient={courseDisplay.gradient}
                                />
                            ) : (
                                <>
                                    {/* Video Player */}
                                    {isFlashcardLessonView ? (
                                        <FlashcardLessonPlayer
                                            lesson={enrichedLesson}
                                            loadingContent={loadingContent}
                                        />
                                    ) : isAssignmentLessonView ? (
                                        <LearnAssignmentFlow
                                            courseId={id}
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
